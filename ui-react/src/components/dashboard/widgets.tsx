import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
import { formatRelativeHours } from '@/lib/format'
import { ACTIVITY } from '@/lib/mocks'
import { useDashboardData } from './dashboard-data-context'

export function ActivityContent() {
  const { t, lang } = useI18n()
  const { stats } = useDashboardData()

  // Données réelles : dernières connexions utilisateurs.
  if (stats) {
    if (!stats.activity.length) {
      return <p className="text-sm text-muted-foreground">{t('dash.recent_activity')}</p>
    }
    return (
      <ul className="space-y-4">
        {stats.activity.map((a) => {
          const hoursAgo = a.loginDate
            ? Math.max(1, Math.round((Date.now() - new Date(a.loginDate).getTime()) / 3_600_000))
            : 0
          return (
            <li key={a.id} className="flex items-start gap-3">
              <Avatar className="size-8">
                <AvatarFallback className="text-[11px]">
                  {a.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{a.name}</span>{' '}
                  {t('act.connected')}
                </p>
                {hoursAgo > 0 && (
                  <p className="text-xs text-muted-foreground/70">
                    {formatRelativeHours(hoursAgo, lang)}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  // Fallback mock pendant le chargement.
  return (
    <ul className="space-y-4">
      {ACTIVITY.map((a) => (
        <li key={a.id} className="flex items-start gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-[11px]">
              {a.user.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{a.user}</span>{' '}
              {t(`act.${a.type}` as I18nKey)}{' '}
              <span className="font-medium text-foreground">{a.target}</span>
            </p>
            <p className="text-xs text-muted-foreground/70">
              {formatRelativeHours(a.hoursAgo, lang)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Renders a legacy Melis dashboard plugin (PHP) inside an iframe. */
export function LegacyPluginContent({ pluginName }: { pluginName: string }) {
  // Un widget plugin legacy est une iframe qui charge tout le bundle de la plateforme →
  // ça peut prendre plusieurs secondes. On affiche un spinner tant que l'iframe n'a pas
  // fini de charger (onLoad) : couvre le 1er affichage ET chaque rechargement (remontage).
  const [loading, setLoading] = useState(true)
  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-card/70">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <iframe
        src={`/melis/react-dashboard-plugin?plugin=${encodeURIComponent(pluginName)}`}
        className="h-full w-full border-0"
        title={pluginName}
        style={{ minHeight: 120 }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        onLoad={() => setLoading(false)}
      />
    </div>
  )
}
