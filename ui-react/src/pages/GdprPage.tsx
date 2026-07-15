import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Database, Megaphone, Server, ShieldOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
import { useCan } from '@/lib/capabilities'
import { GDPR_TOOL_KEY } from '@/components/gdpr/gdpr-shared'

const GdprDataTab = lazy(() => import('@/components/gdpr/GdprDataTab'))
const GdprBannersTab = lazy(() => import('@/components/gdpr/GdprBannersTab'))
const GdprAutoDeleteTab = lazy(() => import('@/components/gdpr/GdprAutoDeleteTab'))
const GdprSmtpTab = lazy(() => import('@/components/gdpr/GdprSmtpTab'))

type TabId = 'data' | 'banners' | 'autodelete' | 'smtp'
const TABS: { id: TabId; label: I18nKey; icon: typeof Database }[] = [
  { id: 'data', label: 'gdpr.tab.data', icon: Database },
  { id: 'banners', label: 'gdpr.tab.banners', icon: Megaphone },
  { id: 'autodelete', label: 'gdpr.tab.autodelete', icon: ShieldOff },
  { id: 'smtp', label: 'gdpr.tab.smtp', icon: Server },
]

// Cache module-level (page montée en permanence).
let _cache = { mode: 'react' as ViewMode, iframeLoaded: false, tab: 'data' as TabId }

export default function GdprPage() {
  const location = useLocation()
  const { openTab } = useTabs()
  const { t } = useI18n()
  const base = routeForForward('MelisCore/MelisCoreGdpr') ?? '/gdpr'
  const canList = useCan(GDPR_TOOL_KEY, 'list')

  const showViewToggle = toolHasViewToggle('gdpr')
  const [mode, setMode] = useState<ViewMode>(_cache.mode)
  const [iframeLoaded, setIframeLoaded] = useState(_cache.iframeLoaded)
  const [tab, setTab] = useState<TabId>(_cache.tab)
  /** Conteneur du header où l'onglet actif projette ses actions (Save…). */
  const [actionsHost, setActionsHost] = useState<HTMLDivElement | null>(null)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  useEffect(() => { _cache = { mode, iframeLoaded, tab } }, [mode, iframeLoaded, tab])

  useEffect(() => {
    if (location.pathname === base) openTab({ id: base, label: t('gdpr.title'), path: base })
  }, [location.pathname, openTab, base, t])

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{t('gdpr.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('gdpr.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {showViewToggle && (
            <ViewModeToggle mode={effectiveMode} onChange={(m) => { setMode(m); if (m === 'iframe') setIframeLoaded(true) }} />
          )}
          {/* Emplacement des actions de l'onglet actif (portail : cf. GdprSmtpTab). */}
          <div ref={setActionsHost} className="flex items-center gap-2" />
        </div>
      </div>

      {/* Vue Melis classique (iframe) */}
      <MelisClassicFrame melisKey={GDPR_TOOL_KEY} title="GDPR — Vue Melis"
        visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      {/* Vue React */}
      <div className={cn('flex flex-1 flex-col gap-4', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {!canList ? (
          <p className="text-sm text-muted-foreground">{t('gdpr.no_list')}</p>
        ) : (<>
          {/* Barre d'onglets */}
          <div className="flex flex-wrap gap-1 border-b border-border">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setTab(id)}
                className={cn('-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  tab === id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
                <Icon className="size-4" />{t(label)}
              </button>
            ))}
          </div>

          <Suspense fallback={<div className="px-4 py-10 text-center text-sm text-muted-foreground">{t('common.loading')}</div>}>
            {tab === 'data' && <GdprDataTab />}
            {tab === 'banners' && <GdprBannersTab />}
            {tab === 'autodelete' && <GdprAutoDeleteTab />}
            {tab === 'smtp' && <GdprSmtpTab actionsHost={actionsHost} />}
          </Suspense>
        </>)}
      </div>
    </div>
  )
}
