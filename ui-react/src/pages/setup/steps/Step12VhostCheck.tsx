import { checkVhost, type VhostCheckResult } from '@/lib/setup-api'
import { CheckStepCard } from './CheckStepCard'

export function Step12VhostCheck({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  return (
    <CheckStepCard
      title="Vhost / variables d'environnement"
      description="MELIS_PLATFORM et MELIS_MODULE doivent être définies."
      run={checkVhost}
      onStatusChange={onStatusChange}
      renderDetails={(r: VhostCheckResult) => (
        <ul className="space-y-1 text-sm">
          <li className="flex items-center justify-between gap-2">
            <span className="font-[var(--font-mono)]">MELIS_PLATFORM</span>
            <span className={r.platform ? 'text-[var(--color-success)]' : 'text-destructive'}>
              {r.platform ?? r.errors.platform ?? 'Non définie'}
            </span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="font-[var(--font-mono)]">MELIS_MODULE</span>
            <span className={r.module ? 'text-[var(--color-success)]' : 'text-destructive'}>
              {r.module ?? r.errors.module ?? 'Non définie'}
            </span>
          </li>
        </ul>
      )}
    />
  )
}
