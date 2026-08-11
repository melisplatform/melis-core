import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createEnvironment, getDefaultEnvironment, type EnvironmentInput } from '@/lib/setup-api'
import { useI18n } from '@/i18n/i18n-context'
import { FormErrorBanner } from '@/shared/melis-form-errors'
import type { RegisterBeforeNext } from '../wizard-steps'

/** Step 1.3 — environnement courant + sites/domaines déclarés (mêmes champs que le carousel
 *  legacy `step-1.3.phtml`, mais lignes ajoutées/retirées en state React au lieu du DOM jQuery).
 *  Pas de bouton Enregistrer : l'enregistrement part au clic sur Suivant, comme le legacy où
 *  `addEnvironments()` est déclenché par le bouton Next du carousel. */
export function Step14Environment({ onStatusChange, registerBeforeNext }: {
  onStatusChange?: (passed: boolean) => void
  registerBeforeNext?: RegisterBeforeNext
}) {
  const { t } = useI18n()
  const [envName, setEnvName] = useState('')
  const [domain, setDomain] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [errorReporting, setErrorReporting] = useState(true)
  const [environments, setEnvironments] = useState<EnvironmentInput[]>([
    { name: '', domain: '', sendEmail: false, errorReporting: 0 },
  ])
  const [error, setError] = useState<string | null>(null)

  // Nom + domaine de l'environnement par défaut : imposés par le serveur (MELIS_PLATFORM /
  // SERVER_NAME) et affichés en lecture seule, comme le bloc "Default environment" du legacy.
  useEffect(() => {
    let cancelled = false
    getDefaultEnvironment()
      .then((env) => {
        if (cancelled) return
        setEnvName(env.name ?? '')
        setDomain(env.domain ?? '')
        setSendEmail(env.sendEmail)
        setErrorReporting(env.errorReporting)
        // Rien à valider ici (étape de saisie, pas de check serveur) : dès que le domaine
        // imposé par le serveur est connu, Suivant est ouvert — c'est lui qui enregistrera.
        if (env.domain) onStatusChange?.(true)
      })
      .catch((e) => { setError(e instanceof Error ? e.message : String(e)) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chargement unique au montage
  }, [])

  function updateEnv(i: number, patch: Partial<EnvironmentInput>) {
    setEnvironments((envs) => envs.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  }

  function addRow() {
    setEnvironments((envs) => [...envs, { name: '', domain: '', sendEmail: false, errorReporting: 0 }])
  }

  function removeRow(i: number) {
    setEnvironments((envs) => envs.filter((_, idx) => idx !== i))
  }

  const save = useCallback(async (): Promise<boolean> => {
    setError(null)
    try {
      await createEnvironment(
        { domain, sendEmail, errorReporting: errorReporting ? 1 : 0 },
        environments.filter((e) => e.name && e.domain),
      )
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      return false
    }
  }, [domain, sendEmail, errorReporting, environments])

  useEffect(() => {
    registerBeforeNext?.(save)
    return () => registerBeforeNext?.(null)
  }, [registerBeforeNext, save])

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-[var(--font-display)] text-sm font-semibold">{t('setup.env.title')}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {t('setup.env.desc')}
      </p>

      <div className="mt-4 space-y-4 border-t border-border pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('setup.env.default_env')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="platform-env-name">{t('setup.env.default_env_name')}</Label>
            <Input id="platform-env-name" value={envName} disabled readOnly />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="platform-domain">{t('setup.env.platform_domain')}</Label>
            <Input id="platform-domain" value={domain} disabled readOnly />
          </div>
          <div className="flex items-center gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={sendEmail} onCheckedChange={(v) => setSendEmail(v === true)} />
              {t('setup.env.send_email')}
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={errorReporting} onCheckedChange={(v) => setErrorReporting(v === true)} />
              {t('setup.env.error_reporting')}
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('setup.env.sites')}</p>
          {environments.map((env, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor={`env-name-${i}`}>{t('setup.env.name')}</Label>
                <Input id={`env-name-${i}`} value={env.name} onChange={(e) => updateEnv(i, { name: e.target.value })} placeholder="local" />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor={`env-domain-${i}`}>{t('setup.env.domain')}</Label>
                <Input id={`env-domain-${i}`} value={env.domain} onChange={(e) => updateEnv(i, { domain: e.target.value })} placeholder="dev.local" />
              </div>
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label={t('setup.env.remove')}
                className="mb-0.5 grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5">
            <Plus className="size-3.5" />
            {t('setup.env.add_site')}
          </Button>
        </div>

        {error && <FormErrorBanner title={t('common.check_fields')} issues={[{ message: error }]} />}
      </div>
    </div>
  )
}
