import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowRight, KeyRound, Loader2, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useAuth } from '@/auth/auth-context'
import { useTheme } from '@/theme/theme-context'
import { useI18n } from '@/i18n/i18n-context'
import { useReactTheme, loadReactTheme } from '@/lib/react-theme'
import { verifyTwoFaCode, requestNewTwoFaCode } from '@/lib/melis-api'
import { FormErrorBanner } from '@/shared/melis-form-errors'
import wordmark from '@/assets/melis-wordmark.svg'
import wordmarkWhite from '@/assets/melis-wordmark-white.svg'

const RESEND_COOLDOWN_S = 60

/**
 * Saisie du code de vérification 2FA — route React publique, prend le relais après un login dont
 * le mot de passe est valide mais qui exige la 2FA (voir melis-api.ts::login, LoginPage). Poste
 * directement sur les endpoints legacy /melis/verify-2fa-code et /melis/request-2fa-code : la page
 * legacy équivalente (/melis/verify-2fa) a son propre bug de rendu (zone PluginView non résolue
 * pour un utilisateur non authentifié) qui la rend inutilisable telle quelle.
 */
export default function Verify2faPage() {
  const { t } = useI18n()
  const { theme } = useTheme()
  const dark = theme === 'studio'
  const brand = useReactTheme()
  useEffect(() => { loadReactTheme() }, [])
  const { completeAuth } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hash = searchParams.get('hash')

  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [resending, setResending] = useState(false)
  const [resendInfo, setResendInfo] = useState<string | undefined>()
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => window.clearInterval(id)
  }, [cooldown])

  if (!hash) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-destructive">{t('verify2fa.err_invalid')}</p>
        <Link to="/login" className="text-sm font-medium text-primary hover:underline">
          {t('verify2fa.back_login')}
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting || !code.trim()) return
    setError(undefined)
    setSubmitting(true)
    const result = await verifyTwoFaCode(hash!, code.trim())
    setSubmitting(false)
    if (result.success) {
      completeAuth()
      navigate('/', { replace: true })
      return
    }
    setError(result.message ?? t('verify2fa.err_invalid_code'))
  }

  async function handleResend() {
    if (resending || cooldown > 0) return
    setResending(true)
    setError(undefined)
    setResendInfo(undefined)
    const result = await requestNewTwoFaCode(hash!)
    setResending(false)
    if (result.success) {
      setResendInfo(result.message ?? t('verify2fa.resent'))
      setCooldown(RESEND_COOLDOWN_S)
    } else {
      setError(result.message ?? t('verify2fa.err_resend'))
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div className="absolute right-5 top-5 z-20">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={brand.loginLogo || (dark ? wordmarkWhite : wordmark)}
            alt="Melis Platform"
            className="h-7 w-auto max-w-[220px] object-contain"
          />
          <div className="mt-7 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <h2 className="mt-4 font-[var(--font-display)] text-2xl font-semibold tracking-tight">
            {t('verify2fa.title')}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t('verify2fa.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-5">
            <FormErrorBanner title={error} html icon={<AlertCircle className="mt-0.5 size-4 shrink-0" />} />
          </div>
        )}
        {resendInfo && !error && (
          // Message serveur (Melis mélange accents UTF-8 et entités HTML type &apos; selon les
          // chaînes de traduction) — même traitement `html` que FormErrorBanner ci-dessus.
          <p
            className="mb-5 text-center text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: resendInfo }}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="verify_code">{t('verify2fa.code_label')}</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="verify_code"
                name="verify_code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="pl-10 text-center tracking-[0.3em]"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting || !code.trim()}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t('verify2fa.submitting')}
              </>
            ) : (
              <>
                {t('verify2fa.submit')}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full text-center text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
          >
            {cooldown > 0
              ? t('verify2fa.resend_cooldown', { seconds: String(cooldown) })
              : resending
                ? t('verify2fa.resending')
                : t('verify2fa.resend')}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground/70">
          <Link to="/login" className="underline hover:text-foreground">{t('verify2fa.back_login')}</Link>
        </p>
      </div>
    </div>
  )
}
