import { useCallback, useEffect, useState, type ReactNode } from 'react'

import * as melis from '@/lib/melis-api'
import { loadBricks, resetBricks } from '@/lib/bricks'
import { AuthContext, type AuthState } from './auth-context'

const DEMO_STORAGE_KEY = 'melis-demo'

/** Mode démo (DEV uniquement) : permet de parcourir le backoffice sans backend
 *  Melis. Activé via `?demo=1` puis persisté en sessionStorage. Jamais en prod. */
function readDemoFlag(): boolean {
  if (!import.meta.env.DEV) return false
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('demo') === '1') {
      sessionStorage.setItem(DEMO_STORAGE_KEY, '1')
      return true
    }
    return sessionStorage.getItem(DEMO_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const demo = readDemoFlag()
  const [authed, setAuthed] = useState(demo)
  const [loading, setLoading] = useState(!demo)

  // Vérifie la session Melis existante au démarrage (sauf en mode démo).
  useEffect(() => {
    if (demo) return
    let active = true
    melis.isLoggedIn().then((ok) => {
      if (active) {
        setAuthed(ok)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [demo])

  // Once authenticated, pre-fetch platform assets (cached before any ZonePage
  // mounts) and load the React bricks of active modules (modular UI).
  useEffect(() => {
    if (authed) {
      melis.fetchAssets()
      loadBricks()
    }
  }, [authed])

  const signIn = useCallback<AuthState['signIn']>(async (login, password, remember) => {
    const result = await melis.login(login, password, remember)
    if (result.success) {
      setAuthed(true)
      return undefined
    }
    return result.message ?? 'Identifiants invalides.'
  }, [])

  const signOut = useCallback<AuthState['signOut']>(async () => {
    try {
      sessionStorage.removeItem(DEMO_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    await melis.logout()
    resetBricks()
    setAuthed(false)
  }, [])

  return (
    <AuthContext.Provider value={{ authed, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
