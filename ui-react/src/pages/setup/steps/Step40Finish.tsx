import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/i18n-context'
import { applyModule, finalizeSetup, getModuleState } from '@/lib/setup-api'

/** Give the container's applier time to reload Apache (it polls every 2s on its side). */
const MODULE_POLL_INTERVAL = 1000
const MODULE_POLL_ATTEMPTS = 30

const sleep = (ms: number) => new Promise((resolve) => { setTimeout(resolve, ms) })

/**
 * Last step — the legacy carousel's "Creation & result". The Finish button calls
 * `finalizeSetup` (which unplugs MelisInstaller and writes `config/melis.install`), then
 * sends the user to the back-office.
 *
 * Before that, it asks the container to adopt the chosen site module as MELIS_MODULE, so the
 * front site answers without editing `.env` by hand and restarting. This has to happen BEFORE
 * `finalizeSetup`, which unplugs MelisInstaller and takes the route carrying that request with
 * it. If this part fails the install still completes: the problem is reported, along with what
 * to do by hand.
 */
export function Step40Finish({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  const [installing, setInstalling] = useState(false)
  const [finished, setFinished] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [moduleWarning, setModuleWarning] = useState<string | null>(null)

  /**
   * Drops the request, then waits for the applier to acknowledge it. Never throws.
   * Success is silent — only a failure or a request nobody picked up is worth telling the
   * user about, since there is a manual fix to do in those cases.
   */
  async function adoptModule() {
    setModuleWarning(null)
    try {
      const request = await applyModule()
      // `skipped`: install with no site module (core only / bare platform). Nothing to
      // adopt, so do not wait and do not warn.
      if (request.state === 'skipped') return
      if (request.state === 'applied') return
      for (let i = 0; i < MODULE_POLL_ATTEMPTS; i++) {
        await sleep(MODULE_POLL_INTERVAL)
        const state = await getModuleState()
        if (state.state === 'applied') return
        if (state.state === 'failed') {
          setModuleWarning(t('setup.finish.module_failed', { module: request.module }))
          return
        }
      }
      // No applier in this container (older image, or an install outside Docker): the
      // request stays pending. Say so clearly instead of waiting forever.
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
      // Land on the React back-office, the one this wizard belongs to — the legacy
      // wizard is the one that sends you to /melis. Delayed like the legacy does, to
      // give the back-office a moment to answer after the install.
      setTimeout(() => { window.location.replace('/melis-react') }, 5000)
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
