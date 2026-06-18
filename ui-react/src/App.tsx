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
import { useBricks, brickRoute } from '@/lib/bricks'
import { routeForForward, useToolRoutesVersion } from '@/lib/tool-routes'
import LoginPage from '@/pages/LoginPage'

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
  useEffect(() => {
    const w = window as unknown as { __melisOpenTab?: typeof openTab; __melisCloseTab?: typeof closeTab }
    w.__melisOpenTab = openTab
    w.__melisCloseTab = closeTab
  }, [openTab, closeTab])
  useEffect(() => {
    const path = location.pathname
    if (path === '/login') return
    syncRoute({ id: path, label: deriveTabLabel(path), path })
  }, [location.pathname, syncRoute])
  return null
}

const DashboardPage   = lazy(() => import('@/pages/DashboardPage'))
const PlaceholderPage = lazy(() => import('@/pages/PlaceholderPage'))
const ZonePage        = lazy(() => import('@/pages/ZonePage'))

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

              {/* Authentifié — Shell (sidebar + topbar) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Shell />}>
                  <Route
                    path="/"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <DashboardPage />
                      </Suspense>
                    }
                  />
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
                  {/* Briques React modulaires — montées à leur URL d'arbre /[section]/[tool]
                      (forwardKey → route dérivée ; sinon route du manifeste, ex. CMS page). */}
                  {bricks.filter((b) => b.Component).flatMap((b) => {
                    const route = brickRoute(b)
                    if (!route) return []
                    const Brick = b.Component!
                    const el = (
                      <Suspense fallback={<PageLoader />}>
                        <Brick />
                      </Suspense>
                    )
                    return [
                      <Route key={b.id} path={route} element={el} />,
                      <Route key={`${b.id}:id`} path={`${route}/:id`} element={el} />,
                    ]
                  })}
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
