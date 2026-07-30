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

export function takeDashboardBubbles(): ReturnType<typeof melisApi.fetchDashboardBubbles> {
  const p = bubblesP ?? melisApi.fetchDashboardBubbles()
  bubblesP = null
  return p
}
export function takeDashboardStats(): ReturnType<typeof melisApi.fetchDashboardStats> {
  const p = statsP ?? melisApi.fetchDashboardStats()
  statsP = null
  return p
}
export function takeLegacyDashboardPlugins(): ReturnType<typeof melisApi.fetchLegacyDashboardPlugins> {
  const p = legacyP ?? melisApi.fetchLegacyDashboardPlugins()
  legacyP = null
  return p
}
export function takeDashboardLayout(): ReturnType<typeof melisApi.fetchDashboardLayout> {
  const p = layoutP ?? melisApi.fetchDashboardLayout()
  layoutP = null
  return p
}
