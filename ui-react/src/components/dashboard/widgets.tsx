import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useI18n } from '@/i18n/i18n-context'
import { formatRelativeHours } from '@/lib/format'
import { useDashboardData } from './dashboard-data-context'

export function ActivityContent() {
  const { t, lang } = useI18n()
  const { stats } = useDashboardData()

  // Données réelles : dernières connexions utilisateurs.
  if (stats) {
    if (!stats.activity.length) {
      return <p className="text-sm text-muted-foreground">{t('dash.recent_activity')}</p>
    }
    return (
      <ul className="space-y-4">
        {stats.activity.map((a) => {
          const hoursAgo = a.loginDate
            ? Math.max(1, Math.round((Date.now() - new Date(a.loginDate).getTime()) / 3_600_000))
            : 0
          return (
            <li key={a.id} className="flex items-start gap-3">
              <Avatar className="size-8">
                <AvatarFallback className="text-[11px]">
                  {a.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{a.name}</span>{' '}
                  {t('act.connected')}
                </p>
                {hoursAgo > 0 && (
                  <p className="text-xs text-muted-foreground/70">
                    {formatRelativeHours(hoursAgo, lang)}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  // Squelette de chargement — SURTOUT PAS de données de démonstration : d'anciens mocks
  // (« Camille published Accueil »…) s'affichaient ici le temps du fetch et se lisaient comme
  // de vraies connexions utilisateurs.
  return (
    <ul className="space-y-4" aria-busy="true">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-start gap-3">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="min-w-0 flex-1 space-y-1.5 py-0.5">
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/4 animate-pulse rounded bg-muted/70" />
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Real content height of a legacy plugin document, in px.
 *
 * `scrollHeight` alone under-reports it: it ignores the bottom margin of the last in-flow child
 * and gives nothing useful for content taken out of flow. The legacy dashboard markup hits both
 * cases — e.g. `.grid-stack-item-content .flotchart-holder` carries `margin-top: 60px`
 * (styles.css) and the KPI/table row sits below a floated block. Under-measuring is exactly what
 * clips the bottom of the tile, so we take the furthest bottom edge of every top-level element,
 * margins included, and keep the largest of all readings.
 */
function measureContentPx(doc: Document): number {
  const win = doc.defaultView
  let px = Math.max(doc.documentElement?.scrollHeight ?? 0, doc.body?.scrollHeight ?? 0)
  const body = doc.body
  if (!body || !win) return Math.ceil(px)
  // Offset of the document's top edge, so rect.bottom (viewport-relative) becomes document-relative.
  const scrollY = win.scrollY || doc.documentElement?.scrollTop || 0
  for (const el of Array.from(body.children) as HTMLElement[]) {
    const rect = el.getBoundingClientRect()
    if (rect.height === 0) continue // hidden chrome (the fake tab strip, script tags…)
    const marginBottom = parseFloat(win.getComputedStyle(el).marginBottom) || 0
    px = Math.max(px, rect.bottom + scrollY + marginBottom)
  }
  return Math.ceil(px)
}

/** Renders a legacy Melis dashboard plugin (PHP) inside an iframe. */
export function LegacyPluginContent({ pluginName }: { pluginName: string }) {
  // Un widget plugin legacy est une iframe qui charge tout le bundle de la plateforme →
  // ça peut prendre plusieurs secondes. On affiche un spinner tant que l'iframe n'a pas
  // fini de charger (onLoad) : couvre le 1er affichage ET chaque rechargement (remontage).
  const [loading, setLoading] = useState(true)

  // Les graphiques flot sont des CANVAS dessinés une fois, à la largeur du conteneur au moment du
  // rendu. Redimensionner la tuile agrandit l'iframe mais pas le canvas : le graphique reste étroit
  // avec du blanc à droite. `jquery.flot.resize` sait redessiner — il écoute l'événement `resize`
  // de SA fenêtre, qu'un redimensionnement de l'iframe ne déclenche pas. On le lui envoie donc.
  const frameRef = useRef<HTMLIFrameElement>(null)

  // ── Auto-fit the tile height to the plugin's real content ────────────────────────────────
  // A legacy plugin DECLARES its height in the classic BO's grid (cf. grid-metrics.ts); that
  // figure is a guess and is routinely wrong here — too tall (dead space) or too short (clipped
  // content). Once the iframe has loaded we measure the document and tell the grid.
  //
  // A fit runs on load AND whenever the tile's WIDTH changes: narrowing the plugin reflows its
  // content taller (tables wrap, the chart's legend stacks), which is precisely when a fixed
  // height starts clipping. Height changes never trigger a fit — that would fight the user's own
  // vertical resize, and would feed back on itself.
  //
  // `fitId` marks one fit cycle. Within a cycle the grid keeps the TALLEST reading (a chart that
  // draws late makes the document grow); a new cycle starts fresh, so a re-fit is free to SHRINK
  // the tile when the content genuinely got shorter.
  const fittedRef = useRef(false)
  const fitIdRef = useRef(0)
  function reportContentHeight() {
    const frame = frameRef.current
    if (!frame) return
    // The grid node carries the item id GridStack knows this tile by; reading it from the DOM
    // avoids threading the id through WidgetDef.render(), which takes no arguments.
    const item = frame.closest('.grid-stack-item') as (HTMLElement & { gridstackNode?: { id?: string } }) | null
    const itemId = item?.gridstackNode?.id
    if (!itemId) return
    let px = 0
    try {
      const doc = frame.contentDocument
      if (!doc) return // not ready / cross-origin — nothing to measure
      px = measureContentPx(doc)
    } catch {
      return // cross-origin guard — never let a measurement break the widget
    }
    if (px <= 0) return
    window.dispatchEvent(
      new CustomEvent('melis:widget-autofit', { detail: { itemId, contentPx: px, fitId: fitIdRef.current } }),
    )
  }

  // Starts a fit cycle. The authoritative readings come from the plugin document itself
  // (postMessage, see `__melisPluginHeight` in PluginViewController) — it knows exactly when its
  // charts have finished drawing, which no parent-side timer can. These local measurements are
  // only a fallback for a page served before that reporter existed (stale opcache, cached HTML).
  function runFit() {
    fitIdRef.current += 1
    fitTimers.current.forEach(window.clearTimeout)
    reportContentHeight()
    fitTimers.current = [150, 400, 1000].map((ms) => window.setTimeout(reportContentHeight, ms))
  }

  // Heights pushed by the plugin document. Accepted for the CURRENT fit cycle, so a late chart
  // draw still grows the tile, while the user's own vertical resize is never overridden later on.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data as { __melisPluginHeight?: boolean; px?: number } | null
      if (!d || !d.__melisPluginHeight || !d.px) return
      // Several plugin iframes are mounted at once — only react to OUR document's reports.
      if (!frameRef.current || e.source !== frameRef.current.contentWindow) return
      const item = frameRef.current.closest('.grid-stack-item') as (HTMLElement & { gridstackNode?: { id?: string } }) | null
      const itemId = item?.gridstackNode?.id
      if (!itemId) return
      window.dispatchEvent(
        new CustomEvent('melis:widget-autofit', { detail: { itemId, contentPx: d.px, fitId: fitIdRef.current } }),
      )
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  function handleLoad() {
    setLoading(false)
    if (fittedRef.current) return // a reload must not restart the initial fit
    fittedRef.current = true
    runFit()
  }

  // `onLoad` can't return a cleanup, so the settle timers are cancelled on unmount here —
  // otherwise removing a widget right after adding it would measure a detached iframe.
  const fitTimers = useRef<number[]>([])
  useEffect(() => () => fitTimers.current.forEach(window.clearTimeout), [])

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    let pending = 0
    let lastWidth = 0
    const ro = new ResizeObserver(() => {
      // Coalescé en une frame : un drag de redimensionnement émet des dizaines d'événements.
      if (pending) return
      pending = requestAnimationFrame(() => {
        pending = 0
        try {
          frame.contentWindow?.dispatchEvent(new Event('resize'))
        } catch {
          /* iframe pas encore prête / cross-origin : sans effet */
        }
        // Re-fit the height only on a WIDTH change — reacting to height would fight the user's
        // own vertical resize and loop on the change we just made. Rounded: sub-pixel jitter from
        // the grid's animation must not count as a resize. Debounced behind `runFit`'s own
        // staggered readings, which land after flot has redrawn on the `resize` above.
        const width = Math.round(frame.getBoundingClientRect().width)
        if (width > 0 && lastWidth > 0 && width !== lastWidth && fittedRef.current) runFit()
        if (width > 0) lastWidth = width
      })
    })
    ro.observe(frame)
    return () => {
      if (pending) cancelAnimationFrame(pending)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-card/70">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <iframe
        ref={frameRef}
        src={`/melis/react-dashboard-plugin?plugin=${encodeURIComponent(pluginName)}`}
        className="h-full w-full border-0"
        title={pluginName}
        style={{ minHeight: 120 }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        onLoad={handleLoad}
      />
    </div>
  )
}
