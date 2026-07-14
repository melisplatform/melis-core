import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { AuthProvider } from '@/auth/AuthProvider'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { I18nProvider } from '@/i18n/I18nProvider'
import { TabProvider, useTabs } from '@/components/tabs/tab-store'
import { Shell } from '@/components/layout/Shell'
import { MODULES } from '@/lib/module-registry'
import { useBricks, useBricksVersion, bricksReady, brickRoute } from '@/lib/bricks'
import { hasToolRoutes, routeForForward, useToolRoutesVersion } from '@/lib/tool-routes'
import LoginPage from '@/pages/LoginPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import SetupWizardPage from '@/pages/setup/SetupWizardPage'

/** Fallback label for a route that opens a tab without one (e.g. a deep link). */
function deriveTabLabel(path: string): string {
  if (path === '/') return 'Dashboard'
  const m = path.match(/^\/melis-cms\/page\/(\d+)/)
  if (m) return `Page ${m[1]}`
  // Fallback label = the last path segment, prettified. Restored/opened tabs keep their real
  // label via persistence / the openTab call; this is only for deep-links / first reload.
  const seg = path.split('/').filter(Boolean).pop() ?? path
  return decodeURIComponent(seg).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * - Exposes the tab store imperatively so module bricks (separate bundles that can't import
 *   the host TabContext) can open tabs via window.__melisOpenTab({ id, label, path }).
 * - Keeps the ACTIVE tab aligned with the current route, so the content never renders under
 *   the wrong tab (e.g. a page showing under the Dashboard tab) — robust even if a brick's
 *   openTab call is missed or on a deep-link reload.
 */
function TabBridge() {
  const { openTab, closeTab, syncRoute } = useTabs()
  const location = useLocation()
  const bricks = useBricks()
  // Re-run the route→tab sync once the tool-routes registry (re)loads, so a cold deep-link to a
  // tool sub-route resolves to the right top tab (e.g. /melis-core/user/2 → "Utilisateurs") instead
  // of staying on a raw fallback tab.
  const toolRoutesVersion = useToolRoutesVersion()
  // Idem pour la liste des briques (/react-modules) : elle porte le flag `subTabs`, sans lequel une
  // URL de sous-onglet est prise pour une route inconnue. Les deux fetches sont indépendants.
  const bricksVersion = useBricksVersion()
  useEffect(() => {
    const w = window as unknown as { __melisOpenTab?: typeof openTab; __melisCloseTab?: typeof closeTab }
    w.__melisOpenTab = openTab
    w.__melisCloseTab = closeTab
  }, [openTab, closeTab])
  useEffect(() => {
    const path = location.pathname
    if (path === '/login' || path === '/setup') return
    // Native tools (MODULES) use ONE top tab + a sub-tab bar for their entities, so an edit
    // sub-route (/[tool]/:id) must sync to the TOOL's top tab — not spawn a per-id tab ("2").
    // Bricks WITHOUT subTabs (e.g. CMS pages, News) keep one top tab per entity (handled below);
    // bricks WITH subTabs:true are collapsed just like native tools (see subTabBrick below).
    const tool = MODULES
      .map((m) => ({ route: routeForForward(m.forwardKey), label: m.label }))
      .find((m) => m.route && path.startsWith(m.route + '/'))
    if (tool?.route) { syncRoute({ id: tool.route, label: tool.label, path: tool.route }); return }
    // Bricks that opted into the native sub-tab pattern (manifest subTabs:true) behave like the
    // native tools above: collapse /[section]/[tool]/:id to the ONE tool top tab (the opened
    // records live in the host SubTabBar) — instead of spawning a stray per-id tab labelled "6".
    const subTabBrick = bricks.find((b) => {
      if (!b.subTabs) return false
      const r = brickRoute(b)
      return r && (path === r || path.startsWith(r + '/'))
    })
    if (subTabBrick) { const r = brickRoute(subTabBrick); syncRoute({ id: r, label: subTabBrick.label, path: r }); return }
    // No native module matched. If the registries aren't loaded yet, a tool sub-route would here
    // spawn a raw "/section/tool/:id" tab (label "2"); skip until BOTH the menu-derived tool routes
    // and the brick list (which carries `subTabs`) have loaded — this effect re-runs on their
    // versions. Waiting on the menu alone was not enough: when it won the race against
    // /react-modules, refreshing a brick's open sub-tab spawned a stray top tab labelled with the
    // raw id. Once loaded, an unknown route is a genuine zone/brick tab → create it.
    if (path !== '/' && (!hasToolRoutes() || !bricksReady())) return
    syncRoute({ id: path, label: deriveTabLabel(path), path })
  }, [location.pathname, syncRoute, toolRoutesVersion, bricksVersion, bricks])
  return null
}

// DashboardPage : monté par Shell (persistent), plus par la route '/' — voir Route path="/" plus bas.
const PlaceholderPage = lazy(() => import('@/pages/PlaceholderPage'))
const ZonePage        = lazy(() => import('@/pages/ZonePage'))
// « Mon compte » : outil natif non-menu, ouvert depuis le Topbar (avatar) à /melis-core/account.
// Route statique déclarée explicitement → prime sur le fallback ZonePage (/:section/:tool/*).
const AccountPage     = lazy(() => import('@/pages/AccountPage'))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  )
}

export default function App() {
  // React bricks of active modules, discovered + loaded at runtime (modular UI).
  const bricks = useBricks()
  // Re-render once the tool-routes registry (menu-derived /[section]/[tool]) is populated,
  // so native/brick routes are mounted at their tree URL.
  useToolRoutesVersion()
  return (
    <ThemeProvider>
      <I18nProvider>
        {/* Access URL is /melis-react (served by MelisReactOverride), parallel to the
            legacy back-office at /melis. The code lives in MelisCore and the hashed
            assets load from /MelisCore/ui-react/. In dev the SPA runs at the root. */}
        <BrowserRouter basename={import.meta.env.PROD ? '/melis-react' : '/'}>
          <AuthProvider>
            <TabProvider>
            <TabBridge />
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:hash" element={<ResetPasswordPage />} />
              <Route path="/setup" element={<SetupWizardPage />} />

              {/* Authentifié — Shell (sidebar + topbar) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Shell />}>
                  {/* Le Dashboard est monté de façon PERSISTANTE par Shell (Shell.tsx), comme les
                      autres modules `persistent`. La route '/' ne doit donc rien rendre dans l'Outlet
                      (sinon DashboardPage est monté 2× → 2 grilles GridStack, drag/drop et rendu des
                      widgets ambigus). On garde la route pour le matching, mais element vide. */}
                  <Route path="/" element={<></>} />
                  {/* Modules natifs — montés à leur URL d'arbre /[section]/[tool] (dérivée du
                      menu via forwardKey). Liste : rendue par Shell si `persistent`, sinon ici.
                      Formulaire : /x/new et /x/:id. */}
                  {MODULES.map((m) => {
                    const route = routeForForward(m.forwardKey)
                    if (!route) return null
                    const List = m.list
                    const Form = m.form
                    return (
                      <Route key={m.id}>
                        <Route
                          path={route}
                          element={
                            m.persistent
                              ? null
                              : <Suspense fallback={<PageLoader />}><List /></Suspense>
                          }
                        />
                        {Form && (
                          <>
                            <Route
                              path={`${route}/new`}
                              element={<Suspense fallback={<PageLoader />}><Form /></Suspense>}
                            />
                            <Route
                              path={`${route}/:id`}
                              element={<Suspense fallback={<PageLoader />}><Form /></Suspense>}
                            />
                          </>
                        )}
                      </Route>
                    )
                  })}
                  {/* Briques React modulaires — Shell les rend directement hors Outlet (persistent
                      mount, display:none quand inactives). Les routes sont déclarées ici sans element
                      pour empêcher le fallback /:section/:tool/* (ZonePage) de les attraper. */}
                  {bricks.filter((b) => b.Component).flatMap((b) => {
                    const route = brickRoute(b)
                    if (!route) return []
                    return [
                      <Route key={b.id} path={route} element={null} />,
                      <Route key={`${b.id}:id`} path={`${route}/:id`} element={null} />,
                    ]
                  })}
                  {/* « Mon compte » — page native (route statique, prime sur ZonePage). */}
                  <Route
                    path="/melis-core/account"
                    element={<Suspense fallback={<PageLoader />}><AccountPage /></Suspense>}
                  />
                  {/* Outils Melis via zoneview — tous les outils sans page React dédiée.
                      URL = /[section]/[tool] (dérivée de l'arbre) ; ZonePage résout le melisKey
                      via le registre tool-routes. Routes natives/briques (1 segment ou préfixe
                      statique /x/:id) priment grâce au ranking de React Router. */}
                  <Route
                    path="/:section/:tool/*"
                    element={<Suspense fallback={<PageLoader />}><ZonePage /></Suspense>}
                  />
                  {/* Toute autre route → placeholder */}
                  <Route
                    path="*"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <PlaceholderPage />
                      </Suspense>
                    }
                  />
                </Route>
              </Route>

              {/* Fallback racine non-authentifié */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            </TabProvider>
          </AuthProvider>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  )
}
