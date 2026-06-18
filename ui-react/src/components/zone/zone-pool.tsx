import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { melisKeyForRoute } from '@/lib/tool-routes'

export type LoadState = 'loading' | 'ready' | 'error'

export interface ZoneEntry {
  src: string
  state: LoadState
}

interface ZonePoolAPI {
  entries: Map<string, ZoneEntry>
  /** Clé active forcée par une page React (ex. mode classique sur /users). */
  activeOverride: string | null
  register(key: string, src: string): void
  markReady(key: string): void
  markError(key: string): void
  reload(key: string): void
  setActiveOverride(key: string | null): void
}

const Ctx = createContext<ZonePoolAPI | null>(null)

export function ZonePoolProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Map<string, ZoneEntry>>(new Map())
  const [activeOverride, setActiveOverrideState] = useState<string | null>(null)
  const setActiveOverride = useCallback((key: string | null) => setActiveOverrideState(key), [])

  const register = useCallback((key: string, src: string) => {
    setEntries(prev => {
      if (prev.has(key)) return prev
      const next = new Map(prev)
      next.set(key, { src, state: 'loading' })
      return next
    })
  }, [])

  const markReady = useCallback((key: string) => {
    setEntries(prev => {
      const e = prev.get(key)
      if (!e || e.state === 'ready') return prev
      const next = new Map(prev)
      next.set(key, { ...e, state: 'ready' })
      return next
    })
  }, [])

  const markError = useCallback((key: string) => {
    setEntries(prev => {
      const e = prev.get(key)
      if (!e || e.state === 'error') return prev
      const next = new Map(prev)
      next.set(key, { ...e, state: 'error' })
      return next
    })
  }, [])

  // Destroy a zone iframe (on tab close) so reopening reloads it fresh.
  const unregister = useCallback((key: string) => {
    setEntries(prev => {
      if (!prev.has(key)) return prev
      const next = new Map(prev)
      next.delete(key)
      return next
    })
  }, [])

  // When a tab is closed, drop its zone entry (fresh reload on reopen, not hide/show).
  useEffect(() => {
    const onClosed = (e: Event) => {
      const path = (e as CustomEvent<{ path?: string }>).detail?.path ?? ''
      const key = melisKeyForRoute(path)
      if (key) unregister(key)
    }
    window.addEventListener('melis:tab-closed', onClosed)
    return () => window.removeEventListener('melis:tab-closed', onClosed)
  }, [unregister])

  const reload = useCallback((key: string) => {
    setEntries(prev => {
      const e = prev.get(key)
      if (!e) return prev
      const next = new Map(prev)
      const base = e.src.replace(/[&?]_r=\d+/, '')
      const sep  = base.includes('?') ? '&' : '?'
      next.set(key, { src: `${base}${sep}_r=${Date.now()}`, state: 'loading' })
      return next
    })
  }, [])

  return (
    <Ctx.Provider value={{ entries, activeOverride, register, markReady, markError, reload, setActiveOverride }}>
      {children}
    </Ctx.Provider>
  )
}

export function useZonePool() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useZonePool must be used within ZonePoolProvider')
  return ctx
}
