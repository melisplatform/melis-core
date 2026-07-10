/**
 * Client de l'API « Mon compte » (meliscore_user_profile) — édition du profil de l'utilisateur
 * courant. Contrat `{ success, data, error }`, même client HTTP que les autres outils.
 * Backend : MelisCore\Controller\MelisReactApiUserProfileController.
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

export interface AccountLang {
  id: number
  locale: string
  name: string
}

export interface AccountProfile {
  id: number
  login: string
  email: string
  firstName: string
  lastName: string
  roleName: string
  langId: number
  isAdmin: boolean
  creationDate: string | null
  /** Avatar en data URI (ou null si aucun). */
  image: string | null
  languages: AccountLang[]
}

export interface AccountSavePayload {
  email: string
  langId: number
  /** Optionnel : renseigné seulement pour changer le mot de passe. */
  password?: string
  confirmPassword?: string
  /** data URI (nouvel avatar), '' (efface) ou undefined (inchangé). */
  image?: string
}

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

export async function fetchAccount(): Promise<AccountProfile> {
  return apiFetch<AccountProfile>('/melis/react-api/user-profile')
}

export async function saveAccount(payload: AccountSavePayload): Promise<{ id: number; reload: boolean }> {
  return apiFetch<{ id: number; reload: boolean }>('/melis/react-api/user-profile/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
