import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/i18n-context'
import { applyModule, finalizeSetup, getModuleState } from '@/lib/setup-api'

/** Laisse à l'applier du conteneur le temps de recharger Apache (poll de 2s côté conteneur). */
const MODULE_POLL_INTERVAL = 1000
const MODULE_POLL_ATTEMPTS = 30

const sleep = (ms: number) => new Promise((resolve) => { setTimeout(resolve, ms) })

/**
 * Étape finale — « Creation & result » du carousel legacy : le bouton Terminer appelle
 * `finalizeSetup` (désactivation de MelisInstaller, écriture de `config/melis.install`),
 * puis redirige vers le back-office comme le legacy.
 *
 * Avant cela, il demande au conteneur d'adopter comme MELIS_MODULE le nom de module saisi à
 * l'étape des modules, pour que le site front réponde sans édition manuelle du `.env` ni
 * redémarrage. C'est nécessairement AVANT `finalizeSetup`, qui débranche MelisInstaller et
 * emporte avec lui la route qui porte cette demande. Un échec de cette étape n'empêche pas de
 * terminer l'installation : il est signalé, avec la manipulation manuelle à faire.
 */
export function Step40Finish({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  const [installing, setInstalling] = useState(false)
  const [finished, setFinished] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [moduleWarning, setModuleWarning] = useState<string | null>(null)
  const [moduleApplied, setModuleApplied] = useState<string | null>(null)

  /** Dépose la demande puis attend l'acquittement de l'applier. Ne jette jamais. */
  async function adoptModule() {
    setModuleWarning(null)
    try {
      const request = await applyModule()
      if (request.state === 'applied') {
        setModuleApplied(request.module)
        return
      }
      for (let i = 0; i < MODULE_POLL_ATTEMPTS; i++) {
        await sleep(MODULE_POLL_INTERVAL)
        const state = await getModuleState()
        if (state.state === 'applied') {
          setModuleApplied(state.module)
          return
        }
        if (state.state === 'failed') {
          setModuleWarning(t('setup.finish.module_failed', { module: request.module }))
          return
        }
      }
      // Pas d'applier dans ce conteneur (image plus ancienne, install hors Docker) : la
      // demande reste en attente, on le dit clairement plutôt que d'attendre indéfiniment.
      setModuleWarning(t('setup.finish.module_pending', { module: request.module }))
    } catch (e) {
      setModuleWarning(e instanceof Error ? e.message : String(e))
    }
  }

  async function handleFinish() {
    setInstalling(true)
    setError(null)
    try {
      await adoptModule()

      const result = await finalizeSetup()
      if (result.success !== 1) {
        setError(t('setup.finish.error'))
        onStatusChange?.(false)
        return
      }
      setFinished(true)
      onStatusChange?.(true)
      // Même redirection différée que le legacy, le temps que la page d'accueil réponde.
      setTimeout(() => { window.location.replace('/melis') }, 5000)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      onStatusChange?.(false)
    } finally {
      setInstalling(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-[var(--font-display)] text-sm font-semibold">{t('setup.finish.title')}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{t('setup.finish.desc')}</p>

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <div className="flex items-center gap-3">
          <Button type="button" onClick={() => void handleFinish()} disabled={installing || finished}>
            {installing && <Loader2 className="size-4 animate-spin" />}
            {installing ? t('setup.finish.installing') : t('setup.finish.button')}
          </Button>
          {finished && (
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-success)]">
              <CheckCircle2 className="size-4" />
              {t('setup.finish.done')}
            </span>
          )}
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>

        {moduleApplied && (
          <p className="text-xs text-muted-foreground">
            {t('setup.finish.module_applied', { module: moduleApplied })}
          </p>
        )}
        {moduleWarning && (
          <p className="flex items-start gap-1.5 text-xs text-[var(--color-warning,#b45309)]">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            {moduleWarning}
          </p>
        )}
      </div>
    </div>
  )
}
