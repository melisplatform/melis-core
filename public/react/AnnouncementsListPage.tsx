import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowDown, ArrowUp, ArrowUpDown, Edit2, Loader2, Megaphone, Plus,
  Search, ToggleLeft, ToggleRight, Trash2, X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { cn } from '@/lib/utils'
import * as annApi from '@/lib/announcement-api'
import { useTabs } from '@/components/tabs/tab-store'

const ANN_TOOL_KEY = 'melis_core_announcement_tool'

// ─── Module-level cache ─────────────────────────────────────────────────────────

interface ListCache {
  items: annApi.AnnouncementItem[]
  total: number
  search: string
  searchInput: string
  statusFilter: '' | '0' | '1'
  stats: annApi.AnnouncementStats | null
  mode: ViewMode
  iframeLoaded: boolean
}
let _cache: ListCache | null = null

// ─── Sort helper ────────────────────────────────────────────────────────────────

type SortCol = 'id' | 'title' | 'author' | 'status' | 'date'

function getSortValue(a: annApi.AnnouncementItem, col: SortCol): string | number {
  switch (col) {
    case 'id':     return a.id
    case 'title':  return a.title
    case 'author': return a.author || ''
    case 'status': return a.status
    case 'date':   return a.date || ''
  }
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, color }: {
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

// ─── DeleteConfirm ──────────────────────────────────────────────────────────────

function DeleteConfirm({ item, busy, onConfirm, onCancel }: {
  item: annApi.AnnouncementItem
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <h3 className="text-base font-semibold">Supprimer l&apos;annonce</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Supprimer <span className="font-medium text-foreground">{item.title}</span> ? Cette action est irréversible.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={busy}>Annuler</Button>
          <Button
            variant="outline" size="sm" onClick={onConfirm} disabled={busy}
            className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : 'Supprimer'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AnnouncementsListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { openTab } = useTabs()

  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)

  const [items, setItems]   = useState<annApi.AnnouncementItem[]>(_cache?.items ?? [])
  const [total, setTotal]   = useState(_cache?.total ?? 0)
  const [loading, setLoading] = useState(false)
  const [stats, setStats]   = useState<annApi.AnnouncementStats | null>(_cache?.stats ?? null)

  const [search, setSearch]             = useState(_cache?.search ?? '')
  const [searchInput, setSearchInput]   = useState(_cache?.searchInput ?? '')
  const [statusFilter, setStatusFilter] = useState<'' | '0' | '1'>(_cache?.statusFilter ?? '')

  const [sortCol, setSortCol] = useState<SortCol>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const [toDelete, setToDelete] = useState<annApi.AnnouncementItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Tab registration
  useEffect(() => {
    if (location.pathname === '/announcements') {
      openTab({ id: '/announcements', label: 'Annonces', path: '/announcements' })
    }
  }, [location.pathname, openTab])

  // Cache sync
  const cacheRef = useRef({ items, total, search, searchInput, statusFilter, stats, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { items, total, search, searchInput, statusFilter, stats, mode, iframeLoaded } })
  useEffect(() => () => { _cache = cacheRef.current }, [])

  function loadStats() {
    annApi.fetchAnnouncementStats().then(setStats).catch(() => null)
  }
  function loadList() {
    setLoading(true)
    annApi
      .fetchAnnouncements({ page: 1, limit: 9999, search, status: statusFilter })
      .then(res => { setItems(res.items); setTotal(res.total) })
      .catch(() => null)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadList() }, [search, statusFilter])
  useEffect(() => { if (!_cache?.stats) loadStats() }, [])

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir(col === 'date' ? 'desc' : 'asc') }
  }

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const va = getSortValue(a, sortCol)
      const vb = getSortValue(b, sortCol)
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'fr', { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, sortCol, sortDir])

  function applySearch() { setSearch(searchInput.trim()) }
  function clearSearch() { setSearchInput(''); setSearch('') }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await annApi.deleteAnnouncement(toDelete.id)
      setItems(prev => prev.filter(a => a.id !== toDelete.id))
      setTotal(t => t - 1)
      loadStats()
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

  function plainText(html: string): string {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return (tmp.textContent || tmp.innerText || '').trim()
  }

  const COLUMNS: { id: SortCol; label: string }[] = [
    { id: 'id',     label: 'ID' },
    { id: 'title',  label: 'Titre' },
    { id: 'author', label: 'Auteur' },
    { id: 'status', label: 'Statut' },
    { id: 'date',   label: 'Date' },
  ]

  function SortIcon({ col }: { col: SortCol }) {
    if (sortCol !== col) return <ArrowUpDown className="size-3 opacity-0 transition-opacity group-hover/th:opacity-40" />
    return sortDir === 'asc'
      ? <ArrowUp className="size-3 text-primary" />
      : <ArrowDown className="size-3 text-primary" />
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Annonces</h1>
          <p className="text-sm text-muted-foreground">Messages affichés sur le tableau de bord</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle
            mode={mode}
            onChange={(m) => { setMode(m); if (m === 'iframe') setIframeLoaded(true) }}
          />
          <Button size="sm" onClick={() => navigate('/announcements/new')}>
            <Plus className="size-4" />
            Nouvelle annonce
          </Button>
        </div>
      </div>

      {/* Vue Melis classique (toggle Old) */}
      <MelisClassicFrame
        melisKey={ANN_TOOL_KEY}
        title="Annonces — Vue Melis"
        visible={mode === 'iframe'}
        loaded={iframeLoaded}
      />

      {/* Vue React */}
      <div className={cn('flex flex-1 flex-col gap-4', mode === 'react' ? 'flex' : 'hidden')}>
        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard icon={Megaphone}   label="Total"    value={stats?.total    ?? null} color="bg-primary/10 text-primary" />
          <KpiCard icon={ToggleRight} label="Actives"  value={stats?.active   ?? null} color="bg-emerald-500/10 text-emerald-600" />
          <KpiCard icon={ToggleLeft}  label="Inactives" value={stats?.inactive ?? null} color="bg-amber-500/10 text-amber-600" />
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-9 pr-8 text-sm"
              placeholder="Rechercher titre, texte…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
            />
            {searchInput && (
              <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex h-9 items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
            {([
              { value: '',  label: 'Toutes',   dot: null              },
              { value: '1', label: 'Active',   dot: 'bg-emerald-500' },
              { value: '0', label: 'Inactive', dot: 'bg-red-500'     },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={cn(
                  'flex h-full items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors',
                  statusFilter === opt.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {opt.dot && <span className={cn('size-1.5 shrink-0 rounded-full', opt.dot)} />}
                {opt.label}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs tabular-nums text-muted-foreground">
            {loading && items.length === 0 ? '…' : `${total} annonce${total !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card" style={{ overflow: 'clip' }}>
          <div className="overflow-x-auto">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-20 text-center text-sm text-muted-foreground">Aucune annonce trouvée</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {COLUMNS.map(col => (
                      <th
                        key={col.id}
                        onClick={() => handleSort(col.id)}
                        className="group/th cursor-pointer select-none px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          <SortIcon col={col.id} />
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map(item => (
                    <tr
                      key={item.id}
                      className="group cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30"
                      onClick={() => navigate(`/announcements/${item.id}`)}
                    >
                      <td className="px-4 py-2.5">
                        <span className="text-xs tabular-nums text-muted-foreground">{item.id}</span>
                      </td>
                      <td className="max-w-[420px] px-4 py-2.5">
                        <span className="block truncate font-medium">{item.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{plainText(item.text)}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="truncate text-muted-foreground">{item.author || '—'}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        {item.status === 1
                          ? <Badge variant="default" className="border-emerald-200 bg-emerald-500/10 text-emerald-600">Active</Badge>
                          : <Badge variant="default" className="border-amber-200 bg-amber-500/10 text-amber-600">Inactive</Badge>}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">{fmtDate(item.date)}</span>
                      </td>
                      <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/announcements/${item.id}`)}
                            className="rounded p-1.5 transition-colors hover:bg-accent"
                            title="Modifier"
                          >
                            <Edit2 className="size-3.5 text-muted-foreground" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setToDelete(item)}
                            className="rounded p-1.5 transition-colors hover:bg-destructive/10"
                            title="Supprimer"
                          >
                            <Trash2 className="size-3.5 text-destructive/70" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {toDelete && (
        <DeleteConfirm
          item={toDelete}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => !deleting && setToDelete(null)}
        />
      )}
    </div>
  )
}
