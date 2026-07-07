import { useCallback, useState } from 'react'

const STORAGE_KEY = 'melis-setup-wizard-step'

/**
 * Position courante dans le wizard, persistée en sessionStorage — un refresh de page ne
 * fait pas revenir à l'étape 1 (même esprit que le container de session PHP `melisinstaller`
 * côté carousel legacy, mais côté client puisque le wizard React est stateless côté serveur
 * entre deux requêtes JSON).
 */
export function useSetupWizardState(stepCount: number) {
  const [index, setIndex] = useState<number>(() => {
    const saved = Number(sessionStorage.getItem(STORAGE_KEY))
    return Number.isFinite(saved) && saved >= 0 && saved < stepCount ? saved : 0
  })
  // Une étape n'est "déverrouillée" pour avancer que si son check a réussi au moins une fois
  // (mêmes `enableNextButton`/`disableNextButton` côté carousel legacy) — mais rester libre de
  // revenir en arrière pour consulter une étape précédente à tout moment.
  const [passed, setPassed] = useState<Record<number, boolean>>({})

  const goTo = useCallback((next: number) => {
    if (next < 0 || next >= stepCount) return
    setIndex(next)
    sessionStorage.setItem(STORAGE_KEY, String(next))
  }, [stepCount])

  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const back = useCallback(() => goTo(index - 1), [goTo, index])

  const setStepPassed = useCallback((step: number, ok: boolean) => {
    setPassed((p) => (p[step] === ok ? p : { ...p, [step]: ok }))
  }, [])

  return {
    index,
    goTo,
    next,
    back,
    canGoNext: passed[index] === true,
    isPassed: (step: number) => passed[step] === true,
    setStepPassed,
  }
}
