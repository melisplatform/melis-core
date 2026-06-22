/** Données mockées pour le prototype de dashboard.
 *  À remplacer par TanStack Query sur des endpoints JSON Melis / MelisMCP.
 *  Tout est typé pour que le câblage réel soit un simple swap de source. */

export type PageStatus = 'published' | 'draft' | 'scheduled'
export type ActivityType = 'published' | 'edited' | 'created' | 'uploaded' | 'commented' | 'connected'

export interface Kpi {
  key: 'sites' | 'pages' | 'languages' | 'users'
  value: number
  /** Variation en % vs mois dernier (peut être négative). */
  delta: number
}

export interface RecentPage {
  id: number
  title: string
  site: string
  status: PageStatus
  updatedHoursAgo: number
}

export interface ActivityItem {
  id: number
  user: string
  type: ActivityType
  target: string
  hoursAgo: number
}

export interface NotificationItem {
  id: number
  title: string
  detail: string
  hoursAgo: number
  unread: boolean
}

export interface MessageItem {
  id: number
  from: string
  snippet: string
  hoursAgo: number
  unread: boolean
}

export interface UpdateItem {
  id: number
  module: string
  version: string
  kind: 'security' | 'feature' | 'patch'
}

export const KPIS: Kpi[] = [
  { key: 'sites', value: 4, delta: 0 },
  { key: 'pages', value: 128, delta: 6.2 },
  { key: 'languages', value: 2, delta: 0 },
  { key: 'users', value: 17, delta: -3.1 },
]

export const RECENT_PAGES: RecentPage[] = [
  { id: 1, title: 'Accueil', site: 'melisplatform.com', status: 'published', updatedHoursAgo: 2 },
  { id: 2, title: 'Tarifs', site: 'melisplatform.com', status: 'draft', updatedHoursAgo: 5 },
  { id: 3, title: 'Cas client — DEKRA', site: 'melisplatform.com', status: 'published', updatedHoursAgo: 26 },
  { id: 4, title: 'Landing — Melis AI', site: 'melis-studio.ai', status: 'scheduled', updatedHoursAgo: 30 },
  { id: 5, title: 'Mentions légales', site: 'melisplatform.com', status: 'published', updatedHoursAgo: 49 },
]

export const ACTIVITY: ActivityItem[] = [
  { id: 1, user: 'Camille', type: 'published', target: 'Accueil', hoursAgo: 2 },
  { id: 2, user: 'Yanis', type: 'edited', target: 'Tarifs', hoursAgo: 5 },
  { id: 3, user: 'Sophie', type: 'uploaded', target: 'hero-2026.png', hoursAgo: 8 },
  { id: 4, user: 'Marc', type: 'created', target: 'Landing — Melis AI', hoursAgo: 28 },
  { id: 5, user: 'Camille', type: 'commented', target: 'Cas client — DEKRA', hoursAgo: 31 },
]

export const NOTIFICATIONS: NotificationItem[] = [
  { id: 1, title: 'Sauvegarde terminée', detail: 'Snapshot quotidien de la base « dev ».', hoursAgo: 1, unread: true },
  { id: 2, title: 'Nouveau commentaire', detail: 'En attente de modération sur « Tarifs ».', hoursAgo: 4, unread: true },
  { id: 3, title: 'Cache vidé', detail: 'Cache des pages régénéré avec succès.', hoursAgo: 22, unread: false },
]

export const MESSAGES: MessageItem[] = [
  { id: 1, from: 'Sophie Lemaire', snippet: 'Peux-tu valider la home avant la mise en ligne ?', hoursAgo: 3, unread: true },
  { id: 2, from: 'Marc Dubois', snippet: 'La landing Melis AI est prête pour relecture.', hoursAgo: 9, unread: false },
  { id: 3, from: 'Équipe support', snippet: 'Ticket #4821 résolu.', hoursAgo: 27, unread: false },
]

export const UPDATES: UpdateItem[] = [
  { id: 1, module: 'MelisCore', version: '5.3.36', kind: 'security' },
  { id: 2, module: 'MelisCms', version: '5.3.36', kind: 'feature' },
  { id: 3, module: 'MelisAI', version: '1.2.0', kind: 'feature' },
]

export interface TrafficPoint {
  label: string
  visits: number
  pages: number
}

/** Série pour le widget graphique (équivalent « Prospects statistics »). */
export const TRAFFIC_DATA: TrafficPoint[] = [
  { label: 'Lun', visits: 1240, pages: 3120 },
  { label: 'Mar', visits: 1980, pages: 4010 },
  { label: 'Mer', visits: 1620, pages: 3540 },
  { label: 'Jeu', visits: 2210, pages: 4620 },
  { label: 'Ven', visits: 2480, pages: 5210 },
  { label: 'Sam', visits: 1390, pages: 2980 },
  { label: 'Dim', visits: 1120, pages: 2510 },
]

export const CURRENT_USER = {
  name: 'Admin',
  email: 'admin@melistechnology.com',
  initials: 'AD',
}
