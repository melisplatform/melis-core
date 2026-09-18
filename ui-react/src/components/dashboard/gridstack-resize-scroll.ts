/**
 * GridStack auto-scroll during a RESIZE, restricted to scrolling DOWN (Mantis #0011019).
 *
 * While a tile is being resized, GridStack calls `Utils.updateScrollResize(event, el, cellHeight)`
 * on every pointer move: if the pointer is within one cell height of the scroll container's TOP
 * edge it scrolls the container up, within one cell of the BOTTOM edge it scrolls down. Scrolling
 * down is what you want when you grow a tile past the bottom of the screen. Scrolling up is not:
 * shrinking a tile means dragging its bottom-right handle UPWARD, and as soon as the pointer gets
 * near the top of the viewport the page runs away under the cursor — the handle you are holding
 * moves, the tile keeps changing size, and landing on the wanted height becomes a fight.
 *
 * GridStack exposes no option for this (`scroll` only exists for drag), so the static helper is
 * replaced by a version that keeps the bottom-edge branch and drops the top-edge one. Idempotent.
 */
type ScrollEl = { clientHeight: number; getBoundingClientRect: () => { top: number }; scrollBy: (opts: ScrollToOptions) => void }
/** The two GridStack `Utils` statics we rely on — `any`-typed parameters on purpose: GridStack declares
 *  them with DOM types (`HTMLElement`, `MouseEvent`) and `typeof Utils` must stay assignable here. */
type UtilsLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getScrollElement: (el?: any) => ScrollEl
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateScrollResize: (event: any, el: any, distance: number) => void
}

const PATCHED = Symbol.for('melis.gridstack.resizeScrollDownOnly')

/** `target` is GridStack's `Utils` class — typed as `object` because its .d.ts does not declare these
 *  two statics (they exist at runtime, cf. dist/utils.js). */
export function installResizeScrollDownOnly(target: object): void {
  const utils = target as UtilsLike & { [PATCHED]?: true }
  if (utils[PATCHED]) return
  utils[PATCHED] = true
  utils.updateScrollResize = (event: { clientY: number }, el: unknown, distance: number) => {
    const scrollEl = utils.getScrollElement(el)
    const height = scrollEl.clientHeight
    // same viewport/offset arithmetic as GridStack's original (#1727 / #1745)
    const offsetTop = scrollEl === utils.getScrollElement() ? 0 : scrollEl.getBoundingClientRect().top
    const pointerPosY = event.clientY - offsetTop
    const bottom = pointerPosY > height - distance
    if (bottom) scrollEl.scrollBy({ behavior: 'smooth', top: distance - (height - pointerPosY) })
    // pointer near the TOP edge: do nothing — no upward auto-scroll while resizing
  }
}
