/** Données mockées pour le prototype de dashboard.
 *  À remplacer par TanStack Query sur des endpoints JSON Melis / MelisMCP.
 *  Tout est typé pour que le câblage réel soit un simple swap de source. */

export type ActivityType = 'published' | 'edited' | 'created' | 'uploaded' | 'commented' | 'connected'

export interface ActivityItem {
  id: number
  user: string
  type: ActivityType
  target: string
  hoursAgo: number
}

export const ACTIVITY: ActivityItem[] = [
  { id: 1, user: 'Camille', type: 'published', target: 'Accueil', hoursAgo: 2 },
  { id: 2, user: 'Yanis', type: 'edited', target: 'Tarifs', hoursAgo: 5 },
  { id: 3, user: 'Sophie', type: 'uploaded', target: 'hero-2026.png', hoursAgo: 8 },
  { id: 4, user: 'Marc', type: 'created', target: 'Landing — Melis AI', hoursAgo: 28 },
  { id: 5, user: 'Camille', type: 'commented', target: 'Cas client — DEKRA', hoursAgo: 31 },
]

export const CURRENT_USER = {
  name: 'Admin',
  email: 'admin@melistechnology.com',
  initials: 'AD',
}
