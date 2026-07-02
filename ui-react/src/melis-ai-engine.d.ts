/**
 * Ambient declaration for the `@melis-ai-engine` source library (the AI chat React
 * components, owned by the melis-ai-engine module and resolved at build time via the Vite
 * alias). We declare the surface the shell consumes rather than letting tsc deep-type-check
 * the engine's own source under melis-core's stricter config (noUnusedLocals/etc.) — the
 * engine builds against its own tsconfig. Vite bundles the real source; tsc trusts this.
 */
declare module '@melis-ai-engine' {
  import type { CSSProperties, ReactElement } from 'react'

  export interface AiChatContainerProps {
    maiInstanceId: string
    agentId?: number | null
    autoRun?: boolean
    showHeader?: boolean
    clearSession?: boolean
    debugMode?: boolean
    needExitParam?: boolean
    showCloseButton?: boolean
    showHideButton?: boolean
    style?: CSSProperties
    onClose?: () => void
    onHide?: () => void
    [key: string]: unknown
  }

  export function AiChatContainer(props: AiChatContainerProps): ReactElement | null
}
