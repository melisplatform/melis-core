const XHR_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserRole {
  id: number
  name: string
}

export interface UserItem {
  id: number
  status: 0 | 1
  login: string
  email: string
  firstname: string
  lastname: string
  roleId: number
  roleName: string
  isAdmin: boolean
  tags: string
  creationDate: string | null
  lastLoginDate: string | null
  isOnline: boolean
}

export interface UserDetail extends UserItem {
  langId: number
  rights: string
}

export interface UserConnection {
  id: number
  loginDate: string | null
  connectionTime: string | null
}

export interface UserMicroservice {
  id: number
  status: boolean
  apiKey: string
}

export interface UserListResult {
  items: UserItem[]
  total: number
  page: number
  limit: number
}

export interface UserListParams {
  page?: number
  limit?: number
  search?: string
  status?: '' | '0' | '1'
  roleId?: number
}

export interface UserSavePayload {
  id?: number | null
  login: string
  email: string
  firstname: string
  lastname: string
  roleId: number
  status: 0 | 1
  isAdmin: boolean
  langId?: number
  tags?: string
  password?: string
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  adminCount: number
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

// ─── Users ────────────────────────────────────────────────────────────────────

export async function fetchUsers(params: UserListParams = {}): Promise<UserListResult> {
  const qs = new URLSearchParams()
  if (params.page)   qs.set('page',   String(params.page))
  if (params.limit)  qs.set('limit',  String(params.limit))
  if (params.search) qs.set('search', params.search)
  if (params.status !== undefined && params.status !== '') qs.set('status', params.status)
  if (params.roleId) qs.set('roleId', String(params.roleId))
  return apiFetch<UserListResult>(`/melis/react-api/users?${qs}`)
}

export async function fetchUserById(id: number): Promise<UserDetail> {
  return apiFetch<UserDetail>(`/melis/react-api/users/${id}`)
}

export async function saveUser(payload: UserSavePayload): Promise<{ id: number; self?: boolean }> {
  return apiFetch<{ id: number; self?: boolean }>('/melis/react-api/users/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteUser(id: number): Promise<void> {
  await apiFetch<null>(`/melis/react-api/users/delete/${id}`, { method: 'DELETE' })
}

export async function fetchUserStats(): Promise<UserStats> {
  return apiFetch<UserStats>('/melis/react-api/users/stats')
}

export async function fetchRoles(): Promise<UserRole[]> {
  return apiFetch<UserRole[]>('/melis/react-api/roles')
}

export async function fetchUserConnections(id: number): Promise<UserConnection[]> {
  return apiFetch<UserConnection[]>(`/melis/react-api/users/${id}/connections`)
}

export async function fetchUserMicroservice(id: number): Promise<UserMicroservice | null> {
  return apiFetch<UserMicroservice | null>(`/melis/react-api/users/${id}/microservice`)
}

export async function saveMicroservice(
  id: number,
  action: 'toggle' | 'generate',
): Promise<UserMicroservice> {
  return apiFetch<UserMicroservice>(`/melis/react-api/users/${id}/microservice/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  })
}
