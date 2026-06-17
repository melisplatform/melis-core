/** Formate un nombre d'heures écoulées en libellé relatif localisé
 *  (« il y a 2 heures » / « 2 hours ago »). */
export function formatRelativeHours(hoursAgo: number, lang: string): string {
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  if (hoursAgo < 24) return rtf.format(-Math.max(1, Math.round(hoursAgo)), 'hour')
  return rtf.format(-Math.round(hoursAgo / 24), 'day')
}

/** Formate un entier selon la locale (séparateurs de milliers). */
export function formatNumber(value: number, lang: string): string {
  return new Intl.NumberFormat(lang).format(value)
}
