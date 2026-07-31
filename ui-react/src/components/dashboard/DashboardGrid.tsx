import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type ErrorInfo } from 'react'
import { createPortal } from 'react-dom'
import { GridStack, type GridStackNode, type GridStackWidget } from 'gridstack'
import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react'

import 'gridstack/dist/gridstack.min.css'

import { useI18n } from '@/i18n/i18n-context'
import { AUTOFIT_TOLERANCE_PX, CELL_HEIGHT, GRID_COLS, MARGIN, contentPxToGridRows } from './grid-metrics'
import { WIDGET_MAP, type WidgetDef } from './widget-registry'
import { WidgetFrame } from './WidgetFrame'
import { WidgetConfigDialog } from './WidgetConfigDialog'
import { PluginConfirmDialog } from './PluginConfirmDialog'
import { widgetIdOf, type GridItem } from './dashboard-store'

// ─── Error boundary per widget ────────────────────────────────────────────────

interface EBState { error: Error | null }

class WidgetErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { error: null }

  static getDerivedStateFromError(error: Error): EBState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Widget]', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
          <AlertTriangle className="size-8 text-destructive/70" />
          <p className="max-w-[22ch] text-sm text-muted-foreground">
            {this.state.error.message || 'Une erreur est survenue dans ce widget.'}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <RotateCcw className="size-3" />
            Réessayer
          </button>
        </div>
      )
    }
    return this.state.error === null ? this.props.children : null
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export { GRID_COLS }

interface Slot {
  id: string
  el: HTMLElement
}

export function DashboardGrid({
  layout,
  onChange,
  onRemove,
  extraWidgetMap = {},
}: {
  layout: GridItem[]
  onChange: (items: GridItem[]) => void
  onRemove: (widgetId: string) => void
  extraWidgetMap?: Record<string, WidgetDef>
}) {
  const allWidgets = useMemo(
    () => ({ ...WIDGET_MAP, ...extraWidgetMap }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extraWidgetMap],
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<GridStack | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const mutating = useRef(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const layoutRef = useRef(layout)
  layoutRef.current = layout
  const allWidgetsRef = useRef(allWidgets)
  allWidgetsRef.current = allWidgets
  // Tuiles redimensionnées À LA MAIN : l'ajustement automatique ne les touche plus jamais. Le
  // document du plugin continue de publier sa hauteur (son ResizeObserver se déclenche sur le
  // reflow provoqué par le redimensionnement lui-même), ce qui ramènerait sinon la tuile de force.
  const userSized = useRef(new Set<string>())
  // Drag / redimensionnement EN COURS : l'ajustement automatique est totalement suspendu. Écrire
  // une hauteur pendant que GridStack manipule la tuile la corrompt, et surtout `userSized` n'est
  // rempli qu'au `resizestop` — sans ce verrou, tout le drag se déroule ajustement actif.
  const interacting = useRef(false)
  // Rétrécissement automatique EN ATTENTE DE CONFIRMATION : `itemId → { fromRows, px }`. On garde
  // la hauteur d'avant et la mesure qui a motivé la réduction, pour vérifier au rapport suivant
  // que la mesure n'a pas bougé (cf. `noShrink`).
  const shrinkProbe = useRef(new Map<string, { fromRows: number; px: number }>())
  // Plugins dont la mesure S'EST RÉVÉLÉE CIRCULAIRE : leur contenu se cale sur la hauteur de
  // l'iframe (hauteurs en %), donc réduire la tuile réduit la mesure — un cliquet qui écrase la
  // tuile jusqu'à rendre le contenu invisible. Détectés à l'exécution, ils ne rétrécissent plus.
  const noShrink = useRef(new Set<string>())

  // --- Init GridStack (une seule fois) ---
  useEffect(() => {
    const grid = GridStack.init(
      {
        column: GRID_COLS,
        cellHeight: CELL_HEIGHT,
        margin: `${MARGIN}px`,
        handle: '.widget-drag-handle',
        float: false,
        animate: true,
        resizable: { handles: 'se' },
        // Responsive : repli automatique des colonnes selon la largeur du conteneur.
        // < 640px → 1 colonne (widgets empilés), < 1024px → 6 colonnes, sinon 12.
        // GridStack mémorise le layout 12-col d'origine et le restaure en élargissant.
        columnOpts: {
          // `move` et NON `moveScale` : sous un breakpoint, `moveScale` met les hauteurs à
          // l'échelle des colonnes (12 → 6 ⇒ hauteur ÷ 2). Or le contenu d'un plugin legacy ne
          // raccourcit PAS quand il se rétrécit — le graphique flot fait 400px de haut quelle que
          // soit la largeur. La tuile était donc divisée par deux, le contenu non : bas rogné.
          // Concrètement : une tuile Prospects ajustée à 16 lignes retombait à 8 (~424px) sous
          // 1024px. `move` conserve les hauteurs et ne fait que repositionner.
          layout: 'move',
          breakpoints: [
            { w: 640, c: 1 },
            { w: 1024, c: 6 },
          ],
        },
        // Accepte les éléments internes du grid ET les items palette (setupDragIn).
        acceptWidgets: (el: Element) => !!(el as HTMLElement & { gridstackNode?: { id?: string } }).gridstackNode?.id,
      },
      containerRef.current!,
    )
    gridRef.current = grid

    grid.on('change', () => {
      if (mutating.current) return
      // Ne persiste QUE le layout en pleine largeur (12 col). Un reflow responsive
      // (1 ou 6 col) ne doit pas écraser les positions desktop sauvegardées.
      if (grid.getColumn() !== GRID_COLS) return
      onChangeRef.current(readLayout(grid, allWidgetsRef.current, userSized.current, layoutRef.current))
    })

    // Un redimensionnement MANUEL fige la tuile : plus d'ajustement automatique dessus.
    // ⚠️ `mutating` : nos PROPRES `grid.update()` émettent aussi `resizestop`. Sans ce garde-fou,
    // le tout premier ajustement marquerait la tuile comme « réglée à la main » et se bloquerait.
    //
    // ⚠️ On marque dès le `resizestart`, PAS au `resizestop` : redimensionner l'iframe déclenche le
    // ResizeObserver du plugin, qui republie une hauteur PENDANT le drag. La tuile était alors
    // ajustée en plein geste — et comme la mesure d'un plugin dont le contenu suit la hauteur de
    // l'iframe (thème legacy : `body{height:100%}`) vaut un peu MOINS que la tuile, chaque frame la
    // rétrécissait un peu plus : effet cliquet jusqu'au minimum, contenu invisible.
    grid.on('resizestart', (_e, el: HTMLElement) => {
      if (mutating.current) return
      interacting.current = true
      const id = (el as HTMLElement & { gridstackNode?: { id?: string } }).gridstackNode?.id
      if (id) userSized.current.add(id)
    })
    grid.on('resizestop', () => { interacting.current = false })
    grid.on('dragstart', () => { if (!mutating.current) interacting.current = true })
    grid.on('dragstop', () => { interacting.current = false })

    // Gère les widgets déposés depuis la palette externe (setupDragIn).
    grid.on('added', (_, items: GridStackNode[]) => {
      if (mutating.current) return
      // On NE réutilise PAS l'élément inséré par GridStack lors d'un drop : son contenu est le
      // CLONE de l'item de palette (poignée + icône + libellé + « + »). Selon le timing, le portail
      // React ne le remplaçait pas → la tuile restait coincée sur ce clone. On mémorise donc juste
      // la position, on retire l'élément cloné, et on ré-ajoute le widget via l'état `layout` React →
      // l'effet [layout] recrée une tuile PROPRE (contenu vide) que le portail remplit. Même chemin
      // fiable que l'ajout au clic. (allWidgetsRef.current = registre à jour, plugins legacy inclus.)
      const toAppend: GridItem[] = []
      mutating.current = true
      grid.batchUpdate()
      for (const node of items) {
        const id = node.id as string
        const def = id ? allWidgetsRef.current[widgetIdOf(id)] : undefined
        if (id && def && !layoutRef.current.some((l) => l.i === id)) {
          toAppend.push({
            i: id,
            x: node.x ?? 0,
            y: node.y ?? 0,
            w: node.w ?? def.w,
            h: node.h ?? def.h,
            minW: def.minW,
            minH: def.minH,
          })
        }
        if (node.el) grid.removeWidget(node.el as HTMLElement, true)
      }
      grid.batchUpdate(false)
      mutating.current = false
      if (toAppend.length) onChangeRef.current([...layoutRef.current, ...toAppend])
    })

    // ── Anti-iframe : neutralise les iframes PENDANT un drag ──────────────────
    // GridStack ne nettoie son clone d'aide (helper cloné dans <body>) que si le
    // `mouseup` atteint `document`. Or une IFRAME (widget plugin legacy) AVALE les
    // événements souris : si on relâche au-dessus d'une iframe, le mouseup part dans
    // l'iframe, le handler document de GridStack ne se déclenche jamais → le clone
    // reste COLLÉ à l'écran. On met donc toutes les iframes en pointer-events:none dès
    // qu'un drag démarre (poignée de tuile OU item de palette), rétabli au relâchement.
    //
    // ⚠️ Vaut AUSSI pour la poignée de REDIMENSIONNEMENT (`.ui-resizable-handle`) : un
    // redimensionnement se termine très souvent au-dessus d'une iframe (celle de la tuile qu'on
    // agrandit). Le `mouseup` y était avalé, donc `resizestop` ne partait jamais — le verrou
    // `interacting` restait bloqué et l'ajustement automatique mourait pour toute la session.
    const startsDrag = (t: HTMLElement | null) =>
      !!t &&
      (!!t.closest('.widget-drag-handle') ||
        !!t.closest('[data-widget-palette]') ||
        !!t.closest('.ui-resizable-handle'))
    const onDown = (e: MouseEvent) => {
      if (startsDrag(e.target as HTMLElement)) document.body.classList.add('melis-widget-dragging')
    }
    const onUp = () => {
      document.body.classList.remove('melis-widget-dragging')
      // Filet : si GridStack n'émet pas son `resizestop`/`dragstop` (événement avalé), le verrou
      // resterait actif et l'ajustement automatique ne repartirait plus.
      interacting.current = false
    }
    document.addEventListener('mousedown', onDown, true)
    document.addEventListener('mouseup', onUp, true)

    return () => {
      document.removeEventListener('mousedown', onDown, true)
      document.removeEventListener('mouseup', onUp, true)
      document.body.classList.remove('melis-widget-dragging')
      grid.destroy(false)
      gridRef.current = null
    }
  }, [])

  // --- Ajustement auto : applique la hauteur de contenu mesurée par le plugin ---
  // Publiée par LegacyPluginContent depuis le document du plugin. Passe par `onChange` plutôt que
  // par `grid.update()` : l'état React reste la source de vérité, sinon l'effet [layout] ci-dessous
  // annulerait la mutation. La mesure étant STABLE (indépendante de la taille de l'iframe), il n'y
  // a pas de boucle : appliquer la hauteur ne change pas la mesure suivante.
  useEffect(() => {
    const onAutofit = (e: Event) => {
      const { itemId, contentPx } = (e as CustomEvent<{ itemId?: string; contentPx?: number }>).detail ?? {}
      const grid = gridRef.current
      if (!grid || !itemId || !contentPx) return
      if (interacting.current) return
      if (userSized.current.has(itemId)) return
      const rows = contentPxToGridRows(contentPx)
      if (localStorage.getItem('melis-autofit-debug')) {
        console.debug('[autofit]', { itemId, contentPx, rows, cols: grid.getColumn(), currentH: layoutRef.current.find((l) => l.i === itemId)?.h })
      }
      // Sous un breakpoint responsive, GridStack met les hauteurs à l'échelle : écrire une hauteur
      // « desktop » dans le layout PERSISTÉ le corromprait. On corrige alors seulement l'affichage.
      if (grid.getColumn() !== GRID_COLS) {
        const node = grid.engine.nodes.find((n) => n.id === itemId)
        if (node?.el && rows > (node.h ?? 0)) {
          mutating.current = true
          grid.update(node.el as HTMLElement, { h: rows })
          mutating.current = false
        }
        return
      }
      const item = layoutRef.current.find((l) => l.i === itemId)
      if (!item) return

      // Vérification d'un rétrécissement précédent. La mesure d'un plugin dont le contenu se cale
      // sur l'iframe (hauteurs en %) SUIT la tuile : l'avoir réduite la fait baisser à son tour →
      // cliquet qui écraserait la tuile. On le détecte ici — la mesure a-t-elle bougé après coup ? —
      // puis on restaure la hauteur d'avant et on interdit définitivement de réduire cette tuile.
      // Pour un plugin à contenu de hauteur propre (la plupart), la mesure est identique : rien à faire.
      const probe = shrinkProbe.current.get(itemId)
      if (probe) {
        shrinkProbe.current.delete(itemId)
        if (contentPx < probe.px - AUTOFIT_TOLERANCE_PX) {
          noShrink.current.add(itemId)
          onChangeRef.current(
            layoutRef.current.map((l) => (l.i === itemId ? { ...l, h: probe.fromRows } : l)),
          )
          return
        }
      }

      if (rows === item.h) return
      if (rows < item.h) {
        // RÉTRÉCIR : c'est ce qui supprime la bande blanche sous les plugins dont la hauteur
        // DÉCLARÉE surestime le contenu réel (`legacyRowsToGridRows` + `SAFETY_PX`).
        //
        // On vise EXACTEMENT `rows`, comme pour l'agrandissement. Ce chemin ajoutait auparavant
        // `AUTOFIT_TOLERANCE_PX` au contenu avant conversion, ce qui gardait souvent une ligne
        // entière de trop : le `Math.ceil` de `contentPxToGridRows` offre DÉJÀ jusqu'à 45px de
        // marge sous le contenu — bien plus que le bruit de mesure que ce coussin couvrait — et
        // les 12px suffisaient à faire basculer le ceil sur la ligne suivante. Pire, `target`
        // pouvait alors repasser au-dessus de `item.h` et annuler le rétrécissement décidé deux
        // lignes plus haut sur `rows`. La tolérance garde son autre rôle : détecter plus bas les
        // mesures circulaires. Pas d'oscillation : la mesure ne dépend pas de la taille de la tuile.
        if (noShrink.current.has(itemId)) return
        shrinkProbe.current.set(itemId, { fromRows: item.h, px: contentPx })
        onChangeRef.current(
          layoutRef.current.map((l) => (l.i === itemId ? { ...l, h: rows } : l)),
        )
        return
      }
      // `h` uniquement, jamais `minH` : figer le plancher sur la hauteur mesurée empêcherait de
      // rétrécir la tuile à la main (c'était le bug du `minH` déclaré).
      onChangeRef.current(layoutRef.current.map((l) => (l.i === itemId ? { ...l, h: rows } : l)))
    }
    window.addEventListener('melis:widget-autofit', onAutofit)
    return () => window.removeEventListener('melis:widget-autofit', onAutofit)
  }, [])

  // --- Sync ajout/suppression de widgets (diff par rapport à grid.engine.nodes) ---
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    // Tuiles réglées à la main (react-height restauré au chargement) : on les inscrit dans `userSized`
    // pour que l'auto-fit NE LES retouche PLUS — sinon la hauteur voulue serait écrasée par la mesure
    // du contenu juste après le rechargement. Idempotent ; ne retire rien (un resize reste acquis).
    for (const l of layout) {
      if (l.userSized) userSized.current.add(l.i)
    }

    // Source de vérité : ce qui est réellement dans GridStack, pas les slots React.
    const inGrid = new Set(
      grid.engine.nodes.map((n) => n.id as string).filter(Boolean),
    )
    const want = new Map(layout.map((l) => [l.i, l]))

    const toAdd = layout.filter((l) => !inGrid.has(l.i))
    const toRemove = grid.engine.nodes.filter((n) => n.id && !want.has(n.id as string))

    // Tuiles déjà en place dont la hauteur a changé côté React (recalage des plugins legacy une
    // fois leurs défs chargées, cf. DashboardPage). Sans ça, GridStack garderait l'ancienne
    // hauteur : le diff ci-dessus ne voit que les ajouts/suppressions.
    //
    // ⚠️ UNIQUEMENT en pleine largeur (12 col). Sous un breakpoint responsive, GridStack MET À
    // L'ÉCHELLE les hauteurs (`columnOpts.layout: 'moveScale'`) : la hauteur appliquée ne peut
    // alors jamais égaler celle du layout desktop, `toResize` ne se vide plus, et l'effet se
    // relance à chaque rendu — la grille passe son temps à se réécrire et devient indéplaçable.
    const toResize =
      grid.getColumn() !== GRID_COLS
        ? []
        : grid.engine.nodes.filter((n) => {
            const it = n.id ? want.get(n.id as string) : undefined
            return it && (n.h !== it.h || n.w !== it.w)
          })

    if (!toAdd.length && !toRemove.length && !toResize.length) return

    mutating.current = true
    grid.batchUpdate()

    for (const n of toResize) {
      const it = want.get(n.id as string)!
      const def = allWidgetsRef.current[widgetIdOf(it.i)]
      grid.update(n.el as HTMLElement, {
        w: it.w,
        h: it.h,
        // Registry FIRST: a layout persisted before the auto-fit work carries the plugin's
        // declared height as `minH`, which would clamp the tile straight back on resize.
        minW: def?.minW ?? it.minW,
        minH: def?.minH ?? it.minH,
      })
    }

    for (const it of toAdd) {
      // Registry FIRST for the constraints (cf. the resize path above): a persisted `minH` from
      // before the auto-fit work is the plugin's declared height and would pin the tile there.
      // The saved `h` is now taken AS IS — auto-fit corrects it from the real content shortly
      // after the iframe loads, and clamping it up here would fight a deliberate manual resize.
      const def = allWidgetsRef.current[widgetIdOf(it.i)]
      const el = grid.addWidget({
        x: it.x,
        y: it.y,
        w: it.w,
        h: it.h,
        minW: def?.minW ?? it.minW,
        minH: def?.minH ?? it.minH,
        id: it.i,
      })
      const content = el.querySelector('.grid-stack-item-content') as HTMLElement
      content.dataset.widgetId = widgetIdOf(it.i)
    }

    for (const n of toRemove) {
      if (n.el) grid.removeWidget(n.el as HTMLElement, true)
    }

    grid.batchUpdate(false)
    mutating.current = false

    setSlots(slotsFromGrid(grid))
  }, [layout]) // Dépend uniquement de layout, pas de slots.

  return (
    <>
      <div ref={containerRef} className="grid-stack melis-dashboard-grid" />
      {slots.map((s) =>
        allWidgets[widgetIdOf(s.id)]
          ? createPortal(
              <WidgetPortal widgetId={s.id} widgetDef={allWidgets[widgetIdOf(s.id)]} onRemove={() => onRemove(s.id)} />,
              s.el,
              s.id, // key — prevents other portals from remounting when one widget is removed
            )
          : null,
      )}
    </>
  )
}

function WidgetPortal({ widgetDef, onRemove }: { widgetId: string; widgetDef: WidgetDef; onRemove: () => void }) {
  const { t } = useI18n()
  const [refreshKey, setRefreshKey] = useState(0)
  const [reloading, setReloading] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  // Confirmation avant de retirer la tuile — comme le legacy (jarviswidget → confirm à la fermeture).
  const [confirmRemove, setConfirmRemove] = useState(false)
  const title = widgetDef.titleLabel ?? t(widgetDef.titleKey)
  // Engrenage affiché sur TOUS les widgets, pour un cadre homogène. Les widgets NATIFS n'ont pas
  // de plugin legacy derrière eux (donc rien à configurer) : la modale affiche alors simplement
  // « aucun paramètre », sans appel réseau.
  const pluginName = widgetDef.pluginName

  // Recharge = remonte le contenu (nouvelle clé) + affiche un spinner un court instant, pour
  // un retour visuel même sur un widget natif quasi-instantané. Les widgets plugins (iframe)
  // gardent EN PLUS leur propre spinner jusqu'au onLoad (chargement long) via LegacyPluginContent.
  const reload = () => {
    setRefreshKey((k) => k + 1)
    setReloading(true)
    window.setTimeout(() => setReloading(false), 600)
  }

  return (
    <>
      <WidgetFrame
        title={title}
        icon={widgetDef.icon}
        onRemove={() => setConfirmRemove(true)}
        onReload={reload}
        onConfig={() => setConfigOpen(true)}
      >
        <div className="relative h-full w-full">
          {reloading && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-card/70">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <WidgetErrorBoundary key={refreshKey}>
            {widgetDef.render()}
          </WidgetErrorBoundary>
        </div>
      </WidgetFrame>
      {configOpen && (
        <WidgetConfigDialog
          pluginName={pluginName}
          title={title}
          onClose={() => setConfigOpen(false)}
          // La config est appliquée côté serveur au rendu du plugin : sans rechargement, la tuile
          // continuerait d'afficher l'ancienne (ex. filtre par défaut d'un graphique).
          onSaved={reload}
        />
      )}
      {confirmRemove && (
        <PluginConfirmDialog
          title={t('widget.remove_title')}
          message={t('widget.remove_confirm')}
          textOk={t('common.yes')}
          textNo={t('common.no')}
          onResult={(kind) => {
            setConfirmRemove(false)
            if (kind === 'yes') onRemove()
          }}
        />
      )}
    </>
  )
}

function slotsFromGrid(grid: GridStack): Slot[] {
  const next: Slot[] = []
  grid.engine.nodes.forEach((n) => {
    const content = (n.el as HTMLElement)?.querySelector(
      '.grid-stack-item-content',
    ) as HTMLElement | null
    if (n.id && content) next.push({ id: n.id as string, el: content })
  })
  return next
}

function readLayout(
  grid: GridStack,
  allWidgets: Record<string, WidgetDef>,
  userSized: Set<string>,
  prev: GridItem[],
): GridItem[] {
  const prevById = new Map(prev.map((l) => [l.i, l]))
  const saved = grid.save(false) as GridStackWidget[]
  return saved
    // ⚠️ NE JAMAIS FILTRER SUR LE REGISTRE ICI. Cette lecture alimente `onChange` → `persist(…,
    // { userAction: true })`, qui a le droit de RÉDUIRE le record partagé (c'est le chemin d'une
    // suppression volontaire). Filtrer sur `allWidgets` faisait donc disparaître de la BASE toute
    // tuile dont la déf. n'est pas chargée — or `extraWidgetMap` est VIDE tant que
    // `/legacy-plugins` n'a pas répondu, et le reste indéfiniment pour un utilisateur sans droit
    // sur aucun plugin. Un simple déplacement/redimensionnement effaçait alors TOUT le dashboard
    // (constaté en base : d_content réduit à `<Plugins></Plugins>`). On garde donc chaque nœud de
    // la grille tel quel ; c'est `layoutToRecords` + les filets de `persist` (DashboardPage) qui
    // décident, en connaissance de cause, de ce qui part en base.
    .filter((w) => !!w.id)
    .map((w) => {
      const id = w.id as string
      const def = allWidgets[widgetIdOf(id)]
      const before = prevById.get(id)
      return {
        i: id,
        x: w.x ?? 0,
        y: w.y ?? 0,
        w: w.w ?? 1,
        h: w.h ?? 1,
        minW: def?.minW ?? before?.minW,
        // Always the REGISTRY's floor, never a persisted one: layouts saved before the auto-fit
        // work carry `minH` = the plugin's declared height, and re-persisting that value is what
        // made hand-resized tiles spring back.
        minH: def?.minH ?? before?.minH,
        // Hauteur legacy DÉCLARÉE, reportée depuis l'item précédent : GridStack ne la connaît pas,
        // et sans elle une tuile à déf. inconnue ne serait plus re-persistable (cf. GridItem).
        legacyH: before?.legacyH,
        // Propage l'état « redimensionné à la main » (rempli au resizestart) → DashboardPage le
        // persiste (react-height) et la hauteur voulue survit au rechargement.
        userSized: userSized.has(id),
      }
    })
}
