import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react'

/**
 * Bridge for legacy tools rendered in an iframe (/melis/react-tool-page). The tool's own tab
 * strip is hidden; the iframe POSTs its open tabs to the host (`__melisToolTabs`), and the host
 * renders them in a sub-tab bar (ToolTabBar) under the topbar, grouped under the tool. Clicking
 * or closing a host sub-tab posts a command back to the iframe window, which runs it through the
 * classic API (`tabSwitch`/`tabClose`) — so each × closes only its own tab.
 */
export interface ToolTab {
  id: string
  label: string
  active: boolean
  primary?: boolean // the tool's own "list" tab (its home pane)
}

interface State { byKey: Record<string, ToolTab[]> }
type Action = { type: 'SET'; melisKey: string; tabs: ToolTab[] }

function reducer(state: State, action: Action): State {
  if (action.type === 'SET') return { byKey: { ...state.byKey, [action.melisKey]: action.tabs } }
  return state
}

interface ToolTabCtx {
  tabsFor: (melisKey: string | null) => ToolTab[]
  activate: (melisKey: string, id: string) => void
  close: (melisKey: string, id: string) => void
}

const Ctx = createContext<ToolTabCtx | null>(null)

export function ToolTabBridgeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { byKey: {} })
  const sources = useRef<Record<string, Window>>({})
  // Per-tool activation history (most-recent first), to land on the last VIEWED tab after a close.
  const historyRef = useRef<Record<string, string[]>>({})

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { __melisToolTabs?: boolean; melisKey?: string; tabs?: ToolTab[] } | null
      if (!d || !d.__melisToolTabs || !d.melisKey) return
      if (e.source) sources.current[d.melisKey] = e.source as Window
      const tabs = Array.isArray(d.tabs) ? d.tabs : []
      const active = tabs.find((t) => t.active)
      if (active) {
        const h = historyRef.current[d.melisKey] ?? []
        historyRef.current[d.melisKey] = [active.id, ...h.filter((id) => id !== active.id)]
      }
      dispatch({ type: 'SET', melisKey: d.melisKey, tabs })
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const value: ToolTabCtx = {
    tabsFor: (k) => (k ? state.byKey[k] ?? [] : []),
    activate: (k, id) =>
      sources.current[k]?.postMessage({ __melisToolTabCmd: true, melisKey: k, cmd: 'activate', id }, '*'),
    close: (k, id) => {
      // Compute where to land AFTER closing: the last viewed tab still open (sub-tab or the
      // primary list), so the closed pane's content is replaced — like the main top tabs.
      const tabs = state.byKey[k] ?? []
      const remaining = tabs.filter((t) => t.id !== id)
      const hist = (historyRef.current[k] ?? []).filter(
        (hid) => hid !== id && remaining.some((t) => t.id === hid),
      )
      const primary = remaining.find((t) => t.primary)
      const next = hist[0] ?? primary?.id ?? remaining[remaining.length - 1]?.id ?? null
      historyRef.current[k] = (historyRef.current[k] ?? []).filter((hid) => hid !== id)
      sources.current[k]?.postMessage({ __melisToolTabCmd: true, melisKey: k, cmd: 'close', id, next }, '*')
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useToolTabs() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToolTabs must be used inside <ToolTabBridgeProvider>')
  return ctx
}
