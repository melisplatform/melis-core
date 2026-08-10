const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoleItem {
  id: number
  name: string
  userCount: number
  creationDate: string | null
}

export interface RoleListResult {
  items: RoleItem[]
  total: number
  page: number
  limit: number
}

export interface RoleListParams {
  page?: number
  limit?: number
  search?: string
}

export interface RoleStats {
  total: number
  assignedUsers: number
  unused: number
}

export interface RoleDetail {
  id: number
  name: string
  rights: string
}

export interface RoleSavePayload {
  id?: number | null
  name: string
  rights: string
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

// ─── Roles ──────────────────────────────────────────────────────────────────────

export async function fetchRoles(params: RoleListParams = {}): Promise<RoleListResult> {
  const qs = new URLSearchParams()
  if (params.page)   qs.set('page',   String(params.page))
  if (params.limit)  qs.set('limit',  String(params.limit))
  if (params.search) qs.set('search', params.search)
  return apiFetch<RoleListResult>(`/melis/react-api/roles-list?${qs}`)
}

export async function fetchRoleStats(): Promise<RoleStats> {
  return apiFetch<RoleStats>('/melis/react-api/roles/stats')
}

export async function fetchRoleById(id: number): Promise<RoleDetail> {
  return apiFetch<RoleDetail>(`/melis/react-api/roles/${id}`)
}

export async function saveRole(payload: RoleSavePayload): Promise<{ id: number }> {
  return apiFetch<{ id: number }>('/melis/react-api/roles/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteRole(id: number): Promise<void> {
  await apiFetch<null>(`/melis/react-api/roles/delete/${id}`, { method: 'DELETE' })
}
