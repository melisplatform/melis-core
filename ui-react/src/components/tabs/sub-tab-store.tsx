import { createContext, useCallback, useContext, useReducer } from 'react'

export interface SubTab { id: string; label: string; path: string }

interface SectionState { tabs: SubTab[] }
interface SubTabState { sections: Record<string, SectionState> }

type Action =
  | { type: 'OPEN';         section: string; tab: SubTab }
  | { type: 'CLOSE';        section: string; id: string }
  | { type: 'UPDATE_LABEL'; section: string; id: string; label: string }

function reducer(state: SubTabState, action: Action): SubTabState {
  const section = state.sections[action.section] ?? { tabs: [] }
  switch (action.type) {
    case 'OPEN': {
      if (section.tabs.some(t => t.id === action.tab.id)) return state
      return { sections: { ...state.sections, [action.section]: { tabs: [...section.tabs, action.tab] } } }
    }
    case 'CLOSE': {
      const tabs = section.tabs.filter(t => t.id !== action.id)
      return { sections: { ...state.sections, [action.section]: { tabs } } }
    }
    case 'UPDATE_LABEL': {
      const tabs = section.tabs.map(t => t.id === action.id ? { ...t, label: action.label } : t)
      return { sections: { ...state.sections, [action.section]: { tabs } } }
    }
  }
}

const SubTabContext = createContext<{ state: SubTabState; dispatch: React.Dispatch<Action> } | null>(null)

export function SubTabProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { sections: {} })
  return <SubTabContext.Provider value={{ state, dispatch }}>{children}</SubTabContext.Provider>
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
