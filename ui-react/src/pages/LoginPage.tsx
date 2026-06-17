import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useAuth } from '@/auth/auth-context'
import { useTheme } from '@/theme/theme-context'
import wordmark from '@/assets/melis-wordmark.svg'
import wordmarkWhite from '@/assets/melis-wordmark-white.svg'

/** Accroche du panneau de marque, déclinée par thème. */
const BRAND_COPY = {
  platform: {
    title: ['Le backoffice Melis,', 'nouvelle génération.'],
    subtitle:
      'Gérez vos sites, pages et contenus depuis une interface moderne, rapide et pensée pour 2026.',
  },
  studio: {
    title: ['L’IA fait le job.', 'L’humain garde le contrôle.'],
    subtitle:
      'Le backoffice Melis Studio : vos contenus augmentés par l’IA, toujours sous votre contrôle.',
  },
} as const

export default function LoginPage() {
  const { signIn } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const dark = theme === 'studio'
  const copy = BRAND_COPY[theme]

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(undefined)
    setSubmitting(true)
    const message = await signIn(login.trim(), password, remember)
    setSubmitting(false)
    if (message) {
      setError(message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Sélecteur de thème — flottant en haut à droite */}
      <ThemeSwitcher className="absolute right-5 top-5 z-20" />

      {/* Panneau de marque — masqué sur mobile */}
      <aside
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{ color: 'var(--brand-foreground)' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'var(--brand-gradient)' }}
        />
        {/* Halos décoratifs (couleurs pilotées par le thème) */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full blur-3xl"
          style={{ background: 'var(--brand-halo-1)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full blur-3xl"
          style={{ background: 'var(--brand-halo-2)' }}
        />

        <div className="relative flex items-center gap-3">
          <img src={wordmarkWhite} alt="Melis" className="h-6 w-auto" />
          {dark && (
            <span className="font-[var(--font-mono)] rounded-full border border-white/20 px-2 py-0.5 text-[11px] uppercase tracking-widest text-white/70">
              Studio · AI
            </span>
          )}
        </div>

        <div className="relative max-w-md">
          <h1 className="font-[var(--font-display)] text-4xl font-bold leading-tight tracking-tight">
            {copy.title[0]}
            <br />
            {copy.title[1]}
          </h1>
          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: 'var(--brand-muted)' }}
          >
            {copy.subtitle}
          </p>
        </div>

        <div
          className="font-[var(--font-mono)] relative text-xs"
          style={{ color: 'var(--brand-faint)' }}
        >
          © {new Date().getFullYear()} Melis Technology — Aperçu interne
        </div>
      </aside>

      {/* Panneau formulaire */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <img
              src={dark ? wordmarkWhite : wordmark}
              alt="Melis Platform"
              className="h-7 w-auto"
            />
            <h2 className="mt-7 font-[var(--font-display)] text-2xl font-semibold tracking-tight">
              Connexion
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Accédez à votre espace d'administration
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-md border border-destructive/30 bg-secondary px-3.5 py-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="usr_login">Identifiant ou e-mail</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="usr_login"
                  name="usr_login"
                  autoComplete="username"
                  autoFocus
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="admin"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="usr_password">Mot de passe</Label>
                <a
                  href="/melis/lost-password"
                  tabIndex={-1}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="usr_password"
                  name="usr_password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Checkbox
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
              />
              Se souvenir de moi
            </label>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connexion…
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground/70">
            Prototype React — chantier 3. L'interface historique reste disponible sur{' '}
            <a href="/melis/login" className="underline hover:text-foreground">
              /melis/login
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  )
}
