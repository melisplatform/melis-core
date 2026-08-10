import { checkSystemConfig, type SystemCheckResult } from '@/lib/setup-api'
import { useI18n } from '@/i18n/i18n-context'
import { CheckStepCard } from './CheckStepCard'

export function Step10SystemCheck({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  return (
    <CheckStepCard
      title={t('setup.system.title')}
      description={t('setup.system.desc')}
      run={checkSystemConfig}
      onStatusChange={onStatusChange}
      renderDetails={(r: SystemCheckResult) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('setup.system.extensions')}</p>
            <ul className="space-y-1 text-sm">
              {Object.entries(r.extensions).map(([ext, status]) => (
                <li key={ext} className="flex items-center justify-between gap-2">
                  <span className="font-[var(--font-mono)]">{ext}</span>
                  <span className={status === 1 ? 'text-[var(--color-success)]' : 'text-destructive'}>
                    {status === 1 ? t('setup.check.ok') : String(status)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('setup.system.variables')}</p>
            <ul className="space-y-1 text-sm">
              {Object.entries(r.variables).map(([v, status]) => (
                <li key={v} className="flex items-center justify-between gap-2">
                  <span className="font-[var(--font-mono)]">{v}</span>
                  <span className={status === 1 ? 'text-[var(--color-success)]' : 'text-destructive'}>
                    {status === 1 ? t('setup.check.ok') : String(status)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    />
  )
}
