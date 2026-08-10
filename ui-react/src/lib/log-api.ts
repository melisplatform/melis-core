/**
 * Client de l'API Logs du back-office (outil natif MelisCore migré en full React).
 * Outil EN LECTURE SEULE : pas de save/delete. Calqué sur `platform-api.ts` pour le
 * contrat `{ success, data, error }` et le HTTP client.
 * Backend : MelisReactApiLogController (vendor/melisplatform/melis-react-api).
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface LogItem {
  id: number
  title: string
  message: string
  typeId: number | null
  typeCode: string
  status: number
  itemId: number | null
  userId: number
  userName: string
  date: string
}

export interface LogStats {
  total: number
  today: number
  types: number
}

export interface LogTypeOption { id: number; code: string }
export interface LogUserOption { id: number; name: string }
export interface LogTitleOption { key: string; label: string }
export interface LogFilters {
  isAdmin: boolean
  types: LogTypeOption[]
  users: LogUserOption[]
  titles: LogTitleOption[]
}

export type LogSortKey = 'id' | 'date' | 'type' | 'title' | 'message' | 'user' | 'itemId'

export interface LogListParams {
  limit?: number
  search?: string
  type?: number | null
  title?: string | null
  user?: number | null
  startDate?: string
  endDate?: string
  sort?: LogSortKey
  dir?: 'asc' | 'desc'
  /** Curseur keyset (opaque) du lot précédent ; absent = premier lot. */
  after?: string | null
}

export interface LogListResult {
  items: LogItem[]
  total: number
  /** Curseur keyset à repasser en `after` pour le lot suivant ; null = fin de liste. */
  nextCursor: string | null
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

export async function fetchLogs(params: LogListParams = {}): Promise<LogListResult> {
  const qs = new URLSearchParams()
  if (params.limit)     qs.set('limit',  String(params.limit))
  if (params.search)    qs.set('search', params.search)
  if (params.type)      qs.set('type',   String(params.type))
  if (params.title)     qs.set('title',  params.title)
  if (params.user)      qs.set('user',   String(params.user))
  if (params.startDate) qs.set('startDate', params.startDate)
  if (params.endDate)   qs.set('endDate',   params.endDate)
  if (params.sort)      qs.set('sort',   params.sort)
  if (params.dir)       qs.set('dir',    params.dir)
  if (params.after)     qs.set('after',  params.after)
  return apiFetch<LogListResult>(`/melis/react-api/logs?${qs}`)
}

export async function fetchLogStats(): Promise<LogStats> {
  return apiFetch<LogStats>('/melis/react-api/logs/stats')
}

export async function fetchLogFilters(): Promise<LogFilters> {
  return apiFetch<LogFilters>('/melis/react-api/logs/filters')
}
