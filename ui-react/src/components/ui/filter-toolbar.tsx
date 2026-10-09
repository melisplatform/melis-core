import { useEffect, useState, type ReactNode } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/i18n/i18n-context'
import { useIsNarrow } from '@/hooks/useIsNarrow'

/** Search field shared by the inline and the mobile layout of {@link FilterToolbar}. */
function SearchInput({ value, onChange, onSubmit, onClear, placeholder, className }: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onClear: () => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input className="h-9 pl-9 pr-8 text-sm" placeholder={placeholder}
        value={value} onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSubmit() }} />
      {value && (
        <button type="button" onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

/** Panel sliding up from the bottom, matching the platform's other fixed-overlay modals. */
function BottomSheet({ open, onClose, title, children, footer }: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div role="dialog" aria-modal="true" aria-label={title}
        className="flex max-h-[85vh] w-full flex-col rounded-t-2xl border-t border-border bg-card text-card-foreground shadow-2xl">
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label={title}
            className="text-muted-foreground transition-colors hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && (
          <div className="flex shrink-0 gap-2 border-t border-border px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Filter row of a list tool.
 *
 * Wide viewport: the search field, the filters and the list actions sit inline (unchanged layout).
 * Narrow viewport: only the search field and a single Filters button remain; the button opens a
 * bottom sheet holding the filters and the actions, with a reset and a close action. The badge on
 * the button shows the number of active filters (`activeCount`).
 */
function FilterToolbar({
  search, onSearchChange, onSearchSubmit, onSearchClear, searchPlaceholder,
  filters, actions, activeCount = 0, onReset,
}: {
  search: string
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
  onSearchClear: () => void
  searchPlaceholder?: string
  /** Filter controls (status, role, platform...). */
  filters?: ReactNode
  /** List actions (columns, export, reset...). */
  actions?: ReactNode
  /** Number of active filters, shown on the Filters button. */
  activeCount?: number
  onReset?: () => void
}) {
  const { t } = useI18n()
  const narrow = useIsNarrow()
  const [open, setOpen] = useState(false)

  if (!narrow) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={onSearchChange} onSubmit={onSearchSubmit}
          onClear={onSearchClear} placeholder={searchPlaceholder}
          className="min-w-[180px] max-w-sm flex-1" />
        {filters}
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
    )
  }

  const hasSheet = Boolean(filters || actions || onReset)
  return (
    <div className="flex items-center gap-2">
      <SearchInput value={search} onChange={onSearchChange} onSubmit={onSearchSubmit}
        onClear={onSearchClear} placeholder={searchPlaceholder} className="flex-1" />
      {hasSheet && (
        <>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}
            aria-label={t('common.filters')} className="h-9 shrink-0 gap-1.5 px-3">
            <SlidersHorizontal className="size-4" />
            {activeCount > 0 && (
              <Badge variant="primary" className="min-w-5 justify-center px-1 tabular-nums">{activeCount}</Badge>
            )}
          </Button>
          <BottomSheet open={open} onClose={() => setOpen(false)} title={t('common.filters')}
            footer={
              <>
                {onReset && (
                  <Button variant="outline" size="sm" className="flex-1"
                    onClick={() => { onReset(); setOpen(false) }}>
                    {t('common.reset_filters')}
                  </Button>
                )}
                <Button size="sm" className="flex-1" onClick={() => setOpen(false)}>{t('common.close')}</Button>
              </>
            }>
            <div className="flex flex-col gap-4">
              {filters}
              {actions && (
                <div className={cn('flex flex-col gap-2', filters && 'border-t border-border pt-4')}>{actions}</div>
              )}
            </div>
          </BottomSheet>
        </>
      )}
    </div>
  )
}

export { FilterToolbar, SearchInput }
