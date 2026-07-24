import { useEffect, useMemo, useState } from 'react'
import {
  BarChart2,
  Bell,
  Box,
  Calendar,
  ChevronRight,
  Cog,
  Cpu,
  Database,
  FileText,
  Folder,
  Globe,
  Image,
  LayoutDashboard,
  Mail,
  Map,
  Package,
  Palette,
  Percent,
  ShieldCheck,
  ShoppingCart,
  Sliders,
  Star,
  Tag,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import * as melisApi from '@/lib/melis-api'
import { REACT_ROUTES } from '@/lib/module-registry'
import { BRICK_ROUTES, useBricks } from '@/lib/bricks'
import { getMelisIcon } from '@/lib/melis-icons'
import { sectionSlug, toolSlug, toolSlugForForward, registerTool } from '@/lib/tool-routes'
import { NAV_SECTIONS, type NavSection } from '@/components/layout/nav'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'

// ─── Unified recursive tree types ────────────────────────────────────────────

export interface NavNode {
  key: string
  label: string
  icon: LucideIcon
  /** Route React Router, ou null si c'est juste un conteneur. */
  to: string | null
  /** true = nœud cliquable (outil PHP avec forward). */
  isTool: boolean
  hasNavChild: boolean
  /** Données de routage Melis pour charger l'outil. */
  forward: melisApi.ApiMenuNode['forward'] | null
  /** Nombre d'enfants dans la config (non filtré par droits) — voir collapseSingleTool. */
  configChildCount?: number
  /** La catégorie refuse le collapse mono-outil (conf.no_collapse) — reste un groupe dépliable. */
  noCollapse?: boolean
  /** Module dont le panneau de sidebar (ex. arbre des pages CMS) doit s'accrocher à cette section
   *  même quand elle n'a aucun outil accessible (section « hôte de sidebar »). Voir collectModules. */
  sidebarModule?: string
  children: NavNode[]
}

// ─── FA → Lucide icon mapping ────────────────────────────────────────────────

const FA_ICON_MAP: Record<string, LucideIcon> = {
  cube:              Box,
  cubes:             Package,
  cog:               Cog,
  cogs:              Sliders,
  wrench:            Wrench,
  sliders:           Sliders,
  users:             Users,
  user:              Users,
  'user-circle':     Users,
  globe:             Globe,
  file:              FileText,
  'file-text':       FileText,
  'file-alt':        FileText,
  image:             Image,
  images:            Image,
  photo:             Image,
  folder:            Folder,
  'folder-open':     Folder,
  chart:             BarChart2,
  'bar-chart':       BarChart2,
  'line-chart':      BarChart2,
  analytics:         BarChart2,
  dashboard:         LayoutDashboard,
  tachometer:        LayoutDashboard,
  'tachometer-alt':  LayoutDashboard,
  calendar:          Calendar,
  envelope:          Mail,
  mail:              Mail,
  tag:               Tag,
  tags:              Tag,
  percent:           Percent,
  star:              Star,
  bookmark:          Star,
  database:          Database,
  server:            Database,
  'shopping-cart':   ShoppingCart,
  'shopping-bag':    ShoppingCart,
  cart:              ShoppingCart,
  truck:             Truck,
  shipping:          Truck,
  map:               Map,
  'map-marker':      Map,
  'map-marker-alt':  Map,
  shield:            ShieldCheck,
  'shield-alt':      ShieldCheck,
  lock:              ShieldCheck,
  robot:             Cpu,
  android:           Cpu,
  microchip:         Cpu,
  palette:           Palette,
  'paint-brush':     Palette,
  'chevron-right':   ChevronRight,
  'puzzle-piece':    Package,
  language:          Globe,
  flag:              Tag,
  comments:          Mail,
  bell:              Bell,
  'bell-o':          Bell,
  shopping:          ShoppingCart,
  'list-alt':        FileText,
  tasks:             FileText,
  sitemap:           Folder,
  paint:             Palette,
  'paint-bucket':    Palette,
  desktop:           LayoutDashboard,
  columns:           LayoutDashboard,
  th:                LayoutDashboard,
  'th-large':        LayoutDashboard,
  home:              LayoutDashboard,
  book:              FileText,
  'book-open':       FileText,
  newspaper:         FileText,
  rss:               Globe,
  link:              Globe,
  'external-link':   Globe,
  'external-link-alt': Globe,
  download:          Database,
  upload:            Database,
  'cloud-upload':    Database,
  'cloud-download':  Database,
  tools:             Wrench,
  hammer:            Wrench,
  'magic':           Palette,
  brain:             Cpu,
  'bolt':            Cpu,
  eye:               ShieldCheck,
  fingerprint:       ShieldCheck,
  key:               ShieldCheck,
  store:             ShoppingCart,
  box:               Package,
  boxes:             Package,
  layer:             Package,
  layers:            Package,
}

function faToLucide(faClass: string): LucideIcon {
  // Handle "fa fa-fw icon-xxx", "fa-xxx", "icon-xxx" variants
  const parts = faClass.split(/[\s-]/).filter(Boolean)
  for (const part of parts) {
    if (FA_ICON_MAP[part]) return FA_ICON_MAP[part]
  }
  const key = faClass.replace(/^fa-?/, '').replace(/\s+.*$/, '').trim()
  return FA_ICON_MAP[key] ?? Box
}

// ─── Module → React route mapping ────────────────────────────────────────────
//
// Quand un outil Melis a une implémentation React dédiée, on le route vers
// la page React plutôt que vers le fallback iframe /zone/:melisKey.
// Le mapping "Module/Controller" → route est dérivé du registre de modules
// (source de vérité unique). Cf. `@/lib/module-registry`.

function getToolRoute(node: melisApi.ApiMenuNode, section: string): string {
  if (!node.isTool) return ''
  const key = `${node.forward?.module ?? ''}/${node.forward?.controller ?? ''}`
  // Tree-derived URL /[section]/[tool] for EVERY tool (native, brick, iframe).
  // Override explicite par forward (URLs propres) sinon dérivation heuristique depuis node.key.
  const route = `/${section}/${toolSlugForForward(key, node.key, section)}`
  // Native & brick tools render a dedicated React route → not an iframe zone (melisKey null),
  // but we still register forward→route so App can mount them at the derived URL. Iframe tools
  // register their melisKey so ZonePage/Shell resolve the iframe.
  const isReact = !!(REACT_ROUTES[key] || BRICK_ROUTES[key])
  registerTool({ route, melisKey: isReact ? null : node.melisKey, forwardKey: key })
  return route
}

// ─── API → NavNode[] ─────────────────────────────────────────────────────────

function apiNodeToNavNode(node: melisApi.ApiMenuNode, depth = 0, section = ''): NavNode {
  const isMelisModule = depth === 0 && (/melis/i.test(node.name) || /melis/i.test(node.key))
  // The URL prefix = the TOP-LEVEL section the tool appears under (kebab of its name),
  // regardless of which code module owns the tool. Captured at depth 0 and threaded down.
  const sec = depth === 0 ? sectionSlug(node.name) : section
  // A leaf with a melisKey but NO forward (isTool=false) — e.g. a tool declared via a `type`
  // reference (MelisCmsProspects "Themes") — is still an openable tool: route it to the zone
  // pool by its melisKey instead of rendering an empty, expandable, dead-end section.
  const isZoneLeaf = !node.isTool && node.children.length === 0 && !!node.melisKey
  let zoneLeafRoute: string | null = null
  if (isZoneLeaf) {
    zoneLeafRoute = `/${sec}/${toolSlug(node.key, sec)}`
    registerTool({ route: zoneLeafRoute, melisKey: node.melisKey, forwardKey: null })
  }
  return {
    key:         node.key,
    label:       node.name,
    icon:        isMelisModule ? getMelisIcon(node.name, node.key) : faToLucide(node.icon || 'fa-cube'),
    to:          node.isTool ? getToolRoute(node, sec) : zoneLeafRoute,
    isTool:      node.isTool || isZoneLeaf,
    hasNavChild: node.hasNavChild,
    forward:     node.isTool ? node.forward : null,
    configChildCount: node.configChildCount,
    noCollapse:  node.noCollapse,
    sidebarModule: node.sidebarModule,
    children:    node.children.map(child => apiNodeToNavNode(child, depth + 1, sec)),
  }
}

// ─── Collapse single-tool sections ──────────────────────────────────────────
//
// Two redundant nestings show a tool on more than one level — flattened recursively here
// (multi-child nodes are left untouched):
//   1. A SECTION (non-tool) wrapping a single tool leaf (e.g. "SLIDER" → "Slider"): promote
//      the lone tool into the section so it renders as one clickable entry.
//   2. A TOOL wrapping its OWN single tool zone — same Module/Controller forward (e.g.
//      MelisCalendar: "render-calendar-leftmenu" → "render-calendar"): the inner node is the
//      tool's render zone, not a separate menu item, so drop the inner level and keep the
//      inner tool's routing (the route registered in forwardToRoute / matched by the brick
//      manifest melisKey). Combined with rule 1, MelisCalendar collapses to a single entry.

/** Same logical tool? (same Melis Module/Controller forward). */
function sameForwardTool(a: NavNode, b: NavNode): boolean {
  return (
    !!a.forward && !!b.forward &&
    a.forward.module === b.forward.module &&
    a.forward.controller === b.forward.controller
  )
}

function collapseSingleTool(node: NavNode): NavNode {
  const children = node.children.map(collapseSingleTool)
  // Explicit opt-out (conf.no_collapse): keep the group expandable even with a lone tool
  // (e.g. "Dev Tools" → "Melis Phpinfo"), so more tools can be added under it later.
  if (node.noCollapse) return { ...node, children }
  if (children.length === 1 && children[0].isTool && children[0].children.length === 0) {
    const only = children[0]
    // Rule 1: a wrapper that INHERENTLY holds a single tool (e.g. the "SLIDER" section → "Slider").
    // Gate on configChildCount (unfiltered count from the backend): a multi-tool CATEGORY in which the
    // user only has one tool granted (e.g. "Administration" with just "User management") must KEEP its
    // header, not be replaced by its lone visible tool. `?? 1` preserves old behaviour for nodes without
    // the field (static fallback nav).
    if (!node.isTool && (node.configChildCount ?? 1) === 1) {
      return {
        ...node,
        label:       only.label,
        icon:        only.icon,
        to:          only.to,
        isTool:      true,
        hasNavChild: false,
        forward:     only.forward,
        children:    [],
      }
    }
    // Rule 2: tool wrapping its own tool zone (same Module/Controller).
    if (sameForwardTool(node, only)) {
      return { ...node, to: only.to, forward: only.forward, hasNavChild: false, children: [] }
    }
  }
  return { ...node, children }
}

// ─── Static fallback → NavNode[] ────────────────────────────────────────────

function staticToNavNodes(navSections: NavSection[], t: (k: I18nKey) => string): NavNode[] {
  return navSections.map((section) => ({
    key:         section.titleKey,
    label:       section.titleLabel ?? t(section.titleKey),
    icon:        LayoutDashboard,
    to:          null,
    isTool:      false,
    hasNavChild: true,
    forward:     null,
    children:    section.items.map((item) => ({
      key:         item.to,
      label:       item.label ?? t(item.labelKey),
      icon:        item.icon,
      to:          item.to,
      isTool:      false,
      hasNavChild: false,
      forward:     null,
      children:    [],
    })),
  }))
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface NavMenuState {
  nodes: NavNode[]
  loading: boolean
}

/**
 * Returns the navigation tree as a list of top-level `NavNode` (sections).
 * Each node can have recursive children (categories → tools → sub-tools).
 *
 * Uses the live `/melis/react-api/menu` endpoint when authenticated;
 * falls back to translated static nav in demo/unauthenticated mode.
 */
export function useNavMenu(): NavMenuState {
  const { t } = useI18n()
  // Re-render when module bricks finish loading so menu entries can map to their
  // React route (BRICK_ROUTES) instead of falling back to the iframe view.
  const bricks = useBricks()
  const [apiData, setApiData] = useState<melisApi.ApiMenuNode[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    melisApi.fetchMenu().then((data) => {
      if (cancelled) return
      if (data && data.length > 0) setApiData(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const nodes = useMemo(
    () => (apiData ? apiData.map((node) => collapseSingleTool(apiNodeToNavNode(node, 0))) : staticToNavNodes(NAV_SECTIONS, t)),
    // `bricks` is a dependency so the tree re-maps once bricks (and BRICK_ROUTES) load.
    [apiData, t, bricks],
  )

  return {
    nodes,
    loading: loading && apiData === null,
  }
}
