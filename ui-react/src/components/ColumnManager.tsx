import { useLayoutEffect, useState, type RefObject } from 'react'
import { GripVertical, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import { useDragReorder } from '@/hooks/useDragReorder'

/**
 * Gestionnaire de colonnes réutilisable (masquer + RÉORDONNER par glisser-déposer).
 *
 * Deux panneaux : « Masquées » (gauche) et « Visibles » (droite). On glisse une colonne
 * d'un panneau à l'autre pour l'afficher/masquer, et on la glisse sur une autre colonne
 * VISIBLE pour la réordonner. L'ordre de `cols` est la source de vérité : la page doit
 * rendre ses en-têtes ET cellules en itérant `cols` (filtré `visible`) dans CET ordre —
 * voir `visibleCols()` ci-dessous — pour que le réordonnancement prenne effet.
 *
 * Calqué sur le gestionnaire de l'outil Utilisateurs (sans l'épinglage), généralisé via
 * `labelFor(id)` pour être partagé par tous les outils natifs.
 */
export interface ColDef { id: string; visible: boolean }

/** Colonnes visibles, dans l'ordre de `cols` (à utiliser pour rendre la table). */
export function visibleCols(cols: ColDef[]): ColDef[] {
  return cols.filter((c) => c.visible)
}

export function ColumnManager({ cols, labelFor, onChange, onClose, onReset, anchorRef }: {
  cols: ColDef[]
  labelFor: (id: string) => string
  onChange: (cols: ColDef[]) => void
  onClose: () => void
  onReset: () => void
  /** Trigger button (or its wrapper) — the popup is positioned relative to IT, not centered on
   * the viewport, so it stays visually attached to the button that opened it while still being
   * clamped to fit on screen (mobile: was `fixed` + centered near the top, far from the button). */
  anchorRef: RefObject<HTMLElement | null>
}) {
  const { t } = useI18n()
  const { draggingId, overTarget, dragPos, startDragMouse, startDragTouch } = useDragReorder({ cols, onChange })
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number; width: number; maxHeight: number } | null>(null)

  useLayoutEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    // Matches the page's own `p-6` content padding (24px) — clamping to the raw viewport edge
    // (8px) made the popup visibly wider than the search input/button row above it.
    const margin = 24
    const spaceBelow = window.innerHeight - rect.bottom - margin
    const spaceAbove = rect.top - margin
    // Right-align with the anchor by default, but clamp `left` so the popup can never overflow
    // the viewport's left edge — the anchor's own right edge isn't necessarily flush with the
    // true viewport edge (page padding, flex-wrapped buttons), so anchoring purely via a CSS
    // `right: 0` let the popup's left edge go negative/off-screen on narrow screens.
    const width = Math.min(420, window.innerWidth - margin * 2)
    const left = Math.min(Math.max(margin, rect.right - width), window.innerWidth - width - margin)
    if (spaceBelow >= 200 || spaceBelow >= spaceAbove) {
      setPos({ top: rect.bottom + 6, left, width, maxHeight: Math.max(160, spaceBelow - 6) })
    } else {
      setPos({ bottom: window.innerHeight - rect.top + 6, left, width, maxHeight: Math.max(160, spaceAbove - 6) })
    }
  }, [anchorRef])

  const shownCols  = cols.filter((c) => c.visible)
  const hiddenCols = cols.filter((c) => !c.visible)

  function renderItem(col: ColDef, panel: 'visible' | 'hidden') {
    const isOver = overTarget?.id === col.id && overTarget?.panel === panel
    return (
      <div
        key={col.id}
        data-col-item={col.id}
        onMouseDown={startDragMouse(col.id)}
        onTouchStart={startDragTouch(col.id)}
        className={cn(
          'flex touch-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm select-none cursor-grab active:cursor-grabbing transition-colors',
          draggingId === col.id && 'opacity-40',
          isOver ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-accent',
        )}
      >
        <GripVertical className="size-3.5 shrink-0 text-muted-foreground/40" />
        <span className="flex-1 truncate">{labelFor(col.id)}</span>
      </div>
    )
  }

  if (!pos) return null
  return (
    <>
    {/* Floating chip tracking the pointer while dragging — see useDragReorder.ts: on touch
        there's no cursor, so without this the drag/highlight feedback alone can read as
        "nothing is happening" even when the gesture is being tracked correctly. */}
    {draggingId && dragPos && (
      <div
        className="pointer-events-none fixed z-[60] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-lg border border-primary/40 bg-card px-3 py-1.5 text-sm font-medium shadow-xl"
        style={{ left: dragPos.x, top: dragPos.y }}
      >
        <GripVertical className="size-3.5 shrink-0 text-muted-foreground/40" />
        {labelFor(draggingId)}
      </div>
    )}
    <div
      className="fixed z-50 overflow-y-auto rounded-xl border border-border bg-card shadow-xl"
      style={{ top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <span className="text-sm font-semibold">{t('common.columns')}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="size-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        <div
          data-col-panel="hidden"
          className={cn(
            'flex flex-col gap-0.5 min-h-[140px] max-h-[min(48vh,320px)] overflow-y-auto min-w-0 rounded-lg border border-dashed p-1.5',
            overTarget?.id === '__panel__' && overTarget.panel === 'hidden' ? 'border-primary/40 bg-primary/5' : 'border-border',
          )}
        >
          <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('common.cols_hidden')}</p>
          {hiddenCols.length === 0
            ? <div className="flex flex-1 items-center justify-center py-4 text-[11px] text-muted-foreground/40">{t('common.drag_here')}</div>
            : hiddenCols.map((col) => renderItem(col, 'hidden'))}
        </div>
        <div
          data-col-panel="visible"
          className={cn(
            'flex flex-col gap-0.5 min-h-[140px] max-h-[min(48vh,320px)] overflow-y-auto min-w-0 rounded-lg border border-dashed p-1.5',
            overTarget?.id === '__panel__' && overTarget.panel === 'visible' ? 'border-primary/40 bg-primary/5' : 'border-border',
          )}
        >
          <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('common.cols_visible')}</p>
          {shownCols.length === 0
            ? <div className="flex flex-1 items-center justify-center py-4 text-[11px] text-muted-foreground/40">{t('common.drag_here')}</div>
            : shownCols.map((col) => renderItem(col, 'visible'))}
        </div>
      </div>
      <div className="border-t border-border p-1.5">
        <button onClick={onReset} className="w-full rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">{t('common.reset')}</button>
      </div>
    </div>
    </>
  )
}
