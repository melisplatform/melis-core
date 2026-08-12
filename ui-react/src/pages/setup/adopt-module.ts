import { applyModule, getModuleState } from '@/lib/setup-api'

/** Give the container's applier time to reload Apache / PHP-FPM (it polls every 2s on its side). */
const MODULE_POLL_INTERVAL = 1000
const MODULE_POLL_ATTEMPTS = 30

const sleep = (ms: number) => new Promise<void>((resolve) => { setTimeout(() => { resolve() }, ms) })

/**
 * Outcome of an adoption request. `skipped` means the install has no site module at all
 * (core only / bare platform) — nothing to adopt and nothing worth telling the user about.
 */
export type ModuleAdoption =
  | { status: 'skipped' }
  | { status: 'applied'; module: string }
  | { status: 'failed'; module: string }
  | { status: 'pending'; module: string }
  | { status: 'error'; message: string }

/**
 * Asks the container to adopt the site module chosen in the wizard as MELIS_MODULE, then waits
 * for the applier to acknowledge. Never throws — the caller decides how loud to be.
 *
 * Timing matters, and in two directions:
 *
 *  - It must run BEFORE the module-configuration step. That step is where the site is actually
 *    created: melis-engine's `MelisSetupPostDownloadController` calls `MelisCmsSiteService::
 *    saveSite()` with `site_name` taken from the wizard (the name you typed) but the MODULE
 *    name taken from `getenv('MELIS_MODULE')`. Adopting afterwards left those two disagreeing —
 *    a `melis_cms_site` row named `Bayang` next to a `module/MelisSites/MySite` folder built
 *    from the `.env` default. Adopting first makes `getenv()` already read the chosen name, so
 *    the scaffolded folder matches the site. Both wizards share that controller, so this is
 *    fixed here rather than there.
 *  - It must run BEFORE `finalizeSetup`, which unplugs MelisInstaller and takes the route
 *    carrying this request with it.
 *
 * Calling it twice is harmless: a request for the value already in place is acknowledged
 * without reloading anything (`requestModuleChange` short-circuits on `$name === $current`).
 */
export async function adoptSiteModule(): Promise<ModuleAdoption> {
  try {
    const request = await applyModule()
    if (request.state === 'skipped') return { status: 'skipped' }
    if (request.state === 'applied') return { status: 'applied', module: request.module }

    for (let i = 0; i < MODULE_POLL_ATTEMPTS; i++) {
      await sleep(MODULE_POLL_INTERVAL)
      const state = await getModuleState()
      if (state.state === 'applied') return { status: 'applied', module: state.module || request.module }
      if (state.state === 'failed') return { status: 'failed', module: request.module }
    }

    // No applier in this container (older image, or an install outside Docker): the request
    // stays pending. Say so instead of waiting forever.
    return { status: 'pending', module: request.module }
  } catch (e) {
    return { status: 'error', message: e instanceof Error ? e.message : String(e) }
  }
}
