import { checkSystemConfig, type SystemCheckResult } from '@/lib/setup-api'
import { useI18n } from '@/i18n/i18n-context'
import { CheckStepCard } from './CheckStepCard'
import { CheckRow } from './CheckRow'

export function Step10SystemCheck({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  const { t } = useI18n()
  // Même présentation que le step « Droits fichiers » : coche verte, pas de « OK » répété par ligne.
  // `status` vaut 1 (OK) ou porte le motif d'échec (version requise, valeur trop basse…).
  const rows = (entries: Record<string, unknown>) =>
    Object.entries(entries).map(([name, status]) => (
      <CheckRow
        key={name}
        label={name}
        ok={status === 1}
        okLabel={t('setup.check.ok')}
        failLabel={String(status)}
      />
    ))

  return (
    <CheckStepCard
      title={t('setup.system.title')}
      description={t('setup.system.desc')}
      run={checkSystemConfig}
      onStatusChange={onStatusChange}
      renderDetails={(r: SystemCheckResult) => (
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('setup.system.extensions')}
            </p>
            <ul className="space-y-1 text-sm">{rows(r.extensions)}</ul>
          </div>
          <div>
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('setup.system.variables')}
            </p>
            <ul className="space-y-1 text-sm">{rows(r.variables)}</ul>
          </div>
        </div>
      )}
    />
  )
}
