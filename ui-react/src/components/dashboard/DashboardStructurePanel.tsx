import { Fragment, useRef, useState, type DragEvent } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  LayoutGrid,
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

/*
 * Miniature PROPORTIONNELLE du dashboard : chaque carte du panneau reproduit la taille RÉELLE de
 * sa tuile dans la grille (même `w` en colonnes sur 12, même `h` en lignes de grille), pour que
 * redimensionner un widget — à la souris dans le dashboard ou via les champs W/H ci-dessous — se
 * reflète aussitôt ici, comme une copie réduite. Avant, toutes les cartes d'une ligne se
 * partageaient la largeur à parts égales et avaient la même hauteur, quelle que soit la tuile.
 */
/** Largeur plancher d'une carte, en px : la poignée + l'icône doivent rester visibles même pour un
 *  widget d'une seule colonne (1/12 du panneau ≈ 26px, inutilisable tel quel). Sous ce seuil, la
 *  miniature n'est plus tout à fait à l'échelle — préférable à une carte inopérable. */
const PANEL_MIN_CARD_PX = 72
/** Hauteur d'une carte à la hauteur MINIMALE de grille (`MIN_WIDGET_HEIGHT`) ; en dessous de sa
 *  hauteur naturelle (en-tête + boutons ≈ 74px), c'est cette dernière qui l'emporte. */
const PANEL_CARD_BASE_PX = 60
/** Pixels de carte ajoutés par ligne de grille au-delà du minimum (la grille fait 46px/ligne, cf.
 *  grid-metrics — on réduit d'environ ×8 pour qu'une tuile de 40 lignes reste ≈ 290px ici). */
const PANEL_PX_PER_GRID_ROW = 6
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
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
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
  const dropAtRowSlot = (rowIndex: number, insertBefore: number, payload: DragPayload) => {
    setDraggingId(null)
    const row = rows[rowIndex]
    if (!row) return
    if (payload.rowIndex === rowIndex) {
      // Même ligne : l'index cible se décale d'un cran quand le widget vient de la GAUCHE du point
      // d'insertion (son retrait fait glisser tout ce qui suit d'une position).
      const to = payload.itemIndex < insertBefore ? insertBefore - 1 : insertBefore
      onRowsChange(reorderWithinRow(rows, rowIndex, payload.itemIndex, to))
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
    onRowsChange(reorderWithinRow(joined, idx, joined[idx].length - 1, Math.min(insertBefore, joined[idx].length - 1)))
  }
  // Espace libre d'une ligne, À L'ÉCHELLE (`cols` colonnes sur 12, comme les cartes) : reproduit
  // dans le panneau le vide que le widget laisse dans le dashboard — à sa gauche quand il est
  // décalé vers la droite (x > 0 sans voisin : un widget seul lâché à la souris dans la colonne
  // de droite du dashboard doit apparaître à DROITE ici aussi, pas collé à gauche), et à sa droite
  // quand la ligne ne remplit pas 12 colonnes. Aussi une cible de dépôt (cf. dropAtRowSlot).
  const rowSpacer = (rowIndex: number, cols: number, insertBefore: number) => {
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
          if (payload) dropAtRowSlot(rowIndex, insertBefore, payload)
        }}
        style={{ flexGrow: cols, flexBasis: 0 }}
        className={cn(
          'rounded-lg border border-dashed transition-colors',
          dragOverSlot === slot && draggingId !== null ? 'border-primary bg-primary/10' : 'border-transparent',
        )}
      />
    )
  }

  // Widget d'une ligne PRÉCÉDENTE qui recouvre encore les colonnes [c0, c1) à la hauteur `rowY`
  // (plus haut que ses voisins : il « descend » dans les lignes suivantes, cf. renumberRows). Le
  // panneau regroupe par `y` identique, donc l'espace qu'il occupe apparaîtrait sinon comme un
  // VIDE (Mantis #0011020 : « crée un espace vide alors qu'il n'est pas vide »).
  const coveringItem = (rowY: number, c0: number, c1: number): GridItem | null => {
    if (c1 - c0 < 0.01) return null
    for (const r of rows) {
      for (const it of r) {
        if (it.y < rowY && it.y + Math.max(1, it.h) > rowY && it.x < c1 - 0.01 && it.x + Math.max(1, it.w) > c0 + 0.01) return it
      }
    }
    return null
  }
  // Espace d'une ligne : réellement LIBRE → espace à l'échelle + cible de dépôt (rowSpacer) ;
  // OCCUPÉ par un widget plus haut venu d'au-dessus → RIEN du tout (ni espace réservé, ni cible de
  // dépôt) : les cartes restantes de la ligne se partagent alors toute la largeur. La hauteur de
  // la tuile haute se lit déjà sur SA carte (cf. cardMinHeight) ; réserver sa place ici ne donnait
  // qu'un bloc vide (Mantis #0011020).
  const rowGap = (rowIndex: number, cols: number, insertBefore: number, rowY: number, c0: number, c1: number) =>
    coveringItem(rowY, c0, c1) ? null : rowSpacer(rowIndex, cols, insertBefore)

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
  const dropGap = (gapIndex: number) => (
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
      className={cn(
        'mx-1 h-2 rounded-full transition-colors',
        dragOverGap === gapIndex ? 'bg-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]' : 'bg-transparent',
      )}
    />
  )

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
        {dropGap(0)}
        {rows.map((row, rowIndex) => {
          // Colonnes NON occupées À DROITE de la ligne (une ligne peut totaliser moins de 12 : un
          // widget seul réduit à 6 colonnes n'occupe que la moitié du dashboard) — matérialisées par
          // un espace vide, pour que la carte garde la même proportion ET la même position que sa
          // tuile. Calculé d'après `x + w` du DERNIER widget (pas la somme des largeurs) : les vides
          // ENTRE widgets, dus à un `x` décalé, sont rendus séparément devant chaque carte (cf.
          // leadCols dans la boucle). Jamais négatif : GridStack borne x + w à 12, et
          // `renumberRows` ramène toute ligne > 12 à une répartition égale avant persist.
          const last = row[row.length - 1]
          const spareCols = Math.max(0, MAX_WIDGET_WIDTH - (last.x + Math.max(1, last.w)))
          return (
          <div key={rowKey(row)}>
            <div className="flex gap-1.5">
              {row.map((item, itemIndex) => {
                const def = widgetMap[widgetIdOf(item.i)]
                if (!def) return null
                const title = def.titleLabel ?? t(def.titleKey)
                const sizeOpen = sizeOpenFor.has(item.i)
                // Largeur réelle de la tuile (colonnes sur 12) → part de la ligne du panneau ; hauteur
                // réelle (lignes de grille) → hauteur de la carte. Cf. les constantes PANEL_* en tête.
                const cols = Math.max(1, item.w)
                const showTitle = narrow || cols >= PANEL_TITLE_MIN_COLS
                const cardMinHeight = PANEL_CARD_BASE_PX + Math.max(0, item.h - MIN_WIDGET_HEIGHT) * PANEL_PX_PER_GRID_ROW
                // Colonnes vides entre la fin du widget précédent (ou le bord gauche) et celui-ci :
                // un `x` décalé dans le dashboard (widget lâché à la souris à droite, sans voisin à
                // gauche) se traduit ici par le même vide À GAUCHE de la carte. Arrondi car `x` est
                // entier mais `w` peut rester continu le temps d'une édition (cf. renumberRows).
                const prev = itemIndex > 0 ? row[itemIndex - 1] : null
                const prevEnd = prev ? prev.x + Math.max(1, prev.w) : 0
                const leadCols = Math.max(0, Math.round(item.x - prevEnd))
                return (
                  <Fragment key={item.i}>
                  {leadCols > 0 && rowGap(rowIndex, leadCols, itemIndex, row[0].y, prevEnd, item.x)}
                  <div
                    data-testid={`widget-item-${item.i}`}
                    // `stopPropagation` : ne pas laisser le filet du conteneur surligner un
                    // interstice pendant qu'on survole une carte (le dépôt ira côte à côte, pas
                    // dans une nouvelle ligne) — on surligne la carte elle-même à la place.
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (dragOverItem !== item.i) {
                        setDragOverGap(null)
                        setDragOverSlot(null)
                        setDragOverItem(item.i)
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      clearDragVisuals()
                      setDraggingId(null)
                      const payload = readPayload(e)
                      if (!payload) return
                      if (payload.rowIndex === rowIndex) {
                        onRowsChange(reorderWithinRow(rows, rowIndex, payload.itemIndex, itemIndex))
                        return
                      }
                      // Ligne cible déjà pleine (MAX_ROW_ITEMS) : dépôt refusé, TEL QUEL — on ne
                      // retire même pas le widget de sa position d'origine (contrairement à avant :
                      // le retirer PUIS constater que `insertIntoRow` refuse de le rejoindre le
                      // faisait disparaître, plus nulle part où le remettre). Rien ne bouge.
                      if (row.length >= MAX_ROW_ITEMS) return
                      const targetKey = rowKey(row)
                      const { rows: withoutItem, item: dragged } = removeItem(rows, payload.rowIndex, payload.itemIndex)
                      if (dragged) onRowsChange(insertIntoRow(withoutItem, targetKey, dragged))
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
                    // la carte occupe exactement `w`/12 de la ligne (cf. `flexGrow` ci-dessous).
                    title={!showTitle ? title : undefined}
                    // Miniature à l'échelle : `flexGrow: w` sur une base 0 répartit la ligne au prorata
                    // des colonnes (le spacer de fin absorbe les colonnes libres), et la hauteur suit
                    // le nombre de lignes de grille. `minWidth` empêche une carte d'1 colonne de
                    // devenir inopérable. (Pas de classe Tailwind : valeurs calculées par widget.)
                    style={{
                      flexGrow: cols,
                      flexBasis: 0,
                      minWidth: PANEL_MIN_CARD_PX,
                      minHeight: cardMinHeight,
                    }}
                    className={cn(
                      'group flex min-w-0 cursor-pointer flex-col gap-1.5 rounded-lg border bg-card px-2.5 py-2 transition-all',
                      draggingId === item.i
                        ? 'border-primary/40 opacity-40'
                        : dragOverItem === item.i && draggingId !== null
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-border/70 hover:border-primary/30 hover:shadow-sm',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {/* Poignée de glisser-déposer : SEULE ELLE démarre le glisser (pas toute la
                          carte), pour ne pas entrer en conflit avec les champs/boutons cliquables
                          dessous. Déposer sur un AUTRE widget les met côte à côte ; dans un
                          interstice, en fait une nouvelle ligne. */}
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
                        className="grid size-5 shrink-0 cursor-grab place-items-center rounded text-muted-foreground/40 transition-colors hover:bg-accent hover:text-muted-foreground active:cursor-grabbing"
                        title={t('widget.drag_reorder')}
                      >
                        <GripVertical className="size-3.5" />
                      </span>
                      {def.thumbnail ? (
                        <img src={def.thumbnail} alt="" draggable={false} className="pointer-events-none size-7 shrink-0 rounded-md border border-border/70 object-cover" />
                      ) : (
                        <div className="grid size-7 shrink-0 place-items-center rounded-md bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-primary">
                          <def.icon className="size-3.5" />
                        </div>
                      )}
                      {/* Masqué quand la carte est trop étroite (moins de PANEL_TITLE_MIN_COLS
                          colonnes : 2-3 lettres tronquées, illisible, cf. l'infobulle sur la carte
                          ci-dessus à la place) — l'icône seule l'identifie au repos. Toujours
                          affiché en étroit (tiroir tactile, pas de survol au doigt). */}
                      {showTitle && (
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{title}</span>
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
                    <div className="mt-auto flex items-center gap-0.5">
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
                    </div>
                  </div>
                  </Fragment>
                )
              })}
              {/* Colonnes libres À DROITE de la ligne (cf. spareCols) : à l'échelle, et cible de
                  dépôt « rejoindre cette ligne en dernière position » (cf. dropAtRowSlot) — c'est
                  là que l'utilisateur lâche spontanément « à côté de » quelque chose. */}
              {spareCols > 0 && rowGap(rowIndex, spareCols, row.length, row[0].y, last.x + Math.max(1, last.w), MAX_WIDGET_WIDTH)}
            </div>
            {dropGap(rowIndex + 1)}
          </div>
          )
        })}
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
