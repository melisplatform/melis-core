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
import {
  ArrowDown, ArrowUp, ArrowUpDown, Columns3, Edit2, FileDown, FileText, GripVertical,
  Loader2, Pin, Plus, RotateCcw, Search, Shield, Trash2,
  Users, UserCheck, UserX, X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as userApi from '@/lib/user-api'
import * as XLSX from 'xlsx'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number | null
  color: string
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

function DeleteConfirm({
  user,
  onConfirm,
  onCancel,
}: {
  user: userApi.UserItem
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <h3 className="text-base font-semibold">Supprimer l&apos;utilisateur</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Supprimer <span className="font-medium text-foreground">{user.firstname} {user.lastname}</span>{' '}
          (<code className="rounded bg-muted px-1 text-xs">{user.login}</code>) ?
          Cette action est irréversible.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Annuler</Button>
          <Button variant="outline" size="sm" onClick={onConfirm} className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">Supprimer</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Column manager ───────────────────────────────────────────────────────────

interface ColDef { id: string; label: string; visible: boolean; pinned?: boolean }
const DEFAULT_COLS: ColDef[] = [
  { id: 'id',        label: 'ID',        visible: true,  pinned: false },
  { id: 'login',     label: 'Login',     visible: true,  pinned: false },
  { id: 'name',      label: 'Nom',       visible: true,  pinned: false },
  { id: 'email',     label: 'Email',     visible: true,  pinned: false },
  { id: 'role',      label: 'Rôle',      visible: true,  pinned: false },
  { id: 'admin',     label: 'Admin',     visible: true,  pinned: false },
  { id: 'status',    label: 'Statut',    visible: true,  pinned: false },
  { id: 'lastLogin', label: 'Connexion', visible: true,  pinned: false },
]
const COL_KEY = 'melis-user-cols-v2'
function loadUserCols(): ColDef[] {
  try {
    const raw = localStorage.getItem(COL_KEY)
    if (!raw) return DEFAULT_COLS
    const saved: { id: string; visible: boolean; pinned?: boolean }[] = JSON.parse(raw)
    const ordered = saved.map(s => { const d = DEFAULT_COLS.find(c => c.id === s.id); return d ? { ...d, visible: s.visible, pinned: s.pinned ?? false } : null }).filter(Boolean) as ColDef[]
    const missing = DEFAULT_COLS.filter(d => !saved.find(s => s.id === d.id))
    return [...ordered, ...missing]
  } catch { return DEFAULT_COLS }
}
function saveUserCols(cols: ColDef[]) {
  localStorage.setItem(COL_KEY, JSON.stringify(cols.map(c => ({ id: c.id, visible: c.visible, pinned: c.pinned ?? false }))))
}

function getCellText(user: userApi.UserItem, id: string): string | number {
  if (id === 'id')        return user.id
  if (id === 'login')     return user.login
  if (id === 'name')      return `${user.firstname} ${user.lastname}`.trim()
  if (id === 'email')     return user.email
  if (id === 'role')      return user.roleName || ''
  if (id === 'admin')     return user.isAdmin ? 'Oui' : 'Non'
  if (id === 'status')    return user.status === 1 ? 'Actif' : 'Inactif'
  if (id === 'lastLogin') return user.lastLoginDate || ''
  return ''
}

function ColManager({ cols, onChange, onClose }: {
  cols: ColDef[]
  onChange: (cols: ColDef[]) => void
  onClose: () => void
}) {
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
        <span className="flex-1 truncate">{col.label}</span>
        {panel === 'visible' && (
          <button
            onClick={e => { e.stopPropagation(); const next = cols.map(c => c.id === col.id ? { ...c, pinned: !c.pinned } : c); onChange(next); saveUserCols(next) }}
            title={col.pinned ? 'Désépingler' : 'Épingler'}
            className={cn('flex size-5 shrink-0 items-center justify-center rounded transition-colors hover:bg-primary/10', col.pinned ? 'text-primary' : 'text-muted-foreground/30 hover:text-muted-foreground')}
          >
            <Pin className={cn('size-3', col.pinned && 'fill-primary')} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-1.5 w-[420px] rounded-xl border border-border bg-card shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <span className="text-sm font-semibold">Colonnes</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="size-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        <div
          className="flex flex-col gap-0.5 min-h-[140px] rounded-lg border border-dashed border-border p-1.5"
          onDragOver={e => { e.preventDefault(); if (overTarget?.id !== '__panel__' || overTarget?.panel !== 'hidden') setOverTarget({ id: '__panel__', panel: 'hidden' }) }}
          onDrop={e => { e.preventDefault(); handleDrop('hidden') }}
        >
          <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Masquées</p>
          {hiddenCols.length === 0
            ? <div className="flex flex-1 items-center justify-center py-4 text-[11px] text-muted-foreground/40">Glisser ici</div>
            : hiddenCols.map(col => renderItem(col, 'hidden'))}
        </div>
        <div
          className="flex flex-col gap-0.5 min-h-[140px] rounded-lg border border-dashed border-border p-1.5"
          onDragOver={e => { e.preventDefault(); if (overTarget?.id !== '__panel__' || overTarget?.panel !== 'visible') setOverTarget({ id: '__panel__', panel: 'visible' }) }}
          onDrop={e => { e.preventDefault(); handleDrop('visible') }}
        >
          <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Visibles</p>
          {visibleCols.map(col => renderItem(col, 'visible'))}
        </div>
      </div>
      <div className="border-t border-border p-1.5">
        <button onClick={() => { onChange(DEFAULT_COLS); saveUserCols(DEFAULT_COLS) }} className="w-full rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">Réinitialiser</button>
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
  cols: ColDef[]
  search: string
  status: '' | '0' | '1'
  total: number
  onClose: () => void
}) {
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
        <span className="flex-1 truncate">{col.label}</span>
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
      const rows = all.map(u => included.map(c => getCellText(u, c.id)))
      const dateStr = new Date().toISOString().slice(0, 10)
      if (format === 'xlsx') {
        const ws = XLSX.utils.aoa_to_sheet([included.map(c => c.label), ...rows])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs')
        XLSX.writeFile(wb, `utilisateurs-${dateStr}.xlsx`)
      } else {
        const csv = [included.map(c => c.label), ...rows]
          .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
          .join('\n')
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
        const url  = URL.createObjectURL(blob)
        const a    = Object.assign(document.createElement('a'), { href: url, download: `utilisateurs-${dateStr}.csv` })
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      onClose()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur lors de l'export")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-[480px] rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Exporter les données</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{total.toLocaleString('fr-FR')} utilisateur{total !== 1 ? 's' : ''} avec les filtres actifs</p>
          </div>
          <button onClick={onClose} className="ml-4 text-muted-foreground hover:text-foreground transition-colors"><X className="size-4" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 gap-1">
            <button
              onClick={() => setFormat('xlsx')}
              className={cn('flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors', format === 'xlsx' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              <ExcelIcon className="size-4" /> Excel (.xlsx)
            </button>
            <button
              onClick={() => setFormat('csv')}
              className={cn('flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors', format === 'csv' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              <FileText className="size-4" /> CSV (.csv)
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div
              className="flex flex-col gap-0.5 min-h-[100px] rounded-lg border border-dashed border-border p-1.5"
              onDragOver={e => { e.preventDefault(); if (overTarget?.id !== '__panel__' || overTarget?.panel !== 'excluded') setOverTarget({ id: '__panel__', panel: 'excluded' }) }}
              onDrop={e => { e.preventDefault(); handleDrop('excluded') }}
            >
              <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Exclues</p>
              {excluded.length === 0
                ? <div className="flex flex-1 items-center justify-center py-2 text-[11px] text-muted-foreground/40">Glisser ici</div>
                : excluded.map(col => renderExItem(col, 'excluded'))}
            </div>
            <div
              className="flex flex-col gap-0.5 min-h-[100px] rounded-lg border border-dashed border-border p-1.5"
              onDragOver={e => { e.preventDefault(); if (overTarget?.id !== '__panel__' || overTarget?.panel !== 'included') setOverTarget({ id: '__panel__', panel: 'included' }) }}
              onDrop={e => { e.preventDefault(); handleDrop('included') }}
            >
              <p className="px-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Incluses</p>
              {included.length === 0
                ? <div className="flex flex-1 items-center justify-center py-2 text-[11px] text-muted-foreground/40">Glisser ici</div>
                : included.map(col => renderExItem(col, 'included'))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={exporting}>Annuler</Button>
          <Button size="sm" onClick={doExport} disabled={exporting || included.length === 0} className="gap-1.5">
            {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
            {exporting ? 'Export…' : `Télécharger ${format.toUpperCase()}`}
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

  // ── View mode toggle ────────────────────────────────────────────────────────
  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)

  // ── Data state ──────────────────────────────────────────────────────────────
  const [items, setItems]     = useState<userApi.UserItem[]>(_cache?.items ?? [])
  const [total, setTotal]     = useState(_cache?.total ?? 0)
  const [page, setPage]       = useState(_cache?.page ?? 1)
  const [loading, setLoading] = useState(false)
  const [stats, setStats]     = useState<userApi.UserStats | null>(_cache?.stats ?? null)
  const [roles, setRoles]     = useState<userApi.UserRole[]>(_cache?.roles ?? [])

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [search, setSearch]           = useState(_cache?.search ?? '')
  const [searchInput, setSearchInput] = useState(_cache?.searchInput ?? '')
  const [statusFilter, setStatusFilter] = useState<'' | '0' | '1'>(_cache?.statusFilter ?? '')
  const [roleFilter, setRoleFilter]   = useState<number | undefined>(_cache?.roleFilter)

  // ── Refresh ───────────────────────────────────────────────────────────────
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

  // ── Delete confirm ──────────────────────────────────────────────────────────
  const [toDelete, setToDelete] = useState<userApi.UserItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Columns + export ────────────────────────────────────────────────────────
  const [cols, setCols]             = useState<ColDef[]>(loadUserCols)
  const [showColMgr, setShowColMgr] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const colMgrRef = useRef<HTMLDivElement>(null)

  // ── Tri ─────────────────────────────────────────────────────────────────────
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function toggleSort(id: string) {
    if (sortCol === id) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(id); setSortDir('asc') }
  }

  const sortedItems = useMemo(() => {
    if (!sortCol) return items
    return [...items].sort((a, b) => {
      const va = getCellText(a, sortCol)
      const vb = getCellText(b, sortCol)
      const na = typeof va === 'number' ? va : parseFloat(String(va))
      const nb = typeof vb === 'number' ? vb : parseFloat(String(vb))
      const cmp = !isNaN(na) && !isNaN(nb)
        ? na - nb
        : String(va).localeCompare(String(vb), 'fr', { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, sortCol, sortDir])

  const LIMIT = 25
  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasMore = items.length < total

  // Sauvegarde le state dans le cache au démontage (navigation vers /users/:id)
  // Enregistre l'onglet quand la page est active (pattern commun à DashboardPage, NewsListPage…)
  useEffect(() => {
    if (location.pathname === '/users') {
      openTab({ id: '/users', label: 'Utilisateurs', path: '/users' })
    }
  }, [location.pathname, openTab])

  // UserListPage est toujours montée (Shell) — le cache n'est utile qu'au tout premier chargement
  const cacheRef = useRef({ items, total, page, search, searchInput, statusFilter, roleFilter, stats, roles, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { items, total, page, search, searchInput, statusFilter, roleFilter, stats, roles, mode, iframeLoaded } })
  useEffect(() => () => { _cache = cacheRef.current }, [])

  // Load stats + roles seulement si pas en cache
  useEffect(() => {
    if (_cache?.stats) return
    userApi.fetchUserStats().then(setStats).catch(() => null)
  }, [])
  useEffect(() => {
    if (_cache?.roles?.length) return
    userApi.fetchRoles().then(setRoles).catch(() => null)
  }, [])

  // Reload list on filter / page change
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

  // Reset to page 1 when filters change
  function applySearch() {
    setSearch(searchInput.trim())
    setPage(1)
    setItems([])
  }

  function clearSearch() {
    setSearchInput('')
    setSearch('')
    setPage(1)
    setItems([])
  }

  // Infinite scroll sentinel
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !loading) setPage((p) => p + 1) },
      { rootMargin: '120px' },
    )
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [hasMore, loading])

  function handleDelete(user: userApi.UserItem) {
    setToDelete(user)
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await userApi.deleteUser(toDelete.id)
      setItems((prev) => prev.filter((u) => u.id !== toDelete.id))
      setTotal((t) => t - 1)
      if (stats) setStats({ ...stats, total: stats.total - 1, active: toDelete.status === 1 ? stats.active - 1 : stats.active, inactive: toDelete.status === 0 ? stats.inactive - 1 : stats.inactive })
      setToDelete(null)
    } catch {
      /* silent */
    } finally {
      setDeleting(false)
    }
  }

  function fmtDate(d: string | null) {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return d }
  }

  return (
    <div className={cn('flex flex-col gap-6 p-6', mode === 'iframe' ? 'h-full' : 'flex-1')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">Gestion des comptes back-office Melis</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle
            mode={mode}
            onChange={(m) => {
              setMode(m)
              if (m === 'iframe') setIframeLoaded(true)
            }}
          />

          <button
            type="button"
            onClick={handleRefresh}
            title="Rafraîchir"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <RotateCcw className={cn('size-3.5', refreshing && 'animate-spin')} />
          </button>
          <Button size="sm" onClick={() => navigate('/users/new')}>
            <Plus className="size-4" />
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      {/* Vue Melis classique — gardée montée pour ne pas recharger au retoggle */}
      <MelisClassicFrame
        melisKey="meliscore_tool_user"
        title="User Management — Vue Melis"
        visible={mode === 'iframe'}
        loaded={iframeLoaded}
      />

      {/* React native view */}
      <div className={cn('flex flex-1 flex-col gap-4', mode === 'react' ? 'flex' : 'hidden')}>
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard icon={Users}     label="Total"      value={stats?.total      ?? null} color="bg-primary/10 text-primary" />
          <KpiCard icon={UserCheck} label="Actifs"     value={stats?.active     ?? null} color="bg-emerald-500/10 text-emerald-600" />
          <KpiCard icon={UserX}     label="Inactifs"   value={stats?.inactive   ?? null} color="bg-red-500/10 text-red-600" />
          <KpiCard icon={Shield}    label="Admins"     value={stats?.adminCount ?? null} color="bg-violet-500/10 text-violet-600" />
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 pr-8 h-9 text-sm"
              placeholder="Rechercher login, nom, email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 gap-1">
            {([
              { val: '' as const,  label: 'Tous',    dot: null },
              { val: '1' as const, label: 'Actif',   dot: 'bg-emerald-500' },
              { val: '0' as const, label: 'Inactif', dot: 'bg-red-500' },
            ]).map(({ val, label, dot }) => (
              <button
                key={val}
                type="button"
                onClick={() => { setStatusFilter(val); setPage(1); setItems([]) }}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  statusFilter === val
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {dot && <span className={cn('size-1.5 rounded-full', dot)} />}
                {label}
              </button>
            ))}
          </div>

          {roles.length > 0 && (
            <select
              value={roleFilter ?? ''}
              onChange={(e) => { setRoleFilter(e.target.value ? parseInt(e.target.value) : undefined); setPage(1); setItems([]) }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Tous les rôles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}

          <div className="ml-auto flex items-center gap-2">
            <div ref={colMgrRef} className="relative">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowColMgr(v => !v)}>
                <Columns3 className="size-3.5" />Colonnes
              </Button>
              {showColMgr && <ColManager cols={cols} onChange={setCols} onClose={() => setShowColMgr(false)} />}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowExport(true)}>
              <FileDown className="size-3.5" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="sticky top-0 border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {(['id','login','name','email','role','admin','status','lastLogin'] as const).map(id => {
                  const col = cols.find(c => c.id === id)
                  if (!col?.visible) return null
                  const isSorted = sortCol === id
                  const SIcon = isSorted ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
                  const centered = id === 'admin' || id === 'status'
                  return (
                    <th key={id} className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap', id === 'id' && 'w-12', id === 'admin' && 'w-20', id === 'status' && 'w-24', id === 'lastLogin' && 'w-32')}>
                      <button
                        type="button"
                        onClick={() => toggleSort(id)}
                        className={cn('flex items-center gap-1 transition-colors hover:text-foreground', centered && 'mx-auto', isSorted && 'text-primary')}
                      >
                        {col.label}
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
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                sortedItems.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition-colors hover:bg-muted/40"
                  >
                    {cols.find(c => c.id === 'id')?.visible && <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{user.id}</td>}
                    {cols.find(c => c.id === 'login')?.visible && <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {user.isOnline && (
                          <span className="size-2 shrink-0 rounded-full bg-emerald-500" title="En ligne" />
                        )}
                        <span className="font-medium">{user.login}</span>
                      </div>
                    </td>}
                    {cols.find(c => c.id === 'name')?.visible && <td className="px-4 py-2.5 text-muted-foreground">
                      {user.firstname} {user.lastname}
                    </td>}
                    {cols.find(c => c.id === 'email')?.visible && <td className="px-4 py-2.5 text-muted-foreground">{user.email}</td>}
                    {cols.find(c => c.id === 'role')?.visible && <td className="px-4 py-2.5 text-muted-foreground">{user.roleName || '—'}</td>}
                    {cols.find(c => c.id === 'admin')?.visible && <td className="px-4 py-2.5 text-center">
                      {user.isAdmin ? (
                        <Badge variant="default" className="text-violet-600 bg-violet-500/10 border-violet-200">Admin</Badge>
                      ) : '—'}
                    </td>}
                    {cols.find(c => c.id === 'status')?.visible && <td className="px-4 py-2.5 text-center">
                      {user.status === 1 ? (
                        <Badge variant="default" className="text-emerald-600 bg-emerald-500/10 border-emerald-200">Actif</Badge>
                      ) : (
                        <Badge variant="default" className="text-red-600 bg-red-500/10 border-red-200">Inactif</Badge>
                      )}
                    </td>}
                    {cols.find(c => c.id === 'lastLogin')?.visible && <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums">
                      {fmtDate(user.lastLoginDate)}
                    </td>}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="rounded p-1.5 hover:bg-accent transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="size-3.5 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="rounded p-1.5 hover:bg-destructive/10 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="size-3.5 text-destructive/70" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Chargement…
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <div className="py-4 text-center text-xs text-muted-foreground">
              {total.toLocaleString('fr-FR')} utilisateur{total > 1 ? 's' : ''} — fin de la liste
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {toDelete && (
        <DeleteConfirm
          user={toDelete}
          onConfirm={confirmDelete}
          onCancel={() => !deleting && setToDelete(null)}
        />
      )}

      {/* Export modal */}
      {showExport && (
        <ExportModal
          cols={cols}
          search={search}
          status={statusFilter}
          total={total}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
