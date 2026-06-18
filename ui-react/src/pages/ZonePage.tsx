import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTabs } from '@/components/tabs/tab-store'
import { useZonePool } from '@/components/zone/zone-pool'
import { melisKeyForRoute, toolBaseRoute, useToolRoutesVersion } from '@/lib/tool-routes'

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

  return <div className="h-full w-full" />
}
