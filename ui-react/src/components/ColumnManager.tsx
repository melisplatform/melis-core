import { useState } from 'react'
import { GripVertical, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'

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

export function ColumnManager({ cols, labelFor, onChange, onClose, onReset }: {
  cols: ColDef[]
  labelFor: (id: string) => string
  onChange: (cols: ColDef[]) => void
  onClose: () => void
  onReset: () => void
}) {
  const { t } = useI18n()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overTarget, setOverTarget] = useState<{ id: string; panel: 'visible' | 'hidden' } | null>(null)

  const shownCols  = cols.filter((c) => c.visible)
  const hiddenCols = cols.filter((c) => !c.visible)

  function handleDrop(panel: 'visible' | 'hidden') {
    if (!draggingId) return
    const srcItem = cols.find((c) => c.id === draggingId)!
    const updatedItem = { ...srcItem, visible: panel === 'visible' }
    let vList = shownCols.filter((c) => c.id !== draggingId)
    const hList = hiddenCols.filter((c) => c.id !== draggingId)
    if (panel === 'visible') {
      const dstId = overTarget?.id
      if (!dstId || dstId === '__panel__') {
        vList = [...vList, updatedItem]
      } else {
        const idx = vList.findIndex((c) => c.id === dstId)
        vList = idx === -1 ? [...vList, updatedItem] : [...vList.slice(0, idx), updatedItem, ...vList.slice(idx)]
      }
      onChange([...vList, ...hList])
    } else {
      onChange([...vList, ...hList, updatedItem])
    }
    setDraggingId(null); setOverTarget(null)
  }

  function renderItem(col: ColDef, panel: 'visible' | 'hidden') {
    const isOver = overTarget?.id === col.id && overTarget?.panel === panel
    return (
      <div
        key={col.id}
        draggable
        onDragStart={() => setDraggingId(col.id)}
        onDragEnd={() => { setDraggingId(null); setOverTarget(null) }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (overTarget?.id !== col.id || overTarget?.panel !== panel) setOverTarget({ id: col.id, panel }) }}
        onDrop={(e) => { e.preventDefault(); handleDrop(panel) }}
        className={cn(
          'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm select-none cursor-grab active:cursor-grabbing transition-colors',
          draggingId === col.id && 'opacity-40',
          isOver ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-accent',
        )}
      >
        <GripVertical className="size-3.5 shrink-0 text-muted-foreground/40" />
        <span className="flex-1 truncate">{labelFor(col.id)}</span>
      </div>
    )
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-1.5 w-[420px] max-w-[calc(100vw-1rem)] rounded-xl border border-border bg-card shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <span className="text-sm font-semibold">{t('common.columns')}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="size-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        <div
          className="flex flex-col gap-0.5 min-h-[140px] max-h-[min(48vh,320px)] overflow-y-auto min-w-0 rounded-lg border border-dashed border-border p-1.5"
          onDragOver={(e) => { e.preventDefault(); if (overTarget?.id !== '__panel__' || overTarget?.panel !== 'hidden') setOverTarget({ id: '__panel__', panel: 'hidden' }) }}
          onDrop={(e) => { e.preventDefault(); handleDrop('hidden') }}
        >
          <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('common.cols_hidden')}</p>
          {hiddenCols.length === 0
            ? <div className="flex flex-1 items-center justify-center py-4 text-[11px] text-muted-foreground/40">{t('common.drag_here')}</div>
            : hiddenCols.map((col) => renderItem(col, 'hidden'))}
        </div>
        <div
          className="flex flex-col gap-0.5 min-h-[140px] max-h-[min(48vh,320px)] overflow-y-auto min-w-0 rounded-lg border border-dashed border-border p-1.5"
          onDragOver={(e) => { e.preventDefault(); if (overTarget?.id !== '__panel__' || overTarget?.panel !== 'visible') setOverTarget({ id: '__panel__', panel: 'visible' }) }}
          onDrop={(e) => { e.preventDefault(); handleDrop('visible') }}
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
  )
}
