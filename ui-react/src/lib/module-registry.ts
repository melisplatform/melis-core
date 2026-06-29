import { lazy, type LazyExoticComponent, type ComponentType } from 'react'
import { Languages, Mail, Megaphone, Palette, Puzzle, ScrollText, Server, Settings2, ShieldCheck, Users, type LucideIcon } from 'lucide-react'

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
  /**
   * Affiche le toggle « New (React) / Old (iframe) » pour CET outil.
   *
   * Temporaire (transition) : chaque outil garde son toggle tant que sa vue
   * React n'est pas validée. Une fois l'outil validé, passer ce flag à `false`
   * (outil par outil, indépendamment des autres) → le bouton disparaît et la
   * page force la vue React. À retirer (avec `melisKey`/l'iframe) quand le
   * legacy de l'outil sera définitivement supprimé.
   *
   * Absent = `true` (toggle affiché). N'a de sens que si `melisKey` est défini.
   */
  viewToggle?: boolean
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
    // Toggle encore actif tant que la vue React Utilisateurs n'est pas validée.
    // Le jour venu : passer à `false` (puis retirer le mécanisme iframe).
    viewToggle: true,
  },
  {
    id: 'platforms',
    route: '/platforms',
    label: 'Plateformes',
    icon: Server,
    forwardKey: 'MelisCore/Platforms',
    melisKey: 'meliscore_tool_platform',
    list: lazy(() => import('@/pages/PlatformListPage')),
    form: lazy(() => import('@/pages/PlatformFormPage')),
    persistent: true,
    viewToggle: true,
  },
  {
    id: 'languages',
    route: '/languages',
    label: 'Langues',
    icon: Languages,
    forwardKey: 'MelisCore/Language',
    melisKey: 'meliscore_tool_language',
    list: lazy(() => import('@/pages/LanguageListPage')),
    form: lazy(() => import('@/pages/LanguageFormPage')),
    persistent: true,
    viewToggle: true,
  },
  {
    id: 'logs',
    route: '/logs',
    label: 'Logs',
    icon: ScrollText,
    forwardKey: 'MelisCore/Log',
    melisKey: 'meliscore_logs_tool',
    list: lazy(() => import('@/pages/LogListPage')),
    // Outil EN LECTURE SEULE : pas de formulaire (pas de route /new ni /:id).
    persistent: true,
    viewToggle: true,
  },
  {
    id: 'announcements',
    route: '/announcements',
    label: 'Annonces',
    icon: Megaphone,
    forwardKey: 'MelisCore/Announcement',
    melisKey: 'melis_core_announcement_tool',
    list: lazy(() => import('@/pages/AnnouncementListPage')),
    form: lazy(() => import('@/pages/AnnouncementFormPage')),
    persistent: true,
    viewToggle: true,
  },
  {
    id: 'modules',
    route: '/modules',
    label: 'Modules',
    icon: Puzzle,
    forwardKey: 'MelisCore/Modules',
    melisKey: 'meliscore_tool_user_module_management',
    // Outil SPÉCIAL (pas liste/formulaire) : activation + ordre des modules.
    list: lazy(() => import('@/pages/ModulesPage')),
    persistent: true,
    viewToggle: true,
  },
  {
    id: 'gdpr',
    route: '/gdpr',
    label: 'GDPR',
    icon: ShieldCheck,
    forwardKey: 'MelisCore/MelisCoreGdpr',
    melisKey: 'melis_core_gdpr',
    // Outil SPÉCIAL (pas liste/formulaire) : recherche → extraction/suppression des
    // données personnelles à travers les modules. L'Auto-Delete reste en vue « Old ».
    list: lazy(() => import('@/pages/GdprPage')),
    persistent: true,
    viewToggle: true,
  },
  {
    id: 'emails',
    route: '/emails',
    label: 'Emails',
    icon: Mail,
    forwardKey: 'MelisCore/EmailsManagement',
    melisKey: 'meliscore_tool_emails_mngt',
    // CRUD multilingue des emails transactionnels (liste + formulaire à onglets de langue).
    list: lazy(() => import('@/pages/EmailListPage')),
    form: lazy(() => import('@/pages/EmailFormPage')),
    persistent: true,
    viewToggle: true,
  },
  {
    id: 'otherconfig',
    route: '/otherconfig',
    label: 'Autres Configurations',
    icon: Settings2,
    forwardKey: 'MelisCore/MelisCoreOtherConfig',
    melisKey: 'meliscore_tool_other_config',
    // Outil SPÉCIAL (page unique de réglages) : politique connexion / mot de passe (app.login.php).
    list: lazy(() => import('@/pages/OtherConfigPage')),
    persistent: true,
    viewToggle: true,
  },
  {
    id: 'platformscheme',
    route: '/platform-scheme',
    label: 'Thème de la plateforme',
    icon: Palette,
    forwardKey: 'MelisCore/PlatformScheme',
    melisKey: 'meliscore_tool_platform_scheme',
    // Outil SPÉCIAL (page unique de réglages) : couleurs + logos/favicon du BO (schemes.css).
    list: lazy(() => import('@/pages/PlatformSchemePage')),
    persistent: true,
    viewToggle: true,
  },
]

/** Modules montés en permanence dans le Shell. */
export const PERSISTENT_MODULES = MODULES.filter((m) => m.persistent)

/** Mapping `Module/Controller` Melis → route React (pour la navigation). */
export const REACT_ROUTES: Record<string, string> = Object.fromEntries(
  MODULES.map((m) => [m.forwardKey, m.route]),
)

/**
 * Le toggle « New (React) / Old (iframe) » est-il actif pour cet outil natif ?
 *
 * Lit le flag `viewToggle` de l'entrée du registre (défaut `true` si absent).
 * Une page native appelle ce helper avec son propre `id` pour décider d'afficher
 * le bouton et de forcer (ou non) la vue React.
 */
export function toolHasViewToggle(id: string): boolean {
  return MODULES.find((m) => m.id === id)?.viewToggle ?? true
}
