/**
 * AI agents rights (section <melisai_agents>, contributed by MelisAIEngine).
 *
 * The agents are served by MelisAIEngine:
 *   GET /melis/react-api/ai-engine/rights/agents
 * When the module isn't active the call fails and the editor hides the panel (the section, if any,
 * is then kept verbatim like any other section it doesn't edit).
 *
 * XML model:
 *   no <melisai_agents> section        → every agent allowed (rights saved before the feature)
 *   <melisai_agents><id>-1</id></…>     → every agent, including the ones created later
 *   <melisai_agents><id>3</id>…</…>     → only those agents
 *   <melisai_agents></melisai_agents>   → no agent
 */

export const AGENTS_SECTION = 'melisai_agents'
const ALL_AGENTS = '-1'

export interface AiAgentRight {
  id: number
  name: string
  code: string
  status: boolean
}

export interface AgentsRightsState {
  /** Every agent, including future ones (<id>-1</id>, or no section at all) */
  all: boolean
  /** Explicitly allowed agents, when not `all` */
  ids: Set<number>
}

/** The agents, or null when MelisAIEngine isn't active (or the user may not list them). */
export async function fetchAgentRights(): Promise<AiAgentRight[] | null> {
  try {
    const res = await fetch('/melis/react-api/ai-engine/rights/agents', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.success || !Array.isArray(data.data)) return null
    return (data.data as AiAgentRight[]).map((a) => ({
      id: Number(a.id), name: String(a.name ?? ''), code: String(a.code ?? ''), status: Boolean(a.status),
    }))
  } catch {
    return null
  }
}

/** Read the agents rights of a usr_rights / urole_rights XML. */
export function parseAgentsRights(xml: string): AgentsRightsState {
  const state: AgentsRightsState = { all: true, ids: new Set() }
  if (!xml?.trim()) return state
  try {
    const doc = new DOMParser().parseFromString(xml, 'text/xml')
    const el = doc.querySelector(AGENTS_SECTION)
    if (!el) return state
    const values = Array.from(el.childNodes)
      .filter((n) => n.nodeName === 'id')
      .map((n) => n.textContent?.trim() ?? '')
    state.all = values.includes(ALL_AGENTS)
    values.forEach((v) => { const id = Number(v); if (id > 0) state.ids.add(id) })
  } catch { /* malformed */ }
  return state
}

/** The <melisai_agents> section for a state. */
export function buildAgentsSection(state: AgentsRightsState): string[] {
  const ids = state.all ? [ALL_AGENTS] : [...state.ids].sort((a, b) => a - b).map(String)
  return [`<${AGENTS_SECTION}>`, ...ids.map((id) => `\t<id>${id}</id>`), `</${AGENTS_SECTION}>`]
}
