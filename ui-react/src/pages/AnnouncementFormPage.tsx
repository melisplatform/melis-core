import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarClock, Loader2, Megaphone, RotateCcw, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MelisToolEditor } from '@/components/ui/melis-tool-editor'
import { DateTimeField } from '@/components/ui/datetime-field'
import { cn } from '@/lib/utils'
import * as annApi from '@/lib/announcement-api'
import { useSubTabs } from '@/components/tabs/sub-tab-store'
import { routeForForward } from '@/lib/tool-routes'
import { useCan } from '@/lib/capabilities'
import { useIsNarrow } from '@/hooks/useIsNarrow'
import { useI18n } from '@/i18n/i18n-context'

function notify(kind: 'ok' | 'ko', title: string, message: string) {
  window.postMessage({ __melisNotif: true, kind, title, message }, '*')
}

interface FormData { title: string; text: string; status: boolean; date: string }
const EMPTY_FORM: FormData = { title: '', text: '', status: true, date: '' }

/** Cache du formulaire par annonce (survit à la navigation interne). */
const _formCache = new Map<string, FormData>()

/** `Y-m-d H:i:s` (API) → `Y-m-d\TH:i` (input datetime-local). */
function toLocalInput(sqlDate: string): string {
  if (!sqlDate) return ''
  const d = new Date(sqlDate.replace(' ', 'T'))
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Interrupteur on/off réutilisable. */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-emerald-500' : 'bg-red-500')}>
      <span className={cn('inline-block size-5 transform rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  )
}

export default function AnnouncementFormPage() {
  const navigate = useNavigate()
  const { id }   = useParams<{ id: string }>()
  const { t, currentLocale } = useI18n()
  const narrow = useIsNarrow()
  // Locale BO ("en_EN"/"fr_FR"…) → BCP-47 pour piloter le format d'affichage de la date (jj/mm vs mm/jj).
  const boLocale = (currentLocale || 'en').replace(/_/g, '-')
  const isEdit   = Boolean(id)
  const annId    = id ? parseInt(id) : null

  const base = routeForForward('MelisCore/Announcement') ?? '/announcements'

  // Garde de capacité : accès direct au formulaire (URL) bloqué si l'action n'est pas permise.
  const canForm = useCan('melis_core_announcement_tool', isEdit ? 'edit' : 'create')
  useEffect(() => { if (!canForm) navigate(base) }, [canForm, navigate, base])

  const subTabPath = annId ? `${base}/${annId}` : `${base}/new`
  const { openTab: openSubTab, closeTab: closeSubTab, updateLabel: updateSubLabel } = useSubTabs(base)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (annId) closeSubTab(`${base}/new`)
    openSubTab({ id: subTabPath, label: isEdit ? t('common.loading') : t('ann.new'), path: subTabPath })
  }, [])

  const [form, setForm]       = useState<FormData>(EMPTY_FORM)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [textError, setTextError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    if (!isEdit || !annId) return
    const cached = _formCache.get(String(annId))
    if (cached) { setForm(cached); return }
    setLoading(true)
    annApi.fetchAnnouncementById(annId)
      .then(a => setForm({ title: a.title, text: a.text, status: a.status, date: toLocalInput(a.date) }))
      .catch(() => navigate(base))
      .finally(() => setLoading(false))
  }, [annId, isEdit, navigate])

  useEffect(() => {
    if (annId && form.title) _formCache.set(String(annId), form)
  }, [form, annId])

  useEffect(() => {
    if (isEdit && form.title) updateSubLabel(subTabPath, form.title)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(p => ({ ...p, [key]: value }))
    if (key === 'title') setTitleError(null)
    if (key === 'text') setTextError(null)
    setSaveError(null)
  }

  function validate(): boolean {
    let ok = true
    if (!form.title.trim()) { setTitleError(t('ann.form.err_title')); ok = false }
    if (!form.text.replace(/<[^>]*>/g, '').trim()) { setTextError(t('ann.form.err_text')); ok = false }
    return ok
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      await annApi.saveAnnouncement({
        id: annId, title: form.title.trim(), text: form.text, status: form.status, date: form.date,
      })
      annApi.markAnnouncementsListStale()
      setSaved(true)
      notify('ok', t('ann.title'), t('ann.form.saved'))
      if (!isEdit) closeSubTab(`${base}/new`)
      setTimeout(() => navigate(base), 600)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('ann.form.err_save'))
    } finally {
      setSaving(false)
    }
  }

  function handleRefresh() {
    if (!annId) return
    _formCache.delete(String(annId))
    setLoading(true)
    annApi.fetchAnnouncementById(annId)
      .then(a => setForm({ title: a.title, text: a.text, status: a.status, date: toLocalInput(a.date) }))
      .catch(() => null)
      .finally(() => setTimeout(() => setLoading(false), 300))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header — narrow-only additions never remove/replace a desktop class, so at narrow=false
          every className below renders byte-identical to the original desktop layout. */}
      <div className="flex items-center justify-between gap-4">
        <div className={cn('flex items-center gap-3', narrow && 'min-w-0')}>
          <div className={narrow ? 'hidden' : 'grid size-10 place-items-center rounded-lg bg-primary/10 text-primary'}>
            <Megaphone className="size-5" />
          </div>
          <div className={cn(narrow && 'min-w-0')}>
            <h1 className={cn('text-xl font-bold', narrow && 'truncate')}>{isEdit ? t('ann.form.edit_title') : t('ann.form.new_title')}</h1>
          </div>
        </div>
        <div className={cn('flex items-center gap-2', narrow && 'shrink-0 flex-col')}>
          <div className="flex items-center gap-2">
            {saved && <span className="text-sm text-emerald-600">{t('ann.form.saved')}</span>}
            {isEdit && (
              <button type="button" onClick={handleRefresh} title={t('common.refresh')}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                <RotateCcw className={cn('size-3.5', loading && 'animate-spin')} />
              </button>
            )}
          </div>
          <Button size="sm" className={cn(narrow && 'w-full')} onClick={handleSubmit} disabled={saving || loading}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{t('common.save')}
          </Button>
        </div>
      </div>

      {saveError && <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/20">{saveError}</div>}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>
      ) : (
        // Contenu à gauche (large), Options à droite.
        <div className="grid max-w-5xl grid-cols-1 items-start gap-4 lg:grid-cols-3">
          {/* Contenu */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('ann.form.content')}</h3>

            <label className="mb-1 block text-sm font-medium">{t('ann.form.title')}</label>
            <Input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder={t('ann.form.title_ph')} autoComplete="off"
              className={cn(titleError && 'border-destructive')} />
            {titleError && <p className="mt-1 text-xs text-destructive">{titleError}</p>}

            <label className="mb-1 mt-4 block text-sm font-medium">{t('ann.form.text')}</label>
            {/* Éditeur WYSIWYG TinyMCE avec la config 'tool' de melis-core (idem Emails management). */}
            <MelisToolEditor value={form.text} onChange={html => set('text', html)} minHeight={300} />
            {textError
              ? <p className="mt-1 text-xs text-destructive">{textError}</p>
              : <p className="mt-1 text-xs text-muted-foreground">{t('ann.form.text_hint')}</p>}
          </div>

          {/* Options */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('ann.form.options')}</h3>
            <div className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-medium">{t('ann.form.status')}</p>
                <p className="text-xs text-muted-foreground">{t('ann.form.status_hint')}</p>
              </div>
              <Toggle checked={form.status} onChange={v => set('status', v)} />
            </div>
            <div className="border-t border-border/50 pt-3">
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                <CalendarClock className="size-3.5 text-muted-foreground" />{t('ann.form.date')}
              </label>
              <DateTimeField value={form.date} onChange={v => set('date', v)} locale={boLocale} />
              <p className="mt-1 text-xs text-muted-foreground">{t('ann.form.date_hint')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
