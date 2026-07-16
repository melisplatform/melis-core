import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * Remplaçant robuste de `React.lazy` pour le code-splitting.
 *
 * Problème résolu : `lazy(() => import('@/pages/Xxx'))` charge un chunk **hashé**
 * (`Xxx-vEDqQ2Zd.js`). Cet import échoue par intermittence — « error loading
 * dynamically imported module » — dans deux cas, et l'`ToolErrorBoundary` affiche
 * alors « L'outil … a rencontré une erreur » :
 *
 *   1. **index.html périmé après un déploiement.** Un onglet ouvert AVANT un déploiement
 *      garde en mémoire les anciens hashs ; le nouveau build remplace les assets par de
 *      nouveaux hashs → l'ancien chunk n'existe plus (404) → l'import rejette. Un simple
 *      re-render (« Réessayer ») retente le MÊME chunk mort et échoue encore ; seul un
 *      reload complet recharge un index.html frais avec les bons hashs.
 *   2. **Aléa réseau** — un hoquet ponctuel sur la requête du chunk.
 *
 * Stratégie :
 *   - on **réessaie** l'import quelques fois avec un petit délai (couvre le réseau) ;
 *   - si ça échoue toujours, on **force UN reload complet** de la page (couvre le cas 1),
 *     protégé par un flag `sessionStorage` par-chunk pour ne JAMAIS boucler : si le reload
 *     ne corrige pas (vrai bug de build), on laisse l'erreur remonter à l'ErrorBoundary.
 */
export function lazyRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  chunkId: string,
): LazyExoticComponent<T> {
  return lazy(() => retryImport(factory, chunkId))
}

async function retryImport<T>(
  factory: () => Promise<{ default: T }>,
  chunkId: string,
  attempts = 3,
  delayMs = 350,
): Promise<{ default: T }> {
  const reloadKey = `lazy-retry-reload:${chunkId}`
  try {
    const mod = await factory()
    // Import réussi → on lève le flag de reload pour ce chunk (prochain échec = nouveau cycle).
    sessionStorage.removeItem(reloadKey)
    return mod
  } catch (err) {
    // Encore des tentatives « en douceur » (réseau) ?
    for (let i = 1; i < attempts; i++) {
      await sleep(delayMs * i)
      try {
        const mod = await factory()
        sessionStorage.removeItem(reloadKey)
        return mod
      } catch {
        /* on continue */
      }
    }
    // Échec persistant : probablement un index.html périmé (nouveaux hashs déployés).
    // Un reload complet récupère l'index.html frais. UNE seule fois par chunk pour éviter
    // toute boucle de rechargement si le problème est réel (chunk vraiment absent/cassé).
    if (!sessionStorage.getItem(reloadKey)) {
      sessionStorage.setItem(reloadKey, '1')
      window.location.reload()
      // On rend une promesse qui ne se résout jamais : la page se recharge de toute façon.
      return new Promise<never>(() => {})
    }
    // Déjà rechargé une fois sans succès → on laisse l'ErrorBoundary faire son travail.
    throw err
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
