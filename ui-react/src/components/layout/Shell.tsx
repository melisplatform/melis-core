import { lazy, Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { SubTabBar } from './SubTabBar'
import { ToolTabBar } from './ToolTabBar'
import { Notifications } from '@/components/Notifications'
import { ZonePoolProvider } from '@/components/zone/zone-pool'
import { ZoneFrames } from '@/components/zone/ZoneFrames'
import { SubTabProvider } from '@/components/tabs/sub-tab-store'
import { ToolTabBridgeProvider } from '@/components/tabs/tool-tab-bridge'
import { useBricks, brickRoute, refreshActiveModules } from '@/lib/bricks'
import { PERSISTENT_MODULES } from '@/lib/module-registry'
import { melisKeyForRoute, routeForForward, useToolRoutesVersion } from '@/lib/tool-routes'

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  )
}

function ShellInner() {
  // Start collapsed on narrow viewports; auto-collapse again if window shrinks below 768px.
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024)
  useEffect(() => {
    const onResize = () => { if (window.innerWidth < 768) setCollapsed(true) }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const location = useLocation()
  const bricks = useBricks()
  useToolRoutesVersion() // re-resolve the active zone once the tool-routes registry populates

  // Re-check which modules are active on each navigation (cheap no-store JSON), so a
  // module toggled in the Modules tool is reflected when the user reopens a gated tool
  // (e.g. the Users « Rôle » filter/column) — no full page reload needed. See refreshActiveModules.
  useEffect(() => {
    refreshActiveModules()
  }, [location.pathname])

  // When a tab is closed, destroy the persistent iframe of a brick tool (singleton kept in
  // <body> as #melis-brick-frame-<id> to avoid reload on tab switch) — so reopening reloads it
  // fresh instead of restoring its previous state (open sub-tabs, etc.).
  useEffect(() => {
    const onClosed = (e: Event) => {
      const path = (e as CustomEvent<{ path?: string }>).detail?.path ?? ''
      const brick = bricks.find((b) => {
        const r = brickRoute(b)
        return r && (path === r || path.startsWith(r + '/'))
      })
      if (brick) document.getElementById('melis-brick-frame-' + brick.id)?.remove()
    }
    window.addEventListener('melis:tab-closed', onClosed)
    return () => window.removeEventListener('melis:tab-closed', onClosed)
  }, [bricks])

  // Active iframe-tool key from the tree-derived route /[section]/[tool] (resolved via registry).
  const activeZoneKey = melisKeyForRoute(location.pathname)

  // Dashboard is always mounted so switching tabs never triggers a refetch.
  const isDashboard = location.pathname === '/'

  // Modules persistants : liste montée en permanence pour ne jamais détruire
  // leur iframe Melis (toggle New/Old). Active quand on est sur leur route d'arbre dérivée.
  const activePersistent = PERSISTENT_MODULES.find((m) => location.pathname === routeForForward(m.forwardKey))

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Notifications />
      <Sidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleSidebar={() => setCollapsed((c) => !c)} />
        <SubTabBar />
        <ToolTabBar />

        <main className="relative flex-1 overflow-hidden">
          {/* Dashboard — toujours monté pour éviter tout rechargement au retour sur l'onglet. */}
          <div className={cn('h-full overflow-y-auto', !isDashboard && 'hidden')}>
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          </div>

          {/* Listes persistantes — toujours dans le DOM, cachées hors de leur route */}
          {PERSISTENT_MODULES.map((m) => {
            const List = m.list
            return (
              <div
                key={m.id}
                className={cn('h-full overflow-y-auto', activePersistent?.id !== m.id && 'hidden')}
              >
                <Suspense fallback={<PageLoader />}>
                  <List />
                </Suspense>
              </div>
            )
          })}

          {/* Toutes les autres pages via Outlet (formulaires, briques, zone…) */}
          <div className={cn('h-full overflow-y-auto', (activePersistent || isDashboard) && 'hidden')}>
            <Outlet />
          </div>

          {/* Pool d'iframes Melis zone — toujours monté, jamais détruit. */}
          <ZoneFrames activeKey={activeZoneKey} />
        </main>
      </div>
    </div>
  )
}

export function Shell() {
  return (
    <ZonePoolProvider>
      <SubTabProvider>
        <ToolTabBridgeProvider>
          <ShellInner />
        </ToolTabBridgeProvider>
      </SubTabProvider>
    </ZonePoolProvider>
  )
}
