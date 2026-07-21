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
 * Chrome du cadre React autour du contenu (WidgetFrame), en px : tout ce qui, dans la tuile, n'est
 * PAS l'iframe — en-tête + padding du corps + bordures.
 *
 * Valeur MESURÉE sur la grille (`hauteur de tuile − hauteur d'iframe`), constante à 95px sur tous
 * les widgets testés. Elle avait été estimée à 77px en additionnant les classes Tailwind, ce qui
 * rognait 18px de contenu sur CHAQUE tuile. Sous-estimer ici rogne le bas de tous les widgets.
 */
const FRAME_CHROME = 95

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
 * Convertit une hauteur de contenu MESURÉE (px) en nombre de lignes de la grille.
 *
 * Même arithmétique que `legacyRowsToGridRows`, mais nourrie par une vraie mesure du document du
 * plugin (cf. `__melisPluginHeight`) plutôt que par la taille qu'il DÉCLARE — laquelle est une
 * estimation calée sur la grille legacy, régulièrement trop courte (contenu rogné).
 *
 * Pas de `SAFETY_PX` ici : contrairement à la valeur déclarée, la mesure couvre déjà le contenu
 * réel ; la rembourrer ne ferait que réintroduire le vide qu'on cherche à supprimer.
 */
export function contentPxToGridRows(contentPx: number): number {
  // Relation MESURÉE sur la grille réelle (et non déduite de cellHeight/margin) :
  //   hauteur de tuile   = lignes × CELL_HEIGHT      (5→230, 8→368, 16→736, 17→782)
  //   hauteur d'iframe   = hauteur de tuile − FRAME_CHROME
  // L'ancienne formule ajoutait MARGIN au dénominateur (`CELL_HEIGHT + MARGIN`) : elle supposait
  // une gouttière PAR LIGNE qui n'existe pas dans la hauteur de l'élément, et sous-estimait donc
  // systématiquement la tuile — 802px de contenu tombaient sur 17 lignes, soit 687px utiles :
  // toujours rogné.
  const rows = (contentPx + FRAME_CHROME) / CELL_HEIGHT
  return Math.max(2, Math.ceil(rows))
}

