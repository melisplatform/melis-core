import { useState } from 'react'
import { FileDown, FileText, GripVertical, Loader2, X } from 'lucide-react'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import type { ColDef } from '@/components/ColumnManager'

/**
 * Modale d'export générique — réutilisable par tout outil natif de la liste full-React.
 * Mêmes capacités que l'outil de référence (Users) : choix du format (Excel .xlsx / CSV),
 * panneaux Incluses / Exclues réordonnables par glisser-déposer, récupération de TOUTES les
 * lignes (avec les filtres actifs) via `fetchAll`. Le contenu des cellules est fourni par
 * `getCell` (texte traduit, pas le rendu JSX). Libellés communs via les clés `common.export.*`.
 */

function ExcelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="22" height="22" rx="3" fill="#217346" />
      <line x1="7.5" y1="7.5" x2="16.5" y2="16.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="16.5" y1="7.5" x2="7.5" y2="16.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export interface ExportModalProps<T> {
  /** Colonnes (ordre + visibilité) : les visibles sont pré-incluses. */
  cols: ColDef[]
  /** Libellé traduit d'une colonne. */
  labelFor: (id: string) => string
  /** Récupère TOUTES les lignes à exporter (filtres actifs appliqués côté appelant). */
  fetchAll: () => Promise<T[]>
  /** Valeur (texte/nombre) d'une cellule pour l'export. */
  getCell: (item: T, id: string) => string | number
  /** Base du nom de fichier (sans extension ni date). */
  filename: string
  /** Nom de l'onglet du classeur Excel. */
  sheetName: string
  /** Nombre total de lignes (pour le sous-titre). */
  total: number
  onClose: () => void
}

export function ExportModal<T>({
  cols, labelFor, fetchAll, getCell, filename, sheetName, total, onClose,
}: ExportModalProps<T>) {
  const { t } = useI18n()
  const [included, setIncluded] = useState<ColDef[]>(() => cols.filter(c => c.visible))
  const [excluded, setExcluded] = useState<ColDef[]>(() => cols.filter(c => !c.visible))
  const [format, setFormat] = useState<'csv' | 'xlsx'>('xlsx')
  const [exporting, setExporting] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overTarget, setOverTarget] = useState<{ id: string; panel: 'included' | 'excluded' } | null>(null)

  function handleDrop(panel: 'included' | 'excluded') {
    if (!draggingId) return
    const srcItem = [...included, ...excluded].find(c => c.id === draggingId)!
    let inc = included.filter(c => c.id !== draggingId)
    let exc = excluded.filter(c => c.id !== draggingId)
    if (panel === 'included') {
      const dstId = overTarget?.id
      if (!dstId || dstId === '__panel__') { inc = [...inc, srcItem] }
      else { const idx = inc.findIndex(c => c.id === dstId); inc = idx === -1 ? [...inc, srcItem] : [...inc.slice(0, idx), srcItem, ...inc.slice(idx)] }
    } else { exc = [...exc, srcItem] }
    setIncluded(inc); setExcluded(exc)
    setDraggingId(null); setOverTarget(null)
  }

  function renderItem(col: ColDef, panel: 'included' | 'excluded') {
    const isOver = overTarget?.id === col.id && overTarget?.panel === panel
    return (
      <div
        key={col.id}
        draggable
        onDragStart={() => setDraggingId(col.id)}
        onDragEnd={() => { setDraggingId(null); setOverTarget(null) }}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); if (overTarget?.id !== col.id || overTarget?.panel !== panel) setOverTarget({ id: col.id, panel }) }}
        onDrop={e => { e.preventDefault(); handleDrop(panel) }}
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

  async function doExport() {
    if (included.length === 0) return
    setExporting(true)
    try {
      const all = await fetchAll()
      const header = included.map(c => labelFor(c.id))
      const rows = all.map(item => included.map(c => getCell(item, c.id)))
      const dateStr = new Date().toISOString().slice(0, 10)
      if (format === 'xlsx') {
        const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, sheetName)
        XLSX.writeFile(wb, `${filename}-${dateStr}.xlsx`)
      } else {
        const csv = [header, ...rows]
          .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
          .join('\n')
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
        const url  = URL.createObjectURL(blob)
        const a    = Object.assign(document.createElement('a'), { href: url, download: `${filename}-${dateStr}.csv` })
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      onClose()
    } catch (e) {
      alert(e instanceof Error ? e.message : t('common.export.error'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-[480px] rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">{t('common.export.title')}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{t('common.export.subtitle', { n: total })}</p>
          </div>
          <button onClick={onClose} className="ml-4 text-muted-foreground hover:text-foreground transition-colors"><X className="size-4" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 gap-1">
            <button onClick={() => setFormat('xlsx')}
              className={cn('flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors', format === 'xlsx' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <ExcelIcon className="size-4" /> Excel (.xlsx)
            </button>
            <button onClick={() => setFormat('csv')}
              className={cn('flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors', format === 'csv' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <FileText className="size-4" /> CSV (.csv)
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div
              className="flex flex-col gap-0.5 min-h-[100px] rounded-lg border border-dashed border-border p-1.5"
              onDragOver={e => { e.preventDefault(); if (overTarget?.id !== '__panel__' || overTarget?.panel !== 'excluded') setOverTarget({ id: '__panel__', panel: 'excluded' }) }}
              onDrop={e => { e.preventDefault(); handleDrop('excluded') }}
            >
              <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('common.export.excluded')}</p>
              {excluded.length === 0
                ? <div className="flex flex-1 items-center justify-center py-2 text-[11px] text-muted-foreground/40">{t('common.drag_here')}</div>
                : excluded.map(col => renderItem(col, 'excluded'))}
            </div>
            <div
              className="flex flex-col gap-0.5 min-h-[100px] rounded-lg border border-dashed border-border p-1.5"
              onDragOver={e => { e.preventDefault(); if (overTarget?.id !== '__panel__' || overTarget?.panel !== 'included') setOverTarget({ id: '__panel__', panel: 'included' }) }}
              onDrop={e => { e.preventDefault(); handleDrop('included') }}
            >
              <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('common.export.included')}</p>
              {included.length === 0
                ? <div className="flex flex-1 items-center justify-center py-2 text-[11px] text-muted-foreground/40">{t('common.drag_here')}</div>
                : included.map(col => renderItem(col, 'included'))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={exporting}>{t('common.cancel')}</Button>
          <Button size="sm" onClick={doExport} disabled={exporting || included.length === 0} className="gap-1.5">
            {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
            {exporting ? t('common.export.exporting') : t('common.export.download', { fmt: format.toUpperCase() })}
          </Button>
        </div>
      </div>
    </div>
  )
}
