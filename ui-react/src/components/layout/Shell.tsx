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

  // When a tab is closed: destroy any brick frame singleton AND remove the brick from
  // visitedBricks so reopening it mounts fresh (not hidden-but-stale).
  useEffect(() => {
    const onClosed = (e: Event) => {
      const path = (e as CustomEvent<{ path?: string }>).detail?.path ?? ''
      const brick = bricks.find((b) => {
        const r = brickRoute(b)
        return r && (path === r || path.startsWith(r + '/'))
      })
      if (brick) {
        document.getElementById('melis-brick-frame-' + brick.id)?.remove()
        setVisitedBricks((prev) => {
          if (!prev.has(brick.id)) return prev
          const next = new Set(prev)
          next.delete(brick.id)
          return next
        })
      }
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

  // Lazy-init : un module persistant n'est monté (et ne fetche) qu'à la première visite.
  // Ensuite il reste en DOM (hidden) pour que son iframe survive aux navigations.
  const [visitedModules, setVisitedModules] = useState<Set<string>>(new Set())
  const activePersistentId = activePersistent?.id
  useEffect(() => {
    if (activePersistentId) {
      setVisitedModules((prev) => {
        if (prev.has(activePersistentId)) return prev
        return new Set([...prev, activePersistentId])
      })
    }
  }, [activePersistentId])

  // Brique active : brique React dont la route correspond à l'URL courante.
  const activeBrick = bricks.find((b) => {
    if (!b.Component) return false
    const r = brickRoute(b)
    return r && (location.pathname === r || location.pathname.startsWith(r + '/'))
  })

  // Lazy-init briques : même pattern que visitedModules. Monté à la 1re visite,
  // gardé en DOM. Supprimé de l'ensemble quand l'onglet est fermé (fresh reload).
  const [visitedBricks, setVisitedBricks] = useState<Set<string>>(new Set())
  const activeBrickId = activeBrick?.id
  useEffect(() => {
    if (activeBrickId) {
      setVisitedBricks((prev) => {
        if (prev.has(activeBrickId)) return prev
        return new Set([...prev, activeBrickId])
      })
    }
  }, [activeBrickId])

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

          {/* Listes persistantes — montées à la 1re visite, puis gardées en DOM (hidden).
              Jamais montées au boot : évite de fetcher des données pour des outils non visités. */}
          {PERSISTENT_MODULES.map((m) => {
            const List = m.list
            return (
              <div
                key={m.id}
                className={cn('h-full overflow-y-auto', activePersistent?.id !== m.id && 'hidden')}
              >
                {visitedModules.has(m.id) && (
                  <Suspense fallback={<PageLoader />}>
                    <List />
                  </Suspense>
                )}
              </div>
            )
          })}

          {/* Briques React — montées à la 1re visite, gardées en DOM (hidden).
              Rendues hors Outlet pour éviter le démontage/remontage (et donc le refetch)
              lors des switch d'onglets. Voir aussi App.tsx : leurs routes ont element={null}. */}
          {bricks.filter((b) => b.Component).map((b) => {
            const Brick = b.Component!
            return (
              <div
                key={b.id}
                className={cn('h-full overflow-y-auto', activeBrick?.id !== b.id && 'hidden')}
              >
                {visitedBricks.has(b.id) && (
                  <Suspense fallback={<PageLoader />}>
                    <Brick />
                  </Suspense>
                )}
              </div>
            )
          })}

          {/* Outlet : zone tools (ZonePage) et formulaires — contenu éphémère ou trivial à remonter. */}
          <div className={cn('h-full overflow-y-auto', (activePersistent || activeBrick || isDashboard) && 'hidden')}>
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
