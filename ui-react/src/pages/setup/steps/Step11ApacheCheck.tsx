import { checkApacheModules, type ApacheCheckResult } from '@/lib/setup-api'
import { CheckStepCard } from './CheckStepCard'

export function Step11ApacheCheck({ onStatusChange }: { onStatusChange?: (passed: boolean) => void }) {
  return (
    <CheckStepCard
      title="Modules Apache"
      description="mod_headers, mod_alias et mod_deflate doivent être activés."
      run={checkApacheModules}
      onStatusChange={onStatusChange}
      renderDetails={(r: ApacheCheckResult) => (
        <ul className="space-y-1 text-sm">
          {Object.entries(r.modules).map(([mod, enabled]) => (
            <li key={mod} className="flex items-center justify-between gap-2">
              <span className="font-[var(--font-mono)]">{mod}</span>
              <span className={enabled ? 'text-[var(--color-success)]' : 'text-destructive'}>
                {enabled ? 'Activé' : 'Désactivé'}
              </span>
            </li>
          ))}
        </ul>
      )}
    />
  )
}
