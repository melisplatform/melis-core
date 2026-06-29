/**
 * Client API de l'outil "Thème de la plateforme" (couleurs + logos/favicon du BO).
 * Enveloppe standard MelisReactApi : { success, data?, error? }.
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

/** Clés couleurs telles que stockées (pscheme_colors) et lues par getStyleColorCss. */
export type SchemeColors = {
  melis_core_platform_color_primary_color: string
  melis_core_platform_color_secondary_color: string
  melis_core_platform_color_sidebar_bg_color: string
  melis_core_platform_color_login_link_color: string
}

export interface PlatformScheme {
  colors: SchemeColors
  sidebar_header_text: string
  sidebar_header_logo: string
  login_logo: string
  login_background: string
  favicon: string
}

async function apiFetch<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: { ...XHR_HEADER, ...(opts?.headers ?? {}) },
    credentials: 'include',
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const d = (await res.json()) as { error?: string }; if (d.error) msg = d.error } catch { /* ignore */ }
    throw new Error(msg)
  }
  const data = (await res.json()) as { success: boolean; data?: T; error?: string }
  if (!data.success) throw new Error(data.error ?? 'API error')
  return data.data as T
}

/** Schéma actif courant. */
export async function fetchScheme(): Promise<PlatformScheme> {
  const data = await apiFetch<{ scheme: PlatformScheme }>('/melis/react-api/platformscheme')
  return data.scheme
}

/** Enregistre le schéma (base + régénère schemes.css côté serveur). */
export async function saveScheme(scheme: PlatformScheme): Promise<void> {
  await apiFetch<{ saved: boolean }>('/melis/react-api/platformscheme/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheme }),
  })
}

/** Réinitialise au thème par défaut. */
export async function resetScheme(): Promise<void> {
  await apiFetch<{ reset: boolean }>('/melis/react-api/platformscheme/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}
