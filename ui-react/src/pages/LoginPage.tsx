import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useAuth } from '@/auth/auth-context'
import { useTheme } from '@/theme/theme-context'
import { useI18n } from '@/i18n/i18n-context'
import { LANGS, LANG_LABELS, LANG_LOCALE, type Lang } from '@/i18n/dictionaries'
import { useReactTheme, loadReactTheme } from '@/lib/react-theme'
import { cn } from '@/lib/utils'
import wordmark from '@/assets/melis-wordmark.svg'
import wordmarkWhite from '@/assets/melis-wordmark-white.svg'
const flagSrc = (l: Lang) => `/MelisCore/images/lang/${LANG_LOCALE[l]}.png`
const Flag = ({ l }: { l: Lang }) => (
  <img src={flagSrc(l)} alt="" className="h-3.5 w-auto rounded-[2px] object-cover" />
)

/** Sélecteur de langue du login : bascule la langue de l'UI React en LOCAL (avant authentification,
 *  pas de session) via setLang. Le reste du BO suivra la locale de session une fois connecté. */
function LoginLangSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])
  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={t('login.language')}
        className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <Flag l={lang} />
        <span className="text-xs font-semibold uppercase">{lang}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 min-w-[150px] overflow-hidden rounded-md border border-border bg-card py-1 shadow-lg">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => { setLang(l); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-accent',
                l === lang ? 'font-medium text-primary' : 'text-foreground',
              )}
            >
              <Flag l={l} />
              <span className="flex-1 text-left">{LANG_LABELS[l]}</span>
              {l === lang && <Check className="size-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Bandeau "Version bêta React" en bas du formulaire de login.
 *  Le domaine est résolu dynamiquement (window.location.origin) ; l'URL legacy est cliquable. */
function LegacyNotice() {
  const { t } = useI18n()
  const origin = window.location.origin
  const legacyUrl = `${origin}/melis`
  // La traduction contient {domain} — on l'interpole, puis on split sur legacyUrl pour insérer un <a>.
  const notice = t('login.legacy_notice', { domain: origin })
  const [before, after] = notice.split(legacyUrl)
  return (
    <p className="mt-8 text-center text-xs text-muted-foreground/70">
      {before}
      <a href={legacyUrl} className="underline hover:text-foreground">{legacyUrl}</a>
      {after ?? ''}
    </p>
  )
}

export default function LoginPage() {
  const { signIn } = useAuth()
  const { theme } = useTheme()
  const { t, lang } = useI18n()
  const navigate = useNavigate()

  const dark = theme === 'studio'

  // Branding du panneau gauche (thème React, lisible AVANT auth via l'endpoint public).
  const brand = useReactTheme()
  useEffect(() => { loadReactTheme() }, [])

  // Titre/sous-titre traduits : on résout la langue React (fr/en) → locale → langId du BO.
  const brandLangId = brand.languages.find((l) => l.locale === LANG_LOCALE[lang])?.id
  const brandTitle = (brandLangId != null ? brand.translations.loginTitle[String(brandLangId)] : '') || ''
  const brandSubtitle = (brandLangId != null ? brand.translations.loginSubtitle[String(brandLangId)] : '') || ''

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
      {/* Sélecteurs (langue + thème) — flottants en haut à droite */}
      <div className="absolute right-5 top-5 z-20 flex items-center gap-1">
        <LoginLangSwitcher />
        <ThemeSwitcher />
      </div>

      {/* Panneau de marque — masqué sur mobile. Les couleurs suivent le thème (clair/sombre) ;
          seule l'accroche est figée sur l'identité "platform" (cf. `copy` ci-dessus). */}
      <aside
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{ color: 'var(--brand-foreground)' }}
      >
        {/* Fond : image configurée (avec voile pour la lisibilité) sinon dégradé du thème. */}
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={brand.loginBackground
            ? { backgroundImage: `linear-gradient(rgba(0,0,0,.30), rgba(0,0,0,.45)), url(${JSON.stringify(brand.loginBackground)})` }
            : { background: 'var(--brand-gradient)' }}
        />
        {/* Halos décoratifs (uniquement sans image de fond personnalisée) */}
        {!brand.loginBackground && (
          <>
            <div
              className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full blur-3xl"
              style={{ background: 'var(--brand-halo-1)' }}
            />
            <div
              className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full blur-3xl"
              style={{ background: 'var(--brand-halo-2)' }}
            />
          </>
        )}

        <div className="relative flex items-center gap-3">
          <img src={brand.loginLogo || wordmarkWhite} alt="Melis" className="h-6 w-auto max-w-[220px] object-contain" />
        </div>

        <div className="relative max-w-md">
          <h1 className="font-[var(--font-display)] text-4xl font-bold leading-tight tracking-tight">
            {brandTitle
              ? <span className="whitespace-pre-line">{brandTitle}</span>
              : <>{t('login.brand_title1')}<br />{t('login.brand_title2')}</>}
          </h1>
          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: 'var(--brand-muted)' }}
          >
            {brandSubtitle || t('login.brand_subtitle')}
          </p>
        </div>

        <div
          className="font-[var(--font-mono)] relative text-xs"
          style={{ color: 'var(--brand-faint)' }}
        >
          © {new Date().getFullYear()} {t('footer.by')}{' '}
          <a href={`https://www.melisplatform.com/${lang}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
            Melis Technology
          </a>{' '}- {t('footer.rights')}
          {brand.version && <> - {t('footer.version')}: {brand.version}</>}
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
              {t('login.title')}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t('login.subtitle')}
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
              <Label htmlFor="usr_login">{t('login.username')}</Label>
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
                <Label htmlFor="usr_password">{t('login.password')}</Label>
                <Link
                  to="/forgot-password"
                  tabIndex={-1}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t('login.forgot')}
                </Link>
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
                  aria-label={showPassword ? t('login.hide_password') : t('login.show_password')}
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
              {t('login.remember')}
            </label>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('login.submitting')}
                </>
              ) : (
                <>
                  {t('login.submit')}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <LegacyNotice />
        </div>
      </main>
    </div>
  )
}
