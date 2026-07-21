import { checkApacheModules, type ApacheCheckResult } from '@/lib/setup-api'
import { useI18n } from '@/i18n/i18n-context'
import { CheckStepCard } from './CheckStepCard'

export function Step11ApacheCheck({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  return (
    <CheckStepCard
      title={t('setup.apache.title')}
      description={t('setup.apache.desc')}
      run={checkApacheModules}
      onStatusChange={onStatusChange}
      renderDetails={(r: ApacheCheckResult) => (
        <ul className="space-y-1 text-sm">
          {Object.entries(r.modules).map(([mod, enabled]) => (
            <li key={mod} className="flex items-center justify-between gap-2">
              <span className="font-[var(--font-mono)]">{mod}</span>
              <span className={enabled ? 'text-[var(--color-success)]' : 'text-destructive'}>
                {enabled ? t('setup.apache.enabled') : t('setup.apache.disabled')}
              </span>
            </li>
          ))}
        </ul>
      )}
    />
  )
}
