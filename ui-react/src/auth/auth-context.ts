import { createContext, useContext } from 'react'

export interface AuthState {
  /** true si une session Melis est active. */
  authed: boolean
  /** true tant que la vérification initiale de session est en cours. */
  loading: boolean
  /** Tente une connexion ; renvoie un message d'erreur si échec, undefined si OK. */
  signIn: (login: string, password: string, remember: boolean) => Promise<string | undefined>
  /** Déconnecte la session courante. */
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
