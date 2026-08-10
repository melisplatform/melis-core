/**
 * Client API de l'outil "Emails Management" (CRUD des emails transactionnels BO,
 * multilingue). Enveloppe standard MelisReactApi { success, data?, error? }.
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// ─── Signal « liste périmée » (refetch après save côté liste persistante) ──────
let _stale = false
export function markEmailsListStale(): void { _stale = true }
export function consumeEmailsListStale(): boolean { const s = _stale; _stale = false; return s }

// ─── Types ──────────────────────────────────────────────────────────────────
export interface EmailLang { id: number; name: string; locale: string }
export interface EmailListItem {
  codename: string; name: string; fromName: string; fromEmail: string; replyTo: string; inDb: boolean
}
export type EmailSortKey = 'name' | 'codename' | 'fromName' | 'fromEmail' | 'source'

export interface EmailListParams {
  limit?: number
  search?: string
  sort?: EmailSortKey
  dir?: 'asc' | 'desc'
  /** Curseur keyset (opaque) ; toujours null ici (liste courte, un seul lot). */
  after?: string | null
}

export interface EmailListResult {
  items: EmailListItem[]
  total: number
  /** Toujours null (pas de scroll) — la liste tient en un lot. */
  nextCursor: string | null
  langs: EmailLang[]
}

export interface EmailContent { boedId: number; subject: string; html: string; text: string }
export interface EmailDetail {
  codename: string; name: string; fromName: string; fromEmail: string; replyTo: string
  tags: string; layout: string; layoutTitle: string; layoutFtrInfo: string; inDb: boolean
  contents: Record<string, EmailContent>
}
export interface EmailSavePayload {
  isNew: boolean; codename: string; name: string; fromName: string; fromEmail: string; replyTo: string
  tags: string; layout: string; layoutTitle: string; layoutFtrInfo: string
  contents: Record<string, EmailContent>
}

// ─── Client HTTP ──────────────────────────────────────────────────────────────
async function apiFetch<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...opts, headers: { ...XHR_HEADER, ...(opts?.headers ?? {}) }, credentials: 'include' })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const d = (await res.json()) as { error?: string }; if (d.error) msg = d.error } catch { /* ignore */ }
    throw new Error(msg)
  }
  const data = (await res.json()) as { success: boolean; data?: T; error?: string }
  if (!data.success) throw new Error(data.error ?? 'API error')
  return data.data as T
}

// ─── Endpoints ────────────────────────────────────────────────────────────────
export async function fetchEmails(params: EmailListParams = {}): Promise<EmailListResult> {
  const qs = new URLSearchParams()
  if (params.limit)  qs.set('limit',  String(params.limit))
  if (params.search) qs.set('search', params.search)
  if (params.sort)   qs.set('sort',   params.sort)
  if (params.dir)    qs.set('dir',    params.dir)
  if (params.after)  qs.set('after',  params.after)
  const q = qs.toString()
  return apiFetch<EmailListResult>(`/melis/react-api/emails${q ? `?${q}` : ''}`)
}
export async function fetchEmail(codename: string): Promise<{ email: EmailDetail; langs: EmailLang[] }> {
  return apiFetch<{ email: EmailDetail; langs: EmailLang[] }>(`/melis/react-api/emails/${encodeURIComponent(codename)}`)
}
export async function saveEmail(payload: EmailSavePayload): Promise<{ codename: string }> {
  return apiFetch<{ codename: string }>('/melis/react-api/emails/save', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  })
}
export async function deleteEmail(codename: string): Promise<void> {
  await apiFetch<unknown>(`/melis/react-api/emails/delete/${encodeURIComponent(codename)}`, { method: 'DELETE' })
}
