import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  AlertTriangle, Cookie, Download, Loader2, Search, ShieldCheck, Trash2, Trash, UserSearch,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { cn } from '@/lib/utils'
import * as gdprApi from '@/lib/gdpr-api'
import { useTabs } from '@/components/tabs/tab-store'
import { AutoDeletePanel } from '@/components/gdpr/AutoDeletePanel'
import { BannerPanel } from '@/components/gdpr/BannerPanel'

const GDPR_TOOL_KEY = 'melis_core_gdpr'

type GdprTab = 'search' | 'autodelete' | 'banner'

// ─── Module-level cache ─────────────────────────────────────────────────────────

interface ListCache {
  userName: string
  userEmail: string
  groups: gdprApi.GdprGroup[] | null
  totalRecords: number
  mode: ViewMode
  iframeLoaded: boolean
}
let _cache: ListCache | null = null

// ─── Delete confirm ─────────────────────────────────────────────────────────────

function DeleteConfirm({ count, busy, onConfirm, onCancel }: {
  count: number; busy: boolean; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="size-5" />
          <h3 className="text-base font-semibold">Supprimer les données</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Supprimer définitivement <span className="font-medium text-foreground">{count}</span> enregistrement{count > 1 ? 's' : ''}
          {' '}sélectionné{count > 1 ? 's' : ''} ? Cette action est <span className="font-medium text-foreground">irréversible</span> (droit à l&apos;oubli RGPD).
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={busy}>Annuler</Button>
          <Button
            variant="outline" size="sm" onClick={onConfirm} disabled={busy}
            className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : 'Supprimer définitivement'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function GdprPage() {
  const location = useLocation()
  const { openTab } = useTabs()

  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)

  const [tab, setTab] = useState<GdprTab>('search')

  const [userName, setUserName]   = useState(_cache?.userName ?? '')
  const [userEmail, setUserEmail] = useState(_cache?.userEmail ?? '')

  const [groups, setGroups]       = useState<gdprApi.GdprGroup[] | null>(_cache?.groups ?? null)
  const [totalRecords, setTotal]  = useState(_cache?.totalRecords ?? 0)
  const [searching, setSearching] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // Sélection : module → Set d'ids (string)
  const [selected, setSelected] = useState<Record<string, Set<string>>>({})
  const [extracting, setExtracting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Tab registration
  useEffect(() => {
    if (location.pathname === '/gdpr') {
      openTab({ id: '/gdpr', label: 'RGPD', path: '/gdpr' })
    }
  }, [location.pathname, openTab])

  // Cache sync
  const cacheRef = useRef({ userName, userEmail, groups, totalRecords, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { userName, userEmail, groups, totalRecords, mode, iframeLoaded } })
  useEffect(() => () => { _cache = cacheRef.current }, [])

  const selectedCount = useMemo(
    () => Object.values(selected).reduce((n, set) => n + set.size, 0),
    [selected],
  )

  function toApiSelection(): gdprApi.GdprSelection {
    const out: gdprApi.GdprSelection = {}
    for (const [module, set] of Object.entries(selected)) {
      if (set.size) out[module] = [...set].map(Number)
    }
    return out
  }

  async function handleSearch() {
    if (!userName.trim() && !userEmail.trim()) {
      setError('Renseignez un nom ou un email pour lancer la recherche.')
      return
    }
    setSearching(true)
    setError(null)
    setSelected({})
    try {
      const res = await gdprApi.searchGdpr({ userName: userName.trim(), userEmail: userEmail.trim() })
      setGroups(res.groups)
      setTotal(res.totalRecords)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la recherche')
      setGroups(null)
    } finally {
      setSearching(false)
    }
  }

  function toggleRow(module: string, id: string) {
    setSelected(prev => {
      const next = { ...prev }
      const set = new Set(next[module] ?? [])
      if (set.has(id)) set.delete(id); else set.add(id)
      next[module] = set
      return next
    })
  }

  function toggleGroup(group: gdprApi.GdprGroup) {
    setSelected(prev => {
      const next = { ...prev }
      const current = next[group.module] ?? new Set<string>()
      const allSelected = group.rows.length > 0 && group.rows.every(r => current.has(r.id))
      next[group.module] = allSelected ? new Set() : new Set(group.rows.map(r => r.id))
      return next
    })
  }

  async function handleExtract() {
    if (selectedCount === 0) return
    setExtracting(true)
    setError(null)
    try {
      await gdprApi.extractGdpr(toApiSelection())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'extraction")
    } finally {
      setExtracting(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await gdprApi.deleteGdpr(toApiSelection())
      setConfirmDelete(false)
      // Recharge les résultats pour refléter les suppressions
      await handleSearch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  function moduleLabel(module: string): string {
    return module.replace(/^Melis/, '').replace(/([A-Z])/g, ' $1').trim()
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">RGPD</h1>
          <p className="text-sm text-muted-foreground">Recherche, extraction et suppression des données personnelles</p>
        </div>
        <ViewModeToggle
          mode={mode}
          onChange={(m) => { setMode(m); if (m === 'iframe') setIframeLoaded(true) }}
        />
      </div>

      {/* Vue Melis classique (toggle Old) */}
      <MelisClassicFrame
        melisKey={GDPR_TOOL_KEY}
        title="RGPD — Vue Melis"
        visible={mode === 'iframe'}
        loaded={iframeLoaded}
      />

      {/* Vue React */}
      <div className={cn('flex flex-1 flex-col gap-4', mode === 'react' ? 'flex' : 'hidden')}>
        {/* Onglets */}
        <div className="flex items-center gap-1 border-b border-border">
          {([
            { id: 'search',     label: 'Recherche & données', icon: UserSearch },
            { id: 'autodelete', label: 'Anonymisation', icon: Trash },
            { id: 'banner',     label: 'Bannière', icon: Cookie },
          ] as const).map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors -mb-px',
                tab === t.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <t.icon className="size-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Onglet "Anonymisation" (suppression automatique) — full React */}
        <div className={cn('min-h-0 flex-1', tab === 'autodelete' ? 'block' : 'hidden')}>
          <AutoDeletePanel active={tab === 'autodelete'} />
        </div>

        {/* Onglet "Bannière" — full React */}
        <div className={cn('min-h-0 flex-1', tab === 'banner' ? 'block' : 'hidden')}>
          <BannerPanel active={tab === 'banner'} />
        </div>

        {/* Onglet "Recherche & données" */}
        <div className={cn('flex min-h-0 flex-1 flex-col gap-4', tab === 'search' ? 'flex' : 'hidden')}>
        {/* Search form */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Nom</Label>
              <Input
                value={userName}
                onChange={e => setUserName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Nom de la personne"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Email</Label>
              <Input
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="email@exemple.com"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" onClick={handleSearch} disabled={searching} className="gap-1.5">
              {searching ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
              {searching ? 'Recherche…' : 'Rechercher'}
            </Button>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        </div>

        {/* Action bar (sélection) */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
            <span className="text-sm font-medium">
              {selectedCount} enregistrement{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleExtract} disabled={extracting} className="gap-1.5">
                {extracting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                Extraire (XML)
              </Button>
              <Button
                size="sm" variant="outline" onClick={() => setConfirmDelete(true)}
                className="gap-1.5 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="size-3.5" />
                Supprimer
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex flex-1 flex-col gap-4">
          {searching ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : groups === null ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-sm text-muted-foreground">
              <UserSearch className="size-8 opacity-40" />
              Lancez une recherche par nom ou email pour afficher les données associées.
            </div>
          ) : totalRecords === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-sm text-muted-foreground">
              <ShieldCheck className="size-8 opacity-40" />
              Aucune donnée trouvée pour cette personne.
            </div>
          ) : (
            groups.map(group => {
              const sel = selected[group.module] ?? new Set<string>()
              const allChecked = group.rows.length > 0 && group.rows.every(r => sel.has(r.id))
              return (
                <div key={group.module} className="rounded-xl border border-border bg-card" style={{ overflow: 'clip' }}>
                  <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                    <span className="text-sm font-semibold">{moduleLabel(group.module)}</span>
                    <Badge>{group.rows.length}</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="w-10 px-4 py-2.5">
                            <input
                              type="checkbox"
                              checked={allChecked}
                              onChange={() => toggleGroup(group)}
                              className="size-4 cursor-pointer accent-primary"
                            />
                          </th>
                          {group.columns.map(col => (
                            <th key={col.key} className="px-4 py-2.5 text-left font-medium">{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map(row => (
                          <tr
                            key={row.id}
                            className="cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30"
                            onClick={() => toggleRow(group.module, row.id)}
                          >
                            <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={sel.has(row.id)}
                                onChange={() => toggleRow(group.module, row.id)}
                                className="size-4 cursor-pointer accent-primary"
                              />
                            </td>
                            {group.columns.map(col => (
                              <td key={col.key} className="px-4 py-2.5 text-muted-foreground">
                                {String(row.cells[col.key] ?? '—')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })
          )}
        </div>
        </div>
      </div>

      {confirmDelete && (
        <DeleteConfirm
          count={selectedCount}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setConfirmDelete(false)}
        />
      )}
    </div>
  )
}

// ─── Badge local (compteur) ──────────────────────────────────────────────────────

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
      {children}
    </span>
  )
}
