import { useEffect, useState } from 'react'
import { fetchMe } from './melis-api'

/**
 * Vérification CENTRALE des droits « capacités » (actions / onglets) pour TOUS les outils —
 * natifs MelisCore ET briques de module. La logique vit ICI, une seule fois : un module n'a
 * qu'à déclarer son `config/react.capabilities.php` (le rights-tree s'affiche tout seul) puis
 * appeler `can()` sur ses boutons/onglets — plus aucune réimplémentation par module.
 *
 * Source des capacités PERMISES de l'utilisateur courant : `GET /melis/react-api/me`
 * (`capabilities`), déjà calculées côté backend par `Capabilities::allowedForUser` (déclaré −
 * deny ; admin ⇒ tout permis). Chargées UNE fois (cache module) et partagées par tous les outils.
 *
 * Exposé aux briques (bundles séparés qui ne peuvent pas importer l'hôte) via
 * `window.__melisUseCaps` dans `main.tsx` — même mécanisme que `__melisIsModuleActive`.
 *
 * Sémantique DEFAULT-ALLOW (identique au backend) :
 *   - outil non géré par les capacités (aucune entrée pour son melisKey) → permis ;
 *   - pendant le chargement → permis (on ne masque rien avant de savoir) ;
 *   - sinon la capacité est permise SSI elle figure dans la liste renvoyée.
 * `cap` est un chemin : action (`export`, `delete`), accès d'onglet (`text`, `variants`) ou
 * action d'onglet (`variants.delete`).
 */
let capsCache: Record<string, string[]> | null = null
let capsPromise: Promise<Record<string, string[]>> | null = null

function loadAllCaps(): Promise<Record<string, string[]>> {
  if (capsCache) return Promise.resolve(capsCache)
  if (!capsPromise) {
    capsPromise = fetchMe()
      .then((me) => { capsCache = me?.capabilities ?? {}; return capsCache })
      .catch(() => { capsCache = {}; return capsCache! })
  }
  return capsPromise
}

export interface CapsApi {
  /** La capacité (action / clé d'onglet / action d'onglet) est-elle permise ? */
  can: (cap: string) => boolean
  /** true une fois /me résolu (avant : `can` renvoie true pour ne rien masquer). */
  loaded: boolean
}

export function useCaps(melisKey: string): CapsApi {
  const [state, setState] = useState<{ loaded: boolean; caps?: string[] }>({ loaded: false })

  useEffect(() => {
    let alive = true
    loadAllCaps().then((all) => { if (alive) setState({ loaded: true, caps: all[melisKey] }) })
    return () => { alive = false }
  }, [melisKey])

  const can = (cap: string): boolean => {
    if (!state.loaded) return true   // pas encore chargé → ne rien masquer
    if (!state.caps) return true     // outil non géré → default-allow
    return state.caps.includes(cap)
  }
  return { can, loaded: state.loaded }
}
