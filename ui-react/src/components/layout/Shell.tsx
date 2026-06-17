import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { SubTabBar } from './SubTabBar'
import { ToolTabBar } from './ToolTabBar'
import { Notifications } from '@/components/Notifications'
import { ZonePoolProvider } from '@/components/zone/zone-pool'
import { ZoneFrames } from '@/components/zone/ZoneFrames'
import { SubTabProvider } from '@/components/tabs/sub-tab-store'
import { ToolTabBridgeProvider } from '@/components/tabs/tool-tab-bridge'
import { useBricks } from '@/lib/bricks'
import { PERSISTENT_MODULES } from '@/lib/module-registry'

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  )
}

function ShellInner() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const bricks = useBricks()

  // When a tab is closed, destroy the persistent iframe of a brick tool (singleton kept in
  // <body> as #melis-brick-frame-<id> to avoid reload on tab switch) — so reopening reloads it
  // fresh instead of restoring its previous state (open sub-tabs, etc.).
  useEffect(() => {
    const onClosed = (e: Event) => {
      const path = (e as CustomEvent<{ path?: string }>).detail?.path ?? ''
      const brick = bricks.find((b) => b.route && (path === b.route || path.startsWith(b.route + '/')))
      if (brick) document.getElementById('melis-brick-frame-' + brick.id)?.remove()
    }
    window.addEventListener('melis:tab-closed', onClosed)
    return () => window.removeEventListener('melis:tab-closed', onClosed)
  }, [bricks])

  const zoneMatch = location.pathname.match(/^\/zone\/([^/]+)/)
  const activeZoneKey = zoneMatch ? decodeURIComponent(zoneMatch[1]) : null

  // Modules persistants : liste montée en permanence pour ne jamais détruire
  // leur iframe Melis (toggle New/Old). Active quand on est sur leur route racine.
  const activePersistent = PERSISTENT_MODULES.find((m) => location.pathname === m.route)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Notifications />
      <Sidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleSidebar={() => setCollapsed((c) => !c)} />
        <SubTabBar />
        <ToolTabBar />

        <main className="relative flex-1 overflow-hidden">
          {/* Listes persistantes — toujours dans le DOM, cachées hors de leur route */}
          {PERSISTENT_MODULES.map((m) => {
            const List = m.list
            return (
              <div
                key={m.id}
                className={cn('h-full overflow-y-auto', activePersistent?.id !== m.id && 'hidden')}
              >
                <Suspense fallback={<PageLoader />}>
                  <List />
                </Suspense>
              </div>
            )
          })}

          {/* Toutes les autres pages via Outlet (formulaires, News, Dashboard…) */}
          <div className={cn('h-full overflow-y-auto', activePersistent && 'hidden')}>
            <Outlet />
          </div>

          {/* Pool d'iframes Melis zone — toujours monté, jamais détruit. */}
          <ZoneFrames activeKey={activeZoneKey} />
        </main>
      </div>
    </div>
  )
}

export function Shell() {
  return (
    <ZonePoolProvider>
      <SubTabProvider>
        <ToolTabBridgeProvider>
          <ShellInner />
        </ToolTabBridgeProvider>
      </SubTabProvider>
    </ZonePoolProvider>
  )
}
