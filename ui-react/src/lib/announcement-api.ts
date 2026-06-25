/**
 * Client de l'API Annonces (outil natif MelisCore migré en full React).
 * Calqué sur `platform-api.ts` — même contrat `{ success, data, error }`, même HTTP client.
 * Backend : MelisReactApiAnnouncementController (vendor/melisplatform/melis-react-api).
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// ─── Signal « liste périmée » ───────────────────────────────────────────────────
// La liste est montée en permanence (Shell) → elle ne se re-monte pas au retour du
// formulaire. Le formulaire pose ce flag au save ; la liste le consomme au retour.
let _announcementsListStale = false
export function markAnnouncementsListStale(): void { _announcementsListStale = true }
export function consumeAnnouncementsListStale(): boolean {
  const stale = _announcementsListStale
  _announcementsListStale = false
  return stale
}

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface AnnouncementItem {
  id: number
  status: boolean
  title: string
  /** Contenu HTML (rendu tel quel sur le dashboard « Actualités »). */
  text: string
  date: string
  userId: number
  userName: string
}

export interface AnnouncementStats {
  total: number
  active: number
  inactive: number
}

export interface AnnouncementListParams {
  page?: number
  limit?: number
  search?: string
  status?: '' | '0' | '1'
}

export interface AnnouncementListResult {
  items: AnnouncementItem[]
  total: number
  page: number
  limit: number
}

export interface AnnouncementSavePayload {
  id?: number | null
  title: string
  text: string
  status: boolean
  /** datetime optionnel (`Y-m-d\TH:i`) — vide = date courante côté serveur. */
  date?: string
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

export async function fetchAnnouncements(params: AnnouncementListParams = {}): Promise<AnnouncementListResult> {
  const qs = new URLSearchParams()
  if (params.page)   qs.set('page',   String(params.page))
  if (params.limit)  qs.set('limit',  String(params.limit))
  if (params.search) qs.set('search', params.search)
  if (params.status) qs.set('status', params.status)
  return apiFetch<AnnouncementListResult>(`/melis/react-api/announcements?${qs}`)
}

export async function fetchAnnouncementById(id: number): Promise<AnnouncementItem> {
  return apiFetch<AnnouncementItem>(`/melis/react-api/announcements/${id}`)
}

export async function fetchAnnouncementStats(): Promise<AnnouncementStats> {
  return apiFetch<AnnouncementStats>('/melis/react-api/announcements/stats')
}

export async function saveAnnouncement(payload: AnnouncementSavePayload): Promise<{ id: number }> {
  return apiFetch<{ id: number }>('/melis/react-api/announcements/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await apiFetch<null>(`/melis/react-api/announcements/delete/${id}`, { method: 'DELETE' })
}
