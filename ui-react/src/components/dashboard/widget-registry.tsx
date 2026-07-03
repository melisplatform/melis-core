import type { ReactNode } from 'react'
import {
  Activity,
  Bell,
  FileText,
  Globe,
  Languages,
  LineChart,
  type LucideIcon,
  Mail,
  Megaphone,
  Package,
  Users,
  Wrench,
} from 'lucide-react'

import type { I18nKey } from '@/i18n/dictionaries'
import type { LegacyDashboardPlugin } from '@/lib/melis-api'
import {
  ActivityContent,
  AnnouncementContent,
  KpiContent,
  LegacyPluginContent,
  MessagesContent,
  NotificationsContent,
  RecentPagesContent,
  TrafficChartContent,
  UpdatesContent,
} from './widgets'

/** Définition d'un widget = équivalent React d'un "dashboard plugin" Melis
 *  (cf. config/dashboard-plugins/*.config.php : name, icon, width, height...). */
export interface WidgetDef {
  id: string
  titleKey: I18nKey
  /** Overrides titleKey for dynamic/legacy widgets where no i18n key exists. */
  titleLabel?: string
  icon: LucideIcon
  /** Miniature legacy (PHP) à afficher dans la palette à la place de l'icône, si disponible. */
  thumbnail?: string
  /** Clé i18n de la section dans la palette. */
  sectionKey: I18nKey
  /** Overrides sectionKey label for dynamic sections (e.g. legacy plugin groups). */
  sectionLabel?: string
  /** Taille par défaut + minimale (unités de grille, 12 colonnes). */
  w: number
  h: number
  minW: number
  minH: number
  /** Nom du plugin legacy PHP (widgets legacy uniquement) → active le bouton config (engrenage). */
  pluginName?: string
  /** Contenu du widget. */
  render: () => ReactNode
}

export const WIDGETS: WidgetDef[] = [
  // Indicateurs (KPI)
  { id: 'kpi-sites', titleKey: 'dash.kpi.sites', icon: Globe, sectionKey: 'widget.sec.kpi', w: 3, h: 3, minW: 2, minH: 2, render: () => <KpiContent kpiKey="sites" /> },
  { id: 'kpi-pages', titleKey: 'dash.kpi.pages', icon: FileText, sectionKey: 'widget.sec.kpi', w: 3, h: 3, minW: 2, minH: 2, render: () => <KpiContent kpiKey="pages" /> },
  { id: 'kpi-langs', titleKey: 'dash.kpi.languages', icon: Languages, sectionKey: 'widget.sec.kpi', w: 3, h: 3, minW: 2, minH: 2, render: () => <KpiContent kpiKey="languages" /> },
  { id: 'kpi-users', titleKey: 'dash.kpi.users', icon: Users, sectionKey: 'widget.sec.kpi', w: 3, h: 3, minW: 2, minH: 2, render: () => <KpiContent kpiKey="users" /> },

  // Analytique
  { id: 'traffic', titleKey: 'widget.traffic', icon: LineChart, sectionKey: 'widget.sec.analytics', w: 8, h: 5, minW: 4, minH: 4, render: () => <TrafficChartContent /> },

  // Contenu
  // Ces 3 widgets natifs ont un équivalent plugin legacy PHP avec une vraie capture d'écran —
  // on réutilise cette image plutôt que l'icône générique (cohérent avec la palette legacy).
  { id: 'recent-pages', titleKey: 'dash.recent_pages', icon: FileText, thumbnail: '/MelisCmsPageHistoric/plugins/images/MelisCmsPageHistoricRecentUserActivityPlugin.jpg', sectionKey: 'widget.sec.content', w: 8, h: 6, minW: 4, minH: 4, render: () => <RecentPagesContent /> },
  { id: 'activity', titleKey: 'dash.recent_activity', icon: Activity, thumbnail: '/MelisCore/plugins/images/MelisCoreDashboardRecentUserActivityPlugin.jpg', sectionKey: 'widget.sec.content', w: 4, h: 6, minW: 3, minH: 4, render: () => <ActivityContent /> },
  { id: 'announcement', titleKey: 'widget.announcement', icon: Megaphone, thumbnail: '/MelisCore/plugins/images/MelisCoreDashboardAnnouncementPlugin.png', sectionKey: 'widget.sec.content', w: 4, h: 4, minW: 3, minH: 3, render: () => <AnnouncementContent /> },

  // Communication
  { id: 'messages', titleKey: 'dash.messages', icon: Mail, sectionKey: 'widget.sec.comm', w: 4, h: 5, minW: 3, minH: 3, render: () => <MessagesContent /> },
  { id: 'notifications', titleKey: 'dash.notifications', icon: Bell, sectionKey: 'widget.sec.comm', w: 4, h: 4, minW: 3, minH: 3, render: () => <NotificationsContent /> },
  { id: 'updates', titleKey: 'dash.updates', icon: Package, sectionKey: 'widget.sec.comm', w: 4, h: 4, minW: 3, minH: 3, render: () => <UpdatesContent /> },
]

export const WIDGET_MAP: Record<string, WidgetDef> = Object.fromEntries(
  WIDGETS.map((w) => [w.id, w]),
)

/** Ordre des sections dans la palette. */
export const WIDGET_SECTIONS: I18nKey[] = [
  'widget.sec.kpi',
  'widget.sec.analytics',
  'widget.sec.content',
  'widget.sec.comm',
]

/** Builds a WidgetDef for a legacy PHP dashboard plugin (rendered as an iframe). */
export function buildLegacyWidgetDef(plugin: LegacyDashboardPlugin): WidgetDef {
  const id = `legacy-${plugin.pluginName}`
  return {
    id,
    titleKey: 'widget.sec.legacy',
    titleLabel: plugin.title || plugin.pluginName,
    icon: Wrench,
    thumbnail: plugin.thumbnail || undefined,
    pluginName: plugin.pluginName,
    sectionKey: 'widget.sec.legacy',
    sectionLabel: plugin.section || 'Plugins',
    w: Math.min(plugin.w, 12),
    h: Math.max(plugin.h, 2),
    minW: 2,
    minH: 2,
    render: () => <LegacyPluginContent pluginName={plugin.pluginName} />,
  }
}
