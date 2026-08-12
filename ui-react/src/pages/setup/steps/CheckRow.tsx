import { CheckCircle2, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Ligne de résultat d'un check du wizard : coche verte + libellé mono quand c'est bon, croix
 * rouge + motif d'échec sinon. Partagée par les steps de diagnostic (system, droits fichiers…)
 * pour qu'ils se ressemblent — le « OK » textuel de chaque ligne n'apportait rien face à la
 * coche, alors que l'échec, lui, doit rester lisible et légendé.
 */
export function CheckRow({
  label,
  ok,
  okLabel,
  failLabel,
}: {
  label: string
  ok: boolean
  /** Rendu en sr-only : les icônes sont décoratives, l'état doit rester audible au lecteur d'écran. */
  okLabel?: string
  failLabel?: string
}) {
  return (
    <li
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5',
        !ok && 'bg-destructive/5',
      )}
    >
      {ok ? (
        <CheckCircle2 className="size-4 shrink-0 text-[var(--color-success)]" aria-hidden />
      ) : (
        <XCircle className="size-4 shrink-0 text-destructive" aria-hidden />
      )}
      <span
        title={label}
        className={cn('truncate font-[var(--font-mono)] text-xs', !ok && 'text-destructive')}
      >
        {label}
      </span>
      {ok
        ? okLabel && <span className="sr-only">{okLabel}</span>
        : failLabel && (
            <span className="ml-auto shrink-0 text-xs font-medium text-destructive">{failLabel}</span>
          )}
    </li>
  )
}
