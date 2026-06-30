import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Loader2, Mail, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useI18n } from '@/i18n/i18n-context'
import { useTheme } from '@/theme/theme-context'
import { useReactTheme, loadReactTheme } from '@/lib/react-theme'
import { requestPasswordReset } from '@/lib/melis-api'
import wordmark from '@/assets/melis-wordmark.svg'
import wordmarkWhite from '@/assets/melis-wordmark-white.svg'

export default function ForgotPasswordPage() {
  const { t } = useI18n()
  const { theme } = useTheme()
  const dark = theme === 'studio'
  const brand = useReactTheme()
  useEffect(() => { loadReactTheme() }, [])

  const [login, setLogin] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | undefined>()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (!login.trim() || !email.trim()) {
      setError(t('forgot.err_required'))
      return
    }
    setError(undefined)
    setSubmitting(true)
    const result = await requestPasswordReset(login.trim(), email.trim())
    setSubmitting(false)
    if (result.success) {
      setSent(true)
    } else {
      setError(result.message ?? t('forgot.err_server'))
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
            {t('forgot.title')}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {sent ? t('forgot.success_title') : t('forgot.subtitle')}
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="size-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{t('forgot.success_msg')}</p>
            <Button asChild className="w-full" size="lg">
              <Link to="/login">{t('forgot.back_login')}</Link>
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
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="usr_login">{t('forgot.login')}</Label>
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
                <Label htmlFor="usr_email">{t('forgot.email')}</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="usr_email"
                    name="usr_email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t('forgot.submitting')}
                  </>
                ) : (
                  <>
                    {t('forgot.submit')}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                {t('forgot.back_login')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
