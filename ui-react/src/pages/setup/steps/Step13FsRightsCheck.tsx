import { checkFsRights, type FsRightsCheckResult } from '@/lib/setup-api'
import { useI18n } from '@/i18n/i18n-context'
import { CheckStepCard } from './CheckStepCard'
import { CheckRow } from './CheckRow'

export function Step13FsRightsCheck({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  return (
    <CheckStepCard
      title={t('setup.fsrights.title')}
      description={t('setup.fsrights.desc')}
      run={checkFsRights}
      onStatusChange={onStatusChange}
      renderDetails={(r: FsRightsCheckResult) => (
        // Grille 2 colonnes : la liste (≈12 répertoires) tient sans scroll dans une fenêtre normale.
        <ul className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {Object.entries(r.directories).map(([dir, status]) => (
            <CheckRow
              key={dir}
              label={dir}
              ok={status === 1}
              okLabel={t('setup.fsrights.ok')}
              failLabel={t('setup.fsrights.not_writable')}
            />
          ))}
        </ul>
      )}
    />
  )
}
