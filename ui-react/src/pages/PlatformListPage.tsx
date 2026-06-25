import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Columns3, Database, Pencil, Plus,
  RotateCcw, Search, Server, ShoppingBag, Trash2, X, type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as platformApi from '@/lib/platform-api'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
import { ColumnManager, visibleCols, type ColDef } from '@/components/ColumnManager'

// ─── Cache module-level — survit au démontage (la page est montée en permanence) ──
interface ListCache {
  items: platformApi.PlatformItem[]
  total: number
  search: string
  searchInput: string
  stats: platformApi.PlatformStats | null
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
function DeleteConfirm({ platform, onConfirm, onCancel }: {
  platform: platformApi.PlatformItem; onConfirm: () => void; onCancel: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <h3 className="text-base font-semibold">{t('platforms.delete.title')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('platforms.delete.confirm', { name: platform.name })}</p>
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
const COL_ORDER = ['id', 'name', 'marketplace', 'cache'] as const
const COL_LABEL: Record<string, I18nKey> = {
  id: 'platforms.col.id', name: 'platforms.col.name', marketplace: 'platforms.col.marketplace', cache: 'platforms.col.cache',
}
const DEFAULT_COLS: ColDef[] = COL_ORDER.map(id => ({ id, visible: true }))
const COL_KEY = 'melis-platform-cols-v1'
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

function getCellSortValue(p: platformApi.PlatformItem, id: string): string | number {
  if (id === 'id')          return p.id
  if (id === 'name')        return p.name
  if (id === 'marketplace') return p.marketplace ? 1 : 0
  if (id === 'cache')       return p.cache ? 1 : 0
  return ''
}

// ─── Page ──────────────────────────────────────────────────────────────────────────
export default function PlatformListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { openTab } = useTabs()
  const { t } = useI18n()
  const base = routeForForward('MelisCore/Platforms') ?? '/platforms'

  const showViewToggle = toolHasViewToggle('platforms')
  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  const [items, setItems]   = useState<platformApi.PlatformItem[]>(_cache?.items ?? [])
  const [total, setTotal]   = useState(_cache?.total ?? 0)
  const [loading, setLoading] = useState(false)
  const [stats, setStats]   = useState<platformApi.PlatformStats | null>(_cache?.stats ?? null)

  const [search, setSearch]           = useState(_cache?.search ?? '')
  const [searchInput, setSearchInput] = useState(_cache?.searchInput ?? '')

  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const [cols, setCols]         = useState<ColDef[]>(loadCols)
  const [showColMgr, setShowColMgr] = useState(false)
  const colMgrRef = useRef<HTMLDivElement>(null)

  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [toDelete, setToDelete] = useState<platformApi.PlatformItem | null>(null)

  const cacheRef = useRef({ items, total, search, searchInput, stats, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { items, total, search, searchInput, stats, mode, iframeLoaded } })
  useEffect(() => () => { _cache = cacheRef.current }, [])

  useEffect(() => {
    if (location.pathname === base) {
      openTab({ id: base, label: t('platforms.title'), path: base })
      if (platformApi.consumePlatformsListStale()) {
        setRefreshKey(k => k + 1)
        platformApi.fetchPlatformStats().then(setStats).catch(() => null)
      }
    }
  }, [location.pathname, openTab, base, t])

  useEffect(() => {
    if (_cache?.stats) return
    platformApi.fetchPlatformStats().then(setStats).catch(() => null)
  }, [])

  useEffect(() => {
    setLoading(true)
    platformApi.fetchPlatforms({ limit: 9999, search })
      .then(res => { setItems(res.items); setTotal(res.total) })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [search, refreshKey])

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
    platformApi.fetchPlatformStats().then(setStats).catch(() => null)
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
      await platformApi.deletePlatform(toDelete.id)
      setItems(prev => prev.filter(p => p.id !== toDelete.id))
      setTotal(t => t - 1)
      setToDelete(null)
      setRefreshKey(k => k + 1)
      platformApi.fetchPlatformStats().then(setStats).catch(() => null)
    } catch { setToDelete(null) }
  }

  const yesNo = (v: boolean) => v
    ? <Badge variant="default" className="border-emerald-200 bg-emerald-500/10 text-emerald-600">{t('common.yes')}</Badge>
    : <span className="text-muted-foreground">—</span>

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{t('platforms.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('platforms.subtitle')}</p>
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
            <Plus className="size-4" />{t('platforms.new')}
          </Button>
        </div>
      </div>

      {/* Vue Melis classique (iframe) */}
      <MelisClassicFrame melisKey="meliscore_tool_platform" title="Platforms — Vue Melis"
        visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      {/* Vue React */}
      <div className={cn('flex flex-1 flex-col gap-4', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {/* KPI */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard icon={Server}      label={t('platforms.kpi.total')}       value={stats?.total       ?? null} color="bg-primary/10 text-primary" />
          <KpiCard icon={ShoppingBag} label={t('platforms.kpi.marketplace')} value={stats?.marketplace ?? null} color="bg-violet-500/10 text-violet-600" />
          <KpiCard icon={Database}    label={t('platforms.kpi.cache')}       value={stats?.cache       ?? null} color="bg-emerald-500/10 text-emerald-600" />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              placeholder={t('platforms.search')} className="pl-9" />
            {searchInput && <button onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
          </div>
          <div ref={colMgrRef} className="relative">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowColMgr(v => !v)}>
              <Columns3 className="size-3.5" />{t('common.columns')}
            </Button>
            {showColMgr && <ColumnManager cols={cols} labelFor={(id) => t(COL_LABEL[id])}
              onChange={(c) => { setCols(c); saveCols(c) }} onClose={() => setShowColMgr(false)}
              onReset={() => { setCols(DEFAULT_COLS); saveCols(DEFAULT_COLS) }} />}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="sticky top-0 border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {visibleCols(cols).map(({ id }) => {
                  const isSorted = sortCol === id
                  const SIcon = isSorted ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
                  return (
                    <th key={id} className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap', id === 'id' && 'w-16')}>
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
                <tr><td colSpan={visibleCols(cols).length + 1} className="px-4 py-10 text-center text-sm text-muted-foreground">{t('platforms.empty')}</td></tr>
              ) : sortedItems.map(p => (
                <tr key={p.id} className="group transition-colors hover:bg-muted/40">
                  {visibleCols(cols).map(({ id }) => (
                    <td key={id} className={cn('px-4 py-2.5', id === 'id' && 'tabular-nums text-muted-foreground')}>
                      {id === 'id' && p.id}
                      {id === 'name' && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{p.name}</span>
                          {p.isCurrent && <Badge variant="default" className="border-amber-200 bg-amber-500/10 text-amber-600"><CheckCircle2 className="mr-1 size-3" />{t('platforms.current')}</Badge>}
                        </div>
                      )}
                      {id === 'marketplace' && yesNo(p.marketplace)}
                      {id === 'cache' && yesNo(p.cache)}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`${base}/${p.id}`)} title={t('common.edit')}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Pencil className="size-3.5" />
                      </button>
                      {!p.isCurrent && (
                        <button onClick={() => setToDelete(p)} title={t('common.delete')}
                          className="inline-flex size-7 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-center text-xs text-muted-foreground">
            {loading ? t('common.loading') : t('platforms.count', { n: total })}
          </div>
        </div>
      </div>

      {toDelete && <DeleteConfirm platform={toDelete} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />}
    </div>
  )
}
