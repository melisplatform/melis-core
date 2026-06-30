/**
 * Tree-driven tool routes.
 *
 * URL scheme: /[section]/[tool][/...]  where
 *   - [section] = kebab of the TOP-LEVEL menu section the tool appears under
 *     (e.g. a tool shown under "MelisCMS" → /melis-cms/…), regardless of which code
 *     module actually owns the tool.
 *   - [tool]    = a stable slug derived from the tool's app.interface key (node.key).
 *
 * The mapping (route ↔ melisKey / forwardKey) is built from the live menu in useNavMenu
 * and kept here so any component can resolve a pretty route back to the melisKey it must
 * render (the iframe pool keys by melisKey). Persisted to sessionStorage so a deep-link
 * reload resolves instantly, before the menu round-trip finishes.
 */

import { useEffect, useReducer } from 'react'

const STORAGE_KEY = 'melis-tool-routes'

interface ToolRouteEntry {
  route: string
  melisKey: string | null
  forwardKey: string | null
}

function kebab(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // camelCase → camel-Case
    .replace(/[\s_]+/g, '-') // spaces/underscores → dash
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '') // drop anything else
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Section slug from the top-level section name (e.g. "MelisCMS" → "melis-cms"). */
export function sectionSlug(name: string): string {
  return kebab(name) || 'tool'
}

/**
 * Tool slug from the app.interface node key, best-effort and table-free:
 *  1. kebab the key,
 *  2. strip trailing noise (-tool / -section / -leftmenu / -menu),
 *  3. strip the leading section prefix (dashed or de-dashed form),
 *  4. strip a remaining leading "tool-".
 * e.g. "melis_cms_slider_tool" (section melis-cms) → "slider";
 *      "meliscore_tool_user"  (section melis-core) → "user".
 */
export function toolSlug(nodeKey: string, section: string): string {
  let s = kebab(nodeKey)
  // Strip trailing menu/layout noise repeatedly (e.g. "...-left-menu" → "...", "...-tool-config"
  // → "..."). `config` is the wrapper suffix on tool-config nodes (e.g. the category v2 /
  // page-analytics menu leaves are "..._tool_config").
  const NOISE = /-(tool|tools|section|leftmenu|menu|left|right|config)$/
  while (NOISE.test(s)) s = s.replace(NOISE, '')
  const dashed = section
  const flat = section.replace(/-/g, '')
  if (s.startsWith(dashed + '-')) s = s.slice(dashed.length + 1)
  else if (s.startsWith(flat + '-')) s = s.slice(flat.length + 1)
  else if (s.startsWith(flat) && s.length > flat.length) s = s.slice(flat.length).replace(/^-/, '')
  s = s.replace(/^tool-/, '')
  return s || kebab(nodeKey) || 'tool'
}

// ─── Registry ────────────────────────────────────────────────────────────────

let routeToMelisKey: Record<string, string> = {}
let forwardToRoute: Record<string, string> = {}
const listeners = new Set<() => void>()

function load() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const d = JSON.parse(raw) as { routeToMelisKey?: Record<string, string>; forwardToRoute?: Record<string, string> }
      routeToMelisKey = d.routeToMelisKey ?? {}
      forwardToRoute = d.forwardToRoute ?? {}
    }
  } catch { /* ignore */ }
}
load()

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ routeToMelisKey, forwardToRoute }))
  } catch { /* ignore */ }
}

/** Register one tool's route mapping (called while building the nav tree). */
export function registerTool(e: ToolRouteEntry): void {
  let changed = false
  if (e.melisKey != null) {
    if (routeToMelisKey[e.route] !== e.melisKey) {
      routeToMelisKey[e.route] = e.melisKey
      changed = true
    }
  } else if (e.route in routeToMelisKey) {
    // React brick routes have no melisKey — clear any stale iframe key so ZoneFrames
    // doesn't overlay the brick with the legacy tool loaded in a previous render pass.
    delete routeToMelisKey[e.route]
    changed = true
  }
  if (e.forwardKey && forwardToRoute[e.forwardKey] !== e.route) {
    forwardToRoute[e.forwardKey] = e.route
    changed = true
  }
  if (changed) {
    persist()
    listeners.forEach((l) => l())
  }
}

/** Drop the whole registry (in-memory + persisted). Used when the user's rights change so stale
 *  tool→route mappings (tools the user no longer has) don't keep routing after a menu refresh. */
export function clearTools(): void {
  routeToMelisKey = {}
  forwardToRoute = {}
  try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  listeners.forEach((l) => l())
}

/** Resolve the melisKey for a /[section]/[tool] route (its first two segments). */
export function melisKeyForRoute(pathname: string): string | null {
  const base = '/' + pathname.split('/').filter(Boolean).slice(0, 2).join('/')
  return routeToMelisKey[base] ?? null
}

/** Route for a Melis `Module/Controller` forward key, if a tool maps to it. */
export function routeForForward(forwardKey: string): string | null {
  return forwardToRoute[forwardKey] ?? null
}

/** Has the registry been populated yet? (false on a cold load before the menu/registry loads). */
export function hasToolRoutes(): boolean {
  return Object.keys(forwardToRoute).length > 0
}

// ─── Recursion (sub-tab URL reflection) ──────────────────────────────────────

/** The /[section]/[tool] base of a (possibly deep) tool pathname. */
export function toolBaseRoute(pathname: string): string {
  return '/' + pathname.split('/').filter(Boolean).slice(0, 2).join('/')
}

/**
 * Parse a legacy tab data-id. Melis edit tabs use "<entityId>_id_<targetMelisKey>"
 * (e.g. "5_id_MelisCmsSlider_page"). Returns null for ids that don't follow it.
 */
export function parseToolTabId(dataId: string): { id: string; target: string } | null {
  const m = dataId.match(/^(.+?)_id_(.+)$/)
  return m ? { id: m[1], target: m[2] } : null
}

/** Sub-entity name from a target melisKey — its last meaningful segment (e.g. …slide_page → slide). */
export function subtoolName(target: string): string {
  const s = kebab(target).replace(/-(page|tool|edit|form|view|list|content|new|modal)$/g, '')
  const segs = s.split('-').filter(Boolean)
  return segs[segs.length - 1] || s || 'item'
}

export function subscribeToolRoutes(fn: () => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

/** Re-render a component when the tool-routes registry changes (e.g. after the menu loads).
 *  Returns a version number that increments on each change — usable as an effect dependency. */
export function useToolRoutesVersion(): number {
  const [version, force] = useReducer((x: number) => x + 1, 0)
  useEffect(() => subscribeToolRoutes(force), [])
  return version
}
