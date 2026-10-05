/**
 * CSRF emitter tests, legacy back-office side (audit item 10.0) - public/js/core/melisCsrf.js.
 *
 * The PHP tests cover the server's verdict; this covers the other half, which is what actually
 * puts the token on the wire. No browser needed: the file only touches document.cookie,
 * XMLHttpRequest and a delegated submit listener, all stubbed here.
 *
 *     node vendor/melisplatform/melis-core/test/MelisCoreTest/Security/csrf-js-test.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, '../../../public/js/core/melisCsrf.js'), 'utf8')

const TOKEN = 'a'.repeat(64)
let failures = 0
let ran = 0

function check(label, actual, expected) {
  ran++
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : ` (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`}`)
}

/** Minimal browser surface: just what melisCsrf.js reaches for. */
function browser(cookie) {
  const submitListeners = []
  const sent = []

  class FakeXHR {
    constructor() { this.headers = {} }
    open(method, url) { this.method = method; this.url = url }
    send() { sent.push({ method: this.method, url: this.url, headers: this.headers }) }
    setRequestHeader(name, value) { this.headers[name] = value }
  }

  const jqueryListeners = []
  const readyListeners = []

  const document = {
    cookie,
    addEventListener: (type, fn) => {
      if (type === 'submit') submitListeners.push(fn)
      if (type === 'DOMContentLoaded') readyListeners.push(fn)
    },
    createElement: () => ({ tagName: 'INPUT' }),
  }

  // Stand-in for jQuery's delegated binding: jQuery(document).on('submit', 'form', fn).
  const jQuery = () => ({ on: (type, selector, fn) => { if (type === 'submit') jqueryListeners.push(fn) } })

  const window = { location: { origin: 'http://dev6.local' }, XMLHttpRequest: FakeXHR, document, jQuery }
  window.window = window

  const context = vm.createContext({ window, document, XMLHttpRequest: FakeXHR })
  vm.runInContext(source, context)

  return {
    sent,
    /** Fire a request the way any back-office code would. */
    request(method, url) { const xhr = new FakeXHR(); xhr.open(method, url); xhr.send(); return xhr.headers },
    /** Fire the delegated submit handler on a fake form, the way the browser would. */
    submit(form) { submitListeners.forEach((fn) => fn({ target: form })) },
    /** jQuery's .submit() trigger: only jQuery's own handlers run, no native event. */
    jquerySubmit(form) { jqueryListeners.forEach((fn) => fn.call(form)) },
    /** The page finished parsing, so jQuery is now on the page. */
    ready() { readyListeners.forEach((fn) => fn()) },
  }
}

function form(method) {
  const children = []
  return {
    tagName: 'FORM',
    children,
    getAttribute: () => method,
    querySelector: (selector) => children.find((c) => `input[name="${c.name}"]` === selector) ?? null,
    appendChild: (child) => children.push(child),
  }
}

console.log('\n--- XMLHttpRequest (covers jQuery AJAX too: jQuery uses XHR underneath) ---')

const b = browser(`melis_csrf=${TOKEN}`)
check('POST carries the token', b.request('POST', '/melis/tooluser/saveUser')['X-Melis-Csrf'], TOKEN)
check('PUT carries the token', b.request('PUT', '/melis/react-api/users/2')['X-Melis-Csrf'], TOKEN)
check('DELETE carries the token', b.request('DELETE', '/melis/react-api/users/2')['X-Melis-Csrf'], TOKEN)
check('lowercase "post" is still a write', b.request('post', '/melis/tooluser/saveUser')['X-Melis-Csrf'], TOKEN)
check('an absolute URL to our own host carries it', b.request('POST', 'http://dev6.local/melis/x')['X-Melis-Csrf'], TOKEN)

check('GET does not', b.request('GET', '/melis/react-api/users')['X-Melis-Csrf'], undefined)
check('HEAD does not', b.request('HEAD', '/melis/x')['X-Melis-Csrf'], undefined)
check('a request with no method at all does not', b.request(undefined, '/melis/x')['X-Melis-Csrf'], undefined)
check('THE LEAK: another host never receives the token', b.request('POST', 'https://evil.example/collect')['X-Melis-Csrf'], undefined)
check('a look-alike host does not either', b.request('POST', 'http://dev6.local.evil.example/x')['X-Melis-Csrf'], undefined)

check('the header is set exactly once', Object.keys(b.request('POST', '/melis/x')).length, 1)
check('the request is still sent', b.sent.length > 0, true)

const none = browser('other=1')
check('no cookie: nothing is added, the call still goes out', none.request('POST', '/melis/x')['X-Melis-Csrf'], undefined)

const encoded = browser('melis_csrf=' + encodeURIComponent('ab+cd'))
check('a percent-encoded cookie is decoded', encoded.request('POST', '/melis/x')['X-Melis-Csrf'], 'ab+cd')

const among = browser(`foo=1; melis_csrf=${TOKEN}; bar=2`)
check('the cookie is found among others', among.request('POST', '/melis/x')['X-Melis-Csrf'], TOKEN)

const lookalike = browser(`not_melis_csrf=wrong; melis_csrf=${TOKEN}`)
check('a look-alike cookie name is not picked up', lookalike.request('POST', '/melis/x')['X-Melis-Csrf'], TOKEN)

console.log('\n--- classic form post ---')

const f = browser(`melis_csrf=${TOKEN}`)

const posted = form('POST')
f.submit(posted)
check('a POST form receives the hidden field', posted.children.map((c) => [c.name, c.value, c.type]), [['melis_csrf', TOKEN, 'hidden']])

f.submit(posted)
check('submitting twice does not add it twice', posted.children.length, 1)

const got = form('GET')
f.submit(got)
check('a GET form receives nothing', got.children.length, 0)

const notAForm = { tagName: 'DIV', children: [] }
f.submit(notAForm)
check('a non-form target is ignored', notAForm.children.length, 0)

const noCookie = browser('other=1')
const orphan = form('POST')
noCookie.submit(orphan)
check('no cookie: no field, and the submit is not blocked', orphan.children.length, 0)

// A form sent through jQuery's .submit() trigger runs jQuery's handlers only - a native listener
// never sees it - which is how most of the legacy back-office submits.
const jq = browser(`melis_csrf=${TOKEN}`)
jq.ready()
const viaJquery = form('POST')
jq.jquerySubmit(viaJquery)
check('a jQuery-triggered submit is stamped too', viaJquery.children.map((c) => [c.name, c.value]), [['melis_csrf', TOKEN]])

const both = form('POST')
jq.submit(both)
jq.jquerySubmit(both)
check('a form reaching both bindings is stamped once', both.children.length, 1)

console.log(`\n${ran} checks, ${failures} failure(s)`)
process.exit(failures === 0 ? 0 : 1)
