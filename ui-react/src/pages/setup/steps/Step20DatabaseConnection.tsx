import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { testDatabaseConnection, type DbConnectionInput } from '@/lib/setup-api'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
import { FormErrorBanner, type FormIssue } from '@/shared/melis-form-errors'

const FIELD_LABEL: Record<string, I18nKey> = {
  hostname: 'setup.db.host',
  database: 'setup.db.database',
  username: 'setup.db.username',
  password: 'setup.db.password',
}

/** Step 2.0 — test de connexion MySQL (mêmes champs que `install-db.phtml` legacy). */
export function Step20DatabaseConnection({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  const [form, setForm] = useState<DbConnectionInput>({ hostname: '', database: '', username: '', password: '' })
  const [testing, setTesting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passed, setPassed] = useState(false)

  function set<K extends keyof DbConnectionInput>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleTest() {
    setTesting(true)
    setErrors({})
    setPassed(false)
    try {
      const result = await testDatabaseConnection(form)
      setPassed(result.passed)
      setErrors(result.errors)
      onStatusChange?.(result.passed)
    } catch (e) {
      setErrors({ hostname: e instanceof Error ? e.message : String(e) })
      onStatusChange?.(false)
    } finally {
      setTesting(false)
    }
  }

  // Scannable summary of the failing fields, above the fold. Inline field errors below are kept.
  const bannerIssues: FormIssue[] = Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([field, message]) => ({ label: FIELD_LABEL[field] ? t(FIELD_LABEL[field]) : undefined, message }))

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-[var(--font-display)] text-sm font-semibold">{t('setup.db.title')}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{t('setup.db.desc')}</p>

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        {bannerIssues.length > 0 && <FormErrorBanner title={t('common.check_fields')} issues={bannerIssues} />}
        {(['hostname', 'database', 'username', 'password'] as const).map((field) => (
          <div key={field} className="space-y-1.5">
            <Label htmlFor={`db-${field}`}>{t(FIELD_LABEL[field])}</Label>
            <Input
              id={`db-${field}`}
              type={field === 'password' ? 'password' : 'text'}
              value={form[field]}
              onChange={(e) => set(field, e.target.value)}
            />
            {errors[field] && <p className="text-xs text-destructive">{errors[field]}</p>}
          </div>
        ))}

        <div className="flex items-center gap-3 pt-1">
          <Button type="button" onClick={handleTest} disabled={testing}>
            {testing && <Loader2 className="size-4 animate-spin" />}
            {t('setup.db.test')}
          </Button>
          {passed && (
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-success)]">
              <CheckCircle2 className="size-4" />
              {t('setup.db.success')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
