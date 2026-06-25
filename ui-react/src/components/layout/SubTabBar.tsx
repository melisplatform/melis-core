import { FileText, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSubTabs } from '@/components/tabs/sub-tab-store'
import { MODULES } from '@/lib/module-registry'
import { routeForForward, useToolRoutesVersion } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'

function SubTabBarInner({
  sectionKey, listPath, tabIcon: TabIcon,
}: { sectionKey: string; listPath: string; tabIcon: React.ElementType }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { t } = useI18n()
  const { tabs, closeTab } = useSubTabs(sectionKey)

  if (tabs.length === 0) return null

  function handleClose(e: React.MouseEvent, tabId: string) {
    e.stopPropagation()
    const idx = tabs.findIndex(t => t.id === tabId)
    closeTab(tabId)
    if (pathname === tabId) {
      const next = tabs[idx + 1] ?? tabs[idx - 1]
      navigate(next ? next.path : listPath)
    }
  }

  return (
    <div
      className="flex items-stretch border-b border-border bg-muted/30 px-2 overflow-x-auto shrink-0"
      style={{ scrollbarWidth: 'none' }}
    >
      <button
        type="button"
        onClick={() => navigate(listPath)}
        className="mr-1 shrink-0 flex items-center px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
      >
        ← {t('common.back')}
      </button>
      {tabs.map(tab => {
        const isActive = pathname === tab.path
        return (
          <div
            key={tab.id}
            onClick={() => navigate(tab.path)}
            style={{
              borderBottom: isActive
                ? '2px solid var(--color-primary)'
                : '2px solid transparent',
            }}
            className={cn(
              'group flex cursor-pointer items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap select-none',
              isActive
                ? 'text-foreground bg-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            )}
          >
            <TabIcon className="size-3 shrink-0" />
            <span className="max-w-[140px] truncate">{tab.label}</span>
            <button
              type="button"
              onClick={(e) => handleClose(e, tab.id)}
              className="ml-0.5 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
            >
              <X className="size-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function SubTabBar() {
  // Re-render once tool routes register so the derived routes become available.
  useToolRoutesVersion()
  const { pathname } = useLocation()
  // Sections keyed by the tree-DERIVED route (App.tsx mounts tools there via routeForForward),
  // NOT the static registry m.route — else the bar never matches /[section]/[tool]/:id and the
  // sub-tab navigation (← retour + named tabs) never appears.
  const section = MODULES
    .map((m) => ({ key: routeForForward(m.forwardKey) ?? m.route, icon: m.icon ?? FileText }))
    .find((s) => pathname === s.key || pathname.startsWith(s.key + '/'))
  if (!section) return null
  return <SubTabBarInner sectionKey={section.key} listPath={section.key} tabIcon={section.icon} />
}
