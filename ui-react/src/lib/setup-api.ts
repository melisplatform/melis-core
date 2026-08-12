const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// Endpoints du wizard d'installation React — servis par MelisInstaller (pas melis-react-api),
// route existante /melis/MelisInstaller/SetupReactApi/<action>, déjà publique (whitelistée dans
// Module.php côté MelisInstaller) — aucune auth, aucune session platform requise.
const BASE = '/melis/MelisInstaller/SetupReactApi'

// Endpoints du carousel legacy, appelés tels quels par les étapes lourdes (téléchargement
// composer, dbdeploy, installation du site, activation, formulaires de configuration des
// modules, finalisation) : toute cette logique vit dans InstallerController et n'a pas
// d'équivalent service — la rejouer côté React ne ferait que la dupliquer.
const LEGACY = '/melis/MelisInstaller/Installer'

async function apiFetch<T>(action: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/${action}`, {
    ...opts,
    headers: { ...XHR_HEADER, ...(opts?.headers ?? {}) },
    credentials: 'include',
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const d = (await res.json()) as { error?: string }
      if (d.error) msg = d.error
    } catch { /* ignore */ }
    throw new Error(msg)
  }
  const data = (await res.json()) as { success: boolean; data?: T; error?: string }
  if (!data.success) throw new Error(data.error ?? 'API error')
  return data.data as T
}

// ─── Step 1.0 — configuration système ──────────────────────────────────────────

export interface SystemCheckResult {
  passed: boolean
  errors: string[]
  extensions: Record<string, number | string>
  variables: Record<string, number | string>
}

export function checkSystemConfig(): Promise<SystemCheckResult> {
  return apiFetch<SystemCheckResult>('systemCheck')
}

// ─── Step 1 — modules Apache ────────────────────────────────────────────────────

export interface ApacheCheckResult {
  passed: boolean
  errors: string[]
  modules: Record<string, boolean>
}

export function checkApacheModules(): Promise<ApacheCheckResult> {
  return apiFetch<ApacheCheckResult>('apacheCheck')
}

// ─── Step 1.1 — vhost / variables d'environnement ──────────────────────────────

export interface VhostCheckResult {
  passed: boolean
  errors: Record<string, string>
  platform: string | null
  module: string | null
}

export function checkVhost(): Promise<VhostCheckResult> {
  return apiFetch<VhostCheckResult>('vhostCheck')
}

// ─── Step 1.2 — droits fichiers ─────────────────────────────────────────────────

export interface FsRightsCheckResult {
  passed: boolean
  errors: string[]
  directories: Record<string, number | string>
}

export function checkFsRights(): Promise<FsRightsCheckResult> {
  return apiFetch<FsRightsCheckResult>('fsRightsCheck')
}

// ─── Step 1.3 — environnement(s) ────────────────────────────────────────────────

/** Environnement par défaut, non modifiable (nom = MELIS_PLATFORM, domaine = SERVER_NAME). */
export interface DefaultEnvironment {
  name: string | null
  domain: string | null
  sendEmail: boolean
  errorReporting: boolean
}

export function getDefaultEnvironment(): Promise<DefaultEnvironment> {
  return apiFetch<DefaultEnvironment>('defaultEnvironment')
}

export interface EnvironmentInput {
  name: string
  domain: string
  sendEmail: boolean
  errorReporting: number
}

export interface CurrentPlatformInput {
  domain: string
  sendEmail: boolean
  errorReporting: number
}

export function createEnvironment(
  currentPlatform: CurrentPlatformInput,
  environments: EnvironmentInput[],
): Promise<{ saved: boolean }> {
  return apiFetch('createEnvironment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPlatform, environments }),
  })
}

// ─── Step 2.0 — connexion base de données ──────────────────────────────────────

export interface DbConnectionInput {
  hostname: string
  database: string
  username: string
  password: string
}

export interface DbConnectionResult {
  passed: boolean
  errors: Record<string, string>
}

export function testDatabaseConnection(input: DbConnectionInput): Promise<DbConnectionResult> {
  return apiFetch<DbConnectionResult>('testDatabaseConnection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

// ─── Step 3.1 — sélection des modules à installer ──────────────────────────────

export interface ModuleCatalogEntry {
  name: string
  package: string
  active: boolean
  title: string
  version: string
  subtitle: string
  /** Modules à cocher obligatoirement avec celui-ci (noms de modules, cf. dependencyChecker legacy). */
  dependencies: string[]
}

export interface SiteCatalogEntry {
  module: string
  package: string
  title: string
  description: string
}

export interface ModuleCatalog {
  modules: ModuleCatalogEntry[]
  sites: SiteCatalogEntry[]
  languages: { value: string; label: string }[]
  /** Valeur par défaut du module du site (MELIS_MODULE, issu du vhost). */
  websiteModule: string
  selection: {
    site: string | null
    websiteName: string
    websiteModule: string
    language: string | null
    modules: string[]
  }
}

export function listAvailableModules(): Promise<ModuleCatalog> {
  return apiFetch<ModuleCatalog>('listModules')
}

export interface ModuleSelectionInput {
  webOption: string
  site: { module: string; package: string } | null
  modules: { name: string; package: string }[]
  language: string | null
  websiteName: string
  websiteModule: string
}

export function saveModuleSelection(input: ModuleSelectionInput): Promise<{ count: number; site: string }> {
  return apiFetch('saveModuleSelection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

// ─── Step 3.2 — téléchargement + activation ────────────────────────────────────

export interface DownloadModulesResult {
  downloaded: string[]
  alreadyPresent: string[]
}

/** Peut être long (appel composer réseau) — pas de timeout côté fetch. */
export function downloadModules(): Promise<DownloadModulesResult> {
  return apiFetch<DownloadModulesResult>('downloadModules', { method: 'POST' })
}

export function activateModules(): Promise<{ modules: string[] }> {
  return apiFetch('activateModules', { method: 'POST' })
}

// ─── Steps 3.2 / 3.3 / fin — endpoints du carousel legacy ──────────────────────
// Ces étapes rejouent la chaîne d'installation du legacy à l'identique (cf. `setup.js` :
// addModulesToComposer → downloadModules → execDbDeploy → checkSiteModule →
// installSiteModule → rebuildAutoloader → activateModules → reprocessDbDeploy).

async function legacyFetch(action: string, opts?: RequestInit): Promise<Response> {
  const res = await fetch(`${LEGACY}/${action}`, {
    ...opts,
    headers: { ...XHR_HEADER, ...(opts?.headers ?? {}) },
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${action}`)
  return res
}

async function legacyText(action: string): Promise<string> {
  return (await legacyFetch(action)).text()
}

async function legacyJson<T>(action: string): Promise<T> {
  return (await legacyFetch(action)).json() as Promise<T>
}

/**
 * Ajoute les modules sélectionnés au composer.json et lance le téléchargement, en streamant
 * la sortie composer au fil de l'eau (équivalent du `xhrFields.onprogress` legacy).
 */
export async function addModulesToComposer(onChunk: (text: string) => void): Promise<void> {
  const res = await legacyFetch('addModulesToComposer')
  const body = res.body
  if (!body) {
    onChunk(await res.text())
    return
  }
  const reader = body.getReader()
  const decoder = new TextDecoder()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}

/** `composer update` — peut être très long, aucun timeout côté client. */
export function legacyDownloadModules(): Promise<string> {
  return legacyText('downloadModules')
}

export function execDbDeploy(): Promise<string> {
  return legacyText('execDbDeploy')
}

export function reprocessDbDeploy(): Promise<{ success: number }> {
  return legacyJson('reprocessDbDeploy')
}

export interface SiteModuleCheck {
  success: number
  hasSite: boolean | null
  siteName: string | null
  isMultiFramework: boolean
}

export function checkSiteModule(): Promise<SiteModuleCheck> {
  return legacyJson<SiteModuleCheck>('checkSiteModule')
}

export function installSiteModule(): Promise<{ success: number; message: string }> {
  return legacyJson('installSiteModule')
}

/** Renvoie la sortie composer en HTML (et non du JSON), comme le `dataType: "html"` legacy. */
export function rebuildAutoloader(): Promise<string> {
  return legacyText('rebuildAutoloader')
}

export function legacyActivateModules(): Promise<string> {
  return legacyText('activateModules')
}

/** HTML des formulaires de configuration par module (un onglet par module). */
export function getModuleConfigurationForms(): Promise<string> {
  return legacyText('getModuleConfigurationForms')
}

export interface ModuleConfigResult {
  success: number | boolean
  /** Liste par module — `[{name, message, errors: {champ: {validateur: message, label}}}]`. */
  errors?: unknown
}

export function validateModuleConfigurationForm(query: string): Promise<ModuleConfigResult> {
  return legacyJson<ModuleConfigResult>(`validateModuleConfigurationForm?${query}`)
}

export function submitModuleConfigurationForm(query: string): Promise<ModuleConfigResult> {
  return legacyJson<ModuleConfigResult>(`submitModuleConfigurationForm?${query}`)
}

// ─── Étape finale — adoption de MELIS_MODULE ───────────────────────────────────

export interface ModuleApplyState {
  /** `applied` (pris en compte), `failed`, `pending` (en cours), `idle` (rien demandé). */
  state: 'applied' | 'failed' | 'pending' | 'idle'
  module: string
  /** Valeur actuellement vue par PHP (`getenv('MELIS_MODULE')`). */
  current: string
  error?: string
}

/**
 * Demande au conteneur d'adopter le module de site choisi dans le wizard comme MELIS_MODULE.
 * À appeler AVANT `finalizeSetup`, qui débranche MelisInstaller et donc cette route.
 */
export function applyModule(module?: string): Promise<{
  /** `skipped` s'ajoute aux états ci-dessus : aucun module de site n'a été installé. */
  state: ModuleApplyState['state'] | 'skipped'
  module: string
  current: string
}> {
  return apiFetch('applyModule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(module ? { module } : {}),
  })
}

export function getModuleState(): Promise<ModuleApplyState> {
  return apiFetch<ModuleApplyState>('moduleState')
}

export function finalizeSetup(): Promise<{ success: number; errors: unknown[]; logs: string[] }> {
  return legacyJson('finalizeSetup')
}
