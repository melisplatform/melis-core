import type { ReactNode } from 'react'
import { Activity, type LucideIcon, Wrench } from 'lucide-react'

import type { I18nKey } from '@/i18n/dictionaries'
import { faToLucide } from '@/lib/fa-icons'
import type { LegacyDashboardPlugin } from '@/lib/melis-api'
import { GRID_COLS, legacyRowsToGridRows } from './grid-metrics'
import { ActivityContent, LegacyPluginContent } from './widgets'

/** Définition d'un widget = équivalent React d'un "dashboard plugin" Melis
 *  (cf. config/dashboard-plugins/*.config.php : name, icon, width, height...). */
export interface WidgetDef {
  id: string
  titleKey: I18nKey
  /** Overrides titleKey for dynamic/legacy widgets where no i18n key exists. */
  titleLabel?: string
  /** Description du plugin (config PHP traduite) — infobulle de l'item dans la palette, comme le
   *  menu de plugins legacy. Absente pour les widgets natifs sans équivalent legacy. */
  description?: string
  icon: LucideIcon
  /** Miniature legacy (PHP) à afficher dans la palette à la place de l'icône, si disponible. */
  thumbnail?: string
  /** Clé i18n de la section dans la palette. */
  sectionKey: I18nKey
  /** Melis section this widget belongs to (MelisCore, MelisCms…) — drives the palette group.
   *  Overrides sectionKey for dynamic sections (e.g. legacy plugin groups). */
  sectionLabel?: string
  /** Owning module, shown as a sub-group inside the section (legacy palette rule: only when the
   *  section holds more than one module). */
  moduleLabel?: string
  /** Taille par défaut + minimale (unités de grille, 12 colonnes). `h` est en lignes de la grille
   *  React (46px), ajustée pour l'affichage. */
  w: number
  h: number
  /** Hauteur DÉCLARÉE du plugin en lignes de la grille LEGACY (cellules 80px) — celle de sa config
   *  PHP (`config['height']`). C'est CETTE valeur qu'on persiste dans le record partagé (cf.
   *  layoutToRecords), jamais `h` (l'affichage React ajusté au contenu), sinon le dashboard /melis
   *  rend la tuile trop haute (vide en bas). */
  legacyH: number
  minW: number
  minH: number
  /** Nom du plugin legacy PHP (widgets legacy uniquement) → active le bouton config (engrenage). */
  pluginName?: string
  /** Contenu du widget. */
  render: () => ReactNode
}

export const WIDGETS: WidgetDef[] = [
  // Ce widget natif a un équivalent plugin legacy PHP avec une vraie capture d'écran —
  // on réutilise cette image plutôt que l'icône générique (cohérent avec la palette legacy).
  // `sectionLabel: 'MelisCore'` → il est listé dans la section MELISCORE de la palette, avec les
  // plugins legacy du même module (cf. WidgetPalette : les widgets porteurs d'un sectionLabel
  // rejoignent les groupes dynamiques au lieu de former une section statique à part).
  // `pluginName` : ce widget natif correspond au plugin PHP `MelisCoreDashboardRecentUserActivityPlugin`.
  // Il permet de le PERSISTER dans le record partagé avec le dashboard classique (schéma legacy, clé
  // = vrai nom de plugin) et d'activer son bouton de config. Au rechargement, ce nom de plugin est
  // remappé vers ce widget natif (préféré à sa variante iframe `legacy-…`, cf. DashboardPage).
  { id: 'activity', titleKey: 'dash.recent_activity', icon: Activity, thumbnail: '/MelisCore/plugins/images/MelisCoreDashboardRecentUserActivityPlugin.jpg', sectionKey: 'widget.sec.content', sectionLabel: 'MelisCore', moduleLabel: 'Melis Core', pluginName: 'MelisCoreDashboardRecentUserActivityPlugin', w: 4, h: 6, legacyH: 4, minW: 3, minH: 4, render: () => <ActivityContent /> },
]

export const WIDGET_MAP: Record<string, WidgetDef> = Object.fromEntries(
  WIDGETS.map((w) => [w.id, w]),
)

/** Ordre des sections dans la palette. */
export const WIDGET_SECTIONS: I18nKey[] = ['widget.sec.content']

/** Builds a WidgetDef for a legacy PHP dashboard plugin (rendered as an iframe). */
export function buildLegacyWidgetDef(plugin: LegacyDashboardPlugin): WidgetDef {
  const id = `legacy-${plugin.pluginName}`
  // `plugin.h` est exprimé dans la grille LEGACY (cellules de 80px) : le reprendre tel quel
  // donne une tuile ~2× trop courte et coupe le contenu du plugin (cf. grid-metrics.ts).
  const h = legacyRowsToGridRows(plugin.h)
  return {
    id,
    titleKey: 'widget.sec.legacy',
    titleLabel: plugin.title || plugin.pluginName,
    description: plugin.description || undefined,
    // Icône DÉCLARÉE par le plugin dans sa config PHP (`datas.icon`, ex. `fa fa-calendar`), remontée
    // par /dashboard/legacy-plugins — même source que le dashboard legacy. Rendue avec l'icône
    // lucide JUMELLE du dessin que montre le sélecteur du créateur de plugins (cf. fa-icons.ts, où
    // les 24 classes proposées sont mappées une à une) : ce qu'on choisit à la création est ce qu'on
    // voit sur la tuile. Wrench ne sert que de repli pour une classe hors de cette liste.
    icon: faToLucide(plugin.icon, Wrench),
    thumbnail: plugin.thumbnail || undefined,
    pluginName: plugin.pluginName,
    sectionKey: 'widget.sec.legacy',
    sectionLabel: plugin.section || 'Others',
    moduleLabel: plugin.moduleLabel || plugin.module || undefined,
    w: Math.min(plugin.w, GRID_COLS),
    h,
    // Hauteur DÉCLARÉE (grille legacy 80px), telle que fournie par la découverte — c'est elle qu'on
    // repersiste dans le record partagé, pas `h` (converti pour l'affichage React 46px).
    legacyH: plugin.h,
    minW: 2,
    // ⚠️ NE PAS remettre `minH: h` (la hauteur convertie). C'était le garde-fou qui « réparait »
    // les tuiles persistées trop courtes, mais il PLAFONNE le rétrécissement : GridStack ramène
    // la tuile à `minH` dès qu'on la redimensionne plus petit — l'utilisateur voit sa tuile
    // revenir seule à sa taille d'origine et ne peut plus jamais la réduire.
    // L'ajustement automatique à la hauteur RÉELLE du contenu (cf. LegacyPluginContent) remplace
    // ce garde-fou, et un redimensionnement manuel doit toujours primer.
    minH: 2,
    render: () => <LegacyPluginContent pluginName={plugin.pluginName} />,
  }
}
