import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Settings, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'


/**
 * Modale de configuration d'un widget plugin legacy — le bouton engrenage du dashboard.
 *
 * Rendu 100% REACT : le backend renvoie la config du plugin en DONNÉES
 * (`/melis/react-dashboard-plugin-config-data` → onglets + champs typés + valeurs, libellés déjà
 * traduits), et on dessine le formulaire avec les composants du back-office. Auparavant la modale
 * embarquait le formulaire Laminas rendu en HTML dans une iframe : look legacy au milieu de l'UI
 * React, et tout le bundle de la plateforme chargé pour un simple `<select>`.
 *
 * L'ENREGISTREMENT reste celui du legacy (`/melis/react-dashboard-plugin-config-save`) : les champs
 * gardent les `name` du formulaire d'origine, donc le POST est identique et la validation Laminas
 * (input_filter, messages d'erreur par champ) continue de s'appliquer côté serveur.
 */

interface ConfigField {
  name: string
  type: string
  label: string
  value: string | number | boolean | null
  options: { value: string; label: string }[]
  required: boolean
  rows: number
}
interface ConfigTab { id: string; name: string; icon: string; fields: ConfigField[] }
interface ConfigData { empty: boolean; tabs: ConfigTab[]; emptyLabel: string; saveLabel: string }

/** Valeur initiale d'un champ, normalisée en chaîne (les <input> React sont contrôlés). */
function initialValue(f: ConfigField): string {
  if (f.value === null || f.value === undefined) return ''
  if (typeof f.value === 'boolean') return f.value ? '1' : ''
  return String(f.value)
}

export function WidgetConfigDialog({
  pluginName,
  title,
  onClose,
  onSaved,
}: {
  /** Absent pour un widget NATIF : il n'a pas de plugin legacy, donc aucun paramètre. */
  pluginName?: string
  title: string
  onClose: () => void
  /** Appelé après un enregistrement réussi — le widget se recharge pour refléter la nouvelle config. */
  onSaved?: () => void
}) {
  const { t } = useI18n()
  const [data, setData] = useState<ConfigData | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Erreurs de validation renvoyées par Laminas, par nom de champ.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Ferme sur Échap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    let cancelled = false
    // Widget natif : rien à charger, on affiche directement l'état « aucun paramètre ».
    if (!pluginName) {
      setData({ empty: true, tabs: [], emptyLabel: '', saveLabel: '' })
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const res = await fetch(
          `/melis/react-dashboard-plugin-config-data?plugin=${encodeURIComponent(pluginName)}`,
          { headers: { 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'same-origin' },
        )
        const json = (await res.json()) as { success?: boolean; data?: ConfigData }
        if (cancelled) return
        if (!json.success || !json.data) { setError(t('dash.cfg_load_error')); return }
        setData(json.data)
        const init: Record<string, string> = {}
        for (const tab of json.data.tabs) for (const f of tab.fields) init[f.name] = initialValue(f)
        setValues(init)
      } catch {
        if (!cancelled) setError(t('dash.cfg_load_error'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [pluginName, t])

  async function handleSave() {
    // Inatteignable pour un widget natif (le bouton est masqué quand il n'y a rien à enregistrer),
    // mais le garde-fou rend l'invariant explicite pour le typage.
    if (!pluginName) return
    setSaving(true)
    setError(null)
    setFieldErrors({})
    try {
      // form-urlencoded : le endpoint de sauvegarde lit `$request->getPost()`, exactement comme le
      // formulaire legacy — d'où l'absence de JSON ici.
      const body = new URLSearchParams({ plugin: pluginName, ...values })
      const res = await fetch('/melis/react-dashboard-plugin-config-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
        body,
      })
      const json = (await res.json()) as {
        success?: boolean
        error?: string
        errors?: { name?: string; success?: boolean; errors?: Record<string, Record<string, string> & { label?: string }> }[]
      }
      if (json.success) { onSaved?.(); onClose(); return }
      // Laminas renvoie ses messages par onglet puis par champ : on aplatit en « champ → 1ᵉʳ message ».
      const flat: Record<string, string> = {}
      for (const tab of json.errors ?? []) {
        for (const [field, msgs] of Object.entries(tab.errors ?? {})) {
          const first = Object.entries(msgs).find(([k]) => k !== 'label')?.[1]
          if (typeof first === 'string') flat[field] = first
        }
      }
      setFieldErrors(flat)
      if (Object.keys(flat).length === 0) setError(json.error ?? t('common.err_save'))
    } catch {
      setError(t('common.err_save'))
    } finally {
      setSaving(false)
    }
  }

  function field(f: ConfigField) {
    const val = values[f.name] ?? ''
    const set = (v: string) => setValues((p) => ({ ...p, [f.name]: v }))
    const err = fieldErrors[f.name]
    const inputCls = cn(
      // bg-card, pas bg-background : le fond de la modale est déjà `bg-card` — `bg-background`
      // (le gris de la page) faisait ressortir les champs en grisé dans la modale blanche.
      'w-full rounded-md border bg-card px-3 py-2 text-sm outline-none transition-colors',
      'focus:border-primary focus:ring-1 focus:ring-primary',
      err ? 'border-destructive' : 'border-border',
    )

    if (f.type === 'hidden') return null

    return (
      <div key={f.name} className="flex flex-col gap-1.5">
        {f.type !== 'checkbox' && (
          <label htmlFor={`cfg-${f.name}`} className="text-xs font-medium text-foreground">
            {f.label}
            {f.required && <span className="ml-0.5 text-destructive">*</span>}
          </label>
        )}

        {f.type === 'select' ? (
          <select id={`cfg-${f.name}`} value={val} onChange={(e) => set(e.target.value)} className={inputCls}>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : f.type === 'radio' ? (
          <div className="flex flex-wrap gap-3">
            {f.options.map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-1.5 text-sm">
                <input type="radio" name={f.name} value={o.value} checked={val === o.value}
                       onChange={() => set(o.value)} className="accent-[var(--color-primary)]" />
                {o.label}
              </label>
            ))}
          </div>
        ) : f.type === 'checkbox' ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input id={`cfg-${f.name}`} type="checkbox" checked={val === '1'}
                   onChange={(e) => set(e.target.checked ? '1' : '')} className="accent-[var(--color-primary)]" />
            {f.label}
          </label>
        ) : f.type === 'textarea' ? (
          <textarea id={`cfg-${f.name}`} value={val} rows={f.rows || 4}
                    onChange={(e) => set(e.target.value)} className={inputCls} />
        ) : (
          <input id={`cfg-${f.name}`} type={f.type === 'number' ? 'number' : 'text'} value={val}
                 onChange={(e) => set(e.target.value)} className={inputCls} />
        )}

        {err && <p className="text-xs text-destructive">{err}</p>}
      </div>
    )
  }

  const tabs = data?.tabs ?? []
  const current = tabs[activeTab]

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-[var(--font-display)] truncate text-sm font-semibold">
            {t('layout.widget_config', { title })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label={t('layout.close')}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Barre d'onglets seulement s'il y en a plusieurs — un onglet unique n'apporte rien. */}
        {tabs.length > 1 && (
          <div className="flex items-stretch gap-1 border-b border-border bg-muted/30 px-2">
            {tabs.map((tab, i) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(i)}
                style={{ borderBottom: i === activeTab ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                className={cn(
                  'flex cursor-pointer items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors',
                  i === activeTab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}>
                <Settings className="size-3 shrink-0" />
                {tab.name}
              </button>
            ))}
          </div>
        )}

        <div className="min-h-[160px] flex-1 overflow-auto p-5">
          {loading ? (
            <div className="grid h-32 place-items-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : data?.empty ? (
            <p className="text-sm text-muted-foreground">{t('dash.cfg_no_params')}</p>
          ) : (
            <div className="flex flex-col gap-4">{current?.fields.map(field)}</div>
          )}
        </div>

        {/* Pas de bouton d'enregistrement quand il n'y a rien à enregistrer (règle de la modale legacy). */}
        {!loading && !error && !data?.empty && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
            <button type="button" onClick={onClose} disabled={saving}
                    className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-60">
              {t('common.cancel')}
            </button>
            <button type="button" onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              {data?.saveLabel || t('common.save')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
