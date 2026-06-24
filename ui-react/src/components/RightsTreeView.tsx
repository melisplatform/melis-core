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
import { Boxes, CheckSquare, ChevronRight, FileText, LayoutDashboard, Loader2, MinusSquare, Square } from 'lucide-react'
import type { ApiMenuNode } from '@/lib/melis-api'
import { fetchMenu, fetchReactModules } from '@/lib/melis-api'
import { cn } from '@/lib/utils'
import { PagesRightsPanel } from '@/components/PagesRightsPanel'
import { ALL_PAGES, parsePagesRights, pagesRightsIds } from '@/lib/pages-rights-api'
import { DashboardPluginsRightsPanel } from '@/components/DashboardPluginsRightsPanel'
import { DASHBOARD_ALL, dashboardRightsIds, fetchDashboardPluginRights, parseDashboardRights, type DashboardPluginRight } from '@/lib/dashboard-rights-api'

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
  checkedPages: Set<number>,
  checkedDash: Set<string>,
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

  // Editable sections write from their checked state (Pages, Dashboard plugins). Interface
  // exclusions are not edited yet → preserved verbatim from the original so saving never wipes them.
  const interfaceIds = extractIds('meliscore_interface')
  const pagesIds = pagesRightsIds(checkedPages).map(String)
  const dashIds  = dashboardRightsIds(checkedDash)

  const L: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?><document type="MelisUserRights" author="MelisTechnology" version="2.0">',
    '<meliscms_pages>',
    ...pagesIds.map((id) => `\t<id>${id}</id>`),
    '</meliscms_pages>',
    '<meliscore_interface>',
    ...interfaceIds.map((id) => `\t<id>${id}</id>`),
    '</meliscore_interface>',
    '<meliscore_leftmenu>',
  ]

  for (const section of navTree) {
    const sk = nodeKey(section)
    const allTools = getToolsFlat([section])
    const checkedHere = allTools.filter((t) => checkedTools.has(nodeKey(t)))

    L.push(`\t<${sk}>`)
    // Write EXPLICIT tool ids — NOT `<section>_root`. canAccess()/isAccessible() only grant a tool
    // via its own id (or the global `meliscore_leftmenu_root`); a per-section `<section>_root` is
    // NOT honored for tools nested in sub-categories (e.g. Users under "Administration"), so it
    // produced rights that granted NOTHING → an empty menu. Listing each id is verified to work.
    for (const t of checkedHere) {
      // A node that is itself `isTool` AND has sub-tools (e.g. the section `meliscore_toolstree_section`,
      // or the calendar wrapper `meliscalendar_leftnemu`) is a CONTAINER: writing its id makes the
      // backend canAccess() grant its WHOLE subtree (isParentOf → grantAccess). That's only correct when
      // the whole subtree is checked — otherwise unchecking one child has NO effect (it stays granted via
      // the parent). So for a PARTIALLY-checked container, skip its own id and let the checked leaves below
      // carry the grant. Fully-checked container (or a leaf) → write its id (its child also needs it, e.g.
      // calendar's leaf is only granted when its `meliscalendar_leftnemu` parent is in the rights).
      const subTools = getToolsFlat(t.children ?? [])
      const partiallyChecked = subTools.length > 0 && !subTools.every((s) => checkedTools.has(nodeKey(s)))
      if (partiallyChecked) continue
      L.push(`\t\t<id>${nodeKey(t)}</id>`)
    }
    L.push(`\t</${sk}>`)
  }

  L.push('</meliscore_leftmenu>')
  L.push('<melis_dashboardplugin>')
  dashIds.forEach((id) => L.push(`\t<id>${id}</id>`))
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

// ─── Category (level-1 grouping: Outils, Pages, …) ───────────────────────────

function CategoryHeader({ icon: Icon, title, accent }: { icon: React.ElementType; title: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 px-0.5">
      <span className="flex size-5 items-center justify-center rounded" style={{ backgroundColor: `${accent}22`, color: accent }}>
        <Icon className="size-3.5" />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-foreground/75">{title}</span>
      <div className="ml-1 h-px flex-1" style={{ backgroundColor: `${accent}33` }} />
    </div>
  )
}

function Category({ icon, title, accent, children }: {
  icon: React.ElementType; title: string; accent: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <CategoryHeader icon={icon} title={title} accent={accent} />
      <div className="space-y-2 border-l-2 pl-3" style={{ borderColor: `${accent}33` }}>
        {children}
      </div>
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
  const [checkedPages, setCheckedPages] = useState<Set<number>>(new Set())
  const [checkedDash, setCheckedDash] = useState<Set<string>>(new Set())
  const [dashPlugins, setDashPlugins] = useState<DashboardPluginRight[]>([])
  const [cmsActive, setCmsActive] = useState(false)

  // Tracks the last XML we ourselves emitted via onChange — to ignore those echoes
  const ownXmlRef = useRef('')
  // Stores the original XML (server-loaded) to preserve non-leftmenu sections on rebuild
  const originalXmlRef = useRef(rights)

  // Load the FULL tool tree (full=true) — the rights editor must show every tool to grant it,
  // not only the editor's own accessible tools.
  useEffect(() => {
    fetchMenu(true).then((tree) => {
      setNavTree(tree)
      setNavLoading(false)
    })
  }, [])

  // Is the MelisCms module active? The "Pages" section is modular — shown only when CMS is present.
  useEffect(() => {
    fetchReactModules().then((mods) => setCmsActive(mods.some((m) => m.module === 'MelisCms')))
  }, [])

  // Dashboard plugins for the rights editor (authoritative, module-ordered).
  useEffect(() => {
    fetchDashboardPluginRights().then(setDashPlugins)
  }, [])

  // Re-parse whenever rights changes from OUTSIDE (server load), not from our own onChange
  useEffect(() => {
    if (!navTree) return
    if (rights === ownXmlRef.current) return // our own emit, ignore
    originalXmlRef.current = rights
    setCheckedTools(parseCheckedTools(rights, navTree))
    setCheckedPages(parsePagesRights(rights))
    setCheckedDash(parseDashboardRights(rights))
  }, [navTree, rights])

  function emit(tools: Set<string>, pages: Set<number>, dash: Set<string>) {
    if (!navTree) return
    const xml = buildRightsXml(tools, navTree, pages, dash, originalXmlRef.current)
    ownXmlRef.current = xml
    onChange(xml)
  }

  function updateChecked(next: Set<string>) {
    setCheckedTools(next)
    emit(next, checkedPages, checkedDash)
  }

  function onTogglePage(pageId: number, v: boolean) {
    const next = new Set(checkedPages)
    if (v) next.add(pageId); else next.delete(pageId)
    setCheckedPages(next)
    emit(checkedTools, next, checkedDash)
  }

  function onToggleAll(v: boolean) {
    const next = new Set(checkedPages)
    if (v) next.add(ALL_PAGES); else next.delete(ALL_PAGES)
    setCheckedPages(next)
    emit(checkedTools, next, checkedDash)
  }

  function onToggleDash(key: string, v: boolean) {
    const next = new Set(checkedDash)
    if (v) next.add(key); else next.delete(key)
    setCheckedDash(next)
    emit(checkedTools, checkedPages, next)
  }

  function onToggleAllDash(v: boolean) {
    const next = new Set(checkedDash)
    if (v) next.add(DASHBOARD_ALL); else next.delete(DASHBOARD_ALL)
    setCheckedDash(next)
    emit(checkedTools, checkedPages, next)
  }

  function onToggleDashMany(keys: string[], v: boolean) {
    const next = new Set(checkedDash)
    keys.forEach((k) => (v ? next.add(k) : next.delete(k)))
    setCheckedDash(next)
    emit(checkedTools, checkedPages, next)
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

      {/* Level 1 = categories (Outils, Pages, …) ; level 2 = their sections/items. */}
      <div className="space-y-4">
        <Category icon={Boxes} title="Outils" accent="#16a34a">
          {navTree.map((section) => (
            <SectionPanel
              key={nodeKey(section)}
              section={section}
              checkedTools={checkedTools}
              onToggleTool={onToggleTool}
              onToggleGroup={onToggleGroup}
            />
          ))}
        </Category>

        {/* Dashboard Plugins (core section). Plugins themselves come from every active module, in
            module-merge order (MelisCore → MelisCms → …) — same order the backend returns. */}
        {dashPlugins.length > 0 && (
          <Category icon={LayoutDashboard} title="Dashboard Plugins" accent="#7c3aed">
            <DashboardPluginsRightsPanel
              plugins={dashPlugins}
              checked={checkedDash}
              onToggle={onToggleDash}
              onToggleMany={onToggleDashMany}
              onToggleAll={onToggleAllDash}
            />
          </Category>
        )}

        {/* Modular category: "Pages" — contributed by MelisCms, shown only when the module is active. */}
        {cmsActive && (
          <Category icon={FileText} title="Pages" accent="#2563eb">
            <PagesRightsPanel
              checkedPages={checkedPages}
              onTogglePage={onTogglePage}
              onToggleAll={onToggleAll}
            />
          </Category>
        )}
      </div>
    </div>
  )
}
