import { WIDGET_MAP } from './widget-registry'

/**
 * Persistance de la disposition du dashboard.
 *
 * Équivalent React de la persistance Melis (`melis_core_dashboards.d_content`,
 * XML <Plugins><plugin x-axis/y-axis/width/height></Plugins>). Stockage local
 * isolé derrière load/save pour brancher l'endpoint Melis (`saveDashboardPlugins`)
 * plus tard sans toucher l'UI.
 *
 * `i` = id d'INSTANCE (unique par item posé sur la grille), pas l'id du widget.
 * Une première instance garde l'id "propre" (ex. `traffic`) pour rester compatible
 * avec les layouts déjà sauvegardés ; toute instance supplémentaire du même widget
 * (plugin posé plusieurs fois) reçoit un suffixe `__xxxxxx` (cf. makeInstanceId).
 * Le suffixe est encodé DANS `i` (et non dans un champ à part) car le backend
 * MelisReactApiController::dashboardLayoutAction ne persiste que `i/x/y/w/h` —
 * un champ `widgetId` séparé ne survivrait pas à l'aller-retour XML.
 */
const STORAGE_KEY = 'melis-dashboard-v2'
const INSTANCE_SUFFIX_RE = /__[0-9a-z]{6}$/

/** Extrait l'id du widget (type) à partir d'un id d'instance. */
export function widgetIdOf(instanceId: string): string {
  return instanceId.replace(INSTANCE_SUFFIX_RE, '')
}

/** Génère un id d'instance unique pour une nouvelle occurrence d'un widget. */
export function makeInstanceId(widgetId: string): string {
  return `${widgetId}__${Math.random().toString(36).slice(2, 8)}`
}

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
      const clean = parsed.filter((l) => WIDGET_MAP[widgetIdOf(l.i)])
      if (clean.length) {
        // Réinjecte les contraintes min depuis le registre.
        return clean.map((l) => {
          const def = WIDGET_MAP[widgetIdOf(l.i)]
          return { ...l, minW: def.minW, minH: def.minH }
        })
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
