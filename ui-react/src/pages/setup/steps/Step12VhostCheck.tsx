import { checkVhost, type VhostCheckResult } from '@/lib/setup-api'
import { useI18n } from '@/i18n/i18n-context'
import { CheckStepCard } from './CheckStepCard'

export function Step12VhostCheck({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  return (
    <CheckStepCard
      title={t('setup.vhost.title')}
      description={t('setup.vhost.desc')}
      run={checkVhost}
      onStatusChange={onStatusChange}
      renderDetails={(r: VhostCheckResult) => (
        <ul className="space-y-1 text-sm">
          <li className="flex items-center justify-between gap-2">
            <span className="font-[var(--font-mono)]">MELIS_PLATFORM</span>
            <span className={r.platform ? 'text-[var(--color-success)]' : 'text-destructive'}>
              {r.platform ?? r.errors.platform ?? t('setup.vhost.undefined')}
            </span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="font-[var(--font-mono)]">MELIS_MODULE</span>
            <span className={r.module ? 'text-[var(--color-success)]' : 'text-destructive'}>
              {r.module ?? r.errors.module ?? t('setup.vhost.undefined')}
            </span>
          </li>
        </ul>
      )}
    />
  )
}
