import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SUBTABS_CHANGED, useSubTabs } from '@/components/tabs/sub-tab-store'
import { routeForForward } from '@/lib/tool-routes'
import {
  Activity, Calendar, Check, Circle, Copy, Cpu, ExternalLink, Eye, EyeOff,
  KeyRound, Link as LinkIcon, Loader2, RefreshCw, RotateCcw, Save, Shield, ShieldCheck,
  ToggleLeft, ToggleRight, User, UserPlus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn, copyToClipboard } from '@/lib/utils'
import * as userApi from '@/lib/user-api'
import { RightsTreeView } from '@/components/RightsTreeView'
import { useModuleActive } from '@/lib/bricks'
import { useCan } from '@/lib/capabilities'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function notify(kind: 'ok' | 'ko', title: string, message: string) {
  window.postMessage({ __melisNotif: true, kind, title, message }, '*')
}

function fmtDay(d: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString(undefined) } catch { return d }
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
              <th className="px-4 py-3 text-left">{t('users.conn.login_date')}</th>
              <th className="px-4 py-3 text-left">{t('users.conn.time_in')}</th>
              <th className="px-4 py-3 text-left">{t('users.conn.time_out')}</th>
              <th className="px-4 py-3 text-left">{t('users.conn.duration')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows?.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">{t('users.conn.empty')}</td></tr>
            ) : rows?.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2.5 tabular-nums">{fmtDay(row.loginDate)}</td>
                <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{row.timeIn ?? '—'}</td>
                <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{row.timeOut ?? '—'}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.duration ?? '—'}</td>
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
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [confirmRegen, setConfirmRegen] = useState(false)

  useEffect(() => {
    userApi.fetchUserMicroservice(userId).then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [userId])

  async function handleAction(action: 'toggle' | 'generate') {
    setConfirmRegen(false)
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
    const ok = await copyToClipboard(data.apiKey)
    if (!ok) {
      notify('ko', t('users.ms.apikey'), t('users.ms.copy_failed'))
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function copyUrl() {
    if (!data?.url) return
    const ok = await copyToClipboard(data.url)
    if (!ok) {
      notify('ko', t('users.ms.url'), t('users.ms.copy_failed'))
      return
    }
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
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
            <Button type="button" variant="outline" size="sm" onClick={() => setConfirmRegen(true)} disabled={busy} className="w-full">
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}{t('users.ms.generate_new')}
            </Button>
          </div>

          {data.url && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t('users.ms.url')}</p>
                  <p className="text-xs text-muted-foreground">{t('users.ms.url_hint')}</p>
                </div>
                <button type="button" onClick={copyUrl} title={t('users.ms.copy')} className="rounded p-1.5 hover:bg-accent transition-colors">
                  <Copy className="size-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <LinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <a href={data.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 truncate text-xs font-mono text-primary hover:underline">
                  {data.url}
                </a>
                {copiedUrl && <span className="text-xs text-emerald-600">{t('users.ms.copied')}</span>}
                <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
              </div>
            </div>
          )}
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

      {confirmRegen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-semibold">{t('users.ms.regen.title')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('users.ms.regen.confirm')}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmRegen(false)} disabled={busy}>{t('common.cancel')}</Button>
              <Button size="sm" onClick={() => handleAction('generate')} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}{t('users.ms.regen.action')}
              </Button>
            </div>
          </div>
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
// Clé = chemin du SOUS-ONGLET du user (ex. "/users/2"). Le cache préserve la saisie en cours quand
// on change d'onglet PRINCIPAL (le sous-onglet reste ouvert), MAIS il doit disparaître dès que le
// sous-onglet du user est fermé — sinon rouvrir le user réaffiche les droits ÉDITÉS non sauvés
// (ticket 0010558). On purge donc toute entrée dont le sous-onglet n'est plus ouvert, à chaque
// changement de la liste des sous-onglets (croix du SubTabBar, ou fermeture de l'onglet principal
// Users → CLOSE_ALL). Listener module-niveau (persistant) : le composant est démonté à la fermeture.
const _formCache = new Map<string, FormCache>()
let _rolesCache: userApi.UserRole[] | null = null
let _pwPolicyCache: userApi.PasswordPolicy | null = null

/**
 * Règles de complexité NON satisfaites par `pw` selon la politique effective (mêmes règles que
 * le validateur serveur MelisPasswordValidatorWithConfig). Une règle ne compte que si activée.
 */
function passwordPolicyErrors(
  pw: string,
  policy: userApi.PasswordPolicy | null,
  t: (k: I18nKey, params?: Record<string, string | number>) => string,
): string[] {
  if (!policy) return []
  const errs: string[] = []
  if (policy.minLength > 0 && pw.length < policy.minLength) errs.push(t('users.pw.min', { n: policy.minLength }))
  if (policy.requireLower && !/[a-z]/.test(pw)) errs.push(t('users.pw.lower'))
  if (policy.requireUpper && !/[A-Z]/.test(pw)) errs.push(t('users.pw.upper'))
  if (policy.requireDigit && !/\d/.test(pw)) errs.push(t('users.pw.digit'))
  if (policy.requireSpecial && !/[\p{P}\p{S}]/u.test(pw)) errs.push(t('users.pw.special'))
  return errs
}

if (typeof window !== 'undefined') {
  const w = window as unknown as { __melisFormCachePruneBound?: boolean; __melisSubTabs?: Record<string, { tabs: { id: string }[] }> }
  if (!w.__melisFormCachePruneBound) {
    w.__melisFormCachePruneBound = true
    window.addEventListener(SUBTABS_CHANGED, () => {
      const open = new Set<string>()
      for (const s of Object.values(w.__melisSubTabs ?? {})) for (const t of s.tabs) open.add(t.id)
      for (const key of Array.from(_formCache.keys())) if (!open.has(key)) _formCache.delete(key)
    })
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserFormPage() {
  const navigate = useNavigate()
  const { id }   = useParams<{ id: string }>()
  const { t }    = useI18n()
  const isEdit   = Boolean(id)
  const userId   = id ? parseInt(id) : null

  const base = routeForForward('MelisCore/ToolUser') ?? '/users'

  // Garde de capacité : accès direct au formulaire (URL) bloqué si l'action n'est pas permise.
  const canForm = useCan('meliscore_tool_user', isEdit ? 'edit' : 'create')
  useEffect(() => { if (!canForm) navigate(base) }, [canForm, navigate, base])

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
  const [pwPolicy, setPwPolicy] = useState<userApi.PasswordPolicy | null>(_pwPolicyCache)
  const rolesModuleActive = useModuleActive('MelisSmallBusiness')

  useEffect(() => {
    if (!rolesModuleActive) return
    if (_rolesCache) { setRoles(_rolesCache); return }
    userApi.fetchRoles().then(r => { _rolesCache = r; setRoles(r) }).catch(() => null)
  }, [rolesModuleActive])

  // Politique de complexité effective (défauts otherconfig + app.login.php) — pour le feedback
  // client. Le serveur reste la source de vérité : la validation serveur bloque de toute façon.
  useEffect(() => {
    if (_pwPolicyCache) { setPwPolicy(_pwPolicyCache); return }
    userApi.fetchPasswordPolicy().then(p => { _pwPolicyCache = p; setPwPolicy(p) }).catch(() => null)
  }, [])

  useEffect(() => {
    if (!isEdit || !userId) return
    const cached = _formCache.get(subTabPath)
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
    if (userId && form.login) _formCache.set(subTabPath, { form, roles, activeTab })
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
    setSaved(false) // toute modification ré-active le bouton Enregistrer (cf. bouton disabled={saving||saved})
  }

  function validate(): boolean {
    const errs: Errors = {}
    if (!form.login.trim())     errs.login     = t('users.err.login')
    if (!form.email.trim())     errs.email     = t('users.err.email')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t('users.err.email_invalid')
    if (!form.firstname.trim()) errs.firstname = t('users.err.firstname')
    if (!form.lastname.trim())  errs.lastname  = t('users.err.lastname')
    if (!isEdit && !form.password) errs.password = t('users.err.password')
    // Complexité (parité serveur) : seulement si un mot de passe est saisi.
    if (form.password) {
      const pwErrs = passwordPolicyErrors(form.password, pwPolicy, t)
      if (pwErrs.length) errs.password = pwErrs.join(' • ')
    }
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
      // Éditer un AUTRE utilisateur ne recharge pas la page (contrairement à soi-même, res.self →
      // reload) et navigue vers la MÊME URL (no-op) : sans ça, `saved` restait true → le bouton
      // Enregistrer restait bloqué « Enregistré » et on ne pouvait plus sauvegarder. On ré-active
      // le bouton après un bref feedback (et toute modification le ré-active aussi, cf. set()).
      setTimeout(() => setSaved(false), 1500)
      notify('ok', t('users.title'), t('users.form.saved'))
      if (!isEdit) closeSubTab(`${base}/new`)
      if (res.self) {
        // Full reload refreshes the session identity (rights, menu). clearTools() is NOT called
        // here — it immediately unmounts UserFormPage (route gone) causing a blank flash.
        // The reload reinitialises the tool-routes registry from the menu API anyway.
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
    _formCache.delete(subTabPath)
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
            {/* Checklist des exigences de complexité (politique effective, cf. outil « Autres config »). */}
            {pwPolicy && (() => {
              const rules: { key: string; label: string; ok: boolean }[] = []
              if (pwPolicy.minLength > 0) rules.push({ key: 'min', label: t('users.pw.min', { n: pwPolicy.minLength }), ok: form.password.length >= pwPolicy.minLength })
              if (pwPolicy.requireLower) rules.push({ key: 'lower', label: t('users.pw.lower'), ok: /[a-z]/.test(form.password) })
              if (pwPolicy.requireUpper) rules.push({ key: 'upper', label: t('users.pw.upper'), ok: /[A-Z]/.test(form.password) })
              if (pwPolicy.requireDigit) rules.push({ key: 'digit', label: t('users.pw.digit'), ok: /\d/.test(form.password) })
              if (pwPolicy.requireSpecial) rules.push({ key: 'special', label: t('users.pw.special'), ok: /[\p{P}\p{S}]/u.test(form.password) })
              if (!rules.length) return null
              return (
                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t('users.pw.requirements')}</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {rules.map((r) => (
                      <li key={r.key} className={cn('flex items-center gap-1.5 text-xs',
                        form.password && r.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
                        {form.password && r.ok
                          ? <Check className="size-3.5 shrink-0" />
                          : <Circle className="size-3.5 shrink-0" />}
                        {r.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ToggleRight className="size-3.5" />{t('users.form.status')}
            </h3>
            <button type="button" onClick={() => set('status', form.status === 1 ? 0 : 1)} className="flex items-center gap-3">
              <div className={cn('relative h-5 w-9 rounded-full transition-colors', form.status === 1 ? 'bg-emerald-500' : 'bg-red-500')}>
                <div className={cn('absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform', form.status === 1 ? 'translate-x-4' : 'translate-x-0.5')} />
              </div>
              <span className={cn('text-sm font-medium', form.status === 1 ? 'text-emerald-600' : 'text-red-600')}>
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
