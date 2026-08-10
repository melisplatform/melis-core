/**
 * Pages-rights tree (CMS contribution to the user-rights editor).
 *
 * Reuses the LEGACY rights endpoint (no backend change):
 *   GET /melis/MelisCms/TreeSites/getTreePagesForRightsManagement?nodeId=<id>
 *     nodeId = 'meliscms_pages_root' → site roots
 *     nodeId = '<pageId>'           → that page's children
 * The page tree is user-independent (the checked state comes from the usr_rights XML,
 * section <meliscms_pages>); we only use this endpoint to load the hierarchy lazily.
 *
 * XML model (<meliscms_pages>): an <id>-1</id> grants ALL pages; an <id>N</id> grants page N
 * AND its descendants (the backend resolves access via the page breadcrumb).
 */

export const PAGES_RIGHTS_ROOT = 'meliscms_pages_root'
/** Sentinel page id meaning "all pages". */
export const ALL_PAGES = -1

export interface PageRightNode {
  /** Page id. */
  pageId: number
  /** Display label, "<id> - <name>". */
  title: string
  /** True when the page has children (show a caret + lazy-load). */
  lazy: boolean
  /** Legacy FontAwesome icon class, e.g. "fa fa-home". */
  icon?: string
}

/** Fetch the direct children of <nodeId> (a page id, or PAGES_RIGHTS_ROOT for the site roots). */
export async function fetchPagesRightNodes(nodeId: number | string): Promise<PageRightNode[]> {
  const node = nodeId === PAGES_RIGHTS_ROOT ? PAGES_RIGHTS_ROOT : String(nodeId)
  try {
    const res = await fetch(
      `/melis/MelisCms/TreeSites/getTreePagesForRightsManagement?nodeId=${encodeURIComponent(node)}`,
      { headers: { 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'include' },
    )
    if (!res.ok) return []
    const data = await res.json()
    const raw: unknown[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
    return raw
      .map((n) => {
        const o = n as { lazy?: boolean; title?: string; iconTab?: string; melisData?: { page_id?: number } }
        const pageId = Number(o.melisData?.page_id)
        if (!Number.isFinite(pageId)) return null
        return { pageId, title: o.title ?? String(pageId), lazy: !!o.lazy, icon: o.iconTab } as PageRightNode
      })
      .filter((n): n is PageRightNode => n !== null)
  } catch {
    return []
  }
}

/**
 * Fetch the union of ancestor page ids (each page + its breadcrumb up to the root) for the given
 * granted page ids. Used to show a tri-state DASH on a parent page whose descendant is granted —
 * works even when that parent is collapsed (the breadcrumb is resolved server-side). ALL_PAGES and
 * non-positive ids are ignored (they have no ancestors).
 */
export async function fetchPagesAncestors(ids: number[]): Promise<Set<number>> {
  const real = ids.filter((id) => id > 0)
  if (real.length === 0) return new Set()
  try {
    const res = await fetch(
      `/melis/MelisCms/TreeSites/getPagesAncestorsForRights?ids=${real.join(',')}`,
      { headers: { 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'include' },
    )
    if (!res.ok) return new Set()
    const data = await res.json()
    const arr: unknown[] = Array.isArray(data?.data?.ancestorIds) ? data.data.ancestorIds : []
    return new Set(arr.map(Number).filter((n) => Number.isFinite(n)))
  } catch {
    return new Set()
  }
}

/** Read the granted page ids from a usr_rights XML (<meliscms_pages><id>…</id></meliscms_pages>). */
export function parsePagesRights(xml: string): Set<number> {
  const ids = new Set<number>()
  if (!xml?.trim()) return ids
  try {
    const doc = new DOMParser().parseFromString(xml, 'text/xml')
    const el = doc.querySelector('meliscms_pages')
    if (!el) return ids
    Array.from(el.childNodes)
      .filter((n) => n.nodeName === 'id')
      .forEach((n) => {
        const v = Number(n.textContent?.trim())
        if (Number.isFinite(v)) ids.add(v)
      })
  } catch { /* malformed */ }
  return ids
}

/** Serialize granted page ids into the <meliscms_pages> ids list (ALL_PAGES collapses to just -1). */
export function pagesRightsIds(checked: Set<number>): number[] {
  if (checked.has(ALL_PAGES)) return [ALL_PAGES]
  return Array.from(checked).filter((id) => id !== ALL_PAGES)
}
