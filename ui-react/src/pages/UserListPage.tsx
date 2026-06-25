import { useEffect, useMemo, useRef, useState } from 'react'

// ─── Module-level cache — survit au démontage du composant (navigation) ────────

interface ListCache {
  items: userApi.UserItem[]
  total: number
  page: number
  search: string
  searchInput: string
  statusFilter: '' | '0' | '1'
  roleFilter: number | undefined
  stats: userApi.UserStats | null
  roles: userApi.UserRole[]
  mode: ViewMode
  iframeLoaded: boolean
}
let _cache: ListCache | null = null
import { useLocation, useNavigate } from 'react-router-dom'
import { routeForForward } from '@/lib/tool-routes'
import {
  ArrowDown, ArrowUp, ArrowUpDown, Columns3, Edit2, FileDown, FileText, GripVertical,
  Loader2, Pin, Plus, RotateCcw, Search, Shield, Trash2,
  Users, UserCheck, UserX, X, type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as userApi from '@/lib/user-api'
import * as XLSX from 'xlsx'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { useModuleActive } from '@/lib/bricks'
import { useI18n } from '@/i18n/i18n-context'
import type { I18nKey } from '@/i18n/dictionaries'

// ─── KPI card ─────────────────────────────────────────────────────────────────

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

// ─── Delete confirmation ───────────────────────────────────────────────────────

function DeleteConfirm({ user, onConfirm, onCancel }: {
  user: userApi.UserItem; onConfirm: () => void; onCancel: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <h3 className="text-base font-semibold">{t('users.delete.title')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('users.delete.confirm', { name: `${user.firstname} ${user.lastname}`.trim(), login: user.login })}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>{t('common.cancel')}</Button>
          <Button variant="outline" size="sm" onClick={onConfirm} className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">{t('common.delete')}</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Column manager ───────────────────────────────────────────────────────────

interface ColDef { id: string; visible: boolean; pinned?: boolean }
const COL_ORDER = ['id', 'login', 'name', 'email', 'role', 'admin', 'status', 'lastLogin'] as const
const COL_LABEL: Record<string, I18nKey> = {
  id: 'users.col.id', login: 'users.col.login', name: 'users.col.name', email: 'users.col.email',
  role: 'users.col.role', admin: 'users.col.admin', status: 'users.col.status', lastLogin: 'users.col.lastlogin',
}
const DEFAULT_COLS: ColDef[] = COL_ORDER.map(id => ({ id, visible: true, pinned: false }))
const COL_KEY = 'melis-user-cols-v2'
function loadUserCols(): ColDef[] {
  try {
    const raw = localStorage.getItem(COL_KEY)
    if (!raw) return DEFAULT_COLS
    const saved: ColDef[] = JSON.parse(raw)
    const ordered = saved.map(s => { const d = DEFAULT_COLS.find(c => c.id === s.id); return d ? { id: d.id, visible: s.visible, pinned: s.pinned ?? false } : null }).filter(Boolean) as ColDef[]
    const missing = DEFAULT_COLS.filter(d => !saved.find(s => s.id === d.id))
    return [...ordered, ...missing]
  } catch { return DEFAULT_COLS }
}
function saveUserCols(cols: ColDef[]) {
  localStorage.setItem(COL_KEY, JSON.stringify(cols.map(c => ({ id: c.id, visible: c.visible, pinned: c.pinned ?? false }))))
}

/** Valeur brute pour le TRI (insensible à la langue). */
function getCellSort(user: userApi.UserItem, id: string): string | number {
  if (id === 'id')        return user.id
  if (id === 'login')     return user.login
  if (id === 'name')      return `${user.firstname} ${user.lastname}`.trim()
  if (id === 'email')     return user.email
  if (id === 'role')      return user.roleName || ''
  if (id === 'admin')     return user.isAdmin ? 1 : 0
  if (id === 'status')    return user.status
  if (id === 'lastLogin') return user.lastLoginDate || ''
  return ''
}
/** Texte affichable pour l'EXPORT (traduit). */
function getCellExport(user: userApi.UserItem, id: string, t: (k: I18nKey, v?: Record<string, string | number>) => string): string | number {
  if (id === 'admin')  return user.isAdmin ? t('common.yes') : t('common.no')
  if (id === 'status') return user.status === 1 ? t('users.status.active') : t('users.status.inactive')
  return getCellSort(user, id)
}

function ColManager({ cols, onChange, onClose }: {
  cols: ColDef[]; onChange: (cols: ColDef[]) => void; onClose: () => void
}) {
  const { t } = useI18n()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overTarget, setOverTarget] = useState<{ id: string; panel: 'visible' | 'hidden' } | null>(null)

  const visibleCols = cols.filter(c => c.visible)
  const hiddenCols  = cols.filter(c => !c.visible)

  function handleDrop(panel: 'visible' | 'hidden') {
    if (!draggingId) return
    const srcItem = cols.find(c => c.id === draggingId)!
    const updatedItem = { ...srcItem, visible: panel === 'visible' }
    let vList = visibleCols.filter(c => c.id !== draggingId)
    let hList = hiddenCols.filter(c => c.id !== draggingId)
    if (panel === 'visible') {
      const dstId = overTarget?.id
      if (!dstId || dstId === '__panel__') { vList = [...vList, updatedItem] }
      else { const idx = vList.findIndex(c => c.id === dstId); vList = idx === -1 ? [...vList, updatedItem] : [...vList.slice(0, idx), updatedItem, ...vList.slice(idx)] }
    } else { hList = [...hList, updatedItem] }
    const next = [...vList, ...hList]
    onChange(next); saveUserCols(next)
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
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); if (overTarget?.id !== col.id || overTarget?.panel !== panel) setOverTarget({ id: col.id, panel }) }}
        className={cn(
          'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm select-none cursor-grab active:cursor-grabbing transition-colors',
          draggingId === col.id && 'opacity-40',
          isOver ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-accent',
          col.pinned && panel === 'visible' && !isOver && 'bg-primary/5',
        )}
      >
        <GripVertical className="size-3.5 shrink-0 text-muted-foreground/40" />
        <span className="flex-1 truncate">{t(COL_LABEL[col.id])}</span>
        {panel === 'visible' && (
          <button
            onClick={e => { e.stopPropagation(); const next = cols.map(c => c.id === col.id ? { ...c, pinned: !c.pinned } : c); onChange(next); saveUserCols(next) }}
            title={col.pinned ? t('users.cols.unpin') : t('users.cols.pin')}
            className={cn('flex size-5 shrink-0 items-center justify-center rounded transition-colors hover:bg-primary/10', col.pinned ? 'text-primary' : 'text-muted-foreground/30 hover:text-muted-foreground')}
          >
            <Pin className={cn('size-3', col.pinned && 'fill-primary')} />
          </button>
        )}
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
          className="flex flex-col gap-0.5 min-h-[140px] rounded-lg border border-dashed border-border p-1.5"
          onDragOver={e => { e.preventDefault(); if (overTarget?.id !== '__panel__' || overTarget?.panel !== 'hidden') setOverTarget({ id: '__panel__', panel: 'hidden' }) }}
          onDrop={e => { e.preventDefault(); handleDrop('hidden') }}
        >
          <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('users.cols.hidden')}</p>
          {hiddenCols.length === 0
            ? <div className="flex flex-1 items-center justify-center py-4 text-[11px] text-muted-foreground/40">{t('common.drag_here')}</div>
            : hiddenCols.map(col => renderItem(col, 'hidden'))}
        </div>
        <div
          className="flex flex-col gap-0.5 min-h-[140px] rounded-lg border border-dashed border-border p-1.5"
          onDragOver={e => { e.preventDefault(); if (overTarget?.id !== '__panel__' || overTarget?.panel !== 'visible') setOverTarget({ id: '__panel__', panel: 'visible' }) }}
          onDrop={e => { e.preventDefault(); handleDrop('visible') }}
        >
          <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('users.cols.visible')}</p>
          {visibleCols.map(col => renderItem(col, 'visible'))}
        </div>
      </div>
      <div className="border-t border-border p-1.5">
        <button onClick={() => { onChange(DEFAULT_COLS); saveUserCols(DEFAULT_COLS) }} className="w-full rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">{t('common.reset')}</button>
      </div>
    </div>
  )
}

function ExcelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="22" height="22" rx="3" fill="#217346" />
      <line x1="7.5" y1="7.5" x2="16.5" y2="16.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="16.5" y1="7.5" x2="7.5" y2="16.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Export modal ─────────────────────────────────────────────────────────────

function ExportModal({ cols, search, status, total, onClose }: {
  cols: ColDef[]; search: string; status: '' | '0' | '1'; total: number; onClose: () => void
}) {
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

  function renderExItem(col: ColDef, panel: 'included' | 'excluded') {
    const isOver = overTarget?.id === col.id && overTarget?.panel === panel
    return (
      <div
        key={col.id}
        draggable
        onDragStart={() => setDraggingId(col.id)}
        onDragEnd={() => { setDraggingId(null); setOverTarget(null) }}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); if (overTarget?.id !== col.id || overTarget?.panel !== panel) setOverTarget({ id: col.id, panel }) }}
        className={cn(
          'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm select-none cursor-grab active:cursor-grabbing transition-colors',
          draggingId === col.id && 'opacity-40',
          isOver ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-accent',
        )}
      >
        <GripVertical className="size-3.5 shrink-0 text-muted-foreground/40" />
        <span className="flex-1 truncate">{t(COL_LABEL[col.id])}</span>
      </div>
    )
  }

  async function doExport() {
    if (included.length === 0) return
    setExporting(true)
    try {
      const all: userApi.UserItem[] = []
      let p = 1
      while (true) {
        const res = await userApi.fetchUsers({ page: p, limit: 100, search, status, roleId: undefined })
        all.push(...res.items)
        if (all.length >= res.total) break
        p++
      }
      const header = included.map(c => t(COL_LABEL[c.id]))
      const rows = all.map(u => included.map(c => getCellExport(u, c.id, t)))
      const dateStr = new Date().toISOString().slice(0, 10)
      const fileBase = t('users.export.filename')
      if (format === 'xlsx') {
        const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, t('users.title'))
        XLSX.writeFile(wb, `${fileBase}-${dateStr}.xlsx`)
      } else {
        const csv = [header, ...rows]
          .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
          .join('\n')
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
        const url  = URL.createObjectURL(blob)
        const a    = Object.assign(document.createElement('a'), { href: url, download: `${fileBase}-${dateStr}.csv` })
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      onClose()
    } catch (e) {
      alert(e instanceof Error ? e.message : t('users.export.error'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-[480px] rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">{t('users.export.title')}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{t('users.export.subtitle', { n: total })}</p>
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
              <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('users.export.excluded')}</p>
              {excluded.length === 0
                ? <div className="flex flex-1 items-center justify-center py-2 text-[11px] text-muted-foreground/40">{t('common.drag_here')}</div>
                : excluded.map(col => renderExItem(col, 'excluded'))}
            </div>
            <div
              className="flex flex-col gap-0.5 min-h-[100px] rounded-lg border border-dashed border-border p-1.5"
              onDragOver={e => { e.preventDefault(); if (overTarget?.id !== '__panel__' || overTarget?.panel !== 'included') setOverTarget({ id: '__panel__', panel: 'included' }) }}
              onDrop={e => { e.preventDefault(); handleDrop('included') }}
            >
              <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('users.export.included')}</p>
              {included.length === 0
                ? <div className="flex flex-1 items-center justify-center py-2 text-[11px] text-muted-foreground/40">{t('common.drag_here')}</div>
                : included.map(col => renderExItem(col, 'included'))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={exporting}>{t('common.cancel')}</Button>
          <Button size="sm" onClick={doExport} disabled={exporting || included.length === 0} className="gap-1.5">
            {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
            {exporting ? t('users.export.exporting') : t('users.export.download', { fmt: format.toUpperCase() })}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { openTab } = useTabs()
  const { t } = useI18n()
  const base = routeForForward('MelisCore/ToolUser') ?? '/users'

  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)
  const showViewToggle = toolHasViewToggle('users')
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'
  const rolesModuleActive = useModuleActive('MelisSmallBusiness')

  const [items, setItems]     = useState<userApi.UserItem[]>(_cache?.items ?? [])
  const [total, setTotal]     = useState(_cache?.total ?? 0)
  const [page, setPage]       = useState(_cache?.page ?? 1)
  const [loading, setLoading] = useState(false)
  const [stats, setStats]     = useState<userApi.UserStats | null>(_cache?.stats ?? null)
  const [roles, setRoles]     = useState<userApi.UserRole[]>(_cache?.roles ?? [])

  const [search, setSearch]           = useState(_cache?.search ?? '')
  const [searchInput, setSearchInput] = useState(_cache?.searchInput ?? '')
  const [statusFilter, setStatusFilter] = useState<'' | '0' | '1'>(_cache?.statusFilter ?? '')
  const [roleFilter, setRoleFilter]   = useState<number | undefined>(_cache?.roleFilter)

  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    _cache = null
    setStats(null)
    setItems([])
    setPage(1)
    setRefreshing(true)
    setRefreshKey(k => k + 1)
    userApi.fetchUserStats().then(setStats).catch(() => null)
    setTimeout(() => setRefreshing(false), 600)
  }

  const [toDelete, setToDelete] = useState<userApi.UserItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [rawCols, setCols]          = useState<ColDef[]>(loadUserCols)
  // La colonne « Rôle » est apportée par MelisSmallBusiness : retirée quand le module est off.
  const cols = rolesModuleActive ? rawCols : rawCols.filter(c => c.id !== 'role')
  const [showColMgr, setShowColMgr] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const colMgrRef = useRef<HTMLDivElement>(null)

  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function toggleSort(id: string) {
    if (sortCol === id) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(id); setSortDir('asc') }
  }

  const sortedItems = useMemo(() => {
    if (!sortCol) return items
    return [...items].sort((a, b) => {
      const va = getCellSort(a, sortCol)
      const vb = getCellSort(b, sortCol)
      const na = typeof va === 'number' ? va : parseFloat(String(va))
      const nb = typeof vb === 'number' ? vb : parseFloat(String(vb))
      const cmp = !isNaN(na) && !isNaN(nb) ? na - nb : String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, sortCol, sortDir])

  const LIMIT = 25
  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasMore = items.length < total

  useEffect(() => {
    if (location.pathname === base) {
      openTab({ id: base, label: t('users.title'), path: base })
      if (userApi.consumeUsersListStale()) {
        setPage(1)
        setRefreshKey(k => k + 1)
        userApi.fetchUserStats().then(setStats).catch(() => null)
      }
    }
  }, [location.pathname, openTab, base, t])

  const cacheRef = useRef({ items, total, page, search, searchInput, statusFilter, roleFilter, stats, roles, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { items, total, page, search, searchInput, statusFilter, roleFilter, stats, roles, mode, iframeLoaded } })
  useEffect(() => () => { _cache = cacheRef.current }, [])

  useEffect(() => {
    if (_cache?.stats) return
    userApi.fetchUserStats().then(setStats).catch(() => null)
  }, [])
  useEffect(() => {
    if (!rolesModuleActive) return
    if (_cache?.roles?.length) return
    userApi.fetchRoles().then(setRoles).catch(() => null)
  }, [rolesModuleActive])

  useEffect(() => {
    setLoading(true)
    userApi
      .fetchUsers({ page, limit: LIMIT, search, status: statusFilter, roleId: roleFilter })
      .then((res) => {
        setItems((prev) => (page === 1 ? res.items : [...prev, ...res.items]))
        setTotal(res.total)
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [page, search, statusFilter, roleFilter, refreshKey])

  function applySearch() { setSearch(searchInput.trim()); setPage(1); setItems([]) }
  function clearSearch() { setSearchInput(''); setSearch(''); setPage(1); setItems([]) }

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !loading) setPage((p) => p + 1) },
      { rootMargin: '120px' },
    )
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [hasMore, loading])

  function handleDelete(user: userApi.UserItem) { setToDelete(user) }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await userApi.deleteUser(toDelete.id)
      setItems((prev) => prev.filter((u) => u.id !== toDelete.id))
      setTotal((tt) => tt - 1)
      setToDelete(null)
      setPage(1)
      setRefreshKey((k) => k + 1)
      userApi.fetchUserStats().then(setStats).catch(() => null)
    } catch {
      /* silent */
    } finally {
      setDeleting(false)
    }
  }

  function fmtDate(d: string | null) {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return d }
  }

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{t('users.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('users.subtitle')}</p>
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
            <Plus className="size-4" />{t('users.new')}
          </Button>
        </div>
      </div>

      <MelisClassicFrame melisKey="meliscore_tool_user" title="User Management — Vue Melis"
        visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      <div className={cn('flex flex-1 flex-col gap-4', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard icon={Users}     label={t('users.kpi.total')}    value={stats?.total      ?? null} color="bg-primary/10 text-primary" />
          <KpiCard icon={UserCheck} label={t('users.kpi.active')}   value={stats?.active     ?? null} color="bg-emerald-500/10 text-emerald-600" />
          <KpiCard icon={UserX}     label={t('users.kpi.inactive')} value={stats?.inactive   ?? null} color="bg-red-500/10 text-red-600" />
          <KpiCard icon={Shield}    label={t('users.kpi.admins')}   value={stats?.adminCount ?? null} color="bg-violet-500/10 text-violet-600" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 pr-8 h-9 text-sm" placeholder={t('users.search')}
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()} />
            {searchInput && (
              <button type="button" onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 gap-1">
            {([
              { val: '' as const,  label: t('users.filter.all'),     dot: null },
              { val: '1' as const, label: t('users.filter.active'),  dot: 'bg-emerald-500' },
              { val: '0' as const, label: t('users.filter.inactive'),dot: 'bg-red-500' },
            ]).map(({ val, label, dot }) => (
              <button key={val} type="button"
                onClick={() => { setStatusFilter(val); setPage(1); setItems([]) }}
                className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  statusFilter === val ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                {dot && <span className={cn('size-1.5 rounded-full', dot)} />}
                {label}
              </button>
            ))}
          </div>

          {rolesModuleActive && roles.length > 0 && (
            <select value={roleFilter ?? ''}
              onChange={(e) => { setRoleFilter(e.target.value ? parseInt(e.target.value) : undefined); setPage(1); setItems([]) }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">{t('users.filter.all_roles')}</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}

          <div className="ml-auto flex items-center gap-2">
            <div ref={colMgrRef} className="relative">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowColMgr(v => !v)}>
                <Columns3 className="size-3.5" />{t('common.columns')}
              </Button>
              {showColMgr && <ColManager cols={cols} onChange={setCols} onClose={() => setShowColMgr(false)} />}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowExport(true)}>
              <FileDown className="size-3.5" />{t('users.export')}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="sticky top-0 border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {COL_ORDER.map(id => {
                  const col = cols.find(c => c.id === id)
                  if (!col?.visible) return null
                  const isSorted = sortCol === id
                  const SIcon = isSorted ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
                  const centered = id === 'admin' || id === 'status'
                  return (
                    <th key={id} className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap', id === 'id' && 'w-12', id === 'admin' && 'w-20', id === 'status' && 'w-24', id === 'lastLogin' && 'w-32')}>
                      <button type="button" onClick={() => toggleSort(id)}
                        className={cn('flex items-center gap-1 transition-colors hover:text-foreground', centered && 'mx-auto', isSorted && 'text-primary')}>
                        {t(COL_LABEL[id])}
                        <SIcon className={cn('size-3', isSorted ? 'opacity-100' : 'opacity-30')} />
                        {col.pinned && <Pin className="size-3 fill-primary text-primary opacity-60" />}
                      </button>
                    </th>
                  )
                })}
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 && !loading ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">{t('users.empty')}</td></tr>
              ) : (
                sortedItems.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-muted/40">
                    {cols.find(c => c.id === 'id')?.visible && <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{user.id}</td>}
                    {cols.find(c => c.id === 'login')?.visible && <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {user.isOnline && <span className="size-2 shrink-0 rounded-full bg-emerald-500" title={t('users.online')} />}
                        <span className="font-medium">{user.login}</span>
                      </div>
                    </td>}
                    {cols.find(c => c.id === 'name')?.visible && <td className="px-4 py-2.5 text-muted-foreground">{user.firstname} {user.lastname}</td>}
                    {cols.find(c => c.id === 'email')?.visible && <td className="px-4 py-2.5 text-muted-foreground">{user.email}</td>}
                    {cols.find(c => c.id === 'role')?.visible && <td className="px-4 py-2.5 text-muted-foreground">{user.roleName || '—'}</td>}
                    {cols.find(c => c.id === 'admin')?.visible && <td className="px-4 py-2.5 text-center">
                      {user.isAdmin ? <Badge variant="default" className="text-violet-600 bg-violet-500/10 border-violet-200">{t('users.col.admin')}</Badge> : '—'}
                    </td>}
                    {cols.find(c => c.id === 'status')?.visible && <td className="px-4 py-2.5 text-center">
                      {user.status === 1
                        ? <Badge variant="default" className="text-emerald-600 bg-emerald-500/10 border-emerald-200">{t('users.status.active')}</Badge>
                        : <Badge variant="default" className="text-red-600 bg-red-500/10 border-red-200">{t('users.status.inactive')}</Badge>}
                    </td>}
                    {cols.find(c => c.id === 'lastLogin')?.visible && <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums">{fmtDate(user.lastLoginDate)}</td>}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => navigate(`${base}/${user.id}`)} title={t('common.edit')}
                          className="rounded p-1.5 hover:bg-accent transition-colors">
                          <Edit2 className="size-3.5 text-muted-foreground" />
                        </button>
                        <button type="button" onClick={() => handleDelete(user)} title={t('common.delete')}
                          className="rounded p-1.5 hover:bg-destructive/10 transition-colors">
                          <Trash2 className="size-3.5 text-destructive/70" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div ref={sentinelRef} className="h-1" />
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />{t('common.loading')}
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <div className="py-4 text-center text-xs text-muted-foreground">{t('users.count', { n: total })}</div>
          )}
        </div>
      </div>

      {toDelete && <DeleteConfirm user={toDelete} onConfirm={confirmDelete} onCancel={() => !deleting && setToDelete(null)} />}
      {showExport && <ExportModal cols={cols} search={search} status={statusFilter} total={total} onClose={() => setShowExport(false)} />}
    </div>
  )
}
