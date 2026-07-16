import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Pencil, Play, Plus, Save, ScrollText, Search, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as gdprApi from '@/lib/gdpr-api'
import { GdprApiError } from '@/lib/gdpr-api'
import type { AdConfig, AdEmail, AdEmails, AdLog, AdLogDetail, AdMeta, LangOption } from '@/lib/gdpr-api'
import type { I18nKey } from '@/i18n/dictionaries'
import { useI18n } from '@/i18n/i18n-context'
import { useCan } from '@/lib/capabilities'
import { Flag } from '@/components/LanguageSwitcher'
import { GDPR_TOOL_KEY, gdprNotify } from './gdpr-shared'

type View = 'list' | 'edit'
/** Champ => clé i18n (ou message brut serveur). */
type FieldErrors = Record<string, string>

function emptyEmail(): AdEmail { return { id: 0, subject: '', html: '', text: '', link: 0 } }
function emptyEmails(langs: LangOption[]): AdEmails {
  const warning: Record<string, AdEmail> = {}, del: Record<string, AdEmail> = {}
  for (const l of langs) { warning[String(l.id)] = emptyEmail(); del[String(l.id)] = emptyEmail() }
  return { warning, delete: del }
}
function emptyConfig(): AdConfig {
  return { id: 0, siteId: 0, siteLabel: '', module: '', alertStatus: false, alertDays: 0, resend: false, deleteDays: 0, fromName: '', fromEmail: '', replyTo: '', layoutTitle: '', layoutDesc: '' }
}

/** Validation client, miroir de celle du contrôleur (mêmes clés i18n). */
function validate(c: AdConfig): FieldErrors {
  const e: FieldErrors = {}
  if (!c.module) e.module = 'gdpr.ad.err_module'
  if (!c.siteId || c.siteId <= 0) e.siteId = 'gdpr.ad.err_site'
  if (!c.deleteDays || c.deleteDays <= 0) e.deleteDays = 'gdpr.ad.err_delete_days'
  if (c.alertStatus && c.alertDays > 0 && c.deleteDays > 0 && c.alertDays >= c.deleteDays) e.alertDays = 'gdpr.ad.err_alert_after'
  if (c.alertStatus && c.resend && c.deleteDays > 0 && c.deleteDays - c.alertDays < 7) e.resend = 'gdpr.ad.err_resend_gap'
  return e
}

function Switch({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors', checked ? 'bg-emerald-500' : 'bg-red-500', disabled && 'opacity-50')}>
      <span className={cn('inline-block size-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
  )
}

export default function GdprAutoDeleteTab() {
  const { t } = useI18n()
  const canEdit = useCan(GDPR_TOOL_KEY, 'edit')
  const canDelete = useCan(GDPR_TOOL_KEY, 'delete')

  const [meta, setMeta] = useState<AdMeta | null>(null)
  const [configs, setConfigs] = useState<AdConfig[]>([])
  const [logs, setLogs] = useState<AdLog[]>([])
  const [showLogs, setShowLogs] = useState(false)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('list')
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [toDelete, setToDelete] = useState<AdConfig | null>(null)

  const [form, setForm] = useState<AdConfig>(emptyConfig())
  const [emails, setEmails] = useState<AdEmails>({ warning: {}, delete: {} })
  const [activeLang, setActiveLang] = useState(0)
  const [configLogs, setConfigLogs] = useState<AdLog[]>([])
  const [configLogsLoading, setConfigLogsLoading] = useState(false)
  const [logDetail, setLogDetail] = useState<AdLogDetail | null>(null)
  /** Erreurs par champ (clés i18n) + message général en haut du formulaire. */
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [alert, setAlert] = useState('')

  /** Traduit une clé i18n ; laisse passer tel quel un message brut du serveur. */
  const tr = (key: string) => t(key as I18nKey)

  function clearErrors() { setFieldErrors({}); setAlert('') }
  /** Efface l'erreur d'un champ dès qu'il est modifié. */
  function patchForm(patch: Partial<AdConfig>, ...clears: string[]) {
    setForm((prev) => ({ ...prev, ...patch }))
    if (clears.length) setFieldErrors((prev) => {
      const next = { ...prev }
      for (const k of clears) delete next[k]
      return next
    })
  }
  /** Toute erreur (validation ou serveur) s'affiche en bandeau, jamais en toast. */
  function showError(e: unknown) {
    if (e instanceof GdprApiError) {
      setFieldErrors(e.errors)
      setAlert(e.errorKey ?? e.message)
      return
    }
    setFieldErrors({})
    setAlert(String((e as Error)?.message ?? e))
  }

  function loadAll() {
    setLoading(true)
    Promise.all([gdprApi.fetchAdMeta(), gdprApi.fetchAdConfigs()])
      .then(([m, c]) => { setMeta(m); setConfigs(c); if (m.langs.length) setActiveLang(m.langs[0].id) })
      .catch(showError)
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadAll() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function openNew() {
    if (!meta) return
    clearErrors()
    setForm(emptyConfig()); setEmails(emptyEmails(meta.langs)); setView('edit')
  }
  async function openEdit(id: number) {
    if (!meta) return
    clearErrors()
    try {
      const { config, emails: em } = await gdprApi.fetchAdConfig(id)
      // Complète les langues manquantes.
      const base = emptyEmails(meta.langs)
      for (const l of meta.langs) {
        if (em.warning[String(l.id)]) base.warning[String(l.id)] = em.warning[String(l.id)]
        if (em.delete[String(l.id)]) base.delete[String(l.id)] = em.delete[String(l.id)]
      }
      setForm(config); setEmails(base); setView('edit')
      setConfigLogs([]); setConfigLogsLoading(true)
      gdprApi.fetchAdLogs({ module: config.module, siteId: config.siteId })
        .then(setConfigLogs).catch(() => null).finally(() => setConfigLogsLoading(false))
    } catch (e) { showError(e) }
  }

  async function openLogDetail(id: number) {
    try { setLogDetail(await gdprApi.fetchAdLogDetail(id)) } catch (e) { showError(e) }
  }

  function setEmail(type: 'warning' | 'delete', langId: number, patch: Partial<AdEmail>) {
    setEmails((prev) => ({ ...prev, [type]: { ...prev[type], [String(langId)]: { ...prev[type][String(langId)], ...patch } } }))
  }

  async function save() {
    const errs = validate(form)
    if (Object.keys(errs).length) { setFieldErrors(errs); setAlert('gdpr.ad.err_form'); return }
    clearErrors()
    setSaving(true)
    try {
      await gdprApi.saveAdConfig({ config: form, emails })
      gdprNotify('ok', t('gdpr.ad.title'), t('gdpr.ad.saved'))
      setView('list'); loadAll()
    } catch (e) { showError(e) }
    finally { setSaving(false) }
  }

  async function confirmDelete() {
    if (!toDelete) return
    try { await gdprApi.deleteAdConfig(toDelete.id); gdprNotify('ok', t('gdpr.ad.title'), t('gdpr.ad.deleted')); setToDelete(null); loadAll() }
    catch (e) { showError(e); setToDelete(null) }
  }

  async function run() {
    setRunning(true)
    try {
      const r = await gdprApi.runAd()
      if (r.status) gdprNotify('ok', t('gdpr.ad.title'), r.message || t('gdpr.ad.run_done'))
      else setAlert(r.message || t('gdpr.ad.run_done'))
    } catch (e) { showError(e) }
    finally { setRunning(false) }
  }

  function toggleLogs() {
    const next = !showLogs; setShowLogs(next)
    if (next && logs.length === 0) gdprApi.fetchAdLogs().then(setLogs).catch(() => null)
  }

  if (loading) return <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t('common.loading')}</div>

  const ErrorText = ({ field }: { field: string }) =>
    fieldErrors[field] ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{tr(fieldErrors[field])}</p> : null
  const errorRing = (field: string) => (fieldErrors[field] ? 'border-red-500 focus-visible:ring-red-500' : '')
  const AlertBanner = () =>
    alert ? (
      <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <span>{tr(alert)}</span>
      </div>
    ) : null

  const LogDetailModal = () => {
    if (!logDetail) return null
    const groups: { heading: string; ok: string[]; ko: string[] }[] = [
      { heading: t('gdpr.ad.log_warning1'), ok: logDetail.warning1Ok, ko: logDetail.warning1Ko },
      { heading: t('gdpr.ad.log_warning2'), ok: logDetail.warning2Ok, ko: logDetail.warning2Ko },
      { heading: t('gdpr.ad.log_delete_heading'), ok: logDetail.deleteOk, ko: logDetail.deleteKo },
    ]
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">{t('gdpr.ad.log_details_title')}</h3>
            <button onClick={() => setLogDetail(null)} className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{logDetail.date} · {logDetail.module}</p>
          <div className="mt-4 flex flex-col gap-4">
            {groups.map((g) => (
              <div key={g.heading} className="rounded-lg border border-border p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.heading}</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Badge variant="muted" className="mb-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">{t('gdpr.ad.log_ok')} · {g.ok.length}</Badge>
                    {g.ok.length === 0 ? <p className="text-xs text-muted-foreground">{t('gdpr.ad.log_no_entries')}</p> : (
                      <ul className="flex flex-col gap-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                        {g.ok.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    )}
                  </div>
                  <div>
                    <Badge variant="muted" className="mb-1.5 bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">{t('gdpr.ad.log_ko')} · {g.ko.length}</Badge>
                    {g.ko.length === 0 ? <p className="text-xs text-muted-foreground">{t('gdpr.ad.log_no_entries')}</p> : (
                      <ul className="flex flex-col gap-0.5 text-xs text-red-700 dark:text-red-400">
                        {g.ko.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── Édition ───────────────────────────────────────────────────────────────
  if (view === 'edit' && meta) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { clearErrors(); setView('list') }}><ArrowLeft className="size-3.5" />{t('gdpr.ad.back')}</Button>
          {canEdit && <Button size="sm" className="gap-1.5" onClick={save} disabled={saving}><Save className="size-4" />{saving ? t('gdpr.smtp.saving') : t('common.save')}</Button>}
        </div>

        <AlertBanner />

        {/* Filtres */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">{t('gdpr.ad.section_filters')}</h3>
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.ad.module')} *</label>
              <select value={form.module} onChange={(e) => patchForm({ module: e.target.value }, 'module')} disabled={!canEdit}
                className={cn('h-9 w-full rounded-md border border-input bg-card px-3 text-sm', errorRing('module'))}>
                <option value="">{t('gdpr.ad.choose_module')}</option>
                {meta.modules.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
              <ErrorText field="module" />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.ad.site')} *</label>
              <select value={form.siteId} onChange={(e) => patchForm({ siteId: Number(e.target.value) }, 'siteId')} disabled={!canEdit}
                className={cn('h-9 w-full rounded-md border border-input bg-card px-3 text-sm', errorRing('siteId'))}>
                <option value={0}>{t('gdpr.ad.choose_site')}</option>
                {meta.sites.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <ErrorText field="siteId" />
            </div>
          </div>
        </section>

        {/* Configuration cron */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">{t('gdpr.ad.section_cron')}</h3>
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Switch checked={form.alertStatus} onChange={(v) => patchForm({ alertStatus: v }, 'alertDays', 'resend')} disabled={!canEdit} />
              <span className="text-sm">{t('gdpr.ad.alert_status')}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="w-48">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.ad.alert_days')}</label>
                <Input type="number" value={form.alertDays || ''} onChange={(e) => patchForm({ alertDays: Number(e.target.value) }, 'alertDays', 'resend')} disabled={!canEdit || !form.alertStatus} className={errorRing('alertDays')} />
                <ErrorText field="alertDays" />
              </div>
              <div className="flex flex-col justify-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={form.resend} onChange={(v) => patchForm({ resend: v }, 'resend')} disabled={!canEdit || !form.alertStatus} />
                  <span className="text-sm">{t('gdpr.ad.resend')}</span>
                </div>
                <ErrorText field="resend" />
              </div>
            </div>
            <div className="w-48">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.ad.delete_days')} *</label>
              <Input type="number" value={form.deleteDays || ''} onChange={(e) => patchForm({ deleteDays: Number(e.target.value) }, 'deleteDays', 'alertDays', 'resend')} disabled={!canEdit} className={errorRing('deleteDays')} />
              <ErrorText field="deleteDays" />
            </div>
          </div>
        </section>

        {/* Email setup */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">{t('gdpr.ad.section_email_setup')}</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.ad.from_name')}</label><Input value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} disabled={!canEdit} /></div>
            <div><label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.ad.from_email')}</label><Input value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} disabled={!canEdit} /></div>
            <div><label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.ad.reply_to')}</label><Input value={form.replyTo} onChange={(e) => setForm({ ...form, replyTo: e.target.value })} disabled={!canEdit} /></div>
            <div><label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.ad.layout_title')}</label><Input value={form.layoutTitle} onChange={(e) => setForm({ ...form, layoutTitle: e.target.value })} disabled={!canEdit} /></div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.ad.layout_desc')}</label>
            <textarea value={form.layoutDesc} onChange={(e) => setForm({ ...form, layoutDesc: e.target.value })} disabled={!canEdit} rows={3} className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm" />
          </div>
        </section>

        {/* Emails d'alerte multilingues */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">{t('gdpr.ad.section_emails')}</h3>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row">
            <div className="flex shrink-0 flex-row gap-1 overflow-x-auto sm:w-40 sm:flex-col sm:overflow-visible">
              {meta.langs.map((l) => (
                <button key={l.id} type="button" onClick={() => setActiveLang(l.id)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                    activeLang === l.id ? 'bg-red-600 text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}>
                  <span>{l.name}</span>
                  {l.short && <Flag short={l.short} width={24} height={16} />}
                </button>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              {meta.langs.map((l) => (
                <div key={l.id} className={cn('flex flex-col gap-5', activeLang === l.id ? 'block' : 'hidden')}>
                  {(['warning', 'delete'] as const).map((type) => {
                    const em = emails[type][String(l.id)] ?? emptyEmail()
                    return (
                      <div key={type} className="rounded-lg border border-border p-3">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{type === 'warning' ? t('gdpr.ad.email_warning') : t('gdpr.ad.email_delete')}</div>
                        <div className="flex flex-col gap-2">
                          <Input placeholder={t('gdpr.ad.email_subject')} value={em.subject} onChange={(e) => setEmail(type, l.id, { subject: e.target.value })} disabled={!canEdit} />
                          <textarea placeholder={t('gdpr.ad.email_html')} value={em.html} onChange={(e) => setEmail(type, l.id, { html: e.target.value })} disabled={!canEdit} rows={4} className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm" />
                          <textarea placeholder={t('gdpr.ad.email_text')} value={em.text} onChange={(e) => setEmail(type, l.id, { text: e.target.value })} disabled={!canEdit} rows={2} className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">{t('gdpr.ad.email_html_hint')}</p>
        </section>

        {/* Journaux (logs) de cette config */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">{t('gdpr.ad.section_logs')}</h3>
          {!form.id ? (
            <p className="mt-3 text-xs text-muted-foreground">{t('gdpr.ad.log_save_first')}</p>
          ) : configLogsLoading ? (
            <p className="mt-3 text-xs text-muted-foreground">{t('common.loading')}</p>
          ) : (
            <div className="mt-3 overflow-hidden rounded-lg border border-border">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">{t('gdpr.ad.log_date')}</th>
                    <th className="px-3 py-2">{t('gdpr.ad.log_warning1')}</th>
                    <th className="px-3 py-2">{t('gdpr.ad.log_warning2')}</th>
                    <th className="px-3 py-2">{t('gdpr.ad.log_delete_heading')}</th>
                    <th className="w-14 px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {configLogs.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">{t('gdpr.ad.no_logs')}</td></tr>
                  ) : configLogs.map((l) => (
                    <tr key={l.id}>
                      <td className="px-3 py-2 text-muted-foreground">{l.date}</td>
                      <td className="px-3 py-2 text-center text-green-600">{l.warning1Ok}<span className="text-red-500"> / {l.warning1Ko}</span></td>
                      <td className="px-3 py-2 text-center text-green-600">{l.warning2Ok}<span className="text-red-500"> / {l.warning2Ko}</span></td>
                      <td className="px-3 py-2 text-center text-green-600">{l.deleteOk}<span className="text-red-500"> / {l.deleteKo}</span></td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => openLogDetail(l.id)} title={t('gdpr.ad.log_details')}
                          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                          <Search className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <LogDetailModal />
      </div>
    )
  }

  // ─── Liste ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{t('gdpr.ad.list_title')}</h3>
          <p className="text-xs text-muted-foreground">{t('gdpr.ad.list_subtitle')}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={toggleLogs}><ScrollText className="size-3.5" />{t('gdpr.ad.logs')}</Button>
        {canEdit && <Button variant="outline" size="sm" className="gap-1.5" onClick={run} disabled={running}><Play className={cn('size-3.5', running && 'animate-pulse')} />{t('gdpr.ad.run')}</Button>}
        {canEdit && <Button size="sm" className="gap-1.5" onClick={openNew}><Plus className="size-4" />{t('gdpr.ad.new')}</Button>}
      </div>

      <AlertBanner />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left">{t('gdpr.ad.col_module')}</th>
              <th className="px-4 py-2.5 text-left">{t('gdpr.ad.col_site')}</th>
              <th className="px-4 py-2.5 text-left">{t('gdpr.ad.col_alert')}</th>
              <th className="px-4 py-2.5 text-left">{t('gdpr.ad.col_delete')}</th>
              <th className="w-20 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {configs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">{t('gdpr.ad.empty')}</td></tr>
            ) : configs.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-2.5 font-medium">{c.module}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.siteLabel || (c.siteId ? c.siteId : t('gdpr.ad.all_sites'))}</td>
                <td className="px-4 py-2.5">{c.alertStatus ? <Badge variant="muted" className="px-1.5 py-0 text-[10px]">{t('gdpr.ad.days', { n: c.alertDays })}{c.resend ? ' +7' : ''}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                <td className="px-4 py-2.5">{t('gdpr.ad.days', { n: c.deleteDays })}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    {canEdit && <button onClick={() => openEdit(c.id)} title={t('common.edit')} className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil className="size-3.5" /></button>}
                    {canDelete && <button onClick={() => setToDelete(c)} title={t('common.delete')} className="inline-flex size-7 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"><Trash2 className="size-3.5" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showLogs && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/40 px-4 py-2.5 text-sm font-semibold">{t('gdpr.ad.logs')}</div>
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">{t('gdpr.ad.log_date')}</th>
                <th className="px-4 py-2 text-left">{t('gdpr.ad.col_module')}</th>
                <th className="px-3 py-2">A1</th><th className="px-3 py-2">A2</th><th className="px-3 py-2">ANO</th>
                <th className="w-14 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">{t('gdpr.ad.no_logs')}</td></tr>
              ) : logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 text-muted-foreground">{l.date}</td>
                  <td className="px-4 py-2">{l.module}</td>
                  <td className="px-3 py-2 text-center text-green-600">{l.warning1Ok}<span className="text-red-500"> / {l.warning1Ko}</span></td>
                  <td className="px-3 py-2 text-center text-green-600">{l.warning2Ok}<span className="text-red-500"> / {l.warning2Ko}</span></td>
                  <td className="px-3 py-2 text-center text-green-600">{l.deleteOk}<span className="text-red-500"> / {l.deleteKo}</span></td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => openLogDetail(l.id)} title={t('gdpr.ad.log_details')}
                      className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                      <Search className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-semibold">{t('gdpr.ad.delete_title')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('gdpr.ad.delete_body', { module: toDelete.module })}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setToDelete(null)}>{t('common.cancel')}</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>{t('common.delete')}</Button>
            </div>
          </div>
        </div>
      )}
      <LogDetailModal />
    </div>
  )
}
