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
import { useCaps, type CapsApi } from '@/lib/caps'
import { prefetchDashboard } from '@/lib/dashboard-prefetch'

const w = window as unknown as {
  MelisReact?: unknown
  MelisReactDOM?: unknown
  MelisReactJsxRuntime?: unknown
  MelisReactRouterDOM?: unknown
  MelisXLSX?: unknown
  __MELIS_BRICK_COMPONENTS__?: Record<string, { Component?: ComponentType; Sidebar?: ComponentType; Header?: ComponentType; Overlay?: ComponentType }>
  __melisRegisterBrick?: (b: { id: string; Component?: ComponentType; Sidebar?: ComponentType; Header?: ComponentType; Overlay?: ComponentType }) => void
  /** Exposed for brick IIFE bundles that cannot import from the host. */
  __melisIsModuleActive?: (id: string) => boolean
  /** Vérification CENTRALE des droits (capacités actions/onglets) — cf. lib/caps.ts. Les briques
   *  l'utilisent au lieu de réimplémenter : un module déclare son react.capabilities.php + appelle can(). */
  __melisUseCaps?: (melisKey: string) => CapsApi
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
w.__melisUseCaps = useCaps
w.__melisRegisterBrick = (b) => {
  // A brick may register a routed page (Component), a left-sidebar panel (Sidebar), a topbar
  // widget (Header, e.g. the messenger notification icon) and/or a global overlay (Overlay,
  // e.g. the MelisAI floating assistant) — all optional, all modular.
  if (b && b.id) w.__MELIS_BRICK_COMPONENTS__![b.id] = { Component: b.Component, Sidebar: b.Sidebar, Header: b.Header, Overlay: b.Overlay }
}

// Boot du dashboard EN PARALLÈLE de /me et /menu : quand on atterrit sur le dashboard, on lance dès
// maintenant ses 4 requêtes de données ET le téléchargement de son chunk lazy — sans attendre le tick
// de montage. Le composant consomme ensuite les promesses préchargées (cf. dashboard-prefetch).
// Gardé au chemin dashboard (base `/melis-react` en prod, `/` en dev) pour ne rien tirer ailleurs.
{
  const p = window.location.pathname.replace(/\/+$/, '')
  if (p === '' || p === '/melis-react') {
    void prefetchDashboard()
    void import('@/pages/DashboardPage')
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
