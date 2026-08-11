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
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 py-4">
            {/* Barre de progression */}
            <ol className="flex items-center gap-1">
              {SETUP_STEPS.map((step, i) => {
                // Une étape n'est atteignable que si elle est déjà derrière nous (ou que la
                // précédente est validée) : le curseur doit le dire avant le clic. Après
                // l'installation, seules les étapes AVANT restent hors d'atteinte.
                const reachable =
                  (i <= wizard.index || wizard.isPassed(i - 1)) && !(backLocked && i < wizard.index)
                return (
                <li key={step.id} className="flex flex-1 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { if (reachable) void (i > wizard.index ? goForward(i) : wizard.goTo(i)) }}
                    aria-disabled={!reachable}
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors',
                      reachable ? 'cursor-pointer' : 'cursor-not-allowed',
                      i === wizard.index
                        ? 'bg-primary text-primary-foreground'
                        : wizard.isPassed(i)
                          ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                          : 'bg-muted text-muted-foreground',
                    )}
                    title={backLocked && i < wizard.index ? `${t(step.labelKey)} — ${t('setup.locked')}` : t(step.labelKey)}
                  >
                    {wizard.isPassed(i) && i !== wizard.index ? <Check className="size-3.5" /> : i + 1}
                  </button>
                  {i < SETUP_STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
                </li>
                )
              })}
            </ol>
            <p className="-mt-3 text-xs font-medium text-muted-foreground">{t(currentStep.labelKey)}</p>

            {currentStep.render((passed) => wizard.setStepPassed(wizard.index, passed), registerBeforeNext)}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {backLocked ? (
                // Verrou explicite plutôt qu'un bouton grisé sans explication.
                <p className="max-w-md text-xs text-muted-foreground">{t('setup.locked')}</p>
              ) : (
                <Button type="button" variant="outline" onClick={wizard.back} disabled={wizard.index === 0 || advancing}>
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
