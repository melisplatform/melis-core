/**
 * Client API de l'outil "Autres Configurations" (onglet Core) — politique de connexion /
 * mot de passe (app.login.php). Enveloppe standard MelisReactApi : { success, data?, error? }.
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// ─── Type : les 16 clés de config (toutes en string, comme app.login.php) ──────
export interface OtherConfig {
  login_account_lock_status: string            // '1' | '0'
  login_account_admin_email: string
  login_account_lock_number_of_attempts: string
  login_account_type_of_lock: string           // 'admin' | 'timer'
  login_account_duration_days: string
  login_account_duration_hours: string
  login_account_duration_minutes: string
  password_validity_status: string             // '1' | '0'
  password_validity_lifetime: string
  password_duplicate_status: string            // '1' | '0'
  password_duplicate_lifetime: string
  password_complexity_number_of_characters: string
  password_complexity_use_special_characters: string // '1' | '0'
  password_complexity_use_lower_case: string         // '1' | '0'
  password_complexity_use_upper_case: string         // '1' | '0'
  password_complexity_use_digit: string              // '1' | '0'
}

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

/** Valeurs courantes de la politique connexion/mot de passe. */
export async function fetchOtherConfig(): Promise<OtherConfig> {
  const data = await apiFetch<{ config: OtherConfig }>('/melis/react-api/otherconfig')
  return data.config
}

/** Valide (côté Melis) + écrit app.login.php. Lève en cas d'erreur de validation. */
export async function saveOtherConfig(config: OtherConfig): Promise<void> {
  await apiFetch<{ saved: boolean }>('/melis/react-api/otherconfig/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config }),
  })
}
