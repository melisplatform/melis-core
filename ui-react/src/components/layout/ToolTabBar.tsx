import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBricks, brickRoute, bricksReady } from '@/lib/bricks'
import { useToolTabs } from '@/components/tabs/tool-tab-bridge'
import { melisKeyForRoute, toolBaseRoute, parseToolTabId, subtoolName, useToolRoutesVersion } from '@/lib/tool-routes'
import { useToolView } from '@/lib/tool-view-mode'

/**
 * Sub-tab bar under the topbar showing the open screens of the active legacy tool (brick) —
 * e.g. the slider's opened sliders/slides — grouped under the tool. Fed by the postMessage
 * bridge (tool-tab-bridge); the tool's own in-iframe strip is hidden.
 *
 * The tool's "list" pane is the leading (non-closable) tab so you can return to it; the opened
 * records follow, each with a × that closes ONLY that record (classic tabClose). Shown only once
 * at least one record is open.
 */
// Router basename (same as App's BrowserRouter): prod serves under /melis-react, dev at root.
const BASENAME = import.meta.env.PROD ? '/melis-react' : ''

// Outils dont la vue React gère ELLE-MÊME ses sous-onglets ET son URL (état local, /[section]/[tool]/:id
// reflété via history.replaceState) → le host ne réécrit PAS leur URL, sinon l'effet ci-dessous
// la remettrait à la base. La ToolTabBar, elle, RESTE rendue : c'est elle qui pilote les onglets de
// la vue « Old » (iframe legacy) — cf. commentaire du rendu plus bas.
const SELF_MANAGED_URL = new Set(['meliscms_tool_sites', 'MelisCmsSlider_left_menu', 'meliscmsnews_left_menu'])

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
  useToolRoutesVersion()
  const { tabsFor, activate, close } = useToolTabs()

  // The active tool's melisKey: from a brick route, OR from a tree-derived /[section]/[tool]
  // route (classic tools in the zone pool — e.g. the Sites tool — also publish their tabs).
  const brick = bricks.find((b) => {
    const r = brickRoute(b)
    return r && (pathname === r || pathname.startsWith(r + '/'))
  })
  const zoneKey = melisKeyForRoute(pathname)
  const melisKey = brick?.melisKey ?? zoneKey
  const listLabel = brick?.label ?? (zoneKey ? formatKey(zoneKey) : 'Liste')
  const tabs = tabsFor(melisKey)
  const primary = tabs.find((t) => t.primary)
  const secondary = tabs.filter((t) => !t.primary)
  // Vue courante de l'outil (toggle New/Old d'une brique) — cf. lib/tool-view-mode.
  const toolView = useToolView(melisKey)

  // Reflect the active record drill-down in the URL: /[section]/[tool]/[id]/[subtool]/[id]…
  // Cosmetic only (history.replaceState) — it never spawns a top tab nor touches React Router,
  // so the tab system is untouched. The deep URL is rebuilt from the open sub-tabs' data-ids
  // ("<entityId>_id_<targetMelisKey>"): the first record level is just its id, deeper levels add
  // the sub-entity name. (Forward reflection; a deep-link reload opens the tool at its list.)
  useEffect(() => {
    if (!melisKey) return
    // Outils auto-gérés : ils possèdent leur URL (reflètent eux-mêmes /:id) → ne pas la réécrire.
    if (SELF_MANAGED_URL.has(melisKey)) return
    // ⚠️ Sur un cold load, `zoneKey` (melisKeyForRoute) peut se résoudre depuis une entrée PÉRIMÉE
    // de sessionStorage (`melis-tool-routes`), hydratée en synchrone avant même le fetch du menu —
    // ex. un outil devenu une brique React (`subTabs:true`) mais encore enregistré ici avec un
    // vrai melisKey lors d'une session précédente. Tant que les briques n'ont pas fini de charger
    // (bricksReady), on ne peut pas distinguer un vrai outil iframe d'une brique mal enregistrée :
    // agir maintenant réécrirait l'URL (efface le /:id fraîchement posé par la brique) AVANT que
    // useNavMenu ne corrige l'entrée à son prochain passage — dommage irréversible (replaceState).
    if (!bricksReady()) return
    const base = toolBaseRoute(pathname)
    const nonPrimary = tabs.filter((t) => !t.primary)
    // ⚠️ Cet effet ne reflète QUE les sous-onglets publiés par un OUTIL IFRAME (tool-tab-bridge).
    // Sans onglet bridge, l'URL est gérée par React Router (outil NATIF ou brique React, dont les
    // briques `subTabs:true` qui `navigate(base/:id)`). La réécrire ici EFFACERAIT le /:id d'édition
    // juste posé (tabsFor() renvoie un nouveau [] à chaque render → cet effet tourne à chaque render,
    // d'où le /1 « immédiatement retiré »). On ne remet donc à la base QUE les vrais outils iframe
    // (zoneKey non-null) ; pour un outil React (zoneKey null même si brick.melisKey existe), on ne
    // touche pas à l'URL.
    if (nonPrimary.length === 0) {
      if (zoneKey) {
        const full = BASENAME + base
        if (window.location.pathname !== full) window.history.replaceState(window.history.state, '', full)
      }
      return
    }
    const activeIdx = nonPrimary.findIndex((t) => t.active)
    let target = base
    if (activeIdx >= 0) {
      const segs = nonPrimary.slice(0, activeIdx + 1).map((t, i) => {
        const p = parseToolTabId(t.id)
        const id = encodeURIComponent(p?.id ?? t.id)
        return i === 0 ? id : `${subtoolName(p?.target ?? '')}/${id}`
      })
      target = base + '/' + segs.join('/')
    }
    // React Router paths are basename-relative; window.location is absolute → prepend the
    // basename so the URL stays under /melis-react in prod.
    const full = BASENAME + target
    if (window.location.pathname !== full) {
      window.history.replaceState(window.history.state, '', full)
    }
  }, [tabs, melisKey, zoneKey, pathname])

  // Show the sub-tab bar ONLY when at least one record (sub-screen) is open. With no record,
  // the tool is on its list and the main top tab already represents it — no redundant 2nd line.
  // When records are open: [list | record1 | record2 …]; closing the last record hides the bar
  // (back to the list). Closing a record removes only it (the bridge switches content to `next`).
  //
  // Ces onglets viennent TOUJOURS d'une iframe legacy (tool-tab-bridge) — outil classique du pool
  // de zones, ou vue « Old » d'un outil React (toggle New/Old). Dans les deux cas l'édition reste
  // LEGACY, dans l'iframe : cette barre ne fait que la piloter (tabSwitch/tabClose). Un outil React
  // n'a jamais d'onglet ici (ses écrans passent par React Router ou sa barre in-tool), donc pas de
  // 2ᵉ barre empilée dans les faits — et surtout, ouvrir un enregistrement en vue Old ne doit PAS
  // rebasculer sur l'éditeur React (les briques News/Sites/Slider détournaient ces messages).
  //
  // ⚠️ Sauf que l'iframe de la vue « Old » RESTE montée (display:none) quand on repasse en vue React :
  // elle continue de publier ses onglets, qui doublonnaient alors la barre de sous-onglets de la vue
  // React (deux onglets pour le même enregistrement). Les onglets legacy ne sont donc rendus que
  // lorsque la vue « Old » de l'outil est active (défaut pour un outil legacy sans toggle).
  if (!melisKey || secondary.length === 0 || toolView === 'react') return null

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
