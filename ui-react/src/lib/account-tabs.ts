/**
 * Point d'extension MODULAIRE des onglets de « Mon compte ».
 *
 * MelisCore fournit l'onglet « Profil » nativement. Les autres onglets (ex. « Melis Messenger »,
 * qui appartient au module melis-messenger) sont ajoutés au RUNTIME par la brique du module —
 * exactement comme les encarts de l'outil News (`__melisNewsExtensions`). L'onglet n'apparaît donc
 * que si le module est actif (sa brique n'est chargée que dans ce cas + garde `__melisIsModuleActive`).
 *
 * La brique pousse un `AccountTabDef` dans `window.__melisAccountTabs` puis dispatch
 * `ACCOUNT_TABS_EVENT` ; AccountPage lit le tableau et se re-render sur l'événement.
 * React étant externalisé (global de l'hôte), la brique peut créer des éléments React (`render`).
 */
import type { ReactNode } from 'react'

export interface AccountTabDef {
  /** Identifiant stable (ex. 'messenger'). */
  id: string
  /** Libellé de l'onglet (déjà traduit par le fournisseur). */
  label: string
  /** Icône optionnelle (élément React ; la brique n'a pas lucide → emoji/SVG inline possible). */
  icon?: ReactNode
  /** Rendu du contenu de l'onglet. */
  render: () => ReactNode
  /** Ordre d'affichage (défaut 100). */
  order?: number
}

declare global {
  interface Window {
    __melisAccountTabs?: AccountTabDef[]
  }
}

export const ACCOUNT_TABS_EVENT = 'melis-account-tabs-changed'

export function getAccountTabs(): AccountTabDef[] {
  const tabs = (typeof window !== 'undefined' && window.__melisAccountTabs) || []
  return [...tabs].sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
}
