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
  melisKey: string
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
  children: ApiMenuNode[]
}

/**
 * Récupère l'arbre de navigation complet (dynamique, droits-filtré)
 * depuis MelisReactApi (GET /melis/react-api/menu).
 *
 * Retourne `null` en cas d'erreur (non-authentifié, serveur indisponible).
 */
export async function fetchMenu(): Promise<ApiMenuNode[] | null> {
  try {
    const res = await fetch('/melis/react-api/menu', {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    // eslint-disable-next-line no-console
    console.debug('[MelisAPI] /menu status:', res.status, res.url)
    if (!res.ok) return null
    const data = (await res.json()) as { success: boolean; data?: ApiMenuNode[]; error?: string; _debug?: string }
    // eslint-disable-next-line no-console
    console.debug('[MelisAPI] /menu response:', data)
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
  /** URL du bundle IIFE de la brique, servi par MelisAssetManager. */
  bundleUrl: string
}

/**
 * Liste les modules actifs qui livrent une brique React
 * (GET /melis/react-api/react-modules). Un module n'apparaît que s'il est
 * chargé → l'UI React s'ajoute *si et seulement si* le module est activé.
 */
export async function fetchReactModules(): Promise<ApiReactBrick[]> {
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
  section: string
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
    const res = await fetch('/melis/react-api/langs', { headers: { ...XHR_HEADER }, credentials: 'include' })
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

// ─── Current user (/me) ──────────────────────────────────────────────────────

export interface MeUser {
  id: number
  name: string
  login: string
  email: string
  /** Profile picture as a data URI, or null. */
  picture: string | null
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
