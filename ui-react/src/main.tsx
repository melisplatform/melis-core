import { StrictMode, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'

// Shared singletons for module React bricks (see lib/bricks.ts). Brick bundles are
// built with react / react-dom / react-router-dom as externals mapped to these
// globals, so they reuse the host's React instance (hooks, context, Router all work).
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactJsxRuntime from 'react/jsx-runtime'
import * as ReactRouterDOM from 'react-router-dom'

import './index.css'
import App from './App.tsx'

const w = window as unknown as {
  MelisReact?: unknown
  MelisReactDOM?: unknown
  MelisReactJsxRuntime?: unknown
  MelisReactRouterDOM?: unknown
  __MELIS_BRICK_COMPONENTS__?: Record<string, { Component?: ComponentType; Sidebar?: ComponentType }>
  __melisRegisterBrick?: (b: { id: string; Component?: ComponentType; Sidebar?: ComponentType }) => void
}
w.MelisReact = React
w.MelisReactDOM = ReactDOM
w.MelisReactJsxRuntime = ReactJsxRuntime
w.MelisReactRouterDOM = ReactRouterDOM
w.__MELIS_BRICK_COMPONENTS__ = w.__MELIS_BRICK_COMPONENTS__ ?? {}
w.__melisRegisterBrick = (b) => {
  // A brick may register a routed page (Component) and/or a left-sidebar panel (Sidebar).
  if (b && b.id) w.__MELIS_BRICK_COMPONENTS__![b.id] = { Component: b.Component, Sidebar: b.Sidebar }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
