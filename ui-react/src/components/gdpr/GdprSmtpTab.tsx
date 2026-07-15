import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, RotateCcw, Save, Server, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import * as gdprApi from '@/lib/gdpr-api'
import { GdprApiError } from '@/lib/gdpr-api'
import type { I18nKey } from '@/i18n/dictionaries'
import { useI18n } from '@/i18n/i18n-context'
import { useCan } from '@/lib/capabilities'
import { GDPR_TOOL_KEY, gdprNotify } from './gdpr-shared'

/** Champ => clé i18n (ou message brut serveur). */
type FieldErrors = Record<string, string>

/** Validation client, miroir de celle du contrôleur (mêmes clés i18n). */
function validate(f: { id: number; host: string; username: string; password: string; confirm: string }): FieldErrors {
  const e: FieldErrors = {}
  if (!f.host.trim()) e.host = 'gdpr.smtp.err_host'
  if (!f.username.trim()) e.username = 'gdpr.smtp.err_username'
  if (!f.id && !f.password) e.password = 'gdpr.smtp.err_password'
  if (f.password && f.password !== f.confirm) e.confirm = 'gdpr.smtp.err_confirm'
  return e
}

/** `actionsHost` : conteneur du header de la page où projeter les actions (Save…). */
export default function GdprSmtpTab({ actionsHost }: { actionsHost?: HTMLElement | null }) {
  const { t } = useI18n()
  const canEdit = useCan(GDPR_TOOL_KEY, 'edit')

  const [id, setId] = useState(0)
  const [host, setHost] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [hasPassword, setHasPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  /** Erreurs par champ (clés i18n) + message général en haut du formulaire. */
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [alert, setAlert] = useState('')

  /** Traduit une clé i18n ; laisse passer tel quel un message brut du serveur. */
  const tr = (key: string) => t(key as I18nKey)

  function clearErrors() { setFieldErrors({}); setAlert('') }
  /** Efface l'erreur d'un champ dès qu'il est modifié. */
  function clearField(...fields: string[]) {
    setFieldErrors((prev) => {
      const next = { ...prev }
      for (const f of fields) delete next[f]
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

  function load() {
    setLoading(true)
    gdprApi.fetchSmtp()
      .then((c) => { setId(c.id ?? 0); setHost(c.host); setUsername(c.username); setHasPassword(c.hasPassword); setPassword(''); setConfirm('') })
      .catch(showError)
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    const errs = validate({ id, host, username, password, confirm })
    if (Object.keys(errs).length) { setFieldErrors(errs); setAlert('gdpr.smtp.err_form'); return }
    clearErrors()
    setSaving(true)
    try {
      const r = await gdprApi.saveSmtp({ id, host: host.trim(), username: username.trim(), password, confirm })
      setId(r.id); gdprNotify('ok', t('gdpr.smtp.title'), t('gdpr.smtp.saved'))
      load()
    } catch (e) { showError(e) }
    finally { setSaving(false) }
  }

  async function remove() {
    if (!id) return
    clearErrors()
    setSaving(true)
    try { await gdprApi.deleteSmtp(id); gdprNotify('ok', t('gdpr.smtp.title'), t('gdpr.smtp.deleted')); setId(0); setHost(''); setUsername(''); setHasPassword(false); load() }
    catch (e) { showError(e) }
    finally { setSaving(false) }
  }

  const fieldError = (field: string) =>
    fieldErrors[field] ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{tr(fieldErrors[field])}</p> : null
  const errorRing = (field: string) => (fieldErrors[field] ? 'border-red-500 focus-visible:ring-red-500' : '')

  /** Actions projetées dans le header de la page (haut-droite), à côté du toggle New/Old. */
  const actions = (
    <>
      <button type="button" onClick={load} title={t('common.refresh')}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <RotateCcw className={cn('size-3.5', loading && 'animate-spin')} />
      </button>
      {canEdit && id > 0 && (
        <Button variant="outline" size="sm" className="gap-1.5 text-red-600" onClick={remove} disabled={saving || loading}>
          <Trash2 className="size-3.5" />{t('common.delete')}
        </Button>
      )}
      {canEdit && (
        <Button size="sm" className="gap-1.5" onClick={save} disabled={saving || loading}>
          <Save className="size-4" />{saving ? t('gdpr.smtp.saving') : t('common.save')}
        </Button>
      )}
    </>
  )
  const headerActions = actionsHost ? createPortal(actions, actionsHost) : null

  if (loading) {
    return <>
      {headerActions}
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t('common.loading')}</div>
    </>
  }

  return (
    <>
    {headerActions}
    <div className="max-w-xl rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold"><Server className="size-4 text-primary" />{t('gdpr.smtp.title')}</div>
      <p className="mt-1 text-xs text-muted-foreground">{t('gdpr.smtp.subtitle')}</p>

      {alert && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{tr(alert)}</span>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.smtp.host')}</label>
          <Input value={host} onChange={(e) => { setHost(e.target.value); clearField('host') }} placeholder="smtp.example.com" disabled={!canEdit} className={errorRing('host')} />
          {fieldError('host')}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.smtp.username')}</label>
          <Input value={username} onChange={(e) => { setUsername(e.target.value); clearField('username') }} placeholder="user@example.com" disabled={!canEdit} className={errorRing('username')} />
          {fieldError('username')}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.smtp.password')}</label>
          <Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); clearField('password', 'confirm') }} placeholder={hasPassword ? '••••••••' : ''} disabled={!canEdit} className={errorRing('password')} />
          {fieldError('password')}
          {hasPassword && !fieldErrors.password && <p className="mt-1 text-[11px] text-muted-foreground">{t('gdpr.smtp.password_hint')}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.smtp.confirm')}</label>
          <Input type="password" value={confirm} onChange={(e) => { setConfirm(e.target.value); clearField('confirm') }} disabled={!canEdit} className={errorRing('confirm')} />
          {fieldError('confirm')}
        </div>
      </div>

    </div>
    </>
  )
}
