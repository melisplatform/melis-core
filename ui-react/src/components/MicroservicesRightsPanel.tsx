/**
 * MicroservicesRightsPanel — the "API / microservices" rights section (core
 * `<meliscore_microservice>`, audit C4), shown in the user form's API tab.
 *
 * Services are GROUPED BY MODULE (collapsed by default), in module-merge order. ONE action only:
 * enable/disable per service — no capabilities. ALLOW-LIST with default-DENY: nothing is granted
 * until explicitly checked; a checked box writes an `<id>` entry to the rights XML, and an absent
 * section means no microservice access at all (admins bypass server-side).
 */

import { useState } from 'react'
import { CheckSquare, ChevronRight, MinusSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import type { MicroserviceModuleGroup, MicroserviceRight } from '@/lib/microservice-rights-api'

type Tri = 'all' | 'some' | 'none'

function TriBox({ state, onChange }: { state: Tri; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(state !== 'all')}
      // [&_svg]:pointer-events-none : cf. RightsTreeView (Firefox, clic au centre des cases vides).
      className="flex shrink-0 items-center justify-center rounded transition-colors hover:opacity-80 focus:outline-none [&_svg]:pointer-events-none"
    >
      {state === 'all' ? <CheckSquare className="size-[15px] text-primary" />
        : state === 'some' ? <MinusSquare className="size-[15px] text-primary/70" />
          : <Square className="size-[15px] text-muted-foreground/60" />}
    </button>
  )
}

function ServiceRow({ service, enabled, onToggle }: {
  service: MicroserviceRight
  enabled: boolean
  onToggle: (key: string, enabled: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 py-1 pr-3 pl-2 rounded hover:bg-muted/40 transition-colors">
      <span className="mt-0.5"><TriBox state={enabled ? 'all' : 'none'} onChange={(v) => onToggle(service.key, v)} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-foreground/90 truncate">{service.name}</span>
        {service.description && (
          <span className="block text-xs text-muted-foreground/70 truncate">{service.description}</span>
        )}
      </span>
    </label>
  )
}

function ModuleGroup({ group, allowed, onToggle, onToggleMany }: {
  group: MicroserviceModuleGroup
  allowed: Set<string>
  onToggle: (key: string, enabled: boolean) => void
  onToggleMany: (keys: string[], enabled: boolean) => void
}) {
  // Fermé par défaut : l'onglet s'ouvre sur la liste compacte des modules (compteurs visibles).
  const [open, setOpen] = useState(false)
  const keys = group.services.map((s) => s.key)
  const nEnabled = group.services.filter((s) => allowed.has(s.key)).length
  const state: Tri = nEnabled === group.services.length ? 'all' : nEnabled === 0 ? 'none' : 'some'

  return (
    <div>
      <div className="flex items-center gap-1.5 py-1 pl-2 pr-3 rounded hover:bg-muted/30 transition-colors">
        <TriBox state={state} onChange={(v) => onToggleMany(keys, v)} />
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex flex-1 items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90 truncate">{group.module}</span>
          <span className="ml-1 text-[11px] text-muted-foreground/50 tabular-nums">{nEnabled}/{group.services.length}</span>
          <ChevronRight className={cn('size-3 shrink-0 text-muted-foreground/60 transition-transform ml-auto', open && 'rotate-90')} />
        </button>
      </div>
      {open && (
        <div className="ml-4">
          {group.services.map((s) => (
            <ServiceRow key={s.key} service={s} enabled={allowed.has(s.key)} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

export function MicroservicesRightsPanel({ catalog, allowed, onToggle, onToggleMany }: {
  catalog: MicroserviceModuleGroup[]
  allowed: Set<string>
  onToggle: (key: string, enabled: boolean) => void
  onToggleMany: (keys: string[], enabled: boolean) => void
}) {
  const { t } = useI18n()
  const allKeys = catalog.flatMap((g) => g.services.map((s) => s.key))
  const nEnabled = allKeys.filter((k) => allowed.has(k)).length
  const masterState: Tri = nEnabled === allKeys.length && allKeys.length > 0 ? 'all' : nEnabled === 0 ? 'none' : 'some'

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <label className="flex cursor-pointer items-center gap-2 bg-muted/40 px-3 py-2 hover:bg-muted/60 transition-colors">
        <TriBox state={masterState} onChange={(v) => onToggleMany(allKeys, v)} />
        <span className="text-sm font-medium text-foreground/90">{t('rights.ms_all_label')}</span>
        <span className="ml-auto text-xs text-muted-foreground/70 tabular-nums">
          {nEnabled}/{allKeys.length}
        </span>
      </label>
      {/* Default-deny : rien n'est accessible tant que ce n'est pas explicitement activé. */}
      <p className="border-b border-border/40 bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground/70">
        {t('rights.ms_hint')}
      </p>
      <div className="py-1">
        {catalog.length === 0
          ? <p className="py-2 pl-4 text-xs text-muted-foreground">{t('rights.ms_none')}</p>
          : catalog.map((g) => (
            <ModuleGroup key={g.module} group={g} allowed={allowed} onToggle={onToggle} onToggleMany={onToggleMany} />
          ))}
      </div>
    </div>
  )
}
