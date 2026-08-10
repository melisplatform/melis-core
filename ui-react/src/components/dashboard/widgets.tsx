import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Loader2 } from 'lucide-react'

import { useTheme } from '@/theme/theme-context'
import { useIsNarrow } from '@/hooks/useIsNarrow'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useI18n } from '@/i18n/i18n-context'
import { formatRelativeHours } from '@/lib/format'
import { useDashboardData } from './dashboard-data-context'
import { WorkflowCommentDialog, type WorkflowCommentParams } from './WorkflowCommentDialog'
import { PluginConfirmDialog } from './PluginConfirmDialog'

/** Demande de confirmation « Oui / Non » émise par un plugin legacy dans son iframe. */
interface PluginConfirmRequest {
  id: number
  title?: string
  message?: string
  textOk?: string
  textNo?: string
}

/**
 * Ajuste la hauteur de la tuile au contenu RÉEL d'un widget React natif (pas de scroll).
 *
 * Même canal que les plugins legacy (`melis:widget-autofit`, cf. DashboardGrid) — seule la source
 * de la mesure change : ici l'élément de contenu lui-même, plutôt qu'un postMessage d'iframe.
 * La mesure est intrinsèque (le corps du widget est `overflow:auto`, il ne contraint donc pas la
 * hauteur de l'élément) → appliquer la hauteur ne change pas la mesure suivante : pas de boucle.
 */
function useAutofitContent<T extends HTMLElement>(ref: RefObject<T | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    let pending = 0
    const publish = () => {
      pending = 0
      const item = el.closest('.grid-stack-item') as (HTMLElement & { gridstackNode?: { id?: string } }) | null
      const itemId = item?.gridstackNode?.id
      const contentPx = el.scrollHeight
      if (!itemId || !contentPx) return
      window.dispatchEvent(new CustomEvent('melis:widget-autofit', { detail: { itemId, contentPx } }))
    }
    // La largeur de la tuile influe sur la mesure (retour à la ligne) → on re-mesure au resize,
    // coalescé en une frame comme pour les iframes.
    const ro = new ResizeObserver(() => {
      if (pending) return
      pending = requestAnimationFrame(publish)
    })
    ro.observe(el)
    publish()
    return () => {
      if (pending) cancelAnimationFrame(pending)
      ro.disconnect()
    }
  }, [ref, enabled])
}

export function ActivityContent() {
  const { t, lang } = useI18n()
  const { stats } = useDashboardData()
  const listRef = useRef<HTMLUListElement>(null)
  // Pas d'ajustement sur le squelette : sa hauteur est arbitraire et la tuile sauterait deux fois.
  useAutofitContent(listRef, !!stats?.activity.length)

  // Données réelles : dernières connexions utilisateurs.
  if (stats) {
    if (!stats.activity.length) {
      return <p className="text-sm text-muted-foreground">{t('dash.recent_activity')}</p>
    }
    return (
      <ul ref={listRef} className="space-y-4">
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

/** Renders a legacy Melis dashboard plugin (PHP) inside an iframe. */
export function LegacyPluginContent({ pluginName }: { pluginName: string }) {
  // Un widget plugin legacy est une iframe qui charge tout le bundle de la plateforme →
  // ça peut prendre plusieurs secondes. On affiche un spinner tant que l'iframe n'a pas
  // fini de charger (onLoad) : couvre le 1er affichage ET chaque rechargement (remontage).
  const [loading, setLoading] = useState(true)
  // Le contenu du plugin débute-t-il par une barre d'onglets ? Renseigné au `load` de l'iframe :
  // dans ce cas la tuile annule son retrait HAUT pour que les onglets touchent l'en-tête (legacy).
  const [tabsFlush, setTabsFlush] = useState(false)
  // L'ajustement de la tuile à la hauteur du contenu sert au DIMENSIONNEMENT INITIAL : la hauteur
  // déclarée d'un plugin est une estimation souvent trop courte, et lui seul sait quand ses
  // graphiques sont dessinés. Il reste donc armé au chargement (et à chaque rechargement), le temps
  // que le contenu se pose — puis se désarme à la PREMIÈRE interaction dans le plugin : à partir de
  // là, la taille affichée est celle que l'utilisateur a acceptée, et un contenu plus haut défile
  // au lieu de faire grandir la tuile (comportement d'un widget du dashboard classique).
  const autofitArmed = useRef(true)
  // Modale « Ajouter un commentaire » du plugin Workflow : le tool legacy l'ouvrait dans l'iframe
  // (où une petite tuile la rognait) ; l'iframe nous demande désormais de la rendre au niveau de
  // l'hôte, centrée sur la page (cf. WorkflowCommentDialog + le postMessage dans PluginViewController).
  const [wfComment, setWfComment] = useState<WorkflowCommentParams | null>(null)
  // Confirmation « Oui / Non » d'un plugin legacy (ex. Valider / Refuser du Workflow) : idem, l'iframe
  // nous demande de l'afficher centrée sur la page ; on lui renvoie ensuite le choix de l'utilisateur.
  const [confirm, setConfirm] = useState<PluginConfirmRequest | null>(null)
  // Hauteur de CONTENU mesurée par le plugin (postMessage `__melisPluginHeight`, mesure « éléments »
  // STABLE, indépendante de la taille de l'iframe — pas le `scrollHeight` plafonné). Sert de PLANCHER
  // de hauteur à l'iframe : quand l'utilisateur rétrécit la tuile SOUS le contenu, l'iframe garde cette
  // hauteur (le contenu reste à sa taille réelle, pas compressé par la chaîne de % du thème legacy) et
  // c'est le CADRE React (déjà `overflow-auto`) qui affiche l'ascenseur. 0 tant que non mesuré.
  const [contentPx, setContentPx] = useState(0)

  // Les graphiques flot sont des CANVAS dessinés une fois, à la largeur du conteneur au moment du
  // rendu. Redimensionner la tuile agrandit l'iframe mais pas le canvas : le graphique reste étroit
  // avec du blanc à droite. `jquery.flot.resize` sait redessiner — il écoute l'événement `resize`
  // de SA fenêtre, qu'un redimensionnement de l'iframe ne déclenche pas. On le lui envoie donc.
  const frameRef = useRef<HTMLIFrameElement>(null)

  // ── Thème de l'hôte, transmis à l'iframe ───────────────────────────────────────────────────
  // L'iframe est un DOCUMENT à part : elle n'hérite ni du `data-theme` de l'hôte ni de ses
  // variables CSS. On lit donc les tokens résolus sur `<html>` (le thème reste la seule source de
  // vérité, cf. theme/themes.ts) et on les passe dans l'URL — les params CHANGENT avec le thème,
  // donc l'iframe se recharge d'elle-même et il n'y a pas de flash de contenu non thémé.
  // Le mode sombre passe par le MÊME canal : le HTML legacy est écrit pour un fond clair (surfaces
  // blanches et textes sombres codés en dur), donc la seule couleur d'accent ne suffit pas — d'où
  // `scheme` (dark|light) et les 4 tokens de surface qu'utilisent les surcharges du document iframe.
  const { theme } = useTheme()
  const themeParams = useMemo(() => {
    // `getPropertyValue` rend le token BRUT tel qu'écrit dans la feuille, pas forcément hexadécimal
    // (le minifieur du build réécrit `#ff0000` en `red` ; un thème peut poser `oklch(...)`). Le
    // `color` CALCULÉ d'un élément, lui, est toujours résolu en `rgb(...)` : une seule forme à
    // valider côté PHP, quelle que soit l'écriture du thème.
    const css = getComputedStyle(document.documentElement)
    const probe = document.createElement('span')
    probe.style.display = 'none'
    document.body.appendChild(probe)
    const resolve = (token: string) => {
      const raw = css.getPropertyValue(token).trim()
      if (!raw) return ''
      probe.style.color = raw
      return getComputedStyle(probe).color || raw
    }
    const params = {
      primary: resolve('--primary'),
      bg: resolve('--card'),
      fg: resolve('--foreground'),
      border: resolve('--border'),
      muted: resolve('--muted-foreground'),
      // Aujourd'hui « sombre » == thème studio (cf. theme/themes.ts, qui n'a pas d'axe light/dark
      // séparé). Si un tel axe apparaît un jour, SEULE cette ligne change : le contrat avec
      // l'iframe (`?scheme=dark|light`) reste le même.
      scheme: document.documentElement.dataset.theme === 'studio' ? 'dark' : 'light',
    }
    probe.remove()
    return params
  }, [theme])

  // ── Mise en page mobile du plugin ─────────────────────────────────────────────────────────
  // Le document du plugin ne peut PAS en décider seul : ses media queries s'évaluent sur la largeur
  // de l'IFRAME, qui vaut ~350px aussi bien pour une tuile `col-4` d'un grand écran (où le plugin
  // doit garder sa mise en page « BO large ») que pour une tuile pleine largeur de téléphone. Seul
  // l'hôte connaît la vraie largeur de FENÊTRE → on lui transmet ce booléen, et lui seul active le
  // bloc CSS « étroit » de la page du plugin (cf. PluginViewController, `data-melis-narrow`).
  const narrow = useIsNarrow()

  // L'URL de l'iframe FIGE le thème du 1er rendu et ne change jamais ensuite : changer le `src`
  // rechargeait tout le bundle plateforme (jQuery/Bootstrap/flot/DataTable + refetch des données) →
  // plusieurs secondes à chaque bascule. Capturée une seule fois (initialiseur `useState`).
  // Idem pour `narrow` : porté par l'URL au 1er rendu (aucun flash de mise en page « large »),
  // puis mis à jour à chaud par postMessage ci-dessous.
  const [iframeSrc] = useState(
    () =>
      `/melis/react-dashboard-plugin?${new URLSearchParams({ plugin: pluginName, ...themeParams, narrow: narrow ? '1' : '0' })}`,
  )

  // Bascule étroit ↔ large sans recharger l'iframe (rotation d'un téléphone, fenêtre redimensionnée) :
  // même canal et même raison que le re-thème ci-dessous. Le 1er passage est ignoré — l'URL porte déjà
  // l'état initial. `narrowRef` sert au renvoi au `load` : un changement survenu AVANT que le document
  // du plugin n'ait installé son écouteur serait perdu (message posté dans le vide).
  const narrowRef = useRef(narrow)
  narrowRef.current = narrow
  const narrowSyncedOnce = useRef(false)
  useEffect(() => {
    if (!narrowSyncedOnce.current) {
      narrowSyncedOnce.current = true
      return
    }
    frameRef.current?.contentWindow?.postMessage({ __melisNarrow: true, narrow }, '*')
  }, [narrow])

  // Bascule de thème : on ne recharge PLUS l'iframe. On pousse les nouveaux tokens au document déjà
  // chargé (postMessage `__melisRetheme`, cf. PluginViewController) qui les applique via ses variables
  // CSS + l'attribut de scheme — instantané. `themeParams` est mémoïsé sur `[theme]`, donc cet effet
  // ne se déclenche qu'au montage (ignoré : l'URL porte déjà ce thème) puis à chaque changement.
  // Les graphiques flot (peints dans un <canvas>) ne suivent pas les variables CSS : le document du
  // plugin les RE-TRACE lui-même à la réception de ce message (cf. PluginViewController).
  const themedOnce = useRef(false)
  useEffect(() => {
    if (!themedOnce.current) {
      themedOnce.current = true
      return
    }
    frameRef.current?.contentWindow?.postMessage({ __melisRetheme: true, ...themeParams }, '*')
  }, [themeParams])

  // ── Hauteur de tuile ajustée au contenu réel du plugin ────────────────────────────────────
  // La hauteur DÉCLARÉE par un plugin (cf. grid-metrics) est une estimation, souvent trop courte :
  // le plugin Prospects tient sur 802px mesurés là où sa déclaration donne ~478px → bas rogné.
  // La mesure vient du document lui-même (postMessage `__melisPluginHeight`, cf.
  // PluginViewController) : lui seul sait quand ses graphiques sont dessinés, et il mesure les
  // ÉLÉMENTS — seule grandeur stable ici (identique dans une iframe de 319px ou de 2400px).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data as { __melisPluginHeight?: boolean; px?: number } | null
      if (!d || !d.__melisPluginHeight || !d.px) return
      // Plusieurs iframes de plugins coexistent : ne réagir qu'aux messages de LA nôtre.
      if (!frameRef.current || e.source !== frameRef.current.contentWindow) return
      // Plancher de hauteur de l'iframe → ascenseur du cadre React quand la tuile est plus courte.
      // Toujours mis à jour : même tuile figée, un contenu plus haut doit rester ATTEIGNABLE
      // (l'iframe dépasse le cadre `overflow-auto`, qui affiche alors un ascenseur).
      setContentPx(d.px)
      // …mais on ne REDIMENSIONNE la tuile que tant que l'ajustement est « armé » (cf. autofitArmed) :
      // sinon, chaque interaction dans le plugin rejoue l'ajustement. Un simple changement d'onglet
      // fait varier la hauteur du contenu → la tuile grandit puis rétrécit, animée par gridstack :
      // elle « bouge » sous le curseur alors que l'utilisateur a déjà choisi sa taille.
      if (!autofitArmed.current) return
      const item = frameRef.current.closest('.grid-stack-item') as (HTMLElement & { gridstackNode?: { id?: string } }) | null
      const itemId = item?.gridstackNode?.id
      if (!itemId) return
      window.dispatchEvent(new CustomEvent('melis:widget-autofit', { detail: { itemId, contentPx: d.px } }))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Demandes d'UI émises par NOTRE iframe et rendues au niveau de l'hôte, centrées sur la page :
  // la modale de commentaire du Workflow et les confirmations « Oui / Non » des plugins legacy.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Plusieurs iframes de plugins coexistent : ne réagir qu'aux messages de LA nôtre.
      if (!frameRef.current || e.source !== frameRef.current.contentWindow) return
      const d = e.data as
        | { __melisWorkflowComment?: boolean; params?: WorkflowCommentParams; __melisConfirm?: boolean; id?: number; title?: string; message?: string; textOk?: string; textNo?: string }
        | null
      if (!d) return
      if (d.__melisWorkflowComment) setWfComment(d.params ?? {})
      else if (d.__melisConfirm && typeof d.id === 'number') {
        setConfirm({ id: d.id, title: d.title, message: d.message, textOk: d.textOk, textNo: d.textNo })
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    let pending = 0
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
      })
    })
    ro.observe(frame)
    return () => {
      if (pending) cancelAnimationFrame(pending)
      ro.disconnect()
    }
  }, [])

  return (
    // `minHeight = contentPx` : le contenu du plugin garde sa hauteur réelle même si la tuile est
    // rétrécie sous cette taille → le wrapper dépasse le cadre `overflow-auto` de WidgetFrame, qui
    // affiche alors un ascenseur (droite/bas) au lieu de rogner. À taille normale/agrandie, `h-full`
    // domine et l'iframe remplit la tuile (pas d'ascenseur). Voir `contentPx` plus haut.
    // `marginTop` négatif : quand le plugin COMMENCE par une barre d'onglets, elle doit toucher
    // l'en-tête de la tuile, comme dans le dashboard classique où les onglets font partie du cadre
    // du widget. Le retrait vient du `p-4` (ou `p-2` en étroit) que WidgetFrame applique à TOUS les
    // widgets ; rien à l'intérieur de l'iframe ne peut le compenser (le contenu ne déborde pas au-
    // dessus du bord haut). On annule donc ce seul retrait haut, ici — les côtés et le bas gardent
    // le leur, et les plugins sans onglets ne changent pas.
    <div
      className="relative h-full w-full"
      style={{
        ...(contentPx ? { minHeight: contentPx } : {}),
        ...(tabsFlush ? { marginTop: narrow ? -8 : -16 } : {}),
      }}
    >
      {loading && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-card/70">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <iframe
        ref={frameRef}
        src={iframeSrc}
        className="h-full w-full border-0"
        title={pluginName}
        style={{ minHeight: contentPx || 120 }}
        // No `sandbox`: this is first-party, same-origin, authenticated content we generate
        // (/melis/react-dashboard-plugin). `allow-scripts` + `allow-same-origin` together make the
        // sandbox ineffective anyway — Chrome logs "an iframe … can escape its sandboxing" on every
        // dashboard load. Dropping the attribute removes that console noise with no real security
        // change (the widget already needed scripts, forms, popups, modals and same-origin session).
        onLoad={() => {
          setLoading(false)
          // Rattrapage : si la largeur a changé pendant le chargement du plugin, l'URL porte l'état
          // périmé et le postMessage émis à ce moment-là n'avait pas d'écouteur en face.
          frameRef.current?.contentWindow?.postMessage({ __melisNarrow: true, narrow: narrowRef.current }, '*')
          // Le plugin commence-t-il par une barre d'onglets générée ? (cf. marginTop plus haut)
          // Lecture directe du DOM de l'iframe : elle est same-origin (contenu que nous produisons),
          // donc pas besoin d'un postMessage de plus. En cas d'échec, on laisse le retrait par défaut.
          try {
            const doc = frameRef.current?.contentDocument
            setTabsFlush(!!doc?.querySelector('.widget.widget-tabs .melis-dpc-tab'))
            // (Ré)arme l'ajustement pour ce chargement, puis le désarme au premier geste dans le
            // plugin (cf. autofitArmed). `capture` : certains plugins arrêtent la propagation de
            // leurs clics. `once` : un seul désarmement suffit.
            autofitArmed.current = true
            doc?.addEventListener('pointerdown', () => { autofitArmed.current = false }, { capture: true, once: true })
          } catch {
            /* iframe pas prête : on garde le comportement par défaut */
          }
        }}
      />
      {confirm && (
        <PluginConfirmDialog
          title={confirm.title}
          message={confirm.message}
          textOk={confirm.textOk}
          textNo={confirm.textNo}
          onResult={(kind) => {
            // On renvoie le choix à l'iframe émettrice, qui rejoue le bon callback dans son contexte.
            frameRef.current?.contentWindow?.postMessage(
              { __melisConfirmResult: true, id: confirm.id, result: kind },
              '*',
            )
            setConfirm(null)
          }}
        />
      )}
      {wfComment && (
        <WorkflowCommentDialog params={wfComment} onClose={() => setWfComment(null)} />
      )}
    </div>
  )
}
