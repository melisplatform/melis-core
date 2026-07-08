import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { SubTabBar } from './SubTabBar'
import { ToolTabBar } from './ToolTabBar'
import { Notifications } from '@/components/Notifications'
import { AiAssistant } from '@/components/AiAssistant'
import { ZonePoolProvider } from '@/components/zone/zone-pool'
import { ZoneFrames } from '@/components/zone/ZoneFrames'
import { SubTabProvider, SubTabWindowBridge } from '@/components/tabs/sub-tab-store'
import { ToolTabBridgeProvider } from '@/components/tabs/tool-tab-bridge'
import { useBricks, brickRoute, refreshActiveModules } from '@/lib/bricks'
import { loadReactTheme } from '@/lib/react-theme'
import { PERSISTENT_MODULES } from '@/lib/module-registry'
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary'
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

  // Charge le thème du BO React (logo d'en-tête configurable) une fois, après login.
  useEffect(() => { loadReactTheme() }, [])

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
      <SubTabWindowBridge />
      <Notifications />
      {/* Global AI assistant: floating chat + shell-side closed-loop navigation handlers. */}
      <AiAssistant />
      <Sidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleSidebar={() => setCollapsed((c) => !c)} />
        <SubTabBar />
        <ToolTabBar />

        <main className="relative flex-1 overflow-hidden">
          {/* Dashboard — toujours monté pour éviter tout rechargement au retour sur l'onglet. */}
          <div className={cn('h-full overflow-y-auto', !isDashboard && 'hidden')}>
            <ToolErrorBoundary label="Dashboard">
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            </ToolErrorBoundary>
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
                  <ToolErrorBoundary label={m.label}>
                    <Suspense fallback={<PageLoader />}>
                      <List />
                    </Suspense>
                  </ToolErrorBoundary>
                )}
              </div>
            )
          })}

          {/* Briques React. Par défaut montées UNIQUEMENT quand actives : une brique montée mais
              inactive lit le `location`/`useParams` GLOBAL et peut déclencher des effets de navigation
              (ex. MelisCommerce ProductPage : fetch d'un "id" issu d'une route étrangère →
              `.catch(navigate(base))`), ce qui détourne la navigation d'un AUTRE outil.
              Une brique `persistent` (manifest) choisit de rester MONTÉE (cachée) au changement d'onglet
              pour que son état/liste survive au lieu de se recharger — elle DOIT accepter le prop `active`
              et geler sa lecture du route quand inactive (cf. CmsStylePage), sinon elle rejouerait ce
              détournement. `visitedBricks` garde le lazy-init (pas de fetch avant la 1re visite) ; les
              iframes legacy survivent car montées dans document.body, hors de l'arbre React. */}
          {bricks.filter((b) => b.Component).map((b) => {
            const Brick = b.Component! as ComponentType<{ active?: boolean }>
            const isActive = activeBrick?.id === b.id
            // Persistante : reste montée dès qu'elle a été visitée. Non persistante : montée ssi active.
            const mounted = visitedBricks.has(b.id) && (isActive || b.persistent)
            return (
              <div key={b.id} className={cn('h-full overflow-y-auto', !isActive && 'hidden')}>
                {mounted && (
                  <ToolErrorBoundary label={b.label}>
                    <Suspense fallback={<PageLoader />}>
                      <Brick active={isActive} />
                    </Suspense>
                  </ToolErrorBoundary>
                )}
              </div>
            )
          })}

          {/* Outlet : zone tools (ZonePage) et formulaires — contenu éphémère ou trivial à remonter. */}
          <div className={cn('h-full overflow-y-auto', (activePersistent || activeBrick || isDashboard) && 'hidden')}>
            <ToolErrorBoundary label={activePersistent?.label ?? activeBrick?.label}>
              <Outlet />
            </ToolErrorBoundary>
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
