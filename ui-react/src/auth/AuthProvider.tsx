import { useCallback, useEffect, useState, type ReactNode } from 'react'

import * as melis from '@/lib/melis-api'
import { loadBricks, resetBricks } from '@/lib/bricks'
import { prefetchDashboard, resetDashboardPrefetch } from '@/lib/dashboard-prefetch'
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

  // Vérification PÉRIODIQUE de la session (équivalent du legacy /melis/islogin
  // appelé chaque minute) : si la session Melis a expiré côté serveur, on repasse
  // `authed` à false → ProtectedRoute redirige TOUTE l'interface vers /login.
  // On ne déconnecte que sur un `expired` explicite (pas sur une erreur réseau
  // transitoire). On vérifie aussi immédiatement au retour de focus de l'onglet
  // (session probablement expirée après une longue absence).
  useEffect(() => {
    if (demo || !authed) return
    let active = true

    const check = async () => {
      if (document.visibilityState === 'hidden') return // inutile onglet caché
      const status = await melis.checkSession()
      if (active && status === 'expired') {
        // Redirection PLEINE PAGE vers le login (comme le legacy), PAS un simple
        // setAuthed(false) : une nav client-side garderait dans <head> les feuilles
        // de style des briques déjà chargées (leur Tailwind entre en collision avec
        // les utilitaires de l'hôte → ex. panneau gauche du login masqué). Le reload
        // repart d'un DOM propre et réinitialise tout l'état.
        active = false
        window.location.assign(import.meta.env.PROD ? '/melis-react/login' : '/login')
      }
    }

    const SESSION_POLL_MS = 60_000 // 1 min, comme le legacy
    const id = window.setInterval(check, SESSION_POLL_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      active = false
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [demo, authed])

  const signIn = useCallback<AuthState['signIn']>(async (login, password, remember) => {
    const result = await melis.login(login, password, remember)
    if (result.success) {
      // Le préchargement du dashboard part au chargement de `main.tsx`, donc AVANT ce login quand on
      // atterrit directement sur `/melis-react` en session neuve (fenêtre privée) : ses 4 requêtes ont
      // pris un 401. On jette ces promesses mortes et on relance le préchargement, maintenant
      // authentifié — sinon le dashboard les consommait à son montage et s'affichait vide/partiel
      // jusqu'à un rechargement manuel (ticket « dashboard not loaded, I need to reload »).
      resetDashboardPrefetch()
      prefetchDashboard()
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
    // Rien du dashboard de l'utilisateur sortant ne doit être servi au suivant.
    resetDashboardPrefetch()
    setAuthed(false)
  }, [])

  return (
    <AuthContext.Provider value={{ authed, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
