/**
 * Client d'authentification vers le backoffice Melis (Laminas).
 *
 * Endpoints réels (server-rendered, voir MelisAuthController) :
 *   POST /melis/authenticate  body form-urlencoded { usr_login, usr_password, remember }
 *                             → JSON { success: bool, errors, command }  (pose le cookie de session)
 *   GET  /melis/islogin       → JSON { login: bool }   (exige l'en-tête X-Requested-With)
 *   GET  /melis/logout        → déconnecte + clear session
 *
 * En dev, ces routes sont proxifiées par Vite vers MELIS_TARGET (cf. vite.config.ts)
 * pour rester *same-origin* : le cookie de session est ainsi transmis sans CORS.
 *
 * ⚠️ Pas de jeton CSRF sur le formulaire de login Melis (vérifié dans app.forms.php :
 *    le form `meliscore_login` n'expose que usr_login / usr_password / login_submit).
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

export interface LoginResult {
  success: boolean
  /** Message d'erreur prêt à afficher (extrait de la réponse Melis). */
  message?: string
}

/** Réponse brute de /melis/authenticate. */
interface AuthenticateResponse {
  success: boolean
  errors?: unknown
  command?: string
}

/** Extrait un message lisible de la structure `errors` hétérogène de Melis. */
function extractError(errors: unknown): string | undefined {
  if (!errors) return undefined
  if (typeof errors === 'string') return errors
  if (Array.isArray(errors)) {
    const flat = errors.flatMap((e) => extractAll(e))
    return flat[0]
  }
  if (typeof errors === 'object') {
    // ex. { empty: "Failed authentication" } ou { usr_login: { isEmpty: "..." } }
    const flat = extractAll(errors)
    return flat[0]
  }
  return undefined
}

function extractAll(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(extractAll)
  if (value && typeof value === 'object') return Object.values(value).flatMap(extractAll)
  return []
}

/**
 * Authentifie un utilisateur contre Melis. En cas de succès, le cookie de
 * session est posé par le backend ; les appels suivants sont authentifiés.
 */
export async function login(
  usrLogin: string,
  usrPassword: string,
  remember: boolean,
): Promise<LoginResult> {
  const body = new URLSearchParams({
    usr_login: usrLogin,
    usr_password: usrPassword,
    remember: remember ? '1' : '0',
  })

  let res: Response
  try {
    res = await fetch('/melis/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...XHR_HEADER },
      body,
      credentials: 'include',
    })
  } catch {
    return { success: false, message: 'Serveur Melis injoignable. Le backend est-il démarré ?' }
  }

  if (!res.ok) {
    return { success: false, message: `Erreur serveur (${res.status}).` }
  }

  let data: AuthenticateResponse
  try {
    data = (await res.json()) as AuthenticateResponse
  } catch {
    return { success: false, message: 'Réponse inattendue du serveur Melis.' }
  }

  if (data.success) return { success: true }
  return { success: false, message: extractError(data.errors) ?? 'Identifiants invalides.' }
}

/** Vérifie si une session Melis est active. */
export async function isLoggedIn(): Promise<boolean> {
  try {
    const res = await fetch('/melis/islogin', {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    if (!res.ok) return false
    const data = (await res.json()) as { login?: boolean }
    return data.login === true
  } catch {
    return false
  }
}

/** Résultat détaillé de la vérification de session : `active` (connecté),
 *  `expired` (déconnecté côté serveur), `error` (réseau/serveur injoignable). */
export type SessionStatus = 'active' | 'expired' | 'error'

/**
 * Variante de {@link isLoggedIn} qui DISTINGUE une session expirée d'une erreur
 * réseau transitoire — utilisée par le polling périodique pour ne PAS déconnecter
 * l'utilisateur à tort en cas de coupure momentanée (on ne déconnecte que sur
 * une réponse serveur explicite `login:false`).
 */
export async function checkSession(): Promise<SessionStatus> {
  try {
    const res = await fetch('/melis/islogin', {
      headers: { ...XHR_HEADER, 'Cache-Control': 'no-cache' },
      credentials: 'include',
      cache: 'no-store',
    })
    if (!res.ok) return 'error'
    const data = (await res.json()) as { login?: boolean }
    return data.login === true ? 'active' : 'expired'
  } catch {
    return 'error'
  }
}

export interface ZoneViewResult {
  html: string
  jsCallbacks: string[]
  jsFiles: string[]
  jsDatas: unknown
  assets: {
    css: string[]
    js: string[]
    /** Inline JS globals (basePath, componentsPath, colour vars…) injected before the bundle. */
    inline?: string
  }
}

/**
 * Fetches the HTML fragment for a Melis tool zone without loading the full
 * admin shell. Uses /melis/zoneview?cpath=<melisKey> which returns a JSON
 * with { html, jsCallbacks, jsDatas }.
 *
 * Returns null on network error or non-OK response.
 */
export async function fetchZoneView(melisKey: string): Promise<ZoneViewResult | null> {
  try {
    const res = await fetch(`/melis/zoneview?cpath=${encodeURIComponent(melisKey)}`, {
      headers: { ...XHR_HEADER, 'X-Melis-React': '1' },
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = (await res.json()) as ZoneViewResult
    return data
  } catch {
    return null
  }
}

// ─── Password reset (routes publiques) ───────────────────────────────────────

export interface PasswordResetResult {
  success: boolean
  message?: string
}

/**
 * Demande un email de réinitialisation de mot de passe.
 * POST /melis/react-api/forgot-password — route publique (sans auth).
 * Le serveur retourne toujours success=true pour ne pas révéler l'existence d'un compte.
 */
export async function requestPasswordReset(
  login: string,
  email: string,
): Promise<PasswordResetResult> {
  try {
    const body = new URLSearchParams({ usr_login: login, usr_email: email })
    const res = await fetch('/melis/react-api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...XHR_HEADER },
      body,
    })
    if (!res.ok) return { success: false, message: `Erreur serveur (${res.status}).` }
    return (await res.json()) as PasswordResetResult
  } catch {
    return { success: false, message: 'Serveur Melis injoignable.' }
  }
}

/**
 * Réinitialise le mot de passe via le hash du lien email.
 * POST /melis/react-api/reset-password — route publique (sans auth).
 */
export async function resetPassword(
  hash: string,
  password: string,
  confirmPassword: string,
): Promise<PasswordResetResult> {
  try {
    const body = new URLSearchParams({
      rhash: hash,
      usr_pass: password,
      usr_pass_confirm: confirmPassword,
    })
    const res = await fetch('/melis/react-api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...XHR_HEADER },
      body,
    })
    if (!res.ok) return { success: false, message: `Erreur serveur (${res.status}).` }
    return (await res.json()) as PasswordResetResult
  } catch {
    return { success: false, message: 'Serveur Melis injoignable.' }
  }
}

/** Déconnecte la session Melis courante. */
export async function logout(): Promise<void> {
  try {
    // redirect:'manual' — do not follow the 302→/melis/login; the session is cleared
    // server-side before the redirect fires, so we just need the request to land.
    await fetch('/melis/logout', { headers: { ...XHR_HEADER }, credentials: 'include', redirect: 'manual' })
  } catch {
    /* best-effort */
  }
}

// ─── Assets API ──────────────────────────────────────────────────────────────

export interface PlatformAssets {
  css: string[]
  js: string[]
  inline?: string
}

/**
 * Fetches the CSS/JS asset list from the server.
 * Uses MelisWebPackService on the server side, so it works in both
 * build_bundle=true (returns bundle URLs) and false (returns individual files).
 * Cached in module scope — only one network request per page load.
 */
let _assetsPromise: Promise<PlatformAssets | null> | null = null

export function fetchAssets(): Promise<PlatformAssets | null> {
  if (_assetsPromise) return _assetsPromise
  _assetsPromise = fetch('/melis/react-api/assets', {
    headers: { ...XHR_HEADER },
    credentials: 'include',
  })
    .then(res => (res.ok ? res.json() : null))
    .then((data: { success: boolean; data?: PlatformAssets } | null) =>
      data?.success && data.data ? data.data : null,
    )
    .catch(() => null)
  return _assetsPromise
}

// ─── Menu API ────────────────────────────────────────────────────────────────

/** Nœud récursif — identique que ce soit une section, catégorie, outil ou sous-outil. */
export interface ApiMenuNode {
  key: string
  name: string
  icon: string
  melisKey: string | null
  /** true = nœud cliquable possédant un `forward` (outil PHP). */
  isTool: boolean
  /** Données de routage Melis (module, controller, action, jscallback). */
  forward: {
    module?: string
    controller?: string
    action?: string
    jscallback?: string
    jsdatas?: Record<string, unknown>
  }
  hasNavChild: boolean
  /** Unfiltered child count (before rights filtering) — lets the nav avoid collapsing a multi-tool
   *  category in which the user only has a single tool granted. See collapseSingleTool. */
  configChildCount?: number
  /** Category opts out of the single-tool collapse (conf.no_collapse) — kept as an expandable
   *  group even with one child, so tools can be added under it later. See collapseSingleTool. */
  noCollapse?: boolean
  /** Module propriétaire d'un panneau de sidebar à accrocher à cette section même sans outil
   *  accessible (section « hôte de sidebar », ex. l'arbre des pages CMS). Voir Sidebar/collectModules. */
  sidebarModule?: string
  children: ApiMenuNode[]
}

/**
 * Récupère l'arbre de navigation complet (dynamique, droits-filtré)
 * depuis MelisReactApi (GET /melis/react-api/menu).
 *
 * Retourne `null` en cas d'erreur (non-authentifié, serveur indisponible).
 */
/**
 * Fetch the left-menu tool tree. `full=true` returns the UNFILTERED tree (every tool, not just the
 * current user's) — used only by the user-rights editor (server restricts it to rights managers).
 */
export async function fetchMenu(full = false): Promise<ApiMenuNode[] | null> {
  try {
    const res = await fetch(`/melis/react-api/menu${full ? '?full=1' : ''}`, {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    // eslint-disable-next-line no-console
    if (!res.ok) return null
    const data = (await res.json()) as { success: boolean; data?: ApiMenuNode[]; error?: string; _debug?: string }
    // eslint-disable-next-line no-console
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) return null
    return data.data
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[MelisAPI] /menu fetch error:', err)
    return null
  }
}

// ─── React bricks discovery (modular UI) ─────────────────────────────────────

/** Métadonnées d'une brique React fournie par un module Melis actif. */
export interface ApiReactBrick {
  id: string
  module: string
  /** Route React Router de la brique, ex. '/calendar'. */
  route: string | null
  label: string
  /** `Module/Controller` Melis pour mapper l'entrée de menu legacy → route React. */
  forwardKey: string | null
  /** melisKey de l'outil legacy (toggle New/Old), si applicable. */
  melisKey: string | null
  /** Opt-in au pattern de sous-onglets natif (look « User Management ») : l'hôte replie
   *  /[section]/[tool]/:id sur UN seul onglet outil + rend la SubTabBar des enregistrements ouverts. */
  subTabs?: boolean
  /** Opt-in au montage PERSISTANT : l'hôte garde la brique montée (cachée en CSS) après sa 1re visite
   *  → aucun refetch ni rechargement d'iframe legacy en changeant d'onglet outil. L'hôte scope le
   *  contexte de routage de la brique sur sa propre route et lui passe un prop `active`
   *  (cf. Shell.tsx `BrickHost`). */
  persistent?: boolean
  /** URL du bundle IIFE de la brique, servi par MelisAssetManager. */
  bundleUrl: string
}

/**
 * Liste les modules actifs qui livrent une brique React
 * (GET /melis/react-api/react-modules). Un module n'apparaît que s'il est
 * chargé → l'UI React s'ajoute *si et seulement si* le module est activé.
 */
// ⚡ Coalescence des appels CONCURRENTS. Au boot, loadBricks() ET refreshActiveModules() appellent
// cette route en même temps → 2 requêtes sérialisées par le verrou de session PHP (l'une pouvait
// prendre ~2,5s), ce qui retardait le prefetch du bundle messenger (la cloche topbar mettait du
// temps à apparaître, de façon variable). On partage la requête EN VOL : un seul aller-retour tant
// qu'une réponse n'est pas revenue. Effacée après résolution → une navigation ultérieure re-fetch.
let _reactModulesInFlight: Promise<ApiReactBrick[]> | null = null
export function fetchReactModules(): Promise<ApiReactBrick[]> {
  if (_reactModulesInFlight) return _reactModulesInFlight
  const pr = fetchReactModulesRaw()
  _reactModulesInFlight = pr
  void pr.finally(() => { if (_reactModulesInFlight === pr) _reactModulesInFlight = null })
  return pr
}

async function fetchReactModulesRaw(): Promise<ApiReactBrick[]> {
  try {
    const res = await fetch('/melis/react-api/react-modules', {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    if (!res.ok) return []
    const data = (await res.json()) as { success: boolean; data?: ApiReactBrick[] }
    if (!data.success || !Array.isArray(data.data)) return []
    return data.data
  } catch {
    return []
  }
}

// ─── Dashboard top bubbles (News / Updates / Notifications / Messages) ────────

export interface DashboardBubbleCount {
  count: number
}

export interface DashboardBubbles {
  news: DashboardBubbleCount
  updates: DashboardBubbleCount
  notifications: DashboardBubbleCount
  messages: DashboardBubbleCount
}

/**
 * Counts for the dashboard's top bubble widgets (GET /melis/react-api/dashboard/bubbles).
 * Mirrors MelisCore's legacy dashboard bubble plugins; missing modules → 0.
 */
export async function fetchDashboardBubbles(): Promise<DashboardBubbles | null> {
  try {
    const res = await fetch('/melis/react-api/dashboard/bubbles', {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { success: boolean; data?: DashboardBubbles }
    return data.success && data.data ? data.data : null
  } catch {
    return null
  }
}

// ─── Dashboard KPI stats + recent activity ────────────────────────────────────

export interface DashboardKpis {
  users: number
  sites: number
  pages: number
  languages: number
}

export interface DashboardActivityItem {
  id: number
  name: string
  loginDate: string | null
}

export interface DashboardStats {
  kpis: DashboardKpis
  activity: DashboardActivityItem[]
}

/** KPI counts and recent login activity (GET /melis/react-api/dashboard/stats). */
export async function fetchDashboardStats(): Promise<DashboardStats | null> {
  try {
    const res = await fetch('/melis/react-api/dashboard/stats', {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { success: boolean; data?: DashboardStats }
    return data.success && data.data ? data.data : null
  } catch {
    return null
  }
}

// ─── Legacy dashboard plugins discovery ──────────────────────────────────────

export interface LegacyDashboardPlugin {
  pluginName: string
  title: string
  icon: string
  /** Screenshot shown in the legacy plugin picker (module-relative URL, e.g. /Utilities/plugins/images/Foo.jpg). */
  thumbnail: string
  /** Melis section the owning module belongs to (MelisCore, MelisCms, MelisMarketing…). */
  section: string
  /** Owning module (forward.module), e.g. MelisCmsPageHistoric — sub-group inside the section. */
  module: string
  /** Translated module label (tr_PluginSection_<module>), e.g. "Melis Cms Page Historic". */
  moduleLabel: string
  w: number
  h: number
}

/** Returns the list of active legacy Melis dashboard plugins (from PHP config). */
export async function fetchLegacyDashboardPlugins(): Promise<LegacyDashboardPlugin[]> {
  try {
    const res = await fetch('/melis/react-api/dashboard/legacy-plugins', {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    if (!res.ok) return []
    const data = (await res.json()) as { success: boolean; data?: LegacyDashboardPlugin[] }
    return data.success && Array.isArray(data.data) ? data.data : []
  } catch {
    return []
  }
}

// ─── Dashboard layout persistence (DB, melis_core_dashboards) ────────────────

export interface DashboardGridItem { i: string; x: number; y: number; w: number; h: number }

/** Returns the saved layout from the DB, or null if not yet saved. */
export async function fetchDashboardLayout(): Promise<DashboardGridItem[] | null> {
  try {
    const res = await fetch('/melis/react-api/dashboard/layout', {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { success: boolean; data?: DashboardGridItem[] | null }
    return data.success && Array.isArray(data.data) && data.data.length > 0 ? data.data : null
  } catch {
    return null
  }
}

/** Persists the layout to DB (fire-and-forget, errors are silently swallowed). */
export async function saveDashboardLayout(items: DashboardGridItem[]): Promise<void> {
  try {
    await fetch('/melis/react-api/dashboard/layout', {
      method: 'POST',
      headers: { ...XHR_HEADER, 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(items),
    })
  } catch {
    /* ignore */
  }
}

// ─── Back-office languages / locale ──────────────────────────────────────────

export interface BoLang { id: number; locale: string; short: string; label: string }
export interface BoLangs { current: { id: number; locale: string }; langs: BoLang[] }

/** Available back-office languages + the current session locale. */
export async function fetchLangs(): Promise<BoLangs | null> {
  try {
    const res = await fetch('/melis/react-api/langs', { headers: { ...XHR_HEADER }, credentials: 'include', cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as { success: boolean; data?: BoLangs }
    return data.success && data.data ? data.data : null
  } catch {
    return null
  }
}

/**
 * Change the platform language (session locale + the user's saved usr_lang_id + clears the
 * config cache) via the legacy endpoint. The caller should reload so the whole platform
 * (menu, tools, iframes) re-renders in the new locale.
 */
export async function changeLanguage(langId: number): Promise<boolean> {
  try {
    const res = await fetch(`/melis/change-language?langId=${encodeURIComponent(String(langId))}`, {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    const data = (await res.json()) as { success?: boolean }
    return !!data.success
  } catch {
    return false
  }
}

/**
 * Traductions des pages publiques (login / forgot / reset) depuis les fichiers PHP de melis-core.
 * Route publique — utilisable avant authentification. Retourne un objet clé-React → valeur traduite.
 */
export async function fetchI18n(locale: string): Promise<Record<string, string>> {
  try {
    const res = await fetch(`/melis/react-api/i18n?locale=${encodeURIComponent(locale)}`, {
      headers: { ...XHR_HEADER },
    })
    if (!res.ok) return {}
    const data = (await res.json()) as { success: boolean; data?: Record<string, string> }
    return data.success && data.data ? data.data : {}
  } catch {
    return {}
  }
}

// ─── Current user (/me) ──────────────────────────────────────────────────────

export interface MeUser {
  id: number
  name: string
  login: string
  email: string
  /** Profile picture as a data URI, or null. */
  picture: string | null
  /** Administrateur : bypass des capacités d'outils. */
  isAdmin?: boolean
  /** Capacités d'outils PERMISES pour l'user courant : { melisKey: ['list','create',…] }. */
  capabilities?: Record<string, string[]>
}

/**
 * Capacités d'outils DÉCLARÉES par les modules (éditeur de droits) : par melisKey, soit une
 * liste plate historique (`['list','create',…]`), soit un arbre pour un outil dont certains
 * onglets ont leurs propres actions (ex. "Variants" du produit — voir react.capabilities.php
 * pour la forme exacte et melis-react-api/Service/Capabilities.php pour l'aplatissement).
 */
/** Une action déclarée : soit une simple clé (`'edit'`), soit `{key,label}` (label déjà traduit côté serveur). */
export type CapActionEntry = string | { key: string; label?: string }
export interface CapTreeNode { key?: string; label?: string; actions?: CapActionEntry[]; tabs?: CapTabEntry[] }
export type CapTabEntry = string | CapTreeNode
export type DeclaredCapValue = string[] | CapTreeNode

export async function fetchDeclaredCapabilities(): Promise<Record<string, DeclaredCapValue>> {
  try {
    const res = await fetch('/melis/react-api/rights/capabilities', { headers: { ...XHR_HEADER }, credentials: 'include' })
    if (!res.ok) return {}
    const data = (await res.json()) as { success: boolean; data?: Record<string, DeclaredCapValue> }
    return data.success && data.data ? data.data : {}
  } catch {
    return {}
  }
}

export async function fetchMe(): Promise<MeUser | null> {
  try {
    const res = await fetch('/melis/react-api/me', { headers: { ...XHR_HEADER }, credentials: 'include' })
    if (!res.ok) return null
    const data = (await res.json()) as { success: boolean; data?: MeUser }
    return data.success && data.data ? data.data : null
  } catch {
    return null
  }
}

// ─── Notifications (FlashMessenger, session-only) ─────────────────────────────

export interface FlashNotification {
  title: string
  message: string
  /** Pre-translated relative time ("il y a X") from the server. */
  dateTrans: string
  time: string
}

/**
 * The persistent session notification list (the bell dropdown), from MelisCore's
 * FlashMessenger: GET /melis/MelisCore/MelisFlashMessenger/getflashMessage
 * → { flashMessage: [{ title, message, date_trans, time, ... }] }.
 */
export async function fetchNotifications(): Promise<FlashNotification[]> {
  try {
    const res = await fetch('/melis/MelisCore/MelisFlashMessenger/getflashMessage', {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    if (!res.ok) return []
    const data = (await res.json()) as {
      flashMessage?: Array<{ title?: string; message?: string; date_trans?: string; time?: string }>
    }
    if (!Array.isArray(data.flashMessage)) return []
    return data.flashMessage.map((f) => ({
      title: f.title ?? '',
      message: f.message ?? '',
      dateTrans: f.date_trans ?? '',
      time: f.time ?? '',
    }))
  } catch {
    return []
  }
}

/** Clears the session notification list (same as the legacy "Clear notifications" button). */
export async function clearNotifications(): Promise<boolean> {
  try {
    const res = await fetch('/melis/MelisCore/MelisFlashMessenger/clearFlashMessage', {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    const data = (await res.json()) as { flashMessage?: boolean }
    return !!data.flashMessage
  } catch {
    return false
  }
}
