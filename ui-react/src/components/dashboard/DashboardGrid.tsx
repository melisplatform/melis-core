import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type ErrorInfo } from 'react'
import { createPortal } from 'react-dom'
import { GridStack, type GridStackNode, type GridStackWidget } from 'gridstack'
import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react'

import 'gridstack/dist/gridstack.min.css'

import { useI18n } from '@/i18n/i18n-context'
import { CELL_HEIGHT, GRID_COLS, MARGIN, contentPxToGridRows } from './grid-metrics'
import { WIDGET_MAP, type WidgetDef } from './widget-registry'
import { WidgetFrame } from './WidgetFrame'
import { WidgetConfigDialog } from './WidgetConfigDialog'
import { widgetIdOf, type GridItem } from './dashboard-store'

// ─── Error boundary per widget ────────────────────────────────────────────────

interface EBState { error: Error | null }
interface EBProps { children: ReactNode; fallbackMessage: string; retryLabel: string }

class WidgetErrorBoundary extends Component<EBProps, EBState> {
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
            {this.state.error.message || this.props.fallbackMessage}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <RotateCcw className="size-3" />
            {this.props.retryLabel}
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
  // Content-measured row counts, per grid item, published by legacy plugin iframes once loaded.
  // Kept out of React state on purpose: it must survive the `readLayout` round-trip below without
  // triggering a render of its own.
  const fittedRows = useRef(new Map<string, number>())
  // Fit cycle each `fittedRows` entry came from, so readings of the CURRENT cycle only grow the
  // tile while a fresh cycle (triggered by a width change) is allowed to shrink it.
  const fitCycles = useRef(new Map<string, number>())
  // Tiles the user has resized by hand. Auto-fit NEVER touches these again: a plugin iframe keeps
  // reporting its height (its ResizeObserver fires on the reflow the resize itself causes), which
  // would otherwise snap the tile straight back and make manual resizing impossible.
  const userSized = useRef(new Set<string>())

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
      onChangeRef.current(readLayout(grid, allWidgetsRef.current))
    })

    // Un redimensionnement MANUEL fige la tuile : plus aucun ajustement automatique dessus.
    // ⚠️ `mutating` : nos PROPRES `grid.update()` (ajustement auto, recalage du layout) émettent
    // eux aussi `resizestop`. Sans ce garde-fou, la 1ʳᵉ mesure — volontairement précoce, avant que
    // le graphique du plugin ne soit dessiné — marquait la tuile comme « redimensionnée à la main »
    // et TOUTES les mesures suivantes, plus hautes, étaient ignorées : tuile figée trop courte.
    grid.on('resizestop', (_e, el: HTMLElement) => {
      if (mutating.current) return
      const id = (el as HTMLElement & { gridstackNode?: { id?: string } }).gridstackNode?.id
      if (id) userSized.current.add(id)
    })

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
    const startsDrag = (t: HTMLElement | null) =>
      !!t && (!!t.closest('.widget-drag-handle') || !!t.closest('[data-widget-palette]'))
    const onDown = (e: MouseEvent) => {
      if (startsDrag(e.target as HTMLElement)) document.body.classList.add('melis-widget-dragging')
    }
    const onUp = () => document.body.classList.remove('melis-widget-dragging')
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

  // --- Auto-fit: apply a legacy plugin's measured content height to its tile ---
  // Published by LegacyPluginContent once its iframe has loaded (a few readings while the plugin's
  // charts settle). Routed through `onChange` rather than `grid.update()` so React state stays the
  // source of truth — a direct grid mutation would be reverted by the [layout] effect below.
  useEffect(() => {
    const onAutofit = (e: Event) => {
      const { itemId, contentPx, fitId } = (e as CustomEvent<{ itemId?: string; contentPx?: number; fitId?: number }>).detail ?? {}
      const grid = gridRef.current
      if (!grid || !itemId || !contentPx) return
      // A hand-resized tile is the user's call — never override it.
      if (userSized.current.has(itemId)) return
      const cols = grid.getColumn()
      // Opt-in tracing: `localStorage.setItem('melis-autofit-debug', '1')` in the console.
      // Auto-fit spans an iframe, a postMessage and GridStack's column modes, so when a tile ends
      // up the wrong height the only useful question is which of those stages dropped it.
      if (localStorage.getItem('melis-autofit-debug')) {
        console.debug('[autofit]', { itemId, contentPx, rows: contentPxToGridRows(contentPx), cols, currentH: layoutRef.current.find((l) => l.i === itemId)?.h })
      }
      // Under a responsive breakpoint GridStack SCALES heights (`columnOpts.layout: 'moveScale'`):
      // writing a desktop height into the PERSISTED layout would corrupt it. We still fix the tile
      // VISUALLY though — returning early here was leaving every widget at its declared height on
      // any viewport under 1024px, which is precisely when content clips hardest.
      if (cols !== GRID_COLS) {
        const node = grid.engine.nodes.find((n) => n.id === itemId)
        const rowsNow = contentPxToGridRows(contentPx)
        if (node?.el && node.h !== rowsNow) {
          mutating.current = true
          grid.update(node.el as HTMLElement, { h: rowsNow })
          mutating.current = false
        }
        return
      }
      // Within ONE fit cycle keep the tallest reading — a chart that draws late makes the document
      // grow, and we must not shrink back onto content that has just appeared. A NEW cycle (the
      // tile was resized, so the content reflowed) starts from scratch and may shrink the tile.
      const prev = fittedRows.current.get(itemId)
      const sameCycle = prev !== undefined && fitCycles.current.get(itemId) === fitId
      const rows = sameCycle ? Math.max(contentPxToGridRows(contentPx), prev) : contentPxToGridRows(contentPx)
      const item = layoutRef.current.find((l) => l.i === itemId)
      if (!item || item.h === rows) return
      fittedRows.current.set(itemId, rows)
      fitCycles.current.set(itemId, fitId ?? 0)
      // `h` ONLY — never minH. Pinning the floor to the fitted height would block shrinking just
      // like the registry's old `minH: h` did.
      onChangeRef.current(layoutRef.current.map((l) => (l.i === itemId ? { ...l, h: rows } : l)))
    }
    window.addEventListener('melis:widget-autofit', onAutofit)
    return () => window.removeEventListener('melis:widget-autofit', onAutofit)
  }, [])

  // --- Sync ajout/suppression de widgets (diff par rapport à grid.engine.nodes) ---
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

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
  const title = widgetDef.titleLabel ?? t(widgetDef.titleKey)
  // Bouton config (engrenage) uniquement pour les widgets plugins legacy (qui ont un pluginName).
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
        onRemove={onRemove}
        onReload={reload}
        onConfig={pluginName ? () => setConfigOpen(true) : undefined}
      >
        <div className="relative h-full w-full">
          {reloading && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-card/70">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <WidgetErrorBoundary key={refreshKey} fallbackMessage={t('layout.widget_error')} retryLabel={t('layout.retry')}>
            {widgetDef.render()}
          </WidgetErrorBoundary>
        </div>
      </WidgetFrame>
      {pluginName && configOpen && (
        <WidgetConfigDialog pluginName={pluginName} title={title} onClose={() => setConfigOpen(false)} />
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

function readLayout(grid: GridStack, allWidgets: Record<string, WidgetDef>): GridItem[] {
  const saved = grid.save(false) as GridStackWidget[]
  return saved
    .filter((w) => w.id && allWidgets[widgetIdOf(w.id as string)])
    .map((w) => {
      const def = allWidgets[widgetIdOf(w.id as string)]
      return {
        i: w.id as string,
        x: w.x ?? 0,
        y: w.y ?? 0,
        w: w.w ?? 1,
        h: w.h ?? 1,
        minW: def.minW,
        // Always the REGISTRY's floor, never a persisted one: layouts saved before the auto-fit
        // work carry `minH` = the plugin's declared height, and re-persisting that value is what
        // made hand-resized tiles spring back.
        minH: def.minH,
      }
    })
}
