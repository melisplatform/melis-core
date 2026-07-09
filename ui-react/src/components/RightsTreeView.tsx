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
import type { ApiMenuNode, CapTreeNode, DeclaredCapValue } from '@/lib/melis-api'
import { fetchMenu, fetchReactModules, fetchDeclaredCapabilities } from '@/lib/melis-api'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
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

/** Même outil logique ? (même Module/Controller forward) — cf. useNavMenu.sameForwardTool. */
function sameForwardNode(a: ApiMenuNode, b: ApiMenuNode): boolean {
  return !!a.forward && !!b.forward &&
    a.forward.module === b.forward.module &&
    a.forward.controller === b.forward.controller
}

// ─── Capacités d'outils (droits avancés) ──────────────────────────────────────
// `DeniedCaps` = { melisKey: [capacités RETIRÉES] }. Default-allow : absence = tout permis.
type DeniedCaps = Record<string, string[]>
// Libellés des capacités via i18n (le BO suit la locale EN/FR). Clé inconnue → on retombe sur le brut.
const CAP_I18N: Record<string, I18nKey> = {
  list: 'caps.list', create: 'caps.create', edit: 'caps.edit', delete: 'caps.delete', duplicate: 'caps.duplicate', export: 'caps.export', download: 'caps.download', remove: 'caps.remove', clear: 'caps.clear', run: 'caps.run',
}

// `CapTreeNode`/`DeclaredCapValue` (liste plate OU arbre à onglets) importés de melis-api.ts —
// c'est la forme exacte renvoyée par /rights/capabilities (voir react.capabilities.php).

function capLabel(t: (k: I18nKey) => string, cap: string): string {
  return CAP_I18N[cap] ? t(CAP_I18N[cap]) : cap
}

/** Chemin de capacité complet (ex. `variants.list`) pour la deny-list, à partir du préfixe du nœud parent. */
function capPath(prefix: string, cap: string): string {
  return prefix ? `${prefix}.${cap}` : cap
}

/** Tous les chemins de capacité cochables d'un outil (actions + clés d'onglets, récursif) — sert à
 *  savoir « au moins une fonction est-elle permise ? » (grant auto des sections is_parent_tool). */
function allCapPaths(node: CapTreeNode, prefix = ''): string[] {
  const out: string[] = []
  for (const a of node.actions ?? []) out.push(capPath(prefix, a))
  for (const tab of node.tabs ?? []) {
    if (typeof tab === 'string') continue
    const tp = tab.key ? capPath(prefix, tab.key) : prefix
    if (tab.key) out.push(tp)
    out.push(...allCapPaths(tab, tp || prefix))
  }
  return out
}

/** Parse la section <meliscore_tool_capabilities> du XML en { melisKey: [caps retirées] }. */
function parseDeniedCaps(xml: string): DeniedCaps {
  const out: DeniedCaps = {}
  try {
    const doc = new DOMParser().parseFromString(xml, 'text/xml')
    doc.querySelectorAll('meliscore_tool_capabilities > tool').forEach((tool) => {
      const key = tool.getAttribute('key')
      if (!key) return
      const denied = Array.from(tool.querySelectorAll('deny'))
        .map((d) => d.textContent?.trim() ?? '')
        .filter(Boolean)
      if (denied.length) out[key] = denied
    })
  } catch { /* ignore */ }
  return out
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
      // Cf. buildRightsXml : le tag de section = la `*_toolstree_section` (dans `key` pour une
      // section is_parent_tool dont le melisKey est l'id d'outil, ex. Market Place).
      const nk = nodeKey(section)
      const sk = nk.endsWith('_toolstree_section')
        ? nk
        : ((section.key ?? '').endsWith('_toolstree_section') ? section.key! : nk)
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
  deniedCaps: DeniedCaps,
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
    // Tag de section = la `*_toolstree_section` (seul élément valide sous <meliscore_leftmenu> pour
    // le resolver legacy). Normalement = melisKey. Mais une section `is_parent_tool` (ex. Market Place)
    // expose son nœud AVEC melisKey = l'id d'OUTIL (`melis_market_place_tool_display`) et la vraie
    // section dans `key` (`melismarketplace_toolstree_section`) → on écrit l'outil SOUS ce tag, sinon
    // le grant n'est jamais sauvé (l'éditeur rouvrait « rien de coché »).
    const nk = nodeKey(section)
    const sk = nk.endsWith('_toolstree_section')
      ? nk
      : ((section.key ?? '').endsWith('_toolstree_section') ? section.key! : '')
    if (!sk) continue
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

  // ⚠️ Le resolver legacy `isAccessible` itère TOUTES les sections toolstree connues
  // (`getMelisKeyPaths()`, 7 fixes) et fait `count($xml->meliscore_leftmenu->$section->id)` :
  // une section ABSENTE du XML le fait PLANTER (PHP 8 : count(null) → TypeError → ancien BO en 500).
  // Le menu React n'expose que les sections des modules INSTALLÉS, donc on émet ici les sections
  // connues manquantes (modules non installés) avec leur `_root` (format prouvé) → ancien BO OK,
  // sans réel grant (ces sections n'ont aucun outil).
  const KNOWN_TOOLSTREE_SECTIONS = [
    'meliscore_toolstree_section', 'meliscms_toolstree_section', 'melismarketing_toolstree_section',
    'meliscommerce_toolstree_section', 'melisothers_toolstree_section', 'meliscustom_toolstree_section',
    'melismarketplace_toolstree_section',
  ]
  const emittedSections = new Set(
    navTree.map((s) => {
      const nk = nodeKey(s)
      return nk.endsWith('_toolstree_section') ? nk : ((s.key ?? '').endsWith('_toolstree_section') ? s.key! : '')
    }).filter(Boolean),
  )
  for (const sk of KNOWN_TOOLSTREE_SECTIONS) {
    if (emittedSections.has(sk)) continue
    L.push(`\t<${sk}>`)
    L.push(`\t\t<id>${sk}_root</id>`)
    L.push(`\t</${sk}>`)
  }

  L.push('</meliscore_leftmenu>')
  L.push('<melis_dashboardplugin>')
  dashIds.forEach((id) => L.push(`\t<id>${id}</id>`))
  L.push('</melis_dashboardplugin>')

  // Capacités d'outils (droits avancés) — section ÉDITABLE, écrite depuis l'état (deny-list).
  // Émise seulement pour les outils ayant ≥1 capacité retirée (default-allow). Cf. react.capabilities.php.
  const capKeys = Object.keys(deniedCaps).filter((k) => (deniedCaps[k]?.length ?? 0) > 0)
  if (capKeys.length) {
    L.push('<meliscore_tool_capabilities>')
    for (const k of capKeys) {
      L.push(`\t<tool key="${k}">`)
      for (const c of deniedCaps[k]) L.push(`\t\t<deny>${c}</deny>`)
      L.push('\t</tool>')
    }
    L.push('</meliscore_tool_capabilities>')
  }

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
  declaredCaps,
  deniedCaps,
  onToggleCap,
}: {
  node: ApiMenuNode
  checked: boolean
  onToggle: (key: string, v: boolean) => void
  depth: number
  declaredCaps: Record<string, DeclaredCapValue>
  deniedCaps: DeniedCaps
  onToggleCap: (toolKey: string, cap: string, allowed: boolean) => void
}) {
  const { t } = useI18n()
  const pl = depth === 0 ? 'pl-2' : depth === 1 ? 'pl-7' : 'pl-12'
  const capPl = depth === 0 ? 'pl-9' : depth === 1 ? 'pl-14' : 'pl-[4.75rem]'
  const key = nodeKey(node)
  const declared = declaredCaps[key]
  const denied = deniedCaps[key] ?? []
  const rootNode: CapTreeNode = Array.isArray(declared) ? { actions: declared } : (declared ?? {})
  const hasCaps = (rootNode.actions?.length ?? 0) > 0 || (rootNode.tabs?.length ?? 0) > 0
  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-1 pr-3 rounded hover:bg-muted/40 transition-colors',
          pl,
        )}
      >
        <TriCheckbox
          state={checked ? 'all' : 'none'}
          onChange={(v) => onToggle(key, v)}
        />
        <button
          type="button"
          onClick={() => onToggle(key, !checked)}
          className="flex flex-1 cursor-pointer items-center gap-2 min-w-0 text-left"
        >
          <span className="text-sm text-foreground/90">{node.name}</span>
          <span className="ml-auto text-[10px] text-muted-foreground/50 font-mono">{key}</span>
        </button>
      </div>

      {/* Capacités (droits avancés) : visibles seulement si l'outil les déclare ET est autorisé. */}
      {checked && hasCaps && (
        <div className={cn('pb-1.5', capPl)}>
          <CapTree node={rootNode} pathPrefix="" toolKey={key} denied={denied} onToggleCap={onToggleCap} t={t} />
        </div>
      )}
    </div>
  )
}

/** Rend récursivement un nœud de capacités : sa ligne d'actions, puis son bloc « Tabs » (si présent). */
function CapTree({ node, pathPrefix, toolKey, denied, onToggleCap, t }: {
  node: CapTreeNode
  pathPrefix: string
  toolKey: string
  denied: string[]
  onToggleCap: (toolKey: string, cap: string, allowed: boolean) => void
  t: (k: I18nKey) => string
}) {
  return (
    <div className="flex flex-col gap-1">
      {(node.actions?.length ?? 0) > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {node.actions!.map((cap) => {
            const full = capPath(pathPrefix, cap)
            return (
              <CapCheckbox key={full} allowed={!denied.includes(full)} label={capLabel(t, cap)}
                onChange={(v) => onToggleCap(toolKey, full, v)} />
            )
          })}
        </div>
      )}
      {(node.tabs?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">{t('caps.tabs')}</span>
          <div className="flex flex-col gap-1.5 border-l border-border/60 pl-2.5">
            {node.tabs!.map((tab, i) => {
              if (typeof tab === 'string') {
                return <span key={i} className="text-xs text-muted-foreground/80">{tab}</span>
              }
              const label = tab.label ?? tab.key ?? `#${i}`
              const hasChildren = (tab.actions?.length ?? 0) > 0 || (tab.tabs?.length ?? 0) > 0
              const tabPath = tab.key ? capPath(pathPrefix, tab.key) : ''
              return (
                <div key={tab.key ?? i} className="flex flex-col gap-1">
                  {/* L'onglet lui-même est une capacité cochable (accès à l'onglet). Un onglet sans
                      `key` (rétro-compat) reste un simple repère textuel. */}
                  {tab.key
                    ? <CapCheckbox allowed={!denied.includes(tabPath)} label={label} strong
                        onChange={(v) => onToggleCap(toolKey, tabPath, v)} />
                    : <span className="text-xs font-medium text-foreground/80">{label}</span>}
                  {hasChildren && (
                    <div className="ml-4 rounded-md bg-muted/30 px-2 py-1">
                      <CapTree node={tab} pathPrefix={tabPath || pathPrefix} toolKey={toolKey} denied={denied} onToggleCap={onToggleCap} t={t} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function CapCheckbox({ allowed, label, onChange, strong }: { allowed: boolean; label: string; onChange: (v: boolean) => void; strong?: boolean }) {
  return (
    <label className={cn(
      'flex cursor-pointer items-center gap-1.5 text-xs transition-colors',
      strong ? 'font-medium text-foreground/80 hover:text-foreground' : 'text-muted-foreground hover:text-foreground',
    )}>
      <input
        type="checkbox"
        className="size-3 accent-primary"
        checked={allowed}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
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
  declaredCaps,
  deniedCaps,
  onToggleCap,
}: {
  node: ApiMenuNode
  checkedTools: Set<string>
  onToggleTool: (key: string, v: boolean) => void
  onToggleGroup: (keys: string[], v: boolean) => void
  depth: number
  declaredCaps: Record<string, DeclaredCapValue>
  deniedCaps: DeniedCaps
  onToggleCap: (toolKey: string, cap: string, allowed: boolean) => void
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
        declaredCaps={declaredCaps}
        deniedCaps={deniedCaps}
        onToggleCap={onToggleCap}
      />
    )
  }

  // Collapse « outil enveloppant sa PROPRE zone d'outil » (même Module/Controller forward) — ex.
  // MelisCalendar : meliscalendar_leftnemu (groupe) + meliscalendar_tool (feuille = zone de rendu).
  // On rend UNE seule ligne (la feuille interne, qui porte les capacités + l'octroi), pas un
  // « Calendrier > Calendrier » redondant. Miroir de useNavMenu.collapseSingleTool (règle 2) → l'éditeur
  // de droits colle au menu de gauche.
  if (node.isTool && node.children.length === 1 && !node.noCollapse) {
    const only = node.children[0]
    if (only.isTool && !only.hasNavChild && sameForwardNode(node, only)) {
      return (
        <ToolRow
          node={only}
          checked={checkedTools.has(nodeKey(only))}
          onToggle={onToggleTool}
          depth={depth}
          declaredCaps={declaredCaps}
          deniedCaps={deniedCaps}
          onToggleCap={onToggleCap}
        />
      )
    }
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
              declaredCaps={declaredCaps}
              deniedCaps={deniedCaps}
              onToggleCap={onToggleCap}
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
  declaredCaps,
  deniedCaps,
  onToggleCap,
  onToggleLeafCap,
  onToggleLeafGrant,
}: {
  section: ApiMenuNode
  checkedTools: Set<string>
  onToggleTool: (key: string, v: boolean) => void
  onToggleGroup: (keys: string[], v: boolean) => void
  declaredCaps: Record<string, DeclaredCapValue>
  deniedCaps: DeniedCaps
  onToggleCap: (toolKey: string, cap: string, allowed: boolean) => void
  onToggleLeafCap: (toolKey: string, cap: string, allowed: boolean) => void
  onToggleLeafGrant: (toolKey: string, v: boolean) => void
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const tools = useMemo(() => getToolsFlat([section]), [section])
  const state = getTriState(tools, checkedTools)

  // Section « is_parent_tool » (ex. Market Place) : le nœud de section EST lui-même l'outil
  // (isTool, aucun enfant). Pas de sous-outil « Marketplace » redondant : la case de l'EN-TÊTE
  // vaut octroi de l'outil, et on rend SES capacités (list/download/…) directement sous l'en-tête.
  const isLeafTool = section.isTool && section.children.length === 0
  const leafKey = nodeKey(section)
  const leafChecked = checkedTools.has(leafKey)
  const leafDeclared = declaredCaps[leafKey]
  const leafRoot: CapTreeNode = Array.isArray(leafDeclared) ? { actions: leafDeclared } : (leafDeclared ?? {})
  const leafHasCaps = (leafRoot.actions?.length ?? 0) > 0 || (leafRoot.tabs?.length ?? 0) > 0
  // En-tête d'un outil-feuille : tri-état sur ses FONCTIONS (pas sur « 1 outil ») — comme une section
  // normale résume ses sous-outils. Au moins une décochée → tiret (some) ; toutes cochées → coché (all) ;
  // aucune → vide (none) = outil non octroyé. Le compteur affiche fonctions permises / total.
  const leafPaths = isLeafTool ? allCapPaths(leafRoot) : []
  const leafDenied = deniedCaps[leafKey] ?? []
  const leafAllowed = leafChecked ? leafPaths.filter((p) => !leafDenied.includes(p)).length : 0
  const leafTotal = leafPaths.length
  const useLeafCaps = isLeafTool && leafTotal > 0
  const headerState: TriState = useLeafCaps
    ? (leafAllowed === 0 ? 'none' : leafAllowed === leafTotal ? 'all' : 'some')
    : state

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 bg-muted/50 px-3 py-2">
        <TriCheckbox
          state={headerState}
          onChange={(v) => (useLeafCaps ? onToggleLeafGrant(leafKey, v) : onToggleGroup(tools.map(nodeKey), v))}
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
            {useLeafCaps
              ? `${leafAllowed}/${leafTotal}`
              : `${tools.filter((tl) => checkedTools.has(nodeKey(tl))).length}/${tools.length}`}
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
        isLeafTool ? (
          // Fonctions directement sous l'en-tête, TOUJOURS visibles à l'ouverture. Modèle allow-list :
          // outil NON octroyé → toutes décochées (denied = tous les chemins) ; cocher ≥1 fonction
          // octroie l'outil (onToggleLeafCap), tout décocher le retire. La case d'en-tête = octroi complet.
          <div className="bg-card px-3 py-2">
            {leafHasCaps
              ? <CapTree node={leafRoot} pathPrefix="" toolKey={leafKey} denied={leafChecked ? leafDenied : leafPaths} onToggleCap={onToggleLeafCap} t={t} />
              : <span className="text-xs text-muted-foreground/70">{t('rights.no_caps')}</span>}
          </div>
        ) : (
          <div className="divide-y divide-border/50 bg-card py-1">
            {section.children.map((child) => (
              <CategoryGroup
                key={nodeKey(child)}
                node={child}
                checkedTools={checkedTools}
                onToggleTool={onToggleTool}
                onToggleGroup={onToggleGroup}
                depth={0}
                declaredCaps={declaredCaps}
                deniedCaps={deniedCaps}
                onToggleCap={onToggleCap}
              />
            ))}
          </div>
        )
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
  const { t } = useI18n()
  const [navTree, setNavTree] = useState<ApiMenuNode[] | null>(null)
  const [navLoading, setNavLoading] = useState(true)
  const [checkedTools, setCheckedTools] = useState<Set<string>>(new Set())
  const [checkedPages, setCheckedPages] = useState<Set<number>>(new Set())
  const [checkedDash, setCheckedDash] = useState<Set<string>>(new Set())
  const [dashPlugins, setDashPlugins] = useState<DashboardPluginRight[]>([])
  const [cmsActive, setCmsActive] = useState(false)

  // Capacités d'outils (droits avancés) : déclarées par module + retirées par user (deny-list).
  const [declaredCaps, setDeclaredCaps] = useState<Record<string, DeclaredCapValue>>({})
  // On attend ce fetch avant le 1er rendu : sinon une section is_parent_tool (ex. Market Place) affiche
  // brièvement le compteur d'OUTILS (1/1) puis bascule sur le compteur de FONCTIONS (3/3) → flicker.
  const [capsLoaded, setCapsLoaded] = useState(false)
  const [deniedCaps, setDeniedCaps] = useState<DeniedCaps>({})
  const deniedCapsRef = useRef<DeniedCaps>({})

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

  // Capacités déclarées par les modules (carte melisKey → [caps]) pour afficher les cases par outil.
  useEffect(() => {
    fetchDeclaredCapabilities()
      .then(setDeclaredCaps)
      .catch(() => {})
      .finally(() => setCapsLoaded(true))
  }, [])

  // Re-parse whenever rights changes from OUTSIDE (server load), not from our own onChange
  useEffect(() => {
    if (!navTree) return
    if (rights === ownXmlRef.current) return // our own emit, ignore
    originalXmlRef.current = rights
    setCheckedTools(parseCheckedTools(rights, navTree))
    setCheckedPages(parsePagesRights(rights))
    setCheckedDash(parseDashboardRights(rights))
    const denied = parseDeniedCaps(rights)
    setDeniedCaps(denied)
    deniedCapsRef.current = denied
  }, [navTree, rights])

  function emit(tools: Set<string>, pages: Set<number>, dash: Set<string>, denied: DeniedCaps = deniedCapsRef.current) {
    if (!navTree) return
    const xml = buildRightsXml(tools, navTree, pages, dash, originalXmlRef.current, denied)
    ownXmlRef.current = xml
    onChange(xml)
  }

  // Toggle d'une capacité d'un outil (checked = permise). Met à jour la deny-list + ré-émet le XML.
  function onToggleCap(toolKey: string, cap: string, allowed: boolean) {
    const next: DeniedCaps = { ...deniedCapsRef.current }
    const set = new Set(next[toolKey] ?? [])
    if (allowed) set.delete(cap); else set.add(cap)
    if (set.size) next[toolKey] = [...set]; else delete next[toolKey]
    setDeniedCaps(next)
    deniedCapsRef.current = next
    emit(checkedTools, checkedPages, checkedDash, next)
  }

  // ── Sections « is_parent_tool » (ex. Market Place) : modèle ALLOW-LIST piloté par les fonctions ──
  // L'octroi de l'outil SUIT les fonctions : cocher ≥1 fonction octroie l'outil, tout décocher le retire.
  // Tant que l'outil n'est pas octroyé, les fonctions s'affichent décochées (deny = tous les chemins).

  /** Toggle d'une fonction d'un outil-feuille : recalcule denies + octroi (add/remove du melisKey). */
  function onToggleLeafCap(toolKey: string, cap: string, allowed: boolean) {
    const declared = declaredCaps[toolKey]
    const root: CapTreeNode = Array.isArray(declared) ? { actions: declared } : (declared ?? {})
    const paths = allCapPaths(root)
    const granted = checkedTools.has(toolKey)

    // Ungranted → tout était affiché décoché (deny = tous) : cocher `cap` n'active QUE lui.
    // Granted → toggle deny-list classique.
    const set = granted ? new Set(deniedCapsRef.current[toolKey] ?? []) : new Set(paths)
    if (allowed) set.delete(cap); else set.add(cap)

    const anyAllowed = paths.some((p) => !set.has(p))
    const nextDenied: DeniedCaps = { ...deniedCapsRef.current }
    // Aucune fonction permise → on retire l'octroi ET on nettoie les denies (repart propre).
    if (!anyAllowed) delete nextDenied[toolKey]
    else if (set.size) nextDenied[toolKey] = [...set]
    else delete nextDenied[toolKey]

    const nextTools = new Set(checkedTools)
    if (anyAllowed) nextTools.add(toolKey); else nextTools.delete(toolKey)

    setDeniedCaps(nextDenied); deniedCapsRef.current = nextDenied
    setCheckedTools(nextTools)
    emit(nextTools, checkedPages, checkedDash, nextDenied)
  }

  /** Toggle de la case d'en-tête d'un outil-feuille : octroi = accès COMPLET (denies remis à zéro). */
  function onToggleLeafGrant(toolKey: string, v: boolean) {
    const nextTools = new Set(checkedTools)
    if (v) nextTools.add(toolKey); else nextTools.delete(toolKey)
    const nextDenied: DeniedCaps = { ...deniedCapsRef.current }
    delete nextDenied[toolKey] // octroi → tout permis ; retrait → reset
    setCheckedTools(nextTools)
    setDeniedCaps(nextDenied); deniedCapsRef.current = nextDenied
    emit(nextTools, checkedPages, checkedDash, nextDenied)
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

  // « Tout sélectionner » = ABSOLUMENT tout : outils + pages (si CMS) + plugins dashboard.
  // Distinct du « Sélectionner tous les outils » (outils uniquement) dans la catégorie Outils.
  function toggleEverything(v: boolean) {
    const tools = new Set<string>(v ? allTools.map(nodeKey) : [])
    const pages = new Set(checkedPages)
    if (cmsActive) { if (v) pages.add(ALL_PAGES); else pages.delete(ALL_PAGES) }
    const dash = new Set(checkedDash)
    if (dashPlugins.length) { if (v) dash.add(DASHBOARD_ALL); else dash.delete(DASHBOARD_ALL) }
    setCheckedTools(tools)
    setCheckedPages(pages)
    setCheckedDash(dash)
    emit(tools, pages, dash)
  }

  // On attend AUSSI les capacités déclarées : évite le flicker du compteur d'une section is_parent_tool
  // (Market Place) qui passerait de 1/1 (fallback outils) à 3/3 (fonctions) une fois les caps chargées.
  if (navLoading || !capsLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!navTree || navTree.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        {t('rights.load_error')}
      </div>
    )
  }

  const toolsState: TriState =
    totalChecked === 0 ? 'none' : totalChecked === allTools.length ? 'all' : 'some'

  // État tri du « Tout sélectionner » global : combine outils + pages + dashboard (sections présentes).
  const partStates: TriState[] = [toolsState]
  if (cmsActive) {
    partStates.push(checkedPages.has(ALL_PAGES) ? 'all' : checkedPages.size ? 'some' : 'none')
  }
  if (dashPlugins.length) {
    partStates.push(checkedDash.has(DASHBOARD_ALL) ? 'all' : checkedDash.size ? 'some' : 'none')
  }
  const everythingState: TriState =
    partStates.every((s) => s === 'all') ? 'all'
    : partStates.every((s) => s === 'none') ? 'none'
    : 'some'

  return (
    <div className="flex flex-1 flex-col gap-3 p-6 overflow-auto">
      {/* Global header — « Tout sélectionner » = outils + pages + dashboard. */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <TriCheckbox
            state={everythingState}
            onChange={toggleEverything}
          />
          <span className="text-sm font-medium">{t('rights.select_all')}</span>
        </div>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {t('rights.tools_count', { checked: totalChecked, total: allTools.length })}
        </span>
      </div>

      {/* Level 1 = categories (Outils, Pages, …) ; level 2 = their sections/items. */}
      <div className="space-y-4">
        <Category icon={Boxes} title={t('rights.tools')} accent="#16a34a">
          {/* « Sélectionner tous les outils » — outils uniquement (distinct du global). */}
          <div className="flex items-center gap-2 pb-1">
            <TriCheckbox
              state={toolsState}
              onChange={(v) => onToggleGroup(allTools.map(nodeKey), v)}
            />
            <span className="text-xs font-medium text-muted-foreground">{t('rights.select_all_tools')}</span>
          </div>
          {navTree.map((section) => (
            <SectionPanel
              key={nodeKey(section)}
              section={section}
              checkedTools={checkedTools}
              onToggleTool={onToggleTool}
              onToggleGroup={onToggleGroup}
              declaredCaps={declaredCaps}
              deniedCaps={deniedCaps}
              onToggleCap={onToggleCap}
              onToggleLeafCap={onToggleLeafCap}
              onToggleLeafGrant={onToggleLeafGrant}
            />
          ))}
        </Category>

        {/* Dashboard Plugins (core section). Plugins themselves come from every active module, in
            module-merge order (MelisCore → MelisCms → …) — same order the backend returns. */}
        {dashPlugins.length > 0 && (
          <Category icon={LayoutDashboard} title={t('rights.dashboard_plugins')} accent="#7c3aed">
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
          <Category icon={FileText} title={t('rights.pages')} accent="#2563eb">
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
