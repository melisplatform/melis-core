import { useRef, useState, type CSSProperties, type DragEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Ruler,
  Settings,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import { useIsNarrow } from '@/hooks/useIsNarrow'
import {
  insertAsNewRow,
  insertIntoRow,
  MAX_ROW_ITEMS,
  MAX_WIDGET_HEIGHT,
  MAX_WIDGET_WIDTH,
  MIN_WIDGET_HEIGHT,
  MIN_WIDGET_WIDTH,
  removeItem,
  reorderWithinRow,
  rowKey,
  widgetIdOf,
  type DragPayload,
  type GridItem,
} from './dashboard-store'
import type { WidgetDef } from './widget-registry'
import { WidgetConfigDialog } from './WidgetConfigDialog'
import { PluginConfirmDialog } from './PluginConfirmDialog'
import { WidgetAddModal } from './WidgetAddModal'

const PANEL_COLLAPSED_KEY = 'melis-dash-panel-collapsed'

/** Bord d'une carte survolé pendant un glisser (cf. zoneOf) : gauche/droite = rejoindre la ligne
 *  avant/après cette carte ; haut/bas = nouvelle ligne au-dessus/en dessous. */
type DropZone = 'left' | 'right' | 'top' | 'bottom'

/*
 * Miniature PROPORTIONNELLE du dashboard : chaque carte du panneau reproduit la taille RÉELLE de
 * sa tuile dans la grille (même `w` en colonnes sur 12, même `h` en lignes de grille), pour que
 * redimensionner un widget — à la souris dans le dashboard ou via les champs W/H ci-dessous — se
 * reflète aussitôt ici, comme une copie réduite. Avant, toutes les cartes d'une ligne se
 * partageaient la largeur à parts égales et avaient la même hauteur, quelle que soit la tuile.
 */
/** Gouttière de la mini-grille, en px (entre colonnes ET entre lignes) — l'équivalent réduit de
 *  la marge de 8px de la grille du dashboard. */
const PANEL_GRID_GAP_PX = 6
/** Marge haute/basse autour de la mini-grille, en px : laisse la place à la barre de dépôt du
 *  tout premier / tout dernier interstice (cf. dropGap, 8px de haut, centrée sur la ligne). */
const PANEL_GRID_PAD_PX = 8
/** Échelle verticale FIXE de la miniature : px par ligne de grille (46px dans le dashboard, soit
 *  ≈ 1/5). Fixe, pour que les hauteurs restent comparables d'un dashboard à l'autre — une tuile
 *  courte donne une carte COMPACTE (cf. PANEL_COMPACT_BELOW_PX) plutôt que de dilater l'échelle. */
const PANEL_PX_PER_GRID_ROW = 9
/** En dessous de cette hauteur de carte (px), la carte passe en mode COMPACT : une seule ligne,
 *  les boutons (règle / config / retirer) à droite de l'en-tête au lieu d'une barre en bas. */
const PANEL_COMPACT_BELOW_PX = 80
/** Colonnes à partir desquelles une carte COMPACTE a la place d'afficher son titre (les boutons
 *  occupent ≈ 72px de l'en-tête). En dessous, l'icône seule + infobulle. */
const PANEL_TITLE_MIN_COLS_COMPACT = 9
/** Colonnes en dessous desquelles les 3 boutons d'action (règle / config / retirer) n'ont plus la
 *  place de tenir — SEUIL DIFFÉRENT selon où ils s'affichent (retour DEKRA #0011020 : illisibles/
 *  chevauchants sur les cartes étroites, PUIS retour utilisateur : des cartes pourtant assez
 *  larges pour les 3 boutons se repliaient quand même) :
 *   - carte NORMALE (barre du bas séparée, cf. PANEL_COMPACT_BELOW_PX) : les 3 boutons (≈ 76px +
 *     gouttières) sont SEULS dans leur rangée, sans concurrence — tiennent dès 4 colonnes
 *     (≈ 104px, ≈ 84px de zone utile une fois le padding de la carte déduit).
 *   - carte COMPACTE (poignée + vignette + les 3 boutons TOUS dans l'en-tête, une seule ligne) :
 *     il faut EN PLUS la place de la poignée (20px) et de la vignette (28px) + leurs gouttières
 *     → seuil bien plus haut (≈ 160px de zone utile), 7 colonnes. */
const PANEL_BUTTONS_COLLAPSE_BELOW_COLS_NORMAL = 4
const PANEL_BUTTONS_COLLAPSE_BELOW_COLS_COMPACT = 7
/** Colonnes (sur 12) à partir desquelles la carte est assez large pour afficher son titre (≈ 130px
 *  sur un panneau de 340px). En dessous, l'icône seule l'identifie et le nom passe en infobulle —
 *  même seuil qu'avant (3 widgets égaux = 4 colonnes → masqué ; 2 = 6 colonnes → affiché), mais
 *  fondé désormais sur la largeur RÉELLE de la carte et non sur le nombre de voisins. */
const PANEL_TITLE_MIN_COLS = 5
/** Colonnes en dessous desquelles les champs W/H s'empilent (H sous W) faute de place côte à côte. */
const PANEL_STACK_FIELDS_BELOW_COLS = 8

function readPayload(e: DragEvent): DragPayload | null {
  try {
    return JSON.parse(e.dataTransfer.getData('text/plain')) as DragPayload
  } catch {
    return null
  }
}

/**
 * Panneau de structure du dashboard — équivalent du panneau droit de l'éditeur de page
 * (EditionCanvas.tsx, melis-cms) : UNE seule zone continue listant tous les widgets posés (pas
 * de lignes visuellement distinctes, pas de bouton dédié « rejoindre »/« éclater ») — on
 * MANIPULE directement les widgets par glisser-déposer pour décider où ils vont :
 *   - déposer un widget DANS L'INTERSTICE entre deux groupes → nouvelle ligne pleine largeur
 *     à cet endroit (l'empile, comme une réorganisation de liste classique) ;
 *   - déposer un widget SUR un autre → les met côte à côte (le rejoint dans sa ligne, jusqu'à
 *     `MAX_ROW_ITEMS`) ; déposer sur un widget de SA PROPRE ligne réordonne juste gauche/droite.
 * Un bouton « + » d'en-tête ouvre le catalogue en modale (cf. WidgetAddModal).
 *
 * Desktop : colonne fixe, repliable en bandeau étroit. Mobile : tiroir plein écran + bouton
 * flottant. Le glisser-déposer HTML5 n'existe pas au toucher (par spécification) — au doigt,
 * seul le réordonnancement DANS une ligne existante (via la poignée) n'est donc pas disponible ;
 * ajouter un nouveau widget reste possible (catalogue), tout comme le retirer/configurer.
 */
export function DashboardStructurePanel({
  rows,
  widgetMap,
  onRowsChange,
  onRemove,
  onAdd,
  onSetHeight,
  onSetWidth,
  onRemoveAll,
  present,
  nativeWidgets,
  extraWidgets,
  onHighlight,
}: {
  rows: GridItem[][]
  widgetMap: Record<string, WidgetDef>
  onRowsChange: (next: GridItem[][]) => void
  onRemove: (instanceId: string) => void
  onAdd: (widgetId: string) => void
  onSetHeight: (instanceId: string, rows: number) => void
  onSetWidth: (instanceId: string, cols: number) => void
  onRemoveAll: () => void
  present: Set<string>
  nativeWidgets: WidgetDef[]
  extraWidgets: WidgetDef[]
  /** Flashe + scrolle ce widget en vue dans le dashboard — cf. clic sur la carte ci-dessous. */
  onHighlight: (instanceId: string) => void
}) {
  const itemCount = rows.reduce((n, r) => n + r.length, 0)
  const { t } = useI18n()
  const narrow = useIsNarrow()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(PANEL_COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })
  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v
      try {
        localStorage.setItem(PANEL_COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const [addOpen, setAddOpen] = useState(false)
  const [addEverOpened, setAddEverOpened] = useState(false)
  const openAdd = () => {
    setAddEverOpened(true)
    setAddOpen(true)
  }

  const [configFor, setConfigFor] = useState<{ instanceId: string; pluginName?: string; title: string } | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<{ instanceId: string; label: string } | null>(null)
  // Carte trop étroite pour ses 3 boutons séparés (cf. PANEL_BUTTONS_COLLAPSE_BELOW_COLS) : lequel a
  // son menu « ⋯ » ouvert, avec de quoi construire ses 3 actions (même ancrage par bord droit que
  // les autres popovers ancrés à un bouton de ce fichier/l'éditeur de page).
  const [overflowMenuFor, setOverflowMenuFor] = useState<{ instanceId: string; pluginName?: string; title: string; right: number; y: number } | null>(null)

  // Champs largeur/hauteur repliés par défaut (comme le toggle de largeur responsive de l'éditeur
  // de page, EditionCanvas.tsx) — l'icône « règle » les révèle à la demande, pour ne pas imposer
  // deux champs numériques en permanence sur chaque widget.
  const [sizeOpenFor, setSizeOpenFor] = useState<Set<string>>(new Set())
  const toggleSizeOpen = (instanceId: string) =>
    setSizeOpenFor((cur) => {
      const next = new Set(cur)
      if (next.has(instanceId)) next.delete(instanceId)
      else next.add(instanceId)
      return next
    })

  // Brouillon LOCAL des champs W/H pendant la frappe, clé = id d'instance — le champ AFFICHE ce
  // texte tel quel (pas la valeur dérivée de `item.w`/`item.h`) tant qu'il est présent, MAIS
  // applique quand même la valeur EN DIRECT à chaque frappe (le plugin s'ajuste tout de suite,
  // pas besoin de Entrée/blur). Sans ce brouillon, chaque frappe déclenchait `onChange` → persist
  // → re-rendu avec la valeur ARRONDIE (le pourcentage n'a que 12 valeurs exactes possibles)
  // AUSSITÔT réinjectée dans le champ contrôlé — le curseur/la saisie se faisaient constamment
  // écraser par cette valeur dérivée, donnant l'impression que le champ « ne bougeait pas ». Le
  // brouillon n'est effacé qu'AU BLUR (ou Entrée), pour que le champ se cale alors sur la valeur
  // canonique (arrondie) — le temps de la frappe, il reste fidèle à ce que l'utilisateur tape.
  const [widthDraft, setWidthDraft] = useState<Record<string, string>>({})
  const [heightDraft, setHeightDraft] = useState<Record<string, string>>({})
  // Champ W en colonnes NATIVES (1-12, cf. GRID_WIDTH) — pas en pourcentage : GridStack n'a que 12
  // colonnes en interne, un pas de pourcentage (1/100 de ligne) est donc plus petit qu'1/12 et se
  // perdait dans l'arrondi avant même d'atteindre la grille, ce qui donnait l'impression que le
  // widget ne bougeait pas tant que plusieurs frappes ne s'étaient pas cumulées jusqu'à franchir
  // le prochain palier de colonne. En travaillant directement en colonnes, chaque pas EST un palier
  // représentable → effet immédiat sur le dashboard.
  const applyWidthDraft = (id: string, raw: string) => {
    const n = Math.round(Number(raw))
    if (Number.isFinite(n)) onSetWidth(id, Math.max(MIN_WIDGET_WIDTH, Math.min(MAX_WIDGET_WIDTH, n)))
  }
  // Champ H en lignes de grille NATIVES (2-`MAX_WIDGET_HEIGHT`), même principe que W ci-dessus :
  // pas de conversion pourcentage, chaque pas de la saisie correspond directement à une ligne de
  // grille réelle, appliquée immédiatement au widget.
  const applyHeightDraft = (id: string, raw: string) => {
    const n = Math.round(Number(raw))
    if (Number.isFinite(n)) onSetHeight(id, Math.max(MIN_WIDGET_HEIGHT, Math.min(MAX_WIDGET_HEIGHT, n)))
  }
  const clearWidthDraft = (id: string) =>
    setWidthDraft((d) => {
      if (!(id in d)) return d
      const next = { ...d }
      delete next[id]
      return next
    })
  const clearHeightDraft = (id: string) =>
    setHeightDraft((d) => {
      if (!(id in d)) return d
      const next = { ...d }
      delete next[id]
      return next
    })

  // Interstice survolé pendant un glisser (index dans `rows`, `rows.length` = tout en bas) —
  // purement visuel (surbrillance de la ligne d'insertion), aucune donnée n'en dépend.
  const [dragOverGap, setDragOverGap] = useState<number | null>(null)
  // Widget EN COURS de glisser (son `i`) — purement visuel (la carte s'estompe pendant le geste,
  // repère habituel de « ceci est en train d'être déplacé »), aucune donnée n'en dépend.
  const [draggingId, setDraggingId] = useState<string | null>(null)

  // ⚠️ Toujours effacer `draggingId` ICI, à la RÉCEPTION du dépôt — jamais en ne comptant QUE sur
  // `onDragEnd` de la poignée d'origine. Un dépôt qui déplace effectivement le widget change la
  // composition de sa ligne d'origine → sa clé (`rowKey`) change → React DÉMONTE tout le sous-arbre
  // de cette ligne pour la remonter neuve → la poignée qui portait `onDragEnd` n'existe plus, cet
  // événement ne se déclenche donc jamais sur elle → la carte restait vue comme « en cours de
  // glisser » (estompée) indéfiniment après un déplacement réussi.
  const dropAsNewRow = (gapIndex: number, payload: DragPayload) => {
    setDraggingId(null)
    const targetRow = gapIndex < rows.length ? rows[gapIndex] : null
    // Repère la ligne cible par sa clé APRÈS retrait du widget glissé — pas avant. Quand le
    // widget glissé fait partie de CETTE MÊME ligne (déposé dans l'interstice juste au-dessus
    // d'une ligne qu'il partage avec d'autres, pour l'en extraire), la clé de la ligne AVANT
    // retrait inclut encore ce widget ; une fois retiré, plus aucune ligne ne correspond à cette
    // clé (sa composition a changé) et `insertAsNewRow` retombait sur son repli « fin de liste »
    // — le widget atterrissait tout en bas au lieu de rester juste au-dessus de sa ligne d'origine.
    const beforeKey = targetRow
      ? rowKey(gapIndex === payload.rowIndex ? targetRow.filter((_, i) => i !== payload.itemIndex) : targetRow)
      : null
    const { rows: withoutItem, item } = removeItem(rows, payload.rowIndex, payload.itemIndex)
    if (item) onRowsChange(insertAsNewRow(withoutItem, beforeKey, item))
  }

  // Dépôt « libre » : la liste ENTIÈRE accepte le dépôt, pas seulement les cartes et les fins
  // interstices de 8px entre les lignes (trop petits pour être visés : lâcher un widget dans le
  // vide — sous la dernière ligne, entre deux cartes, à droite d'une ligne — ne faisait RIEN, et
  // l'utilisateur en concluait qu'on ne peut déposer QUE sur une autre carte). Le conteneur sert de
  // filet : tout dépôt qu'aucune carte/espace libre/interstice n'a intercepté est rabattu sur
  // l'interstice le PLUS PROCHE verticalement du pointeur (nouvelle ligne pleine largeur à cet
  // endroit), et l'interstice concerné est surligné pendant le survol pour l'annoncer.
  const listRef = useRef<HTMLDivElement>(null)
  const nearestGap = (clientY: number): number | null => {
    const root = listRef.current
    if (!root) return null
    let best: number | null = null
    let bestDist = Infinity
    root.querySelectorAll<HTMLElement>('[data-testid^="widget-gap-"]').forEach((el) => {
      const r = el.getBoundingClientRect()
      const dist = Math.abs(clientY - (r.top + r.height / 2))
      if (dist < bestDist) {
        bestDist = dist
        best = Number(el.dataset.testid?.slice('widget-gap-'.length))
      }
    })
    return best
  }
  // Espace libre (colonnes non occupées) d'une ligne survolé pendant un glisser — visuel seulement.
  // Clé `${rowIndex}:${insertBefore}` : une ligne peut avoir PLUSIEURS espaces libres (avant un
  // widget décalé vers la droite dans le dashboard, et après le dernier), cf. rowSpacer.
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null)
  // Carte survolée pendant un glisser (« déposer ici = se mettre côte à côte ») — visuel seulement.
  const [dragOverItem, setDragOverItem] = useState<{ id: string; zone: DropZone } | null>(null)
  // Zone de dépôt SUR une carte, d'après la position du pointeur : bande haute / basse (25 %) →
  // NOUVELLE LIGNE au-dessus / en dessous de cette carte ; sinon moitié gauche / droite → REJOINT
  // la ligne de la carte, juste avant / juste après elle. Les quatre gestes restent donc possibles
  // sur n'importe quelle carte, sans viser les fines barres d'interstice.
  const zoneOf = (e: DragEvent<HTMLElement>): DropZone => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / Math.max(1, r.width)
    const py = (e.clientY - r.top) / Math.max(1, r.height)
    if (py < 0.25) return 'top'
    if (py > 0.75) return 'bottom'
    return px < 0.5 ? 'left' : 'right'
  }
  const clearDragVisuals = () => {
    setDragOverGap(null)
    setDragOverSlot(null)
    setDragOverItem(null)
  }
  // Dépôt dans un espace libre d'une ligne : le widget REJOINT cette ligne à cette position —
  // `insertBefore` = index du widget qui se trouvera à sa droite (`row.length` = tout à droite).
  // C'est ce que l'espace vide suggère : « il y a de la place ici ». Ligne déjà pleine
  // (MAX_ROW_ITEMS) : repli sur une nouvelle ligne juste en dessous — le geste produit toujours un
  // résultat visible plutôt qu'un dépôt silencieusement ignoré.
  // `atX` : colonne de DÉPART de l'espace libre visé (cf. rowSpacer/freeRegions). Sans elle, un
  // widget SEUL sur sa ligne lâché dans l'espace libre à sa gauche ne bougeait pas : `reorderWithinRow`
  // (0 → 0) est un no-op, `renumberRows` conserve alors `x` tel quel (keepX) — « je n'arrive pas à
  // déplacer le plugin vers la gauche » (rapport utilisateur). On pose donc explicitement le widget
  // au début de l'espace libre où il a été déposé ; si sa largeur y déborde sur un voisin,
  // `renumberRows` retombe sur son réempaquetage gauche→droite.
  const placeAt = (next: GridItem[][], rowIdx: number, instanceId: string, atX: number | undefined) =>
    atX === undefined ? next : next.map((r, i) => (i === rowIdx ? r.map((it) => (it.i === instanceId ? { ...it, x: atX } : it)) : r))
  const dropAtRowSlot = (rowIndex: number, insertBefore: number, payload: DragPayload, atX?: number) => {
    setDraggingId(null)
    const row = rows[rowIndex]
    if (!row) return
    const moving = rows[payload.rowIndex]?.[payload.itemIndex]
    if (!moving) return
    if (payload.rowIndex === rowIndex) {
      // Même ligne : l'index cible se décale d'un cran quand le widget vient de la GAUCHE du point
      // d'insertion (son retrait fait glisser tout ce qui suit d'une position).
      const to = payload.itemIndex < insertBefore ? insertBefore - 1 : insertBefore
      onRowsChange(placeAt(reorderWithinRow(rows, rowIndex, payload.itemIndex, to), rowIndex, moving.i, atX))
      return
    }
    if (row.length >= MAX_ROW_ITEMS) {
      dropAsNewRow(rowIndex + 1, payload)
      return
    }
    const targetKey = rowKey(row)
    const { rows: withoutItem, item } = removeItem(rows, payload.rowIndex, payload.itemIndex)
    if (!item) return
    // `insertIntoRow` ajoute en FIN de ligne ; on ramène ensuite le widget à la position visée. La
    // ligne cible se retrouve par son contenu (la suppression a pu faire disparaître des lignes
    // vidées, donc décaler les index).
    const joined = insertIntoRow(withoutItem, targetKey, item)
    const idx = joined.findIndex((r) => r.some((it) => it.i === item.i))
    if (idx === -1) return
    onRowsChange(placeAt(reorderWithinRow(joined, idx, joined[idx].length - 1, Math.min(insertBefore, joined[idx].length - 1)), idx, item.i, atX))
  }
  // Espace libre d'une ligne, À L'ÉCHELLE (`cols` colonnes sur 12, comme les cartes) : reproduit
  // dans le panneau le vide que le widget laisse dans le dashboard — à sa gauche quand il est
  // décalé vers la droite (x > 0 sans voisin : un widget seul lâché à la souris dans la colonne
  // de droite du dashboard doit apparaître à DROITE ici aussi, pas collé à gauche), et à sa droite
  // quand la ligne ne remplit pas 12 colonnes. Aussi une cible de dépôt (cf. dropAtRowSlot).
  const rowSpacer = (rowIndex: number, insertBefore: number, c0: number, style: CSSProperties) => {
    const slot = `${rowIndex}:${insertBefore}`
    return (
      <div
        key={`spacer-${slot}`}
        data-testid={`widget-spacer-${slot}`}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (dragOverSlot !== slot) {
            setDragOverGap(null)
            setDragOverItem(null)
            setDragOverSlot(slot)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          clearDragVisuals()
          const payload = readPayload(e)
          if (payload) dropAtRowSlot(rowIndex, insertBefore, payload, c0)
        }}
        // Bordure transparente EN LIGNE hors glisser : la classe `border-transparent` seule était
        // écrasée par la feuille Tailwind d'une brick de module (chargée après celle de l'hôte, même
        // couche, cf. le piège « brick CSS overrides host utilities ») — les espaces libres restaient
        // dessinés en pointillés en permanence, le panneau paraissait « cassé » (rapport utilisateur).
        style={{ ...style, ...(draggingId === null ? { borderColor: 'transparent', background: 'transparent' } : {}) }}
        className={cn(
          'relative min-h-0 min-w-0 rounded-lg border border-dashed transition-colors',
          // Visibles dès qu'un glisser est en cours (carrés bleus pointillés = « déposable ici »),
          // renforcés au survol — comme les repères de dépôt d'avant.
          draggingId === null ? 'border-transparent' : dragOverSlot === slot ? 'border-primary bg-primary/10' : 'border-primary/40 bg-primary/5',
        )}
      />
    )
  }


  // Collapsed desktop : simple bandeau, juste un bouton pour ré-ouvrir.
  if (!narrow && collapsed) {
    return (
      <div className="flex w-10 shrink-0 flex-col items-center border-l border-border bg-card py-3">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={t('widget.panel_expand')}
          title={t('widget.panel_expand')}
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>
    )
  }

  // Interstice de dépôt entre deux groupes (et un dernier tout en bas) — déposer un widget ici en
  // fait une NOUVELLE ligne pleine largeur à cet endroit. Surbrillance au survol pour indiquer où
  // il atterrira, comme un point d'insertion de liste classique.
  const dropGap = (gapIndex: number, style: CSSProperties) => (
    <div
      key={`gap-${gapIndex}`}
      data-testid={`widget-gap-${gapIndex}`}
      // `stopPropagation` : le conteneur (cf. listRef) gère aussi ces événements en filet — sans
      // l'arrêt ici, un dépôt sur l'interstice remontait jusqu'à lui et était traité DEUX fois.
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (dragOverGap !== gapIndex) setDragOverGap(gapIndex)
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        clearDragVisuals()
        const payload = readPayload(e)
        if (payload) dropAsNewRow(gapIndex, payload)
      }}
      // Fond transparent EN LIGNE hors glisser — même raison que rowSpacer (classe écrasable par la
      // feuille d'une brick).
      style={{ ...style, marginLeft: 4, marginRight: 4, ...(draggingId === null ? { background: 'transparent', boxShadow: 'none' } : {}) }}
      className={cn(
        'relative z-10 rounded-full transition-colors',
        draggingId === null ? 'bg-transparent' : dragOverGap === gapIndex ? 'bg-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]' : 'bg-primary/25',
      )}
    />
  )

  // Boutons d'une carte (règle W/H, configurer, retirer) — dans la barre du BAS d'une carte
  // normale, ou À DROITE de l'en-tête d'une carte COMPACTE (tuile courte, cf. PANEL_COMPACT_BELOW_PX).
  // Carte trop étroite (cf. PANEL_BUTTONS_COLLAPSE_BELOW_COLS) : un seul bouton « ⋯ » ouvre les 3
  // actions dans un petit menu porté, plutôt que 3 ronds qui se chevauchent.
  // `btnsCollapsed` : calculé PAR L'APPELANT (cf. plus bas), qui seul sait si la carte est compacte
  // ou non — le seuil de repli diffère selon le cas (cf. les 2 constantes ci-dessus).
  const actionButtons = (item: GridItem, def: WidgetDef, title: string, btnsCollapsed: boolean) => {
    const sizeOpen = sizeOpenFor.has(item.i)
    if (btnsCollapsed) {
      return (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
            setOverflowMenuFor((m) =>
              m?.instanceId === item.i
                ? null
                : { instanceId: item.i, pluginName: def.pluginName, title, right: Math.max(8, window.innerWidth - r.right), y: r.bottom + 4 },
            )
          }}
          className={cn(
            'grid size-6 shrink-0 place-items-center rounded-full transition-colors',
            overflowMenuFor?.instanceId === item.i
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground/60 hover:bg-accent hover:text-foreground',
          )}
          aria-label={t('widget.more_actions')}
          aria-haspopup="menu"
          aria-expanded={overflowMenuFor?.instanceId === item.i}
          title={t('widget.more_actions')}
        >
          <MoreHorizontal className="size-3.5" />
        </button>
      )
    }
    return (
      <>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              toggleSizeOpen(item.i)
            }}
            className={cn(
              'grid size-6 place-items-center rounded-full transition-colors',
              sizeOpen
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground/60 hover:bg-accent hover:text-foreground',
            )}
            aria-label={t('widget.size_toggle')}
            aria-pressed={sizeOpen}
            title={t('widget.size_toggle')}
          >
            <Ruler className="size-3.5" />
          </button>
          <span className="flex-1" />
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              setConfigFor({ instanceId: item.i, pluginName: def.pluginName, title })
            }}
            className="grid size-6 place-items-center rounded-full text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
            aria-label={t('layout.widget_configure')}
            title={t('layout.widget_configure')}
          >
            <Settings className="size-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              setConfirmRemove({ instanceId: item.i, label: title })
            }}
            className="grid size-6 place-items-center rounded-full text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={t('layout.widget_remove')}
            title={t('layout.widget_remove')}
          >
            <X className="size-4" />
          </button>
      </>
    )
  }

  // ── Mini-grille À L'ÉCHELLE (Mantis #0011020) ────────────────────────────────────────────────
  // Le panneau est une COPIE réduite du dashboard : grille CSS de 12 colonnes, chaque carte posée
  // exactement aux x/y/w/h de sa tuile (même position, même largeur, même hauteur, en proportion).
  // Les cibles de dépôt (interstices entre lignes, espaces libres) sont des CALQUES absolus calculés
  // depuis les mêmes coordonnées ; les opérations de glisser-déposer, elles, continuent de raisonner
  // en LIGNES (`rows`, cf. groupIntoRows) — rien ne change côté données.
  const GAP = PANEL_GRID_GAP_PX
  const PAD = PANEL_GRID_PAD_PX
  const allItems = rows.flat()
  const gx = (it: GridItem) => Math.max(0, Math.min(MAX_WIDGET_WIDTH - 1, Math.round(it.x)))
  const gw = (it: GridItem) => Math.max(1, Math.min(MAX_WIDGET_WIDTH - gx(it), Math.round(it.w)))
  const gy = (it: GridItem) => Math.max(0, Math.round(it.y))
  const gh = (it: GridItem) => Math.max(1, Math.round(it.h))
  const rowPx = PANEL_PX_PER_GRID_ROW
  const spanHeight = (n: number) => n * rowPx + (n - 1) * GAP
  // Par ligne (au sens groupIntoRows) : bande verticale couverte et colonnes libres dedans.
  const rowBands = rows.map((row) => ({
    top: Math.min(...row.map(gy)),
    bottom: Math.max(...row.map((it) => gy(it) + gh(it))),
  }))
  const freeRegions = rows.flatMap((row, rowIndex) => {
    const band = rowBands[rowIndex]
    const occupied = new Array<boolean>(MAX_WIDGET_WIDTH).fill(false)
    for (const it of allItems) {
      if (gy(it) >= band.bottom || gy(it) + gh(it) <= band.top) continue
      for (let c = gx(it); c < gx(it) + gw(it); c++) occupied[c] = true
    }
    const regions: { rowIndex: number; c0: number; n: number; insertBefore: number }[] = []
    for (let c = 0; c < MAX_WIDGET_WIDTH; c++) {
      if (occupied[c]) continue
      let n = 1
      while (c + n < MAX_WIDGET_WIDTH && !occupied[c + n]) n++
      regions.push({ rowIndex, c0: c, n, insertBefore: row.filter((it) => gx(it) < c).length })
      c += n - 1
    }
    return regions
  })
  // Interstices : ligne 0, puis le bas de chaque ligne (dernier = tout en bas).
  const gapLines = [0, ...rowBands.map((b) => b.bottom)]
  // ⚠️ Les calques de dépôt sont des ITEMS DE LA GRILLE (gridColumn/gridRow), pas des calques
  // absolus calculés en px : une carte plus haute que sa tuile (en-tête + boutons ne tiennent pas
  // dans un span court, champs W/H ouverts…) ÉTIRE sa ligne de grille, et un calque positionné en
  // px d'après l'échelle nominale se retrouvait alors À CHEVAL sur la carte. Posés dans la grille,
  // ils suivent les pistes réelles quoi qu'il arrive. Une barre d'interstice vit dans la piste
  // qu'elle borde (alignée sur son bord bas, ou haut pour la toute première) et déborde de la
  // moitié de la gouttière pour se centrer sur la ligne.
  const BAR = 8
  const gapStyle = (line: number): CSSProperties =>
    line === 0
      ? { gridColumn: '1 / -1', gridRow: '1', alignSelf: 'start', height: BAR, marginTop: -(GAP / 2 + BAR / 2) }
      : { gridColumn: '1 / -1', gridRow: String(line), alignSelf: 'end', height: BAR, marginBottom: -(GAP / 2 + BAR / 2) }

  const panel = (
    <aside
      className={cn(
        'flex h-full min-w-0 flex-col border-l border-border bg-card',
        narrow ? 'w-full' : 'w-[340px] shrink-0',
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="flex items-center gap-2 font-[var(--font-display)] text-sm font-semibold">
          <LayoutGrid className="size-4 text-muted-foreground" />
          {t('widget.panel_title')}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openAdd}
            className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
            aria-label={t('widget.add')}
            title={t('widget.add')}
          >
            <Plus className="size-4" />
          </button>
          {narrow ? (
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={t('layout.close')}
            >
              <X className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={t('widget.panel_collapse')}
              title={t('widget.panel_collapse')}
            >
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={listRef}
        data-testid="widget-list"
        // Filet de dépôt sur toute la liste (cf. nearestGap) : ce qui n'a été intercepté ni par une
        // carte, ni par l'espace libre d'une ligne, ni par un interstice atterrit dans l'interstice
        // le plus proche du pointeur. Les enfants qui gèrent eux-mêmes le dépôt arrêtent la
        // propagation, on ne voit donc ici QUE les dépôts « dans le vide ».
        onDragOver={(e) => {
          e.preventDefault()
          const gap = nearestGap(e.clientY)
          setDragOverSlot(null)
          setDragOverItem(null)
          if (gap !== dragOverGap) setDragOverGap(gap)
        }}
        onDragLeave={(e) => {
          // Ne réagir qu'à la SORTIE de la liste — `dragleave` se déclenche aussi à chaque passage
          // d'un enfant à l'autre, ce qui ferait clignoter la surbrillance.
          const next = e.relatedTarget as Node | null
          if (!next || !e.currentTarget.contains(next)) clearDragVisuals()
        }}
        onDrop={(e) => {
          e.preventDefault()
          clearDragVisuals()
          const payload = readPayload(e)
          const gap = nearestGap(e.clientY)
          if (payload && gap !== null) dropAsNewRow(gap, payload)
        }}
        className="flex-1 space-y-1 overflow-y-auto p-2"
      >
        {itemCount === 0 && (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">{t('widget.empty')}</p>
        )}
        {itemCount > 0 && (
        <div className="relative" style={{ paddingTop: PAD, paddingBottom: PAD }}>
          <div
            data-testid="widget-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gridAutoRows: `minmax(${rowPx}px, auto)`, gap: GAP }}
          >
            {/* Calques de dépôt (items de grille, cf. gapStyle) : barre « nouvelle ligne » sur
                chaque ligne de grille qui sépare deux lignes (et tout en haut / en bas), zones
                d'espace LIBRE (colonnes qu'aucune tuile ne couvre sur la bande de la ligne) pour
                « rejoindre cette ligne ici » (cf. dropAtRowSlot). Rendus AVANT les cartes : une
                carte reste au-dessus d'une barre qui déborde d'un pixel sur elle. */}
            {gapLines.map((line, gapIndex) => dropGap(gapIndex, gapStyle(line)))}
            {freeRegions.map((r) =>
              rowSpacer(r.rowIndex, r.insertBefore, r.c0, {
                gridColumn: `${r.c0 + 1} / span ${r.n}`,
                gridRow: `${rowBands[r.rowIndex].top + 1} / span ${rowBands[r.rowIndex].bottom - rowBands[r.rowIndex].top}`,
              }),
            )}
            {rows.flatMap((row, rowIndex) =>
              row.map((item, itemIndex) => {
                const def = widgetMap[widgetIdOf(item.i)]
                if (!def) return null
                const title = def.titleLabel ?? t(def.titleKey)
                const sizeOpen = sizeOpenFor.has(item.i)
                // Largeur réelle de la tuile (colonnes sur 12) : sert aussi à décider si le titre
                // tient (cf. PANEL_TITLE_MIN_COLS) et si les champs W/H s'empilent.
                const cols = gw(item)
                // Tuile courte → carte COMPACTE (une ligne, boutons dans l'en-tête), sinon la barre de
                // boutons reste en bas (mt-auto) et l'espace libre s'étire entre les deux.
                const compact = spanHeight(gh(item)) < PANEL_COMPACT_BELOW_PX
                // Carte trop étroite pour ses 3 boutons séparés : le bouton « ⋯ », seul contenu de sa
                // rangée, est alors CENTRÉ plutôt que collé à un bord — plaqué à gauche (barre du bas)
                // ou à droite (en-tête compact), il avait l'air d'un point isolé, décroché du reste de
                // la carte (retour utilisateur : « we need to center the button »). Seuil DIFFÉRENT
                // selon `compact` (cf. les 2 constantes) : une carte normale n'a que les 3 boutons,
                // seuls, dans la barre du bas (tient dès 4 colonnes) ; une carte compacte doit EN PLUS
                // loger poignée + vignette dans la MÊME rangée (ne tient qu'à partir de 7) — avec un
                // seuil unique, des cartes pourtant assez larges pour la barre du bas se repliaient
                // quand même (retour utilisateur, cf. les widgets « Recent page activity »/« Announcement »
                // à 4 colonnes : bien assez de place pour vignette + 3 boutons dans leur barre séparée).
                const btnsCollapsed = cols < (compact ? PANEL_BUTTONS_COLLAPSE_BELOW_COLS_COMPACT : PANEL_BUTTONS_COLLAPSE_BELOW_COLS_NORMAL)
                const showTitle = narrow || cols >= (compact ? PANEL_TITLE_MIN_COLS_COMPACT : PANEL_TITLE_MIN_COLS)
                return (
                  <div
                    key={item.i}
                    data-testid={`widget-item-${item.i}`}
                    // `stopPropagation` : ne pas laisser le filet du conteneur surligner un
                    // interstice pendant qu'on survole une carte (le dépôt ira côte à côte, pas
                    // dans une nouvelle ligne) — on surligne la carte elle-même à la place.
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const zone = zoneOf(e)
                      if (dragOverItem?.id !== item.i || dragOverItem.zone !== zone) {
                        setDragOverGap(null)
                        setDragOverSlot(null)
                        setDragOverItem({ id: item.i, zone })
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const zone = zoneOf(e)
                      clearDragVisuals()
                      setDraggingId(null)
                      const payload = readPayload(e)
                      if (!payload) return
                      if (payload.rowIndex === rowIndex && payload.itemIndex === itemIndex) return // lâché sur soi-même
                      // Haut / bas : nouvelle ligne pleine largeur juste au-dessus / en dessous de
                      // cette carte (même effet que l'interstice correspondant).
                      if (zone === 'top') return dropAsNewRow(rowIndex, payload)
                      if (zone === 'bottom') return dropAsNewRow(rowIndex + 1, payload)
                      // Gauche / droite : rejoint la ligne de cette carte, juste avant / juste après
                      // elle (ligne pleine → nouvelle ligne en dessous, cf. dropAtRowSlot).
                      dropAtRowSlot(rowIndex, zone === 'left' ? itemIndex : itemIndex + 1, payload)
                    }}
                    // Repère le widget dans le dashboard (flash + scroll, cf. onHighlight) — sur
                    // TOUTE la carte plutôt qu'une zone dédiée, comme une ligne de calque cliquable.
                    // Les contrôles internes (poignée, champs W/H, boutons) stoppent leur propre clic
                    // pour ne pas déclencher aussi ce flash à chaque réglage.
                    onClick={() => onHighlight(item.i)}
                    // Carte trop étroite pour son titre (moins de PANEL_TITLE_MIN_COLS colonnes) :
                    // l'icône seule l'identifie, et le nom complet reste accessible en secours via
                    // l'infobulle NATIVE du navigateur (`title=`), posée ici sur la carte entière
                    // plutôt que sur le texte (absent). Cf. la même condition sur le `span` ci-dessous.
                    //
                    // ⚠️ Tenté un temps via une VRAIE requête de conteneur CSS (`@container` +
                    // `@[130px]:block`) — annulé : le seuil en pixels était deviné sans pouvoir
                    // mesurer le rendu réel du navigateur. Le seuil en COLONNES est lui déterministe :
                    // la carte occupe exactement `w`/12 de la grille (cf. `gridColumn` ci-dessous).
                    title={!showTitle ? title : undefined}
                    // Miniature à l'échelle : la carte occupe EXACTEMENT les colonnes et lignes de
                    // grille de sa tuile (gridColumn / gridRow), comme une copie réduite du dashboard.
                    // (Pas de classe Tailwind : valeurs calculées par widget.)
                    style={{
                      gridColumn: `${gx(item) + 1} / span ${gw(item)}`,
                      gridRow: `${gy(item) + 1} / span ${gh(item)}`,
                    }}
                    className={cn(
                      'group relative z-20 flex min-w-0 cursor-pointer flex-col gap-1.5 rounded-lg border bg-card px-2.5 py-2 transition-all',
                      draggingId === item.i
                        ? 'border-primary/40 opacity-40'
                        : dragOverItem?.id === item.i && draggingId !== null
                          ? cn(
                              // Le « carré bleu » d'avant (bordure + halo) + un liseré sur le bord visé
                              // (gauche/droite = rejoindre la ligne avant/après, haut/bas = nouvelle ligne).
                              'border-primary ring-2 ring-primary/30 bg-primary/5',
                              dragOverItem.zone === 'left' && 'shadow-[inset_4px_0_0_var(--color-primary)]',
                              dragOverItem.zone === 'right' && 'shadow-[inset_-4px_0_0_var(--color-primary)]',
                              dragOverItem.zone === 'top' && 'shadow-[inset_0_4px_0_var(--color-primary)]',
                              dragOverItem.zone === 'bottom' && 'shadow-[inset_0_-4px_0_var(--color-primary)]',
                            )
                          // Menu « ⋯ » ouvert pour CETTE carte (cf. overflowMenuFor) : identifie quel
                          // widget le popover porté concerne — sinon, une fois le bouton lui-même
                          // masqué derrière le menu, rien ne relie visuellement le popover à sa carte
                          // sur un panneau qui en affiche plusieurs à la fois.
                          : overflowMenuFor?.instanceId === item.i
                            ? 'border-primary/40 bg-primary/10'
                            : 'border-border/70 hover:border-primary/30 hover:shadow-sm',
                    )}
                  >
                    <div className={cn('relative flex items-center gap-2', btnsCollapsed && 'justify-center')}>
                      {/* Poignée de glisser-déposer : SEULE ELLE démarre le glisser (pas toute la
                          carte), pour ne pas entrer en conflit avec les champs/boutons cliquables
                          dessous. Déposer sur un AUTRE widget les met côte à côte ; dans un
                          interstice, en fait une nouvelle ligne. Carte trop étroite (collapsed) :
                          justify-center (ci-dessus) centre aussi la poignée (+ vignette si visible,
                          cas non compact) plutôt que de les laisser calées à gauche — sans effet pour
                          la variante compacte, où la poignée est déjà sortie du flux (cf. juste en
                          dessous) et le bouton seul restant occupe déjà toute la largeur. Retour
                          utilisateur : la poignée de glisser devait, elle aussi, être centrée.
                          Carte compacte ET trop étroite (collapsed) : sortie du flux normal (absolute)
                          plutôt que premier enfant flex — sinon elle continue de retenir sa largeur
                          dans le calcul du flex-1 ci-dessous, qui ne centre alors plus le bouton
                          « ⋯ » par rapport à la carte ENTIÈRE mais seulement par rapport à l'espace
                          restant après elle (retour utilisateur : bouton pas centré). Toujours
                          fonctionnelle (glisser marche pareil), juste posée en superposition légère. */}
                      <span
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move'
                          e.dataTransfer.setData('text/plain', JSON.stringify({ rowIndex, itemIndex } satisfies DragPayload))
                          setDraggingId(item.i)
                        }}
                        onDragEnd={() => {
                          setDraggingId(null)
                          clearDragVisuals()
                        }}
                        className={cn(
                          'grid size-5 shrink-0 cursor-grab place-items-center rounded text-muted-foreground/40 transition-colors hover:bg-accent hover:text-muted-foreground active:cursor-grabbing',
                          compact && btnsCollapsed && 'absolute left-0 top-1/2 z-10 -translate-y-1/2',
                        )}
                        title={t('widget.drag_reorder')}
                      >
                        <GripVertical className="size-3.5" />
                      </span>
                      {/* Vignette masquée sur toute carte trop étroite pour ses boutons (collapsed,
                          compacte ou non) : sinon poignée + vignette forment un bloc décalé à
                          gauche que `justify-center` centre comme un TOUT plutôt que chaque élément
                          individuellement — la poignée restait décalée du vrai centre de la carte
                          d'environ la moitié de la largeur de la vignette. Seule la poignée doit
                          rester identifiable ici (retour utilisateur : la poignée de glisser aussi
                          doit être centrée) ; l'icône du widget n'apporte rien à cette largeur, le
                          titre étant de toute façon déjà masqué. */}
                      {!btnsCollapsed && (
                        def.thumbnail ? (
                          <img src={def.thumbnail} alt="" draggable={false} className="pointer-events-none size-7 shrink-0 rounded-md border border-border/70 object-cover" />
                        ) : (
                          <div className="grid size-7 shrink-0 place-items-center rounded-md bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-primary">
                            <def.icon className="size-3.5" />
                          </div>
                        )
                      )}
                      {/* Masqué quand la carte est trop étroite (moins de PANEL_TITLE_MIN_COLS
                          colonnes : 2-3 lettres tronquées, illisible, cf. l'infobulle sur la carte
                          ci-dessus à la place) — l'icône seule l'identifie au repos. Toujours
                          affiché en étroit (tiroir tactile, pas de survol au doigt). */}
                      {showTitle && (
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{title}</span>
                      )}
                      {compact && (
                        <span className={cn('flex items-center gap-0.5', btnsCollapsed ? 'min-w-0 flex-1 justify-center' : 'ml-auto shrink-0')}>
                          {actionButtons(item, def, title, btnsCollapsed)}
                        </span>
                      )}
                    </div>
                    {/* Largeur en colonnes NATIVES (1-12, cf. GRID_WIDTH/MAX_WIDGET_WIDTH — pas de
                        pourcentage : GridStack n'a que 12 colonnes en interne, cf. applyWidthDraft
                        ci-dessus) et hauteur (lignes de grille) : vrais champs numériques — repliés
                        par défaut (cf. l'icône « règle » ci-dessous, même principe que le toggle de
                        largeur responsive de l'éditeur de page). La largeur n'est respectée QUE si
                        la ligne ne dépasse pas 12 colonnes au total (sinon repli en répartition
                        égale, cf. renumberRows) ; la hauteur marque la tuile « réglée à la main »
                        (userSized) : l'auto-fit ne la retouche plus. */}
                    {sizeOpen && (
                    // Empilés (H sous W) dès que la carte est réduite à une fraction du panneau
                    // (moins de PANEL_STACK_FIELDS_BELOW_COLS colonnes) — le champ + son suffixe
                    // tiennent mal côte à côte ; une carte large a toute la place pour les garder
                    // côte à côte.
                    <div className={cn('flex gap-2.5', cols < PANEL_STACK_FIELDS_BELOW_COLS ? 'flex-col' : 'items-center')}>
                      <label className="flex flex-1 items-center gap-1 text-[10px] text-muted-foreground/70">
                        W
                        <div className="relative min-w-0 flex-1">
                          <input
                            type="number"
                            min={MIN_WIDGET_WIDTH}
                            max={MAX_WIDGET_WIDTH}
                            step={1}
                            value={widthDraft[item.i] ?? String(Math.round(item.w))}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const raw = e.target.value
                              setWidthDraft((d) => ({ ...d, [item.i]: raw }))
                              applyWidthDraft(item.i, raw)
                            }}
                            onBlur={() => clearWidthDraft(item.i)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.currentTarget.blur()
                            }}
                            aria-label={t('widget.width_field')}
                            title={t('widget.width_field')}
                            className="w-full min-w-0 rounded-md border border-border/70 bg-background py-1 pl-2 pr-5 text-xs tabular-nums text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                          />
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/60">/12</span>
                        </div>
                      </label>
                      <label className="flex flex-1 items-center gap-1 text-[10px] text-muted-foreground/70">
                        H
                        <div className="relative min-w-0 flex-1">
                          <input
                            type="number"
                            min={MIN_WIDGET_HEIGHT}
                            max={MAX_WIDGET_HEIGHT}
                            step={1}
                            value={heightDraft[item.i] ?? String(Math.round(item.h))}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const raw = e.target.value
                              setHeightDraft((d) => ({ ...d, [item.i]: raw }))
                              applyHeightDraft(item.i, raw)
                            }}
                            onBlur={() => clearHeightDraft(item.i)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.currentTarget.blur()
                            }}
                            aria-label={t('widget.height_field')}
                            title={t('widget.height_field')}
                            className="w-full min-w-0 rounded-md border border-border/70 bg-background px-2 py-1 text-xs tabular-nums text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                          />
                        </div>
                      </label>
                    </div>
                    )}
                    {/* `mt-auto` : sur une carte grandie par `minHeight` (tuile haute), la barre de
                        boutons reste collée en bas et l'espace libre se place entre l'en-tête et
                        elle — silhouette d'une tuile, pas d'un bloc à moitié vide. */}
                    {!compact && (
                    <div className={cn('mt-auto flex items-center gap-0.5', btnsCollapsed && 'justify-center')}>
                      {actionButtons(item, def, title, btnsCollapsed)}
                    </div>
                    )}
                  </div>
                )
              }),
            )}
          </div>
        </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={() => setConfirmRemove(itemCount ? { instanceId: '__all__', label: '' } : null)}
          disabled={itemCount === 0}
          className="dashboard-remove-all-btn w-full cursor-pointer rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('widget.remove_all')}
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {narrow ? (
        <>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg"
          >
            <LayoutGrid className="size-4" />
            {t('widget.panel_title')}
          </button>
          {drawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setDrawerOpen(false)}>
              <div onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-sm">
                {panel}
              </div>
            </div>
          )}
        </>
      ) : (
        panel
      )}

      {overflowMenuFor && (() => {
        const { instanceId, pluginName, title, right, y } = overflowMenuFor
        const sizeOpen = sizeOpenFor.has(instanceId)
        const close = () => setOverflowMenuFor(null)
        // w-48 (192px) + texte text-sm faisait presque la moitié du panneau (340px) pour un menu de
        // 3 lignes — beaucoup trop massif à côté de la carte miniature qui l'a ouvert (retour
        // utilisateur : « the popup are too big »). Resserré à l'échelle du reste du panneau (mêmes
        // tailles que les libellés de carte, cf. text-xs ailleurs dans ce fichier).
        const menuItem = 'flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-accent'
        return createPortal(
          <>
            <div data-testid="widget-overflow-backdrop" onClick={close} className="fixed inset-0 z-[70]" />
            <div
              role="menu"
              data-testid={`widget-overflow-menu-${instanceId}`}
              onClick={(e) => e.stopPropagation()}
              style={{ right, top: y }}
              className="fixed z-[71] w-36 rounded-lg border border-border bg-card p-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                className={cn(menuItem, sizeOpen && 'bg-primary/10 text-primary')}
                onClick={() => {
                  toggleSizeOpen(instanceId)
                  close()
                }}
              >
                <Ruler className="size-3 shrink-0 text-muted-foreground" />
                {t('widget.size_toggle')}
              </button>
              <button
                type="button"
                role="menuitem"
                className={menuItem}
                onClick={() => {
                  setConfigFor({ instanceId, pluginName, title })
                  close()
                }}
              >
                <Settings className="size-3 shrink-0 text-muted-foreground" />
                {t('layout.widget_configure')}
              </button>
              <button
                type="button"
                role="menuitem"
                className={cn(menuItem, 'text-destructive hover:bg-destructive/10')}
                onClick={() => {
                  setConfirmRemove({ instanceId, label: title })
                  close()
                }}
              >
                <X className="size-3 shrink-0" />
                {t('layout.widget_remove')}
              </button>
            </div>
          </>,
          document.body,
        )
      })()}

      {configFor && (
        <WidgetConfigDialog
          pluginName={configFor.pluginName}
          title={configFor.title}
          onClose={() => setConfigFor(null)}
          onSaved={() => setConfigFor(null)}
        />
      )}

      {confirmRemove && (
        <PluginConfirmDialog
          title={t(confirmRemove.instanceId === '__all__' ? 'widget.remove_all_title' : 'widget.remove_title')}
          message={t(confirmRemove.instanceId === '__all__' ? 'widget.remove_all_confirm' : 'widget.remove_confirm')}
          textOk={t('common.yes')}
          textNo={t('common.no')}
          onResult={(kind) => {
            const target = confirmRemove
            setConfirmRemove(null)
            if (kind !== 'yes' || !target) return
            if (target.instanceId === '__all__') onRemoveAll()
            else onRemove(target.instanceId)
          }}
        />
      )}

      {addOpen && (
        <WidgetAddModal
          present={present}
          nativeWidgets={nativeWidgets}
          extraWidgets={extraWidgets}
          loadThumbnails={addEverOpened}
          onAdd={(widgetId) => {
            onAdd(widgetId)
            setAddOpen(false)
          }}
          onClose={() => setAddOpen(false)}
        />
      )}
    </>
  )
}
