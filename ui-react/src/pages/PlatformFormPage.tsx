import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Database, Loader2, RotateCcw, Save, Server, ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import * as platformApi from '@/lib/platform-api'
import { useSubTabs } from '@/components/tabs/sub-tab-store'
import { routeForForward } from '@/lib/tool-routes'
import { useCan } from '@/lib/capabilities'
import { useI18n } from '@/i18n/i18n-context'

function notify(kind: 'ok' | 'ko', title: string, message: string) {
  window.postMessage({ __melisNotif: true, kind, title, message }, '*')
}

interface FormData { name: string; marketplace: boolean; cache: boolean }
const EMPTY_FORM: FormData = { name: '', marketplace: true, cache: true }

/** Cache du formulaire par plateforme (survit à la navigation interne). */
const _formCache = new Map<string, { form: FormData; isCurrent: boolean }>()

/** Interrupteur on/off réutilisable. */
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-emerald-500' : 'bg-red-500', disabled && 'cursor-not-allowed opacity-50')}>
      <span className={cn('inline-block size-5 transform rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  )
}

export default function PlatformFormPage() {
  const navigate = useNavigate()
  const { id }   = useParams<{ id: string }>()
  const { t }    = useI18n()
  const isEdit   = Boolean(id)
  const platformId = id ? parseInt(id) : null

  const base = routeForForward('MelisCore/Platforms') ?? '/platforms'

  // Garde de capacité : accès direct au formulaire (URL) bloqué si l'action n'est pas permise.
  const canForm = useCan('meliscore_tool_platform', isEdit ? 'edit' : 'create')
  useEffect(() => { if (!canForm) navigate(base) }, [canForm, navigate, base])

  const subTabPath = platformId ? `${base}/${platformId}` : `${base}/new`
  const { openTab: openSubTab, closeTab: closeSubTab, updateLabel: updateSubLabel } = useSubTabs(base)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (platformId) closeSubTab(`${base}/new`)
    openSubTab({ id: subTabPath, label: isEdit ? t('common.loading') : t('platforms.new'), path: subTabPath })
  }, [])

  const [form, setForm]       = useState<FormData>(EMPTY_FORM)
  const [isCurrent, setIsCurrent] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    if (!isEdit || !platformId) return
    const cached = _formCache.get(String(platformId))
    if (cached) { setForm(cached.form); setIsCurrent(cached.isCurrent); return }
    setLoading(true)
    platformApi.fetchPlatformById(platformId)
      .then(p => { setForm({ name: p.name, marketplace: p.marketplace, cache: p.cache }); setIsCurrent(p.isCurrent) })
      .catch(() => navigate(base))
      .finally(() => setLoading(false))
  }, [platformId, isEdit, navigate])

  useEffect(() => {
    if (platformId && form.name) _formCache.set(String(platformId), { form, isCurrent })
  }, [form, isCurrent, platformId])

  useEffect(() => {
    if (isEdit && form.name) updateSubLabel(subTabPath, form.name)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(p => ({ ...p, [key]: value }))
    if (key === 'name') setNameError(null)
    setSaveError(null)
  }

  function validate(): boolean {
    if (!form.name.trim()) { setNameError(t('platforms.form.err_required')); return false }
    if (!/^[a-zA-Z0-9]+$/.test(form.name.trim())) { setNameError(t('platforms.form.err_alnum')); return false }
    return true
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      await platformApi.savePlatform({
        id: platformId, name: form.name.trim(), marketplace: form.marketplace, cache: form.cache,
      })
      platformApi.markPlatformsListStale()
      setSaved(true)
      notify('ok', t('platforms.title'), t('platforms.form.saved'))
      if (!isEdit) closeSubTab(`${base}/new`)
      setTimeout(() => navigate(base), 600)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('platforms.form.err_save'))
    } finally {
      setSaving(false)
    }
  }

  function handleRefresh() {
    if (!platformId) return
    _formCache.delete(String(platformId))
    setLoading(true)
    platformApi.fetchPlatformById(platformId)
      .then(p => { setForm({ name: p.name, marketplace: p.marketplace, cache: p.cache }); setIsCurrent(p.isCurrent) })
      .catch(() => null)
      .finally(() => setTimeout(() => setLoading(false), 300))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Server className="size-5" /></div>
          <div>
            <h1 className="text-xl font-bold">{isEdit ? t('platforms.form.edit_title') : t('platforms.form.new_title')}</h1>
            {isCurrent && <p className="text-xs text-amber-600">{t('platforms.form.current_hint')}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-emerald-600">{t('platforms.form.saved')}</span>}
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
        // Identité à gauche, Options à droite (2 colonnes dès qu'il y a la place).
        <div className="grid max-w-4xl grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {/* Identité */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('platforms.form.identity')}</h3>
            <label className="mb-1 block text-sm font-medium">{t('platforms.form.name')}</label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} disabled={isCurrent}
              placeholder={t('platforms.form.name_ph')} autoComplete="off"
              className={cn(nameError && 'border-destructive')} />
            {nameError
              ? <p className="mt-1 text-xs text-destructive">{nameError}</p>
              : <p className="mt-1 text-xs text-muted-foreground">{t('platforms.form.name_hint')}</p>}
          </div>

          {/* Options */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('platforms.form.options')}</h3>
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3">
                <ShoppingBag className="size-4 shrink-0 text-violet-600" />
                <div>
                  <p className="text-sm font-medium">{t('platforms.form.marketplace')}</p>
                  <p className="text-xs text-muted-foreground">{t('platforms.form.marketplace_hint')}</p>
                </div>
              </div>
              <Toggle checked={form.marketplace} onChange={v => set('marketplace', v)} />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border/50 py-2">
              <div className="flex items-center gap-3">
                <Database className="size-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium">{t('platforms.form.cache')}</p>
                  <p className="text-xs text-muted-foreground">{t('platforms.form.cache_hint')}</p>
                </div>
              </div>
              <Toggle checked={form.cache} onChange={v => set('cache', v)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
