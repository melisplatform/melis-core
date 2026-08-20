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
  /** 2FA requise (mot de passe déjà validé) — hash à transmettre à la route React /verify-2fa. */
  twoFaHash?: string
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

  if (data.success) {
    // `command` est le legacy jQuery eval() : "window.location.replace('/melis/verify-2fa?hash=...')"
    // quand le mot de passe est correct mais que la 2FA reste à faire — `success` est déjà `true` à ce
    // stade (le mot de passe est bon), donc on NE PEUT PAS s'y fier seul pour authentifier. La page
    // legacy /melis/verify-2fa a son propre bug de rendu (zone PluginView non résolue pour un
    // utilisateur non authentifié) — on extrait juste le hash et on laisse l'appelant naviguer vers
    // la route React /verify-2fa (Verify2faPage), qui poste directement sur /melis/verify-2fa-code.
    // Sur `success: true`, MelisAuthController::authenticateAction() ne produit QUE deux formes de
    // `command` (vérifié en lisant tout le contrôleur + le listener melis-login-2fa qui l'étend) :
    //   - "window.location.replace('/melis');" — login normal (2FA off, ou déjà passée)
    //   - "window.location.replace('/melis/verify-2fa?hash=...');" — 2FA à faire
    // Un ancien fallback ici suivait AUSSI tout redirect sans hash via `window.location.href =`,
    // en pensant traiter un cas "inattendu" — mais c'est justement la forme du login normal (la
    // SEULE qui arrive quand la 2FA est désactivée), donc dès que la 2FA était off ce fallback
    // quittait l'app React vers /melis legacy juste après avoir affiché "Identifiants invalides"
    // (le success:false retourné avant la navigation, le temps qu'elle s'exécute). Il n'existe
    // aucun troisième cas côté PHP à gérer : un hash = 2FA, pas de hash = login réussi, point.
    const hashMatch = data.command?.match(/[?&]hash=([^&'"]+)/)
    if (hashMatch) {
      return { success: false, twoFaHash: decodeURIComponent(hashMatch[1]) }
    }
    return { success: true }
  }
  return { success: false, message: extractError(data.errors) ?? 'Identifiants invalides.' }
}

// ─── 2FA (route publique React /verify-2fa) ──────────────────────────────────

export interface TwoFaVerifyResult {
  success: boolean
  message?: string
  tries?: number
  locked?: boolean
}

/** Vérifie le code reçu par email. POST /melis/verify-2fa-code — si succès, le serveur pose le
 *  cookie de session (finalise le login sans re-demander le mot de passe). */
export async function verifyTwoFaCode(hash: string, code: string): Promise<TwoFaVerifyResult> {
  try {
    const body = new URLSearchParams({ hash, code })
    const res = await fetch('/melis/verify-2fa-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...XHR_HEADER },
      body,
      credentials: 'include',
    })
    if (!res.ok) return { success: false, message: `Erreur serveur (${res.status}).` }
    const data = (await res.json()) as {
      success?: boolean
      tries?: number
      locked?: boolean
      error?: { errorMessage?: string }
    }
    if (data.success) return { success: true }
    return { success: false, message: data.error?.errorMessage, tries: data.tries, locked: data.locked }
  } catch {
    return { success: false, message: 'Serveur Melis injoignable.' }
  }
}

export interface TwoFaRequestCodeResult {
  success: boolean
  message?: string
}

/** Demande le renvoi d'un nouveau code. POST /melis/request-2fa-code. */
export async function requestNewTwoFaCode(hash: string): Promise<TwoFaRequestCodeResult> {
  try {
    const body = new URLSearchParams({ hash })
    const res = await fetch('/melis/request-2fa-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...XHR_HEADER },
      body,
      credentials: 'include',
    })
    if (!res.ok) return { success: false, message: `Erreur serveur (${res.status}).` }
    const data = (await res.json()) as { success?: boolean; message?: string }
    return { success: !!data.success, message: data.message }
  } catch {
    return { success: false, message: 'Serveur Melis injoignable.' }
  }
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
let _reactModulesInFlight: Promise<ReactModulesResult> | null = null

/** Discovery payload: the active bricks + the URL of their CONCATENATED bundle. */
export interface ReactModulesResult {
  bricks: ApiReactBrick[]
  /**
   * ONE URL serving every brick above, glued together server-side
   * (`/melis/react-api/bricks-bundle.js?v=<signature>`). Each per-brick `bundleUrl` is served by
   * MelisAssetManager, i.e. costs a FULL Melis bootstrap (~0.3s measured) because module
   * `public/` folders are outside the document root — ~50 bricks meant ~10s of cumulative PHP.
   * The signature covers every brick file's mtime+size, so the response is immutable-cacheable.
   * Null when the backend predates this endpoint → the shell falls back to per-brick loading.
   */
  bundleUrl: string | null
}

/** Full discovery payload (bricks + concatenated-bundle URL), concurrency-coalesced. */
export function fetchReactModulesFull(): Promise<ReactModulesResult> {
  if (_reactModulesInFlight) return _reactModulesInFlight
  const pr = fetchReactModulesRaw()
  _reactModulesInFlight = pr
  void pr.finally(() => { if (_reactModulesInFlight === pr) _reactModulesInFlight = null })
  return pr
}

export function fetchReactModules(): Promise<ApiReactBrick[]> {
  return fetchReactModulesFull().then((r) => r.bricks)
}

async function fetchReactModulesRaw(): Promise<ReactModulesResult> {
  const empty: ReactModulesResult = { bricks: [], bundleUrl: null }
  try {
    const res = await fetch('/melis/react-api/react-modules', {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    if (!res.ok) return empty
    const data = (await res.json()) as {
      success: boolean
      data?: ApiReactBrick[]
      bundle?: { url?: string }
    }
    if (!data.success || !Array.isArray(data.data)) return empty
    return { bricks: data.data, bundleUrl: data.bundle?.url ?? null }
  } catch {
    return empty
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
  /** Texte d'aide du plugin (config PHP `datas.description`, traduite) — affiché en infobulle sur
   *  l'item de la palette, comme le `title="…"` du menu de plugins legacy. Vide si non déclaré. */
  description?: string
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

/** Active legacy dashboard plugins (rights-filtered) + the native React widgets the user is granted. */
export interface DashboardPluginsResult {
  plugins: LegacyDashboardPlugin[]
  /** Native widget ids (widget-registry) the current user has the right to — gates always-registered
   *  native widgets so a rights-less user doesn't see them (e.g. "Recent activity"). */
  nativeWidgets: string[]
  /** Infobulle des widgets natifs, reprise de la config du plugin legacy qu'ils remplacent. */
  nativeWidgetDescriptions: Record<string, string>
}

/** Returns the active legacy Melis dashboard plugins (from PHP config) + granted native widget ids. */
// ⚠️ Renvoie `null` sur ÉCHEC (HTTP/réseau/`success:false`), JAMAIS un résultat vide. Un `[]` en cas
// d'échec est INDISTINGUABLE de « l'utilisateur n'a aucun plugin » → la réconciliation du dashboard
// élaguait alors TOUS les plugins d'un registre vide et ÉCRASAIT le record (perte de données). `null`
// = « on ne sait pas » → l'appelant conserve l'état et réessaie ; `{plugins:[],…}` = vrai vide accordé.
export async function fetchLegacyDashboardPlugins(): Promise<DashboardPluginsResult | null> {
  try {
    const res = await fetch('/melis/react-api/dashboard/legacy-plugins', {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      success: boolean
      data?: LegacyDashboardPlugin[]
      nativeWidgets?: string[]
      nativeWidgetDescriptions?: Record<string, string>
    }
    if (!data.success) return null
    return {
      plugins: Array.isArray(data.data) ? data.data : [],
      nativeWidgets: Array.isArray(data.nativeWidgets) ? data.nativeWidgets : [],
      // PHP renvoie `[]` (et non `{}`) quand la map est vide — normalisé ici en objet.
      nativeWidgetDescriptions:
        data.nativeWidgetDescriptions && !Array.isArray(data.nativeWidgetDescriptions)
          ? data.nativeWidgetDescriptions
          : {},
    }
  } catch {
    return null
  }
}

// ─── Dashboard layout persistence (DB, melis_core_dashboards) ────────────────
//
// React and the classic /melis dashboard share the SAME record (dashboard_id
// `id_meliscore_toolstree_section_dashboard`), so a change on either side is always consistent.
// The DB stores the legacy XML schema, keyed by the REAL PHP plugin name — hence this "record"
// shape (pluginName + pluginId) rather than a bare React grid id. DashboardPage maps it to/from
// its GridItem (`i`) using the widget registry.
//
// READ and WRITE both go through the react-api (JSON). The controller writes the SAME shared record
// the classic dashboard uses and replays `meliscore_save_dashboard_plugin_end` (→ per-user dashboard
// cache purge), so the classic dashboard reflects every React change (add / move / remove / remove-all).

export interface DashboardPluginRecord {
  /** Real PHP dashboard plugin name (e.g. MelisCoreDashboardRecentUserActivityPlugin). */
  pluginName: string
  /** Per-instance id kept in the XML (`plugin_id`) — lets the same plugin appear several times. */
  pluginId: string
  x: number
  y: number
  w: number
  /** Hauteur en lignes de la grille LEGACY (cellules 80px) — hauteur DÉCLARÉE du plugin, PAS la
   *  hauteur d'affichage React (46px, ajustée au contenu). C'est ce que rend le dashboard /melis. */
  h: number
  /** Hauteur d'affichage React (lignes de 46px) quand l'utilisateur a redimensionné la tuile À LA
   *  MAIN. Stockée à part (`<react-height>`) car le dashboard classique rend `h` en 80px ; il ignore
   *  ce champ. `null`/absent = pas de redimensionnement manuel → la grille auto-ajuste la hauteur. */
  reactH?: number | null
}

/** Returns the saved plugin records from the shared DB record, or null if not yet saved. */
export async function fetchDashboardLayout(): Promise<DashboardPluginRecord[] | null> {
  try {
    const res = await fetch('/melis/react-api/dashboard/layout', {
      headers: { ...XHR_HEADER },
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { success: boolean; data?: DashboardPluginRecord[] | null }
    if (!data.success) return null
    // DB VIDE (record absent ou `d_content` vidé par « Remove all » legacy) ⇒ tableau vide, PAS null :
    // c'est un état d'autorité (l'utilisateur a tout retiré) que l'appelant doit propager en effaçant
    // son cache localStorage. `null` est réservé aux échecs réels (HTTP/réseau) → l'appelant garde le
    // cache. Sans cette distinction, un dashboard vidé côté legacy restait affiché côté React.
    if (!Array.isArray(data.data)) return []
    // `h` est la hauteur LEGACY déclarée (grille 80px) telle que stockée ; la conversion en lignes de
    // la grille React (46px) pour l'AFFICHAGE se fait à la construction du layout (cf. recordsToLayout).
    return data.data
  } catch {
    return null
  }
}

/**
 * Persists the dashboard through the legacy `saveDashboardPlugins` endpoint — the SAME one the
 * classic /melis dashboard posts to (MelisCoreDashboardDragDropZonePlugin::savePlugins). Payload
 * shape mirrors the legacy `serializeWidgetMap`: `dashboard_id` + `plugins[name][id][key]`. An empty
 * set (Remove all) posts only `dashboard_id` → the endpoint saves an empty dashboard AND fires
 * `meliscore_save_dashboard_plugin_end`, so the classic dashboard's cache is purged too.
 * Fire-and-forget: errors are silently swallowed.
 */
export async function saveDashboardLayout(
  items: DashboardPluginRecord[],
  opts?: {
    /** Autorise l'écriture d'un record VIDE. Réservé au « tout supprimer » explicite (confirmé par
     *  l'utilisateur). Sans ce drapeau, le serveur REFUSE une liste vide : c'est le filet contre un
     *  bug client qui effacerait tout le dashboard partagé (déjà constaté en base). */
    allowEmpty?: boolean
  },
): Promise<void> {
  // POST via la react-api (JSON). Ce contrôleur écrit le MÊME record partagé (`<height>` = hauteur
  // legacy déclarée, rendue par le dashboard classique), PRÉSERVE la config des plugins déjà en base,
  // et rejoue `meliscore_save_dashboard_plugin_end` → la purge du cache dashboard classique tourne
  // aussi (add/move/remove/remove-all restent reflétés côté /melis). Il stocke EN PLUS la hauteur
  // d'affichage React d'une tuile redimensionnée à la main (`<react-height>`, ignorée par le legacy),
  // ce que l'ancien endpoint `saveDashboardPlugins` ne savait pas faire (d'où la perte du resize).
  try {
    await fetch(`/melis/react-api/dashboard/layout${opts?.allowEmpty ? '?allowEmpty=1' : ''}`, {
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
