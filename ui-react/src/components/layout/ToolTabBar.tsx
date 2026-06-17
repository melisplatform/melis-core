import { useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBricks } from '@/lib/bricks'
import { useToolTabs } from '@/components/tabs/tool-tab-bridge'

/**
 * Sub-tab bar under the topbar showing the open screens of the active legacy tool (brick) —
 * e.g. the slider's opened sliders/slides — grouped under the tool. Fed by the postMessage
 * bridge (tool-tab-bridge); the tool's own in-iframe strip is hidden.
 *
 * The tool's "list" pane is the leading (non-closable) tab so you can return to it; the opened
 * records follow, each with a × that closes ONLY that record (classic tabClose). Shown only once
 * at least one record is open.
 */
function formatKey(key: string): string {
  return key
    .replace(/^melis(core|sb|cms)?_tool_?/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || key
}

export function ToolTabBar() {
  const { pathname } = useLocation()
  const bricks = useBricks()
  const { tabsFor, activate, close } = useToolTabs()

  // The active tool's melisKey: from a brick route, OR from a generic /zone/:melisKey route
  // (classic tools rendered in the zone pool — e.g. the Sites tool — also publish their tabs).
  const brick = bricks.find(
    (b) => b.route && (pathname === b.route || pathname.startsWith(b.route + '/')),
  )
  const zoneMatch = pathname.match(/^\/zone\/([^/]+)/)
  const melisKey = brick?.melisKey ?? (zoneMatch ? decodeURIComponent(zoneMatch[1]) : null)
  const listLabel = brick?.label ?? (zoneMatch ? formatKey(decodeURIComponent(zoneMatch[1])) : 'Liste')
  const tabs = tabsFor(melisKey)
  const primary = tabs.find((t) => t.primary)
  const secondary = tabs.filter((t) => !t.primary)

  // Show the sub-tab bar ONLY when at least one record (sub-screen) is open. With no record,
  // the tool is on its list and the main top tab already represents it — no redundant 2nd line.
  // When records are open: [list | record1 | record2 …]; closing the last record hides the bar
  // (back to the list). Closing a record removes only it (the bridge switches content to `next`).
  if (!melisKey || secondary.length === 0) return null

  return (
    <div
      className="flex items-stretch border-b border-border bg-muted/30 px-2 overflow-x-auto shrink-0"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* The tool's list pane — leading, non-closable; returns to the list. */}
      {primary && (
        <div
          onClick={() => activate(melisKey, primary.id)}
          style={{ borderBottom: primary.active ? '2px solid var(--color-primary)' : '2px solid transparent' }}
          className={cn(
            'flex cursor-pointer items-center gap-1.5 px-3 text-xs font-semibold whitespace-nowrap select-none transition-colors',
            primary.active ? 'text-foreground bg-background' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
        >
          {listLabel}
        </div>
      )}
      {secondary.map((t) => (
        <div
          key={t.id}
          onClick={() => activate(melisKey, t.id)}
          style={{ borderBottom: t.active ? '2px solid var(--color-primary)' : '2px solid transparent' }}
          className={cn(
            'group flex cursor-pointer items-center gap-1.5 px-3 text-xs font-medium whitespace-nowrap select-none transition-colors',
            t.active ? 'text-foreground bg-background' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
        >
          <span className="max-w-[160px] truncate">{t.label}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); close(melisKey, t.id) }}
            className="ml-0.5 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
