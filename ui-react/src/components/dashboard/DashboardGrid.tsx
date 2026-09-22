import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type ErrorInfo } from 'react'
import { createPortal } from 'react-dom'
import { GridStack, Utils as GridStackUtils, type GridStackNode, type GridStackWidget } from 'gridstack'

import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react'

import 'gridstack/dist/gridstack.min.css'

import { useI18n } from '@/i18n/i18n-context'
import { AUTOFIT_TOLERANCE_PX, CELL_HEIGHT, GRID_COLS, MARGIN, contentPxToGridRows } from './grid-metrics'
import { WIDGET_MAP, type WidgetDef } from './widget-registry'
import { WidgetFrame } from './WidgetFrame'
import { WidgetConfigDialog } from './WidgetConfigDialog'
import { PluginConfirmDialog } from './PluginConfirmDialog'
import { widgetIdOf, type GridItem } from './dashboard-store'
import { installResizeScrollDownOnly } from './gridstack-resize-scroll'

// Resizing a tile must never auto-scroll the page UP (Mantis #0011019) — see gridstack-resize-scroll.ts.
installResizeScrollDownOnly(GridStackUtils)

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
  highlightedId = null,
}: {
  layout: GridItem[]
  onChange: (items: GridItem[]) => void
  onRemove: (widgetId: string) => void
  extraWidgetMap?: Record<string, WidgetDef>
  /** Widget à flasher/scroller en vue — cliqué depuis le panneau de structure (cf. DashboardPage). */
  highlightedId?: string | null
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
  // Dernier nombre de colonnes vu (12 / 6 / 1) — pour détecter un RETOUR à 12 colonnes, cf. init.
  const lastCols = useRef(GRID_COLS)
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
        // < 640px → 1 colonne (widgets empilés), < 768px → 6 colonnes, sinon 12.
        // GridStack mémorise le layout 12-col d'origine et le restaure en élargissant.
        //
        // ⚠️ Seuil des 6 colonnes abaissé de 1024 à 768px. Sur un écran de ~1600px, barre latérale
        // (256px) + panneau de structure (340px) ouverts laissent ≈ 990px à la grille : elle basculait
        // en 6 colonnes sur un simple poste de bureau. Or en mode 6 colonnes, PAR CONSTRUCTION, ni le
        // layout 12 colonnes n'est appliqué à la grille (`toResize` gardé plus bas), ni ses `change`
        // ne sont persistés (`grid.on('change')`) : la grille montrait un ré-agencement mis à
        // l'échelle (une tuile « déplacée » que personne n'avait bougée), le panneau de structure le
        // vrai layout 12 colonnes, et un déplacement à la souris n'était ni reflété ni enregistré
        // (rapport utilisateur). 768px = tablette : en dessous, l'écran est vraiment étroit.
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
            { w: 768, c: 6 },
          ],
        },
        // Accepte les éléments internes du grid ET les items palette (setupDragIn).
        acceptWidgets: (el: Element) => !!(el as HTMLElement & { gridstackNode?: { id?: string } }).gridstackNode?.id,
      },
      containerRef.current!,
    )
    gridRef.current = grid
    lastCols.current = grid.getColumn()

    // Ré-applique le layout React (source de vérité, 12 colonnes) à la grille — même chemin que
    // l'effet [layout] plus bas, sous `mutating` pour que le `change` induit ne reparte pas en base.
    const reapplyLayout = () => {
      mutating.current = true
      try {
        grid.batchUpdate()
        grid.load(
          layoutRef.current.map((it) => {
            const def = allWidgetsRef.current[widgetIdOf(it.i)]
            return { id: it.i, x: Math.round(it.x), y: Math.round(it.y), w: Math.round(it.w), h: Math.round(it.h), minW: def?.minW ?? it.minW, minH: def?.minH ?? it.minH }
          }),
          false,
        )
        grid.engine.batchUpdate(false, false)
        ;(grid as unknown as { _updateContainerHeight: () => void })._updateContainerHeight()
      } catch (err) {
        console.error('[DashboardGrid] reapply after column change failed', err)
        try { grid.engine.batchUpdate(false, false) } catch { /* ignore */ }
      } finally {
        mutating.current = false
      }
    }
    // Retour à 12 colonnes depuis un mode responsive (1 ou 6) : GridStack RECALCULE les positions
    // lui-même — depuis son cache 12 colonnes s'il en a un (écrit seulement en RÉTRÉCISSANT), sinon
    // (grille INITIALISÉE en 6 colonnes : barre latérale + panneau ouverts sur un écran modeste) par
    // mise à l'échelle `layout: 'move'` : `x` multiplié par 12/6, `w` conservé. Un widget en x=4
    // atterrissait en x=8, entrait en collision avec celui déjà en x=8 et était repoussé en dessous
    // (y=13) — et ce `change`, émis une fois à 12 colonnes, était PERSISTÉ comme une action de
    // l'utilisateur : le panneau de structure et la base montraient une tuile que personne n'avait
    // déplacée (rapport utilisateur). La grille n'est PAS la source de vérité sur une transition de
    // colonnes : on lui ré-applique le layout React et on n'enregistre rien.
    const onColumnsMaybeChanged = (): boolean => {
      const cols = grid.getColumn()
      const prev = lastCols.current
      lastCols.current = cols
      if (cols === GRID_COLS && prev !== GRID_COLS) {
        reapplyLayout()
        return true
      }
      return false
    }

    grid.on('change', () => {
      if (mutating.current) return
      // Ne persiste QUE le layout en pleine largeur (12 col). Un reflow responsive
      // (1 ou 6 col) ne doit pas écraser les positions desktop sauvegardées.
      if (grid.getColumn() !== GRID_COLS) { lastCols.current = grid.getColumn(); return }
      if (onColumnsMaybeChanged()) return
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
    // FILET après tout geste (drag / resize) : GridStack a pu déplacer des VOISINES (collision,
    // `float:false`) — et un `change` peut se perdre (garde `mutating` active à cet instant, événement
    // avalé…). Plutôt que d'exiger que chaque `change` arrive, on relit les nœuds RÉELS une fois le
    // geste terminé et on rapatrie ce qui diffère du layout React, par le même `onChange` qu'un
    // `change` normal — sinon la grille se ré-agence sous les yeux de l'utilisateur pendant que le
    // panneau de structure (état React) reste figé (rapport utilisateur : « resizing in the
    // dashboard auto-arranges the plugins but the right panel is not reflecting »). Différé d'un
    // court instant pour laisser GridStack finir son propre `change`/rangement de fin de geste.
    const reconcile = () => {
      if (mutating.current || interacting.current || grid.getColumn() !== GRID_COLS) return
      const actual = readLayout(grid, allWidgetsRef.current, userSized.current, layoutRef.current)
      const byId = new Map(actual.map((n) => [n.i, n]))
      const drifted = layoutRef.current.some((l) => {
        const n = byId.get(l.i)
        return !!n && (Math.round(l.x) !== n.x || Math.round(l.y) !== n.y || Math.round(l.w) !== n.w || Math.round(l.h) !== n.h)
      })
      if (drifted) onChangeRef.current(actual)
    }
    const scheduleReconcile = () => { window.setTimeout(reconcile, 300) }
    grid.on('resizestop', () => { interacting.current = false; scheduleReconcile() })
    grid.on('dragstart', () => { if (!mutating.current) interacting.current = true })
    grid.on('dragstop', () => { interacting.current = false; scheduleReconcile() })

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
      // ⚠️ `try/finally` comme dans l'effet [layout] : une exception ici (removeWidget sur un nœud
      // déjà détaché, contrainte GridStack…) laissait `mutating` bloqué à `true` À VIE — plus AUCUN
      // `change` GridStack n'atteignait React ensuite : un déplacement à la souris dans le dashboard
      // n'était ni reflété dans le panneau de structure, ni enregistré (rapport utilisateur).
      try {
      grid.batchUpdate()
      for (const node of items) {
        const id = node.id as string
        // ⚠️ NE PAS TOUCHER aux tuiles que NOUS avons posées (`addWidget` de l'effet [layout] — leur
        // contenu porte le `data-widget-id` qu'on y écrit aussitôt). GridStack DIFFÈRE sa notification
        // `added` : elle ne part pas à notre `engine.batchUpdate(false, false)` mais au prochain
        // déclencheur interne — typiquement le changement de colonnes responsive (12 → 6 sous
        // 1024px de large de grille) — donc APRÈS que `mutating` est retombé à `false`. Ce handler
        // prenait alors nos propres tuiles pour des clones de palette et les `removeWidget`ait
        // TOUTES : dashboard vidé quelques centaines de ms après l'affichage dès que le panneau de
        // structure + la barre latérale laissaient moins de 1024px à la grille, pendant que le
        // panneau de structure (état React intact) continuait d'afficher les widgets — grille et
        // panneau ne se correspondaient plus (rapport utilisateur).
        if ((node.el as HTMLElement | undefined)?.querySelector('.grid-stack-item-content[data-widget-id]')) continue
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
      } finally {
        try { grid.batchUpdate(false) } catch { /* le lot doit se refermer quoi qu'il arrive */ }
        mutating.current = false
      }
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

    // ⚠️ GridStack ne ré-évalue ses breakpoints de colonnes (columnOpts) que sur un `resize` de la
    // FENÊTRE. Or la largeur de la grille change surtout SANS que la fenêtre bouge : barre latérale
    // repliée/dépliée, panneau de structure ouvert/fermé. Chargée avec ~990px (barre + panneau
    // ouverts) la grille partait en 6 colonnes, et y RESTAIT une fois la barre repliée (1220px) —
    // avec tout ce que le mode 6 colonnes désactive (cf. columnOpts ci-dessus). On observe donc le
    // conteneur lui-même et on redonne la main à `onResize()` (API publique : recalcule le nombre
    // de colonnes courant d'après la largeur réelle).
    // Si la transition de colonnes n'émet aucun `change` (positions du cache identiques), le
    // détecteur ci-dessus ne verrait le retour à 12 colonnes qu'au PROCHAIN `change` — un vrai
    // déplacement de l'utilisateur, qu'il prendrait alors pour la transition et annulerait. D'où
    // cette seconde vérification, juste après le recalcul des colonnes.
    const ro = new ResizeObserver(() => { try { grid.onResize(); onColumnsMaybeChanged() } catch { /* grille détruite entre-temps */ } })
    ro.observe(containerRef.current!)

    return () => {
      ro.disconnect()
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
      // « desktop » dans le layout PERSISTÉ le corromprait. On corrige alors seulement l'affichage
      // (`grid.update`, jamais `onChange`) — rien ne part en base depuis cette branche.
      //
      // ⚠️ Cette branche ne savait qu'AGRANDIR (`rows > node.h`). Or sur un téléphone la grille est
      // TOUJOURS à 1 colonne : l'ajustement au contenu n'y rétrécissait donc JAMAIS. Symptôme
      // constaté : dans un plugin dont on déplie une ligne (tables repliables des tuiles étroites),
      // la tuile passait de 782 à 966px à l'ouverture et RESTAIT à 966 après refermeture — une
      // bande vide sous le contenu. Idem pour tout plugin dont le contenu raccourcit (filtre plus
      // sélectif, pagination). On autorise donc les DEUX sens, en reprenant à l'identique le
      // garde-fou anti-cliquet du chemin 12 colonnes : un plugin dont la mesure SUIT la hauteur de
      // l'iframe (hauteurs en %) verrait sinon sa tuile se réduire à chaque passage.
      if (grid.getColumn() !== GRID_COLS) {
        const node = grid.engine.nodes.find((n) => n.id === itemId)
        if (!node?.el) return
        const el = node.el as HTMLElement
        const currentH = node.h ?? 0
        const applyH = (h: number) => {
          mutating.current = true
          grid.update(el, { h })
          mutating.current = false
        }
        // Vérification du rétrécissement précédent (même contrat que plus bas) : si la mesure a
        // BAISSÉ après qu'on a réduit la tuile, elle est circulaire → on restaure et on interdit
        // définitivement de réduire cette tuile.
        const probeR = shrinkProbe.current.get(itemId)
        if (probeR) {
          shrinkProbe.current.delete(itemId)
          if (contentPx < probeR.px - AUTOFIT_TOLERANCE_PX) {
            noShrink.current.add(itemId)
            applyH(probeR.fromRows)
            return
          }
        }
        if (rows === currentH) return
        if (rows < currentH) {
          if (noShrink.current.has(itemId)) return
          shrinkProbe.current.set(itemId, { fromRows: currentH, px: contentPx })
        }
        applyH(rows)
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
    // Tuiles déjà en place, dont la position/taille peut avoir changé côté React : recalage des
    // plugins legacy une fois leurs défs chargées (hauteur), MAIS AUSSI tout réordonnancement fait
    // depuis le panneau de structure (x/y, cf. DashboardStructurePanel → renumberRows) — les DEUX
    // composants lisent/écrivent le MÊME `layout` (DashboardPage). Confié à `grid.load(items, false)`
    // plutôt qu'à un diff+`update()` fait main par nœud : `load()` est l'API GridStack DÉDIÉE à faire
    // correspondre une grille à un layout externe sauvegardé (elle appelle `update()` par id en
    // interne, en ignorant tout item déjà à la bonne place) — plus fiable qu'une comparaison
    // maison, sujette aux angles morts. `addRemove: false` : ajout/retrait restent gérés par `toAdd`/
    // `toRemove` ci-dessous (identité `i` stable, pas besoin que `load()` s'en charge aussi).
    const toResize = layout.filter((l) => inGrid.has(l.i))

    if (!toAdd.length && !toRemove.length && !toResize.length) return

    // Positions RÉELLES relues après le lot (cf. plus bas) — `null` tant que rien n'a été relu.
    let actual: GridItem[] | null = null
    mutating.current = true
    // ⚠️ TOUT le corps du lot est en `try/finally` : une exception en plein milieu (ex. un widget
    // sans `.el` retrouvé, une contrainte GridStack inattendue) laissait sinon `mutating.current`
    // bloqué à `true` À VIE — plus aucun `grid.on('change', …)` n'était alors jamais transmis à
    // React (garde `if (mutating.current) return`), ET le lot GridStack lui-même restait ouvert
    // (jamais de `batchUpdate(false)`), les tuiles gelées dans leur état transitoire — symptôme
    // observé : tout le dashboard vidé après une synchro qui a mal tourné. Le `finally` garantit que
    // le lot se referme et que `mutating` retombe à `false` quoi qu'il arrive.
    try {
      grid.batchUpdate()

      // ⚠️ UNIQUEMENT en pleine largeur (12 col). Sous un breakpoint responsive, GridStack MET À
      // L'ÉCHELLE les positions/hauteurs (`columnOpts.layout: 'moveScale'`) : la valeur du layout
      // desktop ne correspond alors plus à rien de cohérent à cette échelle — l'appliquer telle
      // quelle romprait le repli responsive plutôt que de le respecter.
      if (toResize.length && grid.getColumn() === GRID_COLS) {
        // ⚠️ Deux tentatives pour éviter la collision temps réel de `float:false` sur un
        // redimensionnement qui déplace aussi un voisin (déplacer les tuiles vers une ligne tampon,
        // puis simplement réordonner qui est traité en premier) ont CHACUNE fait disparaître tout le
        // dashboard — y compris la seconde, qui ne déplaçait pourtant jamais rien ailleurs qu'à la
        // position FINALE. La cause réelle reste donc inconnue ; ni le déplacement temporaire ni
        // l'ordre de traitement n'en sont individuellement responsables. Reste sur l'appel direct,
        // le seul dont le comportement est confirmé stable même s'il peut demander plusieurs
        // frappes pour un redimensionnement qui touche aussi un voisin — un dashboard qui répond
        // lentement à un cas précis vaut largement mieux qu'un dashboard qui se vide.
        grid.load(
          toResize.map((it) => {
            const def = allWidgetsRef.current[widgetIdOf(it.i)]
            return {
              id: it.i,
              x: Math.round(it.x),
              y: Math.round(it.y),
              w: Math.round(it.w),
              h: Math.round(it.h),
              // Registry FIRST: a layout persisted before the auto-fit work carries the plugin's
              // declared height as `minH`, which would clamp the tile straight back on resize.
              minW: def?.minW ?? it.minW,
              minH: def?.minH ?? it.minH,
            }
          }),
          false,
        )
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

      // ⚠️ PAS `grid.batchUpdate(false)` ici : sa valeur par défaut EMPAQUETTE les tuiles (rappel
      // gravité : `_packNodes()`, `doPack=true` par défaut, AUCUNE option publique pour le
      // désactiver sur `GridStack.batchUpdate`) — ce qui écrasait silencieusement les positions
      // qu'on venait de demander explicitement (`grid.load(...)` ci-dessus) par le rangement « le
      // plus compact » choisi par GridStack, indépendant de l'agencement voulu par le panneau de
      // structure. On termine donc le lot via `engine.batchUpdate(false, false)` — même méthode
      // interne, mais avec `doPack` explicitement à `false`, exposée celle-ci en public sur
      // l'engine (cf. gridstack-engine.d.ts).
      grid.engine.batchUpdate(false, false)
      // Effet de bord manquant de `grid.batchUpdate(false)` qu'on a court-circuité ci-dessus (repli
      // sur l'engine pour éviter l'empaquetage) : recalcule la hauteur CSS du conteneur
      // `.grid-stack` pour qu'elle suive le nouveau nombre de lignes. Privée (pas d'équivalent
      // public dans gridstack.d.ts), d'où le contournement de type ici.
      ;(grid as unknown as { _updateContainerHeight: () => void })._updateContainerHeight()
      // RELECTURE des positions RÉELLES une fois le lot refermé. `float:false` : quand `load()`
      // ci-dessus AGRANDIT une tuile (auto-fit au chargement, champ H du panneau…), GridStack
      // POUSSE lui-même vers le bas les voisines du dessous (résolution de collision) — des
      // déplacements que nous n'avons pas demandés, et dont le `change` émis est IGNORÉ (garde
      // `mutating` du `grid.on('change')`, indispensable contre les boucles). L'état React — donc
      // le panneau de structure, qui en rend une copie réduite en grille CSS — gardait alors les
      // anciens `y` : « Prospects »/« Indicators » restaient à y=4 sous un « Workflow » passé de 4
      // à 10 lignes → dans le panneau, cartes qui SE CHEVAUCHENT + trou (rapport utilisateur,
      // capture), et un `y` faux persisté en base. 12 colonnes seulement : sous un breakpoint
      // responsive les positions sont remises à l'échelle et ne doivent jamais repartir en base.
      if (grid.getColumn() === GRID_COLS) actual = readLayout(grid, allWidgetsRef.current, userSized.current, layout)
    } catch (err) {
      console.error('[DashboardGrid] sync failed, recovering', err)
      // Repli MINIMAL : referme le lot SANS empaqueter (même raisonnement que ci-dessus — on ne
      // veut pas qu'un rattrapage sur erreur réintroduise le bug de compactage) pour que GridStack
      // sorte du mode batch quoi qu'il arrive, plutôt que de rester bloqué avec des tuiles gelées
      // dans un état transitoire (parfois hors champ) — c'est CE blocage, pas l'erreur elle-même,
      // qui faisait disparaître tout le dashboard.
      try {
        grid.engine.batchUpdate(false, false)
      } catch {
        /* ignore — au pire le prochain changement de layout retentera une synchro propre */
      }
    } finally {
      mutating.current = false
    }

    // Un nœud diffère-t-il, une fois posé, du layout demandé ? `x`/`y` : GridStack l'a DÉPLACÉ
    // (collision, cf. ci-dessus). `w`/`h` : GridStack l'a BORNÉ à `minW`/`minH` du widget — un `w`
    // de 1 saisi dans le champ W du panneau pour un widget à `minW` 2 était affiché sur 2 colonnes
    // dans le dashboard mais sur 1 seule dans le panneau, qui laissait donc une colonne VIDE entre
    // deux tuiles pourtant jointives dans la grille (rapport utilisateur). Ce que la grille affiche
    // fait foi : on rapatrie les quatre valeurs, UNIQUEMENT si quelque chose diffère, via le même
    // `onChange` qu'un vrai `change` GridStack (→ `persist`, la base reçoit les valeurs réelles).
    // Le layout corrigé revient dans cet effet, `load()` n'a plus rien à changer, la relecture est
    // identique → aucun nouvel `onChange` : ça converge en un tour, pas de boucle. `userSized`,
    // `legacyH`… restent pilotés par React.
    if (actual) {
      const byId = new Map(actual.map((n) => [n.i, n]))
      let changed = false
      const synced = layout.map((l) => {
        const n = byId.get(l.i)
        if (!n || (Math.round(l.x) === n.x && Math.round(l.y) === n.y && Math.round(l.w) === n.w && Math.round(l.h) === n.h)) return l
        changed = true
        return { ...l, x: n.x, y: n.y, w: n.w, h: n.h }
      })
      if (localStorage.getItem('melis-autofit-debug')) {
        console.debug('[grid-sync]', { changed, layout: layout.map((l) => `${l.i}:${l.x},${l.y},${l.w},${l.h}`), grid: actual.map((n) => `${n.i}:${n.x},${n.y},${n.w},${n.h}`) })
      }
      if (changed) onChangeRef.current(synced)
    }

    setSlots(slotsFromGrid(grid))
  }, [layout]) // Dépend uniquement de layout, pas de slots.

  // Flash + scroll en vue le widget cliqué depuis le panneau de structure (cf. `highlightWidget`,
  // DashboardPage) — recherche directe dans les nœuds GridStack (pas de ref React par tuile ici,
  // contrairement au panneau) : ajoute une classe CSS temporaire (cf. index.css) le temps du flash
  // que DashboardPage retire déjà lui-même de son état après ~1,6s.
  useEffect(() => {
    if (!highlightedId) return
    const node = gridRef.current?.engine.nodes.find((n) => n.id === highlightedId)
    const el = node?.el as HTMLElement | undefined
    if (!el) return
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    el.classList.add('melis-widget-highlight')
    const timer = window.setTimeout(() => el.classList.remove('melis-widget-highlight'), 1600)
    // ⚠️ Retire aussi la classe ICI, pas seulement le timer : un clic sur un AUTRE widget avant les
    // 1,6s change `highlightedId` → cet effet se nettoie AVANT que son propre timeout n'ait eu la
    // chance de retirer la classe sur CET élément-ci — sans ce retrait explicite, le contour restait
    // affiché indéfiniment sur le widget quitté (`clearTimeout` seul n'annule que l'ACTION future,
    // pas l'état déjà posé sur le DOM). Sans effet si le timeout a déjà tourné (classe déjà absente).
    return () => {
      window.clearTimeout(timer)
      el.classList.remove('melis-widget-highlight')
    }
  }, [highlightedId])

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
  // ⚠️ Lu sur `engine.nodes`, PAS via `grid.save()` : `save()` ÉLAGUE les « valeurs par défaut »
  // (Utils.removeInternalForSave) — dont `w` quand il vaut `minW` et `h` quand il vaut `minH`. Le
  // repli `?? 1` ci-dessous rendait alors `w = 1` pour toute tuile posée À SA LARGEUR MINIMALE (2
  // colonnes pour la plupart des plugins) : chaque déplacement d'une telle tuile persistait `w = 1`,
  // la grille la ré-affichait sur 2 (plancher), mais le panneau de structure — qui lit le layout
  // React — la dessinait sur 1 et laissait une colonne VIDE entre deux tuiles pourtant jointives
  // (rapport utilisateur). Les nœuds du moteur portent toujours x/y/w/h réels.
  const saved: GridStackWidget[] = grid.engine.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, w: n.w, h: n.h }))
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
