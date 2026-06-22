import { WIDGET_MAP } from './widget-registry'

/**
 * Persistance de la disposition du dashboard.
 *
 * Équivalent React de la persistance Melis (`melis_core_dashboards.d_content`,
 * XML <Plugins><plugin x-axis/y-axis/width/height></Plugins>). Stockage local
 * isolé derrière load/save pour brancher l'endpoint Melis (`saveDashboardPlugins`)
 * plus tard sans toucher l'UI. `i` = id du widget (1 instance / widget).
 */
const STORAGE_KEY = 'melis-dashboard-v2'

/** Un widget positionné sur la grille (unités de grille, 12 colonnes). */
export interface GridItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

function item(widgetId: string, x: number, y: number): GridItem {
  const def = WIDGET_MAP[widgetId]
  return { i: widgetId, x, y, w: def.w, h: def.h, minW: def.minW, minH: def.minH }
}

/** Disposition par défaut au premier chargement. */
export function defaultLayout(): GridItem[] {
  return [
    item('kpi-sites', 0, 0),
    item('kpi-pages', 3, 0),
    item('kpi-langs', 6, 0),
    item('kpi-users', 9, 0),
    item('traffic', 0, 3),
    item('messages', 8, 3),
    item('recent-pages', 0, 8),
    item('notifications', 8, 8),
    item('activity', 0, 14),
    item('updates', 8, 12),
  ]
}

export function loadLayout(): GridItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as GridItem[]
      const clean = parsed.filter((l) => WIDGET_MAP[l.i])
      if (clean.length) {
        // Réinjecte les contraintes min depuis le registre.
        return clean.map((l) => ({ ...l, minW: WIDGET_MAP[l.i].minW, minH: WIDGET_MAP[l.i].minH }))
      }
    }
  } catch {
    /* ignore */
  }
  return defaultLayout()
}

export function saveLayout(layout: GridItem[]): void {
  try {
    const slim = layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim))
  } catch {
    /* best-effort */
  }
}

export function resetLayout(): GridItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  return defaultLayout()
}
