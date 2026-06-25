/**
 * Client de l'API Langues du back-office (outil natif MelisCore migré en full React).
 * Calqué sur `platform-api.ts` — même contrat `{ success, data, error }`, même HTTP client.
 * Backend : MelisReactApiLanguageController (vendor/melisplatform/melis-react-api).
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// ─── Signal « liste périmée » ───────────────────────────────────────────────────
// La liste est montée en permanence (Shell) → elle ne se re-monte pas au retour du
// formulaire. Le formulaire pose ce flag au save ; la liste le consomme au retour.
let _languagesListStale = false
export function markLanguagesListStale(): void { _languagesListStale = true }
export function consumeLanguagesListStale(): boolean {
  const stale = _languagesListStale
  _languagesListStale = false
  return stale
}

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface LanguageItem {
  id: number
  locale: string
  name: string
  /** Langue par défaut (en_EN) → non renommable / non supprimable. */
  isDefault: boolean
}

export interface LanguageStats {
  total: number
}

export interface LanguageListParams {
  page?: number
  limit?: number
  search?: string
}

export interface LanguageListResult {
  items: LanguageItem[]
  total: number
  page: number
  limit: number
}

export interface LanguageSavePayload {
  id?: number | null
  name: string
  locale: string
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

export async function fetchLanguages(params: LanguageListParams = {}): Promise<LanguageListResult> {
  const qs = new URLSearchParams()
  if (params.page)   qs.set('page',   String(params.page))
  if (params.limit)  qs.set('limit',  String(params.limit))
  if (params.search) qs.set('search', params.search)
  return apiFetch<LanguageListResult>(`/melis/react-api/languages?${qs}`)
}

export async function fetchLanguageById(id: number): Promise<LanguageItem> {
  return apiFetch<LanguageItem>(`/melis/react-api/languages/${id}`)
}

export async function fetchLanguageStats(): Promise<LanguageStats> {
  return apiFetch<LanguageStats>('/melis/react-api/languages/stats')
}

export async function saveLanguage(payload: LanguageSavePayload): Promise<{ id: number }> {
  return apiFetch<{ id: number }>('/melis/react-api/languages/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteLanguage(id: number): Promise<void> {
  await apiFetch<null>(`/melis/react-api/languages/delete/${id}`, { method: 'DELETE' })
}
