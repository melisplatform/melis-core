/**
 * Runtime React brick loader (modular UI).
 *
 * A Melis module can ship its own React UI ("brick"). At runtime the shell asks
 * the backend which ACTIVE modules expose a brick (GET /melis/react-api/react-modules),
 * loads each brick's IIFE bundle from the module's public/ (served by MelisAssetManager),
 * and registers its page component + route. The brick therefore appears *if and only if*
 * its module is active.
 *
 * React / ReactRouter are shared singletons exposed by the host on `window`
 * (see `main.tsx`); brick bundles consume them as externals, so hooks, context and
 * the host Router all work across the boundary.
 */
import { lazy, useEffect, useReducer, type ComponentType, type LazyExoticComponent } from 'react'

import * as melisApi from '@/lib/melis-api'
import { routeForForward } from '@/lib/tool-routes'

export interface BrickDef {
  id: string
  /** Owning Melis module (e.g. "MelisCms") — used to attach a sidebar panel to its nav section. */
  module: string
  route: string
  label: string
  forwardKey: string | null
  melisKey: string | null
  /**
   * Opt-in to the host sub-tab pattern (native "User Management" look). When true, the host
   * TabBridge collapses /[section]/[tool]/:id to ONE tool top tab and the host SubTabBar renders
   * the opened records (the brick registers them via window.__melisOpenSubTab). When false (default)
   * the brick keeps a separate top tab per opened entity (e.g. the News brick).
   */
  subTabs: boolean
  /**
   * Opt-in to persistent mounting (manifest `persistent: true`). The Shell mounts the brick on its
   * first visit and NEVER unmounts it: navigating to another tool only CSS-hides it. Its state,
   * fetched data and in-tree legacy iframe therefore survive tab/sub-tab switches.
   *
   * The Shell scopes the brick's router context to its own route (see Shell.tsx `BrickHost`), so a
   * hidden brick can no longer read a foreign route's `:id` and hijack another tool's navigation.
   * It ALSO receives an `active` prop; a brick may still freeze its own route-reading on it
   * (see CmsStylePage) — belt and braces, and required for any brick that reads a global signal.
   * Off by default (mount only while active).
   */
  persistent: boolean
  /** Routed page rendered in the content area (optional). May be a React.lazy exotic. */
  Component?: ComponentType | LazyExoticComponent<ComponentType>
  /** Left-sidebar panel rendered under the module's nav section (optional). */
  Sidebar?: ComponentType
  /** Topbar widget (e.g. the messenger notification icon), rendered next to the language switcher (optional). */
  Header?: ComponentType
  /**
   * Global overlay rendered ONCE at the shell root, outside the routed content and above
   * everything else (optional) — for a module-owned floating UI that must be reachable from
   * any tool, e.g. the MelisAI assistant (FAB + chat panel). Route-independent: it stays
   * mounted across navigations, so its own state (an open chat session) survives.
   */
  Overlay?: ComponentType
  /**
   * A section rendered inside MelisCore's native Other Config page (System configuration ->
   * Other Config), appended after the built-in sections -- lets a module contribute admin
   * settings there without melis-core knowing about it by name.
   */
  OtherConfigSection?: ComponentType
}

/** `Module/Controller` → React route, fed to the menu so legacy entries link to bricks. */
export const BRICK_ROUTES: Record<string, string> = {}

let bricks: BrickDef[] = []
let status: 'idle' | 'loading' | 'done' = 'idle'
let version = 0
const listeners = new Set<() => void>()

function notify() {
  version += 1
  listeners.forEach((l) => l())
}

// ── Active-module detection ───────────────────────────────────────────────────
// The set of active Melis module names (those exposing a React brick). Kept
// SEPARATE from `bricks` (which the lazy loader mutates by splicing entries) and
// refreshable on its own — so module-gated UI (useModuleActive) can react to a
// module being enabled/disabled WITHOUT a full page reload (see refreshActiveModules).
let activeModules = new Set<string>()
const activeModuleListeners = new Set<() => void>()

function notifyActiveModules() {
  activeModuleListeners.forEach((l) => l())
}

/** Replace the active-module set; notify consumers only when it actually changed. */
function setActiveModules(names: string[]) {
  const next = new Set(names)
  const changed = next.size !== activeModules.size || [...next].some((n) => !activeModules.has(n))
  if (changed) {
    activeModules = next
    notifyActiveModules()
  }
}

/**
 * Re-fetch ONLY the active-modules list (cheap, no-store JSON — no bundle loading)
 * and update useModuleActive consumers. Called on navigation (see Shell) so toggling
 * a module in the Modules tool is reflected when the user reopens a gated tool,
 * instead of requiring a full page reload.
 */
export async function refreshActiveModules(): Promise<void> {
  try {
    const list = await melisApi.fetchReactModules()
    setActiveModules(list.map((m) => m.module))
  } catch {
    /* keep the previous set on error */
  }
}

/** Where brick bundles self-register their components, keyed by brick id. */
type RegisteredBrick = { Component?: ComponentType; Sidebar?: ComponentType; Header?: ComponentType; Overlay?: ComponentType; OtherConfigSection?: ComponentType }
function componentRegistry(): Record<string, RegisteredBrick> {
  const w = window as unknown as { __MELIS_BRICK_COMPONENTS__?: Record<string, RegisteredBrick> }
  return (w.__MELIS_BRICK_COMPONENTS__ ??= {})
}

// Dedup by URL — INCLUDING in-flight loads. A single bundle can be requested many times
// concurrently: a multi-brick module (e.g. melis-commerce ships 13 brick ids from ONE brick.js)
// produces one `load(m)` prefetch per id, plus the React.lazy factory on first route visit —
// all calling loadScript() with the same URL. Keying only on COMPLETED loads (a Set filled in
// onload) let every concurrent caller append its own <script> before the first resolved, so the
// same brick.js was fetched N times (visible with cache disabled). Caching the promise collapses
// all concurrent and later calls onto a single network request.
const scriptLoads = new Map<string, Promise<void>>()

function loadScript(url: string): Promise<void> {
  const existing = scriptLoads.get(url)
  if (existing) return existing
  const p = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script')
    el.src = url
    el.async = true
    el.onload = () => resolve()
    el.onerror = () => reject(new Error(`Failed to load brick bundle: ${url}`))
    document.head.appendChild(el)
  }).catch((e) => {
    // Don't cache a rejection: drop the entry so a later call can retry the (failed) load.
    scriptLoads.delete(url)
    throw e
  })
  scriptLoads.set(url, p)
  return p
}

export function getBricks(): BrickDef[] {
  return bricks
}

/**
 * Effective route a brick is mounted at: the tree-derived /[section]/[tool] (from the menu, via
 * its forwardKey) when available, else the brick's own manifest route (e.g. the CMS page brick,
 * which has no menu forward and ships a fixed route).
 */
export function brickRoute(b: BrickDef): string {
  return (b.forwardKey ? routeForForward(b.forwardKey) : null) ?? b.route
}

/** First loaded brick with a Sidebar panel whose module is among `modules` (a nav section's modules). */
export function sidebarBrickForModules(modules: Set<string>): BrickDef | undefined {
  return bricks.find((b) => b.Sidebar && b.module && modules.has(b.module))
}

/** All loaded bricks that ship a topbar widget (rendered next to the language switcher). */
export function headerBricks(): BrickDef[] {
  return bricks.filter((b) => b.Header)
}

/** All loaded bricks that ship a global overlay (rendered once at the shell root). */
export function overlayBricks(): BrickDef[] {
  return bricks.filter((b) => b.Overlay)
}

/** All loaded bricks that contribute an Other Config section. */
export function otherConfigSectionBricks(): BrickDef[] {
  return bricks.filter((b) => b.OtherConfigSection)
}

/**
 * Is a given Melis module active? Detected via the presence of its React brick
 * in the /react-modules list (a module is listed *only* when it is active).
 *
 * Lets a NATIVE page conditionally render UI contributed by an optional module —
 * e.g. the « Rôle » filter/column of the Users tool, which is brought by
 * MelisSmallBusiness and must not appear when that module is off.
 *
 * Reads the dedicated `activeModules` set (refreshed on navigation via
 * {@link refreshActiveModules}), not `bricks` — so it stays correct even after a
 * module is toggled mid-session, without a full reload.
 *
 * ⚠️ Reliable only for modules that ship a brick (`brick.manifest.json`). For a
 * module without a brick, a different backend signal would be needed.
 */
export function isModuleActive(moduleName: string): boolean {
  return activeModules.has(moduleName)
}

/**
 * Reactive variant of {@link isModuleActive}: re-renders the caller whenever the
 * active-modules set changes (initial load, or a refresh after a module toggle).
 */
export function useModuleActive(moduleName: string): boolean {
  const [, force] = useReducer((x: number) => x + 1, 0)
  useEffect(() => {
    activeModuleListeners.add(force)
    return () => {
      activeModuleListeners.delete(force)
    }
  }, [])
  return activeModules.has(moduleName)
}

/**
 * Fetches the manifest of active bricks and registers their routes — WITHOUT loading any bundle.
 * Each brick's IIFE is downloaded lazily, only when its route is first visited (React.lazy +
 * Suspense). This avoids pulling down several MB of JS at boot when the user may never visit
 * most brick pages (a 10-module instance was downloading ~2 MB eagerly on every page load).
 *
 * Trade-off: Sidebar and Header components (e.g. the Messenger bell) are part of the IIFE, so
 * they are unavailable until the user visits the brick's route for the first time; they then
 * appear via notify(). If a Header must be visible from boot, mark the bundle "eager" in its
 * manifest and handle it here — that optimisation is deferred until needed.
 *
 * Idempotent: a second call while loading/loaded is a no-op (use `resetBricks` to force a
 * re-fetch, e.g. after logout/login).
 */
export async function loadBricks(): Promise<void> {
  if (status !== 'idle') return
  status = 'loading'
  try {
    const list = await melisApi.fetchReactModules()
    setActiveModules(list.map((m) => m.module))
    const next: BrickDef[] = []

    for (const m of list) {
      if (!m.bundleUrl) continue

      // Register the menu→route mapping immediately so useNavMenu can resolve legacy menu
      // entries to React routes even before the brick bundle is downloaded.
      if (m.forwardKey && m.route) BRICK_ROUTES[m.forwardKey] = m.route

      const bundleUrl = m.bundleUrl
      const brickId   = m.id

      // React.lazy: the IIFE is fetched only on the first render of this route.
      // The Suspense boundary already in App.tsx shows PageLoader while it loads.
      // On error we return a no-op component rather than letting the promise reject
      // (which would propagate to the nearest error boundary and crash the shell).
      const LazyComponent = lazy(async (): Promise<{ default: ComponentType }> => {
        await loadScript(bundleUrl).catch(() => {})
        const reg = componentRegistry()[brickId]
        const C   = reg?.Component

        if (!C) {
          // Bundle loaded but registered no Component (build error, Sidebar/Header-only, or
          // failed script). Remove this brick from the route table so the catch-all ZonePage
          // can handle the URL via its melisKey — same behaviour as the old eager loader which
          // excluded non-registering bricks from bricks[] entirely.
          const idx = bricks.findIndex((b) => b.id === brickId)
          if (idx >= 0) {
            bricks.splice(idx, 1)
            if (m.forwardKey) delete BRICK_ROUTES[m.forwardKey]
            // Sidebar/Header/Overlay still valid without a Component page (e.g. Messenger bell,
            // MelisAI assistant).
            if (reg?.Sidebar || reg?.Header || reg?.Overlay || reg?.OtherConfigSection) {
              bricks.push({
                id: m.id, module: m.module, route: '', label: m.label,
                forwardKey: m.forwardKey, melisKey: m.melisKey, subTabs: m.subTabs ?? false,
                persistent: m.persistent ?? false,
                Component: undefined, Sidebar: reg.Sidebar, Header: reg.Header, Overlay: reg.Overlay,
                OtherConfigSection: reg.OtherConfigSection,
              })
            }
            notify()
          }
          return { default: (() => null) as unknown as ComponentType }
        }

        // Bundle may also export Sidebar / Header / Overlay — patch the BrickDef in-place so
        // sidebarBrickForModules() / headerBricks() / overlayBricks() see them next render.
        const def = bricks.find((b) => b.id === brickId)
        if (def && reg) {
          def.Sidebar = reg.Sidebar
          def.Header  = reg.Header
          def.Overlay = reg.Overlay
          def.OtherConfigSection = reg.OtherConfigSection
          notify()
        }
        return { default: C }
      })

      next.push({
        id:         m.id,
        module:     m.module,
        route:      m.route ?? '',
        label:      m.label,
        forwardKey: m.forwardKey,
        melisKey:   m.melisKey,
        subTabs:    m.subTabs ?? false,
        persistent: m.persistent ?? false,
        Component:  LazyComponent,
        // Sidebar, Header and Overlay are unknown until the bundle executes — set lazily above.
        Sidebar:    undefined,
        Header:     undefined,
        Overlay:    undefined,
        OtherConfigSection: undefined,
      })
    }
    bricks = next

    // Background-prefetch: load all bundles in parallel so Sidebar/Header/Overlay components
    // register early (e.g. the CMS page-tree Sidebar, the Messenger bell, the MelisAI
    // assistant — all need to appear from boot, not only after the user first visits the
    // brick's route).
    // Non-blocking: the loop fires-and-forgets; React.lazy benefits from the cache.
    //
    // ⚡ PRIORITÉ aux briques « widget-only » (route ET forwardKey nuls) : leur SEULE raison d'être
    // est un widget visible au boot (ex. la cloche Messenger). On appende leur <script> EN PREMIER
    // pour qu'elles arrivent avant les bundles de pages (que l'utilisateur n'ouvrira peut-être
    // jamais) dans la file — utile car le service PHP sérialise les requêtes sur le verrou de session.
    // ⚠️ Trier ne suffisait PAS : appender les ~50 <script> dans le MÊME tour de boucle les lance
    // tous en parallèle, et les bundles sont servis par PHP (MelisAssetManager) qui SÉRIALISE sur le
    // verrou de session. La cloche Messenger arrivait donc bonne dernière — mesuré sur dev6 :
    // widget visible à t+21 s après le chargement de la page. On charge donc les briques
    // « widget-only » D'ABORD, puis on attend qu'elles soient là avant de lancer les bundles de
    // pages (que l'utilisateur n'ouvrira peut-être jamais).
    const load = (m: (typeof list)[number]) => {
      const bundleUrl = m.bundleUrl
      const brickId   = m.id
      if (!bundleUrl) return Promise.resolve()
      return loadScript(bundleUrl)
        .then(() => {
          const reg = componentRegistry()[brickId]
          const def = bricks.find((b) => b.id === brickId)
          if (def && reg) {
            def.Sidebar = reg.Sidebar
            def.Header  = reg.Header
            def.Overlay = reg.Overlay
            def.OtherConfigSection = reg.OtherConfigSection
            if (reg.Sidebar || reg.Header || reg.Overlay || reg.OtherConfigSection) notify()
          }
        })
        .catch(() => {})
    }

    const isWidgetOnly = (m: (typeof list)[number]) => !m.route && !m.forwardKey
    const widgetOnly   = list.filter((m) => m.bundleUrl && isWidgetOnly(m))
    const pages        = list.filter((m) => m.bundleUrl && !isWidgetOnly(m))

    // Une fois les widgets chargés, on NE LANCE PAS les bundles de pages tout de suite : les widgets
    // viennent de se monter et déclenchent leurs PROPRES appels de données (ex. le compteur de
    // messages non lus de la cloche). Ces appels passent par PHP, qui sérialise sur le verrou de
    // session — lancés en même temps que ~50 bundles de pages, ils repassaient bons derniers et la
    // pastille rouge n'apparaissait que plusieurs secondes après l'icône. On attend donc que le
    // navigateur soit inactif (les fetch des widgets sont partis) avant d'amorcer la 2ᵉ vague ; ces
    // bundles servent des outils que l'utilisateur n'ouvrira peut-être jamais, les différer est sans
    // conséquence visible.
    const startPages = () => pages.forEach((m) => void load(m))
    const deferPages = () => {
      const ric = (window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void
      }).requestIdleCallback
      if (typeof ric === 'function') ric(startPages, { timeout: 2000 })
      else window.setTimeout(startPages, 1200)
    }

    // Non bloquant pour loadBricks() : on n'attend pas cette chaîne (le shell doit se rendre tout
    // de suite), on ordonne juste les deux vagues entre elles.
    void Promise.all(widgetOnly.map(load)).then(deferPages)
  } catch {
    /* leave bricks empty on error */
  } finally {
    status = 'done'
    notify()
  }
}

/** Resets the loader so the next `loadBricks()` re-fetches (e.g. after logout/login). */
export function resetBricks(): void {
  bricks = []
  for (const k of Object.keys(BRICK_ROUTES)) delete BRICK_ROUTES[k]
  status = 'idle'
  setActiveModules([])
  notify()
}

/** Subscribe to brick-list changes; returns the current bricks and re-renders on update. */
export function useBricks(): BrickDef[] {
  const [, force] = useReducer((x: number) => x + 1, 0)
  useEffect(() => {
    listeners.add(force)
    return () => {
      listeners.delete(force)
    }
  }, [])
  return bricks
}

/**
 * Has the brick list been fetched? False during the cold load — a moment where a deep-linked
 * tool URL (/[section]/[tool]/:id) cannot yet be recognised as belonging to a `subTabs` brick.
 * Callers must WAIT for this (see TabBridge) instead of treating the URL as an unknown route:
 * the menu (/menu) and the brick list (/react-modules) are two independent fetches, and when the
 * menu won the race a refreshed sub-tab spawned a stray top tab labelled with the raw id ("4").
 */
export function bricksReady(): boolean {
  return status === 'done'
}

/**
 * Version counter of the brick registry — bumped on every change (load, lazy component
 * registration, reset). Unlike {@link useBricks}, it changes even when the list ends up EMPTY
 * (error / no brick), so an effect depending on it still re-runs once loading is over.
 */
export function useBricksVersion(): number {
  const [, force] = useReducer((x: number) => x + 1, 0)
  useEffect(() => {
    listeners.add(force)
    return () => {
      listeners.delete(force)
    }
  }, [])
  return version
}
