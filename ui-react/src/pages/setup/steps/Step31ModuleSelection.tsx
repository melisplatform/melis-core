import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useI18n } from '@/i18n/i18n-context'
import {
  activateModules,
  downloadModules,
  listAvailableModules,
  saveModuleSelection,
  type ModuleCatalogEntry,
} from '@/lib/setup-api'

type InstallPhase = 'saving' | 'downloading' | 'activating' | 'done'

/**
 * Step 3.1 — sélection des modules Melis à installer. Catalogue récupéré en direct depuis le
 * marketplace Packagist (même appel réseau que le carousel legacy) : peut être vide si le
 * marketplace est injoignable — même comportement que côté legacy dans ce cas.
 */
export function Step31ModuleSelection({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  const [modules, setModules] = useState<ModuleCatalogEntry[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [installing, setInstalling] = useState(false)
  const [phase, setPhase] = useState<InstallPhase | null>(null)
  const [log, setLog] = useState<string[]>([])
  const [installError, setInstallError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setLoadError(null)
    try {
      const { modules: list } = await listAvailableModules()
      setModules(list)
      // Pré-coche les modules déjà actifs par défaut sur le marketplace, mêmes cases pré-cochées
      // que le carousel legacy (checked par défaut dans selection.phtml).
      setSelected(new Set(list.filter((m) => m.active).map((m) => m.name)))
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(name: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(name)) next.delete(name); else next.add(name)
      return next
    })
  }

  async function handleInstall() {
    if (!modules) return
    setInstalling(true)
    setInstallError(null)
    setLog([])
    const chosen = modules.filter((m) => selected.has(m.name)).map((m) => ({ name: m.name, package: m.package }))
    try {
      setPhase('saving')
      await saveModuleSelection(chosen)
      setLog((l) => [...l, t('setup.modules.log_saved', { count: chosen.length })])

      setPhase('downloading')
      const dl = await downloadModules()
      setLog((l) => [
        ...l,
        dl.alreadyPresent.length
          ? t('setup.modules.log_already_present', { count: dl.alreadyPresent.length })
          : null,
        dl.downloaded.length
          ? t('setup.modules.log_downloaded', { count: dl.downloaded.length, names: dl.downloaded.join(', ') })
          : t('setup.modules.log_none_download'),
      ].filter((x): x is string => !!x))

      setPhase('activating')
      const act = await activateModules()
      setLog((l) => [...l, t('setup.modules.log_active', { count: act.modules.length })])

      setPhase('done')
      onStatusChange?.(true)
    } catch (e) {
      setInstallError(e instanceof Error ? e.message : String(e))
      onStatusChange?.(false)
    } finally {
      setInstalling(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-[var(--font-display)] text-sm font-semibold">{t('setup.modules.title')}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('setup.modules.desc')}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          aria-label={t('setup.modules.refresh')}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
        </button>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : loadError ? (
          <p className="text-sm text-destructive">{loadError}</p>
        ) : !modules?.length ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="size-4" />
            {t('setup.modules.none')}
          </div>
        ) : (
          <>
            <ul className="max-h-72 space-y-1 overflow-y-auto">
              {modules.map((m) => (
                <li key={m.name}>
                  <label className="flex items-center gap-2.5 rounded-md px-1.5 py-1 text-sm hover:bg-accent">
                    <Checkbox checked={selected.has(m.name)} onCheckedChange={() => toggle(m.name)} />
                    <span className="font-medium">{m.name}</span>
                    <span className="text-xs text-muted-foreground">{m.package}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-3">
              <Button type="button" onClick={handleInstall} disabled={installing}>
                {installing && <Loader2 className="size-4 animate-spin" />}
                {t('setup.modules.install', { count: selected.size })}
              </Button>
              {phase === 'done' && (
                <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-success)]">
                  <CheckCircle2 className="size-4" />
                  {t('setup.modules.done')}
                </span>
              )}
            </div>

            {(log.length > 0 || installError) && (
              <ul className="mt-3 space-y-1 rounded-md bg-muted/40 p-3 font-[var(--font-mono)] text-xs text-muted-foreground">
                {log.map((line, i) => <li key={i}>{line}</li>)}
                {installError && <li className="text-destructive">{installError}</li>}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )
}
