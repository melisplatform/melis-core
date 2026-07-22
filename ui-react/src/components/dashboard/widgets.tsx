import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { useTheme } from '@/theme/theme-context'

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

  // ── Couleur d'accent du thème, transmise à l'iframe ────────────────────────────────────────
  // L'iframe est un DOCUMENT à part : elle n'hérite ni du `data-theme` de l'hôte ni de ses
  // variables CSS. On lit donc `--primary` résolue sur `<html>` (le thème reste la seule source
  // de vérité, cf. theme/themes.ts) et on la passe dans l'URL — le param CHANGE avec le thème,
  // donc l'iframe se recharge d'elle-même et il n'y a pas de flash de contenu non thémé.
  // On NORMALISE la valeur avant de l'envoyer, via un élément sonde : `getPropertyValue` rend le
  // token BRUT tel qu'écrit dans la feuille, et il n'est pas forcément hexadécimal — le minifieur
  // du build réécrit `#ff0000` en `red` (mot-clé CSS), et un thème pourrait tout aussi bien poser
  // `oklch(...)` ou `color-mix(...)`. Le `color` calculé d'un élément, lui, est toujours résolu en
  // `rgb(...)` : une seule forme à valider côté PHP, quelle que soit l'écriture du thème.
  const { theme } = useTheme()
  const primary = useMemo(() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
    if (!raw) return ''
    const probe = document.createElement('span')
    probe.style.display = 'none'
    probe.style.color = raw
    document.body.appendChild(probe)
    const resolved = getComputedStyle(probe).color
    probe.remove()
    return resolved || raw
  }, [theme])

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
      const item = frameRef.current.closest('.grid-stack-item') as (HTMLElement & { gridstackNode?: { id?: string } }) | null
      const itemId = item?.gridstackNode?.id
      if (!itemId) return
      window.dispatchEvent(new CustomEvent('melis:widget-autofit', { detail: { itemId, contentPx: d.px } }))
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
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-card/70">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <iframe
        ref={frameRef}
        src={`/melis/react-dashboard-plugin?plugin=${encodeURIComponent(pluginName)}&primary=${encodeURIComponent(primary)}`}
        className="h-full w-full border-0"
        title={pluginName}
        style={{ minHeight: 120 }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        onLoad={() => setLoading(false)}
      />
    </div>
  )
}
