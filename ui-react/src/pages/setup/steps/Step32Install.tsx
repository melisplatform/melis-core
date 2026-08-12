import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/i18n-context'
import {
  addModulesToComposer,
  checkSiteModule,
  execDbDeploy,
  installSiteModule,
  legacyActivateModules,
  legacyDownloadModules,
  rebuildAutoloader,
  reprocessDbDeploy,
} from '@/lib/setup-api'

/** Retire les balises HTML des sorties legacy (composer/dbdeploy renvoient du HTML brut). */
function toText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
}

/**
 * Step 3.2 — console d'installation : rejoue à l'identique la chaîne du carousel legacy
 * (`setup.js`), dans le même ordre et via les mêmes endpoints — ajout des modules au
 * composer.json (sortie streamée), `composer update`, dbdeploy, installation du site
 * quand il y en a un, reconstruction de l'autoloader, activation des modules, puis
 * reprise dbdeploy. Long : rien n'est timeouté côté client, comme le legacy.
 */
export function Step32Install({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [output, setOutput] = useState('')
  const consoleRef = useRef<HTMLPreElement>(null)
  const started = useRef(false)

  const append = useCallback((text: string) => {
    if (!text.trim()) return
    setOutput((o) => (o ? `${o}\n${text.trim()}` : text.trim()))
  }, [])

  useEffect(() => {
    consoleRef.current?.scrollTo({ top: consoleRef.current.scrollHeight })
  }, [output])

  const run = useCallback(async () => {
    setRunning(true)
    setError(null)
    setDone(false)
    try {
      append(t('setup.install.composer'))
      await addModulesToComposer((chunk) => append(toText(chunk)))

      append(t('setup.install.downloading'))
      append(toText(await legacyDownloadModules()))

      append(t('setup.install.dbdeploy'))
      append(toText(await execDbDeploy()))

      // Un site (démo ou nouveau) n'est installé que si l'étape précédente en a retenu un.
      const site = await checkSiteModule()
      if (site.hasSite) {
        append(t('setup.install.site', { name: site.siteName ?? '' }))
        const installed = await installSiteModule()
        append(installed.message)
      }

      append(t('setup.install.activating'))
      append(toText(await rebuildAutoloader()))
      append(toText(await legacyActivateModules()))

      await reprocessDbDeploy()
      append(t('setup.install.finished'))
      setDone(true)
      onStatusChange?.(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      onStatusChange?.(false)
    } finally {
      setRunning(false)
    }
  }, [append, onStatusChange, t])

  // Le legacy enchaîne automatiquement sur cette slide dès la validation de la sélection.
  useEffect(() => {
    if (started.current) return
    started.current = true
    void run()
  }, [run])

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-[var(--font-display)] text-sm font-semibold">{t('setup.install.title')}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{t('setup.install.desc')}</p>

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <pre
          ref={consoleRef}
          className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-muted/40 p-3 font-[var(--font-mono)] text-xs text-muted-foreground"
        >
          {output || t('setup.install.waiting')}
        </pre>

        <div className="flex items-center gap-3">
          {running && (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {t('setup.install.running')}
            </span>
          )}
          {done && (
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-success)]">
              <CheckCircle2 className="size-4" />
              {t('setup.install.finished')}
            </span>
          )}
          {error && (
            <>
              <span className="text-sm text-destructive">{error}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => void run()}>
                {t('setup.install.retry')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
