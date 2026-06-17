import { useLocation } from 'react-router-dom'
import { Construction } from 'lucide-react'

import { useI18n } from '@/i18n/i18n-context'
import { labelKeyForPath } from '@/components/layout/nav'

/** Écran générique pour les sections pas encore implémentées. */
export default function PlaceholderPage() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const titleKey = labelKeyForPath(pathname)

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-primary">
        <Construction className="size-7" />
      </div>
      <h2 className="mt-5 font-[var(--font-display)] text-xl font-semibold">
        {titleKey ? t(titleKey) : t('common.coming_soon')}
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {t('common.coming_soon_sub')}
      </p>
    </div>
  )
}
