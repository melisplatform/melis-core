import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Mail, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MelisToolEditor } from '@/components/ui/melis-tool-editor'
import { cn } from '@/lib/utils'
import * as emailsApi from '@/lib/emails-api'
import type { EmailContent, EmailLang } from '@/lib/emails-api'
import { useSubTabs } from '@/components/tabs/sub-tab-store'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import { useIsNarrow } from '@/hooks/useIsNarrow'
import { useCan } from '@/lib/capabilities'

const TOOL_KEY = 'meliscore_tool_emails_mngt'

/** Toast vers la chrome React. */
function notify(kind: 'ok' | 'ko', title: string, message: string) {
  window.postMessage({ __melisNotif: true, kind, title, message }, '*')
}

interface FormState {
  name: string; codename: string; fromName: string; fromEmail: string; replyTo: string
  tags: string; layout: string; layoutTitle: string; layoutFtrInfo: string
  contents: Record<string, EmailContent>
}
function emptyContent(): EmailContent { return { boedId: 0, subject: '', html: '', text: '' } }

/** Drapeau de langue (image MelisCore /assets/images/lang/<short>.png, comme le LanguageSwitcher).
 *  short = 2 premières lettres de la locale BO (en_EN → en, fr_FR → fr). */
function LangFlag({ locale }: { locale: string }) {
  const short = (locale || '').slice(0, 2).toLowerCase()
  if (!short) return null
  return (
    <img src={`/MelisCore/assets/images/lang/${short}.png`} alt="" width={18} height={12}
      className="inline-block rounded-[2px] object-cover shadow-sm"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
  )
}

export default function EmailFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { t } = useI18n()
  const narrow = useIsNarrow()
  const base = routeForForward('MelisCore/EmailsManagement') ?? '/emails'
  const isNew = !id || id === 'new'

  // Édition = sous-onglet DANS l'outil (façon Utilisateurs), pas un onglet de shell top-level.
  // La SubTabBar (montée dans le Shell) matche la section `base` et rend la barre « ← retour | <nom> ».
  const subTabPath = `${base}/${id}`
  const { openTab: openSubTab, closeTab: closeSubTab, updateLabel: updateSubLabel } = useSubTabs(base)

  const canSave = useCan(TOOL_KEY, isNew ? 'create' : 'edit')

  const [langs, setLangs] = useState<EmailLang[]>([])
  const [activeLang, setActiveLang] = useState(0)
  const [form, setForm] = useState<FormState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    openSubTab({ id: subTabPath, label: isNew ? t('emails.new') : (id ?? ''), path: subTabPath })
  }, [])

  useEffect(() => {
    setLoading(true)
    if (isNew) {
      emailsApi.fetchEmails().then((r) => {
        const contents: Record<string, EmailContent> = {}
        for (const l of r.langs) contents[String(l.id)] = emptyContent()
        setLangs(r.langs); if (r.langs.length) setActiveLang(r.langs[0].id)
        setForm({ name: '', codename: '', fromName: '', fromEmail: '', replyTo: '', tags: '', layout: '', layoutTitle: '', layoutFtrInfo: '', contents })
      }).catch((e) => notify('ko', t('emails.title'), String(e?.message ?? e))).finally(() => setLoading(false))
    } else {
      emailsApi.fetchEmail(id!).then(({ email, langs }) => {
        const contents: Record<string, EmailContent> = {}
        for (const l of langs) contents[String(l.id)] = email.contents[String(l.id)] ?? emptyContent()
        setLangs(langs); if (langs.length) setActiveLang(langs[0].id)
        setForm({ name: email.name, codename: email.codename, fromName: email.fromName, fromEmail: email.fromEmail, replyTo: email.replyTo, tags: email.tags, layout: email.layout, layoutTitle: email.layoutTitle, layoutFtrInfo: email.layoutFtrInfo, contents })
      }).catch((e) => notify('ko', t('emails.title'), String(e?.message ?? e))).finally(() => setLoading(false))
    }
  }, [id, isNew]) // eslint-disable-line react-hooks/exhaustive-deps

  // Une fois l'email chargé, le libellé du sous-onglet passe du codename au nom lisible.
  useEffect(() => {
    if (!isNew && form?.name) updateSubLabel(subTabPath, form.name)
  }, [isNew, form?.name, subTabPath, updateSubLabel])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((f) => f ? { ...f, [key]: value } : f) }
  function setContent(langId: number, patch: Partial<EmailContent>) {
    setForm((f) => f ? { ...f, contents: { ...f.contents, [String(langId)]: { ...f.contents[String(langId)], ...patch } } } : f)
  }

  async function save() {
    if (!form) return
    if (!form.name.trim() || !form.codename.trim() || !form.fromName.trim() || !form.fromEmail.trim()) {
      notify('ko', t('emails.title'), t('emails.err.required')); return
    }
    setSaving(true)
    try {
      await emailsApi.saveEmail({
        isNew, codename: form.codename.trim(), name: form.name.trim(), fromName: form.fromName.trim(),
        fromEmail: form.fromEmail.trim(), replyTo: form.replyTo.trim(), tags: form.tags, layout: form.layout,
        layoutTitle: form.layoutTitle, layoutFtrInfo: form.layoutFtrInfo, contents: form.contents,
      })
      emailsApi.markEmailsListStale()
      notify('ok', t('emails.title'), t('emails.saved'))
      if (isNew) closeSubTab(`${base}/new`)
      navigate(base)
    } catch (e) { notify('ko', t('emails.title'), String((e as Error)?.message ?? e)) }
    finally { setSaving(false) }
  }

  if (loading || !form) return <div className="p-6 text-center text-sm text-muted-foreground">{t('common.loading')}</div>

  const field = (label: string, value: string, onChange: (v: string) => void, opts: { readOnly?: boolean; placeholder?: string } = {}) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} readOnly={opts.readOnly || !canSave} placeholder={opts.placeholder} />
    </div>
  )

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className={cn('flex items-center gap-3', narrow && 'min-w-0')}>
          <div className={cn(narrow && 'min-w-0')}>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Mail className="size-5 shrink-0 text-primary" />
              <span className={cn(narrow && 'truncate')}>{isNew ? t('emails.creation') : form.name}</span>
            </h1>
            <p className={cn('text-sm text-muted-foreground', narrow && 'truncate')}>{isNew ? t('emails.creation_sub') : t('emails.edition_sub')}</p>
          </div>
        </div>
        {canSave && <Button size="sm" className={cn('gap-1.5', narrow && 'shrink-0')} onClick={save} disabled={saving}><Save className="size-4" />{saving ? t('emails.saving') : t('common.save')}</Button>}
      </div>

      {/* Propriétés générales */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold">{t('emails.section.general')}</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {field(t('emails.field.name'), form.name, (v) => set('name', v))}
          {field(t('emails.field.code'), form.codename, (v) => set('codename', v.replace(/[^\w]/g, '')), { readOnly: !isNew, placeholder: 'my_email_code' })}
          {field(t('emails.field.from_name'), form.fromName, (v) => set('fromName', v))}
          {field(t('emails.field.from_email'), form.fromEmail, (v) => set('fromEmail', v))}
          {field(t('emails.field.reply_to'), form.replyTo, (v) => set('replyTo', v))}
          {field(t('emails.field.tags'), form.tags, (v) => set('tags', v), { placeholder: 'TAG1,TAG2' })}
          {field(t('emails.field.layout'), form.layout, (v) => set('layout', v), { placeholder: 'module/.../layout.phtml' })}
          {field(t('emails.field.layout_title'), form.layoutTitle, (v) => set('layoutTitle', v))}
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('emails.field.layout_ftr')}</label>
          <textarea value={form.layoutFtrInfo} onChange={(e) => set('layoutFtrInfo', e.target.value)} readOnly={!canSave} rows={2} className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
      </section>

      {/* Contenu par langue */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold">{t('emails.section.content')}</h3>
        <div className="mt-3 mb-3 flex flex-wrap gap-1 border-b border-border">
          {langs.map((l) => (
            <button key={l.id} type="button" onClick={() => setActiveLang(l.id)}
              className={cn('-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-sm font-medium', activeLang === l.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              <LangFlag locale={l.locale} />
              {l.name}
            </button>
          ))}
        </div>
        {langs.map((l) => {
          const c = form.contents[String(l.id)] ?? emptyContent()
          return (
            <div key={l.id} className={cn('flex flex-col gap-3', activeLang === l.id ? 'block' : 'hidden')}>
              {field(t('emails.field.subject'), c.subject, (v) => setContent(l.id, { subject: v }))}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('emails.field.html')}</label>
                {activeLang === l.id && (
                  <MelisToolEditor key={l.id} value={c.html} onChange={(html) => setContent(l.id, { html })} readOnly={!canSave} locale={l.locale} />
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('emails.field.text')}</label>
                <textarea value={c.text} onChange={(e) => setContent(l.id, { text: e.target.value })} readOnly={!canSave} rows={4} className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
          )
        })}
        <p className="mt-2 text-[11px] text-muted-foreground">{t('emails.html_hint')}</p>
      </section>
    </div>
  )
}
