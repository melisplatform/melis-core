import { useMemo, useState } from 'react'
import { AlertTriangle, Database, Download, Search, ShieldCheck, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as gdprApi from '@/lib/gdpr-api'
import type { GdprModuleResult } from '@/lib/gdpr-api'
import { useI18n } from '@/i18n/i18n-context'
import { useCan } from '@/lib/capabilities'
import { GDPR_TOOL_KEY, gdprNotify } from './gdpr-shared'

interface DataCache { results: GdprModuleResult[] | null; name: string; email: string }
let _cache: DataCache = { results: null, name: '', email: '' }

export default function GdprDataTab() {
  const { t } = useI18n()
  const canList   = useCan(GDPR_TOOL_KEY, 'list')
  const canExport = useCan(GDPR_TOOL_KEY, 'export')
  const canDelete = useCan(GDPR_TOOL_KEY, 'delete')

  const [name, setName] = useState(_cache.name)
  const [email, setEmail] = useState(_cache.email)
  const [results, setResults] = useState<GdprModuleResult[] | null>(_cache.results)
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selected, setSelected] = useState<Record<string, Set<string>>>({})

  // Persiste (page montée en permanence → état conservé).
  function persist(r: GdprModuleResult[] | null, n = name, e = email) { _cache = { results: r, name: n, email: e } }

  const selectedCount = useMemo(() => Object.values(selected).reduce((n, s) => n + s.size, 0), [selected])
  const totalRows = useMemo(() => (results ?? []).reduce((n, m) => n + m.count, 0), [results])

  function buildSelection(): gdprApi.GdprSelection {
    const out: gdprApi.GdprSelection = {}
    for (const [m, set] of Object.entries(selected)) if (set.size > 0) out[m] = [...set]
    return out
  }

  async function doSearch() {
    const search: gdprApi.GdprSearch = {}
    if (name.trim()) search.user_name = name.trim()
    if (email.trim()) search.user_email = email.trim()
    if (!search.user_name && !search.user_email) { gdprNotify('ko', t('gdpr.title'), t('gdpr.search.required')); return }
    setLoading(true); setSelected({})
    try {
      const mods = await gdprApi.searchGdpr(search)
      setResults(mods); persist(mods)
    } catch (e) { gdprNotify('ko', t('gdpr.title'), String((e as Error)?.message ?? e)); setResults([]); persist([]) }
    finally { setLoading(false) }
  }

  function toggleRow(modKey: string, id: string) {
    setSelected((prev) => { const set = new Set(prev[modKey] ?? []); set.has(id) ? set.delete(id) : set.add(id); return { ...prev, [modKey]: set } })
  }
  function toggleAll(modKey: string, ids: string[], checked: boolean) {
    setSelected((prev) => ({ ...prev, [modKey]: checked ? new Set(ids) : new Set() }))
  }

  async function doExtract() {
    const sel = buildSelection()
    if (!Object.keys(sel).length) { gdprNotify('ko', t('gdpr.title'), t('gdpr.no_selection')); return }
    setExtracting(true)
    try {
      const { xml, filename, empty } = await gdprApi.extractGdpr(sel)
      if (empty || !xml) { gdprNotify('ko', t('gdpr.title'), t('gdpr.extract.empty')); return }
      const url = URL.createObjectURL(new Blob([xml], { type: 'text/xml;charset=utf-8' }))
      const a = document.createElement('a'); a.href = url; a.download = filename || 'melisplatformgdpr.xml'
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
      gdprNotify('ok', t('gdpr.title'), t('gdpr.extract.ok'))
    } catch (e) { gdprNotify('ko', t('gdpr.title'), String((e as Error)?.message ?? e)) }
    finally { setExtracting(false) }
  }

  async function doDelete() {
    setShowDeleteConfirm(false)
    const sel = buildSelection()
    if (!Object.keys(sel).length) { gdprNotify('ko', t('gdpr.title'), t('gdpr.no_selection')); return }
    setDeleting(true)
    try {
      const { allDeleted } = await gdprApi.deleteGdpr(sel)
      gdprNotify(allDeleted ? 'ok' : 'ko', t('gdpr.title'), allDeleted ? t('gdpr.delete.ok') : t('gdpr.delete.partial'))
      setSelected({}); await doSearch()
    } catch (e) { gdprNotify('ko', t('gdpr.title'), String((e as Error)?.message ?? e)) }
    finally { setDeleting(false) }
  }

  if (!canList) return <p className="text-sm text-muted-foreground">{t('gdpr.no_list')}</p>

  return (
    <div className="flex flex-col gap-4">
      {/* Recherche */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-primary" />{t('gdpr.search.title')}</div>
        <p className="mt-1 text-xs text-muted-foreground">{t('gdpr.search.hint')}</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.field.name')}</label>
            <Input value={name} onChange={(e) => { setName(e.target.value); persist(results, e.target.value, email) }} onKeyDown={(e) => e.key === 'Enter' && doSearch()} placeholder={t('gdpr.field.name')} />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.field.email')}</label>
            <Input value={email} onChange={(e) => { setEmail(e.target.value); persist(results, name, e.target.value) }} onKeyDown={(e) => e.key === 'Enter' && doSearch()} placeholder={t('gdpr.field.email')} />
          </div>
          <Button size="sm" className="gap-1.5" onClick={doSearch} disabled={loading}>
            <Search className={cn('size-4', loading && 'animate-pulse')} />{loading ? t('gdpr.searching') : t('gdpr.search.button')}
          </Button>
        </div>
      </div>

      {/* Actions sélection */}
      {results && results.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="px-2.5 py-1">{t('gdpr.selected_count', { n: selectedCount })}</Badge>
          <div className="flex-1" />
          {canExport && <Button variant="outline" size="sm" className="gap-1.5" onClick={doExtract} disabled={extracting || selectedCount === 0}><Download className={cn('size-3.5', extracting && 'animate-pulse')} />{t('gdpr.extract.button')}</Button>}
          {canDelete && <Button size="sm" className="gap-1.5 bg-red-600 hover:bg-red-700" onClick={() => setShowDeleteConfirm(true)} disabled={deleting || selectedCount === 0}><Trash2 className="size-3.5" />{t('gdpr.delete.button')}</Button>}
        </div>
      )}

      {/* Résultats */}
      {results === null ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">{t('gdpr.idle')}</div>
      ) : loading ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t('common.loading')}</div>
      ) : results.length === 0 || totalRows === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">{t('gdpr.empty')}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {results.filter((m) => m.count > 0).map((m) => {
            const ids = m.rows.map((r) => r.id)
            const set = selected[m.key] ?? new Set<string>()
            const allChecked = ids.length > 0 && ids.every((id) => set.has(id))
            return (
              <div key={m.key} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                  <Database className="size-4 text-muted-foreground" /><span className="font-semibold">{m.module}</span>
                  <Badge variant="muted" className="px-1.5 py-0 text-[10px]">{m.count}</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-sm">
                    <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="w-10 px-3 py-2.5"><input type="checkbox" aria-label="all" checked={allChecked} onChange={(e) => toggleAll(m.key, ids, e.target.checked)} className="size-4 cursor-pointer accent-primary" /></th>
                        {m.columns.map((c) => <th key={c.key} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{c.text}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {m.rows.map((r) => {
                        const checked = set.has(r.id)
                        return (
                          <tr key={r.id} className={cn('transition-colors hover:bg-muted/40', checked && 'bg-primary/5')}>
                            <td className="px-3 py-2.5"><input type="checkbox" checked={checked} onChange={() => toggleRow(m.key, r.id)} className="size-4 cursor-pointer accent-primary" /></td>
                            {m.columns.map((c) => <td key={c.key} className="px-4 py-2.5 whitespace-nowrap">{r.cells[c.key] ?? ''}</td>)}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-600"><AlertTriangle className="size-5" /></div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold">{t('gdpr.delete.title')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t('gdpr.delete.body', { n: selectedCount })}</p>
                <p className="mt-2 text-xs text-red-600">{t('gdpr.delete.note')}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel')}</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={doDelete}>{t('gdpr.delete.confirm')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
