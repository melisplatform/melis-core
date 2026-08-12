import { useCallback, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { ViewModeToggle } from '@/components/MelisClassicView'
import { cn } from '@/lib/utils'
import wordmark from '@/assets/melis-wordmark.svg'
import wordmarkWhite from '@/assets/melis-wordmark-white.svg'
import { useTheme } from '@/theme/theme-context'
import { useI18n } from '@/i18n/i18n-context'
import { useSetupWizardState } from './hooks/useSetupWizardState'
import { SETUP_STEPS } from './wizard-steps'

/**
 * Wizard d'installation React — coexiste avec le carousel legacy (`/melis/setup`) via le
 * toggle New/Old, pas de remplacement direct (cf. plan de migration). Layout minimal
 * propre à cette page (pas de Shell authentifié — cette page tourne pré-auth/pré-DB),
 * sur le modèle de LoginPage.tsx.
 *
 * Une seule étape visible à la fois (barre de progression + Suivant/Précédent), au lieu
 * d'empiler tous les checks — Suivant reste désactivé tant que l'étape courante n'a pas
 * réussi, même esprit que enableNextButton/disableNextButton du carousel legacy.
 *
 * Le côté « Old » du toggle redirige en navigation complète vers /melis/setup (au lieu d'un
 * iframe) — les deux wizards ont des state machines totalement indépendantes (session PHP
 * legacy vs sessionStorage React), un iframe juxtaposé aurait juste été trompeur.
 */
export default function SetupWizardPage() {
  const { theme } = useTheme()
  const { t } = useI18n()
  const dark = theme === 'studio'
  const wizard = useSetupWizardState(SETUP_STEPS.length)
  const currentStep = SETUP_STEPS[wizard.index]
  const isLast = wizard.index === SETUP_STEPS.length - 1

  // Passé le point de non-retour (l'installation), on ne redescend plus : les modules sont
  // déployés et les tables créées, rejouer une étape amont casserait l'installation.
  // Le verrou tient au refresh — l'index courant est en sessionStorage (useSetupWizardState).
  const noReturnIndex = SETUP_STEPS.findIndex((s) => s.pointOfNoReturn)
  const backLocked = noReturnIndex !== -1 && wizard.index >= noReturnIndex

  // Les étapes de saisie (environnement, …) n'ont pas de bouton Enregistrer : elles
  // enregistrent au moment où l'on avance, comme le carousel legacy où Next déclenche
  // l'appel Ajax de l'étape. Une action qui échoue laisse l'utilisateur sur place.
  const [beforeNext, setBeforeNext] = useState<(() => Promise<boolean>) | null>(null)
  const [advancing, setAdvancing] = useState(false)
  const registerBeforeNext = useCallback((action: (() => Promise<boolean>) | null) => {
    setBeforeNext(() => action)
  }, [])

  async function goForward(to: number) {
    if (beforeNext) {
      setAdvancing(true)
      try {
        if (!(await beforeNext())) return
      } finally {
        setAdvancing(false)
      }
    }
    wizard.goTo(to)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <img src={dark ? wordmarkWhite : wordmark} alt="Melis Platform" className="h-6 w-auto" />
        <div className="flex items-center gap-3">
          <ViewModeToggle mode="react" onChange={(next) => { if (next === 'iframe') window.location.href = '/melis/setup' }} />
          <ThemeSwitcher />
        </div>
      </header>

      <main className="flex flex-1 flex-col p-6">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 py-4">
            {/* Barre de progression — pastille au-dessus, libellé dessous, et le trait de
                liaison coloré jusqu'à l'étape courante pour matérialiser l'avancement. */}
            <ol className="flex items-start">
              {SETUP_STEPS.map((step, i) => {
                // Une étape n'est atteignable que si elle est déjà derrière nous (ou que la
                // précédente est validée) : le curseur doit le dire avant le clic. Après
                // l'installation, seules les étapes AVANT restent hors d'atteinte.
                const reachable =
                  (i <= wizard.index || wizard.isPassed(i - 1)) && !(backLocked && i < wizard.index)
                const done = (n: number) => n < wizard.index || wizard.isPassed(n)
                const connector = (filled: boolean, hidden: boolean) => (
                  <div
                    className={cn(
                      'h-px flex-1',
                      hidden ? 'bg-transparent' : filled ? 'bg-[var(--color-success)]/40' : 'bg-border',
                    )}
                  />
                )
                return (
                <li key={step.id} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full items-center">
                    {connector(done(i - 1), i === 0)}
                    <button
                      type="button"
                      onClick={() => { if (reachable) void (i > wizard.index ? goForward(i) : wizard.goTo(i)) }}
                      aria-disabled={!reachable}
                      aria-current={i === wizard.index ? 'step' : undefined}
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                        reachable ? 'cursor-pointer' : 'cursor-not-allowed',
                        i === wizard.index
                          ? 'border-transparent bg-[var(--color-success)]/35'
                          : wizard.isPassed(i)
                            ? 'border-transparent bg-[var(--color-success)]/15 text-[var(--color-success)]'
                            : 'border-border bg-card',
                      )}
                      title={backLocked && i < wizard.index ? `${t(step.labelKey)} — ${t('setup.locked')}` : t(step.labelKey)}
                    >
                      {wizard.isPassed(i) && i !== wizard.index && <Check className="size-3.5" />}
                      <span className="sr-only">{t(step.labelKey)}</span>
                    </button>
                    {connector(done(i), i === SETUP_STEPS.length - 1)}
                  </div>
                  <span
                    className={cn(
                      'max-w-full truncate px-1 text-[11px] leading-tight',
                      i === wizard.index ? 'font-semibold text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {t(step.labelKey)}
                  </span>
                </li>
                )
              })}
            </ol>

            {currentStep.render((passed) => wizard.setStepPassed(wizard.index, passed), registerBeforeNext)}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {backLocked ? (
                // Verrou explicite plutôt qu'un bouton grisé sans explication.
                <p className="max-w-md text-xs text-muted-foreground">{t('setup.locked')}</p>
              ) : wizard.index === 0 ? (
                // Première étape : rien derrière, on masque le bouton (le span garde Next à droite).
                <span />
              ) : (
                <Button type="button" variant="outline" onClick={wizard.back} disabled={advancing}>
                  <ArrowLeft className="size-4" />
                  {t('setup.prev')}
                </Button>
              )}
              {!isLast && (
                <Button type="button" onClick={() => void goForward(wizard.index + 1)} disabled={!wizard.canGoNext || advancing}>
                  {advancing && <Loader2 className="size-4 animate-spin" />}
                  {t('setup.next')}
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
        </div>
      </main>
    </div>
  )
}
