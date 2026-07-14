import { useSyncExternalStore } from 'react'

/**
 * Vue courante d'un outil à toggle « New (React) / Old (iframe) », publiée par sa brique via
 * le global `window.__melisSetToolView`.
 *
 * Pourquoi : la vue « Old » garde son iframe MONTÉE (display:none) après un retour en vue React,
 * et son pont d'onglets (tool-tab-bridge) continue donc de publier les onglets legacy ouverts.
 * La ToolTabBar les affichait alors EN MÊME TEMPS que la barre de sous-onglets de la vue React
 * → deux onglets pour le même enregistrement (cf. Slider). On ne rend les onglets de l'iframe
 * que lorsque la vue « Old » est active ; on ne les EFFACE pas (l'état du pont reste intact), donc
 * repasser en « Old » les réaffiche instantanément, sans redemander un report à l'iframe.
 *
 * Défaut `iframe` : un outil legacy classique (sans toggle) ne publie rien et garde ses onglets.
 */
export type ToolView = 'react' | 'iframe'

const modes: Record<string, ToolView> = {}
const listeners = new Set<() => void>()

declare global {
  interface Window {
    __melisSetToolView?: (melisKey: string, view: ToolView) => void
  }
}

window.__melisSetToolView = (melisKey, view) => {
  if (modes[melisKey] === view) return
  modes[melisKey] = view
  listeners.forEach((l) => l())
}

export function useToolView(melisKey: string | null): ToolView {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb) } },
    () => (melisKey ? modes[melisKey] ?? 'iframe' : 'iframe'),
  )
}
