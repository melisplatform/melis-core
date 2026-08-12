import { checkApacheModules, type ApacheCheckResult } from '@/lib/setup-api'
import { useI18n } from '@/i18n/i18n-context'
import { CheckStepCard } from './CheckStepCard'
import { CheckRow } from './CheckRow'

export function Step11ApacheCheck({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  return (
    <CheckStepCard
      title={t('setup.apache.title')}
      description={t('setup.apache.desc')}
      run={checkApacheModules}
      onStatusChange={onStatusChange}
      renderDetails={(r: ApacheCheckResult) => (
        // Même présentation que les steps system / droits fichiers : coche verte au lieu du
        // « Enabled » répété, et seul l'échec garde un libellé. Une seule colonne : la poignée
        // de modules tient à la verticale, une grille 2 colonnes les casserait en L.
        <ul className="space-y-1 text-sm">
          {Object.entries(r.modules).map(([mod, enabled]) => (
            <CheckRow
              key={mod}
              label={mod}
              ok={Boolean(enabled)}
              okLabel={t('setup.apache.enabled')}
              failLabel={t('setup.apache.disabled')}
            />
          ))}
        </ul>
      )}
    />
  )
}
