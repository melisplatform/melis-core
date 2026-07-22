declare const __MELIS_ORIGIN__: string

declare module 'virtual:melis-module-registry' {
  import type { MelisModuleRegistry } from '@/types/melis-modules'
  const registry: MelisModuleRegistry
  export default registry
}
