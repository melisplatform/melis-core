import type { ReactNode } from 'react'
import { GripVertical, RotateCcw, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Cadre d'un widget : header (poignée de drag + titre + retirer) + corps.
 *  Le header porte `.widget-drag-handle` → c'est la zone de déplacement (le
 *  corps reste interactif). Équivalent du `widget-head` de Melis. */
export function WidgetFrame({
  title,
  icon: Icon,
  onRemove,
  onReload,
  children,
}: {
  title: string
  icon: LucideIcon
  onRemove: () => void
  onReload: () => void
  children: ReactNode
}) {
  return (
    <div className="group/widget flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-card text-card-foreground shadow-card">
      <div className="widget-drag-handle flex cursor-move select-none items-center gap-2 border-b border-border/60 px-4 py-2.5">
        <GripVertical className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover/widget:text-muted-foreground/70" />
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <h3 className="font-[var(--font-display)] truncate text-sm font-semibold">{title}</h3>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onReload}
            className="grid size-6 shrink-0 place-items-center rounded text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/widget:opacity-100"
            aria-label="Recharger le widget"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onRemove}
            className="grid size-6 shrink-0 place-items-center rounded text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover/widget:opacity-100"
            aria-label="Retirer le widget"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}
