import { checkFsRights, type FsRightsCheckResult } from '@/lib/setup-api'
import { CheckStepCard } from './CheckStepCard'

export function Step13FsRightsCheck({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  return (
    <CheckStepCard
      title="Droits fichiers"
      description="Les répertoires config/modules doivent être accessibles en écriture."
      run={checkFsRights}
      onStatusChange={onStatusChange}
      renderDetails={(r: FsRightsCheckResult) => (
        <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
          {Object.entries(r.directories).map(([dir, status]) => (
            <li key={dir} className="flex items-center justify-between gap-2">
              <span className="truncate font-[var(--font-mono)]">{dir}</span>
              <span className={status === 1 ? 'shrink-0 text-[var(--color-success)]' : 'shrink-0 text-destructive'}>
                {status === 1 ? 'OK' : 'Non inscriptible'}
              </span>
            </li>
          ))}
        </ul>
      )}
    />
  )
}
