import { Suspense, useEffect } from 'react'
import { lazyRetry } from '@/lib/lazy-retry'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { AuthProvider } from '@/auth/AuthProvider'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/auth/PublicOnlyRoute'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { I18nProvider } from '@/i18n/I18nProvider'
import { useI18n, type I18nState } from '@/i18n/i18n-context'
import { TabProvider, useTabs } from '@/components/tabs/tab-store'
import { Shell } from '@/components/layout/Shell'
import { MODULES } from '@/lib/module-registry'
import { useBricks, useBricksVersion, bricksReady, brickRoute } from '@/lib/bricks'
import { hasToolRoutes, labelForRoute, routeForForward, useToolRoutesVersion } from '@/lib/tool-routes'
import LoginPage from '@/pages/LoginPage'
import Verify2faPage from '@/pages/Verify2faPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import SetupWizardPage from '@/pages/setup/SetupWizardPage'

/** Fallback label for a route that opens a tab without one (e.g. a deep link). */
function deriveTabLabel(path: string, t: I18nState['t']): string {
  if (path === '/') return t('nav.dashboard')
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
  const { t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
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
  // A LEGACY TOOL RENDERED IN THE IFRAME POOL (melis-react-override) can't reach React Router —
  // it's a separate window. When it needs to open a DIFFERENT tool as a genuine top-level tab
  // (e.g. "edit account" from inside the Contacts tool's Association tab — melisHelper.tabOpen
  // only manages tabs within that iframe's own document, it can't create one at the shell level),
  // it posts { __melisOpenTool, forwardKey, id?, label? } to window.__melisRealParent (this
  // window). We resolve forwardKey → route via the SAME tool-routes registry TabBridge itself
  // uses below, then navigate — the existing route→tab sync effect takes it from there.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data as { __melisOpenTool?: boolean; forwardKey?: string; path?: string; id?: string | number; label?: string } | null
      if (!d || !d.__melisOpenTool) return
      // A caller can pass a ready-made React route (`path`) when the target tool has no forwardKey
      // in the registry — e.g. the CMS pages editor, a persistent brick at /melis-cms/page with no
      // forward (the Workflow dashboard plugin's "eye" and the Recent-page-activity plugin's rows
      // use this to open /melis-cms/page/:id).
      // On CRÉE + ACTIVE l'onglet AVANT de naviguer (openTab puis navigate) — exactement comme
      // l'ouverture depuis l'arbre CMS (CmsSidebar). Sans ça, l'onglet n'est créé que réactivement
      // APRÈS la navigation (SYNC dans l'effet route→onglet, un tick plus tard) : s'il existe déjà
      // un AUTRE onglet de la même brique persistante (une autre page CMS déjà ouverte), il reste
      // l'onglet actif le temps de ce tick → on voit brièvement CETTE page avant que la page
      // demandée ne s'affiche. `label` (nom de page) est posé d'emblée → pas de « Page N » qui
      // clignote, et threadé via router state pour l'effet de synchro.
      if (d.path) {
        // Une brique `subTabs:true` gère SES enregistrements dans sa propre barre de sous-onglets
        // (News, Slider…) : l'onglet du haut doit rester celui de l'OUTIL, sinon l'article s'ouvre
        // dans un onglet général frère de « Actualités » (au lieu d'un sous-onglet dessous).
        const owner = bricks.find((b) => {
          if (!b.subTabs) return false
          const r = brickRoute(b)
          return !!r && (d.path === r || d.path!.startsWith(r + '/'))
        })
        if (owner) {
          const r = brickRoute(owner)!
          // Titre d'onglet = le nom TRADUIT du menu ; `owner.label` (manifeste de la brique) est
          // figé dans une seule langue et ne sert que de repli avant chargement du menu.
          openTab({ id: r, label: labelForRoute(r) ?? owner.label, path: r })
          navigate(d.path, d.label ? { state: { melisTabLabel: d.label } } : undefined)
          return
        }
        openTab({ id: d.path, label: d.label || deriveTabLabel(d.path, t), path: d.path })
        navigate(d.path, d.label ? { state: { melisTabLabel: d.label } } : undefined)
        return
      }
      if (!d.forwardKey) return
      const route = routeForForward(d.forwardKey)
      if (!route) return
      navigate(d.id != null ? `${route}/${d.id}` : route)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [navigate, openTab, bricks, t])
  useEffect(() => {
    const path = location.pathname
    if (path === '/login' || path === '/setup') return
    // Native tools (MODULES) use ONE top tab + a sub-tab bar for their entities, so an edit
    // sub-route (/[tool]/:id) must sync to the TOOL's top tab — not spawn a per-id tab ("2").
    // Bricks WITHOUT subTabs (e.g. CMS pages) keep one top tab per entity (handled below);
    // bricks WITH subTabs:true are collapsed just like native tools (see subTabBrick below).
    const tool = MODULES
      .map((m) => ({ route: routeForForward(m.forwardKey), label: m.label }))
      .find((m) => m.route && path.startsWith(m.route + '/'))
    // Titre d'onglet = le nom TRADUIT du menu ; `tool.label` (repli du registre) est figé en
    // français et ne sert que de repli avant chargement du menu (même pattern que les briques
    // ci-dessus — sans lui, un outil natif ouvert en session anglaise gardait un onglet français).
    if (tool?.route) { syncRoute({ id: tool.route, label: labelForRoute(tool.route) ?? tool.label, path: tool.route }); return }
    // Bricks that opted into the native sub-tab pattern (manifest subTabs:true) behave like the
    // native tools above: collapse /[section]/[tool]/:id to the ONE tool top tab (the opened
    // records live in the host SubTabBar) — instead of spawning a stray per-id tab labelled "6".
    const subTabBrick = bricks.find((b) => {
      if (!b.subTabs) return false
      const r = brickRoute(b)
      return r && (path === r || path.startsWith(r + '/'))
    })
    if (subTabBrick) { const r = brickRoute(subTabBrick); syncRoute({ id: r, label: labelForRoute(r!) ?? subTabBrick.label, path: r }); return }
    // No native module matched. If the registries aren't loaded yet, a tool sub-route would here
    // spawn a raw "/section/tool/:id" tab (label "2"); skip until BOTH the menu-derived tool routes
    // and the brick list (which carries `subTabs`) have loaded — this effect re-runs on their
    // versions. Waiting on the menu alone was not enough: when it won the race against
    // /react-modules, refreshing a brick's open sub-tab spawned a stray top tab labelled with the
    // raw id. Once loaded, an unknown route is a genuine zone/brick tab → create it.
    if (path !== '/' && (!hasToolRoutes() || !bricksReady())) return
    // A label passed through navigation state (e.g. the Workflow eye → page name) wins over the
    // derived "Page N"/slug fallback, so the tab shows the real name from its first paint.
    const stateLabel = (location.state as { melisTabLabel?: string } | null)?.melisTabLabel
    syncRoute({ id: path, label: stateLabel || deriveTabLabel(path, t), path })
  }, [location.pathname, location.state, syncRoute, toolRoutesVersion, bricksVersion, bricks, t])
  return null
}

// DashboardPage : monté par Shell (persistent), plus par la route '/' — voir Route path="/" plus bas.
const PlaceholderPage = lazyRetry(() => import('@/pages/PlaceholderPage'), 'PlaceholderPage')
const ZonePage        = lazyRetry(() => import('@/pages/ZonePage'), 'ZonePage')
// « Mon compte » : outil natif non-menu, ouvert depuis le Topbar (avatar) à /melis-core/account.
// Route statique déclarée explicitement → prime sur le fallback ZonePage (/:section/:tool/*).
const AccountPage     = lazyRetry(() => import('@/pages/AccountPage'), 'AccountPage')

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
              {/* Public — inaccessibles si une session est déjà ouverte (→ redirigé vers le
                  dashboard), comme le legacy qui renvoie /melis/login et /melis/verify-2fa vers
                  /melis quand MelisCoreAuth a déjà une identité. Pas de raison de revoir un
                  formulaire de connexion une fois dans la session. */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/verify-2fa" element={<Verify2faPage />} />
              </Route>
              {/* Toujours accessibles, authentifié ou non : le lien "changer le mot de passe" du
                  mail de 2FA doit fonctionner même si l'utilisateur est déjà connecté dans CE
                  navigateur (session partagée entre onglets) — sinon PublicOnlyRoute le renvoie
                  au dashboard avant qu'il ait pu soumettre le formulaire (le dashboard se
                  remonte alors en plein milieu de l'interaction, d'où la cascade d'erreurs
                  observée en pratique). Ni page ne dépend de useAuth(), rien à adapter côté
                  Shell/dashboard. */}
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
