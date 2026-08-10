import { Loader2, RefreshCw } from 'lucide-react'
import { useI18n } from '@/i18n/i18n-context'
import { useZonePool } from './zone-pool'

interface Props {
  activeKey: string | null
}

/**
 * Renders all registered Melis tool iframes.
 * Only the active one is visible (display:block); the others are hidden
 * (display:none) but their DOM nodes — and the loaded iframe documents —
 * are preserved.  Re-opening a zone that was already loaded is instant.
 */
export function ZoneFrames({ activeKey }: Props) {
  const { t } = useI18n()
  const { entries, markReady, markError, reload } = useZonePool()

  if (entries.size === 0) return null

  return (
    <>
      {Array.from(entries.entries()).map(([key, entry]) => {
        const visible = key === activeKey
        return (
          <div
            key={key}
            className="absolute inset-0"
            style={{ display: visible ? 'block' : 'none' }}
          >
            {/* Full-bleed: the tool's white background extends to the content-area edges,
                no card/margin/padding (tools aren't shown in a floating bubble). */}
            <div className="flex h-full w-full flex-col bg-card overflow-hidden relative">
              {/* Spinner affiché tant que l'iframe charge */}
              {entry.state === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {entry.state === 'error' ? (
                <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span>{t('layout.zone_load_error')}</span>
                  <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">{key}</span>
                </div>
              ) : (
                <>
                  <iframe
                    key={entry.src}
                    src={entry.src}
                    title={key}
                    className="h-full w-full border-0 flex-1"
                    onLoad={() => markReady(key)}
                    onError={() => markError(key)}
                    // No `sandbox`: first-party same-origin tool pages we render. allow-scripts +
                    // allow-same-origin make the sandbox ineffective (Chrome: "can escape its
                    // sandboxing"); dropping it clears that console warning without a real security change.
                  />
                  <button
                    onClick={() => reload(key)}
                    title={t('layout.reload_from_server')}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground shadow backdrop-blur hover:text-foreground"
                  >
                    <RefreshCw className="size-3" />
                    {t('layout.reload')}
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}
