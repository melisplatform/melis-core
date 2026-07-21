import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, X } from 'lucide-react'

import { AiChatContainer } from '@melis-ai-engine'
import { useI18n } from '@/i18n/i18n-context'
import { useTabs } from '@/components/tabs/tab-store'
import { useNavMenu, type NavNode } from '@/hooks/useNavMenu'
import { melisKeyForRoute } from '@/lib/tool-routes'
import {
  flattenTools,
  resolveTool,
  waitForContent,
  captureSnapshot,
  observationText,
  doClickButton,
  doFilterList,
  doEditRow,
  doSetField,
  doSubmitForm,
  doDescribeForm,
  type NavTool,
} from '@/lib/ai-nav-actions'

// The general "Main Chat Assistant" agent (melis-ai GeneralChatController).
const GENERAL_AGENT_ID = 1
const GENERAL_MAI = 'mainchatassistantgeneral'

type ActionHandler = (args: Record<string, string>, data?: unknown) => unknown
declare global {
  interface Window {
    melisReactActionMap?: Record<string, ActionHandler>
  }
}

/**
 * Global AI assistant: a floating chat panel (toggle bottom-right) PLUS the shell-side
 * registration of the closed-loop navigation handlers on window.melisReactActionMap.
 *
 * The chat (AiChatContainer, owned by melis-ai-engine) dispatches JS_ACTION callbacks from
 * tool_results to those handlers; here — in the shell — we implement them against React
 * Router + the tool-routes registry + the tab store, then return a "[BROWSER RESULT]"
 * observation so the model sees what actually rendered. Handlers are registered once and
 * read live values (menu / navigate / openTab) from refs to avoid stale closures.
 */
export function AiAssistant() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { openTab } = useTabs()
  const { nodes } = useNavMenu()

  const nodesRef = useRef<NavNode[]>(nodes)
  const navigateRef = useRef(navigate)
  const openTabRef = useRef(openTab)
  nodesRef.current = nodes
  navigateRef.current = navigate
  openTabRef.current = openTab

  useEffect(() => {
    // Build the resolvable tool list from the live menu, enriching each with its melisKey
    // from the tool-routes registry (route → melisKey) for melisKey-based resolution.
    const tools = (): NavTool[] =>
      flattenTools(nodesRef.current).map(t => ({ ...t, melisKey: melisKeyForRoute(t.route) }))

    /** Navigate to a resolved tool and observe what rendered. Always resolves an observation. */
    const openToolByHint = async (
      hint: { melisKey?: string; name?: string },
      desc: string,
    ): Promise<string> => {
      const tool = resolveTool(tools(), hint)
      if (!tool) {
        return observationText(
          `could not find a back-office tool matching "${hint.name ?? hint.melisKey ?? ''}"`,
          false,
          captureSnapshot(''),
        )
      }
      openTabRef.current({ id: tool.route, label: tool.label, path: tool.route })
      navigateRef.current(tool.route)
      await waitForContent()
      return observationText(desc || `opened ${tool.label}`, true, captureSnapshot(tool.label))
    }

    /** Navigate to a CMS page editor and observe. */
    const openPageById = async (pageIdRaw: string): Promise<string> => {
      const pageId = parseInt(pageIdRaw, 10)
      if (!pageId || Number.isNaN(pageId)) {
        return observationText('a valid numeric page id is required', false)
      }
      const route = `/melis-cms/page/${pageId}`
      openTabRef.current({ id: route, label: `Page ${pageId}`, path: route })
      navigateRef.current(route)
      await waitForContent()
      return observationText(`opened CMS page ${pageId}`, true, captureSnapshot(`Page ${pageId}`))
    }

    const map: Record<string, ActionHandler> = window.melisReactActionMap ?? (window.melisReactActionMap = {})

    // Simple one-shot openers (from openBackOfficeTool / openCmsPage MCP tools).
    map.openMelisTool = (args) =>
      openToolByHint({ melisKey: args.toolMeliskey, name: args.toolName || args.toolId }, `opened ${args.toolName || 'tool'}`)
    map.openMelisPage = (args) => openPageById(args.pageId ?? '')

    // Closed-loop navStep: one end-to-end step, then report the observation back.
    map.performNavStep = (args) => {
      let step: { action?: string; match?: string; query?: string; recordId?: string; pageId?: string } = {}
      try {
        step = (JSON.parse(args.p || '{}').step) || {}
      } catch {
        return Promise.resolve('FAILED: could not parse the navigation step payload')
      }
      switch (step.action) {
        case 'openTool':
          return openToolByHint({ name: step.match }, `opened ${step.match ?? 'tool'}`)
        case 'openPage':
          return openPageById(String(step.pageId ?? step.query ?? ''))
        case 'clickButton':
          return doClickButton(step.match ?? '')
        case 'filterList':
          return doFilterList(step.query ?? '')
        case 'editRow':
          return doEditRow({ recordId: step.recordId, query: step.query })
        case 'setField':
          return doSetField(step.match ?? '', step.query ?? '')
        case 'submitForm':
          return doSubmitForm(step.match ?? '')
        case 'describeForm':
          return doDescribeForm()
        default:
          return Promise.resolve(observationText(`unknown navigation action "${step.action ?? ''}"`, false))
      }
    }

    return () => {
      // Leave the map in place but drop our handlers so a hot-reload re-registers cleanly.
      if (window.melisReactActionMap) {
        delete window.melisReactActionMap.openMelisTool
        delete window.melisReactActionMap.openMelisPage
        delete window.melisReactActionMap.performNavStep
      }
    }
  }, [])

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title={t('layout.ai_assistant')}
          style={fabStyle}
        >
          <Bot style={{ width: 22, height: 22 }} />
        </button>
      )}
      {open && (
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
              <Bot style={{ width: 18, height: 18 }} /> {t('layout.ai_assistant')}
            </span>
            <button type="button" onClick={() => setOpen(false)} title={t('layout.close')} style={panelCloseStyle}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
            <AiChatContainer
              maiInstanceId={GENERAL_MAI}
              agentId={GENERAL_AGENT_ID}
              autoRun
              showHeader={false}
              style={{ flex: 1, minHeight: 0 }}
            />
          </div>
        </div>
      )}
    </>
  )
}

// ─── Inline styles (CSS-var themed, matching the AI chat surfaces) ─────────────

const fabStyle: CSSProperties = {
  position: 'fixed', right: 20, bottom: 20, zIndex: 9000,
  width: 52, height: 52, borderRadius: '50%',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid var(--color-border)', background: 'var(--color-primary, #f97316)',
  color: '#fff', cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,.25)',
}

const panelStyle: CSSProperties = {
  position: 'fixed', right: 20, bottom: 20, zIndex: 9000,
  width: 'min(400px, calc(100vw - 40px))', height: 'min(620px, calc(100vh - 100px))',
  display: 'flex', flexDirection: 'column',
  background: 'var(--color-card, #fff)', color: 'var(--color-foreground, #111)',
  border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden',
  boxShadow: '0 12px 40px rgba(0,0,0,.3)',
}

const panelHeaderStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 12px', borderBottom: '1px solid var(--color-border)',
  background: 'var(--color-muted, #f6f6f6)',
}

const panelCloseStyle: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
  border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)',
}
