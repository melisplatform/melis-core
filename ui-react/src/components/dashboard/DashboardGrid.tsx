import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type ErrorInfo } from 'react'
import { createPortal } from 'react-dom'
import { GridStack, type GridStackNode, type GridStackWidget } from 'gridstack'
import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react'

import 'gridstack/dist/gridstack.min.css'

import { useI18n } from '@/i18n/i18n-context'
import { WIDGET_MAP, type WidgetDef } from './widget-registry'
import { WidgetFrame } from './WidgetFrame'
import { WidgetConfigDialog } from './WidgetConfigDialog'
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

export const GRID_COLS = 12
const CELL_HEIGHT = 46
const MARGIN = 8

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
          layout: 'moveScale',
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

    if (!toAdd.length && !toRemove.length) return

    mutating.current = true
    grid.batchUpdate()

    for (const it of toAdd) {
      const el = grid.addWidget({
        x: it.x,
        y: it.y,
        w: it.w,
        h: it.h,
        minW: it.minW,
        minH: it.minH,
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
          <WidgetErrorBoundary key={refreshKey}>
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
        minH: def.minH,
      }
    })
}
