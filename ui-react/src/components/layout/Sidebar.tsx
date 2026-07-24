import { createContext, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, LayoutDashboard } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import { useTheme } from '@/theme/theme-context'
import { useNavMenu, type NavNode } from '@/hooks/useNavMenu'
import { useBricks, sidebarBrickForModules } from '@/lib/bricks'
import { useTabs } from '@/components/tabs/tab-store'
import { melisKeyForRoute } from '@/lib/tool-routes'
import { useReactTheme } from '@/lib/react-theme'
import wordmark from '@/assets/melis-wordmark.svg'
import wordmarkWhite from '@/assets/melis-wordmark-white.svg'

// Appelé après chaque navigation depuis la sidebar. En mobile, ferme le drawer off-canvas ;
// undefined en desktop (aucun effet). Évite le prop-drilling à travers l'arbre récursif.
const SidebarNavContext = createContext<(() => void) | undefined>(undefined)

function BrandMark() {
  return (
    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary font-[var(--font-display)] text-lg font-bold text-primary-foreground">
      M
    </div>
  )
}

// ─── Recursive nav node ───────────────────────────────────────────────────────

/** Collect every Melis module referenced by a nav node's subtree (via tool forwards).
 *  Also honours `sidebarModule` — a section flagged as a "sidebar host" (e.g. the CMS page tree)
 *  that must attach its module's panel even when it has no accessible tool child. */
function collectModules(node: NavNode, acc: Set<string> = new Set()): Set<string> {
  const mod = node.forward?.module
  if (mod) acc.add(mod)
  if (node.sidebarModule) acc.add(node.sidebarModule)
  node.children.forEach((c) => collectModules(c, acc))
  return acc
}

interface NavNodeProps {
  node: NavNode
  depth: number
  collapsed: boolean
  defaultOpen?: boolean
  /** Optional brick-provided panel (e.g. the CMS page tree) rendered atop this section's children. */
  sidebarPanel?: ReactNode
}

function NavNodeItem({ node, depth, collapsed, defaultOpen = false, sidebarPanel }: NavNodeProps) {
  const [open, setOpen] = useState(defaultOpen)
  const { openTab, activeId } = useTabs()
  const navigate = useNavigate()
  const onNavigate = useContext(SidebarNavContext)
  const Icon = node.icon
  const hasChildren = node.children.length > 0

  // Inline padding so the indentation is never dependent on Tailwind class generation.
  // depth 0 = 12px (px-3 base), depth 1 = 20px, depth 2 = 32px, depth 3+ = 44px
  const indentStyle = collapsed || depth === 0 ? undefined : { paddingLeft: `${12 + depth * 10}px` }

  // Tool node — opens a tab.
  // React routes (native/brick) are always leaves even with nav-children (PHP sub-sections
  // ignored). Iframe (zone) routes — those resolving to a melisKey — follow the original
  // !hasChildren rule, so a section header that also carries a tool route stays collapsible.
  const isZoneRoute = !!node.to && !!melisKeyForRoute(node.to)
  if (node.to && (!hasChildren || !isZoneRoute)) {
    const isActive = activeId === node.to
    return (
      <button
        type="button"
        title={collapsed ? node.label : undefined}
        style={indentStyle}
        onClick={() => {
          openTab({ id: node.to!, label: node.label, path: node.to!, icon: node.icon })
          navigate(node.to!)
          onNavigate?.()
        }}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-md text-sm transition-colors cursor-pointer',
          collapsed ? 'justify-center px-0' : 'px-3',
          // Un tool de 1er niveau (ex. Marketplace) doit ressembler à une section principale.
          depth === 0 ? 'py-2 font-semibold' : 'py-1.5 font-medium',
          isActive
            ? 'bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-primary'
            : depth === 0
              ? 'text-foreground/90 hover:bg-accent hover:text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        )}
      >
        <Icon className={cn('shrink-0', depth === 0 ? 'size-[18px]' : 'size-[15px]')} />
        {!collapsed && <span className="truncate">{node.label}</span>}
      </button>
    )
  }

  // Container node — collapsible accordion
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={collapsed ? node.label : undefined}
        style={indentStyle}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-md py-2 transition-colors cursor-pointer hover:bg-accent hover:text-foreground',
          collapsed ? 'justify-center px-0' : 'px-3',
          depth === 0
            ? 'text-sm font-semibold text-foreground/90'
            : depth === 1
              ? 'text-xs font-semibold uppercase tracking-wider text-muted-foreground'
              : 'text-sm font-medium text-muted-foreground',
          open && depth === 0 && 'text-foreground',
        )}
      >
        <Icon className={cn('shrink-0', depth === 0 ? 'size-[18px]' : 'size-3.5')} />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">{node.label}</span>
            <ChevronRight
              className={cn('size-3 shrink-0 transition-transform', open && 'rotate-90')}
            />
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className={cn('mt-0.5 space-y-0.5', depth === 0 ? 'mb-2' : '')}>
          {sidebarPanel}
          {node.children.map((child, ci) => (
            <NavNodeItem
              key={child.key}
              node={child}
              depth={depth + 1}
              collapsed={collapsed}
              defaultOpen={ci === 0 && depth < 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Nav skeleton ─────────────────────────────────────────────────────────────

function NavSkeleton({ collapsed }: { collapsed: boolean }) {
  const sections = [
    { labelW: 'w-20', items: 3 },
    { labelW: 'w-24', items: 4 },
    { labelW: 'w-16', items: 2 },
  ]

  return (
    <div className="space-y-3 px-1 pt-1" aria-hidden>
      {sections.map((s, si) => (
        <div key={si} className="space-y-1">
          {/* Section label */}
          {!collapsed && (
            <div className={cn('mx-3 mb-1.5 h-2.5 animate-pulse rounded-full bg-muted', s.labelW)} />
          )}
          {/* Item rows */}
          {Array.from({ length: s.items }).map((_, ii) => (
            <div
              key={ii}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-1.5',
                collapsed && 'justify-center px-0',
              )}
            >
              <div className="size-[15px] shrink-0 animate-pulse rounded bg-muted" />
              {!collapsed && (
                <div
                  className={cn(
                    'h-2.5 animate-pulse rounded-full bg-muted',
                    ii % 3 === 0 ? 'w-24' : ii % 3 === 1 ? 'w-32' : 'w-20',
                  )}
                  style={{ animationDelay: `${(si * 3 + ii) * 60}ms` }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean
  /** < 768px : la sidebar devient un drawer off-canvas plein écran (jamais le rail étroit). */
  isMobile?: boolean
  /** Drawer ouvert (mobile uniquement). */
  mobileOpen?: boolean
  /** Ferme le drawer (backdrop, navigation). */
  onClose?: () => void
}

export function Sidebar({ collapsed: collapsedProp, isMobile = false, mobileOpen = false, onClose }: SidebarProps) {
  // En mobile le drawer est toujours DÉPLOYÉ (le rail étroit rendrait les sections indépliables).
  const collapsed = isMobile ? false : collapsedProp
  const { t, lang } = useI18n()
  const { theme } = useTheme()
  const { openTab, activeId } = useTabs()
  const navigate = useNavigate()
  const mark = theme === 'studio' ? wordmarkWhite : wordmark
  // Logo d'en-tête configurable (outil "Platform theme" React). Vide = logo Melis par défaut.
  const { headerLogo, version } = useReactTheme()
  const { nodes: navNodes, loading: navLoading } = useNavMenu()
  // Re-render when module bricks load so their sidebar panels (e.g. CMS page tree) appear.
  const bricks = useBricks()

  const isDashboardActive = activeId === '/'

  return (
    <SidebarNavContext.Provider value={isMobile ? onClose : undefined}>
      {/* Backdrop mobile : ferme le drawer au tap hors sidebar. */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-card',
          isMobile
            ? cn(
                'fixed inset-y-0 left-0 z-50 w-64 shadow-xl transition-transform duration-200',
                mobileOpen ? 'translate-x-0' : '-translate-x-full',
              )
            : cn('shrink-0 transition-[width] duration-200', collapsed ? 'w-[72px]' : 'w-64'),
        )}
      >
      {/* Header / Logo */}
      <div
        className={cn(
          'flex h-14 items-center border-b border-border',
          collapsed ? 'justify-center px-2' : 'px-5',
        )}
      >
        {collapsed
          ? (headerLogo
              ? <img src={headerLogo} alt="Melis Platform" className="size-9 shrink-0 rounded-lg object-contain" />
              : <BrandMark />)
          : (headerLogo
              ? <img src={headerLogo} alt="Melis Platform" className="h-7 w-auto max-w-[180px] object-contain" />
              : <img src={mark} alt="Melis Platform" className="h-6 w-auto" />)}
      </div>

      {/* Dashboard */}
      <div className="border-b border-border p-2">
        <button
          type="button"
          title={collapsed ? t('nav.dashboard') : undefined}
          onClick={() => {
            openTab({ id: '/', label: 'Dashboard', path: '/', icon: LayoutDashboard })
            navigate('/')
            if (isMobile) onClose?.()
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            collapsed && 'justify-center px-0',
            isDashboardActive
              ? 'bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <svg className="size-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          {!collapsed && <span>{t('nav.dashboard')}</span>}
        </button>
      </div>

      {/* Arbre de navigation dynamique */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navLoading ? (
          <NavSkeleton collapsed={collapsed} />
        ) : (
          navNodes.map((section, si) => {
            // Attach a module brick's sidebar panel (if any) to its nav section.
            const brick = bricks.length ? sidebarBrickForModules(collectModules(section)) : undefined
            const Panel = brick?.Sidebar
            return (
              <NavNodeItem
                key={section.key}
                node={section}
                depth={0}
                collapsed={collapsed}
                defaultOpen={si === 0}
                sidebarPanel={Panel ? <Panel /> : undefined}
              />
            )
          })
        )}
      </nav>

      {/* Footer : © année courante + version (sur une seule ligne ; sans "tous droits réservés"). */}
      {!collapsed && (
        <div
          className="overflow-hidden text-ellipsis whitespace-nowrap border-t border-border px-4 py-3 text-[10px] text-muted-foreground/70"
          title={`© ${new Date().getFullYear()} ${t('footer.by')} Melis Technology${version ? ` - ${t('footer.version')}: ${version}` : ''}`}
        >
          © {new Date().getFullYear()} {t('footer.by')}{' '}
          <a href={`https://www.melisplatform.com/${lang}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-foreground">
            Melis Technology
          </a>
          {version && <> - {t('footer.version')}: {version}</>}
        </div>
      )}
      </aside>
    </SidebarNavContext.Provider>
  )
}
