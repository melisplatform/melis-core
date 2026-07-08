import { useEffect, useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Carte générique pour un check de diagnostic du wizard (steps 1.0/1/1.1/1.2) : lance `run` au
 * montage, affiche un spinner puis un état pass/fail avec un bouton pour relancer — mêmes
 * données que les steps du carousel legacy (extraites dans SetupWizardService côté backend),
 * juste une présentation React au lieu du HTML/jQuery du carousel.
 */
export function CheckStepCard<T extends { passed: boolean }>({
  title,
  description,
  run,
  renderDetails,
  onStatusChange,
}: {
  title: string
  description: string
  run: () => Promise<T>
  renderDetails: (result: T) => ReactNode
  /** Notifie le wizard parent du résultat (pour déverrouiller le bouton Suivant). */
  onStatusChange?: (passed: boolean) => void
}) {
  const [result, setResult] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function execute() {
    setLoading(true)
    setError(null)
    try {
      const r = await run()
      setResult(r)
      onStatusChange?.(r.passed)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      onStatusChange?.(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { execute() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-[var(--font-display)] text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!loading && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                error || (result && !result.passed)
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
              )}
            >
              {error || (result && !result.passed)
                ? <AlertTriangle className="size-3.5" />
                : <CheckCircle2 className="size-3.5" />}
              {error ? 'Erreur' : result?.passed ? 'OK' : 'Échec'}
            </span>
          )}
          <button
            type="button"
            onClick={execute}
            disabled={loading}
            aria-label="Relancer"
            className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
          </button>
        </div>
      </div>

      {!loading && (
        <div className="mt-4 border-t border-border pt-4">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : result ? (
            renderDetails(result)
          ) : null}
        </div>
      )}
    </div>
  )
}
