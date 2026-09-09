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
  /** Hauteur DÉCLARÉE du plugin dans la grille legacy (cellules 80px), telle que lue dans le record
   *  partagé. Conservée sur l'item pour pouvoir le RE-PERSISTER À L'IDENTIQUE même quand sa
   *  définition est inconnue du registre (fetch `/legacy-plugins` pas encore résolu, en échec, ou
   *  plugin non accordé) — sans elle, un tel item ne pourrait pas être réécrit et disparaîtrait du
   *  record. Cf. `layoutToRecords` (DashboardPage). */
  legacyH?: number
  /** L'utilisateur a redimensionné la HAUTEUR de cette tuile à la main. Quand vrai, `h` est une
   *  hauteur voulue (pas un ajustement au contenu) : elle est persistée (react-height) et l'auto-fit
   *  ne la retouche plus, y compris après un rechargement (cf. DashboardPage / DashboardGrid). */
  userSized?: boolean
}

function item(widgetId: string, x: number, y: number): GridItem {
  const def = WIDGET_MAP[widgetId]
  return { i: widgetId, x, y, w: def.w, h: def.h, minW: def.minW, minH: def.minH }
}

/** Disposition par défaut au premier chargement. */
export function defaultLayout(): GridItem[] {
  return [item('activity', 0, 0)]
}

/** Un id d'instance de widget « plugin legacy » (cf. buildLegacyWidgetDef). */
const LEGACY_ID_PREFIX = 'legacy-'

export function loadLayout(): GridItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as GridItem[]
      // Les plugins legacy N'ONT PAS d'entrée dans WIDGET_MAP (leurs défs viennent d'un fetch) :
      // les filtrer sur ce registre vidait un dashboard composé UNIQUEMENT de plugins, et le
      // `defaultLayout()` de repli réinjectait alors le widget « Recent activity » à chaque
      // rafraîchissement — même après suppression. On les conserve donc sur leur préfixe d'id.
      const clean = parsed.filter(
        (l) => WIDGET_MAP[widgetIdOf(l.i)] || widgetIdOf(l.i).startsWith(LEGACY_ID_PREFIX),
      )
      // Un tableau vide STOCKÉ est un choix de l'utilisateur (il a tout retiré) : on le respecte,
      // au lieu de retomber sur la disposition par défaut.
      if (clean.length || Array.isArray(parsed)) {
        // Réinjecte les contraintes min depuis le registre (inconnues pour les plugins legacy,
        // que DashboardPage recale une fois leurs défs chargées).
        return clean.map((l) => {
          const def = WIDGET_MAP[widgetIdOf(l.i)]
          return def ? { ...l, minW: def.minW, minH: def.minH } : l
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
    // `legacyH` fait partie du cache : c'est la seule trace de la hauteur DÉCLARÉE d'un plugin dont
    // la déf. n'est pas (encore) chargée, et c'est elle qu'on réécrit dans le record partagé.
    const slim = layout.map(({ i, x, y, w, h, legacyH }) => ({ i, x, y, w, h, legacyH }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim))
  } catch {
    /* best-effort */
  }
}

/** Largeur totale de la grille (12 colonnes), comme la grille legacy et l'ancienne GridStack. */
const GRID_WIDTH = 12
/** Nombre max de widgets côte à côte sur une même ligne. */
export const MAX_ROW_ITEMS = 3
/** Largeurs (12 colonnes) selon le nombre de widgets de la ligne — répartition égale. */
const ROW_COLUMN_WIDTHS: Record<number, number[]> = {
  1: [GRID_WIDTH],
  2: [GRID_WIDTH / 2, GRID_WIDTH / 2],
  3: [GRID_WIDTH / 3, GRID_WIDTH / 3, GRID_WIDTH / 3],
}

/**
 * Regroupe une disposition PLATE en lignes, d'après `y` (une ligne = un groupe de widgets qui
 * partagent le même `y`), triées par `y` puis par `x` à l'intérieur d'une ligne — c'est cette
 * lecture qui fait qu'aucun champ « ligne » séparé n'est nécessaire : le regroupement est déduit
 * des mêmes `x`/`y`/`w` que ceux qu'écrit/lit déjà le dashboard classique.
 */
export function groupIntoRows(items: GridItem[]): GridItem[][] {
  const byY = new Map<number, GridItem[]>()
  for (const it of items) {
    const row = byY.get(it.y) ?? []
    row.push(it)
    byY.set(it.y, row)
  }
  return Array.from(byY.entries())
    .sort(([a], [b]) => a - b)
    .map(([, row]) => row.slice().sort((a, b) => a.x - b.x))
}

/**
 * Recalcule `x`/`y` d'après des LIGNES explicites (jusqu'à `MAX_ROW_ITEMS` widgets côte à côte) —
 * panneau de structure, pas de coordonnées libres à la souris.
 *
 * `w` de chaque widget est CONSERVÉ tel quel (champ numérique du panneau, cf. `MIN_WIDGET_WIDTH`/
 * `MAX_WIDGET_WIDTH`) SAUF dans deux cas : la somme de la ligne dépasse `GRID_WIDTH` (12) — ce qui
 * arrive typiquement juste après avoir rejoint deux widgets pleine largeur — auquel cas elle est
 * répartie à parts égales comme point de départ (l'utilisateur reprend ensuite la main sur chaque
 * valeur) ; OU le widget est SEUL sur sa ligne (déposé dans un interstice pour l'en extraire d'une
 * ligne partagée), auquel cas il prend TOUJOURS toute la largeur (12) plutôt que de garder l'ancienne
 * largeur (ex. 6, la moitié) héritée de la ligne qu'il vient de quitter — sinon la moitié restante de
 * sa ligne reste un « trou » que GridStack (dashboard, `float:false`) comble en y tirant le widget
 * suivant, qui semble alors rejoindre sa ligne au lieu de rester sur la sienne propre.
 *
 * Chaque ligne commence à `y` = somme des hauteurs des lignes précédentes (hauteur de ligne =
 * la plus grande hauteur de ses widgets, pour ne jamais faire chevaucher la ligne suivante dans
 * la grille RÉELLE du dashboard classique, qui respecte `x`/`y`/`w`/`h` tels quels). Appelé après
 * tout réordonnancement/ajout/retrait/changement de ligne/de taille, AVANT `persist()`.
 */
export function renumberRows(rows: GridItem[][]): GridItem[] {
  let y = 0
  const out: GridItem[] = []
  for (const row of rows) {
    if (!row.length) continue
    const totalW = row.reduce((s, it) => s + Math.max(1, it.w), 0)
    const evenWidths = ROW_COLUMN_WIDTHS[Math.min(row.length, MAX_ROW_ITEMS)] ?? ROW_COLUMN_WIDTHS[MAX_ROW_ITEMS]
    let x = 0
    let rowHeight = 0
    row.forEach((it, i) => {
      // `w` reste CONTINU tant qu'on édite (cf. DashboardPage.setWidgetWidth) : une tolérance
      // (+0.01) absorbe le bruit d'arrondi flottant accumulé sur de nombreux ajustements successifs,
      // pour ne pas déclencher le repli « répartition égale » sur une ligne en réalité toujours à 12.
      const w =
        row.length === 1
          ? GRID_WIDTH
          : totalW > GRID_WIDTH + 0.01
            ? evenWidths[Math.min(i, evenWidths.length - 1)]
            : Math.max(1, it.w)
      out.push({ ...it, x, y, w })
      x += w
      rowHeight = Math.max(rowHeight, it.h)
    })
    y += rowHeight
  }
  return out
}

/** Bornes du champ de hauteur manuelle du panneau (lignes de grille React, 46px — cf. grid-metrics). */
export const MIN_WIDGET_HEIGHT = 2
export const MAX_WIDGET_HEIGHT = 40

/** Bornes du champ de largeur manuelle du panneau (colonnes sur 12, cf. GRID_WIDTH). */
export const MIN_WIDGET_WIDTH = 1
export const MAX_WIDGET_WIDTH = GRID_WIDTH

// ─── Manipulation de lignes par glisser-déposer ────────────────────────────
//
// Partagées entre le panneau de structure (DashboardStructurePanel) ET le corps du dashboard
// (DashboardStack) — mêmes gestes possibles aux DEUX endroits (déposer sur un widget les met côte
// à côte, déposer dans un interstice en fait une nouvelle ligne), sur le MÊME état `rows` que
// DashboardPage passe aux deux : un glisser dans l'un des deux se reflète donc automatiquement
// dans l'autre, sans code de synchronisation dédié.

/** Charge utile transportée par le glisser-déposer : quel widget, à quelle position. */
export type DragPayload = { rowIndex: number; itemIndex: number }

/** Identité STABLE d'une ligne, dérivée des widgets qu'elle contient — sert à retrouver une ligne
 *  après une opération qui a pu en supprimer d'autres (lignes vidées), sans dépendre d'un index
 *  numérique qui aurait bougé entre-temps. */
export function rowKey(row: GridItem[]): string {
  return row.map((it) => it.i).join('+')
}

/** Retire un widget de sa ligne — les lignes devenues vides disparaissent. */
export function removeItem(
  rows: GridItem[][],
  fromRow: number,
  itemIndex: number,
): { rows: GridItem[][]; item: GridItem | null } {
  const next = rows.map((r) => r.slice())
  const [item] = next[fromRow]?.splice(itemIndex, 1) ?? []
  return { rows: next.filter((r) => r.length > 0), item: item ?? null }
}

/** Insère un widget comme NOUVELLE ligne pleine largeur, juste avant la ligne `beforeKey` (fin de
 *  liste si `beforeKey` est `null`, ou si cette ligne a disparu entre-temps — cas où on dépose un
 *  widget juste à côté de l'endroit qu'il vient de quitter, devenu vide). C'est ce qui « éclate »
 *  un widget hors d'une ligne partagée : le déposer dans un INTERSTICE plutôt que sur un widget. */
export function insertAsNewRow(rows: GridItem[][], beforeKey: string | null, item: GridItem): GridItem[][] {
  if (beforeKey === null) return [...rows, [item]]
  const idx = rows.findIndex((r) => rowKey(r) === beforeKey)
  if (idx === -1) return [...rows, [item]]
  const next = rows.slice()
  next.splice(idx, 0, [item])
  return next
}

/** Insère un widget DANS la ligne `targetKey` (le rejoint, jusqu'à `MAX_ROW_ITEMS` côte à côte) —
 *  c'est ce qui place deux widgets côte à côte : les déposer l'un SUR l'autre. Sans effet si la
 *  ligne cible a disparu (rare — son dernier autre widget vient d'être déplacé ailleurs dans le
 *  même geste) ou est déjà pleine. */
export function insertIntoRow(rows: GridItem[][], targetKey: string, item: GridItem): GridItem[][] {
  const idx = rows.findIndex((r) => rowKey(r) === targetKey)
  if (idx === -1 || rows[idx].length >= MAX_ROW_ITEMS) return rows
  const next = rows.slice()
  next[idx] = [...next[idx], item]
  return next
}

/** Réordonne deux widgets À L'INTÉRIEUR de la même ligne (gauche/droite ou haut/bas). */
export function reorderWithinRow(rows: GridItem[][], rowIndex: number, from: number, to: number): GridItem[][] {
  if (from === to) return rows
  const next = rows.map((r) => r.slice())
  const row = next[rowIndex]
  const [it] = row.splice(from, 1)
  row.splice(to, 0, it)
  return next
}

export function resetLayout(): GridItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  return defaultLayout()
}
