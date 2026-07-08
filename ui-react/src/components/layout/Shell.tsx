import { lazy, Suspense, useEffect, useRef, useState, type ComponentType } from 'react'
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  UNSAFE_RouteContext as RouteContext,
  type Location,
} from 'react-router-dom'
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
import { useBricks, brickRoute, refreshActiveModules, type BrickDef } from '@/lib/bricks'
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

/**
 * Rend UNE brique React dans la zone de contenu.
 *
 * Deux modes, selon le flag `persistent` du manifeste :
 *
 * • `persistent: false` (défaut) — la brique n'est montée que lorsqu'elle est ACTIVE. Simple, mais
 *   chaque changement d'onglet outil détruit son sous-arbre : refetch, filtres perdus, iframe legacy
 *   rechargée. C'est le comportement historique, conservé pour toutes les briques non migrées.
 *
 * • `persistent: true` — montée à la 1re visite, JAMAIS démontée (juste cachée en CSS). Son état,
 *   ses données et son iframe legacy in-tree survivent aux navigations (`display:none` ne recharge
 *   pas une iframe ; seuls le démontage / re-parentage le font).
 *
 * Pourquoi une brique montée-mais-inactive était dangereuse (et pourquoi ça ne l'est plus) :
 * react-router partage UNE SEULE référence d'objet `params` entre tous les matchs d'une branche
 * (`matchRouteBranch`), et `useParams()` lit `matches[matches.length - 1].params`. Le match de la
 * route layout `<Route element={<Shell/>}>` porte donc le `:id` de la route la plus profonde →
 * TOUTE brique rendue dans Shell voyait le `:id` de l'outil actif, même étranger (MelisCommerce
 * ProductPage fetchait l'`id` du formulaire Users puis `navigate(base)` → navigation détournée).
 *
 * On isole donc chaque brique persistante dans son PROPRE contexte de routage :
 *  1. `RouteContext` remis à `matches: []` → `parentParams` vide (`useRoutes` les fusionne sinon),
 *     `parentPathnameBase` = '/' (et le warning « descendant <Routes> » disparaît) ;
 *  2. `<Routes location={scopedLoc}>` → surcharge `LocationContext` et refait le matching sur la
 *     route de la brique uniquement. `useParams()`/`useLocation()` ne voient plus que la sienne.
 * `NavigationContext` n'est PAS touché : `useNavigate()` pilote toujours l'historique réel.
 *
 * `scopedLoc` = la dernière location globale pendant que la brique était active (donc figée quand
 * elle est cachée : elle reste exactement dans l'état où l'utilisateur l'a laissée).
 *
 * Les `<Route>` frères rendent le MÊME type de composant à la même position : passer de `/cron` à
 * `/cron/history` ne remonte donc pas la brique. Le splat final n'est qu'un filet de sécurité pour
 * une éventuelle sous-route plus profonde (le classement de react-router donne la priorité à
 * `/:id` sur `/*`, donc `useParams().id` reste renseigné) : sans lui, la brique serait active côté
 * Shell mais ne matcherait aucune route ici → écran blanc.
 *
 * La brique reçoit EN PLUS un prop `active` : le scoping ci-dessus rend le gel manuel du route
 * inutile, mais certaines briques s'en servent déjà (cf. CmsStylePage, CmsPage) et une brique qui
 * lirait un signal GLOBAL (hors router) en a toujours besoin. Ceinture et bretelles.
 *
 * ⚠️ `UNSAFE_RouteContext` est une API interne de react-router (épinglé 7.17.0 dans package.json).
 * Une montée de version majeure doit revérifier ce scoping.
 */
function BrickHost({ brick, isActive, visited }: { brick: BrickDef; isActive: boolean; visited: boolean }) {
  const location = useLocation()
  const Brick = brick.Component! as ComponentType<{ active?: boolean }>
  const route = brickRoute(brick)

  // Dernière location appartenant à cette brique (figée quand elle est cachée).
  const scopedRef = useRef<Location | null>(null)
  if (isActive) scopedRef.current = location
  const scopedLoc: Location =
    scopedRef.current ?? { pathname: route, search: '', hash: '', state: null, key: 'default' }

  const mounted = brick.persistent ? visited : isActive && visited

  const el = <Brick active={isActive} />
  const body = brick.persistent && route
    ? (
      <RouteContext.Provider value={{ outlet: null, matches: [], isDataRoute: false }}>
        <Routes location={scopedLoc}>
          <Route path={route} element={el} />
          <Route path={`${route}/:id`} element={el} />
          <Route path={`${route}/*`} element={el} />
        </Routes>
      </RouteContext.Provider>
    )
    : el

  return (
    <div className={cn('h-full overflow-y-auto', !isActive && 'hidden')}>
      {mounted && (
        <ToolErrorBoundary label={brick.label}>
          <Suspense fallback={<PageLoader />}>{body}</Suspense>
        </ToolErrorBoundary>
      )}
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

  // Lazy-init briques : même pattern que visitedModules. Une brique n'est montée (et ne fetche)
  // qu'à la 1re visite ; les briques `persistent` restent ensuite en DOM (cf. BrickHost).
  // Supprimée de l'ensemble quand l'onglet est fermé → remontage frais à la réouverture.
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

          {/* Briques React — `visitedBricks` garde le lazy-init (pas de fetch avant la 1re visite).
              Une brique `persistent` reste ensuite montée (cachée en CSS), isolée dans son propre
              contexte de routage ; les autres ne sont montées que lorsqu'elles sont actives.
              Tout est expliqué au-dessus de BrickHost. */}
          {bricks.filter((b) => b.Component).map((b) => (
            <BrickHost
              key={b.id}
              brick={b}
              isActive={activeBrick?.id === b.id}
              visited={visitedBricks.has(b.id)}
            />
          ))}

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
