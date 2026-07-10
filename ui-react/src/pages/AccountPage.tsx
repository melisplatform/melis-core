/**
 * « Mon compte » — outil natif full-React (melisKey `meliscore_user_profile`).
 *
 * Ouvert depuis le menu avatar du Topbar (route /melis-core/account). Onglet « Profil » natif
 * (email / mot de passe / langue / avatar) sur l'API MelisReactApiUserProfile. Les autres onglets
 * (ex. « Melis Messenger », module melis-messenger) sont ajoutés de façon MODULAIRE via le point
 * d'extension `window.__melisAccountTabs` (cf. lib/account-tabs) — présents ssi le module est actif.
 *
 * Toggle New/Old (via `viewToggle` du registre) : la vue « Old » remonte l'outil legacy en iframe.
 */
import { useEffect, useRef, useState } from 'react'
import { User, Mail, CalendarDays, ShieldCheck, Pencil, Loader2, Save, Check, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import { ViewModeToggle, MelisClassicFrame, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { getAccountTabs, ACCOUNT_TABS_EVENT } from '@/lib/account-tabs'
import * as api from '@/lib/account-api'

const MELIS_KEY = 'meliscore_user_profile'
const PROFILE_TAB = '__profile__'

/** Drapeau de langue (image MelisCore /assets/images/lang/<short>.png). en_EN → en, fr_FR → fr. */
function LangFlag({ locale, className }: { locale: string; className?: string }) {
  const short = (locale || '').slice(0, 2).toLowerCase()
  if (!short) return null
  return (
    <img src={`/MelisCore/assets/images/lang/${short}.png`} alt="" width={18} height={12}
      className={cn('inline-block rounded-[2px] object-cover shadow-sm', className)}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
  )
}

/** Formate une date "Y-m-d" dans la langue du BO (fr → « 16 mai 2025 », en → « May 16, 2025 »). */
function formatDate(ymd: string, locale: string): string {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ymd
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  try { return d.toLocaleDateString(locale.replace(/_/g, '-'), { day: 'numeric', month: 'long', year: 'numeric' }) }
  catch { return ymd }
}

/** Traduit les codes d'erreur tr_… renvoyés par l'API en messages i18n. */
function errorMessage(t: (k: never) => string, raw: string): string {
  const map: Record<string, string> = {
    tr_meliscore_tool_user_usr_email_error_empty: 'account.err.email',
    tr_meliscore_tool_user_usr_lang_id_error_empty: 'account.err.lang',
    tr_meliscore_tool_user_usr_password_error_low: 'account.err.pass_low',
    tr_meliscore_tool_user_usr_confirm_password_error_low: 'account.err.pass_low',
    tr_meliscore_tool_user_usr_password_regex_not_match: 'account.err.pass_regex',
    tr_meliscore_tool_user_usr_password_not_match: 'account.err.pass_match',
  }
  const key = map[raw]
  return key ? (t as (k: string) => string)(key) : (t as (k: string) => string)('account.save_error')
}

export default function AccountPage() {
  const { t, currentLocale } = useI18n()
  const showToggle = toolHasViewToggle('account')
  const [mode, setMode] = useState<ViewMode>('react')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  useEffect(() => { if (mode === 'iframe') setIframeLoaded(true) }, [mode])

  const [profile, setProfile] = useState<api.AccountProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState<string | null>(null)

  // Onglet actif + re-render quand un module (dé)pose son onglet. Un module (ex. le widget messenger
  // du Topbar) peut demander à ouvrir un onglet précis via `window.__melisAccountActiveTab` + l'event
  // 'melis-account-open-tab'.
  const w = window as unknown as { __melisAccountActiveTab?: string }
  const [activeTab, setActiveTab] = useState<string>(() => {
    const pre = w.__melisAccountActiveTab
    if (pre) { w.__melisAccountActiveTab = undefined; return pre }
    return PROFILE_TAB
  })
  const [, forceTabs] = useState(0)
  useEffect(() => {
    const onChange = () => forceTabs((n) => n + 1)
    const onOpenTab = (e: Event) => {
      const id = (e as CustomEvent).detail
      if (typeof id === 'string') setActiveTab(id)
    }
    window.addEventListener(ACCOUNT_TABS_EVENT, onChange)
    window.addEventListener('melis-account-open-tab', onOpenTab as EventListener)
    return () => {
      window.removeEventListener(ACCOUNT_TABS_EVENT, onChange)
      window.removeEventListener('melis-account-open-tab', onOpenTab as EventListener)
    }
  }, [])
  const extraTabs = getAccountTabs()

  // Form state (onglet Profil).
  const [email, setEmail] = useState('')
  const [langId, setLangId] = useState(0)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [image, setImage] = useState<string | undefined>(undefined) // undefined = inchangé
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true); setLoadErr(null)
    api.fetchAccount()
      .then((p) => { if (!alive) return; setProfile(p); setEmail(p.email); setLangId(p.langId) })
      .catch((e) => { if (alive) setLoadErr(String(e?.message ?? e)) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  function onPickPhoto(file: File) {
    const reader = new FileReader()
    reader.onload = () => { const url = String(reader.result); setImage(url); setPreview(url) }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true); setSaved(false); setSaveErr(null)
    try {
      const res = await api.saveAccount({
        email: email.trim(),
        langId,
        password: password || undefined,
        confirmPassword: confirm || undefined,
        image, // undefined = inchangé
      })
      setSaved(true); setPassword(''); setConfirm('')
      // Changement de langue du BO → recharger pour ré-initialiser l'i18n dans la nouvelle langue.
      if (res.reload) { window.location.reload(); return }
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setSaveErr(errorMessage(t as never, String((e as Error)?.message ?? e)))
    } finally {
      setSaving(false)
    }
  }

  const avatar = preview ?? profile?.image ?? null
  const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : ''

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{t('account.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('account.subtitle')}</p>
        </div>
        {showToggle && <ViewModeToggle mode={mode} onChange={setMode} />}
      </div>

      {mode === 'iframe' ? (
        <div className="flex flex-1 px-6 pb-6">
          <MelisClassicFrame melisKey={MELIS_KEY} title={MELIS_KEY} visible loaded={iframeLoaded} />
        </div>
      ) : (
        <div className="px-6 pb-8">
          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : loadErr ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{loadErr}</div>
          ) : profile ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
              {/* ── Carte profil (gauche) ── */}
              <aside className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="size-28 overflow-hidden rounded-full border border-border bg-muted">
                      {avatar
                        ? <img src={avatar} alt="" className="size-full object-cover" />
                        : <div className="flex size-full items-center justify-center text-3xl font-bold text-muted-foreground"><User className="size-10" /></div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      title={t('account.change_photo')}
                      className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow ring-2 ring-card transition-transform hover:scale-105"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <input
                      ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickPhoto(f); e.target.value = '' }}
                    />
                  </div>
                  <div className="mt-4 text-lg font-semibold text-foreground">{fullName}</div>
                  <div className="text-sm font-medium text-primary">{profile.login}</div>

                  <div className="mt-5 w-full space-y-2.5 text-left text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="size-4 shrink-0" /><span className="truncate">{profile.email}</span>
                    </div>
                    {profile.creationDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="size-4 shrink-0" /><span>{formatDate(profile.creationDate, currentLocale)}</span>
                      </div>
                    )}
                    {profile.roleName && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ShieldCheck className="size-4 shrink-0" /><span>{profile.roleName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              {/* ── Onglets (droite) ── */}
              <section className="overflow-hidden rounded-xl border border-border bg-card">
                {/* Tab strip */}
                <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-3 pt-2">
                  <TabButton active={activeTab === PROFILE_TAB} onClick={() => setActiveTab(PROFILE_TAB)}
                    icon={<User className="size-4" />} label={t('account.tab.profile')} />
                  {extraTabs.map((tb) => (
                    <TabButton key={tb.id} active={activeTab === tb.id} onClick={() => setActiveTab(tb.id)}
                      icon={tb.icon} label={tb.label} />
                  ))}
                </div>

                {/* Tab content */}
                <div className="p-6">
                  {activeTab === PROFILE_TAB ? (
                    <div className="max-w-2xl space-y-5">
                      <Field label={t('account.email')} required>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </Field>
                      <Field label={t('account.password')}>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder={t('account.password_placeholder')} autoComplete="new-password" />
                      </Field>
                      <Field label={t('account.confirm_password')}>
                        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                          placeholder={t('account.password_placeholder')} autoComplete="new-password" />
                      </Field>
                      <Field label={t('account.language')} required>
                        <LanguageSelect
                          value={langId}
                          languages={profile.languages}
                          onChange={setLangId}
                        />
                      </Field>

                      <div className="flex items-center gap-3 pt-2">
                        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                          {t('common.save')}
                        </Button>
                        {saved && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="size-4" />{t('account.saved')}</span>}
                        {saveErr && <span className="text-sm text-destructive">{saveErr}</span>}
                      </div>
                    </div>
                  ) : (
                    extraTabs.find((tb) => tb.id === activeTab)?.render() ?? null
                  )}
                </div>
              </section>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon?: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-t-md border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-card text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}{label}
    </button>
  )
}

/** Sélecteur de langue avec drapeaux (le <select> natif ne peut pas afficher d'images d'options). */
function LanguageSelect({ value, languages, onChange }: {
  value: number
  languages: api.AccountLang[]
  onChange: (id: number) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])
  const current = languages.find((l) => l.id === value)
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
      >
        <span className="flex items-center gap-2">
          {current && <LangFlag locale={current.locale} />}
          {current?.name ?? '—'}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover py-1 shadow-lg">
          {languages.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => { onChange(l.id); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                l.id === value ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              <LangFlag locale={l.locale} />{l.name}
              {l.id === value && <Check className="ml-auto size-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
    </div>
  )
}
