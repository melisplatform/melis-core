import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronLeft, ChevronRight, LogOut, PanelLeft, User, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/auth/auth-context'
import { useI18n } from '@/i18n/i18n-context'
import { formatRelativeHours } from '@/lib/format'
import { CURRENT_USER, NOTIFICATIONS } from '@/lib/mocks'
import { useTabs, type Tab } from '@/components/tabs/tab-store'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { fetchMe, type MeUser } from '@/lib/melis-api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ─── Notifications ────────────────────────────────────────────────────────────

function NotificationsMenu() {
  const { t, lang } = useI18n()
  const unread = NOTIFICATIONS.some((n) => n.unread)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        aria-label={t('topbar.notifications')}
      >
        <Bell className="size-[18px]" />
        {unread && (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-card" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t('topbar.notifications')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {NOTIFICATIONS.map((n) => (
          <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5 py-2.5">
            <div className="flex w-full items-center gap-2">
              {n.unread && <span className="size-1.5 rounded-full bg-primary" />}
              <span className="font-medium text-foreground">{n.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatRelativeHours(n.hoursAgo, lang)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{n.detail}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── User menu ────────────────────────────────────────────────────────────────

const ACCOUNT_MELISKEY = 'meliscore_user_profile'
// MelisCore's default profile picture (served by MelisAssetManager) — used when the user has none.
const DEFAULT_PROFILE_PIC = '/MelisCore/images/profile/default_picture.jpg'

function initialsOf(name?: string, login?: string): string {
  const src = (name || login || '').trim()
  if (!src) return '?'
  const parts = src.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return src.slice(0, 2).toUpperCase()
}

/** Round avatar: the profile photo (if any) with the initials kept ON TOP. */
function UserAvatar({ picture, initials, className }: { picture: string | null; initials: string; className?: string }) {
  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-full bg-primary', className)}>
      {picture && <img src={picture} alt="" className="absolute inset-0 size-full object-cover" />}
      <span
        className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white"
        // Black outline around the letters so they stay readable over a light photo.
        style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 1px 2px rgba(0,0,0,.6)' }}
      >
        {initials}
      </span>
    </div>
  )
}

function UserMenu() {
  const { t } = useI18n()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const { openTab } = useTabs()
  const [me, setMe] = useState<MeUser | null>(null)
  useEffect(() => { fetchMe().then(setMe) }, [])

  const name = me?.name?.trim() || CURRENT_USER.name
  const email = me?.email || CURRENT_USER.email
  const initials = me ? initialsOf(me.name, me.login) : CURRENT_USER.initials
  // Real photo if any, else MelisCore's default picture (never the bare blue circle).
  const picture = me?.picture ?? DEFAULT_PROFILE_PIC

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  // Open the legacy "My account" (user profile) tool in the zone pool, like any other tool.
  function handleAccount() {
    const path = `/zone/${encodeURIComponent(ACCOUNT_MELISKEY)}`
    openTab({ id: path, label: t('topbar.account'), path })
    navigate(path)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full pl-1 pr-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
        <UserAvatar picture={picture} initials={initials} className="size-9" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <UserAvatar picture={picture} initials={initials} className="size-9" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{name}</div>
            <div className="truncate text-xs text-muted-foreground">{email}</div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleAccount}>
          <User />
          {t('topbar.account')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          className="text-destructive focus:text-destructive [&_svg]:text-destructive"
        >
          <LogOut />
          {t('topbar.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Tabs strip ───────────────────────────────────────────────────────────────

function TabStrip() {
  const { tabs, activeId, activateTab, closeTab, closeAllTabs } = useTabs()
  const { t } = useI18n()
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  // Activation history (most-recently-viewed first) so closing a tab returns to the last
  // displayed one, not just the left neighbour.
  const historyRef = useRef<string[]>([])
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)

  function checkScroll() {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 1)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect() }
  }, [tabs])

  // Scroll active tab into view when it changes
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const activeEl = el.querySelector<HTMLElement>('[data-active="true"]')
    activeEl?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [activeId])

  // Track the activation history (most-recent first).
  useEffect(() => {
    historyRef.current = [activeId, ...historyRef.current.filter((id) => id !== activeId)]
  }, [activeId])

  function handleActivate(tab: Tab) {
    activateTab(tab.id)
    navigate(tab.path)
  }

  function handleClose(tab: Tab) {
    const remaining = tabs.filter((t) => t.id !== tab.id)
    // Closing the active tab must also switch the CONTENT away from it (the view is route-bound),
    // landing on the last displayed tab still open — or a neighbour, or the dashboard.
    if (tab.id === activeId) {
      const idx = tabs.findIndex((t) => t.id === tab.id)
      const lastViewed = historyRef.current.find(
        (id) => id !== tab.id && remaining.some((t) => t.id === id),
      )
      const target =
        remaining.find((t) => t.id === lastViewed) ??
        remaining[Math.min(idx, remaining.length - 1)] ??
        { path: '/' }
      navigate(target.path)
    }
    historyRef.current = historyRef.current.filter((id) => id !== tab.id)
    closeTab(tab.id)
    // Truly close the tab's content (not just hide it): content managers (zone pool, brick
    // iframes, CMS page pool) listen and DESTROY the matching iframe, so reopening reloads fresh.
    window.dispatchEvent(new CustomEvent('melis:tab-closed', { detail: { path: tab.path, id: tab.id } }))
  }

  function handleCloseAll() {
    // Destroy every non-Dashboard tab's content, then keep only the Dashboard.
    tabs.forEach((tab) => {
      if (tab.id !== '/') {
        window.dispatchEvent(new CustomEvent('melis:tab-closed', { detail: { path: tab.path, id: tab.id } }))
      }
    })
    historyRef.current = ['/']
    closeAllTabs()
    navigate('/')
  }

  return (
    <div className="flex min-w-0 flex-1 items-stretch overflow-hidden">
      {/* Left arrow */}
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ left: -180, behavior: 'smooth' })}
          className="flex shrink-0 items-center px-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}

      {/* Scrollable tab list */}
      <div
        ref={scrollRef}
        className="flex min-w-0 flex-1 items-stretch overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <div
              key={tab.id}
              data-active={isActive}
              style={{
                borderRight:  '1px solid var(--color-border)',
                borderBottom: isActive
                  ? '3px solid var(--color-primary)'
                  : '3px solid transparent',
              }}
              className={cn(
                'group relative flex shrink-0 items-stretch transition-colors',
                isActive ? 'bg-background' : 'hover:[border-bottom-color:var(--color-border)]',
              )}
            >
              <button
                type="button"
                onClick={() => handleActivate(tab)}
                className={cn(
                  'flex items-center gap-1.5 px-3 text-sm transition-colors',
                  isActive
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.icon && <tab.icon className="size-3.5 shrink-0" />}
                <span className="max-w-[150px] truncate">{tab.label}</span>
              </button>
              <button
                type="button"
                title="Fermer"
                onClick={() => handleClose(tab)}
                className={cn(
                  'flex items-center pr-2 transition-colors',
                  isActive
                    ? 'text-muted-foreground hover:text-foreground'
                    : 'text-transparent group-hover:text-muted-foreground group-hover:hover:text-foreground',
                )}
              >
                <X className="size-3" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Right arrow */}
      {canRight && (
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ left: 180, behavior: 'smooth' })}
          className="flex shrink-0 items-center px-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {/* Close all tabs (keeps only the Dashboard) */}
      {tabs.length > 1 && (
        <button
          type="button"
          onClick={handleCloseAll}
          title={t('topbar.close_all')}
          className="flex shrink-0 items-center gap-1.5 border-l border-border px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
          <span className="hidden md:inline">{t('topbar.close_all')}</span>
        </button>
      )}
    </div>
  )
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-10 flex h-14 items-stretch border-b border-border bg-card/80 backdrop-blur-md shrink-0">
      {/* Sidebar toggle */}
      <div className="flex shrink-0 items-center px-3 border-r border-border">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={t('topbar.collapse')}
          className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <PanelLeft className="size-[18px]" />
        </button>
      </div>

      {/* Tab strip — prend tout l'espace disponible */}
      <TabStrip />

      {/* Right actions */}
      <div className="flex shrink-0 items-center gap-1 border-l border-border px-3">
        <ThemeSwitcher className="hidden sm:inline-flex" />
        <LanguageSwitcher />
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  )
}
