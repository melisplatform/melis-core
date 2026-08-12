import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'melis-setup-wizard-step'
const PASSED_STORAGE_KEY = 'melis-setup-wizard-passed'

/**
 * Relit les étapes validées mémorisées. Seules celles situées AVANT l'étape courante sont
 * restaurées : l'étape affichée rejoue son propre check au montage, c'est lui qui fait foi
 * (sinon un refresh rouvrirait Suivant sur un check qui n'est pas encore repassé).
 */
function readPassed(stepCount: number, index: number): Record<number, boolean> {
  try {
    const raw = JSON.parse(sessionStorage.getItem(PASSED_STORAGE_KEY) ?? 'null') as unknown
    if (!Array.isArray(raw)) return {}
    const restored: Record<number, boolean> = {}
    for (const step of raw) {
      if (typeof step === 'number' && step >= 0 && step < stepCount && step < index) restored[step] = true
    }
    return restored
  } catch {
    return {}
  }
}

/**
 * Position courante dans le wizard, persistée en sessionStorage — un refresh de page ne
 * fait pas revenir à l'étape 1 (même esprit que le container de session PHP `melisinstaller`
 * côté carousel legacy, mais côté client puisque le wizard React est stateless côté serveur
 * entre deux requêtes JSON).
 *
 * Les étapes déjà validées sont persistées avec la position : sans elles, un refresh
 * repartait avec une barre de progression vierge (pastilles non cochées) alors que le
 * wizard reprend bien à l'étape courante, et le bouton Précédent renvoyait sur des étapes
 * affichées comme non faites.
 */
export function useSetupWizardState(stepCount: number) {
  const [index, setIndex] = useState<number>(() => {
    const saved = Number(sessionStorage.getItem(STORAGE_KEY))
    return Number.isFinite(saved) && saved >= 0 && saved < stepCount ? saved : 0
  })
  // Une étape n'est "déverrouillée" pour avancer que si son check a réussi au moins une fois
  // (mêmes `enableNextButton`/`disableNextButton` côté carousel legacy) — mais rester libre de
  // revenir en arrière pour consulter une étape précédente à tout moment.
  const [passed, setPassed] = useState<Record<number, boolean>>(() => readPassed(stepCount, index))

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

  useEffect(() => {
    const steps = Object.keys(passed).map(Number).filter((step) => passed[step])
    sessionStorage.setItem(PASSED_STORAGE_KEY, JSON.stringify(steps))
  }, [passed])

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
