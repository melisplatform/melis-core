/**
 * Fallback for the `@melis-ai-engine` source library when the melis-ai-engine module is
 * NOT installed next to melis-core (vendor/melisplatform/melis-ai-engine/ui-react/src).
 *
 * The Vite alias for `@melis-ai-engine` points at the engine's source; without the module
 * that path doesn't exist and the dev server (and the build) fail on the first import.
 * vite.config.ts detects the missing engine and redirects the alias here instead.
 *
 * At runtime the assistant is already gated on the MelisAI module being active
 * (`useModuleActive('MelisAI')` in Shell.tsx), so this component should never render;
 * it exists purely so module resolution succeeds.
 */
export function AiChatContainer(): null {
  if (import.meta.env.DEV) {
    console.warn('[melis] @melis-ai-engine is not installed — AI chat disabled.')
  }
  return null
}
