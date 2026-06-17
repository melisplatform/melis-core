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
import { useBricks } from '@/lib/bricks'
import LoginPage from '@/pages/LoginPage'

/** Fallback label for a route that opens a tab without one (e.g. a deep link). */
function deriveTabLabel(path: string): string {
  if (path === '/') return 'Dashboard'
  const m = path.match(/^\/cms\/(\d+)/)
  if (m) return `Page ${m[1]}`
  // Zone tools: prettify the melisKey (strip the melis*_tool_ prefix, title-case) instead of
  // showing the raw key. Restored tabs keep their real label via persistence; this is just the
  // fallback for deep-links / first reload.
  const z = path.match(/^\/zone\/(.+)/)
  if (z) {
    return decodeURIComponent(z[1])
      .replace(/^melis(core|sb|cms)?_tool_?/i, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() || z[1]
  }
  const seg = path.split('/').filter(Boolean).pop() ?? path
  return seg.charAt(0).toUpperCase() + seg.slice(1)
}

/**
 * - Exposes the tab store imperatively so module bricks (separate bundles that can't import
 *   the host TabContext) can open tabs via window.__melisOpenTab({ id, label, path }).
 * - Keeps the ACTIVE tab aligned with the current route, so the content never renders under
 *   the wrong tab (e.g. a page showing under the Dashboard tab) — robust even if a brick's
 *   openTab call is missed or on a deep-link reload.
 */
function TabBridge() {
  const { openTab, syncRoute } = useTabs()
  const location = useLocation()
  useEffect(() => {
    ;(window as unknown as { __melisOpenTab?: typeof openTab }).__melisOpenTab = openTab
  }, [openTab])
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
                  {/* Modules natifs — routes générées depuis le registre.
                      Liste : rendue par Shell si `persistent`, sinon ici.
                      Formulaire : /x/new et /x/:id. */}
                  {MODULES.map((m) => {
                    const List = m.list
                    const Form = m.form
                    return (
                      <Route key={m.id}>
                        <Route
                          path={m.route}
                          element={
                            m.persistent
                              ? null
                              : <Suspense fallback={<PageLoader />}><List /></Suspense>
                          }
                        />
                        {Form && (
                          <>
                            <Route
                              path={`${m.route}/new`}
                              element={<Suspense fallback={<PageLoader />}><Form /></Suspense>}
                            />
                            <Route
                              path={`${m.route}/:id`}
                              element={<Suspense fallback={<PageLoader />}><Form /></Suspense>}
                            />
                          </>
                        )}
                      </Route>
                    )
                  })}
                  {/* Briques React modulaires — routes des modules actifs qui livrent
                      leur propre UI (chargées au runtime, cf. lib/bricks.ts). */}
                  {bricks.filter((b) => b.Component && b.route).flatMap((b) => {
                    const Brick = b.Component!
                    const el = (
                      <Suspense fallback={<PageLoader />}>
                        <Brick />
                      </Suspense>
                    )
                    // Sibling routes (no pathless wrapper): /cms and /cms/:id selection.
                    return [
                      <Route key={b.id} path={b.route} element={el} />,
                      <Route key={`${b.id}:id`} path={`${b.route}/:id`} element={el} />,
                    ]
                  })}
                  {/* Outils Melis via zoneview — tous les outils sans page React dédiée */}
                  <Route
                    path="/zone/:melisKey"
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
