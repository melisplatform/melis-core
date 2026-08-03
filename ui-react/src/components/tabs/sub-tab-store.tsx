import { createContext, useCallback, useContext, useEffect, useReducer } from 'react'

export interface SubTab { id: string; label: string; path: string }

interface SectionState { tabs: SubTab[] }
interface SubTabState { sections: Record<string, SectionState> }

// Les sous-onglets ouverts survivent à un reload complet (comme les onglets du shell) : ils ne sont
// perdus que si l'utilisateur les ferme. SubTab = { id, label, path } → entièrement sérialisable.
const SUBTABS_STORAGE_KEY = 'melis-open-subtabs'

function loadInitialState(): SubTabState {
  try {
    const raw = sessionStorage.getItem(SUBTABS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as SubTabState
      if (parsed && typeof parsed === 'object' && parsed.sections && typeof parsed.sections === 'object') {
        return { sections: parsed.sections }
      }
    }
  } catch { /* storage indisponible / corrompu */ }
  return { sections: {} }
}

type Action =
  | { type: 'OPEN';         section: string; tab: SubTab }
  | { type: 'CLOSE';        section: string; id: string }
  | { type: 'CLOSE_ALL';    section: string }
  | { type: 'UPDATE_LABEL'; section: string; id: string; label: string }

function reducer(state: SubTabState, action: Action): SubTabState {
  const section = state.sections[action.section] ?? { tabs: [] }
  switch (action.type) {
    case 'OPEN': {
      if (section.tabs.some(t => t.id === action.tab.id)) return state
      return { sections: { ...state.sections, [action.section]: { tabs: [...section.tabs, action.tab] } } }
    }
    case 'CLOSE': {
      // Les sous-onglets peuvent être IMBRIQUÉS (un outil à 3 niveaux : /[section]/[tool]/:id/:subId —
      // ex. Slider ▸ un slider ▸ une slide). Fermer un parent ferme donc ses descendants, repérés par
      // le préfixe de chemin : sans ça, la slide resterait seule dans la barre, orpheline d'un slider
      // fermé. No-op pour les outils à 2 niveaux (aucun chemin n'est préfixe d'un autre).
      const closed = section.tabs.find(t => t.id === action.id)
      const prefix = closed ? closed.path + '/' : null
      const tabs = section.tabs.filter(t => t.id !== action.id && !(prefix && t.path.startsWith(prefix)))
      return { sections: { ...state.sections, [action.section]: { tabs } } }
    }
    case 'CLOSE_ALL': {
      if (section.tabs.length === 0) return state
      return { sections: { ...state.sections, [action.section]: { tabs: [] } } }
    }
    case 'UPDATE_LABEL': {
      const tabs = section.tabs.map(t => t.id === action.id ? { ...t, label: action.label } : t)
      return { sections: { ...state.sections, [action.section]: { tabs } } }
    }
  }
}

const SubTabContext = createContext<{ state: SubTabState; dispatch: React.Dispatch<Action> } | null>(null)

/** Événement diffusé à chaque changement de la liste des sous-onglets ouverts. */
export const SUBTABS_CHANGED = 'melis:subtabs-changed'

interface SubTabWindow extends Window {
  /** Sous-onglets ouverts, par section (route racine de l'outil). Lecture seule pour les briques. */
  __melisSubTabs?: Record<string, SectionState>
}

export function SubTabProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState)

  // Publie la liste des sous-onglets ouverts (les globals __melisOpenSubTab/__melisCloseSubTab sont
  // write-only : une brique ne pouvait pas voir une fermeture déclenchée par la croix de SubTabBar).
  // Une brique `persistent` monte un formulaire par enregistrement ouvert et a besoin de cette liste.
  // On persiste aussi l'état en sessionStorage → les sous-onglets sont restaurés au reload.
  useEffect(() => {
    ;(window as SubTabWindow).__melisSubTabs = state.sections
    window.dispatchEvent(new CustomEvent(SUBTABS_CHANGED))
    try { sessionStorage.setItem(SUBTABS_STORAGE_KEY, JSON.stringify(state)) } catch { /* best-effort */ }
  }, [state])

  // L'onglet principal d'un outil est fermé → ses sous-onglets d'enregistrement n'ont plus lieu
  // d'être (sinon la brique, remontée à neuf à la réouverture, ressusciterait des formulaires).
  useEffect(() => {
    const onClosed = (e: Event) => {
      const path = (e as CustomEvent<{ path?: string }>).detail?.path
      if (path) dispatch({ type: 'CLOSE_ALL', section: path })
    }
    window.addEventListener('melis:tab-closed', onClosed)
    return () => window.removeEventListener('melis:tab-closed', onClosed)
  }, [])

  return <SubTabContext.Provider value={{ state, dispatch }}>{children}</SubTabContext.Provider>
}

/**
 * Exposes the sub-tab store imperatively on `window` so module React bricks (separate bundles that
 * cannot import this context) can drive the SAME native sub-tab bar as core tools — the "User
 * Management" look — instead of re-implementing it. The `section` is the brick's tree route
 * (/[section]/[tool]); SubTabBar reads the open records for that section. A brick opts in via its
 * manifest `subTabs: true` (see lib/bricks.ts). Mounted once inside SubTabProvider (Shell).
 */
export function SubTabWindowBridge() {
  const ctx = useContext(SubTabContext)
  useEffect(() => {
    if (!ctx) return
    const w = window as unknown as {
      __melisOpenSubTab?: (section: string, tab: SubTab) => void
      __melisCloseSubTab?: (section: string, id: string) => void
      __melisUpdateSubTabLabel?: (section: string, id: string, label: string) => void
    }
    w.__melisOpenSubTab = (section, tab) => ctx.dispatch({ type: 'OPEN', section, tab })
    w.__melisCloseSubTab = (section, id) => ctx.dispatch({ type: 'CLOSE', section, id })
    w.__melisUpdateSubTabLabel = (section, id, label) => ctx.dispatch({ type: 'UPDATE_LABEL', section, id, label })
  }, [ctx])
  return null
}

export function useSubTabs(section: string) {
  const ctx = useContext(SubTabContext)
  if (!ctx) throw new Error('useSubTabs must be used inside SubTabProvider')
  const { state, dispatch } = ctx
  const tabs = state.sections[section]?.tabs ?? []

  const openTab    = useCallback((tab: SubTab)           => dispatch({ type: 'OPEN',         section, tab }),       [dispatch, section])
  const closeTab   = useCallback((id: string)            => dispatch({ type: 'CLOSE',        section, id }),        [dispatch, section])
  const updateLabel= useCallback((id: string, label: string) => dispatch({ type: 'UPDATE_LABEL', section, id, label }), [dispatch, section])

  return { tabs, openTab, closeTab, updateLabel }
}
