/**
 * Piste basse (« runway ») réservée aux overlays flottants des modules — en pratique le bouton
 * rond de l'assistant MelisAI, fixé en bas à droite de la fenêtre. Sans elle il recouvre la
 * dernière ligne de N'IMPORTE quel outil : boutons de fin de formulaire, dernière ligne de liste,
 * pagination…
 *
 * POURQUOI CE MODULE EXISTE (et pas une simple classe CSS posée à la main) :
 * la plateforme n'a pas UN conteneur défilant mais un par famille d'outil — les panneaux du shell
 * (dashboard, outlet, listes persistantes), le conteneur propre d'une brique qui garde sa barre
 * d'onglets fixe et fait défiler le reste, et le document d'une iframe d'outil legacy. Aucun
 * sélecteur CSS ne désigne « la zone défilante de l'outil » (et un sélecteur large attraperait
 * aussi les petits panneaux internes : listes à `maxHeight`, corps de modale…). On la DÉSIGNE donc
 * au moment du rendu, ici, une fois pour toute la plateforme :
 *
 *  1. `--melis-overlay-runway` est posée sur <html> : 0 si aucun module ne pose d'overlay (rien
 *     n'est réservé, la plateforme est strictement comme avant).
 *  2. Toute zone défilante PLEINE HAUTEUR sous <main> reçoit la classe `melis-overlay-runway`,
 *     qui lui ajoute un `::after` de cette hauteur (cf. index.css) : la longueur DÉFILABLE
 *     augmente, la mise en page ne bouge pas. Tant que le contenu tient dans l'écran, rien n'est
 *     visible ; c'est seulement en bas de course que la dernière ligne vient se poser au-dessus
 *     du bouton flottant.
 *  3. Les outils legacy défilent dans leur PROPRE document : ZoneFrames applique la même valeur
 *     en `padding-bottom` sur le <body> de l'iframe (même origine).
 *
 * Le seuil de « pleine hauteur » (70 % de <main>) est ce qui distingue la zone défilante de
 * l'outil d'un petit panneau interne, sans avoir à connaître les outils.
 */

const CLASS = 'melis-overlay-runway'
const VAR = '--melis-overlay-runway'
/** Hauteur réservée : bouton flottant de 52px + sa marge de 20px, arrondi. */
const RUNWAY = '76px'
/** Une zone défilante n'est « celle de l'outil » que si elle occupe l'essentiel de la hauteur. */
const MIN_RATIO = 0.7

/**
 * Zone défilante VERTICALE bornée par la fenêtre — la seule qui puisse porter la piste.
 *
 * Deux pièges écartés ici :
 *  - `overflow-y` calculé vaut `auto` dès qu'on ne pose QUE `overflow-x: auto` (règle CSS : un axe
 *    non-`visible` force l'autre à `auto`). Le cadre à défilement horizontal d'un tableau large
 *    passerait donc pour un scroller vertical ;
 *  - un tel cadre est plus HAUT que la zone de contenu (c'est la page qui défile autour de lui) :
 *    une vraie zone défilante, elle, est bornée par la fenêtre. La comparaison de hauteur suffit
 *    à les distinguer, sans rien connaître des outils.
 */
function isScrollArea(el: HTMLElement, minHeight: number, maxHeight: number): boolean {
  if (el.clientHeight < minHeight || el.clientHeight > maxHeight) return false
  const overflow = getComputedStyle(el).overflowY
  return overflow === 'auto' || overflow === 'scroll'
}

/** Profondeur explorée sous <main> : panneau du shell → racine de brique → colonne → zone défilante. */
const MAX_DEPTH = 8

/**
 * Repère, pour chaque branche, la zone défilante pleine hauteur LA PLUS PROFONDE.
 *
 * Pourquoi la plus profonde et pas la première : le panneau du shell qui héberge une brique est
 * lui-même en `overflow-y: auto`, mais une brique qui garde sa barre d'onglets fixe occupe 100 %
 * de ce panneau et fait défiler un conteneur intérieur — c'est CELUI-LÀ qu'il faut allonger. Pour
 * un outil au fil du texte (aucune zone défilante interne), le plus profond EST le panneau du
 * shell : le même parcours couvre les deux cas.
 *
 * Coût maîtrisé : on élague sur `clientHeight` (lecture de layout, pas de style calculé) — un
 * élément trop court ne peut pas être la zone défilante de l'outil, et ses descendants non plus.
 * Les lignes d'une liste, les cartes, les champs sont donc écartés sans jamais être visités.
 */
function tag(root: HTMLElement, found: Set<HTMLElement>): void {
  const minHeight = root.clientHeight * MIN_RATIO
  const maxHeight = root.clientHeight
  const walk = (el: HTMLElement, depth: number, current: HTMLElement | null) => {
    if (depth >= MAX_DEPTH) { if (current) found.add(current); return }
    let descended = false
    for (const child of Array.from(el.children)) {
      // Sous-arbre caché (outil inactif, brique non montée) ou trop court : ses tailles valent 0
      // ou sont insuffisantes. Il sera repris quand il redeviendra visible (l'observateur le voit).
      if (!(child instanceof HTMLElement) || child.clientHeight < minHeight) continue
      descended = true
      walk(child, depth + 1, isScrollArea(child, minHeight, maxHeight) ? child : current)
    }
    // Bas de branche : la dernière zone défilante rencontrée est celle qui porte l'outil.
    if (!descended && current) found.add(current)
  }
  walk(root, 0, null)
}

/**
 * Les outils legacy défilent dans LEUR document : ni la variable CSS ni la classe ne les
 * atteignent depuis la page hôte. On y reporte donc la même hauteur en `padding-bottom` sur le
 * <body> — ces pages sont de même origine (c'est la plateforme qui les rend), et un padding est
 * sans effet tant que l'outil ne défile pas jusqu'en bas. Vaut pour TOUTES les iframes de la zone
 * de contenu : pool de zones, bascule « New / Old » d'un outil migré, iframe interne d'une brique.
 */
function applyToFrames(main: HTMLElement): void {
  for (const frame of Array.from(main.querySelectorAll('iframe'))) {
    const apply = () => {
      try {
        const body = frame.contentDocument?.body
        if (body) body.style.paddingBottom = overlayRunwayValue()
      } catch {
        // Document inaccessible (origine différente) : l'outil garde sa mise en page.
      }
    }
    // Le document d'une iframe n'est pas une mutation de `main` : l'observateur ne la verrait pas
    // finir de charger. Un écouteur posé UNE fois (drapeau dataset) couvre les chargements à venir,
    // y compris les rechargements du même élément.
    if (!frame.dataset.melisRunway) {
      frame.dataset.melisRunway = '1'
      frame.addEventListener('load', apply)
    }
    apply()
  }
}

/**
 * Applique la piste basse à toute la zone de contenu. Rendue idempotente : on la rejoue à chaque
 * mutation du DOM de `main` (changement d'outil, brique montée tardivement, sous-onglet ouvert).
 */
export function applyOverlayRunway(main: HTMLElement | null, enabled: boolean): void {
  document.documentElement.style.setProperty(VAR, enabled ? RUNWAY : '0px');
  if (!main) return;

  applyToFrames(main);

  const found = new Set<HTMLElement>();
  if (enabled) tag(main, found);

  // Retirer la classe des zones qui ne portent plus l'outil (outil fermé, panneau caché) avant de
  // la poser sur les zones courantes — sinon une brique démontée garderait sa piste.
  for (const el of Array.from(main.querySelectorAll<HTMLElement>('.' + CLASS))) {
    if (!found.has(el)) el.classList.remove(CLASS);
  }
  for (const el of found) el.classList.add(CLASS);
}

/** Hauteur courante de la piste, en pixels CSS — pour les documents qui ne peuvent pas hériter la variable (iframes). */
export function overlayRunwayValue(): string {
  return getComputedStyle(document.documentElement).getPropertyValue(VAR).trim() || '0px'
}
