import { checkFsRights, type FsRightsCheckResult } from '@/lib/setup-api'
import { useI18n } from '@/i18n/i18n-context'
import { CheckStepCard } from './CheckStepCard'

export function Step13FsRightsCheck({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  return (
    <CheckStepCard
      title={t('setup.fsrights.title')}
      description={t('setup.fsrights.desc')}
      run={checkFsRights}
      onStatusChange={onStatusChange}
      renderDetails={(r: FsRightsCheckResult) => (
        <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
          {Object.entries(r.directories).map(([dir, status]) => (
            <li key={dir} className="flex items-center justify-between gap-2">
              <span className="truncate font-[var(--font-mono)]">{dir}</span>
              <span className={status === 1 ? 'shrink-0 text-[var(--color-success)]' : 'shrink-0 text-destructive'}>
                {status === 1 ? t('setup.fsrights.ok') : t('setup.fsrights.not_writable')}
              </span>
            </li>
          ))}
        </ul>
      )}
    />
  )
}
