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
import { useEffect, useReducer, type ComponentType } from 'react'

import * as melisApi from '@/lib/melis-api'

export interface BrickDef {
  id: string
  /** Owning Melis module (e.g. "MelisCms") — used to attach a sidebar panel to its nav section. */
  module: string
  route: string
  label: string
  forwardKey: string | null
  melisKey: string | null
  /** Routed page rendered in the content area (optional). */
  Component?: ComponentType
  /** Left-sidebar panel rendered under the module's nav section (optional). */
  Sidebar?: ComponentType
}

/** `Module/Controller` → React route, fed to the menu so legacy entries link to bricks. */
export const BRICK_ROUTES: Record<string, string> = {}

let bricks: BrickDef[] = []
let status: 'idle' | 'loading' | 'done' = 'idle'
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

/** Where brick bundles self-register their components, keyed by brick id. */
type RegisteredBrick = { Component?: ComponentType; Sidebar?: ComponentType }
function componentRegistry(): Record<string, RegisteredBrick> {
  const w = window as unknown as { __MELIS_BRICK_COMPONENTS__?: Record<string, RegisteredBrick> }
  return (w.__MELIS_BRICK_COMPONENTS__ ??= {})
}

const loadedScripts = new Set<string>()

function loadScript(url: string): Promise<void> {
  if (loadedScripts.has(url)) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = url
    el.async = true
    el.onload = () => {
      loadedScripts.add(url)
      resolve()
    }
    el.onerror = () => reject(new Error(`Failed to load brick bundle: ${url}`))
    document.head.appendChild(el)
  })
}

export function getBricks(): BrickDef[] {
  return bricks
}

/** First loaded brick with a Sidebar panel whose module is among `modules` (a nav section's modules). */
export function sidebarBrickForModules(modules: Set<string>): BrickDef | undefined {
  return bricks.find((b) => b.Sidebar && b.module && modules.has(b.module))
}

/**
 * Fetches the active modules' bricks and loads their bundles. Idempotent:
 * a second call while loading/loaded is a no-op (use `resetBricks` to force a reload
 * after a session change).
 */
export async function loadBricks(): Promise<void> {
  if (status !== 'idle') return
  status = 'loading'
  try {
    const list = await melisApi.fetchReactModules()
    const registry = componentRegistry()

    for (const m of list) {
      if (!m.bundleUrl) continue
      try {
        await loadScript(m.bundleUrl)
      } catch {
        /* skip a brick that fails to load; the rest still work */
      }
    }

    const next: BrickDef[] = []
    for (const m of list) {
      const reg = registry[m.id]
      const Component = reg?.Component
      const Sidebar = reg?.Sidebar
      if (!Component && !Sidebar) continue
      // Only routed bricks map a menu entry to a React route.
      if (m.forwardKey && m.route && Component) BRICK_ROUTES[m.forwardKey] = m.route
      next.push({
        id: m.id,
        module: m.module,
        route: m.route ?? '',
        label: m.label,
        forwardKey: m.forwardKey,
        melisKey: m.melisKey,
        Component,
        Sidebar,
      })
    }
    bricks = next
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
