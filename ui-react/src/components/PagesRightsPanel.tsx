/**
 * PagesRightsPanel — the "Pages" section of the user-rights editor (contributed by melis-cms).
 *
 * Shown only when the MelisCms module is active (modular: the host gates it). Lets you grant access
 * to ALL pages (the "Toutes les pages" root = <id>-1</id>) or to specific pages — checking a page
 * grants it AND its descendants (the backend resolves access via the page breadcrumb), so a child
 * under a checked ancestor is shown as inherited (checked, disabled).
 */

import { useEffect, useState } from 'react'
import { CheckSquare, ChevronRight, Loader2, MinusSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import { ALL_PAGES, PAGES_RIGHTS_ROOT, fetchPagesAncestors, fetchPagesRightNodes, type PageRightNode } from '@/lib/pages-rights-api'

type Tri = 'all' | 'some' | 'none'

function TriBox({ state, disabled, onChange }: { state: Tri; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(state !== 'all')}
      // [&_svg]:pointer-events-none : Firefox ne déclenche pas le button au clic sur l'intérieur vide
      // (fill:none) de l'icône SVG → clic qui traverse, toute la case cliquable (cf. RightsTreeView).
      className={cn('flex shrink-0 items-center justify-center rounded transition-colors focus:outline-none [&_svg]:pointer-events-none',
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80')}
    >
      {state === 'all' ? <CheckSquare className="size-[15px] text-primary" />
        : state === 'some' ? <MinusSquare className="size-[15px] text-primary/70" />
          : <Square className="size-[15px] text-muted-foreground/60" />}
    </button>
  )
}

/** One page row + its (lazy) children. `inherited` = an ancestor (or "all") already grants it. */
function PageNode({
  node, depth, checkedPages, ancestorSet, inherited, onToggle,
}: {
  node: PageRightNode
  depth: number
  checkedPages: Set<number>
  ancestorSet: Set<number>
  inherited: boolean
  onToggle: (pageId: number, v: boolean) => void
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [children, setChildren] = useState<PageRightNode[] | null>(null)
  const [loading, setLoading] = useState(false)
  const selfChecked = inherited || checkedPages.has(node.pageId)
  // Tri-state: fully granted (self/inherited) → 'all'; else a granted DESCENDANT (this node is in
  // the breadcrumb of a checked page) → 'some' (dash), mirroring the tools tree; else 'none'.
  const state: Tri = selfChecked ? 'all' : ancestorSet.has(node.pageId) ? 'some' : 'none'

  async function toggleOpen() {
    const next = !open
    setOpen(next)
    if (next && children === null && node.lazy) {
      setLoading(true)
      setChildren(await fetchPagesRightNodes(node.pageId))
      setLoading(false)
    }
  }

  const pl = 8 + depth * 18
  return (
    <div>
      <div className="flex items-center gap-1.5 py-1 pr-3 rounded hover:bg-muted/30 transition-colors" style={{ paddingLeft: pl }}>
        <TriBox
          state={state}
          disabled={inherited}
          onChange={(v) => onToggle(node.pageId, v)}
        />
        <button type="button" onClick={node.lazy ? toggleOpen : undefined}
          className={cn('flex flex-1 items-center gap-1.5 min-w-0', node.lazy ? 'cursor-pointer' : 'cursor-default')}>
          {node.lazy
            ? <ChevronRight className={cn('size-3 shrink-0 text-muted-foreground/60 transition-transform', open && 'rotate-90')} />
            : <span className="w-3 shrink-0" />}
          <span className={cn('text-sm truncate', selfChecked ? 'text-foreground/90' : 'text-foreground/70')}>{node.title}</span>
        </button>
      </div>
      {open && (
        <div>
          {loading && <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground" style={{ paddingLeft: pl + 18 }}>
            <Loader2 className="size-3 animate-spin" /> {t('rights.loading')}
          </div>}
          {children?.map((c) => (
            <PageNode key={c.pageId} node={c} depth={depth + 1} checkedPages={checkedPages} ancestorSet={ancestorSet}
              inherited={inherited || checkedPages.has(node.pageId)} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

export function PagesRightsPanel({
  checkedPages, onTogglePage, onToggleAll,
}: {
  checkedPages: Set<number>
  onTogglePage: (pageId: number, v: boolean) => void
  onToggleAll: (v: boolean) => void
}) {
  const { t } = useI18n()
  const [roots, setRoots] = useState<PageRightNode[] | null>(null)
  const [ancestorSet, setAncestorSet] = useState<Set<number>>(new Set())
  const allPages = checkedPages.has(ALL_PAGES)
  const specificIds = Array.from(checkedPages).filter((id) => id > 0)
  const specificCount = specificIds.length

  useEffect(() => { fetchPagesRightNodes(PAGES_RIGHTS_ROOT).then(setRoots) }, [])

  // Ancestors of the granted pages → the tri-state dash on their (possibly collapsed) parents.
  // Recomputed whenever the granted set changes (join key keeps the effect stable across renders).
  const specificKey = specificIds.slice().sort((a, b) => a - b).join(',')
  useEffect(() => {
    if (specificKey === '') { setAncestorSet(new Set()); return }
    let alive = true
    fetchPagesAncestors(specificKey.split(',').map(Number)).then((s) => { if (alive) setAncestorSet(s) })
    return () => { alive = false }
  }, [specificKey])

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* "All pages" master row (= <id>-1</id>) */}
      <label className="flex cursor-pointer items-center gap-2 bg-muted/40 px-3 py-2 hover:bg-muted/60 transition-colors">
        <TriBox state={allPages ? 'all' : specificCount > 0 ? 'some' : 'none'} onChange={onToggleAll} />
        <span className="text-sm font-medium text-foreground/90">{t('rights.pages_all_label')}</span>
        <span className="ml-auto text-xs text-muted-foreground/70">
          {allPages ? t('rights.pages_all_status') : specificCount > 0 ? t('rights.pages_targeted', { count: specificCount }) : t('rights.pages_by_page')}
        </span>
      </label>
      {/* Hint: individual pages are inherited (disabled) while "all" is on — tell the user how to target some. */}
      {allPages && (
        <p className="border-b border-border/40 bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground/70">
          {t('rights.pages_all_hint', { label: t('rights.pages_all_label') })}
        </p>
      )}
      {/* Page hierarchy (lazy) — disabled rows when "all" grants everything */}
      <div className="py-1">
        {roots === null
          ? <div className="flex items-center gap-2 py-2 pl-4 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" /> {t('rights.loading_tree')}</div>
          : roots.length === 0
            ? <p className="py-2 pl-4 text-xs text-muted-foreground">{t('rights.pages_none')}</p>
            : roots.map((r) => (
              <PageNode key={r.pageId} node={r} depth={0} checkedPages={checkedPages} ancestorSet={ancestorSet} inherited={allPages} onToggle={onTogglePage} />
            ))}
      </div>
    </div>
  )
}
