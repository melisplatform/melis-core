import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, CalendarDays, CheckCircle2,
  Columns3, RotateCcw, Search, Tags, X, type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as logApi from '@/lib/log-api'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
import { ColumnManager, visibleCols, type ColDef } from '@/components/ColumnManager'
import { useCan } from '@/lib/capabilities'

const TOOL_KEY = 'meliscore_logs_tool'

// ─── Cache module-level — survit au démontage (la page est montée en permanence) ──
interface ListCache {
  items: logApi.LogItem[]
  total: number
  stats: logApi.LogStats | null
  filters: logApi.LogFilters | null
  searchInput: string
  search: string
  type: number | null
  user: number | null
  startDate: string
  endDate: string
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

// ─── Colonnes (sélection + ordre persistés en localStorage) ─────────────────────────
const COL_ORDER = ['id', 'date', 'type', 'title', 'message', 'user', 'itemId'] as const
const COL_LABEL: Record<string, I18nKey> = {
  id: 'logs.col.id', date: 'logs.col.date', type: 'logs.col.type',
  title: 'logs.col.title', message: 'logs.col.message', user: 'logs.col.user',
  itemId: 'logs.col.itemId',
}
const DEFAULT_COLS: ColDef[] = COL_ORDER.map(id => ({ id, visible: id !== 'id' }))
const COL_KEY = 'melis-log-cols-v1'
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

function getCellSortValue(l: logApi.LogItem, id: string): string | number {
  if (id === 'id')      return l.id
  if (id === 'date')    return l.date
  if (id === 'type')    return l.typeCode
  if (id === 'title')   return l.title
  if (id === 'message') return l.message
  if (id === 'user')    return l.userName
  if (id === 'itemId')  return l.itemId ?? ''
  return ''
}

function fmtDate(s: string, locale: string): string {
  const d = new Date(s.replace(' ', 'T'))
  return isNaN(d.getTime()) ? s : d.toLocaleString(locale, {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

const selectCls = 'h-9 rounded-md border border-input bg-card px-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30'

// ─── Page ──────────────────────────────────────────────────────────────────────────
export default function LogListPage() {
  const location = useLocation()
  const { openTab } = useTabs()
  const { t, lang } = useI18n()
  const dateLocale = lang === 'fr' ? 'fr-FR' : 'en-GB'
  const base = routeForForward('MelisCore/Log') ?? '/logs'

  // Capacité (droits avancés) : Logs est read-only → seule la liste est gardée.
  const canList = useCan(TOOL_KEY, 'list')

  const showViewToggle = toolHasViewToggle('logs')
  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  const [items, setItems]   = useState<logApi.LogItem[]>(_cache?.items ?? [])
  const [total, setTotal]   = useState(_cache?.total ?? 0)
  const [loading, setLoading] = useState(false)
  const [stats, setStats]   = useState<logApi.LogStats | null>(_cache?.stats ?? null)
  const [filters, setFilters] = useState<logApi.LogFilters | null>(_cache?.filters ?? null)

  const [searchInput, setSearchInput] = useState(_cache?.searchInput ?? '')
  const [search, setSearch] = useState(_cache?.search ?? '')
  const [type, setType]     = useState<number | null>(_cache?.type ?? null)
  const [user, setUser]     = useState<number | null>(_cache?.user ?? null)
  const [startDate, setStartDate] = useState(_cache?.startDate ?? '')
  const [endDate, setEndDate]     = useState(_cache?.endDate ?? '')

  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const [cols, setCols]         = useState<ColDef[]>(loadCols)
  const [showColMgr, setShowColMgr] = useState(false)
  const colMgrRef = useRef<HTMLDivElement>(null)

  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const cacheRef = useRef({ items, total, stats, filters, searchInput, search, type, user, startDate, endDate, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { items, total, stats, filters, searchInput, search, type, user, startDate, endDate, mode, iframeLoaded } })
  useEffect(() => () => { _cache = cacheRef.current }, [])

  useEffect(() => {
    if (location.pathname === base) openTab({ id: base, label: t('logs.title'), path: base })
  }, [location.pathname, openTab, base, t])

  useEffect(() => {
    if (_cache?.stats) return
    logApi.fetchLogStats().then(setStats).catch(() => null)
  }, [])

  useEffect(() => {
    if (_cache?.filters) return
    logApi.fetchLogFilters().then(setFilters).catch(() => null)
  }, [])

  // Filtres serveur (type / user / dates / recherche) → refetch.
  useEffect(() => {
    setLoading(true)
    logApi.fetchLogs({
      limit: 9999, search,
      type, user,
      startDate: startDate ? `${startDate} 00:00:00` : undefined,
      endDate: endDate ? `${endDate} 23:59:59` : undefined,
    })
      .then(res => { setItems(res.items); setTotal(res.total) })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [search, type, user, startDate, endDate, refreshKey])

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
    logApi.fetchLogStats().then(setStats).catch(() => null)
    setTimeout(() => setRefreshing(false), 600)
  }

  function toggleSort(id: string) {
    if (sortCol === id) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(id); setSortDir('asc') }
  }

  const sortedItems = useMemo(() => {
    // Tri par défaut : du plus récent (la liste arrive déjà en date desc).
    if (!sortCol) return items
    return [...items].sort((a, b) => {
      const va = getCellSortValue(a, sortCol), vb = getCellSortValue(b, sortCol)
      const na = typeof va === 'number' ? va : parseFloat(String(va))
      const nb = typeof vb === 'number' ? vb : parseFloat(String(vb))
      const cmp = !isNaN(na) && !isNaN(nb) ? na - nb : String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, sortCol, sortDir])

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{t('logs.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('logs.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {showViewToggle && (
            <ViewModeToggle mode={effectiveMode} onChange={(m) => { setMode(m); if (m === 'iframe') setIframeLoaded(true) }} />
          )}
          <button type="button" onClick={handleRefresh} title={t('common.refresh')}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <RotateCcw className={cn('size-3.5', refreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Vue Melis classique (iframe) */}
      <MelisClassicFrame melisKey="meliscore_logs_tool" title="Logs — Vue Melis"
        visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      {/* Vue React */}
      <div className={cn('flex flex-1 flex-col gap-4', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {!canList ? (
          <p className="text-sm text-muted-foreground">{t('logs.no_list')}</p>
        ) : (<>
        {/* KPI */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard icon={Activity}     label={t('logs.kpi.total')} value={stats?.total ?? null} color="bg-primary/10 text-primary" />
          <KpiCard icon={CalendarDays} label={t('logs.kpi.today')} value={stats?.today ?? null} color="bg-violet-500/10 text-violet-600" />
          <KpiCard icon={Tags}         label={t('logs.kpi.types')} value={stats?.types ?? null} color="bg-emerald-500/10 text-emerald-600" />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              placeholder={t('logs.search')} className="pl-9" />
            {searchInput && <button onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
          </div>

          <select className={selectCls} value={type ?? ''} onChange={e => setType(e.target.value ? Number(e.target.value) : null)}>
            <option value="">{t('logs.filter.type_all')}</option>
            {filters?.types.map(ty => <option key={ty.id} value={ty.id}>{ty.code}</option>)}
          </select>

          {filters?.isAdmin && (
            <select className={selectCls} value={user ?? ''} onChange={e => setUser(e.target.value ? Number(e.target.value) : null)}>
              <option value="">{t('logs.filter.user_all')}</option>
              {filters.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}

          <input type="date" className={selectCls} title={t('logs.filter.from')} value={startDate} onChange={e => setStartDate(e.target.value)} />
          <input type="date" className={selectCls} title={t('logs.filter.to')} value={endDate} onChange={e => setEndDate(e.target.value)} />

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
          <table className="w-full min-w-[720px] text-sm">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 && !loading ? (
                <tr><td colSpan={visibleCols(cols).length} className="px-4 py-10 text-center text-sm text-muted-foreground">{t('logs.empty')}</td></tr>
              ) : sortedItems.map(l => (
                <tr key={l.id} className="group transition-colors hover:bg-muted/40">
                  {visibleCols(cols).map(({ id }) => (
                    <td key={id} className={cn('px-4 py-2.5',
                      (id === 'id' || id === 'itemId') && 'tabular-nums text-muted-foreground',
                      (id === 'date' || id === 'user') && 'whitespace-nowrap',
                      id === 'message' && 'text-muted-foreground',
                      id === 'date' && 'text-muted-foreground')}>
                      {id === 'id' && l.id}
                      {id === 'date' && fmtDate(l.date, dateLocale)}
                      {id === 'type' && <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{l.typeCode}</code>}
                      {id === 'title' && (
                        <div className="flex items-center gap-2">
                          {l.status
                            ? <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                            : <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />}
                          <span className="font-medium">{l.title}</span>
                        </div>
                      )}
                      {id === 'message' && l.message}
                      {id === 'user' && <Badge variant="muted" className="font-normal">{l.userName}</Badge>}
                      {id === 'itemId' && (l.itemId ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-center text-xs text-muted-foreground">
            {loading ? t('common.loading') : t('logs.count', { n: total })}
          </div>
        </div>
        </>)}
      </div>
    </div>
  )
}
