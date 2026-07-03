import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useState } from 'react'
import { Loader2, Package, TrendingDown, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
import { formatNumber, formatRelativeHours } from '@/lib/format'
import {
  ACTIVITY,
  KPIS,
  MESSAGES,
  NOTIFICATIONS,
  RECENT_PAGES,
  TRAFFIC_DATA,
  UPDATES,
  type Kpi,
  type PageStatus,
} from '@/lib/mocks'
import { useDashboardData } from './dashboard-data-context'

const STATUS_VARIANT: Record<PageStatus, 'success' | 'muted' | 'warning'> = {
  published: 'success',
  draft: 'muted',
  scheduled: 'warning',
}
const STATUS_LABEL: Record<PageStatus, I18nKey> = {
  published: 'dash.status.published',
  draft: 'dash.status.draft',
  scheduled: 'dash.status.scheduled',
}
const KPI_LABEL: Record<Kpi['key'], I18nKey> = {
  sites: 'dash.kpi.sites',
  pages: 'dash.kpi.pages',
  languages: 'dash.kpi.languages',
  users: 'dash.kpi.users',
}

/** Contenu d'un widget KPI (une métrique). */
export function KpiContent({ kpiKey }: { kpiKey: Kpi['key'] }) {
  const { t, lang } = useI18n()
  const { stats } = useDashboardData()

  // Valeur réelle depuis l'API, sinon fallback mock.
  const realValue: number | undefined = stats?.kpis[kpiKey]
  const mockKpi = KPIS.find((k) => k.key === kpiKey)!
  const value = realValue ?? mockKpi.value
  // Delta n'est pas fourni par l'API (besoin d'historique) → pas affiché si données réelles.
  const delta = stats ? 0 : mockKpi.delta
  const up = delta > 0
  const flat = delta === 0
  const Trend = up ? TrendingUp : TrendingDown

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t(KPI_LABEL[kpiKey])}</span>
        {!flat && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              up ? 'text-[var(--color-success)]' : 'text-destructive',
            )}
          >
            <Trend className="size-3.5" />
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="mt-1 font-[var(--font-display)] text-3xl font-bold tracking-tight">
        {formatNumber(value, lang)}
      </div>
    </div>
  )
}

export function RecentPagesContent() {
  const { t, lang } = useI18n()
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground/70">
            <th className="pb-2 pr-4 font-medium">{t('dash.col.page')}</th>
            <th className="pb-2 pr-4 font-medium">{t('dash.col.site')}</th>
            <th className="pb-2 pr-4 font-medium">{t('dash.col.status')}</th>
            <th className="pb-2 text-right font-medium">{t('dash.col.updated')}</th>
          </tr>
        </thead>
        <tbody>
          {RECENT_PAGES.map((p) => (
            <tr key={p.id} className="border-b border-border/60 last:border-0">
              <td className="py-2.5 pr-4 font-medium text-foreground">{p.title}</td>
              <td className="py-2.5 pr-4 text-muted-foreground">{p.site}</td>
              <td className="py-2.5 pr-4">
                <Badge variant={STATUS_VARIANT[p.status]}>{t(STATUS_LABEL[p.status])}</Badge>
              </td>
              <td className="py-2.5 text-right text-muted-foreground">
                {formatRelativeHours(p.updatedHoursAgo, lang)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

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

export function MessagesContent() {
  const { lang } = useI18n()
  return (
    <ul className="space-y-3">
      {MESSAGES.map((m) => (
        <li key={m.id} className="flex items-start gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-[11px]">
              {m.from.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-foreground">{m.from}</span>
              {m.unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {formatRelativeHours(m.hoursAgo, lang)}
              </span>
            </div>
            <p className="truncate text-xs text-muted-foreground">{m.snippet}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function NotificationsContent() {
  const { lang } = useI18n()
  return (
    <ul className="space-y-3">
      {NOTIFICATIONS.map((n) => (
        <li key={n.id} className="flex items-start gap-3">
          <span
            className={cn(
              'mt-1.5 size-2 shrink-0 rounded-full',
              n.unread ? 'bg-primary' : 'bg-border',
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{n.title}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {formatRelativeHours(n.hoursAgo, lang)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{n.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

const UPDATE_VARIANT = { security: 'warning', feature: 'primary', patch: 'muted' } as const

export function UpdatesContent() {
  return (
    <ul className="space-y-3">
      {UPDATES.map((u) => (
        <li key={u.id} className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground">
            <Package className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground">{u.module}</div>
            <div className="font-[var(--font-mono)] text-xs text-muted-foreground">
              v{u.version}
            </div>
          </div>
          <Badge variant={UPDATE_VARIANT[u.kind]}>{u.kind}</Badge>
        </li>
      ))}
    </ul>
  )
}

export function TrafficChartContent() {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={120}>
      <AreaChart data={TRAFFIC_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="wg-visits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-popover)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--color-foreground)',
          }}
        />
        <Area
          type="monotone"
          dataKey="visits"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#wg-visits)"
          isAnimationActive={false}
          dot={{ r: 3, fill: 'var(--color-primary)', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
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

export function AnnouncementContent() {
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-md border border-border/60 bg-muted/40 p-3">
        <div className="font-medium text-foreground">Bienvenue sur Melis Platform</div>
        <p className="mt-1 text-muted-foreground">
          Nous vous souhaitons une excellente expérience sur votre nouveau backoffice.
        </p>
      </div>
      <div className="rounded-md border border-border/60 bg-muted/40 p-3">
        <div className="font-medium text-foreground">Prototype React — chantier 3</div>
        <p className="mt-1 text-muted-foreground">
          Dashboard à widgets : glissez-déposez depuis la palette, déplacez, redimensionnez.
        </p>
      </div>
    </div>
  )
}
