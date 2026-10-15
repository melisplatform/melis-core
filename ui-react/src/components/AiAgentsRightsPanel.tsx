/**
 * AiAgentsRightsPanel — the "AI agents" rights section (<melisai_agents>, contributed by MelisAIEngine).
 *
 * A "All agents, including new ones" master (= <id>-1</id>) allows every agent, present and future;
 * otherwise each ticked agent is allowed. Same look as DashboardPluginsRightsPanel.
 */

import { CheckSquare, MinusSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import type { AgentsRightsState, AiAgentRight } from '@/lib/ai-agents-rights-api'

type Tri = 'all' | 'some' | 'none'

function TriBox({ state, disabled, onChange }: { state: Tri; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(state !== 'all')}
      className={cn('flex shrink-0 items-center justify-center rounded transition-colors focus:outline-none [&_svg]:pointer-events-none',
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80')}
    >
      {state === 'all' ? <CheckSquare className="size-[15px] text-primary" />
        : state === 'some' ? <MinusSquare className="size-[15px] text-primary/70" />
          : <Square className="size-[15px] text-muted-foreground/60" />}
    </button>
  )
}

export function AiAgentsRightsPanel({
  agents, rights, onToggle, onToggleAll,
}: {
  agents: AiAgentRight[]
  rights: AgentsRightsState
  onToggle: (id: number, v: boolean) => void
  onToggleAll: (v: boolean) => void
}) {
  const { t } = useI18n()
  const agentIds = new Set(agents.map((a) => a.id))
  // Only count agents that still exist (a deleted agent can stay in the XML)
  const count = [...rights.ids].filter((id) => agentIds.has(id)).length

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <label className="flex cursor-pointer items-center gap-2 bg-muted/40 px-3 py-2 hover:bg-muted/60 transition-colors">
        <TriBox state={rights.all ? 'all' : count > 0 ? 'some' : 'none'} onChange={onToggleAll} />
        <span className="text-sm font-medium text-foreground/90">{t('rights.agents_all_label')}</span>
        <span className="ml-auto text-xs text-muted-foreground/70">
          {rights.all ? t('rights.agents_all_status') : t('rights.agents_selected', { count })}
        </span>
      </label>
      <p className="border-b border-border/40 bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground/70">
        {rights.all
          ? t('rights.agents_all_hint', { label: t('rights.agents_all_label') })
          : t('rights.agents_specific_hint', { label: t('rights.agents_all_label') })}
      </p>
      {/* The agents are only listed when picking specific ones ("all" unticked) */}
      {!rights.all && (
        <div className="py-1">
          {agents.length === 0
            ? <p className="py-2 pl-4 text-xs text-muted-foreground">{t('rights.agents_none')}</p>
            : agents.map((agent) => {
              const on = rights.ids.has(agent.id)
              return (
                <label key={agent.id} className="flex cursor-pointer items-center gap-2 py-1 pr-3 pl-2 rounded hover:bg-muted/40 transition-colors">
                  <TriBox state={on ? 'all' : 'none'} onChange={(v) => onToggle(agent.id, v)} />
                  <span className={cn('text-sm truncate', on ? 'text-foreground/90' : 'text-foreground/70')}>{agent.name || agent.code}</span>
                  {!agent.status && (
                    <span className="shrink-0 text-[11px] text-muted-foreground/60">({t('rights.agent_inactive')})</span>
                  )}
                </label>
              )
            })}
        </div>
      )}
    </div>
  )
}
