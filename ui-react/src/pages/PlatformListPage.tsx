import { Fragment, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Columns3, Database, Loader2, Pencil, Plus,
  RotateCcw, Search, Server, ShoppingBag, Trash2, X, type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as platformApi from '@/lib/platform-api'
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

const TOOL_KEY = 'meliscore_tool_platform'

// ─── Cache module-level — survit au démontage (la page est montée en permanence) ──
interface ListCache {
  items: platformApi.PlatformItem[]
  total: number
  cursor: string | null
  hasMore: boolean
  sortCol: string
  sortDir: 'asc' | 'desc'
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

// ─── Page ──────────────────────────────────────────────────────────────────────────
export default function PlatformListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { openTab } = useTabs()
  const { t } = useI18n()
  const narrow = useIsNarrow()
  const base = routeForForward('MelisCore/Platforms') ?? '/platforms'

  const showViewToggle = toolHasViewToggle('platforms')
  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  // Capacités (droits avancés) : masque les composants internes selon les droits de l'user.
  const canList   = useCan(TOOL_KEY, 'list')
  const canCreate = useCan(TOOL_KEY, 'create')
  const canEdit   = useCan(TOOL_KEY, 'edit')
  const canDelete = useCan(TOOL_KEY, 'delete')

  const [stats, setStats]   = useState<platformApi.PlatformStats | null>(_cache?.stats ?? null)

  const [search, setSearch]           = useState(_cache?.search ?? '')
  const [searchInput, setSearchInput] = useState(_cache?.searchInput ?? '')

  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const [cols, setCols]         = useState<ColDef[]>(loadCols)
  const [showColMgr, setShowColMgr] = useState(false)
  const colMgrRef = useRef<HTMLDivElement>(null)
  // Mobile-only: force the table down to just "name" regardless of the desktop ColumnManager
  // preference, with the rest reachable via a per-row "+" — desktop behavior (cols as-is, no "+"
  // column at all) is untouched since hasHidden/displayCols only diverge from `cols` when narrow.
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const toggleExpand = (id: number) => setExpanded((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n
  })
  const displayCols = narrow ? cols.map(c => ({ ...c, visible: c.id === 'name' })) : cols
  const hasHidden = narrow

  const [toDelete, setToDelete] = useState<platformApi.PlatformItem | null>(null)

  // Scroll infini + tri server-side + keyset (mutualisé). L'ordre par défaut legacy est
  // `ORDER BY plf_id ASC` → defaultSort:'id', defaultDir:'asc'.
  const {
    items, setItems, total, loading, hasMore, sentinelRef,
    sortCol, sortDir, toggleSort, reload, removeLocal, snapshot,
  } = useKeysetList<platformApi.PlatformItem>({
    fetcher: (a) => platformApi.fetchPlatforms({
      ...a, sort: a.sort as platformApi.PlatformSortKey, search,
    }),
    deps: [search, refreshKey],
    defaultSort: 'id',
    defaultDir: 'asc',
    initial: _cache
      ? { items: _cache.items, total: _cache.total, cursor: _cache.cursor, hasMore: _cache.hasMore, sortCol: _cache.sortCol, sortDir: _cache.sortDir }
      : undefined,
    skipInitial: !!(_cache && _cache.items.length),
  })

  const cacheRef = useRef<ListCache>({ ...snapshot(), search, searchInput, stats, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { ...snapshot(), search, searchInput, stats, mode, iframeLoaded } })
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
    if (!showColMgr) return
    const h = (e: MouseEvent) => { if (colMgrRef.current && !colMgrRef.current.contains(e.target as Node)) setShowColMgr(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showColMgr])

  function applySearch() { setSearch(searchInput.trim()); setItems([]) }
  function clearSearch() { setSearchInput(''); setSearch(''); setItems([]) }

  function handleRefresh() {
    _cache = null
    setItems([])
    setRefreshing(true)
    setRefreshKey(k => k + 1)
    platformApi.fetchPlatformStats().then(setStats).catch(() => null)
    setTimeout(() => setRefreshing(false), 600)
  }

  // Réinitialise recherche + tri, puis recharge. setItems([]) est obligatoire :
  // sans ça les lignes déjà affichées restent à l'écran et le clic paraît sans effet.
  function resetFilters() {
    _cache = null
    setSearchInput('')
    setSearch('')
    setItems([])
    setRefreshing(true)
    setRefreshKey(k => k + 1)
    platformApi.fetchPlatformStats().then(setStats).catch(() => null)
    setTimeout(() => setRefreshing(false), 600)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await platformApi.deletePlatform(toDelete.id)
      removeLocal(p => p.id === toDelete.id)
      setToDelete(null)
      reload()
      platformApi.fetchPlatformStats().then(setStats).catch(() => null)
    } catch { setToDelete(null) }
  }

  const yesNo = (v: boolean) => v
    ? <Badge variant="default" className="border-emerald-200 bg-emerald-500/10 text-emerald-600">{t('common.yes')}</Badge>
    : <span className="text-muted-foreground">—</span>

  const cellContent = (p: platformApi.PlatformItem, id: string) => {
    if (id === 'id') return p.id
    if (id === 'name') return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{p.name}</span>
        {p.isCurrent && <Badge variant="default" className="border-amber-200 bg-amber-500/10 text-amber-600"><CheckCircle2 className="mr-1 size-3" />{t('platforms.current')}</Badge>}
      </div>
    )
    if (id === 'marketplace') return yesNo(p.marketplace)
    if (id === 'cache') return yesNo(p.cache)
    return null
  }

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      {/* Header — narrow-only additions never remove/replace a desktop class, so at narrow=false
          every className below renders byte-identical to the original desktop layout. */}
      <div className="flex items-center justify-between gap-4">
        <div className={cn(narrow && 'min-w-0')}>
          <h1 className={cn('text-xl font-bold', narrow && 'truncate')}>{t('platforms.title')}</h1>
          <p className={cn('text-sm text-muted-foreground', narrow && 'truncate')}>{t('platforms.subtitle')}</p>
        </div>
        <div className={cn('flex items-center gap-2', narrow && 'shrink-0 flex-col')}>
          <div className="flex items-center gap-2">
            {showViewToggle && (
              <ViewModeToggle mode={effectiveMode} compact={narrow} onChange={(m) => { setMode(m); if (m === 'iframe') setIframeLoaded(true) }} />
            )}
            <button type="button" onClick={handleRefresh} title={t('common.refresh')}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <RotateCcw className={cn('size-3.5', refreshing && 'animate-spin')} />
            </button>
          </div>
          {canCreate && (
            <Button size="sm" className={cn(narrow && 'w-full')} onClick={() => navigate(`${base}/new`)}>
              <Plus className="size-4" />{t('platforms.new')}
            </Button>
          )}
        </div>
      </div>

      {/* Vue Melis classique (iframe) */}
      <MelisClassicFrame melisKey="meliscore_tool_platform" title="Platforms — Vue Melis"
        visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      {/* Vue React */}
      <div className={cn('flex flex-1 flex-col gap-4', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {!canList ? (
          <p className="text-sm text-muted-foreground">{t('platforms.no_list')}</p>
        ) : (<>
        {/* KPI */}
        <div className="flex flex-wrap gap-3">
          <KpiCard icon={Server}      label={t('platforms.kpi.total')}       value={stats?.total       ?? null} color="bg-primary/10 text-primary" />
          <KpiCard icon={ShoppingBag} label={t('platforms.kpi.marketplace')} value={stats?.marketplace ?? null} color="bg-violet-500/10 text-violet-600" />
          <KpiCard icon={Database}    label={t('platforms.kpi.cache')}       value={stats?.cache       ?? null} color="bg-emerald-500/10 text-emerald-600" />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={narrow ? 'relative w-full' : 'relative flex-1 min-w-[220px]'}>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              placeholder={t('platforms.search')} className="pl-9" />
            {searchInput && <button onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
          </div>
          <div className={cn('flex items-center gap-2', narrow && 'w-full flex-wrap')}>
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
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
          <table className={cn('w-full text-sm', !narrow && 'min-w-[520px]')}>
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
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 && !loading ? (
                <tr><td colSpan={visibleCols(displayCols).length + 1 + (hasHidden ? 1 : 0)} className="px-4 py-10 text-center text-sm text-muted-foreground">{t('platforms.empty')}</td></tr>
              ) : items.map(p => (
                <Fragment key={p.id}>
                <tr className="group transition-colors hover:bg-muted/40">
                  {hasHidden && (
                    <td className="px-2 py-2.5">
                      <ExpandToggle expanded={expanded.has(p.id)} onClick={() => toggleExpand(p.id)} />
                    </td>
                  )}
                  {visibleCols(displayCols).map(({ id }) => (
                    <td key={id} className={cn('px-4 py-2.5', id === 'id' && 'tabular-nums text-muted-foreground')}>
                      {cellContent(p, id)}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit && (
                        <button onClick={() => navigate(`${base}/${p.id}`)} title={t('common.edit')}
                          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                          <Pencil className="size-3.5" />
                        </button>
                      )}
                      {canDelete && !p.isCurrent && (
                        <button onClick={() => setToDelete(p)} title={t('common.delete')}
                          className="inline-flex size-7 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expanded.has(p.id) && (
                  <HiddenColsRow cols={displayCols} labelFor={(id) => t(COL_LABEL[id])} renderValue={(id) => cellContent(p, id)}
                    colSpan={visibleCols(displayCols).length + 1 + (hasHidden ? 1 : 0)} />
                )}
                </Fragment>
              ))}
            </tbody>
          </table>

          <div ref={sentinelRef} className="h-1" />
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />{t('common.loading')}
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <div className="py-4 text-center text-xs text-muted-foreground">{t('platforms.count', { n: total })}</div>
          )}
        </div>
        </>)}
      </div>

      {toDelete && <DeleteConfirm platform={toDelete} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />}
    </div>
  )
}
