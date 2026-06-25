/**
 * Client de l'API Plateformes (outil natif MelisCore migré en full React).
 * Calqué sur `user-api.ts` — même contrat `{ success, data, error }`, même HTTP client.
 * Backend : MelisReactApiPlatformController (vendor/melisplatform/melis-react-api).
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// ─── Signal « liste périmée » ───────────────────────────────────────────────────
// La liste est montée en permanence (Shell) → elle ne se re-monte pas au retour du
// formulaire. Le formulaire pose ce flag au save ; la liste le consomme au retour.
let _platformsListStale = false
export function markPlatformsListStale(): void { _platformsListStale = true }
export function consumePlatformsListStale(): boolean {
  const stale = _platformsListStale
  _platformsListStale = false
  return stale
}

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface PlatformItem {
  id: number
  name: string
  marketplace: boolean
  cache: boolean
  /** Plateforme courante (env MELIS_PLATFORM) → non renommable / non supprimable. */
  isCurrent: boolean
}

export interface PlatformStats {
  total: number
  marketplace: number
  cache: number
}

export interface PlatformListParams {
  page?: number
  limit?: number
  search?: string
}

export interface PlatformListResult {
  items: PlatformItem[]
  total: number
  page: number
  limit: number
}

export interface PlatformSavePayload {
  id?: number | null
  name: string
  marketplace: boolean
  cache: boolean
}

// ─── HTTP client ──────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
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

// ─── Endpoints ──────────────────────────────────────────────────────────────────

export async function fetchPlatforms(params: PlatformListParams = {}): Promise<PlatformListResult> {
  const qs = new URLSearchParams()
  if (params.page)   qs.set('page',   String(params.page))
  if (params.limit)  qs.set('limit',  String(params.limit))
  if (params.search) qs.set('search', params.search)
  return apiFetch<PlatformListResult>(`/melis/react-api/platforms?${qs}`)
}

export async function fetchPlatformById(id: number): Promise<PlatformItem> {
  return apiFetch<PlatformItem>(`/melis/react-api/platforms/${id}`)
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  return apiFetch<PlatformStats>('/melis/react-api/platforms/stats')
}

export async function savePlatform(payload: PlatformSavePayload): Promise<{ id: number }> {
  return apiFetch<{ id: number }>('/melis/react-api/platforms/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deletePlatform(id: number): Promise<void> {
  await apiFetch<null>(`/melis/react-api/platforms/delete/${id}`, { method: 'DELETE' })
}
