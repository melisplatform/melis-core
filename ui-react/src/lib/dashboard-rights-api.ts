/**
 * Dashboard-plugins rights (core section <melis_dashboardplugin>).
 *
 * The list is AUTHORITATIVE and module-ordered (MelisCore → MelisCms → other modules), served by
 *   GET /melis/react-api/rights/dashboard-plugins
 * which reuses the legacy MelisCoreDashboardPluginsRightsService. Items: { key, title }.
 *
 * XML model: `<melis_dashboardplugin><id>melis_dashboardplugin_root</id></melis_dashboardplugin>`
 * grants ALL plugins; otherwise each `<id>PluginKey</id>` grants that plugin.
 */

export const DASHBOARD_ALL = 'melis_dashboardplugin_root'

export interface DashboardPluginRight {
  key: string
  title: string
  /** Owning module (controller namespace), e.g. "MelisCore", "MelisCms". For grouping. */
  module: string
}

/** Fetch the dashboard plugins for the rights editor, in module-merge order. */
export async function fetchDashboardPluginRights(): Promise<DashboardPluginRight[]> {
  try {
    const res = await fetch('/melis/react-api/rights/dashboard-plugins', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'include',
    })
    if (!res.ok) return []
    const data = await res.json()
    const raw: unknown[] = Array.isArray(data?.data) ? data.data : []
    return raw
      .map((n) => {
        const o = n as { key?: string; title?: string; module?: string }
        return o.key ? { key: o.key, title: o.title ?? o.key, module: o.module ?? '' } : null
      })
      .filter((n): n is DashboardPluginRight => n !== null)
  } catch {
    return []
  }
}

/** Read the granted dashboard-plugin ids from a usr_rights XML. */
export function parseDashboardRights(xml: string): Set<string> {
  const ids = new Set<string>()
  if (!xml?.trim()) return ids
  try {
    const doc = new DOMParser().parseFromString(xml, 'text/xml')
    const el = doc.querySelector('melis_dashboardplugin')
    if (!el) return ids
    Array.from(el.childNodes)
      .filter((n) => n.nodeName === 'id')
      .forEach((n) => { const v = n.textContent?.trim(); if (v) ids.add(v) })
  } catch { /* malformed */ }
  return ids
}

/**
 * Announcement is granted to EVERY user, unconditionally — which is why it carries
 * `exclude_rights_display` and never appears in the rights tree (there is nothing to tick). Legacy
 * re-adds it on every save (MelisCoreDashboardPluginsRightsService::createXmlRightsValues), so we
 * must too: saving rights from React would otherwise drop it from the XML, and the dashboard's
 * rights filter would then hide the widget for that user.
 */
const ALWAYS_GRANTED = 'MelisCoreDashboardAnnouncementPlugin'

/** Serialize granted plugin ids (DASHBOARD_ALL collapses to just the root). */
export function dashboardRightsIds(checked: Set<string>): string[] {
  const ids = checked.has(DASHBOARD_ALL)
    ? [DASHBOARD_ALL]
    : Array.from(checked).filter((k) => k !== DASHBOARD_ALL)
  // Legacy appends it even alongside the root wildcard — keep the XML byte-identical.
  return ids.includes(ALWAYS_GRANTED) ? ids : [...ids, ALWAYS_GRANTED]
}
