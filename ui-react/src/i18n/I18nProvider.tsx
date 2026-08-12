import { Fragment, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { I18nContext, type I18nState } from './i18n-context'
import {
  DEFAULT_LANG,
  DICTIONARIES,
  LANG_STORAGE_KEY,
  LANG_LOCALE,
  isLang,
  localeToLang,
  type I18nKey,
  type Lang,
} from './dictionaries'
import { fetchLangs, fetchI18n, changeLanguage, type BoLang, type BoLangs } from '@/lib/melis-api'

const LOCALE_STORAGE_KEY = 'melis-ui-locale'
const LANGS_STORAGE_KEY = 'melis-ui-langs'

/**
 * Cache de la réponse /langs. Le switcher ne se rend que si `langs` est non vide : sans ce cache,
 * un seul fetch raté (401 transitoire, hiccup réseau, contention du verrou de session PHP pendant
 * le boot) fait DISPARAÎTRE le drapeau jusqu'au reload suivant.
 */
function readCachedLangs(): BoLangs | null {
  try {
    const raw = localStorage.getItem(LANGS_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as BoLangs
    return Array.isArray(data?.langs) && data.langs.length > 0 && data.current ? data : null
  } catch {
    return null
  }
}

/** Réessaie : la réponse est stable, un échec est transitoire — mieux vaut attendre que masquer. */
async function fetchLangsWithRetry(attempts = 4): Promise<BoLangs | null> {
  for (let i = 0; i < attempts; i++) {
    const data = await fetchLangs()
    if (data && data.langs.length > 0) return data
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 300 * 2 ** i))
  }
  return null
}

/**
 * L'INSTALLEUR (`/melis-react/setup`) est épinglé en ANGLAIS, indépendamment du défaut du BO.
 * Il tourne pré-install/pré-auth : il n'y a pas encore de locale de session à suivre, et le
 * backend lui-même retombe sur `en_EN` (cf. MelisReactApiController). On décide donc ici, avant
 * le premier rendu, plutôt que depuis la page — sinon `fetchLangs()` (async) peut résoudre APRÈS
 * le montage du wizard et le rebasculer en français.
 * Volontairement NON persisté (ni localStorage, ni session) : le reste du BO garde son défaut.
 */
const SETUP_FORCED_LANG: Lang | null =
  window.location.pathname.replace(/\/+$/, '').endsWith('/setup') ? 'en' : null

function readInitialLang(): Lang {
  if (SETUP_FORCED_LANG) return SETUP_FORCED_LANG
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

/**
 * `<html lang>` est la SOURCE DE VÉRITÉ de la langue pour les BRIQUES de module : chacune fait son
 * `document.documentElement.lang` au rendu (libellés des capacités dans l'éditeur de droits, dates,
 * dictionnaires locaux…). Deux pièges, à l'origine de « les libellés sont en français alors que la
 * session est en anglais » :
 *   1. `index.html` est livré en dur avec `lang="fr"` et l'attribut n'était corrigé qu'APRÈS la
 *      résolution de `/langs` (async, parfois lente : contention du verrou de session PHP). Tout ce
 *      qui se monte pendant cette fenêtre — typiquement un onglet RESTAURÉ au reload, donc l'outil
 *      sur lequel on travaillait — se rendait en français.
 *   2. Les briques ne sont PAS réactives à l'attribut, et le `setState` du provider ne re-rend PAS
 *      `children` (bailout React : même référence d'élément) → le mauvais libellé RESTE affiché.
 * On applique donc la langue mise en cache DÈS LE CHARGEMENT DU MODULE (avant le premier rendu),
 * et on remonte l'arbre si la réponse serveur dément le cache (cf. LANG_REMOUNT_WINDOW_MS).
 */
function applyDocLang(next: Lang): Lang {
  const prev = document.documentElement.lang
  if (prev !== next) document.documentElement.lang = next
  return prev as Lang
}

// Exécuté à l'import (donc avant `createRoot().render()` de main.tsx) : le tout premier rendu voit
// déjà la bonne langue dès lors que le navigateur a ouvert le BO au moins une fois (cache local).
applyDocLang(readInitialLang())

/**
 * Fenêtre (ms depuis le chargement de la page) pendant laquelle un désaccord cache ↔ serveur
 * autorise un REMONTAGE de l'arbre. Au boot c'est indolore (rien n'est encore saisi) ; passé ce
 * délai on se contente de corriger l'attribut, pour ne jamais détruire le travail en cours.
 */
const LANG_REMOUNT_WINDOW_MS = 15_000

export function I18nProvider({ children }: { children: ReactNode }) {
  const cached = readCachedLangs()
  const [lang, setLangState] = useState<Lang>(readInitialLang)
  const [langs, setLangs] = useState<BoLang[]>(cached?.langs ?? [])
  const [currentLocale, setCurrentLocale] = useState(cached?.current.locale ?? '')
  const [currentLangId, setCurrentLangId] = useState(cached?.current.id ?? 0)
  // Traductions serveur (melis-core PHP) : priment sur les valeurs statiques de dictionaries.ts.
  const [serverTr, setServerTr] = useState<Record<string, string>>({})
  // Compteur de remontage : incrémenté seulement si la locale serveur dément celle du boot.
  const [langEpoch, setLangEpoch] = useState(0)

  // Charge les traductions PHP pour la langue active. Route publique → disponible dès le login.
  useEffect(() => {
    let cancelled = false
    fetchI18n(LANG_LOCALE[lang]).then((data) => {
      if (!cancelled) setServerTr(data)
    })
    return () => { cancelled = true }
  }, [lang])

  // The session locale is authoritative. Fetch it on load, derive the React-UI lang from it,
  // and load the available languages for the switcher.
  useEffect(() => {
    let cancelled = false
    fetchLangsWithRetry().then((data) => {
      // Échec après retries : on garde ce qui vient du cache plutôt que de masquer le switcher.
      if (cancelled || !data) return
      setLangs(data.langs)
      setCurrentLocale(data.current.locale)
      setCurrentLangId(data.current.id)
      const next = localeToLang(data.current.locale)
      // Sur l'installeur, la langue est épinglée (cf. SETUP_FORCED_LANG) : on met quand même le
      // cache à jour pour le reste du BO, mais on ne suit pas la locale de session.
      if (!SETUP_FORCED_LANG) {
        setLangState(next)
        // La locale de SESSION fait foi : si elle dément la langue appliquée au boot depuis le cache
        // (ou le `lang="fr"` en dur d'index.html au tout premier chargement), on remonte l'arbre —
        // sinon les briques déjà montées gardent leurs libellés dans l'ancienne langue.
        const prev = applyDocLang(next)
        if (prev !== next && performance.now() < LANG_REMOUNT_WINDOW_MS) setLangEpoch((e) => e + 1)
      }
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, data.current.locale)
        localStorage.setItem(LANG_STORAGE_KEY, next)
        localStorage.setItem(LANGS_STORAGE_KEY, JSON.stringify(data))
      } catch { /* best-effort */ }
    })
    return () => { cancelled = true }
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    applyDocLang(next)
    try { localStorage.setItem(LANG_STORAGE_KEY, next) } catch { /* best-effort */ }
  }, [])

  // Switch the WHOLE platform: persist server-side, cache the locale for an instant correct
  // first paint, then hard-reload so the menu, tools and tool iframes all follow the new locale.
  //
  // ⚠️ Bug intermittent (résolu) : recharger IMMÉDIATEMENT après `changeLanguage` faisait que le
  // `fetchLangs()` de la page rechargée pouvait lire la session serveur ENCORE PÉRIMÉE (race de
  // settling de session, ou réponse capricieuse de change-language) et re-basculer l'UI dans la
  // langue précédente — « le changement ne s'affiche pas, mais revient au reload (manuel) ».
  // On CONFIRME donc que la session serveur reflète bien la nouvelle locale (poll `fetchLangs`,
  // no-store) AVANT de recharger.
  const changeLocale = useCallback((langId: number) => {
    const target = langs.find((l) => l.id === langId)
    const persist = () => {
      try {
        if (target) {
          localStorage.setItem(LOCALE_STORAGE_KEY, target.locale)
          localStorage.setItem(LANG_STORAGE_KEY, localeToLang(target.locale))
          // Garde le cache du switcher aligné, sinon le reload repeint l'ancien drapeau.
          localStorage.setItem(
            LANGS_STORAGE_KEY,
            JSON.stringify({ current: { id: target.id, locale: target.locale }, langs }),
          )
        }
      } catch { /* best-effort */ }
    }
    void (async () => {
      const ok = await changeLanguage(langId)
      // Attend la confirmation serveur (jusqu'à ~1s) : la locale active DOIT être langId.
      let confirmed = false
      for (let i = 0; i < 6 && !confirmed; i++) {
        const d = await fetchLangs()
        if (d && d.current.id === langId) confirmed = true
        else await new Promise((r) => setTimeout(r, 160))
      }
      // Recharge si confirmé (cas nominal) ou, à défaut, si le POST s'est dit OK (fallback).
      if (confirmed || ok) {
        persist()
        window.location.reload()
      }
    })()
  }, [langs])

  // serverTr (valeurs PHP) priment sur le dictionnaire statique (fallback offline/erreur).
  const t = useCallback<I18nState['t']>(
    (key: I18nKey, vars) => {
      let str = serverTr[key] ?? DICTIONARIES[lang][key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, String(v))
        }
      }
      return str
    },
    [lang, serverTr],
  )

  const value = useMemo<I18nState>(
    () => ({ lang, setLang, t, langs, currentLocale, currentLangId, changeLocale }),
    [lang, setLang, t, langs, currentLocale, currentLangId, changeLocale],
  )

  // `key={langEpoch}` : voir applyDocLang — seul moyen générique de faire repartir les briques
  // (non réactives à `<html lang>`) dans la bonne langue sans toucher aux 25+ modules.
  return (
    <I18nContext.Provider value={value}>
      <Fragment key={langEpoch}>{children}</Fragment>
    </I18nContext.Provider>
  )
}
