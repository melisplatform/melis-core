/**
 * GridStack auto-scroll during a DRAG, driven by the POINTER instead of the dragged tile.
 *
 * GridStack 12 decides to auto-scroll from `DDDraggable._getClipping(helper, scrollContainer)`: as long as
 * the dragged tile is CLIPPED by the scroll container (or the viewport), it scrolls until the whole tile is
 * visible — wherever the pointer is. A tall tile whose bottom is below the fold therefore sends the page
 * down as soon as its drag starts, a 1px twitch on the handle being enough: grab it to move it a little and
 * the dashboard runs away under the cursor.
 *
 * Both the start of the auto-scroll (`updateScrollPosition`) and every animation frame (`_autoScrollTick`)
 * ask `_getClipping`, so it is replaced by a version measuring how deep the POINTER is inside a band along
 * the top / bottom edge of the visible scroll area: 0 elsewhere (no scrolling), negative near the top
 * (scroll up), positive near the bottom (scroll down), the speed growing towards the edge. GridStack's own
 * animation loop, speed cap and stop conditions stay untouched. Idempotent.
 */
type PointerLike = { clientY: number }
type RectLike = { top: number; bottom: number }
/** The DDDraggable members we rely on (internal API of gridstack 12, cf. dist/dd-draggable.js). */
type DraggableProto = {
  lastDrag?: PointerLike
  _getClipping: (el: unknown, scrollEl: { getBoundingClientRect: () => RectLike }) => number
}

/** Height of the band along the top / bottom edge where the pointer triggers the auto-scroll. */
const EDGE_PX = 40
const PATCHED = Symbol.for('melis.gridstack.dragScrollByPointer')

/** `target` is GridStack's `DDDraggable` class (gridstack/dist/dd-draggable). */
export function installDragScrollByPointer(target: { prototype: object }): void {
  const proto = target.prototype as DraggableProto & { [PATCHED]?: true }
  if (proto[PATCHED]) return
  proto[PATCHED] = true
  proto._getClipping = function (this: DraggableProto, _el, scrollEl) {
    const pointer = this.lastDrag
    if (!pointer) return 0
    const rect = scrollEl.getBoundingClientRect()
    const viewportH = window.innerHeight || document.documentElement.clientHeight
    // visible part of the scroll container (the document's own rect spans the whole page)
    const top = Math.max(rect.top, 0)
    const bottom = Math.min(rect.bottom, viewportH)
    if (pointer.clientY > bottom - EDGE_PX) return pointer.clientY - (bottom - EDGE_PX)
    if (pointer.clientY < top + EDGE_PX) return pointer.clientY - (top + EDGE_PX)
    return 0
  }
}
