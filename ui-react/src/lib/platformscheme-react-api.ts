/**
 * Client API du thème du back-office REACT — interface DISTINCTE du legacy "Platform theme".
 * Données : table melis_core_platform_scheme_react (images mono-valeur) + table
 * melis_core_platform_scheme_react_trans (textes traduits par langue du BO).
 * Enveloppe standard { success, data?, error? }.
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

export interface ThemeLang { id: number; locale: string; name: string }

/** Traductions par champ : { langId(string) => valeur }. */
export interface ReactSchemeTranslations {
  loginTitle: Record<string, string>
  loginSubtitle: Record<string, string>
}

/** Thème React complet (branding du BO). Valeurs vides = défauts in-app. */
export interface ReactScheme {
  /** Logo haut-gauche du BO connecté. */
  headerLogo: string
  /** Panneau gauche du login : logo. */
  loginLogo: string
  /** Panneau gauche du login : image de fond (vide = dégradé du thème). */
  loginBackground: string
  /** Textes traduisibles du login (titre/sous-titre) par langue du BO. */
  translations: ReactSchemeTranslations
  /** Langues du back-office (pour l'éditeur : drapeaux + résolution côté login). */
  languages: ThemeLang[]
  /** Version de la plateforme (= version du module MelisCore), pour le footer. Lecture seule. */
  version: string
}

export const EMPTY_SCHEME: ReactScheme = {
  headerLogo: '', loginLogo: '', loginBackground: '',
  translations: { loginTitle: {}, loginSubtitle: {} },
  languages: [],
  version: '',
}

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

interface RawScheme {
  scheme: { headerLogo: string; loginLogo: string; loginBackground: string }
  translations: ReactSchemeTranslations
  languages: ThemeLang[]
  version: string
}

export async function fetchReactScheme(): Promise<ReactScheme> {
  const d = await apiFetch<RawScheme>('/melis/react-api/platformscheme-react')
  return {
    headerLogo: d.scheme?.headerLogo ?? '',
    loginLogo: d.scheme?.loginLogo ?? '',
    loginBackground: d.scheme?.loginBackground ?? '',
    translations: {
      loginTitle: d.translations?.loginTitle ?? {},
      loginSubtitle: d.translations?.loginSubtitle ?? {},
    },
    languages: d.languages ?? [],
    version: d.version ?? '',
  }
}

export interface ReactSchemeSavePayload {
  scheme: { headerLogo: string; loginLogo: string; loginBackground: string }
  translations: ReactSchemeTranslations
}

export async function saveReactScheme(payload: ReactSchemeSavePayload): Promise<void> {
  await apiFetch('/melis/react-api/platformscheme-react/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/** Restaure le thème par défaut (vide toutes les valeurs → défauts in-app). Miroir du legacy. */
export async function resetReactScheme(): Promise<void> {
  await apiFetch('/melis/react-api/platformscheme-react/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}
