/** Helpers partagés des onglets GDPR. */

export const GDPR_TOOL_KEY = 'melis_core_gdpr'

/** Toast vers la chrome React (cf. components/Notifications.tsx). */
export function gdprNotify(kind: 'ok' | 'ko', title: string, message: string) {
  window.postMessage({ __melisNotif: true, kind, title, message }, '*')
}
