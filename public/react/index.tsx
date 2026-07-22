import { lazy } from 'react'
import type { MelisModuleManifest } from '@/types/melis-modules'

const UserListPage          = lazy(() => import('./UserListPage'))
const UserFormPage          = lazy(() => import('./UserFormPage'))
const AnnouncementsListPage = lazy(() => import('./AnnouncementsListPage'))
const AnnouncementFormPage  = lazy(() => import('./AnnouncementFormPage'))
const GdprPage              = lazy(() => import('./GdprPage'))

const manifest: MelisModuleManifest = {
  routes: [
    // UserListPage est toujours monté dans Shell pour préserver son état (iframe, filtres, scroll)
    { path: '/users',      component: UserListPage, alwaysMount: true },
    { path: '/users/new',  component: UserFormPage },
    { path: '/users/:id',  component: UserFormPage },
    // Annonces
    { path: '/announcements',     component: AnnouncementsListPage, alwaysMount: true },
    { path: '/announcements/new', component: AnnouncementFormPage },
    { path: '/announcements/:id', component: AnnouncementFormPage },
    // RGPD (mono-page : recherche + anonymisation + bannière ; iframe Old préservée)
    { path: '/gdpr',       component: GdprPage, alwaysMount: true },
  ],
}

export default manifest
