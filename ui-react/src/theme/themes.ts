/** Registre des thèmes disponibles. Ajouter un thème = une entrée ici + un
 *  bloc `[data-theme='<id>']` dans src/index.css. */

export type ThemeId = 'platform' | 'studio'

export interface ThemeMeta {
  id: ThemeId
  /** Libellé court affiché dans le sélecteur. */
  label: string
  /** Sous-titre / origine de la charte. */
  description: string
  /** Couleur d'accent pour la pastille du sélecteur. */
  swatch: string
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'platform',
    label: 'Platform',
    description: 'Charte Melis Platform',
    swatch: '#ff0000',
  },
  {
    id: 'studio',
    label: 'Studio AI',
    description: 'Charte Melis Studio AI',
    swatch: '#2f6bff',
  },
]

export const DEFAULT_THEME: ThemeId = 'platform'
export const THEME_STORAGE_KEY = 'melis-ui-theme'

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((t) => t.id === value)
}
