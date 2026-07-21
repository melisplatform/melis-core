/**
 * DashboardPluginsRightsPanel — the "Dashboard Plugins" rights section (core <melis_dashboardplugin>).
 *
 * Plugins are GROUPED BY MODULE (like the tools section), in module-merge order (the backend returns
 * them MelisCore → MelisCms → … and tags each with its owning module). A "Tous les plugins" master
 * (= melis_dashboardplugin_root) grants everything; otherwise toggle a whole module group or single
 * plugins. Checking "all" shows every row inherited (checked + disabled).
 */

import { useState } from 'react'
import { CheckSquare, ChevronRight, MinusSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import { DASHBOARD_ALL, type DashboardPluginRight } from '@/lib/dashboard-rights-api'

type Tri = 'all' | 'some' | 'none'

/** Sentinel grouping key for plugins with no owning module — displayed via i18n (layout.rights_other). */
const UNGROUPED = '__ungrouped__'

function TriBox({ state, disabled, onChange }: { state: Tri; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(state !== 'all')}
      className={cn('flex shrink-0 items-center justify-center rounded transition-colors focus:outline-none',
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80')}
    >
      {state === 'all' ? <CheckSquare className="size-[15px] text-primary" />
        : state === 'some' ? <MinusSquare className="size-[15px] text-primary/70" />
          : <Square className="size-[15px] text-muted-foreground/60" />}
    </button>
  )
}

/** A single plugin toggle row (used both inside a module group and, for 1-plugin modules, standalone). */
function PluginRow({
  plugin, on, disabled, onToggle, module,
}: {
  plugin: DashboardPluginRight
  on: boolean
  disabled?: boolean
  onToggle: (key: string, v: boolean) => void
  /** Owning module — shown as an uppercase context label on STANDALONE rows (single-plugin modules),
   *  so the module stays visible now that there's no group header. Omitted inside a ModuleGroup. */
  module?: string
}) {
  const { t } = useI18n()
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 pr-3 pl-2 rounded hover:bg-muted/40 transition-colors">
      <TriBox state={on ? 'all' : 'none'} disabled={disabled} onChange={(v) => onToggle(plugin.key, v)} />
      {module && (
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">{module === UNGROUPED ? t('layout.rights_other') : module}</span>
      )}
      <span className={cn('text-sm truncate', on ? 'text-foreground/90' : 'text-foreground/70')}>{plugin.title}</span>
    </label>
  )
}

function ModuleGroup({
  module, plugins, all, checked, onToggle, onToggleMany,
}: {
  module: string
  plugins: DashboardPluginRight[]
  all: boolean
  checked: Set<string>
  onToggle: (key: string, v: boolean) => void
  onToggleMany: (keys: string[], v: boolean) => void
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(true)
  const keys = plugins.map((p) => p.key)
  const nChecked = plugins.filter((p) => checked.has(p.key)).length
  const state: Tri = all || nChecked === plugins.length ? 'all' : nChecked === 0 ? 'none' : 'some'

  return (
    <div>
      <div className="flex items-center gap-1.5 py-1 pl-2 pr-3 rounded hover:bg-muted/30 transition-colors">
        <TriBox state={state} disabled={all} onChange={(v) => onToggleMany(keys, v)} />
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex flex-1 items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90 truncate">{module === UNGROUPED ? t('layout.rights_other') : module}</span>
          <span className="ml-1 text-[11px] text-muted-foreground/50 tabular-nums">{all ? plugins.length : nChecked}/{plugins.length}</span>
          <ChevronRight className={cn('size-3 shrink-0 text-muted-foreground/60 transition-transform ml-auto', open && 'rotate-90')} />
        </button>
      </div>
      {open && (
        <div className="ml-4">
          {plugins.map((p) => (
            <PluginRow key={p.key} plugin={p} on={all || checked.has(p.key)} disabled={all} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

export function DashboardPluginsRightsPanel({
  plugins, checked, onToggle, onToggleMany, onToggleAll,
}: {
  plugins: DashboardPluginRight[]
  checked: Set<string>
  onToggle: (key: string, v: boolean) => void
  onToggleMany: (keys: string[], v: boolean) => void
  onToggleAll: (v: boolean) => void
}) {
  const { t } = useI18n()
  const all = checked.has(DASHBOARD_ALL)
  const specificCount = Array.from(checked).filter((k) => k !== DASHBOARD_ALL).length

  // Group by module, preserving the backend's module-merge order.
  const groups: { module: string; plugins: DashboardPluginRight[] }[] = []
  const idx: Record<string, number> = {}
  for (const p of plugins) {
    const m = p.module || UNGROUPED
    if (idx[m] === undefined) { idx[m] = groups.length; groups.push({ module: m, plugins: [] }) }
    groups[idx[m]].plugins.push(p)
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <label className="flex cursor-pointer items-center gap-2 bg-muted/40 px-3 py-2 hover:bg-muted/60 transition-colors">
        <TriBox state={all ? 'all' : specificCount > 0 ? 'some' : 'none'} onChange={onToggleAll} />
        <span className="text-sm font-medium text-foreground/90">{t('rights.dash_all_label')}</span>
        <span className="ml-auto text-xs text-muted-foreground/70">
          {all ? t('rights.dash_all_status') : specificCount > 0 ? t('rights.dash_selected', { count: specificCount }) : t('rights.dash_by_module')}
        </span>
      </label>
      {/* Hint: individual plugins are inherited (disabled) while "all" is on — tell the user how to target some. */}
      {all && (
        <p className="border-b border-border/40 bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground/70">
          {t('rights.dash_all_hint', { label: t('rights.dash_all_label') })}
        </p>
      )}
      <div className="py-1">
        {groups.length === 0
          ? <p className="py-2 pl-4 text-xs text-muted-foreground">{t('rights.dash_none')}</p>
          : groups.map((g) => (
            // A module that contributes a single plugin renders as ONE row (no redundant group header
            // to expand for a lone entry); modules with 2+ plugins keep the collapsible group.
            g.plugins.length === 1
              ? <PluginRow key={g.module} plugin={g.plugins[0]} module={g.module} on={all || checked.has(g.plugins[0].key)} disabled={all} onToggle={onToggle} />
              : <ModuleGroup key={g.module} module={g.module} plugins={g.plugins} all={all}
                  checked={checked} onToggle={onToggle} onToggleMany={onToggleMany} />
          ))}
      </div>
    </div>
  )
}
