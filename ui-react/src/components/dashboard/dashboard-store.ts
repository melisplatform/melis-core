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
 * Regroupe une disposition PLATE en lignes — aucun champ « ligne » séparé n'est nécessaire : le
 * regroupement est déduit des mêmes `x`/`y`/`w`/`h` que ceux qu'écrit/lit déjà le dashboard
 * classique.
 *
 * Critère : la PROFONDEUR D'EMPILEMENT d'un widget dans ses colonnes (0 = rien au-dessus de lui,
 * 1 = un widget au-dessus, …), PAS son `y` exact. Avant, une ligne = « même `y` » ; or dès que
 * deux voisins n'ont pas la même hauteur (widget de gauche agrandi), les widgets du dessous
 * n'ont plus le même `y` (13 et 14 par ex.) alors qu'ils forment visiblement la 2ᵉ rangée du
 * dashboard — le panneau les montrait sur deux lignes séparées (Mantis #0011020). Avec la
 * profondeur, « Recent page activity » (sous le widget de gauche) et « Calendar » (sous celui de
 * droite) sont bien côte à côte dans le panneau. Pour des lignes de hauteurs égales, résultat
 * identique au regroupement par `y`. Lignes triées par profondeur, widgets par `x` dans la ligne.
 */
export function groupIntoRows(items: GridItem[]): GridItem[][] {
  const sorted = items.slice().sort((a, b) => a.y - b.y || a.x - b.x)
  const overlapX = (a: GridItem, b: GridItem) =>
    a.x < b.x + Math.max(1, b.w) - 0.01 && b.x < a.x + Math.max(1, a.w) - 0.01
  const depth = new Map<string, number>()
  for (const it of sorted) {
    let d = 0
    for (const above of sorted) {
      if (above === it) continue
      // COMMENCE au-dessus (`y` plus petit) dans les mêmes colonnes — pas « finit avant que `it`
      // commence » : pendant un changement de hauteur (champ H, avant renumberRows) le widget
      // agrandi CHEVAUCHE transitoirement celui du dessous, qui serait sinon lu comme sans rien
      // au-dessus (profondeur 0) et remonté dans la première ligne. Dans une disposition valide
      // (sans chevauchement) les deux critères sont équivalents.
      if (above.y < it.y - 0.01 && overlapX(above, it)) {
        d = Math.max(d, (depth.get(above.i) ?? 0) + 1)
      }
    }
    depth.set(it.i, d)
  }
  const byDepth = new Map<number, GridItem[]>()
  for (const it of sorted) {
    const d = depth.get(it.i) ?? 0
    const row = byDepth.get(d) ?? []
    row.push(it)
    byDepth.set(d, row)
  }
  return Array.from(byDepth.entries())
    .sort(([a], [b]) => a - b)
    .map(([, row]) => row.slice().sort((a, b) => a.x - b.x))
}

/**
 * Recalcule `x`/`y` d'après des LIGNES explicites (jusqu'à `MAX_ROW_ITEMS` widgets côte à côte) —
 * panneau de structure, pas de coordonnées libres à la souris.
 *
 * `w` de chaque widget est CONSERVÉ tel quel (champ numérique du panneau, cf. `MIN_WIDGET_WIDTH`/
 * `MAX_WIDGET_WIDTH`) SAUF si la somme de la ligne dépasse `GRID_WIDTH` (12) — ce qui arrive
 * typiquement juste après avoir rejoint deux widgets pleine largeur — auquel cas elle est répartie
 * à parts égales comme point de départ ; l'utilisateur reprend ensuite la main sur chaque valeur.
 *
 * ⚠️ Un widget seul sur sa ligne ne bascule PAS automatiquement à 12 ici : cette fonction tourne à
 * CHAQUE réordonnancement/redimensionnement, y compris quand l'utilisateur réduit volontairement la
 * largeur d'un widget déjà seul (champ W du panneau) — l'y forcer en permanence rendrait ce
 * rétrécissement impossible (la valeur tapée revenait aussitôt à 100 %, cf. l'incident corrigé).
 * Le passage à 100 % au moment où un widget devient seul (extrait d'une ligne partagée) vit donc
 * UNE SEULE FOIS, côté `insertAsNewRow` ci-dessous — pas ici, qui doit rester un simple recalcul de
 * position neutre.
 *
 * `y` : chaque widget « flotte » vers le haut dans SES colonnes (ligne de ciel par colonne) — le
 * même rangement que GridStack (`float:false`) applique dans le dashboard. Avant (Mantis #0011020),
 * chaque ligne démarrait à `y` = somme des hauteurs de lignes précédentes (hauteur de ligne = son
 * widget le plus haut) : dès que deux voisins n'avaient plus la même hauteur (widget de gauche
 * agrandi à la souris → GridStack remonte le widget de droite du dessous sous son voisin), la
 * lecture par `y` identique donnait des « lignes » d'un seul widget, et ce recalcul en bandes les
 * REPOUSSAIT toutes sous le widget le plus haut (trous dans la grille, tuiles déplacées à chaque
 * ajout/retrait/réglage). Le rangement par colonnes est identique à l'ancien pour des lignes de
 * hauteurs égales, et laisse l'agencement décalé EN PLACE sinon.
 *
 * `x` : CONSERVÉ tel quel quand l'ordre du tableau correspond déjà à la lecture gauche→droite
 * (widgets sans chevauchement, dans les 12 colonnes) — un simple recalcul (ajout, retrait, champ H)
 * ne déplace alors rien, y compris un widget seul lâché à la souris dans la colonne de droite.
 * Sinon (réordonnancement, ligne rejointe, dépassement des 12 colonnes) : réempaqueté depuis la
 * colonne 0 dans l'ordre du tableau. Appelé après tout réordonnancement/ajout/retrait/changement de
 * ligne/de taille, AVANT `persist()`.
 */
export function renumberRows(rows: GridItem[][]): GridItem[] {
  // Ligne de ciel : bas (y + h) le plus bas atteint jusqu'ici dans chacune des 12 colonnes.
  const skyline: number[] = new Array<number>(GRID_WIDTH).fill(0)
  const out: GridItem[] = []
  for (const row of rows) {
    if (!row.length) continue
    const totalW = row.reduce((s, it) => s + Math.max(1, it.w), 0)
    // `w` reste CONTINU tant qu'on édite (cf. DashboardPage.setWidgetWidth) : une tolérance
    // (+0.01) absorbe le bruit d'arrondi flottant accumulé sur de nombreux ajustements successifs,
    // pour ne pas déclencher le repli « répartition égale » sur une ligne en réalité toujours à 12.
    const overflow = totalW > GRID_WIDTH + 0.01
    const evenWidths = ROW_COLUMN_WIDTHS[Math.min(row.length, MAX_ROW_ITEMS)] ?? ROW_COLUMN_WIDTHS[MAX_ROW_ITEMS]
    const keepX =
      !overflow &&
      row.every((it, i) => {
        const prevEnd = i === 0 ? 0 : row[i - 1].x + Math.max(1, row[i - 1].w)
        return it.x + 0.01 >= prevEnd && it.x + Math.max(1, it.w) <= GRID_WIDTH + 0.01
      })
    let nextX = 0
    row.forEach((it, i) => {
      const w = overflow ? evenWidths[Math.min(i, evenWidths.length - 1)] : Math.max(1, it.w)
      const x = keepX ? it.x : nextX
      // Bords ARRONDIS à la colonne la plus proche (pas floor/ceil) : deux voisins d'une ligne à
      // largeurs continues partagent EXACTEMENT la même frontière (ex. 4.5), arrondie pareil des
      // deux côtés → aucune colonne revendiquée par les deux, donc pas de fausse collision.
      const c0 = Math.max(0, Math.min(GRID_WIDTH - 1, Math.round(x)))
      const c1 = Math.max(c0 + 1, Math.min(GRID_WIDTH, Math.round(x + w)))
      let y = 0
      for (let c = c0; c < c1; c++) y = Math.max(y, skyline[c])
      out.push({ ...it, x, y, w })
      for (let c = c0; c < c1; c++) skyline[c] = y + Math.max(1, it.h)
      nextX = x + w
    })
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
 *  un widget hors d'une ligne partagée : le déposer dans un INTERSTICE plutôt que sur un widget.
 *
 *  `w` forcé à `GRID_WIDTH` ICI, UNE SEULE FOIS au moment de l'extraction — pas dans `renumberRows`
 *  (qui tourne à CHAQUE réordonnancement/redimensionnement et écraserait sinon en permanence un
 *  rétrécissement volontaire ultérieur du champ W du panneau, cf. son commentaire). Un widget qui
 *  garderait sa largeur d'avant (ex. 6, la moitié, héritée de la ligne partagée qu'il vient de
 *  quitter) laisserait un « trou » que GridStack (dashboard, `float:false`) comble en y tirant le
 *  widget suivant, qui semble alors rejoindre cette ligne au lieu de rester sur la sienne propre. */
export function insertAsNewRow(rows: GridItem[][], beforeKey: string | null, item: GridItem): GridItem[][] {
  const fullWidth = { ...item, w: GRID_WIDTH }
  if (beforeKey === null) return [...rows, [fullWidth]]
  const idx = rows.findIndex((r) => rowKey(r) === beforeKey)
  if (idx === -1) return [...rows, [fullWidth]]
  const next = rows.slice()
  next.splice(idx, 0, [fullWidth])
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
