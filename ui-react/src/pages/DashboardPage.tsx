import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bell, ChevronDown, ChevronUp, Download, MessageSquare, Newspaper, Plug } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Collapsible } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { useIsNarrow } from '@/hooks/useIsNarrow'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
import * as melisApi from '@/lib/melis-api'
import {
  takeDashboardBubbles,
  takeDashboardStats,
  takeLegacyDashboardPlugins,
  takeDashboardLayout,
} from '@/lib/dashboard-prefetch'
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
import { legacyRowsToGridRows } from '@/components/dashboard/grid-metrics'
import { DashboardDataContext } from '@/components/dashboard/dashboard-data-context'

const BUBBLES_HIDDEN_KEY = 'melis-dash-bubbles-hidden'

// Nom de plugin PHP → id de widget NATIF (ex. MelisCoreDashboardRecentUserActivityPlugin → 'activity').
// Sert à remapper un record partagé vers son widget natif plutôt que sa variante iframe `legacy-…`.
const NATIVE_ID_BY_PLUGIN: Record<string, string> = Object.fromEntries(
  Object.values(WIDGET_MAP)
    .filter((w) => w.pluginName)
    .map((w) => [w.pluginName as string, w.id]),
)

// Record DB (schéma legacy, clé = vrai nom de plugin) → items de grille React. L'id d'instance `i`
// est dérivé du NOM DE PLUGIN (natif préféré, sinon `legacy-<pluginName>`), jamais du plugin_id
// (qui peut être un timestamp legacy). Les exemplaires multiples d'un même plugin reçoivent un
// suffixe d'instance pour rester distincts.
function recordsToLayout(records: melisApi.DashboardPluginRecord[]): GridItem[] {
  const seen = new Set<string>()
  return records.map((r) => {
    const base = NATIVE_ID_BY_PLUGIN[r.pluginName] ?? `legacy-${r.pluginName}`
    const i = seen.has(base) ? makeInstanceId(base) : base
    seen.add(base)
    // Redimensionnement MANUEL de la hauteur : si `react-height` est présent, on RESTAURE cette
    // hauteur d'affichage React telle quelle et on marque la tuile « réglée à la main » → l'auto-fit
    // ne la retouchera plus (cf. DashboardGrid). Sinon, on dérive la hauteur d'affichage (46px) de la
    // hauteur LEGACY déclarée (80px) et l'auto-fit ajuste ensuite au contenu.
    const userSized = typeof r.reactH === 'number' && r.reactH > 0
    return {
      i, x: r.x, y: r.y, w: r.w,
      h: userSized ? (r.reactH as number) : legacyRowsToGridRows(r.h),
      // Hauteur legacy DÉCLARÉE, conservée telle quelle : elle permet de réécrire l'item à
      // l'identique même si sa définition n'est jamais chargée (cf. layoutToRecords).
      legacyH: r.h,
      userSized,
    }
  })
}

// Top "bubble" widgets, mirroring MelisCore's legacy dashboard bubble plugins.
const BUBBLES = [
  { key: 'news',          icon: Newspaper,     labelKey: 'dash.bubble.news' as I18nKey },
  { key: 'updates',       icon: Download,      labelKey: 'dash.bubble.updates' as I18nKey },
  { key: 'notifications', icon: Bell,          labelKey: 'dash.bubble.notifications' as I18nKey },
  { key: 'messages',      icon: MessageSquare, labelKey: 'dash.bubble.messages' as I18nKey },
] as const

export default function DashboardPage() {
  const { t } = useI18n()
  // Source de vérité UNIQUE du responsive de cette page (cf. hooks/useIsNarrow) : chaque règle qui
  // doit différer sur mobile est un TERNAIRE sur ce booléen, jamais une classe `sm:` — une seule
  // liste de classes est produite à un instant donné, donc aucun risque de fuite vers le desktop.
  const narrow = useIsNarrow()

  // NOTE: do NOT openTab('/') here. DashboardPage is kept mounted (Shell) and lazy-loaded, so its
  // mount effect runs AFTER TabBridge's route-sync and would re-activate the Dashboard tab on EVERY
  // page (the tab content then shows under the wrong, Dashboard-highlighted tab). The Dashboard tab
  // always exists (initial state + the CLOSE guards); TabBridge activates it when the route is '/'.

  // Top bubble counts (News / Updates / Notifications / Messages).
  // `take*` consomme la promesse PRÉCHARGÉE au boot (parallèle à /me + /menu, cf. dashboard-prefetch)
  // si elle existe, sinon lance un fetch frais → aucune requête ne dépend du montage/chunk lazy.
  const [bubbles, setBubbles] = useState<melisApi.DashboardBubbles | null>(null)
  useEffect(() => {
    takeDashboardBubbles().then(setBubbles)
  }, [])

  // KPI stats + recent activity (données réelles).
  const [stats, setStats] = useState<melisApi.DashboardStats | null>(null)
  useEffect(() => {
    takeDashboardStats().then(setStats)
  }, [])

  // Legacy PHP dashboard plugins (loaded once at mount).
  // La liste est déjà filtrée par les droits côté serveur (usr_rights → <melis_dashboardplugin>),
  // comme le menu du dashboard legacy : un plugin non accordé n'arrive tout simplement pas.
  const [legacyWidgets, setLegacyWidgets] = useState<WidgetDef[]>([])
  // Native React widgets (widget-registry) the user is granted. Native widgets are always registered
  // client-side, so without this gate a rights-less user would see them (e.g. "Recent activity",
  // ticket 0010740). Empty until loaded → gated out by default, restored once the fetch resolves.
  const [nativeGranted, setNativeGranted] = useState<Set<string>>(new Set())
  // Infobulles des widgets natifs, reprises de la config du plugin legacy qu'ils remplacent — le
  // registre client ne les porte pas (le texte est traduit côté PHP), cf. legacy-plugins.
  const [nativeDescriptions, setNativeDescriptions] = useState<Record<string, string>>({})
  const [legacyLoaded, setLegacyLoaded] = useState(false)
  useEffect(() => {
    let cancelled = false
    let attempts = 0
    const load = (p: ReturnType<typeof takeLegacyDashboardPlugins>) => {
      p.then((result) => {
        if (cancelled) return
        // `null` = ÉCHEC du fetch (≠ « aucun plugin »). On NE marque PAS `legacyLoaded` : sinon la
        // réconciliation élaguerait tout le dashboard contre un registre vide et ÉCRASERAIT le record
        // partagé (perte de données). Les données restent intactes ; on réessaie pour récupérer
        // l'AFFICHAGE sans rechargement. Un vrai résultat (même vide, accordé) passe normalement.
        if (!result) {
          if (++attempts <= 3) {
            window.setTimeout(() => load(melisApi.fetchLegacyDashboardPlugins()), 1500)
          }
          return
        }
        setLegacyWidgets(result.plugins.map(buildLegacyWidgetDef))
        setNativeGranted(new Set(result.nativeWidgets))
        setNativeDescriptions(result.nativeWidgetDescriptions)
        setLegacyLoaded(true)
      })
    }
    load(takeLegacyDashboardPlugins())
    return () => { cancelled = true }
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
  // Passe à `true` une fois le fetch DB résolu (succès OU échec). Tant qu'il est `false`, on retient
  // l'affichage de l'état vide : au montage `layout` peut être vide (cache localStorage absent/périmé
  // avant que la DB partagée ne le remplisse), et sans ce verrou le message « dashboard vide »
  // clignotait le temps du fetch alors que des plugins allaient s'afficher.
  const [dbSynced, setDbSynced] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Vignettes de la palette : différées jusqu'à la 1ʳᵉ ouverture. Fermée par défaut, la palette est
  // pourtant TOUJOURS montée (animation de largeur) → sans ce verrou ses ~N images se chargeraient
  // au premier rendu du dashboard, sur le chemin critique. Chaque vignette passe par MelisAssetManager
  // (servie en PHP) qui sérialise sur le verrou de session ; on ne les tire donc qu'à l'ouverture.
  const [paletteEverOpened, setPaletteEverOpened] = useState(false)
  useEffect(() => {
    if (paletteOpen) setPaletteEverOpened(true)
  }, [paletteOpen])

  // Passe à `true` quand le record serveur a été chargé (≠ cache localStorage) → gate du heal effect.
  const serverLayoutRef = useRef(false)

  // Signature STABLE d'un layout du point de vue du record serveur : uniquement les champs persistés
  // (nom de plugin + position + taille + hauteur legacy déclarée). INSENSIBLE aux ids d'instance
  // (aléatoires, cf. makeInstanceId) et à la hauteur d'AFFICHAGE React (46px, ajustée au contenu) —
  // que `layoutToRecords` n'écrit jamais en base (il écrit `def.legacyH`). Sert de garde anti-doublon.
  const recordsSig = useCallback(
    (recs: melisApi.DashboardPluginRecord[]) =>
      // `reactH` inclus : un redimensionnement manuel de la hauteur (qui ne change que react-height)
      // doit compter comme un changement à persister, sinon la garde anti-doublon l'avalerait.
      JSON.stringify(recs.map((r) => [r.pluginName, r.x, r.y, r.w, r.h, r.reactH ?? 0])),
    [],
  )
  // Signature du dernier record ENVOYÉ (ou CHARGÉ) du serveur. Au montage, les effets de
  // réconciliation (recalage des hauteurs, élagage, auto-réparation) + l'auto-fit produisent
  // presque toujours le MÊME record que celui chargé → sans cette garde, chacun déclenchait un
  // `saveDashboardLayout` redondant (plusieurs POST au premier affichage). `null` = rien encore
  // synchronisé, le 1ᵉʳ envoi réel passe donc toujours.
  const lastSavedSigRef = useRef<string | null>(null)
  // Nombre de plugins du DERNIER record connu du serveur. Invariant anti-effacement : une
  // RÉCONCILIATION (recalage/élagage/auto-réparation) ne doit JAMAIS réduire ce nombre — seule une
  // action UTILISATEUR (retrait/déplacement/tout supprimer) le peut. Sans ça, une liste de plugins
  // vide/partielle (fetch `/legacy-plugins` en échec ou glitch) élaguait des plugins et écrasait le
  // record partagé. `null` = pas encore de référence serveur.
  const lastSavedCountRef = useRef<number | null>(null)

  // Priorité DB : au montage, charge le record partagé (schéma legacy) et le convertit en layout
  // React (écrase le cache localStorage si trouvé).
  useEffect(() => {
    takeDashboardLayout().then((records) => {
      // `null` = échec réel du fetch (HTTP/réseau) → on garde le cache localStorage.
      // Un tableau (même VIDE) fait autorité : la DB est partagée avec le dashboard legacy, donc
      // « Remove all » côté /melis vide le record → on doit refléter ce vide côté React (effacer la
      // grille + le cache), sinon les plugins retirés restaient affichés depuis le localStorage.
      if (records) {
        const dbLayout = recordsToLayout(records)
        setLayout(dbLayout)
        saveLayout(dbLayout)
        // Point de référence anti-doublon : ce que le serveur a DÉJÀ. Toute réconciliation au montage
        // qui reproduit ce record (le cas normal) est alors reconnue identique → aucun POST inutile.
        lastSavedSigRef.current = recordsSig(records)
        lastSavedCountRef.current = records.length
        // Le record serveur a bien été chargé → autorise la normalisation des hauteurs (heal effect).
        // Ne PAS normaliser depuis le seul cache localStorage (fetch en échec) : on n'écrirait pas
        // une hauteur fiable dans le record partagé.
        serverLayoutRef.current = true
      }
    }).finally(() => setDbSynced(true))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const extraWidgetMap = useMemo(
    () => Object.fromEntries(legacyWidgets.map((w) => [w.id, w])),
    [legacyWidgets],
  )
  // Native widgets, gated by the user's rights (granted set from the server). Ungranted ones are
  // absent from the map → pruned from the grid layout and hidden from the palette.
  const gatedNativeMap = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(WIDGET_MAP)
          .filter(([id]) => nativeGranted.has(id))
          // Description serveur greffée sur la définition statique → même infobulle de palette que
          // pour les plugins legacy.
          .map(([id, def]) => [id, nativeDescriptions[id] ? { ...def, description: nativeDescriptions[id] } : def]),
      ),
    [nativeGranted, nativeDescriptions],
  )
  const gatedNativeWidgets = useMemo(() => Object.values(gatedNativeMap) as WidgetDef[], [gatedNativeMap])
  const allWidgetMap = useMemo(() => ({ ...gatedNativeMap, ...extraWidgetMap }), [gatedNativeMap, extraWidgetMap])

  // Ids de widget (pas d'instance) déjà présents — sert uniquement à afficher un
  // indicateur "déjà sur le dashboard" dans la palette, pas à bloquer un ré-ajout.
  const present = useMemo(() => new Set(layout.map((l) => widgetIdOf(l.i))), [layout])

  // Items de grille React → records DB (schéma legacy partagé). Le nom de plugin PHP vient du
  // registre ; un item sans `pluginName` (widget natif sans plugin PHP) n'est pas persistable dans
  // le record partagé et est ignoré. Le plugin_id conserve l'id d'instance React → la préservation
  // de la config côté serveur peut réapparier chaque instance.
  const layoutToRecords = useCallback(
    (items: GridItem[]): melisApi.DashboardPluginRecord[] =>
      items.flatMap((l) => {
        const wid = widgetIdOf(l.i)
        const def = allWidgetMap[wid]
        // Déf. INCONNUE (registre pas encore chargé, fetch en échec, plugin non accordé) : on
        // reconstruit quand même le nom de plugin depuis l'id d'instance — il est formé par
        // construction comme `legacy-<NomDuPlugin>` (cf. buildLegacyWidgetDef). Sans ce repli, un
        // item à déf. inconnue était ABSENT du record réécrit : toute écriture autorisée (action
        // utilisateur) le supprimait définitivement de la base.
        const pluginName = def?.pluginName ?? (wid.startsWith('legacy-') ? wid.slice('legacy-'.length) : '')
        if (!pluginName) return []
        // Hauteur legacy : celle de la déf. si connue, sinon celle relevée dans le record au
        // chargement (`legacyH`), sinon la hauteur de référence des plugins (4 lignes).
        const legacyH = def?.legacyH ?? l.legacyH ?? 4
        // On persiste la hauteur LEGACY DÉCLARÉE du plugin (`def.legacyH`), PAS la hauteur d'affichage
        // React (`l.h`, ajustée au contenu en cellules 46px). Écrire `l.h` gonflait la tuile côté
        // /melis (rendue à ×80px) → gros vide en bas. La hauteur reste ainsi celle de la config du
        // plugin dans les deux dashboards. (x/y/w conservés : mêmes unités, 12 colonnes.)
        return [{
          pluginName, pluginId: l.i, x: l.x, y: l.y, w: l.w, h: legacyH,
          // Hauteur d'affichage React persistée UNIQUEMENT si l'utilisateur l'a réglée à la main
          // (`<react-height>`, ignorée par le dashboard classique). Sinon `null` → l'auto-fit
          // reprend la main au prochain rendu.
          reactH: l.userSized ? l.h : null,
        }]
      }),
    [allWidgetMap],
  )

  const persist = useCallback(
    // `clearAll` : SEULE porte d'entrée d'un record vide (« supprimer tous les plugins », confirmé).
    // `userAction` ne suffit pas — un déplacement/redimensionnement en porte aussi la marque, et
    // c'est précisément par là qu'un layout accidentellement vide partait en base.
    (next: GridItem[], opts?: { userAction?: boolean; clearAll?: boolean; allowRemoval?: boolean }) => {
      setLayout(next)
      saveLayout(next)
      // N'ÉCRIT en base que si le record change réellement (cf. recordsSig). Les effets de
      // réconciliation du montage et l'auto-fit des hauteurs repassent souvent par ici avec un record
      // identique à ce qui est déjà persisté : on saute alors le POST (fini les multiples
      // `saveDashboardLayout` au premier chargement). Le cache localStorage, lui, reste écrit à chaque
      // fois (hauteur d'affichage comprise) pour un rechargement instantané.
      const recs = layoutToRecords(next)
      // ⚠️ FILET ANTI-EFFACEMENT (1) : `layoutToRecords` LAISSE TOMBER tout item dont la déf. est
      // absente du registre — lequel est vide/incomplet quand `/legacy-plugins` a échoué. Si des items
      // « persistables » (id `legacy-*` ou natif connu) ont été droppés, le registre est incomplet →
      // on met à jour l'affichage + le cache mais on NE TOUCHE PAS la base.
      const expected = next.filter((l) => {
        const wid = widgetIdOf(l.i)
        return wid.startsWith('legacy-') || !!WIDGET_MAP[wid]?.pluginName
      }).length
      if (recs.length < expected) return
      // ⚠️ FILET ANTI-EFFACEMENT (2) — INVARIANT : le nombre de plugins du record serveur ne peut
      // DIMINUER que sur un RETRAIT EXPLICITE (croix d'une tuile, « tout supprimer »), jamais
      // autrement.
      //
      // Ce filet était conditionné à `userAction`, ce qui ne suffisait PAS : `handleChange` — le
      // canal de GridStack, emprunté par un simple déplacement/redimensionnement ET par CHAQUE
      // ajustement automatique de hauteur — le porte aussi. D'où la perte observée en base
      // (13 plugins → 1) : `/legacy-plugins` renvoie une liste vide mais VALIDE (aucun plugin
      // legacy accordé/chargé), l'élagage retire les tuiles de l'ÉTAT React — son écriture en base
      // est bien bloquée ici, mais l'état, lui, est réduit — puis le tout premier auto-fit repasse
      // par `handleChange`, `userAction` lève le filet, et l'état amputé part en base.
      //
      // `allowRemoval` n'est donc posé QUE par `removeWidget` / `removeAllWidgets`. Un
      // déplacement, un redimensionnement ou un auto-fit peut tout mettre à jour SAUF réduire la
      // liste : dans ce cas on garde l'affichage et le cache, et on laisse la base intacte.
      if (
        !opts?.allowRemoval &&
        lastSavedCountRef.current !== null &&
        recs.length < lastSavedCountRef.current
      ) {
        return
      }
      const sig = recordsSig(recs)
      if (sig !== lastSavedSigRef.current) {
        lastSavedSigRef.current = sig
        lastSavedCountRef.current = recs.length
        // `allowEmpty` : le serveur REFUSE un record vide sauf demande EXPLICITE de l'utilisateur
        // (« tout supprimer », confirmé). Dernier filet contre un effacement complet du dashboard
        // partagé par un bug client — le cas s'est produit (d_content réduit à `<Plugins></Plugins>`).
        melisApi.saveDashboardLayout(recs, { allowEmpty: !!opts?.clearAll })
      }
    },
    [layoutToRecords, recordsSig],
  )

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
      // Une tuile réglée à la main garde SA hauteur, même si elle est plus courte que la déf. — sinon
      // ce recalage annulerait un rétrécissement volontaire de l'utilisateur au chargement.
      if (l.userSized || !def || l.h >= def.h) return l
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
    // `dbSynced` en plus de `legacyLoaded` : on n'élague qu'une fois le record SERVEUR chargé (donc la
    // référence anti-effacement `lastSavedCountRef` posée) et contre le vrai layout, pas le cache.
    if (!legacyLoaded || !dbSynced) return
    // ⚠️ FILET ANTI-EFFACEMENT : contre un registre VIDE (aucune déf. chargée) tout item paraît
    // « inconnu » et `kept` serait vide → on écraserait le dashboard. `legacyLoaded` n'est désormais
    // vrai que sur un fetch RÉUSSI, mais on double la protection : ne jamais élaguer si le registre
    // est vide (un utilisateur sans aucun plugin n'a de toute façon rien à élaguer).
    if (Object.keys(allWidgetMap).length === 0) return
    const kept = layoutRef.current.filter((l) => allWidgetMap[widgetIdOf(l.i)])
    // `allowRemoval` : le registre est confirmé CHARGÉ ET NON VIDE (garde ci-dessus) — un item
    // absent est donc un retrait légitime (plugin désinstallé/retiré des droits), pas un glitch de
    // fetch. Sans ce flag, le filet anti-effacement de `persist` (2) bloquait silencieusement cette
    // écriture (nombre de plugins en baisse) : la tuile disparaissait localement puis REVENAIT au
    // rechargement suivant, le record serveur n'ayant jamais été corrigé.
    if (kept.length !== layoutRef.current.length) persist(kept, { allowRemoval: true })
  }, [legacyLoaded, dbSynced, allWidgetMap, persist])

  // Auto-réparation des hauteurs héritées : une SEULE fois, quand le record serveur ET les défs
  // legacy sont chargés, on repersiste le layout. `layoutToRecords` écrit désormais la hauteur
  // DÉCLARÉE de chaque plugin (`def.legacyH`) → toute ligne gonflée par l'ancienne écriture (hauteur
  // d'affichage React, 46px, rendue ×80px côté /melis) est ramenée à la hauteur de config → plus de
  // vide en bas dans le dashboard classique. Gaté sur `legacyLoaded` (toutes les défs connues, sinon
  // on omettrait des plugins du record) ET `serverLayoutRef` (pas depuis le seul cache). `dbSynced`
  // dans les deps couvre les deux ordres d'arrivée fetch/défs. Idempotent une fois normalisé.
  const healedRef = useRef(false)
  useEffect(() => {
    if (!legacyLoaded || !dbSynced || !serverLayoutRef.current || healedRef.current) return
    healedRef.current = true
    // Filtre comme l'effet d'élagage ci-dessus (même critère : déf. absente d'un registre chargé
    // ET non vide). SANS ce filtre, cet effet — déclenché par les MÊMES conditions
    // (`legacyLoaded && dbSynced`) — s'exécute juste après celui d'élagage dans le même passage
    // d'effets, mais lit `layoutRef.current` AVANT que le re-rendu déclenché par le `persist()` de
    // l'élagage ne l'ait mis à jour : il repersistait alors la liste NON élaguée (12 tuiles), dont
    // le nombre dépasse `lastSavedCountRef` fraîchement abaissé à 11 par l'élagage — le filet
    // anti-effacement (2) ne bloque QUE les baisses, pas les hausses, donc rien ne l'arrêtait. La
    // tuile orpheline revenait donc en base aussitôt après avoir été retirée, quel que soit l'ordre
    // d'exécution des deux effets.
    const kept = layoutRef.current.filter((l) => allWidgetMap[widgetIdOf(l.i)])
    persist(kept, kept.length !== layoutRef.current.length ? { allowRemoval: true } : undefined)
  }, [legacyLoaded, dbSynced, allWidgetMap, persist])

  // Émis par GridStack après un déplacement / redimensionnement utilisateur → action utilisateur
  // (peut légitimement réduire le nombre de tuiles, ex. via un drag qui en retire une).
  const handleChange = useCallback((items: GridItem[]) => persist(items, { userAction: true }), [persist])

  // Ajoute toujours une NOUVELLE instance — le même plugin peut être posé plusieurs fois.
  const addWidget = useCallback(
    (widgetId: string) => {
      const def = allWidgetMap[widgetId]
      if (!def) return
      const instanceId = present.has(widgetId) ? makeInstanceId(widgetId) : widgetId
      const maxY = layout.reduce((m, l) => Math.max(m, l.y + l.h), 0)
      persist([...layout, { i: instanceId, x: 0, y: maxY, w: def.w, h: def.h, minW: def.minW, minH: def.minH }], { userAction: true })
    },
    [layout, present, allWidgetMap, persist],
  )

  // `instanceId` = id complet de l'item de grille (l.i), pas l'id du widget —
  // ne retire que l'instance ciblée, pas tous les exemplaires du même widget.
  const removeWidget = useCallback(
    (instanceId: string) => persist(layout.filter((l) => l.i !== instanceId), { userAction: true, allowRemoval: true }),
    [layout, persist],
  )

  // « Supprimer tous les plugins » — équivalent du `#dashboard-plugin-delete-all` legacy
  // (gridstack.init.js : `gridData.removeAll()` puis `saveDBWidgets`). `persist([])` fait les deux :
  // vide la grille ET enregistre en base, sinon les tuiles reviendraient au prochain chargement.
  // La confirmation est portée par la palette, comme le `melisCoreTool.confirm()` d'origine.
  // Action utilisateur explicite (confirmée) → `userAction` : autorisée à vider le record.
  const removeAllWidgets = useCallback(() => persist([], { userAction: true, clearAll: true, allowRemoval: true }), [persist])

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
        <div className={cn('flex justify-center pt-3', narrow ? 'px-3' : 'px-5 sm:px-8')}>
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
          {/* 4 bulles sur une ligne en desktop ; sur mobile, 4 colonnes de ~80px réduisaient chaque
              libellé à une lettre (« M », « U », « N »…) — 2×2 leur rend une largeur lisible. */}
          <div className={cn('grid gap-2 pt-2', narrow ? 'grid-cols-2 px-3' : 'grid-cols-4 px-5 sm:px-8')}>
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
        <div className={cn('min-h-0 flex-1 overflow-auto pb-8 pt-4', narrow ? 'px-2' : 'px-5 sm:px-8')}>
          {/* La grille reste TOUJOURS montée, même vide : c'est elle la cible de dépôt des
              widgets glissés depuis la palette. La remplacer par l'état vide retirait
              `.grid-stack` du DOM → après avoir retiré tous les widgets, plus rien n'acceptait
              un drop (seul le clic sur « + » fonctionnait encore). L'état vide passe donc en
              surimpression, en `pointer-events-none` pour ne pas intercepter le dépôt. */}
          <div className="relative">
            {layout.length === 0 && dbSynced && (
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
          // Rayon arrondi À GAUCHE seulement, côté droit au ras du bord → la pastille rouge paraît
          // accrochée au flanc (languette latérale).
          // ⚠️ On passe par un rayon ARBITRAIRE en une seule déclaration `border-radius: 6px 0 0 6px`
          // au lieu de `rounded-l-md rounded-r-none` : la base `Button` porte déjà `rounded-md`, que
          // twMerge conserve à côté de `rounded-r-none`, et l'ordre CSS laisse le raccourci `rounded-md`
          // reprendre les coins droits (bouton « toujours arrondi »). Un unique rayon arbitraire évince
          // `rounded-md` (même groupe twMerge) et supprime tout conflit raccourci/longhand.
          'absolute top-4 z-40 rounded-[0.375rem_0_0_0.375rem] transition-[right] duration-[400ms] ease-out [&_svg]:size-5',
          // Mobile : la palette s'ouvre en SURIMPRESSION pleine largeur (cf. plus bas), il n'y a
          // donc plus de flanc où accrocher la languette — on la masque le temps de l'ouverture
          // (la palette a sa propre croix de fermeture). Desktop : comportement d'origine intact.
          narrow
            ? paletteOpen ? 'right-0 hidden' : 'right-0'
            : paletteOpen ? 'right-72' : 'right-0',
        )}
      >
        {/* Icône INVARIANTE (pas de bascule en croix à l'ouverture) : le bouton reste le
            repère « plugins du dashboard », comme le legacy qui garde son `fa-plug` ouvert
            comme fermé. `rotate-45` : plug en diagonale.
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
      {/* Mobile : la palette ne peut plus COMPRIMER la grille (18rem sur un écran de 360px ne
          laisserait qu'une lichette de dashboard) — elle passe en surimpression pleine largeur,
          posée sur la grille, et se referme par sa croix. Même animation de largeur, même montage
          permanent (état interne + drag-in GridStack préservés) : seul le positionnement change. */}
      <div
        className={cn(
          'flex overflow-hidden transition-[width] duration-[400ms] ease-out',
          narrow
            ? cn('absolute inset-y-0 right-0 z-50', paletteOpen ? 'w-full' : 'w-0')
            : cn('shrink-0', paletteOpen ? 'w-72' : 'w-0'),
        )}
        aria-hidden={!paletteOpen}
      >
        <WidgetPalette
          fullWidth={narrow}
          present={present}
          onAdd={addWidget}
          onClose={() => setPaletteOpen(false)}
          onRemoveAll={removeAllWidgets}
          widgetCount={layout.length}
          nativeWidgets={gatedNativeWidgets}
          extraWidgets={legacyWidgets}
          loadThumbnails={paletteEverOpened}
        />
      </div>
    </div>
    </DashboardDataContext.Provider>
  )
}
