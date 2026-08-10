import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useTabs } from '@/components/tabs/tab-store'
import { useZonePool } from '@/components/zone/zone-pool'
import { melisKeyForRoute, toolBaseRoute, useToolRoutesVersion } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'

function formatSeg(path: string): string {
  const seg = path.split('/').filter(Boolean).pop() ?? path
  return decodeURIComponent(seg).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim() || seg
}

/**
 * Route component for a tree-derived tool URL /[section]/[tool] (legacy tool in the iframe pool).
 *
 * Renders no iframe itself — delegates to ZoneFrames (mounted in Shell) so the iframe stays
 * mounted (display:none) across navigations → instant reopen, no reload. The melisKey is resolved
 * from the tool-routes registry (built from the menu, persisted to sessionStorage for deep-links).
 */
export default function ZonePage() {
  const { pathname }      = useLocation()
  const { t }             = useI18n()
  useToolRoutesVersion()  // re-resolve once the registry is populated (deep-link cold load)
  const { openTab, tabs } = useTabs()
  const { register }      = useZonePool()

  const melisKey = melisKeyForRoute(pathname)
  // The top tab is the tool's BASE route /[section]/[tool]; deeper segments (record drill-down)
  // are reflected in the URL by ToolTabBar but never spawn a new top tab.
  const base     = toolBaseRoute(pathname)
  const tabLabel = tabs.find((t) => t.id === base)?.label
  const title    = tabLabel || formatSeg(base)

  useEffect(() => {
    if (!melisKey) return
    openTab({ id: base, label: title, path: base })
    register(melisKey, `/melis/react-tool-page?key=${encodeURIComponent(melisKey)}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [melisKey, base])

  // The tool-routes registry is built from the menu, which the backend filters by RIGHTS. So an
  // unresolvable melisKey on a /[section]/[tool] URL = a tool the current user can't access (or an
  // unknown one) — block it instead of showing a blank shell. A short grace avoids flashing the
  // message on a cold deep-link before the registry has finished loading.
  const [graceOver, setGraceOver] = useState(false)
  useEffect(() => {
    setGraceOver(false)
    const t = window.setTimeout(() => setGraceOver(true), 1200)
    return () => window.clearTimeout(t)
  }, [pathname])

  if (!melisKey) {
    if (!graceOver) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )
    }
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center">
        <ShieldAlert className="size-8 text-muted-foreground/70" />
        <p className="text-sm font-medium text-foreground/80">{t('access.denied')}</p>
        <p className="max-w-md text-xs text-muted-foreground">{t('access.denied_sub')}</p>
      </div>
    )
  }

  return <div className="h-full w-full" />
}
