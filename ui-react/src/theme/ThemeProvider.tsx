import { useCallback, useState, type ReactNode } from 'react'

import { ThemeContext } from './theme-context'
import { DEFAULT_THEME, THEME_STORAGE_KEY, isThemeId, type ThemeId } from './themes'

/** Lit le thème initial : attribut posé par le script anti-FOUC (index.html),
 *  sinon localStorage, sinon défaut. */
function readInitialTheme(): ThemeId {
  if (typeof document !== 'undefined') {
    const fromDom = document.documentElement.dataset.theme
    if (isThemeId(fromDom)) return fromDom
  }
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (isThemeId(stored)) return stored
  } catch {
    /* localStorage indisponible */
  }
  return DEFAULT_THEME
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readInitialTheme)

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* best-effort */
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  )
}
