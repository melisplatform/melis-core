// Les onglets et sous-onglets ouverts appartiennent à la SESSION UTILISATEUR, pas à l'onglet
// navigateur : sans remise à zéro, l'utilisateur suivant qui se connecte dans le même onglet
// héritait du plan de travail du précédent (ticket 0011049). Vider le sessionStorage ne suffit
// pas — les stores restent montés entre deux connexions — d'où l'événement écouté par
// TabProvider et SubTabProvider, qui réinitialisent leur état en mémoire.
export const TABS_STORAGE_KEY = 'melis-open-tabs'
export const SUBTABS_STORAGE_KEY = 'melis-open-subtabs'

export const WORKSPACE_RESET = 'melis:workspace-reset'

/** Efface les onglets/sous-onglets persistés et réinitialise les stores montés. */
export function clearOpenTabs() {
  try {
    sessionStorage.removeItem(TABS_STORAGE_KEY)
    sessionStorage.removeItem(SUBTABS_STORAGE_KEY)
  } catch { /* storage indisponible */ }
  window.dispatchEvent(new Event(WORKSPACE_RESET))
}
