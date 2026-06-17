import type { ReactNode } from 'react'
import {
  Activity,
  Bell,
  FileText,
  Globe,
  Image,
  LineChart,
  type LucideIcon,
  Mail,
  Megaphone,
  Package,
  Users,
} from 'lucide-react'

import type { I18nKey } from '@/i18n/dictionaries'
import {
  ActivityContent,
  AnnouncementContent,
  KpiContent,
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
  icon: LucideIcon
  /** Clé i18n de la section dans la palette. */
  sectionKey: I18nKey
  /** Taille par défaut + minimale (unités de grille, 12 colonnes). */
  w: number
  h: number
  minW: number
  minH: number
  /** Contenu du widget. */
  render: () => ReactNode
}

export const WIDGETS: WidgetDef[] = [
  // Indicateurs (KPI)
  { id: 'kpi-sites', titleKey: 'dash.kpi.sites', icon: Globe, sectionKey: 'widget.sec.kpi', w: 3, h: 3, minW: 2, minH: 2, render: () => <KpiContent kpiKey="sites" /> },
  { id: 'kpi-pages', titleKey: 'dash.kpi.pages', icon: FileText, sectionKey: 'widget.sec.kpi', w: 3, h: 3, minW: 2, minH: 2, render: () => <KpiContent kpiKey="pages" /> },
  { id: 'kpi-media', titleKey: 'dash.kpi.media', icon: Image, sectionKey: 'widget.sec.kpi', w: 3, h: 3, minW: 2, minH: 2, render: () => <KpiContent kpiKey="media" /> },
  { id: 'kpi-users', titleKey: 'dash.kpi.users', icon: Users, sectionKey: 'widget.sec.kpi', w: 3, h: 3, minW: 2, minH: 2, render: () => <KpiContent kpiKey="users" /> },

  // Analytique
  { id: 'traffic', titleKey: 'widget.traffic', icon: LineChart, sectionKey: 'widget.sec.analytics', w: 8, h: 5, minW: 4, minH: 4, render: () => <TrafficChartContent /> },

  // Contenu
  { id: 'recent-pages', titleKey: 'dash.recent_pages', icon: FileText, sectionKey: 'widget.sec.content', w: 8, h: 6, minW: 4, minH: 4, render: () => <RecentPagesContent /> },
  { id: 'activity', titleKey: 'dash.recent_activity', icon: Activity, sectionKey: 'widget.sec.content', w: 4, h: 6, minW: 3, minH: 4, render: () => <ActivityContent /> },
  { id: 'announcement', titleKey: 'widget.announcement', icon: Megaphone, sectionKey: 'widget.sec.content', w: 4, h: 4, minW: 3, minH: 3, render: () => <AnnouncementContent /> },

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
