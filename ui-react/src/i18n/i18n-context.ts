import { createContext, useContext } from 'react'

import type { I18nKey, Lang } from './dictionaries'
import type { BoLang } from '@/lib/melis-api'

export interface I18nState {
  /** React-UI dictionary lang (derived from the session locale). */
  lang: Lang
  setLang: (lang: Lang) => void
  /** Traduit une clé ; interpole les {tokens} fournis dans `vars`. */
  t: (key: I18nKey, vars?: Record<string, string | number>) => string
  // ── Platform language switching (the whole BO follows) ──
  /** Available back-office languages (from the server). */
  langs: BoLang[]
  /** Current session locale, e.g. "en_EN". */
  currentLocale: string
  /** Current language id (matches a `langs[].id`). */
  currentLangId: number
  /**
   * Switch the WHOLE platform language: persists server-side (session + user record), then
   * reloads so the menu, tools and tool iframes all re-render in the new locale.
   */
  changeLocale: (langId: number) => void
}

export const I18nContext = createContext<I18nState | null>(null)

export function useI18n(): I18nState {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n doit être utilisé dans <I18nProvider>')
  return ctx
}
