import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bell, ChevronDown, ChevronUp, Download, MessageSquare, Newspaper, Plug } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Collapsible } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
import * as melisApi from '@/lib/melis-api'
import { DashboardGrid } from '@/components/dashboard/DashboardGrid'
import { WidgetPalette } from '@/components/dashboard/WidgetPalette'
import { WIDGET_MAP, buildLegacyWidgetDef, type WidgetDef } from '@/components/dashboard/widget-registry'
import {
  loadLayout,
  makeInstanceId,
  saveLayout,
  widgetIdOf,
  type GridItem,
} from '@/components/dashboard/dashboard-store'
import { DashboardDataContext } from '@/components/dashboard/dashboard-data-context'

const BUBBLES_HIDDEN_KEY = 'melis-dash-bubbles-hidden'

// Top "bubble" widgets, mirroring MelisCore's legacy dashboard bubble plugins.
const BUBBLES = [
  { key: 'news',          icon: Newspaper,     labelKey: 'dash.bubble.news' as I18nKey },
  { key: 'updates',       icon: Download,      labelKey: 'dash.bubble.updates' as I18nKey },
  { key: 'notifications', icon: Bell,          labelKey: 'dash.bubble.notifications' as I18nKey },
  { key: 'messages',      icon: MessageSquare, labelKey: 'dash.bubble.messages' as I18nKey },
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
  // La liste est déjà filtrée par les droits côté serveur (usr_rights → <melis_dashboardplugin>),
  // comme le menu du dashboard legacy : un plugin non accordé n'arrive tout simplement pas.
  const [legacyWidgets, setLegacyWidgets] = useState<WidgetDef[]>([])
  // Native React widgets (widget-registry) the user is granted. Native widgets are always registered
  // client-side, so without this gate a rights-less user would see them (e.g. "Recent activity",
  // ticket 0010740). Empty until loaded → gated out by default, restored once the fetch resolves.
  const [nativeGranted, setNativeGranted] = useState<Set<string>>(new Set())
  const [legacyLoaded, setLegacyLoaded] = useState(false)
  useEffect(() => {
    melisApi.fetchLegacyDashboardPlugins().then(({ plugins, nativeWidgets }) => {
      setLegacyWidgets(plugins.map(buildLegacyWidgetDef))
      setNativeGranted(new Set(nativeWidgets))
      setLegacyLoaded(true)
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
  // Native widgets, gated by the user's rights (granted set from the server). Ungranted ones are
  // absent from the map → pruned from the grid layout and hidden from the palette.
  const gatedNativeMap = useMemo(
    () => Object.fromEntries(Object.entries(WIDGET_MAP).filter(([id]) => nativeGranted.has(id))),
    [nativeGranted],
  )
  const gatedNativeWidgets = useMemo(() => Object.values(gatedNativeMap) as WidgetDef[], [gatedNativeMap])
  const allWidgetMap = useMemo(() => ({ ...gatedNativeMap, ...extraWidgetMap }), [gatedNativeMap, extraWidgetMap])

  // Ids de widget (pas d'instance) déjà présents — sert uniquement à afficher un
  // indicateur "déjà sur le dashboard" dans la palette, pas à bloquer un ré-ajout.
  const present = useMemo(() => new Set(layout.map((l) => widgetIdOf(l.i))), [layout])

  const persist = useCallback((next: GridItem[]) => {
    setLayout(next)
    saveLayout(next)
    melisApi.saveDashboardLayout(next)
  }, [])

  // Remonte les tuiles plus courtes que la hauteur de leur widget (contenu tronqué).
  //
  // ⚠️ Ne peut PAS se faire uniquement à la pose : les défs des plugins legacy arrivent d'un fetch
  // (`/react-dashboard-plugins`) postérieur au layout — au moment où le layout est appliqué, leur
  // hauteur de référence est encore inconnue. D'où ce recalage, qui se déclenche aussi quand les
  // défs arrivent. Idempotent (on ne persiste que si quelque chose change) → pas de boucle.
  //
  // Ne dépend QUE de `legacyWidgets` (le layout est lu via une ref) : re-déclenché à chaque
  // changement de layout, ce recalage se rejouerait après CHAQUE déplacement/redimensionnement
  // utilisateur — y compris pour annuler un redimensionnement volontaire.
  const layoutRef = useRef(layout)
  layoutRef.current = layout
  useEffect(() => {
    if (!legacyWidgets.length) return
    let changed = false
    const fixed = layoutRef.current.map((l) => {
      const def = allWidgetMap[widgetIdOf(l.i)]
      if (!def || l.h >= def.h) return l
      changed = true
      return { ...l, h: def.h, minW: def.minW, minH: def.minH }
    })
    if (changed) persist(fixed)
  }, [legacyWidgets, allWidgetMap, persist])

  // Élague de la grille sauvegardée les widgets dont la déf. est inconnue — typiquement un plugin
  // legacy retiré des droits de l'utilisateur (ou désinstallé) : sans ça sa tuile reste posée, vide.
  // Attend `legacyLoaded` : avant la réponse de /react-dashboard-plugins, TOUTES les défs legacy
  // sont inconnues et on viderait la grille. Ne dépend pas de `layout` (lu via la ref) pour ne pas
  // se rejouer à chaque déplacement.
  useEffect(() => {
    if (!legacyLoaded) return
    const kept = layoutRef.current.filter((l) => allWidgetMap[widgetIdOf(l.i)])
    if (kept.length !== layoutRef.current.length) persist(kept)
  }, [legacyLoaded, allWidgetMap, persist])

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

  // « Supprimer tous les plugins » — équivalent du `#dashboard-plugin-delete-all` legacy
  // (gridstack.init.js : `gridData.removeAll()` puis `saveDBWidgets`). `persist([])` fait les deux :
  // vide la grille ET enregistre en base, sinon les tuiles reviendraient au prochain chargement.
  // La confirmation est portée par la palette, comme le `melisCoreTool.confirm()` d'origine.
  const removeAllWidgets = useCallback(() => persist([]), [persist])

  return (
    <DashboardDataContext.Provider value={{ stats }}>
    {/* `relative` : référentiel de l'onglet d'ouverture, positionné en `right` pour coulisser avec
        la palette. `overflow-hidden` : pendant l'animation de largeur, la palette (largeur interne
        figée à 18rem) dépasse de son cadre — sans ça elle créerait une barre de défilement
        horizontale sur toute la page. */}
    <div className="relative flex h-full overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
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
              <>{t('dash.show_bar')} <ChevronDown className="size-3.5" /></>
            ) : (
              <>{t('dash.hide_bar')} <ChevronUp className="size-3.5" /></>
            )}
          </button>
        </div>

        {/* Barre de bulles repliable — `Collapsible` anime la hauteur (équivalent du slideUp/Down
            legacy). Le `pt-2` reste sur la grille INTERNE : posé sur le Collapsible, il subsisterait
            en barre d'espace vide une fois la barre masquée. */}
        <Collapsible open={!bubblesHidden}>
          <div className="grid grid-cols-4 gap-2 px-5 pt-2 sm:px-8">
            {BUBBLES.map((b) => {
              const Icon = b.icon
              const count = bubbles ? bubbles[b.key].count : 0
              return (
                <div
                  key={b.key}
                  className="flex items-center justify-center gap-2.5 rounded-lg border border-border bg-card px-3 py-3 text-center"
                >
                  <Icon className="size-5 shrink-0 text-muted-foreground" />
                  <span className="text-base font-bold leading-none">{count}</span>
                  <span className="truncate text-sm text-muted-foreground">{t(b.labelKey)}</span>
                </div>
              )
            })}
          </div>
        </Collapsible>

        {/* Grille */}
        <div className="min-h-0 flex-1 overflow-auto px-5 pb-8 pt-4 sm:px-8">
          {/* La grille reste TOUJOURS montée, même vide : c'est elle la cible de dépôt des
              widgets glissés depuis la palette. La remplacer par l'état vide retirait
              `.grid-stack` du DOM → après avoir retiré tous les widgets, plus rien n'acceptait
              un drop (seul le clic sur « + » fonctionnait encore). L'état vide passe donc en
              surimpression, en `pointer-events-none` pour ne pas intercepter le dépôt. */}
          <div className="relative">
            {layout.length === 0 && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg border border-dashed border-border text-center">
                <div className="max-w-xs text-sm text-muted-foreground">{t('widget.empty')}</div>
              </div>
            )}
            <DashboardGrid
              layout={layout}
              onChange={handleChange}
              onRemove={removeWidget}
              extraWidgetMap={extraWidgetMap}
            />
          </div>
        </div>
      </div>

      {/* Onglet d'ouverture — accroché au FLANC GAUCHE de la palette (legacy :
          `#melisDashBoardPluginBtn`, `position:absolute; left:-38px`, dashboard.css:189).
          Positionné en `right` par rapport à la page (et non dans le flux de l'en-tête) : c'est ce
          qui lui permet de COULISSER en même temps que la palette. Fermé → collé au bord droit ;
          ouvert → `right-72`, exactement la largeur de la palette, donc posé sur son bord.
          Même durée/courbe que la palette : les deux bougent d'un seul bloc. */}
      <Button
        // Toujours `default` (aplat primaire, icône blanche) : c'est l'action principale du
        // dashboard, elle doit rester repérable. En `outline` le bouton fermé se fondait dans
        // l'en-tête et devenait invisible.
        variant="default"
        size="icon"
        onClick={() => setPaletteOpen((v) => !v)}
        title={t('widget.add')}
        aria-label={t('widget.add')}
        className={cn(
          // `[&_svg]:size-5` et NON `size-5` sur l'icône : la base du Button impose
          // `[&_svg]:size-4`, un sélecteur descendant qui l'emporte en spécificité sur une classe
          // posée directement sur le <svg>. Il faut donc relever la taille depuis le bouton.
          'absolute top-4 z-40 rounded-none transition-[right] duration-[400ms] ease-out [&_svg]:size-5',
          paletteOpen ? 'right-72' : 'right-0',
        )}
      >
        {/* Icône INVARIANTE (pas de bascule en croix à l'ouverture) : le bouton reste le
            repère « plugins du dashboard », comme le legacy qui garde son `fa-plug` ouvert
            comme fermé. `rotate-45` : broches vers le haut-DROITE.
            `strokeWidth` monté à 2.5 (défaut lucide : 2) — le trait fin se perdait sur l'aplat
            rouge ; c'est le seul levier de graisse d'une icône lucide (pas de `font-weight`). */}
        <Plug className="rotate-45" strokeWidth={2.5} />
      </Button>

      {/* Palette d'ajout de widgets — colonne flex qui COMPRIME la grille (comportement voulu),
          animée en largeur 0 → 18rem, `transition: width 0.4s` (le legacy anime un `transform`,
          mais il recouvre la grille au lieu de la pousser : ici c'est la largeur qui doit bouger
          pour que la colonne de gauche suive).
          `overflow-hidden` + `w-72` figée sur l'aside : le contenu garde sa largeur pleine et se
          fait révéler par le cadre qui s'ouvre — sans ça la palette se re-disposerait à chaque
          frame (texte qui saute pendant 400 ms).
          Le panneau reste MONTÉ en permanence : c'est ce qui rend l'animation possible dans les
          deux sens, et ça préserve l'état interne de la palette (scroll, drag-in GridStack). */}
      <div
        className={cn(
          'flex shrink-0 overflow-hidden transition-[width] duration-[400ms] ease-out',
          paletteOpen ? 'w-72' : 'w-0',
        )}
        aria-hidden={!paletteOpen}
      >
        <WidgetPalette
          present={present}
          onAdd={addWidget}
          onClose={() => setPaletteOpen(false)}
          onRemoveAll={removeAllWidgets}
          widgetCount={layout.length}
          nativeWidgets={gatedNativeWidgets}
          extraWidgets={legacyWidgets}
        />
      </div>
    </div>
    </DashboardDataContext.Provider>
  )
}
