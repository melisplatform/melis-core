import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, LayoutDashboard } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import { useTheme } from '@/theme/theme-context'
import { useNavMenu, type NavNode } from '@/hooks/useNavMenu'
import { useBricks, sidebarBrickForModules } from '@/lib/bricks'
import { useTabs } from '@/components/tabs/tab-store'
import wordmark from '@/assets/melis-wordmark.svg'
import wordmarkWhite from '@/assets/melis-wordmark-white.svg'

function BrandMark() {
  return (
    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary font-[var(--font-display)] text-lg font-bold text-primary-foreground">
      M
    </div>
  )
}

// ─── Recursive nav node ───────────────────────────────────────────────────────

/** Collect every Melis module referenced by a nav node's subtree (via tool forwards). */
function collectModules(node: NavNode, acc: Set<string> = new Set()): Set<string> {
  const mod = node.forward?.module
  if (mod) acc.add(mod)
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
  const Icon = node.icon
  const hasChildren = node.children.length > 0

  const indent = depth === 0 ? '' : depth === 1 ? 'pl-3' : depth === 2 ? 'pl-5' : 'pl-7'

  // Tool node — opens a tab.
  // React routes (!zone) are always leaves even with nav-children (PHP sub-sections ignored).
  // Zone routes follow the original !hasChildren rule (section headers stay collapsible).
  if (node.to && (!hasChildren || !node.to.startsWith('/zone/'))) {
    const isActive = activeId === node.to
    return (
      <button
        type="button"
        title={collapsed ? node.label : undefined}
        onClick={() => {
          openTab({ id: node.to!, label: node.label, path: node.to!, icon: node.icon })
          navigate(node.to!)
        }}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-md py-1.5 text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-0' : `px-3 ${indent}`,
          isActive
            ? 'bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        )}
      >
        <Icon className="size-[15px] shrink-0" />
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
        className={cn(
          'flex w-full items-center gap-2.5 rounded-md py-2 transition-colors hover:bg-accent hover:text-foreground',
          collapsed ? 'justify-center px-0' : `px-3 ${indent}`,
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

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { t } = useI18n()
  const { theme } = useTheme()
  const { openTab, activeId } = useTabs()
  const navigate = useNavigate()
  const mark = theme === 'studio' ? wordmarkWhite : wordmark
  const { nodes: navNodes, loading: navLoading } = useNavMenu()
  // Re-render when module bricks load so their sidebar panels (e.g. CMS page tree) appear.
  const bricks = useBricks()

  const isDashboardActive = activeId === '/'

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Header / Logo */}
      <div
        className={cn(
          'flex h-14 items-center border-b border-border',
          collapsed ? 'justify-center px-2' : 'px-5',
        )}
      >
        {collapsed ? <BrandMark /> : <img src={mark} alt="Melis Platform" className="h-6 w-auto" />}
      </div>

      {/* Dashboard */}
      <div className="border-b border-border p-2">
        <button
          type="button"
          title={collapsed ? t('nav.dashboard') : undefined}
          onClick={() => {
            openTab({ id: '/', label: 'Dashboard', path: '/', icon: LayoutDashboard })
            navigate('/')
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
    </aside>
  )
}
