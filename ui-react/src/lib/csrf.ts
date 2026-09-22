/**
 * CSRF token, React back-office side (audit item 10.0).
 *
 * The server puts the session token in the JS-readable cookie `melis_csrf`
 * (MelisCore\Service\MelisCoreCsrfService). We echo it back in the `X-Melis-Csrf` header on every
 * state-changing call, so MelisCoreCsrfListener can tell a real back-office action from one forged
 * by another site - which can make the browser send our cookies, but can never read them.
 *
 * Patched once on `window.fetch`, at boot, rather than in each `lib/*-api.ts`: every existing API
 * client and every module brick calls the host's fetch, so they are all covered without a single
 * per-file edit (and a new client cannot forget it).
 */
const HEADER = 'X-Melis-Csrf'
const SAFE = /^(GET|HEAD|OPTIONS)$/i

/** Read at each call, never cached: the token is renewed at login. */
function token(): string {
  const match = document.cookie.match(/(?:^|;\s*)melis_csrf=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

/** Our own back-office only: an absolute URL to another host must never receive the token. */
function isOwnUrl(url: string): boolean {
  if (!url) return true
  if (!/^https?:\/\//i.test(url)) return true // relative to the current page
  return url.startsWith(window.location.origin + '/')
}

export function installCsrf() {
  const original = window.fetch
  if ((window as { __melisCsrfInstalled?: boolean }).__melisCsrfInstalled) return
  ;(window as { __melisCsrfInstalled?: boolean }).__melisCsrfInstalled = true

  window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const method = init.method ?? (input instanceof Request ? input.method : 'GET')

    if (SAFE.test(method) || !isOwnUrl(url)) return original(input, init)

    const value = token()
    if (!value) return original(input, init)

    const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined))
    headers.set(HEADER, value)

    return original(input, { ...init, headers })
  }
}
