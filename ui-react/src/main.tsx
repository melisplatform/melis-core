import { StrictMode, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'

// Shared singletons for module React bricks (see lib/bricks.ts). Brick bundles are
// built with react / react-dom / react-router-dom as externals mapped to these
// globals, so they reuse the host's React instance (hooks, context, Router all work).
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactJsxRuntime from 'react/jsx-runtime'
import * as ReactRouterDOM from 'react-router-dom'
import * as XLSX from 'xlsx'

import './index.css'
import App from './App.tsx'
import { isModuleActive } from '@/lib/bricks'

const w = window as unknown as {
  MelisReact?: unknown
  MelisReactDOM?: unknown
  MelisReactJsxRuntime?: unknown
  MelisReactRouterDOM?: unknown
  MelisXLSX?: unknown
  __MELIS_BRICK_COMPONENTS__?: Record<string, { Component?: ComponentType; Sidebar?: ComponentType; Header?: ComponentType }>
  __melisRegisterBrick?: (b: { id: string; Component?: ComponentType; Sidebar?: ComponentType; Header?: ComponentType }) => void
  /** Exposed for brick IIFE bundles that cannot import from the host. */
  __melisIsModuleActive?: (id: string) => boolean
}
w.MelisReact = React
w.MelisReactDOM = ReactDOM
w.MelisReactJsxRuntime = ReactJsxRuntime
w.MelisReactRouterDOM = ReactRouterDOM
// Exposé pour les briques de module : elles réutilisent l'instance XLSX de l'hôte
// (export Excel/CSV identique à l'outil de référence) sans la rebundler.
w.MelisXLSX = XLSX
w.__MELIS_BRICK_COMPONENTS__ = w.__MELIS_BRICK_COMPONENTS__ ?? {}
w.__melisIsModuleActive = isModuleActive
w.__melisRegisterBrick = (b) => {
  // A brick may register a routed page (Component), a left-sidebar panel (Sidebar) and/or a
  // topbar widget (Header, e.g. the messenger notification icon) — all optional, all modular.
  if (b && b.id) w.__MELIS_BRICK_COMPONENTS__![b.id] = { Component: b.Component, Sidebar: b.Sidebar, Header: b.Header }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
