import { createContext, useContext, useEffect, useReducer, useCallback, type ReactNode } from 'react'
import { LayoutDashboard } from 'lucide-react'

// Tabs persist across a full reload (id/label/path only — icons aren't serialisable) so the
// restored tabs keep their REAL labels instead of a raw key re-derived from the URL.
const TABS_STORAGE_KEY = 'melis-open-tabs'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Tab {
  id: string
  label: string
  path: string
  icon?: React.ElementType
}

interface TabState {
  tabs: Tab[]
  activeId: string
}

type Action =
  | { type: 'OPEN'; tab: Tab }
  | { type: 'CLOSE'; id: string }
  | { type: 'CLOSE_ALL' }
  | { type: 'ACTIVATE'; id: string }
  | { type: 'SYNC'; tab: Tab }
  | { type: 'REORDER'; fromIndex: number; toIndex: number }

// ─── Reducer ─────────────────────────────────────────────────────────────────

const DASHBOARD: Tab = { id: '/', label: 'Dashboard', path: '/', icon: LayoutDashboard }

function tabReducer(state: TabState, action: Action): TabState {
  switch (action.type) {
    case 'OPEN': {
      if (state.tabs.find((t) => t.id === action.tab.id)) {
        return {
          ...state,
          activeId: action.tab.id,
          tabs: state.tabs.map(t => t.id === action.tab.id ? { ...t, ...action.tab } : t),
        }
      }
      return { tabs: [...state.tabs, action.tab], activeId: action.tab.id }
    }

    case 'CLOSE': {
      const idx = state.tabs.findIndex((t) => t.id === action.id)
      if (idx === -1) return state
      const next = state.tabs.filter((t) => t.id !== action.id)
      // Ensure at least the Dashboard tab remains
      const tabs = next.length > 0 ? next : [DASHBOARD]
      const activeId =
        state.activeId !== action.id
          ? state.activeId
          : tabs[Math.max(0, idx - 1)].id
      return { tabs, activeId }
    }

    case 'CLOSE_ALL':
      // Keep only the Dashboard and make it active.
      return { tabs: [DASHBOARD], activeId: '/' }

    case 'ACTIVATE':
      return { ...state, activeId: action.id }

    case 'SYNC': {
      // Keep the active tab aligned with the current route. Creates the tab only if
      // absent (never overwrites an existing tab's label), then activates it.
      const existing = state.tabs.find((t) => t.id === action.tab.id)
      if (existing) return { ...state, activeId: action.tab.id }
      return { tabs: [...state.tabs, action.tab], activeId: action.tab.id }
    }

    case 'REORDER': {
      const tabs = [...state.tabs]
      const [moved] = tabs.splice(action.fromIndex, 1)
      tabs.splice(action.toIndex, 0, moved)
      return { ...state, tabs }
    }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface TabContextValue extends TabState {
  openTab: (tab: Tab) => void
  closeTab: (id: string) => void
  /** Close every tab except the Dashboard, and activate the Dashboard. */
  closeAllTabs: () => void
  activateTab: (id: string) => void
  /** Align the active tab with the current route (create-if-absent, no label overwrite). */
  syncRoute: (tab: Tab) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  activeTab: Tab | undefined
}

const TabContext = createContext<TabContextValue | null>(null)

function loadInitialState(): TabState {
  try {
    const raw = sessionStorage.getItem(TABS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { tabs: { id: string; label: string; path: string }[]; activeId: string }
      // Restore the Dashboard with its icon; other tabs keep their saved label/path (no icon).
      const tabs: Tab[] = (parsed.tabs ?? []).map((t) => (t.id === '/' ? DASHBOARD : { id: t.id, label: t.label, path: t.path }))
      if (!tabs.some((t) => t.id === '/')) tabs.unshift(DASHBOARD)
      const activeId = tabs.some((t) => t.id === parsed.activeId) ? parsed.activeId : '/'
      return { tabs, activeId }
    }
  } catch {
    /* storage unavailable / malformed */
  }
  return { tabs: [DASHBOARD], activeId: '/' }
}

export function TabProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tabReducer, undefined, loadInitialState)

  // Persist open tabs so a full reload restores them WITH their real labels.
  useEffect(() => {
    try {
      sessionStorage.setItem(
        TABS_STORAGE_KEY,
        JSON.stringify({
          tabs: state.tabs.map(({ id, label, path }) => ({ id, label, path })),
          activeId: state.activeId,
        }),
      )
    } catch {
      /* best-effort */
    }
  }, [state])

  const openTab     = useCallback((tab: Tab) => dispatch({ type: 'OPEN',    tab }),             [])
  const closeTab    = useCallback((id: string) => dispatch({ type: 'CLOSE',  id }),              [])
  const closeAllTabs = useCallback(() => dispatch({ type: 'CLOSE_ALL' }),                        [])
  const activateTab = useCallback((id: string) => dispatch({ type: 'ACTIVATE', id }),            [])
  const syncRoute   = useCallback((tab: Tab) => dispatch({ type: 'SYNC',    tab }),             [])
  const reorderTabs = useCallback((f: number, t: number) => dispatch({ type: 'REORDER', fromIndex: f, toIndex: t }), [])

  return (
    <TabContext.Provider
      value={{
        ...state,
        openTab,
        closeTab,
        closeAllTabs,
        activateTab,
        syncRoute,
        reorderTabs,
        activeTab: state.tabs.find((t) => t.id === state.activeId),
      }}
    >
      {children}
    </TabContext.Provider>
  )
}

export function useTabs() {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error('useTabs must be inside <TabProvider>')
  return ctx
}
