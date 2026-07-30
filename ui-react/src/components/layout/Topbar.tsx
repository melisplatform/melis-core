import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, ChevronLeft, ChevronRight, CornerDownRight, LogOut, Menu, PanelLeft, SlidersHorizontal, User, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/auth/auth-context'
import { useI18n } from '@/i18n/i18n-context'
import { useTheme } from '@/theme/theme-context'
import { useReactTheme } from '@/lib/react-theme'
import wordmark from '@/assets/melis-wordmark.svg'
import wordmarkWhite from '@/assets/melis-wordmark-white.svg'
import { CURRENT_USER } from '@/lib/mocks'
import { useTabs, type Tab } from '@/components/tabs/tab-store'
import { useSubTabs } from '@/components/tabs/sub-tab-store'
import { useToolTabs } from '@/components/tabs/tool-tab-bridge'
import { MODULES } from '@/lib/module-registry'
import { usePublishedToolView, useToolView } from '@/lib/tool-view-mode'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { headerBricks, useBricks, brickRoute } from '@/lib/bricks'
import { fetchMe, fetchNotifications, clearNotifications, type MeUser, type FlashNotification } from '@/lib/melis-api'
import { setCapabilitiesFromMe } from '@/lib/capabilities'
import { registerTool, melisKeyForRoute, routeForForward, useToolRoutesVersion } from '@/lib/tool-routes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ─── Brick topbar widgets ─────────────────────────────────────────────────────
//
// Modules can ship a topbar widget (a brick's `Header`) shown next to the language switcher,
// present ONLY when the module is active (e.g. the messenger notification icon). Generic — no
// per-module code here. Re-renders via useBricks() once the bricks finish loading.

function BrickHeaderWidgets() {
  useBricks()
  const widgets = headerBricks()
  if (widgets.length === 0) return null
  return (
    <>
      {widgets.map((b) => {
        const Widget = b.Header!
        return <Widget key={b.id} />
      })}
    </>
  )
}

// ─── Notifications ────────────────────────────────────────────────────────────

function NotificationsMenu() {
  const { t } = useI18n()
  const [items, setItems] = useState<FlashNotification[]>([])
  const refresh = () => { void fetchNotifications().then(setItems) }
  useEffect(() => { refresh() }, [])
  const hasItems = items.length > 0

  async function handleClear() {
    if (await clearNotifications()) setItems([])
  }

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) refresh() }}>
      <DropdownMenuTrigger
        className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        aria-label={t('topbar.notifications')}
      >
        <Bell className="size-[18px]" />
        {hasItems && (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-card" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t('topbar.notifications')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!hasItems && (
          <div className="px-2.5 py-3 text-xs text-muted-foreground">{t('topbar.no_notifications')}</div>
        )}
        {items.map((n, i) => (
          <DropdownMenuItem key={i} className="flex-col items-start gap-0.5 py-2.5">
            <div className="flex w-full items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="font-medium text-foreground">{n.title}</span>
              <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
                {`${n.dateTrans} ${n.time}`.trim()}
              </span>
            </div>
            {n.message && <span className="text-xs text-muted-foreground">{n.message}</span>}
          </DropdownMenuItem>
        ))}
        {hasItems && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); void handleClear() }}
              className="justify-center text-xs font-medium text-primary"
            >
              {t('topbar.clear_notifications')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── User menu ────────────────────────────────────────────────────────────────

const ACCOUNT_MELISKEY = 'meliscore_user_profile'
// "My account" isn't a menu tool — give it a tree-style route under MelisCore and register its
// melisKey so ZonePage can resolve + render it like any other iframe tool.
const ACCOUNT_ROUTE = '/melis-core/account'

function initialsOf(name?: string, login?: string): string {
  const src = (name || login || '').trim()
  if (!src) return '?'
  const parts = src.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return src.slice(0, 2).toUpperCase()
}

/**
 * Round avatar — three cases:
 *  1. a profile photo → show the photo alone (no initials)
 *  2. no photo but known user → initials on the blue (primary) background
 *  3. still loading (initials null) → empty placeholder, nothing shown
 */
function UserAvatar({ picture, initials, className }: { picture: string | null; initials: string | null; className?: string }) {
  if (picture) {
    return (
      <div className={cn('shrink-0 overflow-hidden rounded-full', className)}>
        <img src={picture} alt="" className="size-full object-cover" />
      </div>
    )
  }
  // Nothing while the user is unknown — keep the size to avoid a layout shift.
  if (!initials) return <div className={cn('shrink-0 rounded-full', className)} aria-hidden />
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white', className)}>
      {initials}
    </div>
  )
}

function UserMenu() {
  const { t } = useI18n()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const { openTab } = useTabs()
  const [me, setMe] = useState<MeUser | null>(null)
  useEffect(() => { fetchMe().then((m) => { setMe(m); setCapabilitiesFromMe(m) }) }, [])
  // Register the "My account" route on mount (not only when the menu item is clicked) so other
  // entry points — e.g. a brick's topbar widget (the messenger icon) — can open the profile too.
  useEffect(() => { registerTool({ route: ACCOUNT_ROUTE, melisKey: ACCOUNT_MELISKEY, forwardKey: null }) }, [])

  const name = me?.name?.trim() || CURRENT_USER.name
  const email = me?.email || CURRENT_USER.email
  // null while loading → avatar shows nothing until the user is known.
  const initials = me ? initialsOf(me.name, me.login) : null
  // Real photo if any → show it alone; otherwise fall back to initials on the blue circle.
  const picture = me?.picture ?? null

  async function handleLogout() {
    await signOut()
    // Full page reload — clears all React + iframe state; avoids any SPA navigation
    // race (iframes, zone pool, ProtectedRoute) after the session is cleared.
    const loginUrl = import.meta.env.PROD ? '/melis-react/login' : '/login'
    window.location.replace(loginUrl)
  }

  // Open the legacy "My account" (user profile) tool in the zone pool, like any other tool.
  function handleAccount() {
    registerTool({ route: ACCOUNT_ROUTE, melisKey: ACCOUNT_MELISKEY, forwardKey: null })
    openTab({ id: ACCOUNT_ROUTE, label: t('topbar.account'), path: ACCOUNT_ROUTE })
    navigate(ACCOUNT_ROUTE)
  }
  // Expose opening "My account" to bricks (e.g. the messenger icon opens the profile + its tab),
  // so they reuse the host's translated tab label instead of inventing their own.
  useEffect(() => {
    const w = window as unknown as { __melisOpenAccount?: () => void }
    w.__melisOpenAccount = handleAccount
  })

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
              {/* Le Dashboard est l'accueil PERMANENT : pas de × (fermer les outils y ramène toujours).
                  On garde un padding droit équivalent pour ne pas décaler le libellé. Les autres onglets
                  restent fermables. */}
              {tab.id === '/' ? (
                <span className="pr-2" aria-hidden="true" />
              ) : (
                <button
                  type="button"
                  title={t('layout.close')}
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
              )}
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

// ─── Mobile : sous-onglets de l'outil ACTIF, nichés sous son onglet ───────────────
//
// Reprend fidèlement la résolution des deux barres desktop :
//  • SubTabBar  → sous-onglets React (outils natifs MODULES + briques `subTabs`) ;
//  • ToolTabBar → enregistrements d'un outil LEGACY en iframe (bridge postMessage).
// Un outil n'affiche que l'UNE des deux (selon la vue New/Old), comme en desktop.
function MobileSubTabs({ onNavigate }: { onNavigate: () => void }) {
  useToolRoutesVersion()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const bricks = useBricks()

  // Sous-onglets React (cf. SubTabBar).
  const sections = [
    ...MODULES.map((m) => ({ key: routeForForward(m.forwardKey) ?? m.route, melisKey: m.melisKey })),
    ...bricks.filter((b) => b.subTabs).map((b) => ({ key: brickRoute(b), melisKey: b.melisKey })),
  ]
  const section = sections.find((s) => s.key && (pathname === s.key || pathname.startsWith(s.key + '/')))
  const publishedView = usePublishedToolView(section?.melisKey ?? null)
  const { tabs: reactSubTabs, closeTab: closeReactSub } = useSubTabs(section?.key ?? '__none__')
  const showReact = !!section && publishedView !== 'iframe' && reactSubTabs.length > 0

  // Enregistrements legacy (cf. ToolTabBar).
  const brick = bricks.find((b) => { const r = brickRoute(b); return r && (pathname === r || pathname.startsWith(r + '/')) })
  const legacyKey = brick?.melisKey ?? melisKeyForRoute(pathname)
  const { tabsFor, activate: activateLegacy, close: closeLegacy } = useToolTabs()
  const legacySecondary = tabsFor(legacyKey).filter((t) => !t.primary)
  const toolView = useToolView(legacyKey)
  const showLegacy = !!legacyKey && legacySecondary.length > 0 && toolView !== 'react'

  if (!showReact && !showLegacy) return null

  const row = (key: string, active: boolean, label: string, onOpen: () => void, onClose: () => void) => (
    <div key={key} className={cn('flex items-center border-t border-border/40', active && 'bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]')}>
      <button type="button" onClick={onOpen}
        className={cn('flex min-w-0 flex-1 items-center gap-2 py-2.5 pl-9 pr-3 text-left text-[13px]', active ? 'font-medium text-foreground' : 'text-muted-foreground')}>
        <CornerDownRight className="size-3.5 shrink-0 opacity-60" />
        <span className="truncate">{label}</span>
      </button>
      <button type="button" onClick={onClose} className="flex shrink-0 items-center px-3 py-2.5 text-muted-foreground hover:text-foreground">
        <X className="size-3.5" />
      </button>
    </div>
  )

  return (
    <div className="bg-muted/20">
      {showReact && reactSubTabs.map((tab) =>
        row(tab.id, pathname === tab.path, tab.label, () => { navigate(tab.path); onNavigate() }, () => closeReactSub(tab.id)),
      )}
      {showLegacy && legacyKey && legacySecondary.map((t) =>
        row(t.id, !!t.active, t.label, () => { activateLegacy(legacyKey, t.id); onNavigate() }, () => closeLegacy(legacyKey, t.id)),
      )}
    </div>
  )
}

// ─── Mobile : panneau vertical des onglets ouverts (déployé par l'encoche) ────────
//
// Reproduit le « déploiement des onglets » du header legacy en mobile : la liste
// horizontale (TabStrip) n'a pas sa place dans un header étroit, on la remplace par un
// panneau vertical déroulant ; les sous-onglets de l'outil actif sont nichés dessous.
function MobileTabsPanel({ onNavigate }: { onNavigate: () => void }) {
  const { tabs, activeId, activateTab, closeTab } = useTabs()
  const { lang } = useI18n()
  const navigate = useNavigate()

  function activate(tab: Tab) {
    activateTab(tab.id)
    navigate(tab.path)
    onNavigate()
  }
  function close(tab: Tab) {
    const remaining = tabs.filter((t) => t.id !== tab.id)
    if (tab.id === activeId) {
      const idx = tabs.findIndex((t) => t.id === tab.id)
      const target = remaining[Math.min(idx, remaining.length - 1)] ?? { path: '/' }
      navigate(target.path)
    }
    closeTab(tab.id)
    window.dispatchEvent(new CustomEvent('melis:tab-closed', { detail: { path: tab.path, id: tab.id } }))
  }

  return (
    <div className="max-h-[55vh] overflow-y-auto border-b border-border bg-card shadow-inner">
      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {lang === 'fr' ? 'Onglets ouverts' : 'Open tabs'}
      </div>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <div key={tab.id}>
            <div
              className={cn(
                'flex items-center border-t border-border/60',
                isActive && 'bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]',
              )}
            >
              <button
                type="button"
                onClick={() => activate(tab)}
                className={cn(
                  'flex min-w-0 flex-1 items-center gap-2.5 px-3 py-3 text-left text-sm',
                  isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {tab.icon && <tab.icon className="size-4 shrink-0" />}
                <span className="truncate">{tab.label}</span>
              </button>
              {tab.id !== '/' && (
                <button
                  type="button"
                  onClick={() => close(tab)}
                  className="flex shrink-0 items-center px-3 py-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            {/* Sous-onglets de l'outil actif (l'onglet actif = celui qui matche l'URL courante). */}
            {isActive && <MobileSubTabs onNavigate={onNavigate} />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

export function Topbar({ onToggleSidebar, isMobile = false }: { onToggleSidebar: () => void; isMobile?: boolean }) {
  const { t } = useI18n()
  const { theme } = useTheme()
  const { headerLogo } = useReactTheme()
  const mark = theme === 'studio' ? wordmarkWhite : wordmark
  const [actionsOpen, setActionsOpen] = useState(false)
  const [tabsOpen, setTabsOpen] = useState(false)

  // ── Header mobile : hamburger (menu gauche) · logo centré · bouton icônes ; l'encoche
  //    (chevron à droite) déploie les onglets ouverts. Façon back-office legacy.
  if (isMobile) {
    return (
      <div className="sticky top-0 z-20 shrink-0">
        <header className="flex h-14 items-center gap-1 border-b border-border bg-card/90 px-2 backdrop-blur-md">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={t('topbar.collapse')}
            className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <img src={headerLogo || mark} alt="Melis Platform" className="h-6 w-auto max-w-[60vw] object-contain" />
          </div>
          <button
            type="button"
            onClick={() => setActionsOpen((o) => !o)}
            aria-label={t('topbar.notifications')}
            className={cn(
              'inline-flex size-10 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground',
              actionsOpen ? 'bg-accent text-foreground' : 'text-muted-foreground',
            )}
          >
            <SlidersHorizontal className="size-5" />
          </button>
        </header>

        {/* Rangée d'icônes déployée par le bouton de droite */}
        {actionsOpen && (
          <div className="flex items-center justify-end gap-1 border-b border-border bg-card px-2 py-1.5">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <BrickHeaderWidgets />
            <NotificationsMenu />
            <UserMenu />
          </div>
        )}

        {/* Encoche : déploie/replie les onglets ouverts */}
        <button
          type="button"
          onClick={() => setTabsOpen((o) => !o)}
          aria-label={t('topbar.close_all')}
          className="flex h-6 w-full items-center justify-end gap-1 border-b border-border bg-muted/40 px-3 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDown className={cn('size-4 transition-transform', tabsOpen && 'rotate-180')} />
        </button>

        {tabsOpen && <MobileTabsPanel onNavigate={() => setTabsOpen(false)} />}
      </div>
    )
  }

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
        <ThemeSwitcher />
        <LanguageSwitcher />
        <BrickHeaderWidgets />
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  )
}
