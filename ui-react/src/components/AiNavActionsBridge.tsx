import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

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

type ActionHandler = (args: Record<string, string>, data?: unknown) => unknown
declare global {
  interface Window {
    melisReactActionMap?: Record<string, ActionHandler>
  }
}

/**
 * Shell-side registration of the closed-loop navigation handlers on `window.melisReactActionMap`.
 *
 * Renders nothing. The AI chat itself is NOT here: it is owned by MelisAI and mounted as a brick
 * Overlay (melis-ai/ui-react/src/AiAssistant.tsx), present only when that module is active. The
 * chat dispatches `JS_ACTION::…` callbacks from tool_results into the action map; this bridge —
 * in the host — implements them against React Router + the tool-routes registry + the tab store,
 * and returns a "[BROWSER RESULT]" observation so the model sees what actually rendered.
 *
 * The split is deliberate: driving the back-office is the SHELL's concern (only it owns the
 * router, the menu and the tabs), while the chat UI is the module's. `melisReactActionMap` is
 * the contract between the two, so the handlers stay available to any future caller.
 */
export function AiNavActionsBridge() {
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

  return null
}
