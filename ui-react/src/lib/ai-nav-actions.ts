/**
 * Shell-side handlers for the AI chat's closed-loop navigation actions.
 *
 * The engine (melis-ai-engine) dispatches `JS_ACTION::…` callbackFunctions from tool_results
 * to `window.melisReactActionMap`; THIS module — owned by the shell — implements those
 * handlers, because navigation and DOM perception are the shell's concern. Each handler
 * drives React Router + the tool-routes registry + the tab store, then returns a one-line
 * "[BROWSER RESULT]" observation of what actually rendered so the model can decide the next
 * step (the closed loop; see the backend clientObservation injection in the Claude engine).
 *
 * Pure helpers live here; the live wiring (navigate / openTab / current menu) is bound by the
 * <AiNavActionsBridge> component which registers the handlers on the window contract.
 */

import type { NavNode } from '@/hooks/useNavMenu'

// ─── A resolvable tool derived from the live nav tree ─────────────────────────

export interface NavTool {
  label: string
  route: string
  forwardKey: string | null
  melisKey: string | null
}

/** Flatten the nav tree to every clickable tool (isTool with a route). */
export function flattenTools(nodes: NavNode[]): NavTool[] {
  const out: NavTool[] = []
  const walk = (list: NavNode[]) => {
    for (const n of list) {
      if (n.isTool && n.to) {
        const fk = n.forward ? `${n.forward.module ?? ''}/${n.forward.controller ?? ''}` : null
        out.push({ label: n.label, route: n.to, forwardKey: fk, melisKey: null })
      }
      if (n.children.length) walk(n.children)
    }
  }
  walk(nodes)
  return out
}

// ─── Fuzzy matching (ported from generalChat.js melisNavScore) ────────────────

function norm(s: unknown): string {
  return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/** 0..100 fuzzy score between a rendered candidate label and the user's phrase. */
export function scoreMatch(candidate: string, phrase: string): number {
  const c = norm(candidate), p = norm(phrase)
  if (!c || !p) return 0
  if (c === p) return 100
  if (c.indexOf(p) !== -1) return 80
  if (p.indexOf(c) !== -1) return 70
  const cw = c.split(' '), pw = p.split(' ')
  let hits = 0
  pw.forEach(w => { if (w && cw.indexOf(w) !== -1) hits++ })
  if (pw.length && hits === pw.length) return 75
  if (hits > 0) return 40 + hits * 5
  return 0
}

/**
 * Resolve a tool from the nav tree by (in priority) melisKey, then fuzzy label/name.
 * `melisKey` matches the tool-routes registry (route→melisKey); name matching requires a
 * real score (≥40) so a weak guess doesn't open the wrong tool.
 */
export function resolveTool(
  tools: NavTool[],
  hint: { melisKey?: string; name?: string },
): NavTool | null {
  if (hint.melisKey) {
    const byKey = tools.find(t => t.melisKey && t.melisKey === hint.melisKey)
    if (byKey) return byKey
  }
  const name = hint.name?.trim()
  if (name) {
    let best: NavTool | null = null
    let bestScore = 39 // require a genuine match, not a weak guess
    for (const t of tools) {
      const sc = scoreMatch(t.label, name)
      if (sc > bestScore) { bestScore = sc; best = t }
    }
    return best
  }
  return null
}

// ─── Perception: wait for render + snapshot ───────────────────────────────────

/** Resolve after a short settle delay. */
export function settle(ms = 300): Promise<void> {
  return new Promise<void>(res => setTimeout(() => res(), ms))
}

/**
 * Wait until the shell's <main> renders real tool content (table / form / card / iframe),
 * MutationObserver-backed with a timeout. Resolves (never rejects) so the snapshot can always
 * report — the absence of content is itself signal for the model.
 */
export function waitForContent(timeoutMs = 6000): Promise<void> {
  const root = document.querySelector('main') ?? document.body
  const SEL = 'table, form, .dataTables_wrapper, .card, .panel, iframe'
  return new Promise<void>(resolve => {
    if (root.querySelector(SEL)) { resolve(); return }
    let done = false
    const finish = () => { if (done) return; done = true; obs.disconnect(); clearTimeout(t); resolve() }
    const obs = new MutationObserver(() => { if (root.querySelector(SEL)) finish() })
    obs.observe(root, { childList: true, subtree: true, attributes: true })
    const t = setTimeout(finish, timeoutMs)
  }).then(() => settle(300))
}

export interface NavSnapshot {
  activeTool: string
  listPresent: boolean
  rowCount: number
  buttons: string[]
  modalOpen: boolean
}

/** The DOM to inspect: the shell <main>, plus the active same-origin zone iframe if present. */
function perceptionRoots(): (Document | HTMLElement)[] {
  const roots: (Document | HTMLElement)[] = []
  const main = document.querySelector('main')
  if (main) roots.push(main as HTMLElement)
  // A legacy tool renders inside a zone iframe (same-origin: /melis/react-tool-page). Reach into
  // its document so list/buttons are perceived just like a native React tool.
  document.querySelectorAll('iframe').forEach(f => {
    const iframe = f as HTMLIFrameElement
    if (iframe.offsetParent === null) return // hidden pooled iframe — skip
    try {
      const doc = iframe.contentDocument
      if (doc && doc.body) roots.push(doc)
    } catch { /* cross-origin — unreachable, ignore */ }
  })
  return roots
}

/** Capture what the platform renders right now, mirroring the legacy melisNavCaptureSnapshot. */
export function captureSnapshot(activeTool: string): NavSnapshot {
  const roots = perceptionRoots()
  const buttons: string[] = []
  let rowCount = 0
  let listPresent = false
  let modalOpen = false

  for (const root of roots) {
    const scope: ParentNode = root
    scope.querySelectorAll('button, a.btn, .btn').forEach(el => {
      const t = (el.textContent || '').trim().replace(/\s+/g, ' ')
      if (t && t.length <= 40 && buttons.indexOf(t) === -1) buttons.push(t)
    })
    const rows = scope.querySelectorAll('table tbody tr')
    if (rows.length) rowCount += rows.length
    if (scope.querySelector('table, .dataTables_wrapper')) listPresent = true
    if (scope.querySelector('.modal.show, [role="dialog"][data-state="open"]')) modalOpen = true
  }

  return { activeTool, listPresent, rowCount, buttons: buttons.slice(0, 15), modalOpen }
}

/** Build the one-line observation string the model expects (matches legacy format). */
export function observationText(desc: string, ok: boolean, snap?: NavSnapshot): string {
  const parts = [(ok ? 'OK: ' : 'FAILED: ') + desc]
  if (snap) {
    if (snap.activeTool) parts.push('active tool: ' + snap.activeTool)
    if (snap.listPresent) parts.push(`list present (${snap.rowCount} row${snap.rowCount === 1 ? '' : 's'} visible)`)
    if (snap.buttons.length) parts.push('buttons: ' + snap.buttons.join(', '))
    if (snap.modalOpen) parts.push('a modal is open')
  }
  return parts.join('; ')
}

// ─── In-tool actions (clickButton / filterList / editRow) ─────────────────────
//
// The open tool is either a native React page in <main> or a legacy tool inside a
// same-origin zone iframe. These operate on the ACTIVE root and use realm-aware DOM
// access so a value set / event fired lands in the right window (parent vs iframe),
// which also makes React-controlled inputs update (native setter + bubbling 'input').

/** The single root the user's current tool renders in: the visible zone iframe's doc, else <main>. */
export function activeToolRoot(): Document | HTMLElement {
  const frames = document.querySelectorAll('iframe')
  for (const f of Array.from(frames)) {
    const iframe = f as HTMLIFrameElement
    if (iframe.offsetParent === null) continue // hidden pooled iframe
    try {
      const doc = iframe.contentDocument
      if (doc && doc.body) return doc
    } catch { /* cross-origin — ignore */ }
  }
  return (document.querySelector('main') as HTMLElement) ?? document.body
}

/** The window that owns a root — needed to build events / read prototypes in the right realm. */
function realmWindow(root: Document | HTMLElement): Window {
  const doc = root instanceof Document ? root : root.ownerDocument
  return doc.defaultView ?? window
}

/** Resolve with the first element matching `selector` under root; reject loudly on timeout. */
export function waitFor(selector: string, root: Document | HTMLElement, timeoutMs = 8000): Promise<Element> {
  return new Promise<Element>((resolve, reject) => {
    const hit = root.querySelector(selector)
    if (hit) { resolve(hit); return }
    let done = false
    const obs = new MutationObserver(() => {
      const m = root.querySelector(selector)
      if (m) { done = true; obs.disconnect(); clearTimeout(t); resolve(m) }
    })
    obs.observe(root instanceof Document ? root.documentElement : root, { childList: true, subtree: true, attributes: true })
    const t = setTimeout(() => {
      if (done) return
      obs.disconnect()
      reject(new Error('timed out waiting for the page to render'))
    }, timeoutMs)
  })
}

function isVisible(el: Element): boolean {
  return !!(el as HTMLElement).offsetParent || (el as HTMLElement).getClientRects().length > 0
}

function isDestructive(el: Element): boolean {
  const sig = (el.getAttribute('class') || '') + ' ' + (el.innerHTML || '')
  return /delete|remove|danger|trash|fa-times|fa-trash|fa-ban/i.test(sig)
}

/** Find the best-matching clickable control (button / .btn / tab / data-melisKey) for `match`. */
function findButton(root: Document | HTMLElement, match: string): Element | null {
  const wantsAdd = /\b(add|new|create)\b/i.test(match || '')
  let best: Element | null = null
  let bestScore = 24
  const sel = 'button, a.btn, .btn, [data-melisKey], a[data-bs-toggle="tab"], a[data-toggle="tab"], [role="tab"]'
  root.querySelectorAll(sel).forEach(el => {
    if (!isVisible(el) || isDestructive(el)) return
    const text = (el.textContent || '').trim() || el.getAttribute('title') || el.getAttribute('data-original-title') || ''
    const mk = el.getAttribute('data-melisKey') || ''
    let sc = Math.max(scoreMatch(text, match), scoreMatch(mk, match))
    const sig = (el.getAttribute('class') || '') + ' ' + mk + ' ' + text
    if (wantsAdd && /fa-plus|_add\b|\badd\b|\bnew\b|\bcreate\b/i.test(sig)) sc += 60
    if (sc > bestScore) { bestScore = sc; best = el }
  })
  return best
}

/** Set an input's value the React-controlled way, in the element's own realm, and fire events. */
function setSearchValue(input: HTMLInputElement, value: string): void {
  const w = realmWindow(input.ownerDocument) as Window & {
    HTMLInputElement: typeof HTMLInputElement; Event: typeof Event
  }
  const proto = w.HTMLInputElement?.prototype ?? HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  if (setter) setter.call(input, value)
  else input.value = value
  const EventCtor = w.Event ?? Event
  input.dispatchEvent(new EventCtor('input', { bubbles: true }))
  input.dispatchEvent(new EventCtor('change', { bubbles: true }))
  input.dispatchEvent(new EventCtor('keyup', { bubbles: true }))
}

/** Type into the tool's list search box. Returns false if none found. */
function typeSearch(root: Document | HTMLElement, query: string): boolean {
  const sel = 'input[type="search"], .dataTables_filter input, .dt-search input, ' +
    'input[placeholder*="search" i], input[placeholder*="recherch" i], input[aria-label*="search" i]'
  const input = root.querySelector(sel) as HTMLInputElement | null
  if (!input) return false
  setSearchValue(input, query)
  return true
}

const LIST_SEL = 'table, .dataTables_wrapper, .dt-container, [role="table"]'

/** Locate the target list row by record id, or the single/first meaningful row after a filter. */
function findRow(root: Document | HTMLElement, recId: string | null, query: string): Element | null {
  if (recId) {
    const byId = root.querySelector(`tr[id="${recId}"]`)
    if (byId) return byId
  }
  const rows = Array.from(root.querySelectorAll('table tbody tr, [role="rowgroup"] [role="row"]')).filter(r => {
    const cells = r.querySelectorAll('td, [role="cell"], [role="gridcell"]')
    return cells.length >= 1 && !/no .*data|no matching|nothing found|empty|aucun/i.test(r.textContent || '')
  })
  if (query) {
    const q = query.toLowerCase()
    const match = rows.find(r => (r.textContent || '').toLowerCase().includes(q))
    if (match) return match
    if (rows.length === 1) return rows[0]
  }
  return rows[0] ?? null
}

/** Find the edit control inside a row (edit icon/link/button), else the row itself as fallback. */
function findRowEdit(row: Element): Element {
  const candidates = Array.from(row.querySelectorAll('a, button, .btn, [data-melisKey], i, svg'))
  // Prefer an explicit edit signal, avoiding destructive controls.
  const edit = candidates.find(el => {
    if (isDestructive(el)) return false
    const sig = (el.getAttribute('class') || '') + ' ' + (el.getAttribute('title') || '') + ' ' +
      (el.getAttribute('data-melisKey') || '') + ' ' + (el.textContent || '')
    return /edit|pencil|modif|fa-pen|fa-edit|_edit\b|btn.*edit/i.test(sig)
  })
  if (edit) return edit
  const firstAction = candidates.find(el => !isDestructive(el) && (el.tagName === 'A' || el.tagName === 'BUTTON'))
  return firstAction ?? row
}

/** Native click via the element's own realm so framework data-apis fire (Bootstrap, React). */
function realClick(el: Element): void {
  ;(el as HTMLElement).click()
}

/**
 * Click a button/tab named `match` inside the active tool. Resolves with an observation.
 */
export async function doClickButton(match: string): Promise<string> {
  const root = activeToolRoot()
  try { await waitFor('button, a.btn, .btn, form, table', root, 6000) } catch { /* proceed with a snapshot anyway */ }
  const btn = findButton(root, match)
  if (!btn) {
    return observationText(`no "${match}" button found in the open tool`, false, captureSnapshot(''))
  }
  const label = (btn.textContent || '').trim() || match
  realClick(btn)
  await settle(500)
  return observationText(`clicked "${label}"`, true, captureSnapshot(''))
}

/** Type `query` into the open list's search box. Resolves with an observation. */
export async function doFilterList(query: string): Promise<string> {
  const root = activeToolRoot()
  try { await waitFor(LIST_SEL, root, 8000) } catch {
    return observationText('no list is open to filter', false, captureSnapshot(''))
  }
  if (!typeSearch(root, String(query ?? ''))) {
    return observationText('no search box found to filter the list', false, captureSnapshot(''))
  }
  await settle(500)
  return observationText(`filtered list to "${query}"`, true, captureSnapshot(''))
}

/** Locate a record in the open list and click its edit control. Resolves with an observation. */
export async function doEditRow(step: { recordId?: string; query?: string }): Promise<string> {
  const root = activeToolRoot()
  const recId = step.recordId ? String(step.recordId) : null
  const query = step.query != null && String(step.query) !== '' ? String(step.query) : (recId ?? '')
  try { await waitFor(LIST_SEL, root, 8000) } catch {
    return observationText('no list is open to edit a record in', false, captureSnapshot(''))
  }
  // Filter first when the target isn't already visible (bare id can hide unrelated columns).
  const existing = recId ? root.querySelector(`tr[id="${recId}"]`) : null
  if (!existing && query) { typeSearch(root, query); await settle(500) }

  let row = findRow(root, recId, query)
  if (!row) {
    // Give the filtered list a moment to settle, then retry once.
    await settle(600)
    row = findRow(root, recId, query)
  }
  if (!row) {
    return observationText(`record ${recId || `"${query}"`} did not appear in the list`, false, captureSnapshot(''))
  }
  realClick(findRowEdit(row))
  await settle(700)
  return observationText(`opened record ${recId || `"${query}"`} for editing`, true, captureSnapshot(''))
}
