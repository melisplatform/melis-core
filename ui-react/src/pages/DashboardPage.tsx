import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bell, ChevronDown, ChevronUp, Download, MessageSquare, Newspaper } from 'lucide-react'

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
import { DashboardStructurePanel } from '@/components/dashboard/DashboardStructurePanel'
import { WIDGET_MAP, buildLegacyWidgetDef, type WidgetDef } from '@/components/dashboard/widget-registry'
import {
  groupIntoRows,
  loadLayout,
  makeInstanceId,
  MAX_WIDGET_HEIGHT,
  MAX_WIDGET_WIDTH,
  MIN_WIDGET_HEIGHT,
  MIN_WIDGET_WIDTH,
  renumberRows,
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

  // Repère « clique un widget dans le panneau → il flashe/se scrolle en vue dans le dashboard » —
  // équivalent du survol/sélection du panneau de zones de l'éditeur de page (EditionCanvas.tsx),
  // adapté en simple flash temporisé : ce dashboard n'a pas de notion de sélection persistante
  // (pas d'édition en place), un flash suffit à repérer le widget. Un nouveau clic pendant le
  // flash en cours relance son timer (`clearTimeout` avant d'en reposer un) plutôt que d'empiler
  // les délais.
  const [highlightedWidgetId, setHighlightedWidgetId] = useState<string | null>(null)
  const highlightTimerRef = useRef<number | null>(null)
  const highlightWidget = useCallback((instanceId: string) => {
    setHighlightedWidgetId(instanceId)
    if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current)
    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedWidgetId((cur) => (cur === instanceId ? null : cur))
    }, 1600)
  }, [])

  const [layout, setLayout] = useState<GridItem[]>(() => loadLayout())
  // Passe à `true` une fois le fetch DB résolu (succès OU échec). Tant qu'il est `false`, on retient
  // l'affichage de l'état vide : au montage `layout` peut être vide (cache localStorage absent/périmé
  // avant que la DB partagée ne le remplisse), et sans ce verrou le message « dashboard vide »
  // clignotait le temps du fetch alors que des plugins allaient s'afficher.
  const [dbSynced, setDbSynced] = useState(false)

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
        // Tri (y, x) purement cosmétique pour le premier affichage : un layout écrit par l'ancienne
        // grille libre (avant ce panneau) peut avoir un ordre 2D quelconque. Aucun `persist` ici —
        // le tableau ne devient réellement une pile (x/y/w renumérotés) qu'au premier réordonnancement/
        // ajout/retrait de l'utilisateur (cf. renumberStack, déclenché depuis les handlers ci-dessous).
        const dbLayout = recordsToLayout(records).sort((a, b) => a.y - b.y || a.x - b.x)
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
        // Hauteur legacy : celle DÉJÀ ENREGISTRÉE pour CETTE INSTANCE (`l.legacyH`, relevée dans le
        // record au chargement) si on la connaît, sinon celle de la déf. (nouveau widget jamais
        // sauvegardé), sinon la hauteur de référence des plugins (4 lignes).
        //
        // ⚠️ L'ordre importe : préférer `def.legacyH` (la hauteur GÉNÉRIQUE déclarée par la config PHP
        // du TYPE de plugin) écraserait, à CHAQUE persist (n'importe quelle action : réordonner un
        // AUTRE widget suffit), la hauteur que l'admin a personnalisée pour CETTE instance précise
        // depuis le BO classique (GridStack y autorise le redimensionnement par instance). Vérifié sur
        // un jeu de données réel riche (export vitogaz) : la hauteur varie bel et bien d'une instance à
        // l'autre pour un même plugin — `def.legacyH` en priorité aurait aplati silencieusement toutes
        // ces personnalisations dès le premier chargement du dashboard React par un utilisateur.
        const legacyH = l.legacyH ?? def?.legacyH ?? 4
        // On persiste la hauteur LEGACY DÉCLARÉE (celle de l'instance, cf. ci-dessus), PAS la hauteur
        // d'affichage React (`l.h`, ajustée au contenu en cellules 46px). Écrire `l.h` gonflait la
        // tuile côté /melis (rendue à ×80px) → gros vide en bas. La hauteur reste ainsi celle
        // enregistrée pour cette instance dans les deux dashboards. (x/y conservés tels quels, mêmes
        // unités, 12 colonnes.)
        // `w` ARRONDI ici par sécurité (déjà entier en pratique, cf. setWidgetWidth qui reçoit des
        // colonnes natives 1-12 depuis le champ W du panneau) — le dashboard classique (sa vraie
        // grille GridStack, colonnes entières) a de toute façon besoin d'un entier.
        return [{
          pluginName, pluginId: l.i, x: l.x, y: l.y, w: Math.round(l.w), h: legacyH,
          // Hauteur d'affichage React persistée UNIQUEMENT si l'utilisateur l'a réglée à la main
          // (`<react-height>`, ignorée par le dashboard classique). Sinon `null` → l'auto-fit
          // reprend la main au prochain rendu. Arrondie ici par sécurité (même principe que `w`
          // ci-dessus, déjà entière en pratique depuis le champ H du panneau).
          reactH: l.userSized ? Math.round(l.h) : null,
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
      // ⚠️ FILET ANTI-EFFACEMENT (1 bis) : un record VIDE ne part en base QUE sur « tout supprimer »
      // (`clearAll`), le seul cas confirmé par l'utilisateur. Les effets d'élagage/normalisation
      // arrivent ici avec `allowRemoval` (qui lève le filet 2) et un `kept` VIDE dès qu'AUCUNE déf.
      // n'est connue — p.ex. quand tous les plugins du record appartiennent à des modules
      // désactivés : l'affichage se vide légitimement, mais la base ne doit pas bouger. Sans ce
      // filet on POSTe `[]`, et le serveur répond 409 « Refusing to clear the dashboard ».
      // Un retrait EXPLICITE par l'utilisateur (croix d'une tuile, « tout supprimer ») est le seul
      // chemin autorisé à vider le record. `allowRemoval` seul ne suffit pas : les effets d'élagage
      // le portent aussi ; `userAction` seul non plus : un simple déplacement le porte.
      const explicitEmpty = !!opts?.clearAll || (!!opts?.allowRemoval && !!opts?.userAction)
      if (recs.length === 0 && !explicitEmpty) return
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
        melisApi.saveDashboardLayout(recs, { allowEmpty: explicitEmpty })
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

  // Émis par DashboardStack après un ajustement automatique de hauteur → l'ORDRE/les LIGNES ne
  // changent pas, seule la hauteur d'une tuile est recalculée : pas besoin de renuméroter x/y/w
  // (déjà cohérents, une hauteur de ligne ne peut que grandir la place réservée aux voisines).
  const handleChange = useCallback((items: GridItem[]) => persist(items, { userAction: true }), [persist])

  // Regroupement en LIGNES (1 à 3 widgets côte à côte) déduit de x/y — cf. groupIntoRows. Recalculé
  // à chaque changement de `layout` ; c'est la forme que consomment le panneau de structure (pour
  // afficher/réordonner les lignes) et la pile principale (pour le rendu côte à côte).
  const rows = useMemo(() => groupIntoRows(layout), [layout])

  // Réarrangement de lignes depuis le panneau de structure (réordonnancement de lignes, déplacement
  // d'un widget d'une ligne à une autre, scission en nouvelle ligne...) : le panneau ne manipule que
  // des LIGNES abstraites, `renumberRows` recalcule x/y/w concrets avant persistance — c'est ce qui
  // permet au dashboard classique (/melis, qui rend x/y/w/h tels quels dans sa propre grille) de
  // continuer à afficher un agencement 2D valide sans aucun changement côté PHP.
  const handleRowsChange = useCallback(
    (next: GridItem[][]) => persist(renumberRows(next), { userAction: true }),
    [persist],
  )

  // Ajoute toujours une NOUVELLE instance — le même plugin peut être posé plusieurs fois.
  const makeItem = useCallback(
    (widgetId: string): GridItem | null => {
      const def = allWidgetMap[widgetId]
      if (!def) return null
      const instanceId = present.has(widgetId) ? makeInstanceId(widgetId) : widgetId
      return { i: instanceId, x: 0, y: 0, w: def.w, h: def.h, minW: def.minW, minH: def.minH }
    },
    [present, allWidgetMap],
  )

  // Ajout en BAS du dashboard, comme nouvelle ligne pleine largeur (comportement du bouton « + » du
  // panneau, hors ligne particulière — cf. `addToRow` pour ajouter à côté d'un widget existant).
  const addWidget = useCallback(
    (widgetId: string) => {
      const newItem = makeItem(widgetId)
      if (!newItem) return
      persist(renumberRows([...rows, [newItem]]), { userAction: true })
    },
    [rows, makeItem, persist],
  )

  // `instanceId` = id complet de l'item de grille (l.i), pas l'id du widget —
  // ne retire que l'instance ciblée, pas tous les exemplaires du même widget. Les lignes devenues
  // vides disparaissent d'elles-mêmes (`groupIntoRows` ne regroupe que ce qui reste).
  const removeWidget = useCallback(
    (instanceId: string) =>
      persist(renumberRows(groupIntoRows(layout.filter((l) => l.i !== instanceId))), {
        userAction: true,
        allowRemoval: true,
      }),
    [layout, persist],
  )

  // Hauteur manuelle (champ numérique du panneau) — même mécanisme que le redimensionnement manuel
  // d'origine (`userSized`/`reactH`) : l'auto-fit ne retouche plus cette tuile ensuite, et la
  // hauteur choisie est celle que persiste `layoutToRecords`.
  //
  // `rows` arrive déjà en lignes de grille NATIVES ENTIÈRES (champ H du panneau, cf.
  // DashboardStructurePanel/applyHeightDraft), même principe que `setWidgetWidth` — plus de
  // conversion depuis un pourcentage ici.
  const setWidgetHeight = useCallback(
    (instanceId: string, rows: number) => {
      const h = Math.max(MIN_WIDGET_HEIGHT, Math.min(MAX_WIDGET_HEIGHT, rows))
      const next = layout.map((l) => (l.i === instanceId ? { ...l, h, userSized: true } : l))
      persist(renumberRows(groupIntoRows(next)), { userAction: true })
    },
    [layout, persist],
  )

  // Largeur manuelle (champ numérique du panneau, colonnes sur 12) — le VOISIN absorbe la
  // différence (celui de droite, sinon celui de gauche si ce widget est déjà en dernière position
  // de sa ligne), comme redimensionner une colonne de tableur : la ligne reste à somme constante,
  // jamais besoin du repli « répartition égale » de `renumberRows` pour un simple ajustement.
  // Si le voisin est déjà à `MIN_WIDGET_WIDTH`, il ne cède que ce qu'il peut — la largeur
  // effectivement obtenue peut alors être inférieure à la valeur tapée, bornée par ce qui est
  // réellement disponible (même logique qu'une poignée de redimensionnement qui bute sur la
  // colonne voisine). Une ligne d'un seul widget n'a pas de voisin : simple bornage.
  //
  // `cols` arrive déjà en colonnes NATIVES ENTIÈRES (champ W du panneau, cf.
  // DashboardStructurePanel/applyWidthDraft) — plus de conversion depuis un pourcentage ici : un
  // pas de pourcentage (1/100 de ligne) est plus fin qu'1/12 de colonne, donc plusieurs frappes
  // consécutives pouvaient retomber sur la même colonne côté GridStack (dashboard) et sembler
  // sans effet. En colonnes, chaque pas EST un palier représentable par la grille.
  const setWidgetWidth = useCallback(
    (instanceId: string, cols: number) => {
      const w = Math.max(MIN_WIDGET_WIDTH, Math.min(MAX_WIDGET_WIDTH, cols))
      const nextRows = rows.map((row) => {
        const idx = row.findIndex((it) => it.i === instanceId)
        if (idx === -1) return row
        const current = row[idx]
        if (row.length < 2) return row.map((it, i) => (i === idx ? { ...it, w } : it))
        const neighborIdx = idx + 1 < row.length ? idx + 1 : idx - 1
        const neighbor = row[neighborIdx]
        const neighborW = Math.max(MIN_WIDGET_WIDTH, Math.min(MAX_WIDGET_WIDTH, neighbor.w - (w - current.w)))
        const actualW = current.w + (neighbor.w - neighborW)
        return row.map((it, i) => {
          if (i === idx) return { ...it, w: actualW }
          if (i === neighborIdx) return { ...it, w: neighborW }
          return it
        })
      })
      persist(renumberRows(nextRows), { userAction: true })
    },
    [rows, persist],
  )

  // « Supprimer tous les plugins » — équivalent du `#dashboard-plugin-delete-all` legacy
  // (gridstack.init.js : `gridData.removeAll()` puis `saveDBWidgets`). `persist([])` fait les deux :
  // vide la grille ET enregistre en base, sinon les tuiles reviendraient au prochain chargement.
  // La confirmation est portée par la palette, comme le `melisCoreTool.confirm()` d'origine.
  // Action utilisateur explicite (confirmée) → `userAction` : autorisée à vider le record.
  const removeAllWidgets = useCallback(() => persist([], { userAction: true, clearAll: true, allowRemoval: true }), [persist])

  return (
    <DashboardDataContext.Provider value={{ stats }}>
    <div className="flex h-full overflow-hidden">
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

        {/* Lignes de widgets (1 à 3 côte à côte) — même ordre/agencement que le panneau de structure
            à droite, comme le canevas de l'éditeur de page reflète son panneau de zones. */}
        <div className={cn('min-h-0 flex-1 overflow-auto pb-8 pt-4', narrow ? 'px-2' : 'px-5 sm:px-8')}>
          {layout.length === 0 && dbSynced ? (
            <div className="grid h-full place-items-center rounded-lg border border-dashed border-border text-center">
              <div className="max-w-xs text-sm text-muted-foreground">{t('widget.empty')}</div>
            </div>
          ) : (
            <DashboardGrid
              layout={layout}
              onChange={handleChange}
              onRemove={removeWidget}
              extraWidgetMap={extraWidgetMap}
              highlightedId={highlightedWidgetId}
            />
          )}
        </div>
      </div>

      {/* Panneau de structure — équivalent du panneau droit de l'éditeur de page (EditionCanvas) :
          lignes de widgets (1 à 3 côte à côte), réordonnancement/déplacement entre lignes,
          sélecteur de taille, config/retrait par widget, « + » pour ouvrir le catalogue en modale.
          Gère lui-même son repli desktop et son tiroir mobile (cf. DashboardStructurePanel). */}
      <DashboardStructurePanel
        rows={rows}
        widgetMap={allWidgetMap}
        onRowsChange={handleRowsChange}
        onRemove={removeWidget}
        onAdd={addWidget}
        onSetHeight={setWidgetHeight}
        onSetWidth={setWidgetWidth}
        onRemoveAll={removeAllWidgets}
        present={present}
        nativeWidgets={gatedNativeWidgets}
        extraWidgets={legacyWidgets}
        onHighlight={highlightWidget}
      />
    </div>
    </DashboardDataContext.Provider>
  )
}
