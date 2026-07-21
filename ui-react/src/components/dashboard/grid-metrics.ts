/**
 * Métriques de la grille du dashboard React + conversion des tailles déclarées par les
 * plugins dashboard LEGACY.
 *
 * Un plugin legacy déclare sa taille en unités de la grille du BO classique
 * (`config/dashboard-plugins/*.config.php` : `width` / `height`). Les colonnes sont les mêmes
 * (12), mais PAS la hauteur de cellule : gridstack.init.js du BO utilise `cellHeight: 80`,
 * alors qu'ici une ligne fait 46px. Reprendre `height` tel quel donne une tuile ~2× trop
 * courte → le contenu du plugin est coupé (ex. le calendrier : on ne voit que l'en-tête du
 * mois et la ligne des jours). D'où `legacyRowsToGridRows()`.
 */

export const GRID_COLS = 12
export const CELL_HEIGHT = 46
export const MARGIN = 8

/**
 * Chrome du cadre React autour du contenu (WidgetFrame) :
 *  - en-tête : `py-2.5` (2×10px) + la plus haute de ses lignes (boutons `size-6` = 24px)
 *              + la bordure basse (1px) = 45px
 *  - corps   : `p-4` (2×16px) = 32px
 * Sous-estimer cette valeur rend TOUTES les tuiles trop courtes d'autant (contenu rogné).
 */
const FRAME_CHROME = 45 + 32

/** Hauteur d'une cellule dans la grille du BO legacy (public/js/core/gridstack.init.js). */
const LEGACY_CELL_HEIGHT = 80

/**
 * Marge de sécurité, en px, ajoutée au budget de contenu.
 *
 * La hauteur déclarée par un plugin est un MINIMUM confortable dans le BO legacy, pas une
 * mesure : la grille legacy laisse en plus déborder la tuile (`.widget` sans overflow) et
 * les plugins s'appuient dessus. Chez nous le corps du widget est `overflow:auto` → tout ce
 * qui dépasse est coupé (le calendrier perdait sa dernière semaine). On surdimensionne donc
 * légèrement : mieux vaut un peu de blanc en bas qu'un contenu tronqué.
 */
const SAFETY_PX = 40

/**
 * Hauteur legacy « de référence » : celle que déclarent la quasi-totalité des plugins
 * (`'height' => 4`). On l'utilise comme PLANCHER pour tous, ce qui donne une hauteur
 * homogène à la grille (un plugin qui déclare plus garde sa taille).
 */
const LEGACY_BASE_ROWS = 4

/**
 * Convertit une hauteur déclarée en lignes legacy vers le nombre de lignes de NOTRE grille
 * offrant la même hauteur de contenu utile.
 */
export function legacyRowsToGridRows(legacyRows: number): number {
  const contentPx = Math.max(legacyRows, LEGACY_BASE_ROWS) * LEGACY_CELL_HEIGHT + SAFETY_PX
  return contentPxToGridRows(contentPx)
}

/**
 * Converts a MEASURED content height (px) into a row count for our grid.
 *
 * Same arithmetic as `legacyRowsToGridRows`, but fed by a real measurement of the plugin's
 * iframe document instead of the size the plugin DECLARES. Used to auto-fit a legacy widget
 * once its iframe has loaded (cf. LegacyPluginContent): the declared height is a legacy-grid
 * guess and is routinely too tall (empty space) or too short (clipped content).
 *
 * No SAFETY_PX here: unlike the declared value, the measurement already covers the real
 * content — padding it would just reintroduce the empty space we're removing. The `+1` row of
 * slack absorbs sub-pixel rounding and scrollbar-driven reflow.
 */
export function contentPxToGridRows(contentPx: number): number {
  const rows = (contentPx + FRAME_CHROME + MARGIN) / (CELL_HEIGHT + MARGIN)
  return Math.max(2, Math.ceil(rows))
}
