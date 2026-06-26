import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Info, Languages, Loader2, RotateCcw, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import * as languageApi from '@/lib/language-api'
import { useSubTabs } from '@/components/tabs/sub-tab-store'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import { useCan } from '@/lib/capabilities'

const TOOL_KEY = 'meliscore_tool_language'

interface FormData { name: string; locale: string }
const EMPTY_FORM: FormData = { name: '', locale: '' }

/** Cache du formulaire par langue (survit à la navigation interne). */
const _formCache = new Map<string, { form: FormData; isDefault: boolean }>()

export default function LanguageFormPage() {
  const navigate = useNavigate()
  const { id }   = useParams<{ id: string }>()
  const { t }    = useI18n()
  const isEdit   = Boolean(id)
  const languageId = id ? parseInt(id) : null

  const base = routeForForward('MelisCore/Language') ?? '/languages'
  const subTabPath = languageId ? `${base}/${languageId}` : `${base}/new`
  const { openTab: openSubTab, closeTab: closeSubTab, updateLabel: updateSubLabel } = useSubTabs(base)

  // Capacité requise pour ce formulaire : edit en édition, create en création.
  const canForm = useCan(TOOL_KEY, isEdit ? 'edit' : 'create')
  useEffect(() => { if (!canForm) navigate(base) }, [canForm, navigate, base])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (languageId) closeSubTab(`${base}/new`)
    openSubTab({ id: subTabPath, label: isEdit ? t('common.loading') : t('languages.new'), path: subTabPath })
  }, [])

  const [form, setForm]         = useState<FormData>(EMPTY_FORM)
  const [isDefault, setIsDefault] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [localeError, setLocaleError] = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    if (!isEdit || !languageId) return
    const cached = _formCache.get(String(languageId))
    if (cached) { setForm(cached.form); setIsDefault(cached.isDefault); return }
    setLoading(true)
    languageApi.fetchLanguageById(languageId)
      .then(l => { setForm({ name: l.name, locale: l.locale }); setIsDefault(l.isDefault) })
      .catch(() => navigate(base))
      .finally(() => setLoading(false))
  }, [languageId, isEdit, navigate])

  useEffect(() => {
    if (languageId && form.name) _formCache.set(String(languageId), { form, isDefault })
  }, [form, isDefault, languageId])

  useEffect(() => {
    if (isEdit && form.name) updateSubLabel(subTabPath, form.name)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(p => ({ ...p, [key]: value }))
    if (key === 'name') setNameError(null)
    if (key === 'locale') setLocaleError(null)
    setSaveError(null)
  }

  function validate(): boolean {
    let ok = true
    if (!form.name.trim()) { setNameError(t('languages.form.err_name_required')); ok = false }
    const locale = form.locale.trim()
    if (!locale) { setLocaleError(t('languages.form.err_locale_required')); ok = false }
    else if (!/^[a-zA-Z]{2}_[a-zA-Z]{2}$/.test(locale)) { setLocaleError(t('languages.form.err_locale_format')); ok = false }
    return ok
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      await languageApi.saveLanguage({ id: languageId, name: form.name.trim(), locale: form.locale.trim() })
      languageApi.markLanguagesListStale()
      setSaved(true)
      if (!isEdit) closeSubTab(`${base}/new`)
      setTimeout(() => navigate(base), 600)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('languages.form.err_save'))
    } finally {
      setSaving(false)
    }
  }

  function handleRefresh() {
    if (!languageId) return
    _formCache.delete(String(languageId))
    setLoading(true)
    languageApi.fetchLanguageById(languageId)
      .then(l => { setForm({ name: l.name, locale: l.locale }); setIsDefault(l.isDefault) })
      .catch(() => null)
      .finally(() => setTimeout(() => setLoading(false), 300))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(base)} className="text-muted-foreground hover:text-foreground" title={t('common.back')}>
            <ArrowLeft className="size-4" />
          </button>
          <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Languages className="size-5" /></div>
          <div>
            <h1 className="text-xl font-bold">{isEdit ? t('languages.form.edit_title') : t('languages.form.new_title')}</h1>
            {isDefault && <p className="text-xs text-amber-600">{t('languages.form.default_hint')}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-emerald-600">{t('languages.form.saved')}</span>}
          {isEdit && (
            <button type="button" onClick={handleRefresh} title={t('common.refresh')}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
              <RotateCcw className={cn('size-3.5', loading && 'animate-spin')} />
            </button>
          )}
          <Button size="sm" onClick={handleSubmit} disabled={saving || loading}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{t('common.save')}
          </Button>
        </div>
      </div>

      {saveError && <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/20">{saveError}</div>}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>
      ) : (
        // Identité à gauche, Informations à droite (2 colonnes dès qu'il y a la place).
        <div className="grid max-w-4xl grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {/* Identité */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('languages.form.identity')}</h3>

            <label className="mb-1 block text-sm font-medium">{t('languages.form.name')}</label>
            <Input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder={t('languages.form.name_ph')} autoComplete="off"
              className={cn(nameError && 'border-destructive')} />
            {nameError
              ? <p className="mt-1 text-xs text-destructive">{nameError}</p>
              : <p className="mt-1 text-xs text-muted-foreground">{t('languages.form.name_hint')}</p>}

            <label className="mb-1 mt-4 block text-sm font-medium">{t('languages.form.locale')}</label>
            <Input value={form.locale} onChange={e => set('locale', e.target.value)} disabled={isDefault}
              placeholder={t('languages.form.locale_ph')} autoComplete="off"
              className={cn('font-mono', localeError && 'border-destructive')} />
            {localeError
              ? <p className="mt-1 text-xs text-destructive">{localeError}</p>
              : <p className="mt-1 text-xs text-muted-foreground">{t('languages.form.locale_hint')}</p>}
          </div>

          {/* Informations */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('languages.form.info')}</h3>
            <div className="flex items-start gap-3 py-2">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">{t('languages.form.info_files')}</p>
            </div>
            {isDefault && (
              <div className="mt-2 flex items-start gap-3 border-t border-border/50 py-2">
                <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-600">{t('languages.form.default_hint')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
