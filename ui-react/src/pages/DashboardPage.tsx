import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, ChevronDown, ChevronUp, Download, LayoutGrid, MessageSquare, Newspaper, RotateCcw, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/i18n-context'
import { CURRENT_USER } from '@/lib/mocks'
import * as melisApi from '@/lib/melis-api'
import { DashboardGrid } from '@/components/dashboard/DashboardGrid'
import { WidgetPalette } from '@/components/dashboard/WidgetPalette'
import { WIDGET_MAP, buildLegacyWidgetDef, type WidgetDef } from '@/components/dashboard/widget-registry'
import {
  loadLayout,
  makeInstanceId,
  resetLayout,
  saveLayout,
  widgetIdOf,
  type GridItem,
} from '@/components/dashboard/dashboard-store'
import { DashboardDataContext } from '@/components/dashboard/dashboard-data-context'

const BUBBLES_HIDDEN_KEY = 'melis-dash-bubbles-hidden'

// Top "bubble" widgets, mirroring MelisCore's legacy dashboard bubble plugins.
const BUBBLES = [
  { key: 'news',          icon: Newspaper,     label: 'Actualités Melis' },
  { key: 'updates',       icon: Download,      label: 'Mises à jour' },
  { key: 'notifications', icon: Bell,          label: 'Notifications' },
  { key: 'messages',      icon: MessageSquare, label: 'Messages' },
] as const

export default function DashboardPage() {
  const { t } = useI18n()

  // NOTE: do NOT openTab('/') here. DashboardPage is kept mounted (Shell) and lazy-loaded, so its
  // mount effect runs AFTER TabBridge's route-sync and would re-activate the Dashboard tab on EVERY
  // page (the tab content then shows under the wrong, Dashboard-highlighted tab). The Dashboard tab
  // always exists (initial state + the CLOSE guards); TabBridge activates it when the route is '/'.

  // Top bubble counts (News / Updates / Notifications / Messages).
  const [bubbles, setBubbles] = useState<melisApi.DashboardBubbles | null>(null)
  useEffect(() => {
    melisApi.fetchDashboardBubbles().then(setBubbles)
  }, [])

  // KPI stats + recent activity (données réelles).
  const [stats, setStats] = useState<melisApi.DashboardStats | null>(null)
  useEffect(() => {
    melisApi.fetchDashboardStats().then(setStats)
  }, [])

  // Legacy PHP dashboard plugins (loaded once at mount).
  const [legacyWidgets, setLegacyWidgets] = useState<WidgetDef[]>([])
  useEffect(() => {
    melisApi.fetchLegacyDashboardPlugins().then((plugins) => {
      setLegacyWidgets(plugins.map(buildLegacyWidgetDef))
    })
  }, [])

  // Hide/show the top bubble bar, remembered across sessions (like the legacy cookie).
  const [bubblesHidden, setBubblesHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BUBBLES_HIDDEN_KEY) === '1'
    } catch {
      return false
    }
  })
  const toggleBubbles = useCallback(() => {
    setBubblesHidden((hidden) => {
      const next = !hidden
      try {
        localStorage.setItem(BUBBLES_HIDDEN_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const [layout, setLayout] = useState<GridItem[]>(() => loadLayout())
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Priorité DB : au montage, charge depuis le serveur (écrase le cache localStorage si trouvé).
  useEffect(() => {
    melisApi.fetchDashboardLayout().then((dbLayout) => {
      if (dbLayout && dbLayout.length > 0) {
        setLayout(dbLayout)
        saveLayout(dbLayout)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const extraWidgetMap = useMemo(
    () => Object.fromEntries(legacyWidgets.map((w) => [w.id, w])),
    [legacyWidgets],
  )
  const allWidgetMap = useMemo(() => ({ ...WIDGET_MAP, ...extraWidgetMap }), [extraWidgetMap])

  // Ids de widget (pas d'instance) déjà présents — sert uniquement à afficher un
  // indicateur "déjà sur le dashboard" dans la palette, pas à bloquer un ré-ajout.
  const present = useMemo(() => new Set(layout.map((l) => widgetIdOf(l.i))), [layout])

  const persist = useCallback((next: GridItem[]) => {
    setLayout(next)
    saveLayout(next)
    melisApi.saveDashboardLayout(next)
  }, [])

  // Émis par GridStack après un déplacement / redimensionnement utilisateur.
  const handleChange = useCallback((items: GridItem[]) => persist(items), [persist])

  // Ajoute toujours une NOUVELLE instance — le même plugin peut être posé plusieurs fois.
  const addWidget = useCallback(
    (widgetId: string) => {
      const def = allWidgetMap[widgetId]
      if (!def) return
      const instanceId = present.has(widgetId) ? makeInstanceId(widgetId) : widgetId
      const maxY = layout.reduce((m, l) => Math.max(m, l.y + l.h), 0)
      persist([...layout, { i: instanceId, x: 0, y: maxY, w: def.w, h: def.h, minW: def.minW, minH: def.minH }])
    },
    [layout, present, allWidgetMap, persist],
  )

  // `instanceId` = id complet de l'item de grille (l.i), pas l'id du widget —
  // ne retire que l'instance ciblée, pas tous les exemplaires du même widget.
  const removeWidget = useCallback(
    (instanceId: string) => persist(layout.filter((l) => l.i !== instanceId)),
    [layout, persist],
  )

  const handleReset = useCallback(() => persist(resetLayout()), [persist])

  return (
    <DashboardDataContext.Provider value={{ stats }}>
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* En-tête */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-6 sm:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <svg viewBox="0 0 70 70" fill="currentColor" className="size-5">
                  <path d="M57.4,0c-4.8,0-8.6,3.9-8.6,8.6v49.2c0,4.8,3.9,8.6,8.6,8.6s8.6-3.9,8.6-8.6V8.7C66,3.9,62.2,0,57.4,0Z"/>
                  <path d="M16.3,4.6C14,.4,8.8-1.2,4.6,1,.4,3.2-1.2,8.5,1,12.7l26.1,49.3c2.2,4.2,7.4,5.8,11.7,3.6,4.2-2.2,5.8-7.4,3.6-11.7L16.3,4.6Z"/>
                  <circle cx="8.8" cy="57.7" r="8.8"/>
                </svg>
              </div>
              <h2 className="font-[var(--font-display)] text-xl font-bold tracking-tight sm:text-2xl">
                {t('dash.welcome', { name: CURRENT_USER.name })}
              </h2>
            </div>
            <p className="mt-1.5 text-muted-foreground">{t('dash.welcome_sub')}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="size-4" />
              {t('widget.reset')}
            </Button>
            <Button
              variant={paletteOpen ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaletteOpen((v) => !v)}
            >
              {paletteOpen ? <X className="size-4" /> : <LayoutGrid className="size-4" />}
              {t('widget.add')}
            </Button>
          </div>
        </div>

        {/* Bulles du haut (News / Mises à jour / Notifications / Messages) —
            équivalent React des dashboard bubble plugins de MelisCore.
            Masquables, état mémorisé (localStorage) comme la version d'origine. */}
        <div className="flex justify-center px-5 pt-3 sm:px-8">
          <button
            type="button"
            onClick={toggleBubbles}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            {bubblesHidden ? (
              <>Afficher la barre <ChevronDown className="size-3.5" /></>
            ) : (
              <>Cacher la barre <ChevronUp className="size-3.5" /></>
            )}
          </button>
        </div>

        {!bubblesHidden && (
          <div className="grid grid-cols-2 gap-3 px-5 pt-3 sm:px-8 sm:grid-cols-4 sm:gap-4">
            {BUBBLES.map((b) => {
              const Icon = b.icon
              const count = bubbles ? bubbles[b.key].count : 0
              return (
                <div
                  key={b.key}
                  className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-5 text-center"
                >
                  <Icon className="size-6 text-muted-foreground" />
                  <div className="mt-2 text-2xl font-bold leading-none">{count}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{b.label}</div>
                  {b.key === 'notifications' && count > 0 && (
                    <Button variant="outline" size="sm" className="mt-3">
                      Voir les notifications
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Grille */}
        <div className="min-h-0 flex-1 overflow-auto px-5 pb-8 pt-4 sm:px-8">
          {layout.length === 0 ? (
            <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-border text-center">
              <div className="max-w-xs text-sm text-muted-foreground">{t('widget.empty')}</div>
            </div>
          ) : (
            <DashboardGrid
              layout={layout}
              onChange={handleChange}
              onRemove={removeWidget}
              extraWidgetMap={extraWidgetMap}
            />
          )}
        </div>
      </div>

      {/* Palette d'ajout de widgets */}
      {paletteOpen && (
        <WidgetPalette
          present={present}
          onAdd={addWidget}
          onClose={() => setPaletteOpen(false)}
          extraWidgets={legacyWidgets}
        />
      )}
    </div>
    </DashboardDataContext.Provider>
  )
}
