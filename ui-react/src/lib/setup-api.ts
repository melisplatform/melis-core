const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// Endpoints du wizard d'installation React — servis par MelisInstaller (pas melis-react-api),
// route existante /melis/MelisInstaller/SetupReactApi/<action>, déjà publique (whitelistée dans
// Module.php côté MelisInstaller) — aucune auth, aucune session platform requise.
const BASE = '/melis/MelisInstaller/SetupReactApi'

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
}

export function listAvailableModules(): Promise<{ modules: ModuleCatalogEntry[] }> {
  return apiFetch('listModules')
}

export function saveModuleSelection(modules: { name: string; package: string }[]): Promise<{ count: number }> {
  return apiFetch('saveModuleSelection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modules }),
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
