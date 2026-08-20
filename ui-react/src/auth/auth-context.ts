import { createContext, useContext } from 'react'

/** Résultat de signIn : `error` = message si échec, `twoFaHash` = 2FA requise (l'appelant doit
 *  naviguer vers /verify-2fa?hash=...), aucun des deux = connexion complète. */
export interface SignInOutcome {
  error?: string
  twoFaHash?: string
}

export interface AuthState {
  /** true si une session Melis est active. */
  authed: boolean
  /** true tant que la vérification initiale de session est en cours. */
  loading: boolean
  /** Tente une connexion. Voir {@link SignInOutcome}. */
  signIn: (login: string, password: string, remember: boolean) => Promise<SignInOutcome>
  /** Finalise la session après vérification du code 2FA (Verify2faPage) — mêmes effets de bord
   *  qu'un signIn réussi (prefetch dashboard + authed=true), sans re-poster les identifiants. */
  completeAuth: () => void
  /** Déconnecte la session courante. */
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
