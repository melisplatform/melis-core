// Couleur de section Melis (Core / Cms / Marketing / Commerce / Marketplace / IA) — les MÊMES
// teintes que les icônes « M » de melis-icons.tsx, pour les liserés et aplats qui accompagnent
// l'icône (fiche de widget du catalogue d'ajout, cf. WidgetAddModal). Fichier SÉPARÉ de
// melis-icons.tsx : ce dernier n'exporte que des composants (règle react-refresh
// only-export-components), une fonction utilitaire n'y a pas sa place.
//
// ⚠️ Teintes dupliquées avec makeSolidM(...) dans melis-icons.tsx — les faire évoluer ensemble.
// L'IA (icône en dégradé rose → violet → cyan) est ramenée à son violet médian.
const SECTION_COLORS = {
  ai: '#9b5cf6',
  core: '#f97316',
  cms: '#22c55e',
  marketing: '#a855f7',
  commerce: '#3b82f6',
  marketplace: '#ef4444',
  default: '#6b7280',
} as const

/** Couleur de la section — MÊME correspondance nom/clé que getMelisIcon (melis-icons.tsx), pour
 *  que l'icône et la couleur d'une même section ne divergent jamais. Hex utilisable en CSS inline. */
export function getMelisColor(name: string, key = ''): string {
  const n = (name + ' ' + key).toLowerCase()
  if (n.includes('ai'))                                          return SECTION_COLORS.ai
  if (n.includes('core'))                                        return SECTION_COLORS.core
  if (n.includes('cms'))                                         return SECTION_COLORS.cms
  if (n.includes('marketing'))                                   return SECTION_COLORS.marketing
  if (n.includes('commerce'))                                    return SECTION_COLORS.commerce
  if (n.includes('marketplace') || n.includes('market_place'))  return SECTION_COLORS.marketplace
  return SECTION_COLORS.default
}
