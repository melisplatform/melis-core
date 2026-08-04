import { Fragment, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, CalendarDays, CheckCircle2,
  Columns3, Loader2, RotateCcw, Search, Tags, X, type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as logApi from '@/lib/log-api'
import { useKeysetList } from '@/lib/use-keyset-list'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
import { ColumnManager, visibleCols, type ColDef } from '@/components/ColumnManager'
import { ExpandToggle, HiddenColsRow } from '@/components/ExpandableRow'
import { useIsNarrow } from '@/hooks/useIsNarrow'
import { useCan } from '@/lib/capabilities'

const TOOL_KEY = 'meliscore_logs_tool'

// ─── Cache module-level — survit au démontage (la page est montée en permanence) ──
interface ListCache {
  items: logApi.LogItem[]
  total: number
  cursor: string | null
  hasMore: boolean
  sortCol: string
  sortDir: 'asc' | 'desc'
  stats: logApi.LogStats | null
  filters: logApi.LogFilters | null
  searchInput: string
  search: string
  type: number | null
  title: string | null
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
    <div className="flex min-w-[160px] flex-1 items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
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
  const narrow = useIsNarrow()
  const dateLocale = lang === 'fr' ? 'fr-FR' : 'en-GB'
  const base = routeForForward('MelisCore/Log') ?? '/logs'

  // Capacité (droits avancés) : Logs est read-only → seule la liste est gardée.
  const canList = useCan(TOOL_KEY, 'list')

  const showViewToggle = toolHasViewToggle('logs')
  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  const [stats, setStats]   = useState<logApi.LogStats | null>(_cache?.stats ?? null)
  const [filters, setFilters] = useState<logApi.LogFilters | null>(_cache?.filters ?? null)

  const [searchInput, setSearchInput] = useState(_cache?.searchInput ?? '')
  const [search, setSearch] = useState(_cache?.search ?? '')
  const [type, setType]     = useState<number | null>(_cache?.type ?? null)
  const [title, setTitle]   = useState<string | null>(_cache?.title ?? null)
  const [user, setUser]     = useState<number | null>(_cache?.user ?? null)
  const [startDate, setStartDate] = useState(_cache?.startDate ?? '')
  const [endDate, setEndDate]     = useState(_cache?.endDate ?? '')

  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const [cols, setCols]         = useState<ColDef[]>(loadCols)
  const [showColMgr, setShowColMgr] = useState(false)
  const colMgrRef = useRef<HTMLDivElement>(null)
  // Mobile-only: force the table down to just "title" regardless of the desktop ColumnManager
  // preference, with the rest reachable via a per-row "+" — desktop behavior (cols as-is, no "+"
  // column at all) is untouched since hasHidden/displayCols only diverge from `cols` when narrow.
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const toggleExpand = (id: number) => setExpanded((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n
  })
  const displayCols = narrow ? cols.map(c => ({ ...c, visible: c.id === 'title' })) : cols
  const hasHidden = narrow

  // Scroll infini + tri server-side + keyset (backend en SQL brut via le trait).
  const {
    items, total, loading, hasMore, sentinelRef,
    sortCol, sortDir, toggleSort, reload, snapshot,
  } = useKeysetList<logApi.LogItem>({
    fetcher: (a) => logApi.fetchLogs({
      ...a,
      sort: a.sort as logApi.LogSortKey,
      search,
      type, title, user,
      startDate: startDate ? `${startDate} 00:00:00` : undefined,
      endDate: endDate ? `${endDate} 23:59:59` : undefined,
    }),
    deps: [search, type, title, user, startDate, endDate, refreshKey],
    defaultSort: 'date',
    defaultDir: 'desc',
    initial: _cache
      ? { items: _cache.items, total: _cache.total, cursor: _cache.cursor, hasMore: _cache.hasMore, sortCol: _cache.sortCol, sortDir: _cache.sortDir }
      : undefined,
    skipInitial: !!(_cache && _cache.items.length),
  })

  const cacheRef = useRef<ListCache>({ ...snapshot(), stats, filters, searchInput, search, type, title, user, startDate, endDate, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { ...snapshot(), stats, filters, searchInput, search, type, title, user, startDate, endDate, mode, iframeLoaded } })
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
    reload()
    logApi.fetchLogStats().then(setStats).catch(() => null)
    setTimeout(() => setRefreshing(false), 600)
  }

  // Réinitialise recherche + filtres (type / utilisateur / dates), puis recharge.
  // Changer les filtres met à jour `deps` → le hook relance un chargement frais.
  function resetFilters() {
    _cache = null
    setSearchInput('')
    setSearch('')
    setType(null)
    setTitle(null)
    setUser(null)
    setStartDate('')
    setEndDate('')
    setRefreshing(true)
    setRefreshKey(k => k + 1)
    logApi.fetchLogStats().then(setStats).catch(() => null)
    setTimeout(() => setRefreshing(false), 600)
  }

  const cellContent = (l: logApi.LogItem, id: string) => {
    if (id === 'id') return l.id
    if (id === 'date') return fmtDate(l.date, dateLocale)
    if (id === 'type') return <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{l.typeCode}</code>
    if (id === 'title') return (
      <div className="flex items-start gap-2 min-w-0">
        {l.status
          ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
          : <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />}
        <span className="font-medium break-words">{l.title}</span>
      </div>
    )
    if (id === 'message') return l.message
    if (id === 'user') return <Badge variant="muted" className="font-normal">{l.userName}</Badge>
    if (id === 'itemId') return l.itemId ?? '—'
    return null
  }

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      {/* Header — narrow-only additions never remove/replace a desktop class, so at narrow=false
          every className below renders byte-identical to the original desktop layout. */}
      <div className="flex items-center justify-between gap-4">
        <div className={cn(narrow && 'min-w-0')}>
          <h1 className={cn('text-xl font-bold', narrow && 'truncate')}>{t('logs.title')}</h1>
          <p className={cn('text-sm text-muted-foreground', narrow && 'truncate')}>{t('logs.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showViewToggle && (
            <ViewModeToggle mode={effectiveMode} compact={narrow} onChange={(m) => { setMode(m); if (m === 'iframe') setIframeLoaded(true) }} />
          )}
          <button type="button" onClick={handleRefresh} title={t('common.refresh')}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
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
        <div className="flex flex-wrap gap-3">
          <KpiCard icon={Activity}     label={t('logs.kpi.total')} value={stats?.total ?? null} color="bg-primary/10 text-primary" />
          <KpiCard icon={CalendarDays} label={t('logs.kpi.today')} value={stats?.today ?? null} color="bg-violet-500/10 text-violet-600" />
          <KpiCard icon={Tags}         label={t('logs.kpi.types')} value={stats?.types ?? null} color="bg-emerald-500/10 text-emerald-600" />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={narrow ? 'relative w-full' : 'relative flex-1 min-w-[220px]'}>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              placeholder={t('logs.search')} className="pl-9" />
            {searchInput && <button onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
          </div>

          <select className={cn(selectCls, narrow && 'w-full')} value={type ?? ''} onChange={e => setType(e.target.value ? Number(e.target.value) : null)}>
            <option value="">{t('logs.filter.type_all')}</option>
            {filters?.types.map(ty => <option key={ty.id} value={ty.id}>{ty.code}</option>)}
          </select>

          {filters && filters.titles.length > 0 && (
            <select className={cn(selectCls, narrow ? 'w-full' : 'max-w-[200px]')} value={title ?? ''} onChange={e => setTitle(e.target.value || null)}>
              <option value="">{t('logs.filter.title_all')}</option>
              {filters.titles.map(ti => <option key={ti.key} value={ti.key}>{ti.label}</option>)}
            </select>
          )}

          {filters && filters.users.length > 0 && (
            <select className={cn(selectCls, narrow && 'w-full')} value={user ?? ''} onChange={e => setUser(e.target.value ? Number(e.target.value) : null)}>
              <option value="">{t('logs.filter.user_all')}</option>
              {filters.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}

          <div className={cn('flex items-center gap-2', narrow && 'w-full')}>
            <input type="date" className={cn(selectCls, narrow && 'flex-1')} title={t('logs.filter.from')} value={startDate} onChange={e => setStartDate(e.target.value)} />
            <input type="date" className={cn(selectCls, narrow && 'flex-1')} title={t('logs.filter.to')} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div className={cn('flex items-center gap-2', narrow && 'w-full')}>
            <Button variant="outline" size="sm"
              className={cn('gap-1.5', narrow && 'h-auto min-h-9 flex-[1_1_calc(50%_-_4px)] justify-center whitespace-normal text-center')}
              onClick={resetFilters} title={t('common.reset_filters')}>
              <RotateCcw className={cn('size-3.5', refreshing && 'animate-spin')} />{t('common.reset_filters')}
            </Button>

            <div ref={colMgrRef} className={cn('relative', narrow && 'flex-[1_1_calc(50%_-_4px)]')}>
              <Button variant="outline" size="sm"
                className={cn('gap-1.5', narrow && 'h-auto min-h-9 w-full justify-center whitespace-normal text-center')}
                onClick={() => setShowColMgr(v => !v)}>
                <Columns3 className="size-3.5" />{t('common.columns')}
              </Button>
              {showColMgr && <ColumnManager cols={cols} labelFor={(id) => t(COL_LABEL[id])} anchorRef={colMgrRef}
                onChange={(c) => { setCols(c); saveCols(c) }} onClose={() => setShowColMgr(false)}
                onReset={() => { setCols(DEFAULT_COLS); saveCols(DEFAULT_COLS) }} />}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className={cn('w-full text-sm', !narrow && 'min-w-[720px]')}>
            <thead className="sticky top-0 border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {hasHidden && <th className="w-8 px-2 py-3" />}
                {visibleCols(displayCols).map(({ id }) => {
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
                <tr><td colSpan={visibleCols(displayCols).length + (hasHidden ? 1 : 0)} className="px-4 py-10 text-center text-sm text-muted-foreground">{t('logs.empty')}</td></tr>
              ) : items.map(l => (
                <Fragment key={l.id}>
                <tr className="group transition-colors hover:bg-muted/40">
                  {hasHidden && (
                    <td className="px-2 py-2.5 align-top">
                      <ExpandToggle expanded={expanded.has(l.id)} onClick={() => toggleExpand(l.id)} />
                    </td>
                  )}
                  {visibleCols(displayCols).map(({ id }) => (
                    <td key={id} className={cn('px-4 py-2.5 align-top',
                      (id === 'id' || id === 'itemId') && 'tabular-nums text-muted-foreground',
                      (id === 'date' || id === 'user') && 'whitespace-nowrap',
                      id === 'message' && 'text-muted-foreground max-w-[440px] break-words',
                      id === 'title' && 'max-w-[300px] break-words',
                      id === 'date' && 'text-muted-foreground')}>
                      {cellContent(l, id)}
                    </td>
                  ))}
                </tr>
                {expanded.has(l.id) && (
                  <HiddenColsRow cols={displayCols} labelFor={(id) => t(COL_LABEL[id])} renderValue={(id) => cellContent(l, id)}
                    colSpan={visibleCols(displayCols).length + (hasHidden ? 1 : 0)} />
                )}
                </Fragment>
              ))}
            </tbody>
          </table>

          {/* Scroll infini : sentinel + spinner + pied de compteur (fin de liste). */}
          <div ref={sentinelRef} className="h-1" />
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />{t('common.loading')}
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <div className="py-4 text-center text-xs text-muted-foreground">{t('logs.count', { n: total })}</div>
          )}
        </div>
        </>)}
      </div>
    </div>
  )
}
