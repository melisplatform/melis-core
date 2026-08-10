import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import { useTabs, type Tab } from './tab-store'

interface TabBarProps {
  onActivate: (tab: Tab) => void
  onClose: (id: string) => void
}

export function TabBar({ onActivate, onClose }: TabBarProps) {
  const { tabs, activeId } = useTabs()
  const { t } = useI18n()

  return (
    <div className="flex items-end overflow-x-auto border-b border-border bg-background px-2 pt-1 shrink-0"
         style={{ scrollbarWidth: 'none' }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <div
            key={tab.id}
            className={cn(
              'group relative flex shrink-0 select-none items-center gap-1 border-b-2 px-3 py-2 text-sm transition-colors cursor-pointer',
              isActive
                ? 'border-primary text-foreground font-medium bg-accent/30'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/20',
            )}
          >
            <button
              type="button"
              className="truncate max-w-[160px] text-left"
              onClick={() => onActivate(tab)}
            >
              {tab.label}
            </button>
            <button
              type="button"
              title={t('layout.close')}
              onClick={(e) => { e.stopPropagation(); onClose(tab.id) }}
              className={cn(
                'ml-0.5 rounded p-0.5 transition-colors hover:bg-muted',
                isActive
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-transparent group-hover:text-muted-foreground',
              )}
            >
              <X className="size-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
