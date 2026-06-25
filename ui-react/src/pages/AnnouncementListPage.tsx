import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Circle, Columns3, FileDown, Megaphone,
  Pencil, Plus, RotateCcw, Search, Trash2, X, type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as annApi from '@/lib/announcement-api'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
import { ColumnManager, visibleCols, type ColDef } from '@/components/ColumnManager'
import { ExportModal } from '@/components/ExportModal'

// ─── Cache module-level — survit au démontage (la page est montée en permanence) ──
interface ListCache {
  items: annApi.AnnouncementItem[]
  total: number
  search: string
  searchInput: string
  status: '' | '0' | '1'
  stats: annApi.AnnouncementStats | null
  mode: ViewMode
  iframeLoaded: boolean
}
let _cache: ListCache | null = null

// ─── Carte KPI ───────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, color }: {
  icon: LucideIcon; label: string; value: number | null; color: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className={cn('grid size-10 shrink-0 place-items-center rounded-lg', color)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold tabular-nums">
          {value === null ? <span className="inline-block h-5 w-10 animate-pulse rounded bg-muted" /> : value}
        </p>
      </div>
    </div>
  )
}

// ─── Confirmation de suppression ───────────────────────────────────────────────────
function DeleteConfirm({ announcement, onConfirm, onCancel }: {
  announcement: annApi.AnnouncementItem; onConfirm: () => void; onCancel: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <h3 className="text-base font-semibold">{t('ann.delete.title')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('ann.delete.confirm', { name: announcement.title })}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>{t('common.cancel')}</Button>
          <Button variant="outline" size="sm" onClick={onConfirm}
            className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">{t('common.delete')}</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Colonnes (sélection + ordre persistés en localStorage) ─────────────────────────
const COL_ORDER = ['id', 'status', 'title', 'text', 'date', 'user'] as const
const COL_LABEL: Record<string, I18nKey> = {
  id: 'ann.col.id', status: 'ann.col.status', title: 'ann.col.title',
  text: 'ann.col.text', date: 'ann.col.date', user: 'ann.col.user',
}
const DEFAULT_COLS: ColDef[] = COL_ORDER.map(id => ({ id, visible: id !== 'id' }))
const COL_KEY = 'melis-announcement-cols-v1'
function loadCols(): ColDef[] {
  try {
    const raw = localStorage.getItem(COL_KEY)
    if (!raw) return DEFAULT_COLS
    const saved: ColDef[] = JSON.parse(raw)
    const ordered = saved.map(s => { const d = DEFAULT_COLS.find(c => c.id === s.id); return d ? { id: d.id, visible: s.visible } : null }).filter(Boolean) as ColDef[]
    const missing = DEFAULT_COLS.filter(d => !saved.find(s => s.id === d.id))
    return [...ordered, ...missing]
  } catch { return DEFAULT_COLS }
}
function saveCols(cols: ColDef[]) { localStorage.setItem(COL_KEY, JSON.stringify(cols)) }

function getCellSortValue(a: annApi.AnnouncementItem, id: string): string | number {
  if (id === 'id')     return a.id
  if (id === 'status') return a.status ? 1 : 0
  if (id === 'title')  return a.title
  if (id === 'text')   return a.text
  if (id === 'date')   return a.date
  if (id === 'user')   return a.userName
  return ''
}

function fmtDate(s: string, locale: string): string {
  const d = new Date(s.replace(' ', 'T'))
  return isNaN(d.getTime()) ? s : d.toLocaleString(locale, {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

/** Aperçu texte : on retire le HTML et on tronque. */
function textPreview(html: string, max = 60): string {
  const txt = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return txt.length > max ? txt.slice(0, max) + '…' : txt
}

/** Valeur traduite d'une cellule pour l'EXPORT (texte complet, pas de troncature). */
function getCellExport(
  a: annApi.AnnouncementItem, id: string,
  t: (k: I18nKey, v?: Record<string, string | number>) => string, dateLocale: string,
): string | number {
  if (id === 'id')     return a.id
  if (id === 'status') return a.status ? t('ann.status.active') : t('ann.status.inactive')
  if (id === 'title')  return a.title
  if (id === 'text')   return a.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (id === 'date')   return fmtDate(a.date, dateLocale)
  if (id === 'user')   return a.userName
  return ''
}

// ─── Page ──────────────────────────────────────────────────────────────────────────
export default function AnnouncementListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { openTab } = useTabs()
  const { t, lang } = useI18n()
  const dateLocale = lang === 'fr' ? 'fr-FR' : 'en-GB'
  const base = routeForForward('MelisCore/Announcement') ?? '/announcements'

  const showViewToggle = toolHasViewToggle('announcements')
  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  const [items, setItems]   = useState<annApi.AnnouncementItem[]>(_cache?.items ?? [])
  const [total, setTotal]   = useState(_cache?.total ?? 0)
  const [loading, setLoading] = useState(false)
  const [stats, setStats]   = useState<annApi.AnnouncementStats | null>(_cache?.stats ?? null)

  const [search, setSearch]           = useState(_cache?.search ?? '')
  const [searchInput, setSearchInput] = useState(_cache?.searchInput ?? '')
  const [status, setStatus]           = useState<'' | '0' | '1'>(_cache?.status ?? '')

  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const [cols, setCols]         = useState<ColDef[]>(loadCols)
  const [showColMgr, setShowColMgr] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const colMgrRef = useRef<HTMLDivElement>(null)

  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [toDelete, setToDelete] = useState<annApi.AnnouncementItem | null>(null)

  const cacheRef = useRef({ items, total, search, searchInput, status, stats, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { items, total, search, searchInput, status, stats, mode, iframeLoaded } })
  useEffect(() => () => { _cache = cacheRef.current }, [])

  useEffect(() => {
    if (location.pathname === base) {
      openTab({ id: base, label: t('ann.title'), path: base })
      if (annApi.consumeAnnouncementsListStale()) {
        setRefreshKey(k => k + 1)
        annApi.fetchAnnouncementStats().then(setStats).catch(() => null)
      }
    }
  }, [location.pathname, openTab, base, t])

  useEffect(() => {
    if (_cache?.stats) return
    annApi.fetchAnnouncementStats().then(setStats).catch(() => null)
  }, [])

  useEffect(() => {
    setLoading(true)
    annApi.fetchAnnouncements({ limit: 9999, search, status })
      .then(res => { setItems(res.items); setTotal(res.total) })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [search, status, refreshKey])

  useEffect(() => {
    if (!showColMgr) return
    const h = (e: MouseEvent) => { if (colMgrRef.current && !colMgrRef.current.contains(e.target as Node)) setShowColMgr(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showColMgr])

  function applySearch() { setSearch(searchInput.trim()) }
  function clearSearch() { setSearchInput(''); setSearch('') }

  function handleRefresh() {
    _cache = null
    setRefreshing(true)
    setRefreshKey(k => k + 1)
    annApi.fetchAnnouncementStats().then(setStats).catch(() => null)
    setTimeout(() => setRefreshing(false), 600)
  }

  function toggleSort(id: string) {
    if (sortCol === id) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(id); setSortDir('asc') }
  }

  const sortedItems = useMemo(() => {
    if (!sortCol) return items
    return [...items].sort((a, b) => {
      const va = getCellSortValue(a, sortCol), vb = getCellSortValue(b, sortCol)
      const na = typeof va === 'number' ? va : parseFloat(String(va))
      const nb = typeof vb === 'number' ? vb : parseFloat(String(vb))
      const cmp = !isNaN(na) && !isNaN(nb) ? na - nb : String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, sortCol, sortDir])

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await annApi.deleteAnnouncement(toDelete.id)
      setItems(prev => prev.filter(a => a.id !== toDelete.id))
      setTotal(t => t - 1)
      setToDelete(null)
      setRefreshKey(k => k + 1)
      annApi.fetchAnnouncementStats().then(setStats).catch(() => null)
    } catch { setToDelete(null) }
  }

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{t('ann.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('ann.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {showViewToggle && (
            <ViewModeToggle mode={effectiveMode} onChange={(m) => { setMode(m); if (m === 'iframe') setIframeLoaded(true) }} />
          )}
          <button type="button" onClick={handleRefresh} title={t('common.refresh')}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <RotateCcw className={cn('size-3.5', refreshing && 'animate-spin')} />
          </button>
          <Button size="sm" onClick={() => navigate(`${base}/new`)}>
            <Plus className="size-4" />{t('ann.new')}
          </Button>
        </div>
      </div>

      {/* Vue Melis classique (iframe) */}
      <MelisClassicFrame melisKey="melis_core_announcement_tool" title="Announcements — Vue Melis"
        visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      {/* Vue React */}
      <div className={cn('flex flex-1 flex-col gap-4', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {/* KPI */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard icon={Megaphone}   label={t('ann.kpi.total')}    value={stats?.total    ?? null} color="bg-primary/10 text-primary" />
          <KpiCard icon={CheckCircle2} label={t('ann.kpi.active')}   value={stats?.active   ?? null} color="bg-emerald-500/10 text-emerald-600" />
          <KpiCard icon={Circle}      label={t('ann.kpi.inactive')} value={stats?.inactive ?? null} color="bg-muted text-muted-foreground" />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              placeholder={t('ann.search')} className="pl-9" />
            {searchInput && <button onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
          </div>
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 gap-1">
            {([
              { val: '' as const,  label: t('ann.filter.all'),      dot: null },
              { val: '1' as const, label: t('ann.status.active'),   dot: 'bg-emerald-500' },
              { val: '0' as const, label: t('ann.status.inactive'), dot: 'bg-red-500' },
            ]).map(({ val, label, dot }) => (
              <button key={val} type="button" onClick={() => setStatus(val)}
                className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  status === val ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                {dot && <span className={cn('size-1.5 rounded-full', dot)} />}
                {label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div ref={colMgrRef} className="relative">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowColMgr(v => !v)}>
                <Columns3 className="size-3.5" />{t('common.columns')}
              </Button>
              {showColMgr && <ColumnManager cols={cols} labelFor={(id) => t(COL_LABEL[id])}
                onChange={(c) => { setCols(c); saveCols(c) }} onClose={() => setShowColMgr(false)}
                onReset={() => { setCols(DEFAULT_COLS); saveCols(DEFAULT_COLS) }} />}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowExport(true)}>
              <FileDown className="size-3.5" />{t('common.export')}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="sticky top-0 border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {visibleCols(cols).map(({ id }) => {
                  const isSorted = sortCol === id
                  const SIcon = isSorted ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
                  return (
                    <th key={id} className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap', id === 'id' && 'w-16', id === 'status' && 'w-20')}>
                      <button type="button" onClick={() => toggleSort(id)}
                        className={cn('flex items-center gap-1 transition-colors hover:text-foreground', isSorted && 'text-primary')}>
                        {t(COL_LABEL[id])}
                        <SIcon className={cn('size-3', isSorted ? 'opacity-100' : 'opacity-30')} />
                      </button>
                    </th>
                  )
                })}
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 && !loading ? (
                <tr><td colSpan={visibleCols(cols).length + 1} className="px-4 py-10 text-center text-sm text-muted-foreground">{t('ann.empty')}</td></tr>
              ) : sortedItems.map(a => (
                <tr key={a.id} className="group transition-colors hover:bg-muted/40">
                  {visibleCols(cols).map(({ id }) => (
                    <td key={id} className={cn('px-4 py-2.5',
                      id === 'id' && 'tabular-nums text-muted-foreground',
                      id === 'text' && 'text-muted-foreground',
                      (id === 'date' || id === 'user') && 'whitespace-nowrap',
                      id === 'date' && 'text-muted-foreground')}>
                      {id === 'id' && a.id}
                      {id === 'status' && (a.status
                        ? <Badge variant="success" className="gap-1"><CheckCircle2 className="size-3" />{t('ann.status.active')}</Badge>
                        : <Badge variant="muted" className="gap-1"><Circle className="size-3" />{t('ann.status.inactive')}</Badge>)}
                      {id === 'title' && <span className="font-medium">{a.title}</span>}
                      {id === 'text' && textPreview(a.text)}
                      {id === 'date' && fmtDate(a.date, dateLocale)}
                      {id === 'user' && <Badge variant="muted" className="font-normal">{a.userName}</Badge>}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`${base}/${a.id}`)} title={t('common.edit')}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => setToDelete(a)} title={t('common.delete')}
                        className="inline-flex size-7 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-center text-xs text-muted-foreground">
            {loading ? t('common.loading') : t('ann.count', { n: total })}
          </div>
        </div>
      </div>

      {toDelete && <DeleteConfirm announcement={toDelete} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />}
      {showExport && (
        <ExportModal
          cols={cols}
          labelFor={(id) => t(COL_LABEL[id])}
          fetchAll={async () => (await annApi.fetchAnnouncements({ limit: 9999, search, status })).items}
          getCell={(a, id) => getCellExport(a, id, t, dateLocale)}
          filename={t('ann.export.filename')}
          sheetName={t('ann.title')}
          total={total}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
