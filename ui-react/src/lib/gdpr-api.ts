/**
 * Client API de l'outil "GDPR / RGPD" (volet droits des personnes : recherche,
 * extraction XML, suppression). Enveloppe standard MelisReactApi { success, data?, error? }.
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GdprColumn { key: string; text: string }
export interface GdprRow { id: string; cells: Record<string, string> }

export interface GdprModuleResult {
  /** Nom du module (affichage). */
  module: string
  /** Clé du module (= clé utilisée pour l'extraction/suppression). */
  key: string
  /** Icône (classe FontAwesome legacy, ex. 'fa-user'). */
  icon: string
  columns: GdprColumn[]
  rows: GdprRow[]
  count: number
}

/** Critères de recherche (au moins un requis). */
export interface GdprSearch {
  user_name?: string
  user_email?: string
}

/** Sélection à extraire/supprimer : { cléModule: [ids] }. */
export type GdprSelection = Record<string, string[]>

// ─── Client HTTP ──────────────────────────────────────────────────────────────

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

// ─── Endpoints ────────────────────────────────────────────────────────────────

/** Recherche les données d'une personne à travers les modules. */
export async function searchGdpr(search: GdprSearch): Promise<GdprModuleResult[]> {
  const data = await apiFetch<{ modules: GdprModuleResult[] }>('/melis/react-api/gdpr/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ search }),
  })
  return data.modules
}

/** Extrait la sélection en XML (portabilité). Retourne le contenu XML. */
export async function extractGdpr(selected: GdprSelection): Promise<{ xml: string; filename: string; empty: boolean }> {
  return apiFetch<{ xml: string; filename: string; empty: boolean }>('/melis/react-api/gdpr/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selected }),
  })
}

/** Supprime la sélection à travers les modules (droit à l'effacement). */
export async function deleteGdpr(selected: GdprSelection): Promise<{ allDeleted: boolean; results: Record<string, boolean> }> {
  return apiFetch<{ allDeleted: boolean; results: Record<string, boolean> }>('/melis/react-api/gdpr/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selected }),
  })
}

// ─── Types communs ──────────────────────────────────────────────────────────
export interface SiteOption { id: number; label: string }
export interface LangOption { id: number; name: string }

// ═══ SMTP ═════════════════════════════════════════════════════════════════════
export interface SmtpConfig { id: number | null; host: string; username: string; hasPassword: boolean }

export async function fetchSmtp(): Promise<SmtpConfig> {
  return apiFetch<SmtpConfig>('/melis/react-api/gdpr/smtp')
}
export async function saveSmtp(p: { id: number; host: string; username: string; password: string; confirm: string }): Promise<{ id: number }> {
  return apiFetch<{ id: number }>('/melis/react-api/gdpr/smtp/save', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p),
  })
}
export async function deleteSmtp(id: number): Promise<void> {
  await apiFetch<unknown>('/melis/react-api/gdpr/smtp/delete', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
  })
}

// ═══ Banners ══════════════════════════════════════════════════════════════════
export interface BannerMeta { available: boolean; sites: SiteOption[]; langs: LangOption[] }
export interface BannerText { id: number; value: string }

export async function fetchBannerMeta(): Promise<BannerMeta> {
  return apiFetch<BannerMeta>('/melis/react-api/gdpr/banner/meta')
}
export async function fetchBanner(siteId: number): Promise<Record<string, BannerText>> {
  const d = await apiFetch<{ texts: Record<string, BannerText> }>(`/melis/react-api/gdpr/banner?siteId=${siteId}`)
  return d.texts
}
export async function saveBanner(siteId: number, contents: Record<string, BannerText>): Promise<void> {
  await apiFetch<unknown>('/melis/react-api/gdpr/banner/save', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId, contents }),
  })
}

// ═══ Auto-Delete / Anonymisation ══════════════════════════════════════════════
export interface AdMeta { modules: { key: string; label: string }[]; sites: SiteOption[]; langs: LangOption[] }
export interface AdConfig {
  id: number; siteId: number; siteLabel: string; module: string
  alertStatus: boolean; alertDays: number; resend: boolean; deleteDays: number
  fromName: string; fromEmail: string; replyTo: string; layoutTitle: string; layoutDesc: string
}
export interface AdEmail { id: number; subject: string; html: string; text: string; link: number }
export interface AdEmails { warning: Record<string, AdEmail>; delete: Record<string, AdEmail> }
export interface AdLog {
  id: number; date: string; module: string
  warning1Ok: number; warning1Ko: number; warning2Ok: number; warning2Ko: number; deleteOk: number; deleteKo: number
}

export async function fetchAdMeta(): Promise<AdMeta> {
  return apiFetch<AdMeta>('/melis/react-api/gdpr/autodelete/meta')
}
export async function fetchAdConfigs(): Promise<AdConfig[]> {
  const d = await apiFetch<{ configs: AdConfig[] }>('/melis/react-api/gdpr/autodelete/configs')
  return d.configs
}
export async function fetchAdConfig(id: number): Promise<{ config: AdConfig; emails: AdEmails }> {
  return apiFetch<{ config: AdConfig; emails: AdEmails }>(`/melis/react-api/gdpr/autodelete/config?id=${id}`)
}
export async function saveAdConfig(payload: { config: Partial<AdConfig> & { id: number }; emails: AdEmails }): Promise<{ id: number }> {
  return apiFetch<{ id: number }>('/melis/react-api/gdpr/autodelete/config/save', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  })
}
export async function deleteAdConfig(id: number): Promise<void> {
  await apiFetch<unknown>('/melis/react-api/gdpr/autodelete/config/delete', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
  })
}
export async function runAd(): Promise<{ status: boolean; message: string }> {
  return apiFetch<{ status: boolean; message: string }>('/melis/react-api/gdpr/autodelete/run', { method: 'POST' })
}
export async function fetchAdLogs(): Promise<AdLog[]> {
  const d = await apiFetch<{ logs: AdLog[] }>('/melis/react-api/gdpr/autodelete/logs')
  return d.logs
}
