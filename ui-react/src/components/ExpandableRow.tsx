import type { ReactNode } from 'react'
import { Plus, Minus } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ColDef } from './ColumnManager'

/**
 * Per-row "+" toggle (first column of a table) that reveals the columns currently hidden
 * via the Columns manager — same visibility source, just surfaced per-row for narrow
 * viewports instead of only in the Columns dropdown. Pair with <HiddenColsRow>.
 */
export function ExpandToggle({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={expanded}
      className="inline-flex size-6 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
      {expanded ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
    </button>
  )
}

/** Detail row shown under an expanded row — one label/value pair per hidden column. */
export function HiddenColsRow({ cols, labelFor, renderValue, colSpan }: {
  cols: ColDef[]
  labelFor: (id: string) => string
  renderValue: (id: string) => ReactNode
  colSpan: number
}) {
  const hidden = cols.filter((c) => !c.visible)
  if (hidden.length === 0) return null
  return (
    <tr className="bg-muted/20">
      <td colSpan={colSpan} className="px-4 py-3">
        <div className={cn('grid grid-cols-1 gap-x-6 gap-y-2', hidden.length > 1 && 'sm:grid-cols-2')}>
          {hidden.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{labelFor(c.id)}</span>
              <span className="text-right">{renderValue(c.id)}</span>
            </div>
          ))}
        </div>
      </td>
    </tr>
  )
}
