/** Dictionnaires i18n. `fr` est la source de vérité ; `en` doit en couvrir les clés.
 *  i18n volontairement minimale (pas de lib) — suffisant pour le prototype et
 *  100 % typé. Interpolation simple via {tokens}. */

export const LANGS = ['fr', 'en'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'fr'
export const LANG_STORAGE_KEY = 'melis-ui-lang'

export const LANG_LABELS: Record<Lang, string> = {
  fr: 'Français',
  en: 'English',
}

const fr = {
  'nav.section_main': 'Principal',
  'nav.section_content': 'Contenu',
  'nav.section_admin': 'Administration',
  'nav.dashboard': 'Tableau de bord',
  'nav.sites': 'Sites',
  'nav.pages': 'Pages',
  'nav.media': 'Médias',
  'nav.users': 'Utilisateurs',
  'nav.settings': 'Paramètres',

  'topbar.search': 'Rechercher…',
  'topbar.notifications': 'Notifications',
  'topbar.no_notifications': 'Aucune notification',
  'topbar.clear_notifications': 'Effacer les notifications',
  'topbar.profile': 'Profil',
  'topbar.account': 'Mon compte',
  'topbar.logout': 'Déconnexion',
  'topbar.language': 'Langue',
  'topbar.collapse': 'Réduire le menu',
  'topbar.close_all': 'Fermer tout',

  'dash.welcome': 'Bonjour {name}',
  'dash.welcome_sub': 'Voici ce qui se passe sur votre plateforme aujourd’hui.',
  'dash.kpi.sites': 'Sites',
  'dash.kpi.pages': 'Pages',
  'dash.kpi.media': 'Médias',
  'dash.kpi.users': 'Utilisateurs',
  'dash.vs_last_month': 'vs mois dernier',
  'dash.recent_pages': 'Pages récemment modifiées',
  'dash.recent_activity': 'Activité récente',
  'dash.notifications': 'Notifications',
  'dash.messages': 'Messages',
  'dash.updates': 'Mises à jour',
  'dash.view_all': 'Tout voir',
  'dash.col.page': 'Page',
  'dash.col.site': 'Site',
  'dash.col.status': 'Statut',
  'dash.col.updated': 'Modifiée',
  'dash.status.published': 'Publiée',
  'dash.status.draft': 'Brouillon',
  'dash.status.scheduled': 'Planifiée',

  'act.published': 'a publié',
  'act.edited': 'a modifié',
  'act.created': 'a créé',
  'act.uploaded': 'a importé',
  'act.commented': 'a commenté',

  'widget.traffic': 'Trafic du site',
  'widget.announcement': 'Annonces',
  'widget.add': 'Ajouter un widget',
  'widget.done': 'Terminer',
  'widget.edit': 'Personnaliser',
  'widget.reset': 'Réinitialiser',
  'widget.palette_hint': 'Glissez un widget sur le tableau de bord, ou cliquez pour l’ajouter.',
  'widget.empty': 'Tableau de bord vide — ajoutez des widgets depuis la palette.',
  'widget.in_dashboard': 'Déjà présent',
  'widget.sec.kpi': 'Indicateurs',
  'widget.sec.content': 'Contenu',
  'widget.sec.comm': 'Communication',
  'widget.sec.analytics': 'Analytique',

  'common.coming_soon': 'Bientôt disponible',
  'common.coming_soon_sub': 'Cet écran fait partie des prochains jalons du prototype.',
} as const

export type I18nKey = keyof typeof fr

const en: Record<I18nKey, string> = {
  'nav.section_main': 'Main',
  'nav.section_content': 'Content',
  'nav.section_admin': 'Administration',
  'nav.dashboard': 'Dashboard',
  'nav.sites': 'Sites',
  'nav.pages': 'Pages',
  'nav.media': 'Media',
  'nav.users': 'Users',
  'nav.settings': 'Settings',

  'topbar.search': 'Search…',
  'topbar.notifications': 'Notifications',
  'topbar.no_notifications': 'No notifications',
  'topbar.clear_notifications': 'Clear notifications',
  'topbar.profile': 'Profile',
  'topbar.account': 'My account',
  'topbar.logout': 'Log out',
  'topbar.language': 'Language',
  'topbar.collapse': 'Collapse menu',
  'topbar.close_all': 'Close all',

  'dash.welcome': 'Hello {name}',
  'dash.welcome_sub': 'Here’s what’s happening on your platform today.',
  'dash.kpi.sites': 'Sites',
  'dash.kpi.pages': 'Pages',
  'dash.kpi.media': 'Media',
  'dash.kpi.users': 'Users',
  'dash.vs_last_month': 'vs last month',
  'dash.recent_pages': 'Recently edited pages',
  'dash.recent_activity': 'Recent activity',
  'dash.notifications': 'Notifications',
  'dash.messages': 'Messages',
  'dash.updates': 'Updates',
  'dash.view_all': 'View all',
  'dash.col.page': 'Page',
  'dash.col.site': 'Site',
  'dash.col.status': 'Status',
  'dash.col.updated': 'Updated',
  'dash.status.published': 'Published',
  'dash.status.draft': 'Draft',
  'dash.status.scheduled': 'Scheduled',

  'act.published': 'published',
  'act.edited': 'edited',
  'act.created': 'created',
  'act.uploaded': 'uploaded',
  'act.commented': 'commented on',

  'widget.traffic': 'Site traffic',
  'widget.announcement': 'Announcements',
  'widget.add': 'Add a widget',
  'widget.done': 'Done',
  'widget.edit': 'Customize',
  'widget.reset': 'Reset',
  'widget.palette_hint': 'Drag a widget onto the dashboard, or click to add it.',
  'widget.empty': 'Empty dashboard — add widgets from the palette.',
  'widget.in_dashboard': 'Already added',
  'widget.sec.kpi': 'Indicators',
  'widget.sec.content': 'Content',
  'widget.sec.comm': 'Communication',
  'widget.sec.analytics': 'Analytics',

  'common.coming_soon': 'Coming soon',
  'common.coming_soon_sub': 'This screen is part of the prototype’s next milestones.',
}

export const DICTIONARIES: Record<Lang, Record<I18nKey, string>> = { fr, en }

export function isLang(value: unknown): value is Lang {
  return LANGS.includes(value as Lang)
}

/** Map a platform locale ("en_EN", "fr_FR") to the React UI dictionary lang; fallback default. */
export function localeToLang(locale: string | null | undefined): Lang {
  const short = (locale ?? '').split('_')[0].toLowerCase()
  return isLang(short) ? short : DEFAULT_LANG
}
