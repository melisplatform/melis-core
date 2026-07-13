import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowDown, ArrowUp, ArrowUpDown, Columns3, Languages, Pencil, Plus,
  RotateCcw, Search, Star, Trash2, X, type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as languageApi from '@/lib/language-api'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'
import { ColumnManager, visibleCols, type ColDef } from '@/components/ColumnManager'
import { useCan } from '@/lib/capabilities'

const TOOL_KEY = 'meliscore_tool_language'

// ─── Cache module-level — survit au démontage (la page est montée en permanence) ──
interface ListCache {
  items: languageApi.LanguageItem[]
  total: number
  search: string
  searchInput: string
  stats: languageApi.LanguageStats | null
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
function DeleteConfirm({ language, onConfirm, onCancel }: {
  language: languageApi.LanguageItem; onConfirm: () => void; onCancel: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <h3 className="text-base font-semibold">{t('languages.delete.title')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('languages.delete.confirm', { name: language.name })}</p>
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
const COL_ORDER = ['id', 'locale', 'name'] as const
const COL_LABEL: Record<string, I18nKey> = {
  id: 'languages.col.id', locale: 'languages.col.locale', name: 'languages.col.name',
}
const DEFAULT_COLS: ColDef[] = COL_ORDER.map(id => ({ id, visible: true }))
const COL_KEY = 'melis-language-cols-v1'
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

function getCellSortValue(l: languageApi.LanguageItem, id: string): string | number {
  if (id === 'id')     return l.id
  if (id === 'locale') return l.locale
  if (id === 'name')   return l.name
  return ''
}

// ─── Page ──────────────────────────────────────────────────────────────────────────
export default function LanguageListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { openTab } = useTabs()
  const { t } = useI18n()
  const base = routeForForward('MelisCore/Language') ?? '/languages'

  // Capacités (droits avancés) : masque les composants internes selon les droits de l'user.
  const canList   = useCan(TOOL_KEY, 'list')
  const canCreate = useCan(TOOL_KEY, 'create')
  const canEdit   = useCan(TOOL_KEY, 'edit')
  const canDelete = useCan(TOOL_KEY, 'delete')

  const showViewToggle = toolHasViewToggle('languages')
  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  const [items, setItems]   = useState<languageApi.LanguageItem[]>(_cache?.items ?? [])
  const [total, setTotal]   = useState(_cache?.total ?? 0)
  const [loading, setLoading] = useState(false)
  const [stats, setStats]   = useState<languageApi.LanguageStats | null>(_cache?.stats ?? null)

  const [search, setSearch]           = useState(_cache?.search ?? '')
  const [searchInput, setSearchInput] = useState(_cache?.searchInput ?? '')

  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const [cols, setCols]         = useState<ColDef[]>(loadCols)
  const [showColMgr, setShowColMgr] = useState(false)
  const colMgrRef = useRef<HTMLDivElement>(null)

  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [toDelete, setToDelete] = useState<languageApi.LanguageItem | null>(null)

  const cacheRef = useRef({ items, total, search, searchInput, stats, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { items, total, search, searchInput, stats, mode, iframeLoaded } })
  useEffect(() => () => { _cache = cacheRef.current }, [])

  useEffect(() => {
    if (location.pathname === base) {
      openTab({ id: base, label: t('languages.title'), path: base })
      if (languageApi.consumeLanguagesListStale()) {
        setRefreshKey(k => k + 1)
        languageApi.fetchLanguageStats().then(setStats).catch(() => null)
      }
    }
  }, [location.pathname, openTab, base, t])

  useEffect(() => {
    if (_cache?.stats) return
    languageApi.fetchLanguageStats().then(setStats).catch(() => null)
  }, [])

  useEffect(() => {
    setLoading(true)
    languageApi.fetchLanguages({ limit: 9999, search })
      .then(res => { setItems(res?.items ?? []); setTotal(res?.total ?? 0) })
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
    languageApi.fetchLanguageStats().then(setStats).catch(() => null)
    setTimeout(() => setRefreshing(false), 600)
  }

  // Réinitialise recherche + tri, puis recharge. setItems([]) est obligatoire :
  // sans ça les lignes déjà affichées restent à l'écran et le clic paraît sans effet.
  function resetFilters() {
    _cache = null
    setSearchInput('')
    setSearch('')
    setSortCol(null)
    setSortDir('asc')
    setItems([])
    setRefreshing(true)
    setRefreshKey(k => k + 1)
    languageApi.fetchLanguageStats().then(setStats).catch(() => null)
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
      await languageApi.deleteLanguage(toDelete.id)
      setItems(prev => prev.filter(l => l.id !== toDelete.id))
      setTotal(t => t - 1)
      setToDelete(null)
      setRefreshKey(k => k + 1)
      languageApi.fetchLanguageStats().then(setStats).catch(() => null)
    } catch { setToDelete(null) }
  }

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{t('languages.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('languages.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {showViewToggle && (
            <ViewModeToggle mode={effectiveMode} onChange={(m) => { setMode(m); if (m === 'iframe') setIframeLoaded(true) }} />
          )}
          <button type="button" onClick={handleRefresh} title={t('common.refresh')}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <RotateCcw className={cn('size-3.5', refreshing && 'animate-spin')} />
          </button>
          {canCreate && (
            <Button size="sm" onClick={() => navigate(`${base}/new`)}>
              <Plus className="size-4" />{t('languages.new')}
            </Button>
          )}
        </div>
      </div>

      {/* Vue Melis classique (iframe) */}
      <MelisClassicFrame melisKey="meliscore_tool_language" title="Languages — Vue Melis"
        visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      {/* Vue React */}
      <div className={cn('flex flex-1 flex-col gap-4', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {!canList ? (
          <p className="text-sm text-muted-foreground">{t('languages.no_list')}</p>
        ) : (<>
        {/* KPI */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard icon={Languages} label={t('languages.kpi.total')} value={stats?.total ?? null} color="bg-primary/10 text-primary" />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              placeholder={t('languages.search')} className="pl-9" />
            {searchInput && <button onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={resetFilters} title={t('common.reset_filters')}>
            <RotateCcw className={cn('size-3.5', refreshing && 'animate-spin')} />{t('common.reset_filters')}
          </Button>
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
          <table className="w-full min-w-[420px] text-sm">
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
                <tr><td colSpan={visibleCols(cols).length + 1} className="px-4 py-10 text-center text-sm text-muted-foreground">{t('languages.empty')}</td></tr>
              ) : sortedItems.map(l => (
                <tr key={l.id} className="group transition-colors hover:bg-muted/40">
                  {visibleCols(cols).map(({ id }) => (
                    <td key={id} className={cn('px-4 py-2.5', id === 'id' && 'tabular-nums text-muted-foreground')}>
                      {id === 'id' && l.id}
                      {id === 'locale' && <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{l.locale}</code>}
                      {id === 'name' && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{l.name}</span>
                          {l.isDefault && <Badge variant="default" className="border-amber-200 bg-amber-500/10 text-amber-600"><Star className="mr-1 size-3" />{t('languages.default')}</Badge>}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit && (
                        <button onClick={() => navigate(`${base}/${l.id}`)} title={t('common.edit')}
                          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                          <Pencil className="size-3.5" />
                        </button>
                      )}
                      {canDelete && !l.isDefault && (
                        <button onClick={() => setToDelete(l)} title={t('common.delete')}
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
            {loading ? t('common.loading') : t('languages.count', { n: total })}
          </div>
        </div>
        </>)}
      </div>

      {toDelete && <DeleteConfirm language={toDelete} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />}
    </div>
  )
}
