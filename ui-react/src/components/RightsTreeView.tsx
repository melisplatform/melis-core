/**
 * RightsTreeView — Éditeur visuel des droits utilisateur Melis.
 *
 * - Charge le menu complet via /melis/react-api/menu
 * - Parse le XML usr_rights pour déterminer les outils cochés
 * - Génère le XML mis à jour à chaque changement de case
 *
 * Format XML géré (format "nested sections") :
 *   <meliscore_leftmenu>
 *     <meliscore_toolstree_section>
 *       <id>meliscore_tool_user</id>
 *       <id>meliscore_toolstree_section_root</id>  ← toute la section
 *     </meliscore_toolstree_section>
 *   </meliscore_leftmenu>
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckSquare, ChevronRight, Loader2, MinusSquare, Square } from 'lucide-react'
import type { ApiMenuNode } from '@/lib/melis-api'
import { fetchMenu } from '@/lib/melis-api'
import { cn } from '@/lib/utils'

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** Tous les nœuds isTool dans un sous-arbre (outils feuilles ET outils-groupes). */
function getToolsFlat(nodes: ApiMenuNode[]): ApiMenuNode[] {
  const out: ApiMenuNode[] = []
  for (const n of nodes) {
    if (n.isTool) out.push(n)
    if (n.children.length) out.push(...getToolsFlat(n.children))
  }
  return out
}

function nodeKey(n: ApiMenuNode) {
  return n.melisKey || n.key
}

/**
 * Parse le XML usr_rights et retourne un Set des melisKeys des outils autorisés.
 * Gère :
 *   - Format nested (<section><id>toolKey</id></section>)
 *   - sectionKey_root = toute la section autorisée
 *   - meliscore_leftmenu_root (ancien format admin) = tout autorisé
 */
function parseCheckedTools(xml: string, navTree: ApiMenuNode[]): Set<string> {
  const checked = new Set<string>()
  if (!xml?.trim()) return checked
  try {
    const doc = new DOMParser().parseFromString(xml, 'text/xml')
    const leftmenu = doc.querySelector('meliscore_leftmenu')
    if (!leftmenu) return checked

    // Ancien format admin : <id>meliscore_leftmenu_root</id> en direct
    const directIds = Array.from(leftmenu.childNodes)
      .filter((n) => n.nodeName === 'id')
      .map((n) => n.textContent?.trim() ?? '')

    if (directIds.includes('meliscore_leftmenu_root')) {
      getToolsFlat(navTree).forEach((t) => checked.add(nodeKey(t)))
      return checked
    }

    // Nouveau format : parcourir chaque section
    for (const section of navTree) {
      const sk = nodeKey(section)
      const sectionEl = leftmenu.querySelector(sk)
      if (!sectionEl) continue

      const idVals = Array.from(sectionEl.childNodes)
        .filter((n) => n.nodeName === 'id')
        .map((n) => n.textContent?.trim() ?? '')
        .filter(Boolean)

      const sectionTools = getToolsFlat([section])
      if (idVals.includes(`${sk}_root`)) {
        // Toute la section
        sectionTools.forEach((t) => checked.add(nodeKey(t)))
      } else {
        const ids = new Set(idVals)
        sectionTools.forEach((t) => { if (ids.has(nodeKey(t))) checked.add(nodeKey(t)) })
      }
    }
  } catch { /* XML malformé */ }
  return checked
}

/**
 * Reconstruit le XML complet depuis l'ensemble des outils cochés.
 * Préserve les sections non-leftmenu (pages, interface, dashboard) de l'XML d'origine.
 */
function buildRightsXml(
  checkedTools: Set<string>,
  navTree: ApiMenuNode[],
  originalXml: string,
): string {
  // Extrait les <id> d'une section dans l'XML original
  const extractIds = (tag: string): string[] => {
    try {
      const doc = new DOMParser().parseFromString(originalXml, 'text/xml')
      const el = doc.querySelector(tag)
      if (!el) return []
      return Array.from(el.childNodes)
        .filter((n) => n.nodeName === 'id')
        .map((n) => n.textContent?.trim() ?? '')
        .filter(Boolean)
    } catch { return [] }
  }

  const pagesIds = extractIds('meliscms_pages')
  const dashIds  = extractIds('melis_dashboardplugin')
  const defaultDash = dashIds.length
    ? dashIds
    : ['melis_dashboardplugin_root', 'MelisCoreDashboardAnnouncementPlugin']

  const L: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?><document type="MelisUserRights" author="MelisTechnology" version="2.0">',
    '<meliscms_pages>',
    ...pagesIds.map((id) => `\t<id>${id}</id>`),
    '</meliscms_pages>',
    '<meliscore_interface>',
    '</meliscore_interface>',
    '<meliscore_leftmenu>',
  ]

  for (const section of navTree) {
    const sk = nodeKey(section)
    const allTools = getToolsFlat([section])
    const checkedHere = allTools.filter((t) => checkedTools.has(nodeKey(t)))

    L.push(`\t<${sk}>`)
    if (checkedHere.length > 0) {
      if (checkedHere.length === allTools.length) {
        // Toute la section → root
        L.push(`\t\t<id>${sk}_root</id>`)
      } else {
        for (const t of checkedHere) {
          L.push(`\t\t<id>${nodeKey(t)}</id>`)
        }
      }
    }
    L.push(`\t</${sk}>`)
  }

  L.push('</meliscore_leftmenu>')
  L.push('<melis_dashboardplugin>')
  defaultDash.forEach((id) => L.push(`\t<id>${id}</id>`))
  L.push('</melis_dashboardplugin>')
  L.push('</document>')

  return L.join('\n')
}

// ─── Composants UI ───────────────────────────────────────────────────────────

type TriState = 'all' | 'some' | 'none'

function TriCheckbox({
  state,
  onChange,
}: {
  state: TriState
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(state !== 'all')}
      className="flex shrink-0 items-center justify-center rounded transition-colors hover:opacity-80 focus:outline-none"
    >
      {state === 'all' ? (
        <CheckSquare className="size-[15px] text-primary" />
      ) : state === 'some' ? (
        <MinusSquare className="size-[15px] text-primary/70" />
      ) : (
        <Square className="size-[15px] text-muted-foreground/60" />
      )}
    </button>
  )
}

function getTriState(tools: ApiMenuNode[], checked: Set<string>): TriState {
  const n = tools.filter((t) => checked.has(nodeKey(t))).length
  if (n === 0) return 'none'
  if (n === tools.length) return 'all'
  return 'some'
}

// ─── ToolRow ─────────────────────────────────────────────────────────────────

function ToolRow({
  node,
  checked,
  onToggle,
  depth,
}: {
  node: ApiMenuNode
  checked: boolean
  onToggle: (key: string, v: boolean) => void
  depth: number
}) {
  const pl = depth === 0 ? 'pl-2' : depth === 1 ? 'pl-7' : 'pl-12'
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 py-1 pr-3 rounded hover:bg-muted/40 transition-colors',
        pl,
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onToggle(nodeKey(node), e.target.checked)}
      />
      <TriCheckbox
        state={checked ? 'all' : 'none'}
        onChange={(v) => onToggle(nodeKey(node), v)}
      />
      <span className="text-sm text-foreground/90">{node.name}</span>
      <span className="ml-auto text-[10px] text-muted-foreground/50 font-mono">{nodeKey(node)}</span>
    </label>
  )
}

// ─── CategoryGroup ────────────────────────────────────────────────────────────

function CategoryGroup({
  node,
  checkedTools,
  onToggleTool,
  onToggleGroup,
  depth,
}: {
  node: ApiMenuNode
  checkedTools: Set<string>
  onToggleTool: (key: string, v: boolean) => void
  onToggleGroup: (keys: string[], v: boolean) => void
  depth: number
}) {
  const [open, setOpen] = useState(true)
  const tools = getToolsFlat([node])
  const state = getTriState(tools, checkedTools)
  const pl = depth === 0 ? 'pl-2' : depth === 1 ? 'pl-7' : 'pl-12'

  if (node.isTool && !node.hasNavChild) {
    return (
      <ToolRow
        node={node}
        checked={checkedTools.has(nodeKey(node))}
        onToggle={onToggleTool}
        depth={depth}
      />
    )
  }

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1.5 py-1 pr-3 rounded hover:bg-muted/30 transition-colors',
          pl,
        )}
      >
        <TriCheckbox
          state={state}
          onChange={(v) => onToggleGroup(tools.map(nodeKey), v)}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-1.5 min-w-0"
        >
          <span className="text-sm font-medium text-foreground/80 truncate">{node.name}</span>
          <ChevronRight
            className={cn(
              'size-3 shrink-0 text-muted-foreground/60 transition-transform ml-auto',
              open && 'rotate-90',
            )}
          />
        </button>
      </div>
      {open && (
        <div className="ml-4">
          {node.children.map((child) => (
            <CategoryGroup
              key={nodeKey(child)}
              node={child}
              checkedTools={checkedTools}
              onToggleTool={onToggleTool}
              onToggleGroup={onToggleGroup}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── SectionPanel ────────────────────────────────────────────────────────────

function SectionPanel({
  section,
  checkedTools,
  onToggleTool,
  onToggleGroup,
}: {
  section: ApiMenuNode
  checkedTools: Set<string>
  onToggleTool: (key: string, v: boolean) => void
  onToggleGroup: (keys: string[], v: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const tools = useMemo(() => getToolsFlat([section]), [section])
  const state = getTriState(tools, checkedTools)

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 bg-muted/50 px-3 py-2">
        <TriCheckbox
          state={state}
          onChange={(v) => onToggleGroup(tools.map(nodeKey), v)}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 min-w-0"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {section.name}
          </span>
          <span className="ml-1 text-xs text-muted-foreground/60 tabular-nums">
            {tools.filter((t) => checkedTools.has(nodeKey(t))).length}/{tools.length}
          </span>
          <ChevronRight
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground/60 transition-transform ml-auto',
              open && 'rotate-90',
            )}
          />
        </button>
      </div>

      {open && (
        <div className="divide-y divide-border/50 bg-card py-1">
          {section.children.map((child) => (
            <CategoryGroup
              key={nodeKey(child)}
              node={child}
              checkedTools={checkedTools}
              onToggleTool={onToggleTool}
              onToggleGroup={onToggleGroup}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── RightsTreeView ──────────────────────────────────────────────────────────

export interface RightsTreeViewProps {
  rights: string
  onChange: (xml: string) => void
}

export function RightsTreeView({ rights, onChange }: RightsTreeViewProps) {
  const [navTree, setNavTree] = useState<ApiMenuNode[] | null>(null)
  const [navLoading, setNavLoading] = useState(true)
  const [checkedTools, setCheckedTools] = useState<Set<string>>(new Set())

  // Tracks the last XML we ourselves emitted via onChange — to ignore those echoes
  const ownXmlRef = useRef('')
  // Stores the original XML (server-loaded) to preserve non-leftmenu sections on rebuild
  const originalXmlRef = useRef(rights)

  // Load nav tree once
  useEffect(() => {
    fetchMenu().then((tree) => {
      setNavTree(tree)
      setNavLoading(false)
    })
  }, [])

  // Re-parse whenever rights changes from OUTSIDE (server load), not from our own onChange
  useEffect(() => {
    if (!navTree) return
    if (rights === ownXmlRef.current) return // our own emit, ignore
    originalXmlRef.current = rights
    setCheckedTools(parseCheckedTools(rights, navTree))
  }, [navTree, rights])

  function updateChecked(next: Set<string>) {
    setCheckedTools(next)
    if (navTree) {
      const xml = buildRightsXml(next, navTree, originalXmlRef.current)
      ownXmlRef.current = xml
      onChange(xml)
    }
  }

  function onToggleTool(key: string, v: boolean) {
    const next = new Set(checkedTools)
    if (v) next.add(key); else next.delete(key)
    updateChecked(next)
  }

  function onToggleGroup(keys: string[], v: boolean) {
    const next = new Set(checkedTools)
    keys.forEach((k) => (v ? next.add(k) : next.delete(k)))
    updateChecked(next)
  }

  const allTools = useMemo(() => (navTree ? getToolsFlat(navTree) : []), [navTree])
  const totalChecked = allTools.filter((t) => checkedTools.has(nodeKey(t))).length

  if (navLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!navTree || navTree.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Impossible de charger l&apos;arbre de navigation.
      </div>
    )
  }

  const allState: TriState =
    totalChecked === 0 ? 'none' : totalChecked === allTools.length ? 'all' : 'some'

  return (
    <div className="flex flex-1 flex-col gap-3 p-6 overflow-auto">
      {/* Global header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <TriCheckbox
            state={allState}
            onChange={(v) => onToggleGroup(allTools.map(nodeKey), v)}
          />
          <span className="text-sm font-medium">Tout sélectionner</span>
        </div>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {totalChecked} / {allTools.length} outil{allTools.length !== 1 ? 's' : ''} autorisé{totalChecked !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Section panels */}
      <div className="space-y-2">
        {navTree.map((section) => (
          <SectionPanel
            key={nodeKey(section)}
            section={section}
            checkedTools={checkedTools}
            onToggleTool={onToggleTool}
            onToggleGroup={onToggleGroup}
          />
        ))}
      </div>
    </div>
  )
}
