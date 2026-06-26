/**
 * Client API de l'outil "Modules" (activation + ordre de chargement des modules).
 * Enveloppe standard MelisReactApi : { success, data?, error? }.
 */

const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ModuleItem {
  /** Nom (namespace) du module, ex. 'MelisCmsNews'. */
  name: string
  /** Actif dans config/melis.module.load.php ? */
  active: boolean
  /** Version (composer.json / docblock), ex. '2.0'. */
  version: string
  /** Nom du package composer, ex. 'melisplatform/melis-cms-news'. */
  package: string
  /** Modules (activables) requis par celui-ci. */
  requires: string[]
  /** Modules (activables) qui dépendent de celui-ci. */
  dependents: string[]
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

/** Liste ordonnée des modules activables (actifs d'abord, dans l'ordre de chargement). */
export async function fetchModules(): Promise<ModuleItem[]> {
  const data = await apiFetch<{ modules: ModuleItem[] }>('/melis/react-api/modules')
  return data.modules
}

/**
 * Sauve l'activation + l'ordre. `orderedActive` = noms des modules à activer,
 * dans l'ordre de chargement voulu. Réécrit config/melis.module.load.php.
 */
export async function saveModules(orderedActive: string[]): Promise<{ count: number }> {
  return apiFetch<{ count: number }>('/melis/react-api/modules/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modules: orderedActive }),
  })
}
