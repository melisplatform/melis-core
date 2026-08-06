import { useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createEnvironment, type EnvironmentInput } from '@/lib/setup-api'
import { useI18n } from '@/i18n/i18n-context'
import { FormErrorBanner } from '@/shared/melis-form-errors'

/** Step 1.3 — environnement courant + sites/domaines déclarés (mêmes champs que le carousel
 *  legacy `step-1.3.phtml`, mais lignes ajoutées/retirées en state React au lieu du DOM jQuery). */
export function Step14Environment({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  const [domain, setDomain] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [errorReporting, setErrorReporting] = useState(true)
  const [environments, setEnvironments] = useState<EnvironmentInput[]>([
    { name: '', domain: '', sendEmail: false, errorReporting: 0 },
  ])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateEnv(i: number, patch: Partial<EnvironmentInput>) {
    setEnvironments((envs) => envs.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  }

  function addRow() {
    setEnvironments((envs) => [...envs, { name: '', domain: '', sendEmail: false, errorReporting: 0 }])
  }

  function removeRow(i: number) {
    setEnvironments((envs) => envs.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await createEnvironment(
        { domain, sendEmail, errorReporting: errorReporting ? 1 : 0 },
        environments.filter((e) => e.name && e.domain),
      )
      setSaved(true)
      onStatusChange?.(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      onStatusChange?.(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-[var(--font-display)] text-sm font-semibold">{t('setup.env.title')}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {t('setup.env.desc')}
      </p>

      <div className="mt-4 space-y-4 border-t border-border pt-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="platform-domain">{t('setup.env.platform_domain')}</Label>
            <Input id="platform-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="dev.local" />
          </div>
          <div className="flex items-center gap-4 pt-6">
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

        <div className="flex items-center gap-3">
          <Button type="button" onClick={handleSave} disabled={saving || !domain}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t('setup.env.save')}
          </Button>
          {saved && <span className="text-sm text-[var(--color-success)]">{t('setup.env.saved')}</span>}
        </div>
      </div>
    </div>
  )
}
