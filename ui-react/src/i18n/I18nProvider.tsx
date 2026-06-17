import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { I18nContext, type I18nState } from './i18n-context'
import {
  DEFAULT_LANG,
  DICTIONARIES,
  LANG_STORAGE_KEY,
  isLang,
  localeToLang,
  type I18nKey,
  type Lang,
} from './dictionaries'
import { fetchLangs, changeLanguage, type BoLang } from '@/lib/melis-api'

const LOCALE_STORAGE_KEY = 'melis-ui-locale'

function readInitialLang(): Lang {
  try {
    // Prefer the cached platform locale (kept in sync on change), else the legacy lang cache.
    const loc = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (loc) return localeToLang(loc)
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (isLang(stored)) return stored
  } catch {
    /* localStorage indisponible */
  }
  return DEFAULT_LANG
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)
  const [langs, setLangs] = useState<BoLang[]>([])
  const [currentLocale, setCurrentLocale] = useState('')
  const [currentLangId, setCurrentLangId] = useState(0)

  // The session locale is authoritative. Fetch it on load, derive the React-UI lang from it,
  // and load the available languages for the switcher.
  useEffect(() => {
    let cancelled = false
    fetchLangs().then((data) => {
      if (cancelled || !data) return
      setLangs(data.langs)
      setCurrentLocale(data.current.locale)
      setCurrentLangId(data.current.id)
      const next = localeToLang(data.current.locale)
      setLangState(next)
      document.documentElement.lang = next
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, data.current.locale)
        localStorage.setItem(LANG_STORAGE_KEY, next)
      } catch { /* best-effort */ }
    })
    return () => { cancelled = true }
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    document.documentElement.lang = next
    try { localStorage.setItem(LANG_STORAGE_KEY, next) } catch { /* best-effort */ }
  }, [])

  // Switch the WHOLE platform: persist server-side, cache the locale for an instant correct
  // first paint, then hard-reload so the menu, tools and tool iframes all follow the new locale.
  const changeLocale = useCallback((langId: number) => {
    const target = langs.find((l) => l.id === langId)
    changeLanguage(langId).then((ok) => {
      if (!ok) return
      try {
        if (target) {
          localStorage.setItem(LOCALE_STORAGE_KEY, target.locale)
          localStorage.setItem(LANG_STORAGE_KEY, localeToLang(target.locale))
        }
      } catch { /* best-effort */ }
      window.location.reload()
    })
  }, [langs])

  const t = useCallback<I18nState['t']>(
    (key: I18nKey, vars) => {
      let str = DICTIONARIES[lang][key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, String(v))
        }
      }
      return str
    },
    [lang],
  )

  const value = useMemo<I18nState>(
    () => ({ lang, setLang, t, langs, currentLocale, currentLangId, changeLocale }),
    [lang, setLang, t, langs, currentLocale, currentLangId, changeLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
