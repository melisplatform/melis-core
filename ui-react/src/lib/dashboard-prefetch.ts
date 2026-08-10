import * as melisApi from '@/lib/melis-api'

/**
 * Préchargement des données du dashboard AU BOOT de l'app.
 *
 * Le dashboard est lazy-loadé (chunk séparé) et monté après un tick : ses 4 requêtes de données
 * (`bubbles` / `stats` / `legacy-plugins` / `layout`) ne partaient donc qu'APRÈS le téléchargement du
 * chunk — soit bien après le `/menu` de la sidebar. On les lance ici, dès le chargement du module
 * `main.tsx`, EN PARALLÈLE de `/me` et `/menu` (elles relâchent toutes le verrou de session côté PHP,
 * cf. releaseSessionLock). Le composant les CONSOMME ensuite via `take*()` à son montage — le chunk ne
 * gate donc plus que le rendu, pas les données, déjà en vol (voire prêtes).
 *
 * Chaque promesse est prise UNE fois (le dashboard est persistant → il ne fetche qu'au 1ᵉʳ montage) ;
 * un `take*()` sans préchargement (ou après consommation) retombe sur un fetch frais — donc sûr même
 * hors du chemin de boot.
 *
 * ⚠️ Le préchargement part au CHEMIN du dashboard, donc AUSSI quand la session n'est pas (encore)
 * ouverte : arriver sur `/melis-react` en session neuve (fenêtre privée, session expirée) affiche le
 * login, et les 4 requêtes préchargées prennent un 401 → `null`. Deux filets pour que le dashboard
 * ne consomme pas ces promesses mortes après login (symptôme : dashboard vide/partiel jusqu'à un F5) :
 *  1. `resetDashboardPrefetch()` + nouveau préchargement à la connexion (cf. AuthProvider) ;
 *  2. `take*()` retente UNE fois quand la promesse préchargée résout `null` — pour ces 4 endpoints
 *     `null` signifie toujours ÉCHEC (le vide légitime est `[]` / un objet), jamais « aucune donnée ».
 */
let bubblesP: ReturnType<typeof melisApi.fetchDashboardBubbles> | null = null
let statsP: ReturnType<typeof melisApi.fetchDashboardStats> | null = null
let legacyP: ReturnType<typeof melisApi.fetchLegacyDashboardPlugins> | null = null
let layoutP: ReturnType<typeof melisApi.fetchDashboardLayout> | null = null

export function prefetchDashboard(): void {
  bubblesP ??= melisApi.fetchDashboardBubbles()
  statsP   ??= melisApi.fetchDashboardStats()
  legacyP  ??= melisApi.fetchLegacyDashboardPlugins()
  layoutP  ??= melisApi.fetchDashboardLayout()
}

/** Jette les promesses préchargées : le prochain `take*()`/`prefetchDashboard()` repart de zéro.
 *  Appelé à la connexion — ce qui a été préchargé avant le login a été rejeté (401). */
export function resetDashboardPrefetch(): void {
  bubblesP = null
  statsP   = null
  legacyP  = null
  layoutP  = null
}

/** Consomme la promesse préchargée ; si elle résout `null` (= échec, ex. 401 d'avant login), refait
 *  un fetch frais une fois. Le `null` d'un 2ᵉ échec est propagé tel quel (l'appelant décide). */
function take<T>(pending: Promise<T | null> | null, fresh: () => Promise<T | null>): Promise<T | null> {
  return (pending ?? fresh()).then((value) => value ?? fresh())
}

export function takeDashboardBubbles(): ReturnType<typeof melisApi.fetchDashboardBubbles> {
  const p = take(bubblesP, melisApi.fetchDashboardBubbles)
  bubblesP = null
  return p
}
export function takeDashboardStats(): ReturnType<typeof melisApi.fetchDashboardStats> {
  const p = take(statsP, melisApi.fetchDashboardStats)
  statsP = null
  return p
}
export function takeLegacyDashboardPlugins(): ReturnType<typeof melisApi.fetchLegacyDashboardPlugins> {
  const p = take(legacyP, melisApi.fetchLegacyDashboardPlugins)
  legacyP = null
  return p
}
export function takeDashboardLayout(): ReturnType<typeof melisApi.fetchDashboardLayout> {
  const p = take(layoutP, melisApi.fetchDashboardLayout)
  layoutP = null
  return p
}
