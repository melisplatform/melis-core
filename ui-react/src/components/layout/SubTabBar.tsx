import { CornerDownRight, FileText, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSubTabs } from '@/components/tabs/sub-tab-store'
import { MODULES } from '@/lib/module-registry'
import { useBricks, brickRoute } from '@/lib/bricks'
import { routeForForward, useToolRoutesVersion } from '@/lib/tool-routes'
import { usePublishedToolView } from '@/lib/tool-view-mode'
import { useI18n } from '@/i18n/i18n-context'

function SubTabBarInner({
  sectionKey, listPath, tabIcon: TabIcon,
}: { sectionKey: string; listPath: string; tabIcon: React.ElementType }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { t } = useI18n()
  const { tabs, closeTab } = useSubTabs(sectionKey)

  if (tabs.length === 0) return null

  /**
   * Profondeur du sous-onglet sous la racine de l'outil : 1 = un enregistrement
   * (/[section]/[tool]/:id), 2+ = un sous-enregistrement (/[section]/[tool]/:id/:subId — ex. une
   * slide DANS un slider). Dérivée du CHEMIN : rien à déclarer côté outil, et les outils à 2
   * niveaux (Utilisateurs…) restent à 1 partout.
   */
  function depthOf(path: string): number {
    return path.startsWith(sectionKey + '/') ? path.slice(sectionKey.length + 1).split('/').length : 1
  }

  function handleClose(e: React.MouseEvent, tabId: string) {
    e.stopPropagation()
    const closed = tabs.find(t => t.id === tabId)
    const idx = tabs.findIndex(t => t.id === tabId)
    closeTab(tabId)
    // Fermer un onglet dont on AFFICHE le contenu — ou celui d'un de ses descendants, fermés avec lui
    // (cf. sub-tab-store) — doit quitter son URL, sinon l'écran reste monté sans onglet.
    const showing = closed && (pathname === closed.path || pathname.startsWith(closed.path + '/'))
    if (showing) {
      const survives = (t: { path: string }) => !(t.path === closed!.path || t.path.startsWith(closed!.path + '/'))
      const next = tabs.slice(idx + 1).find(survives) ?? tabs.slice(0, idx).reverse().find(survives)
      navigate(next ? next.path : listPath)
    }
  }

  return (
    <div
      className="flex items-stretch border-b border-border bg-muted/30 px-2 overflow-x-auto shrink-0"
      style={{ scrollbarWidth: 'none' }}
    >
      <button
        type="button"
        onClick={() => navigate(listPath)}
        className="mr-1 shrink-0 flex items-center px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
      >
        ← {t('common.back')}
      </button>
      {tabs.map(tab => {
        const isActive = pathname === tab.path
        // Un sous-onglet imbriqué (niveau 3) porte le chevron « ↳ » plutôt que l'icône de l'outil,
        // comme le panneau d'onglets mobile — il se lit alors comme rattaché à celui qui le précède.
        const nested = depthOf(tab.path) > 1
        const Icon = nested ? CornerDownRight : TabIcon
        return (
          <div
            key={tab.id}
            onClick={() => navigate(tab.path)}
            style={{
              borderBottom: isActive
                ? '2px solid var(--color-primary)'
                : '2px solid transparent',
            }}
            className={cn(
              'group flex cursor-pointer items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap select-none',
              nested && 'pl-1.5',
              isActive
                ? 'text-foreground bg-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            )}
          >
            <Icon className={cn('size-3 shrink-0', nested && 'opacity-60')} />
            <span className="max-w-[140px] truncate">{tab.label}</span>
            <button
              type="button"
              onClick={(e) => handleClose(e, tab.id)}
              className={cn(
                'ml-0.5 rounded p-0.5 transition-all hover:bg-muted',
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
              )}
            >
              <X className="size-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function SubTabBar() {
  // Re-render once tool routes register so the derived routes become available.
  useToolRoutesVersion()
  const { pathname } = useLocation()
  const bricks = useBricks()
  // Sections keyed by the tree-DERIVED route (App.tsx mounts tools there via routeForForward),
  // NOT the static registry m.route — else the bar never matches /[section]/[tool]/:id and the
  // sub-tab navigation (← retour + named tabs) never appears. Native MelisCore tools (MODULES)
  // PLUS module bricks that opted in (manifest subTabs:true) both use this SAME bar — a brick
  // registers its opened records through window.__melisOpenSubTab keyed by its route.
  const sections = [
    ...MODULES.map((m) => ({ key: routeForForward(m.forwardKey) ?? m.route, icon: m.icon ?? FileText, melisKey: m.melisKey })),
    ...bricks.filter((b) => b.subTabs).map((b) => ({ key: brickRoute(b), icon: FileText as React.ElementType, melisKey: b.melisKey })),
  ]
  const section = sections.find((s) => s.key && (pathname === s.key || pathname.startsWith(s.key + '/')))
  // Symétrique de la ToolTabBar : quand la vue « Old » (iframe legacy) d'un outil à toggle est
  // affichée, c'est ELLE qui pilote les onglets (ToolTabBar) — les sous-onglets React ouverts
  // avant la bascule doubleraient les siens (deux onglets « Nouveau »). On les masque sans les
  // fermer : revenir en vue « New » les réaffiche tels quels. `usePublishedToolView` (et non
  // `useToolView`, dont le défaut est `iframe`) : un outil SANS toggle ne publie rien et garde
  // évidemment ses sous-onglets.
  const publishedView = usePublishedToolView(section?.melisKey ?? null)
  if (!section || publishedView === 'iframe') return null
  return <SubTabBarInner sectionKey={section.key} listPath={section.key} tabIcon={section.icon} />
}
