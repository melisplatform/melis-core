import { useSyncExternalStore } from 'react'
import type { MeUser } from '@/lib/melis-api'

/**
 * Capacités d'outils (droits avancés) côté React — store réactif minimal.
 *
 * Alimenté par `/me` (poussé depuis le Topbar via `setCapabilitiesFromMe`). Un outil natif
 * masque ses composants internes (bouton New, icônes edit/delete, contenu de liste) selon
 * `useCan(melisKey, capacité)`. Lookup O(1). Default-allow : tant que `/me` n'est pas chargé,
 * ou si l'outil ne déclare pas la capacité, ou si l'user est admin → permis (pas de flicker de
 * masquage). Le VRAI mur reste l'API (`denyUnlessCan` côté MelisReactApi).
 */

type CapMap = Record<string, string[]>
interface CapState { isAdmin: boolean; caps: CapMap; loaded: boolean }

let _state: CapState = { isAdmin: false, caps: {}, loaded: false }
const _subs = new Set<() => void>()

function emit() { _subs.forEach((f) => f()) }
function subscribe(cb: () => void) { _subs.add(cb); return () => { _subs.delete(cb) } }
function snapshot() { return _state }

/** Pousse l'état des capacités depuis le payload /me (appelé une fois au boot, dans le Topbar). */
export function setCapabilitiesFromMe(me: MeUser | null) {
  _state = { isAdmin: !!me?.isAdmin, caps: (me?.capabilities ?? {}) as CapMap, loaded: true }
  emit()
}

/** Version non-réactive (hors composant). */
export function canCapability(toolKey: string, cap: string): boolean {
  if (!_state.loaded || _state.isAdmin) return true
  const list = _state.caps[toolKey]
  if (!list) return true              // outil non déclaré → non gardé
  return list.includes(cap)
}

/** Hook réactif : l'outil `toolKey` autorise-t-il la capacité `cap` pour l'user courant ? */
export function useCan(toolKey: string, cap: string): boolean {
  useSyncExternalStore(subscribe, snapshot)
  return canCapability(toolKey, cap)
}

// Exposé en global pour les BRIQUES de module (qui ne peuvent pas importer les modules de l'hôte) :
// une brique appelle `window.MelisCan(toolKey, cap)`. Lecture non-réactive — les caps sont chargées
// au boot (Topbar /me) avant qu'une brique (lazy) ne s'affiche, donc la valeur est prête.
;(window as unknown as { MelisCan?: (toolKey: string, cap: string) => boolean }).MelisCan = canCapability
