import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowRight, CheckCircle, Eye, EyeOff, Loader2, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useI18n } from '@/i18n/i18n-context'
import { useTheme } from '@/theme/theme-context'
import { useReactTheme, loadReactTheme } from '@/lib/react-theme'
import { resetPassword } from '@/lib/melis-api'
import wordmark from '@/assets/melis-wordmark.svg'
import wordmarkWhite from '@/assets/melis-wordmark-white.svg'

export default function ResetPasswordPage() {
  const { t } = useI18n()
  const { theme } = useTheme()
  const dark = theme === 'studio'
  const brand = useReactTheme()
  useEffect(() => { loadReactTheme() }, [])
  const { hash } = useParams<{ hash: string }>()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | undefined>()

  if (!hash) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-sm text-destructive">{t('reset.err_invalid')}</p>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(undefined)

    if (password !== confirm) {
      setError(t('reset.err_match'))
      return
    }
    if (password.length < 8) {
      setError(t('reset.err_length'))
      return
    }

    setSubmitting(true)
    const result = await resetPassword(hash!, password, confirm)
    setSubmitting(false)

    if (result.success) {
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    } else {
      setError(result.message ?? t('reset.err_server'))
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div className="absolute right-5 top-5 z-20">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={brand.loginLogo || (dark ? wordmarkWhite : wordmark)} alt="Melis Platform" className="h-7 w-auto max-w-[220px] object-contain" />
          <h2 className="mt-7 font-[var(--font-display)] text-2xl font-semibold tracking-tight">
            {t('reset.title')}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t('reset.subtitle')}</p>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="size-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{t('reset.success_msg')}</p>
            <Button asChild className="w-full" size="lg">
              <Link to="/login">{t('reset.go_login')}</Link>
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-md border border-destructive/30 bg-secondary px-3.5 py-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: error }} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="usr_pass">{t('reset.password')}</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="usr_pass"
                    name="usr_pass"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoFocus
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
                    tabIndex={-1}
                    aria-label={showPassword ? t('login.hide_password') : t('login.show_password')}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usr_pass_confirm">{t('reset.confirm')}</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="usr_pass_confirm"
                    name="usr_pass_confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showConfirm ? t('login.hide_password') : t('login.show_password')}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t('reset.submitting')}
                  </>
                ) : (
                  <>
                    {t('reset.submit')}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
