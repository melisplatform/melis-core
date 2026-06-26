import { useEffect, useState } from 'react'
import { Save, Server, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import * as gdprApi from '@/lib/gdpr-api'
import { useI18n } from '@/i18n/i18n-context'
import { useCan } from '@/lib/capabilities'
import { GDPR_TOOL_KEY, gdprNotify } from './gdpr-shared'

export default function GdprSmtpTab() {
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

  function load() {
    setLoading(true)
    gdprApi.fetchSmtp()
      .then((c) => { setId(c.id ?? 0); setHost(c.host); setUsername(c.username); setHasPassword(c.hasPassword); setPassword(''); setConfirm('') })
      .catch((e) => gdprNotify('ko', t('gdpr.smtp.title'), String(e?.message ?? e)))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    if (!host.trim() || !username.trim()) { gdprNotify('ko', t('gdpr.smtp.title'), t('gdpr.smtp.required')); return }
    if (password !== confirm) { gdprNotify('ko', t('gdpr.smtp.title'), t('gdpr.smtp.password_mismatch')); return }
    setSaving(true)
    try {
      const r = await gdprApi.saveSmtp({ id, host: host.trim(), username: username.trim(), password, confirm })
      setId(r.id); gdprNotify('ok', t('gdpr.smtp.title'), t('gdpr.smtp.saved'))
      load()
    } catch (e) { gdprNotify('ko', t('gdpr.smtp.title'), String((e as Error)?.message ?? e)) }
    finally { setSaving(false) }
  }

  async function remove() {
    if (!id) return
    setSaving(true)
    try { await gdprApi.deleteSmtp(id); gdprNotify('ok', t('gdpr.smtp.title'), t('gdpr.smtp.deleted')); setId(0); setHost(''); setUsername(''); setHasPassword(false); load() }
    catch (e) { gdprNotify('ko', t('gdpr.smtp.title'), String((e as Error)?.message ?? e)) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t('common.loading')}</div>

  return (
    <div className="max-w-xl rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold"><Server className="size-4 text-primary" />{t('gdpr.smtp.title')}</div>
      <p className="mt-1 text-xs text-muted-foreground">{t('gdpr.smtp.subtitle')}</p>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.smtp.host')}</label>
          <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.example.com" disabled={!canEdit} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.smtp.username')}</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="user@example.com" disabled={!canEdit} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.smtp.password')}</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={hasPassword ? '••••••••' : ''} disabled={!canEdit} />
          {hasPassword && <p className="mt-1 text-[11px] text-muted-foreground">{t('gdpr.smtp.password_hint')}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.smtp.confirm')}</label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={!canEdit} />
        </div>
      </div>

      {canEdit && (
        <div className="mt-5 flex justify-end gap-2">
          {id > 0 && <Button variant="outline" size="sm" className="gap-1.5 text-red-600" onClick={remove} disabled={saving}><Trash2 className="size-3.5" />{t('common.delete')}</Button>}
          <Button size="sm" className="gap-1.5" onClick={save} disabled={saving}><Save className="size-4" />{saving ? t('gdpr.smtp.saving') : t('common.save')}</Button>
        </div>
      )}
    </div>
  )
}
