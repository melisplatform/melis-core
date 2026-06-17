import { lazy, type LazyExoticComponent, type ComponentType } from 'react'
import { Users, type LucideIcon } from 'lucide-react'

/**
 * Registre des outils React natifs **de MelisCore**.
 *
 * MelisCore ne déclare ici que ses *propres* outils (ex. Utilisateurs). Les outils
 * des autres modules n'apparaissent PAS ici : ils sont fournis par chaque module
 * sous forme de brique React chargée au runtime (cf. `@/lib/bricks`) et n'existent
 * que si le module est activé. Le menu lui-même est dynamique (backend), donc rien
 * n'est codé en dur côté navigation.
 *
 * Source de vérité pour un outil natif MelisCore :
 * - les routes (`App.tsx` les génère)
 * - le mapping navigation → route React (`useNavMenu.ts` le dérive)
 * - le montage persistant dans le Shell (`Shell.tsx` monte les `persistent`)
 * - le toggle « vue React / vue Melis classique » (via `melisKey`)
 */
export interface ReactModuleDef {
  /** Identifiant court, ex. 'users'. */
  id: string
  /** Route racine React, ex. '/users'. */
  route: string
  /** Libellé d'onglet/titre par défaut. */
  label: string
  /** Icône (barre de sous-onglets, etc.). */
  icon?: LucideIcon
  /**
   * Clé `Module/Controller` Melis (= `forward.module + '/' + forward.controller`)
   * utilisée pour mapper l'entrée de menu legacy vers la route React.
   */
  forwardKey: string
  /**
   * Clé d'outil Melis (`melisKey`) pour la vue classique en iframe
   * (toggle New/Old). `null` si le module n'a pas d'équivalent legacy.
   */
  melisKey: string | null
  /** Page liste (lazy). */
  list: LazyExoticComponent<ComponentType>
  /** Page formulaire (lazy) — routes `/x/new` et `/x/:id`. */
  form?: LazyExoticComponent<ComponentType>
  /**
   * Si vrai, la page liste est montée en permanence dans le Shell
   * (cachée en CSS hors de sa route). Nécessaire quand le module garde
   * une iframe Melis vivante via le toggle — sinon l'iframe se recharge.
   */
  persistent?: boolean
}

export const MODULES: ReactModuleDef[] = [
  {
    id: 'users',
    route: '/users',
    label: 'Utilisateurs',
    icon: Users,
    forwardKey: 'MelisCore/ToolUser',
    melisKey: 'meliscore_tool_user',
    list: lazy(() => import('@/pages/UserListPage')),
    form: lazy(() => import('@/pages/UserFormPage')),
    persistent: true,
  },
]

/** Modules montés en permanence dans le Shell. */
export const PERSISTENT_MODULES = MODULES.filter((m) => m.persistent)

/** Mapping `Module/Controller` Melis → route React (pour la navigation). */
export const REACT_ROUTES: Record<string, string> = Object.fromEntries(
  MODULES.map((m) => [m.forwardKey, m.route]),
)
