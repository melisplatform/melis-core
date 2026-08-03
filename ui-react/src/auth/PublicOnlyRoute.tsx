import { Loader2 } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from './auth-context'

/** Garde inverse de <ProtectedRoute> : une page anonyme (login, mot de passe oublié,
 *  réinitialisation) ne doit pas s'afficher quand une session Melis est déjà active.
 *  Parité avec le legacy, où MelisCoreUrlAccessCheckerListenner redirige
 *  /melis/login, /melis/lost-password et /melis/reset-password vers /melis dès que
 *  MelisCoreAuth->hasIdentity(). Ici on redirige vers la racine du SPA (dashboard).
 *  Tant que la vérification de session initiale tourne, on n'affiche PAS le formulaire
 *  (sinon flash du login avant la redirection). */
export function PublicOnlyRoute() {
  const { authed, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (authed) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
