import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, Database, Loader2, Mail, Pencil, Plus, RotateCcw, Search, Settings, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as emailsApi from '@/lib/emails-api'
import type { EmailListItem, EmailSortKey } from '@/lib/emails-api'
import { useKeysetList } from '@/lib/use-keyset-list'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import { useCan } from '@/lib/capabilities'

const TOOL_KEY = 'meliscore_tool_emails_mngt'

interface ListCache {
  items: EmailListItem[]; total: number; cursor: string | null; hasMore: boolean
  sortCol: string; sortDir: 'asc' | 'desc'
  search: string; mode: ViewMode; iframeLoaded: boolean
}
let _cache: ListCache | null = null

function DeleteConfirm({ email, onConfirm, onCancel }: { email: EmailListItem; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useI18n()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <h3 className="text-base font-semibold">{t('emails.delete.title')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('emails.delete.confirm', { name: email.name })}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>{t('common.cancel')}</Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>{t('common.delete')}</Button>
        </div>
      </div>
    </div>
  )
}

export default function EmailListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { openTab } = useTabs()
  const { t } = useI18n()
  const base = routeForForward('MelisCore/EmailsManagement') ?? '/emails'

  const canList   = useCan(TOOL_KEY, 'list')
  const canCreate = useCan(TOOL_KEY, 'create')
  const canEdit   = useCan(TOOL_KEY, 'edit')
  const canDelete = useCan(TOOL_KEY, 'delete')

  const showViewToggle = toolHasViewToggle('emails')
  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  const [search, setSearch] = useState(_cache?.search ?? '')
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [toDelete, setToDelete] = useState<EmailListItem | null>(null)

  // Scroll infini / tri server-side. La source est courte (config + petite table) → le
  // backend renvoie toujours nextCursor:null (un seul lot) ; le hook n'ajoute donc pas de
  // scroll, mais le tri (sort/dir) est bien pris en compte au (re)chargement côté serveur.
  const {
    items, total, loading, hasMore, sentinelRef, sortCol, sortDir, toggleSort,
    reload, snapshot,
  } = useKeysetList<EmailListItem>({
    fetcher: (a) => emailsApi
      .fetchEmails({ ...a, sort: a.sort as EmailSortKey, search: search.trim() || undefined })
      .then((r) => ({ items: r.items, total: r.total, nextCursor: r.nextCursor })),
    deps: [search, refreshKey],
    limit: 9999,
    defaultSort: 'name',
    defaultDir: 'asc',
    initial: _cache
      ? { items: _cache.items, total: _cache.total, cursor: _cache.cursor, hasMore: _cache.hasMore, sortCol: _cache.sortCol, sortDir: _cache.sortDir }
      : undefined,
    skipInitial: !!(_cache && _cache.items.length),
  })

  const cacheRef = useRef<ListCache>({ items, total, cursor: null, hasMore, sortCol, sortDir, search, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { ...snapshot(), search, mode, iframeLoaded } })
  useEffect(() => () => { _cache = cacheRef.current }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (location.pathname === base) {
      openTab({ id: base, label: t('emails.title'), path: base })
      if (emailsApi.consumeEmailsListStale()) { _cache = null; reload() }
    }
  }, [location.pathname, openTab, base, t]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleRefresh() { _cache = null; setRefreshing(true); reload(); setTimeout(() => setRefreshing(false), 500) }

  // Réinitialise la recherche puis recharge (le changement de `search` relance via deps).
  function resetFilters() {
    _cache = null
    setRefreshing(true)
    if (search) setSearch('')
    else { setRefreshKey((k) => k + 1) }
    setTimeout(() => setRefreshing(false), 500)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await emailsApi.deleteEmail(toDelete.codename)
      setToDelete(null)
      // Recharge la liste complète (comme le zoneReload du legacy) : si l'email
      // supprimé avait une config par défaut derrière lui, sa version « Default »
      // réapparaît automatiquement. Un simple filtre local la ferait disparaître.
      _cache = null
      reload()
    }
    catch { setToDelete(null) }
  }

  // En-tête de colonne triable : flèche selon l'état du hook.
  function SortHeader({ id, label, className }: { id: EmailSortKey; label: string; className?: string }) {
    const active = sortCol === id
    const SIcon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
    return (
      <th className={cn('px-4 py-3 text-left', className)}>
        <button type="button" onClick={() => toggleSort(id)}
          className={cn('inline-flex items-center gap-1 uppercase tracking-wide hover:text-foreground', active && 'text-primary')}>
          {label}
          <SIcon className={cn('size-3', active ? 'opacity-100' : 'opacity-30')} />
        </button>
      </th>
    )
  }

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{t('emails.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('emails.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {showViewToggle && <ViewModeToggle mode={effectiveMode} onChange={(m) => { setMode(m); if (m === 'iframe') setIframeLoaded(true) }} />}
          <button type="button" onClick={handleRefresh} title={t('common.refresh')} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <RotateCcw className={cn('size-3.5', refreshing && 'animate-spin')} />
          </button>
          {canCreate && <Button size="sm" onClick={() => navigate(`${base}/new`)}><Plus className="size-4" />{t('emails.new')}</Button>}
        </div>
      </div>

      <MelisClassicFrame melisKey={TOOL_KEY} title="Emails — Vue Melis" visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      <div className={cn('flex flex-1 flex-col gap-4', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {!canList ? (
          <p className="text-sm text-muted-foreground">{t('emails.no_list')}</p>
        ) : (<>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('emails.search')} className="pl-9" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={resetFilters} title={t('common.reset_filters')}>
                <RotateCcw className={cn('size-3.5', refreshing && 'animate-spin')} />{t('common.reset_filters')}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <SortHeader id="name" label={t('emails.col.name')} />
                  <SortHeader id="codename" label={t('emails.col.code')} />
                  <SortHeader id="fromName" label={t('emails.col.from_name')} />
                  <SortHeader id="fromEmail" label={t('emails.col.from_email')} />
                  <SortHeader id="source" label={t('emails.col.source')} />
                  <th className="w-20 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.length === 0 && !loading ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">{t('emails.empty')}</td></tr>
                ) : items.map((e) => (
                  <tr key={e.codename} className="group transition-colors hover:bg-muted/40">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /><span className="font-medium">{e.name}</span></div></td>
                    <td className="px-4 py-2.5"><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{e.codename}</code></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{e.fromName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{e.fromEmail}</td>
                    <td className="px-4 py-2.5">
                      {e.inDb
                        ? <Badge variant="success" className="gap-1 px-1.5 py-0 text-[10px]"><Database className="size-3" />{t('emails.source.db')}</Badge>
                        : <Badge variant="muted" className="gap-1 px-1.5 py-0 text-[10px]"><Settings className="size-3" />{t('emails.source.config')}</Badge>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && <button onClick={() => navigate(`${base}/${e.codename}`)} title={t('common.edit')} className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil className="size-3.5" /></button>}
                        {canDelete && e.inDb && <button onClick={() => setToDelete(e)} title={t('common.delete')} className="inline-flex size-7 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"><Trash2 className="size-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Sentinel scroll infini : inerte ici (nextCursor toujours null), gardé par cohérence. */}
            <div ref={sentinelRef} className="h-1" />
            <div className="px-4 py-3 text-center text-xs text-muted-foreground">
              {loading
                ? <span className="inline-flex items-center gap-1.5"><Loader2 className="size-3.5 animate-spin" />{t('common.loading')}</span>
                : (!hasMore && items.length > 0 ? t('emails.count', { n: total }) : null)}
            </div>
          </div>
        </>)}
      </div>

      {toDelete && <DeleteConfirm email={toDelete} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />}
    </div>
  )
}
