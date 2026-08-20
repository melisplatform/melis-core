import { Suspense, useEffect, useRef, useState, type ComponentType } from 'react'
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
import { AiNavActionsBridge } from '@/components/AiNavActionsBridge'
import { ZonePoolProvider } from '@/components/zone/zone-pool'
import { ZoneFrames } from '@/components/zone/ZoneFrames'
import { SubTabProvider, SubTabWindowBridge } from '@/components/tabs/sub-tab-store'
import { ToolTabBridgeProvider } from '@/components/tabs/tool-tab-bridge'
import { useBricks, brickRoute, refreshActiveModules, overlayBricks, type BrickDef } from '@/lib/bricks'
import { loadReactTheme } from '@/lib/react-theme'
import { startTinyMceMobileFrameSync } from '@/lib/tinymce-mobile-frames'
import { PERSISTENT_MODULES } from '@/lib/module-registry'
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary'
import { useTabs } from '@/components/tabs/tab-store'
import { melisKeyForRoute, labelForRoute, routeForForward, useToolRoutesVersion } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import { lazyRetry } from '@/lib/lazy-retry'
import { applyOverlayRunway } from '@/lib/overlay-runway'

// Ticket 0010791 : le Dashboard était le SEUL page-chunk chargé en `lazy()` brut (les autres passent
// par `lazyRetry`). Après un déploiement, un onglet ouvert avant garde d'anciens hashs → le chunk
// `DashboardPage-xxxx.js` n'existe plus (404) → « The tool Dashboard encountered an error ».
// `lazyRetry` réessaie puis force UN reload complet (index.html frais) — comme les autres outils.
const DashboardPage = lazyRetry(() => import('@/pages/DashboardPage'), 'DashboardPage')

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

const MOBILE_BREAKPOINT = 1024

function ShellInner() {
  // Start collapsed on narrow viewports; auto-collapse again if window shrinks below the breakpoint.
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < MOBILE_BREAKPOINT)
  // Mobile (< 1024px) : header responsive (hamburger / logo / icônes + encoche onglets) et la sidebar
  // devient un DRAWER off-canvas plein écran (le rail étroit ne permet pas de déplier les sections).
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT)
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
      if (mobile) setCollapsed(true)
      else setMobileOpen(false) // quitter le mobile → refermer le drawer
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const { t } = useI18n()
  const location = useLocation()
  const bricks = useBricks()
  // Bricks contributing a global overlay (recomputed on every brick-list change via useBricks:
  // a bundle registers its Overlay only once its IIFE has executed).
  const overlays = overlayBricks()
  useToolRoutesVersion() // re-resolve the active zone once the tool-routes registry populates

  // Onglets ouverts (ref stable pour le listener de fermeture) : une brique MULTI-ONGLETS (ex.
  // éditeur de pages CMS : /melis-cms/page/:id — plusieurs onglets sur la MÊME route de brique) ne
  // doit PAS être démontée quand on ferme UN de ses onglets alors que d'autres restent ouverts.
  const { tabs } = useTabs()
  const tabsRef = useRef(tabs)
  tabsRef.current = tabs

  // Charge le thème du BO React (logo d'en-tête configurable) une fois, après login.
  useEffect(() => { loadReactTheme() }, [])

  // Piste basse réservée aux overlays flottants des modules (bouton de l'assistant MelisAI) —
  // posée ICI, sur le rendu global, pour TOUS les outils : aucun outil ni aucune brique n'a à s'en
  // occuper. Rejouée à chaque mutation du contenu (outil ouvert, brique montée tardivement,
  // sous-onglet) car la zone défilante n'est pas la même d'un outil à l'autre. Cf. overlay-runway.
  const mainRef = useRef<HTMLElement>(null)
  const hasOverlay = overlays.length > 0
  useEffect(() => {
    const run = () => applyOverlayRunway(mainRef.current, hasOverlay)
    run()
    let pending = false
    const observer = new MutationObserver(() => {
      // Une passe par frame au plus : les mutations arrivent en rafale au montage d'un outil, et
      // `applyOverlayRunway` lit des tailles (donc force un layout).
      if (pending) return
      pending = true
      requestAnimationFrame(() => { pending = false; run() })
    })
    if (mainRef.current) observer.observe(mainRef.current, { childList: true, subtree: true })
    window.addEventListener('resize', run, { passive: true })
    return () => { observer.disconnect(); window.removeEventListener('resize', run) }
  }, [hasOverlay, location.pathname])

  // Propage le patch responsive TinyMCE dans les iframes même origine (édition de page, outils
  // legacy) : leur `window` a son propre global `tinymce`, que le script du shell n'atteint pas.
  useEffect(() => { startTinyMceMobileFrameSync() }, [])

  // Mobile : TOUTE navigation referme le drawer — sinon le menu reste par-dessus la page qu'on
  // vient d'ouvrir. Les entrées de nav natives appellent déjà `onClose` (SidebarNavContext), mais
  // pas les panneaux fournis par les briques (arbre des pages CMS) : ce garde-fou côté hôte les
  // couvre tous, présents et à venir. (Ouvrir/fermer le drawer ne change pas l'URL → sans effet.)
  useEffect(() => {
    if (isMobile) setMobileOpen(false)
  }, [location.pathname, isMobile])

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
      const detail = (e as CustomEvent<{ path?: string; id?: string }>).detail ?? {}
      const path = detail.path ?? ''
      const brick = bricks.find((b) => {
        const r = brickRoute(b)
        return r && (path === r || path.startsWith(r + '/'))
      })
      if (brick) {
        const r = brickRoute(brick)!
        // Reste-t-il d'AUTRES onglets ouverts (hors celui fermé) appartenant à cette brique ? (le store
        // n'est pas encore rafraîchi quand l'évènement part → on exclut l'id fermé.) Si oui, NE PAS
        // démonter : sinon fermer un onglet de page CMS viderait tous les autres onglets de pages.
        const stillOpen = tabsRef.current.some((t) => t.id !== detail.id && (t.path === r || t.path.startsWith(r + '/')))
        if (stillOpen) return
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

  // Dashboard : monté à la 1re visite (comme les modules persistants), puis gardé en DOM
  // (hidden) pour ne jamais re-fetcher au retour sur l'onglet. Le monter EAGER au boot
  // chargeait ses plugins legacy en iframe (chacun tirant le bundle plateforme complet +
  // dessinant des charts jqplot dans un conteneur 0×0 caché → « Invalid dimensions for plot »),
  // ce qui saturait le thread principal et FIGEAIT le 1er outil ouvert quand on arrive
  // directement sur une URL ≠ '/' (ex. /melis-core/gdpr → spinner infini).
  const isDashboard = location.pathname === '/'
  // Initialisé à `isDashboard` : quand on ATTERRIT sur le dashboard, il est monté dès le 1ᵉʳ rendu
  // (plus d'attente d'un tick d'effet) → ses fetches partent en même temps que la sidebar (/menu).
  // L'effet couvre la navigation ULTÉRIEURE vers le dashboard.
  const [dashboardVisited, setDashboardVisited] = useState(isDashboard)
  useEffect(() => { if (isDashboard) setDashboardVisited(true) }, [isDashboard])

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
      {/* Shell-side handlers the AI chat drives (window.melisReactActionMap). Host-owned:
          they need the router, the menu and the tabs. Renders nothing. */}
      <AiNavActionsBridge />
      {/* Module-contributed global overlays (e.g. the MelisAI floating assistant): rendered
          once, outside the routed content, so their state survives navigation. Present only
          when the owning module is active — a brick exists iff its module is. */}
      {overlays.map((b) => {
        const Overlay = b.Overlay!
        return <Overlay key={b.id} />
      })}
      <Sidebar
        collapsed={collapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          isMobile={isMobile}
          onToggleSidebar={() =>
            isMobile ? setMobileOpen((o) => !o) : setCollapsed((c) => !c)
          }
        />
        {/* Sur mobile, les onglets (principaux + sous-onglets) se déploient via l'encoche du header ;
            on masque les barres horizontales pour ne pas doublonner l'UI dans un écran étroit. */}
        {!isMobile && <SubTabBar />}
        {!isMobile && <ToolTabBar />}

        <main ref={mainRef} className="relative flex-1 overflow-hidden">
          {/* Dashboard — monté à la 1re visite puis gardé en DOM (hidden) : évite de charger
              ses plugins legacy (iframes lourdes) tant qu'on n'a pas ouvert le tableau de bord. */}
          <div className={cn('h-full overflow-y-auto', !isDashboard && 'hidden')}>
            {dashboardVisited && (
              <ToolErrorBoundary label={t('nav.dashboard')}>
                <Suspense fallback={<PageLoader />}>
                  <DashboardPage />
                </Suspense>
              </ToolErrorBoundary>
            )}
          </div>

          {/* Listes persistantes — montées à la 1re visite, puis gardées en DOM (hidden).
              Jamais montées au boot : évite de fetcher des données pour des outils non visités. */}
          {PERSISTENT_MODULES.map((m) => {
            const List = m.list
            const route = routeForForward(m.forwardKey)
            // Nom TRADUIT du menu ; `m.label` (repli du registre) est figé en français et ne
            // sert que de repli avant chargement du menu (même pattern que les briques).
            const label = (route && labelForRoute(route)) ?? m.label
            return (
              <div
                key={m.id}
                className={cn('h-full overflow-y-auto', activePersistent?.id !== m.id && 'hidden')}
              >
                {visitedModules.has(m.id) && (
                  <ToolErrorBoundary label={label}>
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
