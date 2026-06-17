import type { LucideIcon } from 'lucide-react'

import type { I18nKey } from '@/i18n/dictionaries'

export interface NavItem {
  to: string
  icon: LucideIcon
  labelKey: I18nKey
  /** Overrides labelKey when provided (e.g. API-sourced items). */
  label?: string
}

export interface NavSection {
  titleKey: I18nKey
  /** Overrides titleKey when provided (e.g. API-sourced sections). */
  titleLabel?: string
  items: NavItem[]
}

/**
 * Navigation is sourced dynamically from the backend (`/melis/react-api/menu`,
 * filtered by rights) and from runtime module bricks — there is no hardcoded
 * section list here. Kept empty so the dynamic menu is the single source of truth.
 */
export const NAV_SECTIONS: NavSection[] = []

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items)

/** Clé i18n du titre de page pour un chemin donné (vide tant que la nav est dynamique). */
export function labelKeyForPath(path: string): I18nKey | undefined {
  return NAV_ITEMS.find((i) => i.to === path)?.labelKey
}
