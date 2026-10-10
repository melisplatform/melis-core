import { useSyncExternalStore } from 'react'

import { EMPTY_SCHEME, fetchReactScheme, type ReactScheme } from './platformscheme-react-api'

/**
 * Petit store externe du thème du BO React (logo d'en-tête, etc.). Chargé une fois après login
 * (loadReactTheme) et appliqué par le shell (Sidebar). L'outil "Platform theme" met à jour le
 * store (setReactTheme) après sauvegarde → application instantanée sans reload.
 */

let _theme: ReactScheme = EMPTY_SCHEME
const subs = new Set<() => void>()
let _loaded = false

function emit() { subs.forEach((f) => f()) }

export function getReactTheme(): ReactScheme { return _theme }

function setColorVar(name: string, color: string): void {
  const root = document.documentElement
  const value = color.trim()
  if (value) root.style.setProperty(name, value)
  else root.style.removeProperty(name)
}

/**
 * Applique les couleurs de la plateforme sur <html> : `light` pour le thème clair, `dark` pour le
 * thème sombre (studio). index.css mappe la couleur active sur --melis-main-color ; une valeur vide
 * restaure le défaut du thème.
 */
export function applyMainColors(light: string, dark: string): void {
  setColorVar('--melis-main-color-light', light)
  setColorVar('--melis-main-color-dark', dark)
}

export function setReactTheme(patch: Partial<ReactScheme>): void {
  _theme = { ..._theme, ...patch }
  if ('mainColor' in patch || 'mainColorDark' in patch) applyMainColors(_theme.mainColor, _theme.mainColorDark)
  emit()
}

export async function loadReactTheme(force = false): Promise<void> {
  if (_loaded && !force) return
  _loaded = true
  try {
    _theme = await fetchReactScheme()
    applyMainColors(_theme.mainColor, _theme.mainColorDark)
    emit()
  } catch { /* non bloquant : on garde les valeurs par défaut */ }
}

function subscribe(cb: () => void) { subs.add(cb); return () => subs.delete(cb) }

export function useReactTheme(): ReactScheme {
  return useSyncExternalStore(subscribe, getReactTheme, getReactTheme)
}
