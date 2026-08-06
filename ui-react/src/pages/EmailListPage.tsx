import { Fragment, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, Database, Loader2, Mail, Pencil, Plus, RotateCcw, Search, Settings, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as emailsApi from '@/lib/emails-api'
import type { EmailListItem, EmailSortKey } from '@/lib/emails-api'
import { useKeysetList } from '@/lib/use-keyset-list'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
import { ColumnManager, visibleCols, type ColDef } from '@/components/ColumnManager'
import { ExpandToggle, HiddenColsRow } from '@/components/ExpandableRow'
import { useIsNarrow } from '@/hooks/useIsNarrow'
import { useCan } from '@/lib/capabilities'

const TOOL_KEY = 'meliscore_tool_emails_mngt'

// ─── Colonnes (sélection + ordre persistés en localStorage) ─────────────────────────
const COL_ORDER = ['name', 'codename', 'fromName', 'fromEmail', 'source'] as const
const COL_LABEL: Record<string, I18nKey> = {
  name: 'emails.col.name', codename: 'emails.col.code', fromName: 'emails.col.from_name',
  fromEmail: 'emails.col.from_email', source: 'emails.col.source',
}
const DEFAULT_COLS: ColDef[] = COL_ORDER.map(id => ({ id, visible: true }))
const COL_KEY = 'melis-emails-cols-v1'
function loadCols(): ColDef[] {
  try {
    const raw = localStorage.getItem(COL_KEY)
    if (!raw) return DEFAULT_COLS
    const saved: ColDef[] = JSON.parse(raw)
    const ordered = saved.map(s => { const d = DEFAULT_COLS.find(c => c.id === s.id); return d ? { id: d.id, visible: s.visible } : null }).filter(Boolean) as ColDef[]
    const missing = DEFAULT_COLS.filter(d => !saved.find(s => s.id === d.id))
    return [...ordered, ...missing]
  } catch { return DEFAULT_COLS }
}
function saveCols(cols: ColDef[]) { localStorage.setItem(COL_KEY, JSON.stringify(cols)) }

interface ListCache {
  items: EmailListItem[]; total: number; cursor: string | null; hasMore: boolean
  sortCol: string; sortDir: 'asc' | 'desc'
  search: string; mode: ViewMode; iframeLoaded: boolean
}
let _cache: ListCache | null = null

function DeleteConfirm({ email, onConfirm, onCancel }: { email: EmailListItem; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useI18n()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <h3 className="text-base font-semibold">{t('emails.delete.title')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('emails.delete.confirm', { name: email.name })}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>{t('common.cancel')}</Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>{t('common.delete')}</Button>
        </div>
      </div>
    </div>
  )
}

export default function EmailListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { openTab } = useTabs()
  const { t } = useI18n()
  const narrow = useIsNarrow()
  const base = routeForForward('MelisCore/EmailsManagement') ?? '/emails'

  const canList   = useCan(TOOL_KEY, 'list')
  const canCreate = useCan(TOOL_KEY, 'create')
  const canEdit   = useCan(TOOL_KEY, 'edit')
  const canDelete = useCan(TOOL_KEY, 'delete')

  const [cols, setCols] = useState<ColDef[]>(loadCols)
  const [showColMgr, setShowColMgr] = useState(false)
  const colMgrRef = useRef<HTMLDivElement>(null)
  // A Hidden column disappears entirely on both desktop and mobile — same rule everywhere, no "+"
  // peek at Hidden ones. Desktop shows every Visible column inline. Mobile can't fit many columns,
  // so only the FIRST Visible column (by the user's dragged order in ColManager) anchors inline;
  // every OTHER Visible column surfaces behind the per-row "+" instead, in that same order.
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggleExpand = (codename: string) => setExpanded((s) => {
    const n = new Set(s); n.has(codename) ? n.delete(codename) : n.add(codename); return n
  })
  const shownCols = cols.filter(c => c.visible)
  const displayCols = narrow ? shownCols.map((c, i) => ({ ...c, visible: i === 0 })) : shownCols
  const hasHidden = narrow && shownCols.length > 1

  useEffect(() => {
    if (!showColMgr) return
    const h = (e: MouseEvent) => { if (colMgrRef.current && !colMgrRef.current.contains(e.target as Node)) setShowColMgr(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showColMgr])

  function cellContent(e: EmailListItem, id: string) {
    if (id === 'name') return <div className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /><span className="font-medium">{e.name}</span></div>
    if (id === 'codename') return <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{e.codename}</code>
    if (id === 'fromName') return e.fromName
    if (id === 'fromEmail') return e.fromEmail
    if (id === 'source') return e.inDb
      ? <Badge variant="success" className="gap-1 px-1.5 py-0 text-[10px]"><Database className="size-3" />{t('emails.source.db')}</Badge>
      : <Badge variant="muted" className="gap-1 px-1.5 py-0 text-[10px]"><Settings className="size-3" />{t('emails.source.config')}</Badge>
    return null
  }

  const showViewToggle = toolHasViewToggle('emails')
  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  const [search, setSearch] = useState(_cache?.search ?? '')
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [toDelete, setToDelete] = useState<EmailListItem | null>(null)

  // Scroll infini / tri server-side. La source est courte (config + petite table) → le
  // backend renvoie toujours nextCursor:null (un seul lot) ; le hook n'ajoute donc pas de
  // scroll, mais le tri (sort/dir) est bien pris en compte au (re)chargement côté serveur.
  const {
    items, total, loading, hasMore, sentinelRef, sortCol, sortDir, toggleSort,
    reload, snapshot,
  } = useKeysetList<EmailListItem>({
    fetcher: (a) => emailsApi
      .fetchEmails({ ...a, sort: a.sort as EmailSortKey, search: search.trim() || undefined })
      .then((r) => ({ items: r.items, total: r.total, nextCursor: r.nextCursor })),
    deps: [search, refreshKey],
    limit: 9999,
    defaultSort: 'name',
    defaultDir: 'asc',
    initial: _cache
      ? { items: _cache.items, total: _cache.total, cursor: _cache.cursor, hasMore: _cache.hasMore, sortCol: _cache.sortCol, sortDir: _cache.sortDir }
      : undefined,
    skipInitial: !!(_cache && _cache.items.length),
  })

  const cacheRef = useRef<ListCache>({ items, total, cursor: null, hasMore, sortCol, sortDir, search, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { ...snapshot(), search, mode, iframeLoaded } })
  useEffect(() => () => { _cache = cacheRef.current }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (location.pathname === base) {
      openTab({ id: base, label: t('emails.title'), path: base })
      if (emailsApi.consumeEmailsListStale()) { _cache = null; reload() }
    }
  }, [location.pathname, openTab, base, t]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleRefresh() { _cache = null; setRefreshing(true); reload(); setTimeout(() => setRefreshing(false), 500) }

  // Réinitialise la recherche puis recharge (le changement de `search` relance via deps).
  function resetFilters() {
    _cache = null
    setRefreshing(true)
    if (search) setSearch('')
    else { setRefreshKey((k) => k + 1) }
    setTimeout(() => setRefreshing(false), 500)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await emailsApi.deleteEmail(toDelete.codename)
      setToDelete(null)
      // Recharge la liste complète (comme le zoneReload du legacy) : si l'email
      // supprimé avait une config par défaut derrière lui, sa version « Default »
      // réapparaît automatiquement. Un simple filtre local la ferait disparaître.
      _cache = null
      reload()
    }
    catch { setToDelete(null) }
  }

  // En-tête de colonne triable : flèche selon l'état du hook.
  function SortHeader({ id, label, className }: { id: EmailSortKey; label: string; className?: string }) {
    const active = sortCol === id
    const SIcon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
    return (
      <th className={cn('px-4 py-3 text-left', className)}>
        <button type="button" onClick={() => toggleSort(id)}
          className={cn('inline-flex items-center gap-1 uppercase tracking-wide hover:text-foreground', active && 'text-primary')}>
          {label}
          <SIcon className={cn('size-3', active ? 'opacity-100' : 'opacity-30')} />
        </button>
      </th>
    )
  }

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      <div className="flex items-center justify-between gap-4">
        <div className={cn(narrow && 'min-w-0')}>
          <h1 className={cn('text-xl font-bold', narrow && 'truncate')}>{t('emails.title')}</h1>
          <p className={cn('text-sm text-muted-foreground', narrow && 'truncate')}>{t('emails.subtitle')}</p>
        </div>
        <div className={cn('flex items-center gap-2', narrow && 'shrink-0 flex-col')}>
          <div className="flex items-center gap-2">
            {showViewToggle && <ViewModeToggle mode={effectiveMode} compact={narrow} onChange={(m) => { setMode(m); if (m === 'iframe') setIframeLoaded(true) }} />}
            <button type="button" onClick={handleRefresh} title={t('common.refresh')} className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <RotateCcw className={cn('size-3.5', refreshing && 'animate-spin')} />
            </button>
          </div>
          {canCreate && <Button size="sm" className={cn(narrow && 'w-full')} onClick={() => navigate(`${base}/new`)}><Plus className="size-4" />{t('emails.new')}</Button>}
        </div>
      </div>

      <MelisClassicFrame melisKey={TOOL_KEY} title="Emails — Vue Melis" visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      <div className={cn('flex flex-1 flex-col gap-4', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {!canList ? (
          <p className="text-sm text-muted-foreground">{t('emails.no_list')}</p>
        ) : (<>
          <div className="flex flex-wrap items-center gap-2">
            <div className={narrow ? 'relative w-full' : 'relative flex-1 min-w-[220px]'}>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('emails.search')} className="pl-9" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
            </div>
            <div className={cn('flex items-center gap-2', !narrow && 'ml-auto', narrow && 'w-full flex-wrap')}>
              <Button variant="outline" size="sm"
                className={cn('gap-1.5', narrow && 'h-auto min-h-9 flex-[1_1_calc(50%_-_4px)] justify-center whitespace-normal text-center')}
                onClick={resetFilters} title={t('common.reset_filters')}>
                <RotateCcw className={cn('size-3.5', refreshing && 'animate-spin')} />{t('common.reset_filters')}
              </Button>
              <div ref={colMgrRef} className={cn('relative', narrow && 'flex-[1_1_calc(50%_-_4px)]')}>
                <Button variant="outline" size="sm"
                  className={cn('gap-1.5', narrow && 'h-auto min-h-9 w-full justify-center whitespace-normal text-center')}
                  onClick={() => setShowColMgr(v => !v)}>
                  <Columns3 className="size-3.5" />{t('common.columns')}
                </Button>
                {showColMgr && <ColumnManager cols={cols} labelFor={(id) => t(COL_LABEL[id])} anchorRef={colMgrRef}
                  onChange={(c) => { setCols(c); saveCols(c) }} onClose={() => setShowColMgr(false)}
                  onReset={() => { setCols(DEFAULT_COLS); saveCols(DEFAULT_COLS) }} />}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className={cn('w-full text-sm', !narrow && 'min-w-[720px]')}>
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  {hasHidden && <th className="w-8 px-2 py-3" />}
                  {visibleCols(displayCols).map(({ id }) => <SortHeader key={id} id={id as EmailSortKey} label={t(COL_LABEL[id])} />)}
                  <th className="w-20 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.length === 0 && !loading ? (
                  <tr><td colSpan={visibleCols(displayCols).length + 1 + (hasHidden ? 1 : 0)} className="px-4 py-10 text-center text-sm text-muted-foreground">{t('emails.empty')}</td></tr>
                ) : items.map((e) => (
                  <Fragment key={e.codename}>
                  <tr className="group transition-colors hover:bg-muted/40">
                    {hasHidden && (
                      <td className="px-2 py-2.5">
                        <ExpandToggle expanded={expanded.has(e.codename)} onClick={() => toggleExpand(e.codename)} />
                      </td>
                    )}
                    {visibleCols(displayCols).map(({ id }) => (
                      <td key={id} className={cn('px-4 py-2.5', (id === 'fromName' || id === 'fromEmail') && 'text-muted-foreground')}>
                        {cellContent(e, id)}
                      </td>
                    ))}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && <button onClick={() => navigate(`${base}/${e.codename}`)} title={t('common.edit')} className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil className="size-3.5" /></button>}
                        {canDelete && e.inDb && <button onClick={() => setToDelete(e)} title={t('common.delete')} className="inline-flex size-7 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"><Trash2 className="size-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                  {expanded.has(e.codename) && (
                    <HiddenColsRow cols={displayCols} labelFor={(id) => t(COL_LABEL[id])} renderValue={(id) => cellContent(e, id)}
                      colSpan={visibleCols(displayCols).length + 1 + (hasHidden ? 1 : 0)} />
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            {/* Sentinel scroll infini : inerte ici (nextCursor toujours null), gardé par cohérence. */}
            <div ref={sentinelRef} className="h-1" />
            <div className="px-4 py-3 text-center text-xs text-muted-foreground">
              {loading
                ? <span className="inline-flex items-center gap-1.5"><Loader2 className="size-3.5 animate-spin" />{t('common.loading')}</span>
                : (!hasMore && items.length > 0 ? t('emails.count', { n: total }) : null)}
            </div>
          </div>
        </>)}
      </div>

      {toDelete && <DeleteConfirm email={toDelete} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />}
    </div>
  )
}
