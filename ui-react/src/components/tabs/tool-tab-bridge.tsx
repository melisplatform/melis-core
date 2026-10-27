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
  /** Deep link /[section]/[tool]/<id>: open that record in the tool's iframe once it is ready. */
  requestOpen: (melisKey: string, id: string) => void
  /** A record open is pending for this tool (the URL must keep its /<id> meanwhile). */
  isOpening: (melisKey: string | null) => boolean
}

/** Record id of a legacy tab data-id "<id>_id_<targetMelisKey>". */
const recordIdOf = (tabId: string) => tabId.split('_id_')[0]

const Ctx = createContext<ToolTabCtx | null>(null)

export function ToolTabBridgeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { byKey: {} })
  const sources = useRef<Record<string, Window>>({})
  // Per-tool activation history (most-recent first), to land on the last VIEWED tab after a close.
  const historyRef = useRef<Record<string, string[]>>({})
  // Deep link /[section]/[tool]/<id>: the record to open per tool, until its tab shows up — it only
  // opened the list and the /<id> was dropped from the URL (Mantis #0011237).
  const pendingRef = useRef<Record<string, { id: string; sent: boolean; until: number }>>({})

  /** Sends the pending open of this tool to its iframe (activates the record tab if already open). */
  const flushOpen = (k: string, tabs: ToolTab[] | null) => {
    const p = pendingRef.current[k]
    if (!p) return
    if (Date.now() > p.until) { delete pendingRef.current[k]; return }
    const open = tabs?.find((t) => !t.primary && recordIdOf(t.id) === p.id)
    if (open) {
      if (!open.active) sources.current[k]?.postMessage({ __melisToolTabCmd: true, melisKey: k, cmd: 'activate', id: open.id }, '*')
      delete pendingRef.current[k]
      return
    }
    if (!p.sent && sources.current[k] && tabs) {
      p.sent = true
      sources.current[k].postMessage({ __melisToolTabCmd: true, melisKey: k, cmd: 'open', id: p.id }, '*')
    }
  }

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      // SECURITY (audit M9) : seules les iframes same-origin (pool d'outils legacy) parlent à
      // ce pont — e.source est mémorisé comme destinataire de commandes, jamais cross-origin.
      if (e.origin !== window.location.origin) return
      const d = e.data as { __melisToolTabs?: boolean; melisKey?: string; tabs?: ToolTab[] } | null
      if (!d || !d.__melisToolTabs || !d.melisKey) return
      if (e.source) sources.current[d.melisKey] = e.source as Window
      const tabs = Array.isArray(d.tabs) ? d.tabs : []
      flushOpen(d.melisKey, tabs)
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
      sources.current[k]?.postMessage({ __melisToolTabCmd: true, melisKey: k, cmd: 'activate', id }, window.location.origin),
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
      sources.current[k]?.postMessage({ __melisToolTabCmd: true, melisKey: k, cmd: 'close', id, next }, window.location.origin)
    },
    requestOpen: (k, id) => {
      // A cold iframe gets it with its first tab report; a pooled (already loaded) one right away.
      pendingRef.current[k] = { id, sent: false, until: Date.now() + 15000 }
      flushOpen(k, sources.current[k] ? state.byKey[k] ?? [] : null)
    },
    isOpening: (k) => {
      const p = k ? pendingRef.current[k] : undefined
      return !!p && Date.now() <= p.until
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useToolTabs() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToolTabs must be used inside <ToolTabBridgeProvider>')
  return ctx
}
