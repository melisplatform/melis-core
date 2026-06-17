import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  activeMelisKey: string | null
}

/**
 * Iframe persistante qui héberge le back-office Melis classique.
 *
 * - Montée paresseusement au premier outil ouvert (évite de charger /melis inutilement).
 * - Reste montée même quand on navigue vers une page React (iframe cachée).
 * - Au chargement de l'iframe, injecte du CSS pour masquer le header/menu Melis.
 * - À chaque changement d'activeMelisKey, appelle melisHelper.tabOpen() pour
 *   afficher le bon outil (ou le réactiver s'il était déjà ouvert).
 */
export function MelisToolFrame({ activeMelisKey }: Props) {
  const iframeRef  = useRef<HTMLIFrameElement>(null)
  const [melisReady, setMelisReady] = useState(false)
  const [mounted,    setMounted]    = useState(false)

  // Montage paresseux : on ne rend l'iframe qu'à la première ouverture d'outil.
  useEffect(() => {
    if (activeMelisKey && !mounted) setMounted(true)
  }, [activeMelisKey, mounted])

  const handleLoad = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return

    const style = doc.createElement('style')
    style.textContent = `
      /* Header top bar et zone de tabs */
      #id_meliscore_header,
      #melis-navtabs-container-outer { display: none !important; }

      /* Menu gauche (outer wrapper = #menu) */
      #menu { display: none !important; }

      html, body {
        padding-top: 0 !important;
        margin-top:  0 !important;
        overflow: auto !important;
      }

      /* Zone de contenu : prend toute la largeur sans offset sidebar */
      #content {
        margin-left:  0 !important;
        padding-left: 0 !important;
        padding-top:  0 !important;
        width: 100%  !important;
      }

      /* Modales Melis dans l'iframe */
      .modal-backdrop { position: fixed !important; }
    `
    doc.head.appendChild(style)
    setMelisReady(true)
  }

  useEffect(() => {
    if (!melisReady || !activeMelisKey) return

    const win = iframeRef.current?.contentWindow as Record<string, unknown> | null
    if (!win) return

    let timeoutId: ReturnType<typeof setTimeout>

    const tryOpen = (retries: number) => {
      const helper = win.melisHelper as
        | { tabOpen: (...args: unknown[]) => void }
        | undefined

      if (helper?.tabOpen) {
        helper.tabOpen(
          '',                      // title (tab bar Melis est masquée)
          'fa-cube',               // icon  (tab bar Melis est masquée)
          'id_' + activeMelisKey,  // zoneId
          activeMelisKey,          // melisKey
          {},                      // parameters
          undefined,               // navTabsGroup
          undefined                // callback
        )
      } else if (retries > 0) {
        timeoutId = setTimeout(() => tryOpen(retries - 1), 250)
      }
    }

    tryOpen(20) // 20 × 250 ms = 5 s max
    return () => clearTimeout(timeoutId)
  }, [melisReady, activeMelisKey])

  if (!mounted) return null

  return (
    <iframe
      ref={iframeRef}
      src="/melis"
      title="Melis Tool"
      onLoad={handleLoad}
      className={cn(
        'absolute inset-0 h-full w-full border-0',
        activeMelisKey ? 'block' : 'hidden',
      )}
    />
  )
}
