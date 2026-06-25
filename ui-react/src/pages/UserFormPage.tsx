import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSubTabs } from '@/components/tabs/sub-tab-store'
import { clearTools, routeForForward } from '@/lib/tool-routes'
import {
  Activity, Calendar, Copy, Cpu, Eye, EyeOff,
  KeyRound, Loader2, RefreshCw, RotateCcw, Save, Shield, ShieldCheck,
  ToggleLeft, ToggleRight, User, UserPlus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as userApi from '@/lib/user-api'
import { RightsTreeView } from '@/components/RightsTreeView'
import { useModuleActive } from '@/lib/bricks'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleString(undefined) } catch { return d }
}

function Field({ label, required, children, error }: {
  label: string; required?: boolean; children: React.ReactNode; error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

type Tab = 'profil' | 'rights' | 'connections' | 'microservice'
const TABS: { id: Tab; labelKey: I18nKey; icon: React.ElementType }[] = [
  { id: 'profil',       labelKey: 'users.tab.profile',      icon: User },
  { id: 'rights',       labelKey: 'users.tab.rights',       icon: ShieldCheck },
  { id: 'connections',  labelKey: 'users.tab.connections',  icon: Activity },
  { id: 'microservice', labelKey: 'users.tab.microservice', icon: Cpu },
]

// ─── Tab: Connections ─────────────────────────────────────────────────────────

function ConnectionsTab({ userId }: { userId: number }) {
  const { t } = useI18n()
  const [rows, setRows]     = useState<userApi.UserConnection[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userApi.fetchUserConnections(userId).then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return <div className="flex flex-1 items-center justify-center p-6"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
      <div className="flex items-center gap-2">
        <Calendar className="size-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t('users.conn.count', { n: rows?.length ?? 0 })}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">{t('users.conn.login_date')}</th>
              <th className="px-4 py-3 text-left">{t('users.conn.time')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows?.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">{t('users.conn.empty')}</td></tr>
            ) : rows?.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{row.id}</td>
                <td className="px-4 py-2.5 tabular-nums">{fmtDate(row.loginDate)}</td>
                <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{fmtDate(row.connectionTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab: Microservice ────────────────────────────────────────────────────────

function MicroserviceTab({ userId }: { userId: number }) {
  const { t } = useI18n()
  const [data, setData]       = useState<userApi.UserMicroservice | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(false)
  const [copied, setCopied]   = useState(false)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    userApi.fetchUserMicroservice(userId).then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [userId])

  async function handleAction(action: 'toggle' | 'generate') {
    setBusy(true)
    try {
      const result = await userApi.saveMicroservice(userId, action)
      setData(result)
      if (action === 'generate') setShowKey(true)
    } catch { /* silent */ }
    finally { setBusy(false) }
  }

  async function copyKey() {
    if (!data?.apiKey) return
    await navigator.clipboard.writeText(data.apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="flex flex-1 items-center justify-center p-6"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600"><Cpu className="size-5" /></div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{t('users.ms.title')}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('users.ms.subtitle')}</p>
        </div>
      </div>

      {data ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
            <div>
              <p className="text-sm font-medium">{t('users.ms.status')}</p>
              <p className="text-xs text-muted-foreground">{t('users.ms.status_hint')}</p>
            </div>
            <button type="button" onClick={() => handleAction('toggle')} disabled={busy}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50">
              {data.status ? (
                <><ToggleRight className="size-5 text-emerald-500" /><span className="text-emerald-600">{t('users.ms.enabled')}</span></>
              ) : (
                <><ToggleLeft className="size-5 text-muted-foreground" /><span className="text-muted-foreground">{t('users.ms.disabled')}</span></>
              )}
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{t('users.ms.apikey')}</p>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => setShowKey((v) => !v)} title={showKey ? t('users.ms.hide') : t('users.ms.show')}
                  className="rounded p-1.5 hover:bg-accent transition-colors">
                  {showKey ? <EyeOff className="size-3.5 text-muted-foreground" /> : <Eye className="size-3.5 text-muted-foreground" />}
                </button>
                <button type="button" onClick={copyKey} title={t('users.ms.copy')} className="rounded p-1.5 hover:bg-accent transition-colors">
                  <Copy className="size-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
              <KeyRound className="size-3.5 shrink-0 text-muted-foreground" />
              <code className="flex-1 text-xs font-mono tracking-wider">{showKey ? data.apiKey : '•'.repeat(data.apiKey.length)}</code>
              {copied && <span className="text-xs text-emerald-600">{t('users.ms.copied')}</span>}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => handleAction('generate')} disabled={busy} className="w-full">
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}{t('users.ms.generate_new')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-10 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-muted"><Shield className="size-5 text-muted-foreground" /></div>
          <div>
            <p className="text-sm font-medium">{t('users.ms.none')}</p>
            <p className="text-xs text-muted-foreground">{t('users.ms.none_hint')}</p>
          </div>
          <Button type="button" size="sm" onClick={() => handleAction('generate')} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}{t('users.ms.generate')}
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Form data ────────────────────────────────────────────────────────────────

interface FormData {
  login: string; email: string; firstname: string; lastname: string
  roleId: number; status: 0 | 1; isAdmin: boolean
  tags: string; password: string; confirmPassword: string; rights: string
}
type Errors = Partial<Record<keyof FormData, string>>

const EMPTY_FORM: FormData = {
  login: '', email: '', firstname: '', lastname: '',
  roleId: 1, status: 1, isAdmin: false,
  tags: '', password: '', confirmPassword: '', rights: '',
}

type FormCache = { form: FormData; roles: userApi.UserRole[]; activeTab: Tab }
const _formCache = new Map<string, FormCache>()
let _rolesCache: userApi.UserRole[] | null = null

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserFormPage() {
  const navigate = useNavigate()
  const { id }   = useParams<{ id: string }>()
  const { t }    = useI18n()
  const isEdit   = Boolean(id)
  const userId   = id ? parseInt(id) : null

  const base = routeForForward('MelisCore/ToolUser') ?? '/users'
  const subTabPath = userId ? `${base}/${userId}` : `${base}/new`
  const { openTab: openSubTab, closeTab: closeSubTab, updateLabel: updateSubLabel } = useSubTabs(base)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (userId) closeSubTab(`${base}/new`)
    openSubTab({ id: subTabPath, label: isEdit ? t('common.loading') : t('users.new'), path: subTabPath })
  }, [])

  const [form, setForm]       = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors]   = useState<Errors>({})
  const [roles, setRoles]     = useState<userApi.UserRole[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved]     = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('profil')
  const rolesModuleActive = useModuleActive('MelisSmallBusiness')

  useEffect(() => {
    if (!rolesModuleActive) return
    if (_rolesCache) { setRoles(_rolesCache); return }
    userApi.fetchRoles().then(r => { _rolesCache = r; setRoles(r) }).catch(() => null)
  }, [rolesModuleActive])

  useEffect(() => {
    if (!isEdit || !userId) return
    const cached = _formCache.get(String(userId))
    if (cached) { setForm(cached.form); if (cached.roles.length) setRoles(cached.roles); setActiveTab(cached.activeTab); return }
    setLoading(true)
    userApi.fetchUserById(userId)
      .then((user) => setForm({
        login: user.login, email: user.email,
        firstname: user.firstname, lastname: user.lastname,
        roleId: user.roleId, status: user.status, isAdmin: user.isAdmin,
        tags: user.tags, password: '', confirmPassword: '', rights: user.rights ?? '',
      }))
      .catch(() => navigate(base))
      .finally(() => setLoading(false))
  }, [userId, isEdit, navigate])

  useEffect(() => {
    if (userId && form.login) _formCache.set(String(userId), { form, roles, activeTab })
  }, [form, roles, activeTab, userId])

  useEffect(() => {
    if (isEdit && (form.firstname || form.lastname)) {
      const label = `${form.firstname} ${form.lastname}`.trim() || `#${userId}`
      updateSubLabel(subTabPath, label)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.firstname, form.lastname])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: undefined }))
    setSaveError(null)
  }

  function validate(): boolean {
    const errs: Errors = {}
    if (!form.login.trim())     errs.login     = t('users.err.login')
    if (!form.email.trim())     errs.email     = t('users.err.email')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t('users.err.email_invalid')
    if (!form.firstname.trim()) errs.firstname = t('users.err.firstname')
    if (!form.lastname.trim())  errs.lastname  = t('users.err.lastname')
    if (!isEdit && !form.password) errs.password = t('users.err.password')
    if (form.password && form.password !== form.confirmPassword) errs.confirmPassword = t('users.err.password_match')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true); setSaveError(null)
    try {
      const payload: userApi.UserSavePayload = {
        id: isEdit ? userId : null,
        login: form.login, email: form.email,
        firstname: form.firstname, lastname: form.lastname,
        roleId: form.roleId, status: form.status, isAdmin: form.isAdmin, tags: form.tags,
        ...(form.rights !== undefined ? { rights: form.rights } : {}),
      }
      if (form.password) payload.password = form.password
      const res = await userApi.saveUser(payload)
      const savedId = res.id
      userApi.markUsersListStale()
      setSaved(true)
      if (!isEdit) closeSubTab(`${base}/new`)
      if (res.self) {
        clearTools()
        setTimeout(() => window.location.reload(), 700)
        return
      }
      setTimeout(() => navigate(isEdit ? `${base}/${savedId}` : base), 600)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('common.err_save'))
    } finally { setSaving(false) }
  }

  const showSave = activeTab === 'profil' || activeTab === 'rights'

  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    if (!isEdit || !userId) return
    _formCache.delete(String(userId))
    setRefreshing(true)
    setLoading(true)
    userApi.fetchUserById(userId)
      .then((user) => setForm({
        login: user.login, email: user.email,
        firstname: user.firstname, lastname: user.lastname,
        roleId: user.roleId, status: user.status, isAdmin: user.isAdmin,
        tags: user.tags, password: '', confirmPassword: '', rights: user.rights ?? '',
      }))
      .catch(() => null)
      .finally(() => { setLoading(false); setTimeout(() => setRefreshing(false), 600) })
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-6 py-3 backdrop-blur">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          {isEdit ? <User className="size-4" /> : <UserPlus className="size-4" />}
        </div>
        <h1 className="flex-1 text-base font-semibold">{isEdit ? t('users.form.edit_title') : t('users.new')}</h1>
        <Badge variant="default" className={cn('transition-colors',
          form.status === 1 ? 'text-emerald-600 bg-emerald-500/10 border-emerald-200' : 'text-red-600 bg-red-500/10 border-red-200')}>
          {form.status === 1 ? t('users.status.active') : t('users.status.inactive')}
        </Badge>
        {isEdit && (
          <button type="button" onClick={handleRefresh} title={t('common.refresh')}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <RotateCcw className={cn('size-3.5', refreshing && 'animate-spin')} />
          </button>
        )}
        {showSave && (
          <Button type="submit" size="sm" disabled={saving || saved}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saved ? t('users.form.saved') : t('common.save')}
          </Button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border px-6">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} type="button"
              disabled={!isEdit && (tab.id === 'connections' || tab.id === 'microservice')}
              onClick={() => setActiveTab(tab.id)}
              className={cn('relative -mb-px flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              <Icon className="size-3.5 shrink-0" />{t(tab.labelKey)}
            </button>
          )
        })}
      </div>

      {saveError && <div className="mx-6 mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{saveError}</div>}

      {/* ── Tab: Profil ──────────────────────────────────────────────────────── */}
      <div className={cn('flex flex-1 gap-6 overflow-auto p-6', activeTab !== 'profil' && 'hidden')}>
        <div className="flex flex-1 flex-col gap-5 min-w-0">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <User className="size-3.5" />{t('users.form.identity')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('users.field.firstname')} required error={errors.firstname}>
                <Input value={form.firstname} onChange={(e) => set('firstname', e.target.value)}
                  placeholder={t('users.field.firstname')} className={cn(errors.firstname && 'border-destructive')} />
              </Field>
              <Field label={t('users.field.lastname')} required error={errors.lastname}>
                <Input value={form.lastname} onChange={(e) => set('lastname', e.target.value)}
                  placeholder={t('users.field.lastname')} className={cn(errors.lastname && 'border-destructive')} />
              </Field>
              <Field label={t('users.field.login')} required error={errors.login}>
                <Input value={form.login} onChange={(e) => set('login', e.target.value)}
                  placeholder="login" autoComplete="off" className={cn(errors.login && 'border-destructive')} />
              </Field>
              <Field label={t('users.field.email')} required error={errors.email}>
                <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                  placeholder={t('users.ph.email')} className={cn(errors.email && 'border-destructive')} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label={t('users.field.tags')}>
                <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder={t('users.ph.tags')} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <KeyRound className="size-3.5" />{t('users.form.password_section')}{' '}
              {isEdit && <span className="normal-case font-normal">{t('users.form.password_hint')}</span>}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label={isEdit ? t('users.field.new_password') : t('users.field.password')} required={!isEdit} error={errors.password}>
                <Input type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
                  autoComplete="new-password" placeholder="••••••••" className={cn(errors.password && 'border-destructive')} />
              </Field>
              <Field label={t('users.field.confirm')} error={errors.confirmPassword}>
                <Input type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)}
                  autoComplete="new-password" placeholder="••••••••" className={cn(errors.confirmPassword && 'border-destructive')} />
              </Field>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ToggleRight className="size-3.5" />{t('users.form.status')}
            </h3>
            <button type="button" onClick={() => set('status', form.status === 1 ? 0 : 1)} className="flex items-center gap-3">
              <div className={cn('relative h-5 w-9 rounded-full transition-colors', form.status === 1 ? 'bg-emerald-500' : 'bg-border')}>
                <div className={cn('absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform', form.status === 1 ? 'translate-x-4' : 'translate-x-0.5')} />
              </div>
              <span className={cn('text-sm font-medium', form.status === 1 ? 'text-emerald-600' : 'text-muted-foreground')}>
                {form.status === 1 ? t('users.status.active') : t('users.status.inactive')}
              </span>
            </button>
          </div>

          {rolesModuleActive && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Shield className="size-3.5" />{t('users.form.role')}
              </h3>
              <select value={form.roleId} onChange={(e) => set('roleId', parseInt(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="size-3.5" />{t('users.form.rights')}
            </h3>
            <label className="flex cursor-pointer items-center gap-2.5">
              <div role="checkbox" aria-checked={form.isAdmin} tabIndex={0}
                onClick={() => set('isAdmin', !form.isAdmin)}
                onKeyDown={(e) => e.key === ' ' && set('isAdmin', !form.isAdmin)}
                className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                  form.isAdmin ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background')}>
                {form.isAdmin && (
                  <svg viewBox="0 0 12 12" fill="none" className="size-3" stroke="currentColor" strokeWidth="2"><path d="M2 6l3 3 5-5" /></svg>
                )}
              </div>
              <span className="text-sm">{t('users.form.admin')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Tab: Rights ──────────────────────────────────────────────────────── */}
      <div className={cn('flex flex-1 overflow-hidden', activeTab !== 'rights' && 'hidden')}>
        <RightsTreeView rights={form.rights} onChange={(v) => set('rights', v)} />
      </div>

      {/* ── Tab: Connections ─────────────────────────────────────────────────── */}
      {isEdit && userId && (
        <div className={cn('flex flex-1 flex-col overflow-hidden', activeTab !== 'connections' && 'hidden')}>
          <ConnectionsTab userId={userId} />
        </div>
      )}

      {/* ── Tab: Microservice ────────────────────────────────────────────────── */}
      {isEdit && userId && (
        <div className={cn('flex flex-1 flex-col overflow-hidden', activeTab !== 'microservice' && 'hidden')}>
          <MicroserviceTab userId={userId} />
        </div>
      )}
    </form>
  )
}
