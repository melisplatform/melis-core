import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  AlertTriangle, GripVertical, Package, PackageCheck, PackageX, RotateCcw,
  Save, Search, Sparkles, X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as modulesApi from '@/lib/modules-api'
import type { ModuleItem } from '@/lib/modules-api'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import { useCan } from '@/lib/capabilities'

const TOOL_KEY = 'meliscore_tool_user_module_management'

/** Toast vers la chrome React (cf. components/Notifications.tsx). */
function notify(kind: 'ok' | 'ko', title: string, message: string) {
  window.postMessage({ __melisNotif: true, kind, title, message }, '*')
}

// ─── Cache module-level — survit au démontage (page montée en permanence) ──────
interface PageCache {
  modules: ModuleItem[]
  mode: ViewMode
  iframeLoaded: boolean
}
let _cache: PageCache | null = null

/** Signature stable pour détecter les changements (ordre + activation). */
function signature(mods: ModuleItem[]): string {
  return mods.map((m) => `${m.name}:${m.active ? 1 : 0}`).join('|')
}

/** Switch on/off accessible. */
function Switch({ checked, onChange, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-emerald-500' : 'bg-red-500',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className={cn(
        'inline-block size-4 transform rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-4' : 'translate-x-0.5',
      )} />
    </button>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ModulesPage() {
  const location = useLocation()
  const { openTab } = useTabs()
  const { t } = useI18n()
  const base = routeForForward('MelisCore/Modules') ?? '/modules'

  const canList = useCan(TOOL_KEY, 'list')
  const canEdit = useCan(TOOL_KEY, 'edit')

  const showViewToggle = toolHasViewToggle('modules')
  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  const [modules, setModules] = useState<ModuleItem[]>(_cache?.modules ?? [])
  const [initialSig, setInitialSig] = useState<string>(_cache ? signature(_cache.modules) : '')
  const [loading, setLoading] = useState(!_cache)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState<{ module: string; cascade: string[] } | null>(null)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  const cacheRef = useRef({ modules, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { modules, mode, iframeLoaded } })
  useEffect(() => () => { _cache = cacheRef.current }, [])

  useEffect(() => {
    if (location.pathname === base) openTab({ id: base, label: t('modules.title'), path: base })
  }, [location.pathname, openTab, base, t])

  function load() {
    setLoading(true)
    modulesApi.fetchModules()
      .then((mods) => { setModules(mods); setInitialSig(signature(mods)) })
      .catch((e) => notify('ko', t('modules.title'), String(e?.message ?? e)))
      .finally(() => setLoading(false))
  }
  useEffect(() => { if (!_cache) load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Index par nom + maps de dépendances dérivées de l'état courant.
  const byName = useMemo(() => {
    const m: Record<string, ModuleItem> = {}
    for (const mod of modules) m[mod.name] = mod
    return m
  }, [modules])

  const dirty = signature(modules) !== initialSig
  const activeCount = modules.filter((m) => m.active).length

  /** Ferme la transitive (requires) d'un module : tout ce qui doit être actif si M l'est. */
  function requiresClosure(name: string): string[] {
    const out = new Set<string>()
    const stack = [name]
    while (stack.length) {
      const cur = stack.pop()!
      for (const dep of byName[cur]?.requires ?? []) {
        if (!out.has(dep)) { out.add(dep); stack.push(dep) }
      }
    }
    return [...out]
  }

  /** Ferme la transitive (dependents ACTIFS) : tout ce qui casserait si M est désactivé. */
  function activeDependentsClosure(name: string): string[] {
    const out = new Set<string>()
    const stack = [name]
    while (stack.length) {
      const cur = stack.pop()!
      for (const dep of byName[cur]?.dependents ?? []) {
        if (byName[dep]?.active && !out.has(dep)) { out.add(dep); stack.push(dep) }
      }
    }
    return [...out]
  }

  function applyActive(names: string[], value: boolean) {
    const set = new Set(names)
    setModules((prev) => prev.map((m) => (set.has(m.name) ? { ...m, active: value } : m)))
  }

  function handleToggle(name: string, value: boolean) {
    if (!canEdit) return
    if (value) {
      // Activation : on active aussi les requis manquants.
      const deps = requiresClosure(name).filter((d) => !byName[d]?.active)
      applyActive([name, ...deps], true)
      if (deps.length) notify('ok', t('modules.title'), t('modules.activated_deps', { deps: deps.join(', ') }))
    } else {
      // Désactivation : prévenir si des modules actifs en dépendent.
      const cascade = activeDependentsClosure(name)
      if (cascade.length) { setConfirmDeactivate({ module: name, cascade }); return }
      applyActive([name], false)
    }
  }

  function confirmCascadeDeactivate() {
    if (!confirmDeactivate) return
    applyActive([confirmDeactivate.module, ...confirmDeactivate.cascade], false)
    setConfirmDeactivate(null)
  }

  function setAll(value: boolean) {
    if (!canEdit) return
    setModules((prev) => prev.map((m) => ({ ...m, active: value })))
  }

  function resetChanges() {
    if (_cache) { setModules(_cache.modules); return }
    load()
  }

  // ─── Réordonnancement (drag & drop natif, désactivé pendant une recherche) ───
  const canReorder = canEdit && search.trim() === ''
  function onDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) { setDragIndex(null); return }
    setModules((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
    setDragIndex(null)
  }

  async function doSave() {
    setShowSaveConfirm(false)
    setSaving(true)
    try {
      const ordered = modules.filter((m) => m.active).map((m) => m.name)
      await modulesApi.saveModules(ordered)
      notify('ok', t('modules.title'), t('modules.saved_ok'))
      _cache = null
      // Les changements de modules nécessitent un rechargement complet de la plateforme.
      setTimeout(() => window.location.reload(), 1200)
    } catch (e) {
      notify('ko', t('modules.title'), String((e as Error)?.message ?? e))
      setSaving(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return modules
    return modules.filter((m) => m.name.toLowerCase().includes(q) || m.package.toLowerCase().includes(q))
  }, [modules, search])

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{t('modules.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('modules.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {showViewToggle && (
            <ViewModeToggle mode={effectiveMode} onChange={(m) => { setMode(m); if (m === 'iframe') setIframeLoaded(true) }} />
          )}
          <button type="button" onClick={load} title={t('common.refresh')}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <RotateCcw className={cn('size-3.5', loading && 'animate-spin')} />
          </button>
          <Button size="sm" className="gap-1.5" onClick={() => setShowSaveConfirm(true)} disabled={!dirty || saving || !canEdit}>
            <Save className="size-4" />
            {saving ? t('modules.saving') : t('modules.save')}
          </Button>
        </div>
      </div>

      {/* Vue Melis classique (iframe) */}
      <MelisClassicFrame melisKey={TOOL_KEY} title="Modules — Vue Melis"
        visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      {/* Vue React */}
      <div className={cn('flex flex-1 flex-col gap-4', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {!canList ? (
          <p className="text-sm text-muted-foreground">{t('modules.no_list')}</p>
        ) : (<>
          {/* Barre d'actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t('modules.search')} className="pl-9" />
              {search && <button onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
            </div>
            <Badge variant="muted" className="gap-1.5 px-2.5 py-1">
              <PackageCheck className="size-3.5 text-primary" />
              {t('modules.active_count', { active: activeCount, total: modules.length })}
            </Badge>
            {canEdit && (
              <>
                <Button variant="outline" size="sm" onClick={() => setAll(true)}>{t('modules.select_all')}</Button>
                <Button variant="outline" size="sm" onClick={() => setAll(false)}>{t('modules.deselect_all')}</Button>
              </>
            )}
            {dirty && (
              <Button variant="outline" size="sm" className="gap-1.5 text-amber-600" onClick={resetChanges}>
                <RotateCcw className="size-3.5" />{t('modules.reset')}
              </Button>
            )}
          </div>

          {/* Indice de réordonnancement */}
          <p className="text-xs text-muted-foreground">
            {canReorder ? t('modules.reorder_hint') : t('modules.reorder_disabled_search')}
          </p>

          {/* Liste */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {loading && modules.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t('common.loading')}</div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t('modules.empty')}</div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((m) => {
                  const realIndex = modules.indexOf(m)
                  return (
                    <li
                      key={m.name}
                      draggable={canReorder}
                      onDragStart={() => canReorder && setDragIndex(realIndex)}
                      onDragOver={(e) => { if (canReorder) e.preventDefault() }}
                      onDrop={() => canReorder && onDrop(realIndex)}
                      onDragEnd={() => setDragIndex(null)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 transition-colors',
                        dragIndex === realIndex ? 'bg-primary/5' : 'hover:bg-muted/40',
                        !m.active && 'opacity-60',
                      )}
                    >
                      {canReorder ? (
                        <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
                      ) : (
                        <span className="size-4 shrink-0" />
                      )}
                      <div className={cn('grid size-9 shrink-0 place-items-center rounded-lg',
                        m.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                        {m.active ? <Package className="size-4.5" /> : <PackageX className="size-4.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{m.name}</span>
                          {m.version && (
                            <Badge variant="muted" className="px-1.5 py-0 text-[10px] tabular-nums">v{m.version.replace(/^v/i, '')}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {m.package && <code className="truncate">{m.package}</code>}
                          {m.requires.length > 0 && (
                            <span className="truncate" title={m.requires.join(', ')}>
                              · {t('modules.requires')}: {m.requires.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Switch checked={m.active} disabled={!canEdit} onChange={(v) => handleToggle(m.name, v)} />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <div className="text-center text-xs text-muted-foreground">{t('modules.count', { n: modules.length })}</div>
        </>)}
      </div>

      {/* Confirmation désactivation en cascade */}
      {confirmDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <AlertTriangle className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold">{t('modules.deactivate.title')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('modules.deactivate.body', { module: confirmDeactivate.module })}
                </p>
                <ul className="mt-2 list-inside list-disc text-sm">
                  {confirmDeactivate.cascade.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmDeactivate(null)}>{t('common.cancel')}</Button>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={confirmCascadeDeactivate}>
                {t('modules.deactivate.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation de sauvegarde (recharge la plateforme) */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold">{t('modules.save.title')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t('modules.save.body')}</p>
                <p className="mt-2 text-xs text-amber-600">{t('modules.save.note')}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSaveConfirm(false)}>{t('common.cancel')}</Button>
              <Button size="sm" onClick={doSave}>{t('modules.save.confirm')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
