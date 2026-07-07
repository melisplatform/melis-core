import type { ReactNode } from 'react'
import { Activity, type LucideIcon, Wrench } from 'lucide-react'

import type { I18nKey } from '@/i18n/dictionaries'
import type { LegacyDashboardPlugin } from '@/lib/melis-api'
import { ActivityContent, LegacyPluginContent } from './widgets'

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
  // Contenu
  // Ce widget natif a un équivalent plugin legacy PHP avec une vraie capture d'écran —
  // on réutilise cette image plutôt que l'icône générique (cohérent avec la palette legacy).
  { id: 'activity', titleKey: 'dash.recent_activity', icon: Activity, thumbnail: '/MelisCore/plugins/images/MelisCoreDashboardRecentUserActivityPlugin.jpg', sectionKey: 'widget.sec.content', w: 4, h: 6, minW: 3, minH: 4, render: () => <ActivityContent /> },
]

export const WIDGET_MAP: Record<string, WidgetDef> = Object.fromEntries(
  WIDGETS.map((w) => [w.id, w]),
)

/** Ordre des sections dans la palette. */
export const WIDGET_SECTIONS: I18nKey[] = ['widget.sec.content']

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
