import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight, Plus, X, type LucideIcon } from 'lucide-react'
import { GridStack } from 'gridstack'

import { cn } from '@/lib/utils'
import { Collapsible } from '@/components/ui/collapsible'
import { useI18n } from '@/i18n/i18n-context'
import { getMelisIcon } from '@/lib/melis-icons'
import { makeInstanceId } from './dashboard-store'
import { WIDGETS, WIDGET_SECTIONS, type WidgetDef } from './widget-registry'

/** Panneau latéral listant les widgets disponibles à ajouter (clic ou drag).
 *  Équivalent du panneau de plugins Melis (dashboard-menu-content.phtml).
 *  Un widget peut être posé plusieurs fois : `present` sert seulement à afficher
 *  un indicateur "déjà sur le dashboard", pas à bloquer l'ajout. */
export function WidgetPalette({
  present,
  onAdd,
  onClose,
  onRemoveAll,
  widgetCount,
  nativeWidgets = WIDGETS,
  extraWidgets = [],
  loadThumbnails = true,
  fullWidth = false,
}: {
  present: Set<string>
  onAdd: (widgetId: string) => void
  onClose: () => void
  /** Vide le dashboard — cf. `dashboard-plugin-delete-all` du legacy. */
  onRemoveAll: () => void
  /** Nombre de tuiles POSÉES (pas de widgets distincts) : sert à désactiver « tout supprimer »
   *  sur un dashboard déjà vide, comme le `if ($items.length !== 0)` du legacy. */
  widgetCount: number
  /** Native widgets to offer — already RIGHTS-GATED by the caller (defaults to all for safety). */
  nativeWidgets?: WidgetDef[]
  extraWidgets?: WidgetDef[]
  /** Autorise le chargement des vignettes de plugins. Piloté par le dashboard : `false` tant que la
   *  palette n'a jamais été ouverte, pour ne charger AUCUNE image au premier rendu (cf. PaletteItem). */
  loadThumbnails?: boolean
  /** Mobile : le panneau occupe toute la largeur (il est alors posé en surimpression sur la grille
   *  par le dashboard) au lieu de sa colonne fixe de 18rem. Faux par défaut → desktop inchangé. */
  fullWidth?: boolean
}) {
  const { t } = useI18n()
  // Refs sur les wrappers draggables, indexés par widgetId.
  const wrapperRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Accordéon à 2 niveaux, calqué sur le legacy (melisCore.js, showPlugLists/showCatPlugLists) :
  // tout est REPLIÉ au départ, et un seul groupe ouvert par niveau — ouvrir une section referme
  // la précédente. Refermer une section réinitialise aussi le module ouvert à l'intérieur.
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [openModule, setOpenModule] = useState<string | null>(null)
  // Confirmation avant de vider le dashboard — le legacy passe par `melisCoreTool.confirm()`.
  const [confirmRemoveAll, setConfirmRemoveAll] = useState(false)
  const toggleSection = (key: string) =>
    setOpenSection((cur) => {
      setOpenModule(null)
      return cur === key ? null : key
    })
  const toggleModule = (key: string) => setOpenModule((cur) => (cur === key ? null : key))

  // Configure le drag-in GridStack pour tous les widgets (y compris déjà posés,
  // pour permettre d'en glisser une nouvelle instance). Chaque source de drag
  // reçoit un id d'instance fraîchement généré à chaque (re-)rendu de l'effet,
  // donc un drag après un ajout précédent ne peut pas entrer en collision.
  useEffect(() => {
    const allWidgetMap = { ...Object.fromEntries(nativeWidgets.map((w) => [w.id, w])), ...Object.fromEntries(extraWidgets.map((w) => [w.id, w])) }
    const els: HTMLElement[] = []
    const widgets: import('gridstack').GridStackWidget[] = []

    wrapperRefs.current.forEach((el, widgetId) => {
      const def = allWidgetMap[widgetId]
      if (!def) return
      els.push(el)
      widgets.push({ id: makeInstanceId(widgetId), w: def.w, h: def.h, minW: def.minW, minH: def.minH })
    })

    if (els.length) {
      GridStack.setupDragIn(els, { helper: 'clone', appendTo: 'body' }, widgets)
    }
    // Pas de dépendance à l'état de l'accordéon : `Collapsible` garde le contenu MONTÉ même replié
    // (cf. son commentaire), donc tous les wrappers existent dès ce passage et sont enregistrés en
    // une fois. Un groupe qu'on déplie livre des widgets déjà draggables.
  }, [present, nativeWidgets, extraWidgets])

  return (
    <aside
      data-widget-palette
      className={cn(
        'flex shrink-0 flex-col border-l border-border bg-card',
        fullWidth ? 'w-full' : 'w-72',
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-[var(--font-display)] text-sm font-semibold">{t('widget.add')}</h2>
        <button
          type="button"
          onClick={onClose}
          className="grid size-7 cursor-pointer place-items-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={t('widget.done')}
        >
          <X className="size-4" />
        </button>
      </div>

      <p className="px-4 py-2.5 text-xs text-muted-foreground">{t('widget.palette_hint')}</p>

      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {WIDGET_SECTIONS.map((sectionKey) => {
          // Les widgets natifs déclarant un `sectionLabel` sont rendus plus bas, dans le groupe
          // dynamique du module correspondant (ex. Recent activity → MELISCORE).
          const items = nativeWidgets.filter((w) => w.sectionKey === sectionKey && !w.sectionLabel)
          if (!items.length) return null
          const key = `sec:${sectionKey}`
          return (
            <div key={sectionKey}>
              {/* Même icône Melis que la nav de gauche (getMelisIcon), dérivée du libellé de section. */}
              <GroupHeader
                label={t(sectionKey)}
                icon={getMelisIcon(t(sectionKey))}
                open={openSection === key}
                onToggle={() => toggleSection(key)}
              />
              <Collapsible open={openSection === key}>
                <div className="mt-0.5 mb-2 space-y-1">
                  {items.map((w) => (
                    <PaletteItem
                      key={w.id}
                      widget={w}
                      added={present.has(w.id)}
                      onAdd={() => onAdd(w.id)}
                      showThumbnail={loadThumbnails}
                      wrapperRef={(el) => {
                        if (el) wrapperRefs.current.set(w.id, el)
                        else wrapperRefs.current.delete(w.id)
                      }}
                    />
                  ))}
                </div>
              </Collapsible>
            </div>
          )
        })}

        {/* Sections dynamiques — même hiérarchie que la palette legacy (dashboard-menu-content.phtml) :
            SECTION Melis (MelisCore, MelisCms, MelisMarketing, MelisCommerce…) → sous-groupes par
            MODULE. Comme en legacy, le sous-titre module n'apparaît que si la section contient
            plusieurs modules (sinon il ferait doublon avec le titre de section).
            L'ordre des sections/modules vient du backend (cf. legacy-plugins), qui reproduit l'ordre
            marketplace/fallback de organizedPluginsBySection() — rien n'est retrié ici.
            Les widgets natifs rattachés à une section (sectionLabel) sont fusionnés dans ces groupes. */}
        {(() => {
          const dynamicWidgets = [...nativeWidgets.filter((w) => w.sectionLabel), ...extraWidgets]
          if (!dynamicWidgets.length) return null

          const sections = new Map<string, Map<string, WidgetDef[]>>()
          for (const w of dynamicWidgets) {
            const sectionLabel = w.sectionLabel ?? w.sectionKey
            const moduleLabel = w.moduleLabel ?? sectionLabel
            if (!sections.has(sectionLabel)) sections.set(sectionLabel, new Map())
            const modules = sections.get(sectionLabel)!
            if (!modules.has(moduleLabel)) modules.set(moduleLabel, [])
            modules.get(moduleLabel)!.push(w)
          }

          const renderItem = (w: WidgetDef) => (
            <PaletteItem
              key={w.id}
              widget={w}
              added={present.has(w.id)}
              onAdd={() => onAdd(w.id)}
              showThumbnail={loadThumbnails}
              wrapperRef={(el) => {
                if (el) wrapperRefs.current.set(w.id, el)
                else wrapperRefs.current.delete(w.id)
              }}
            />
          )

          return Array.from(sections.entries()).map(([sectionLabel, modules]) => {
            // Un seul module dans la section → pas de 2ᵉ niveau d'accordéon : le sous-titre ferait
            // doublon avec le titre de section (règle déjà en place avant les groupes repliables)
            // et on imposerait deux clics pour atteindre un unique widget.
            const showModuleTitles = modules.size > 1
            const sectionKey = `dyn:${sectionLabel}`
            return (
              <div key={sectionLabel}>
                <GroupHeader
                  label={sectionLabel === 'CustomProjects' ? 'Custom / Projects' : sectionLabel}
                  // Même icône Melis que la nav de gauche : on la dérive du `sectionLabel` BRUT
                  // (clé de module — 'CustomProjects', 'MelisCms'…), pas du libellé affiché.
                  icon={getMelisIcon(sectionLabel)}
                  open={openSection === sectionKey}
                  onToggle={() => toggleSection(sectionKey)}
                />
                <Collapsible open={openSection === sectionKey}>
                  <div className="mt-0.5 mb-2 space-y-0.5">
                    {Array.from(modules.entries()).map(([moduleLabel, items]) => {
                      if (!showModuleTitles) {
                        return <div key={moduleLabel} className="space-y-1">{items.map(renderItem)}</div>
                      }
                      const moduleKey = `${sectionKey}::${moduleLabel}`
                      return (
                        <div key={moduleLabel}>
                          <GroupHeader
                            label={moduleLabel}
                            level="module"
                            open={openModule === moduleKey}
                            onToggle={() => toggleModule(moduleKey)}
                          />
                          <Collapsible open={openModule === moduleKey}>
                            <div className="mt-0.5 space-y-1">{items.map(renderItem)}</div>
                          </Collapsible>
                        </div>
                      )
                    })}
                  </div>
                </Collapsible>
              </div>
            )
          })
        })()}
      </div>

      {/* Pied de panneau — équivalent du `#dashboard-plugin-delete-all` legacy, en bas du menu.
          `shrink-0` : le pied reste visible, c'est la liste au-dessus qui défile. */}
      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={() => setConfirmRemoveAll(true)}
          // Dashboard déjà vide → rien à supprimer. Le legacy sortait silencieusement
          // (`if ($items.length !== 0)`) ; désactiver le bouton dit la même chose, en visible.
          disabled={widgetCount === 0}
          // `dashboard-remove-all-btn` : le thème sombre (studio) remplace le rouge plein par un
          // traitement destructif discret (cf. index.css) pour s'accorder aux surfaces bleu-nuit.
          className="dashboard-remove-all-btn w-full cursor-pointer rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('widget.remove_all')}
        </button>
      </div>

      {confirmRemoveAll && (
        <ConfirmRemoveAllDialog
          onCancel={() => setConfirmRemoveAll(false)}
          onConfirm={() => {
            setConfirmRemoveAll(false)
            onRemoveAll()
          }}
        />
      )}
    </aside>
  )
}

/** Confirmation « supprimer tous les plugins » — pendant React du `melisCoreTool.confirm()` legacy
 *  (mêmes titre, message et libellés Oui/Non). Rendue en portail sur `body` comme
 *  `WidgetConfigDialog` : la palette est dans un conteneur `overflow-hidden` (l'animation de
 *  largeur), une modale rendue sur place s'y ferait rogner. */
function ConfirmRemoveAllDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const { t } = useI18n()
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-[var(--font-display)] text-sm font-semibold">{t('widget.remove_all_title')}</h2>
        </div>
        <p className="px-4 py-4 text-sm text-muted-foreground">{t('widget.remove_all_confirm')}</p>
        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-md border border-input bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            {t('common.no')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            {t('common.yes')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** En-tête de groupe repliable — calqué sur la nav de gauche (Sidebar.tsx) pour une lecture homogène :
 *  niveau `section` = icône Melis colorée + libellé `text-sm font-semibold` (comme un module de la nav) ;
 *  niveau `module` = sous-titre `uppercase tracking-wider` discret mais lisible (comme une catégorie
 *  de la nav). Chevron `ChevronRight` qui pivote de 90°, à l'identique du menu. */
function GroupHeader({
  label,
  open,
  onToggle,
  level = 'section',
  /** Icône Melis (niveau `section`). Niveau `module` : aucune icône, comme le legacy. */
  icon: Icon,
}: {
  label: string
  open: boolean
  onToggle: () => void
  level?: 'section' | 'module'
  icon?: LucideIcon
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 text-left transition-colors hover:bg-accent hover:text-foreground',
        level === 'section'
          ? cn('py-2 text-sm font-semibold', open ? 'text-foreground' : 'text-foreground/90')
          : 'py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
      )}
    >
      {Icon && <Icon className="size-[18px] shrink-0" />}
      <span className="flex-1 truncate">{label}</span>
      {/* Chevron pivoté plutôt qu'échangé contre une autre icône : la rotation est animable et
          garde la même empreinte, donc l'en-tête ne « saute » pas au dépliage. */}
      <ChevronRight className={cn('size-3 shrink-0 transition-transform', open && 'rotate-90')} />
    </button>
  )
}

function PaletteItem({
  widget,
  added,
  onAdd,
  wrapperRef,
  showThumbnail,
}: {
  widget: WidgetDef
  added: boolean
  onAdd: () => void
  wrapperRef: (el: HTMLDivElement | null) => void
  /** Ne charge la vignette (requête image, servie par PHP) que si vrai. La palette étant fermée au
   *  départ, on diffère jusqu'à sa 1ʳᵉ ouverture pour ne PAS tirer ~N images au chargement du
   *  dashboard (elles passent par MelisAssetManager qui sérialise sur le verrou de session PHP). */
  showThumbnail: boolean
}) {
  const { t } = useI18n()
  const Icon = widget.icon

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'group flex cursor-grab items-center gap-1 rounded-md border border-border/70 bg-background transition-colors active:cursor-grabbing',
        'hover:border-primary/40 hover:bg-accent',
      )}
      // Infobulle NATIVE, comme le menu de plugins legacy (`title="<?= description ?>"` dans
      // dashboard-menu-content.phtml) : on affiche la description déclarée par le plugin, et on
      // retombe sur l'aide au glisser-déposer quand il n'en déclare aucune.
      title={widget.description || t('layout.widget_drag_hint')}
    >
      {/* Zone d'ajout au clic — ajoute toujours une nouvelle instance, même si déjà présente.
          ⚠️ Surtout PAS un <button> : le drag de GridStack (DDDraggable) ignore les mousedown
          survenant sur `input,textarea,button,select,option…` — avec un <button> ici, seule la
          poignée restait draggable. Un div + role="button" garde le clic ET le drag. */}
      <div
        role="button"
        tabIndex={0}
        onClick={onAdd}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onAdd()
          }
        }}
        className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-3 pr-3 text-left"
      >
        {widget.thumbnail && showThumbnail ? (
          <img
            src={widget.thumbnail}
            alt=""
            // draggable=false + pointer-events-none : sinon le drag natif HTML5 de l'image
            // détourne le drag GridStack de la tuile (le glisser-déposer ne marche plus).
            draggable={false}
            className="pointer-events-none size-8 shrink-0 select-none rounded-md border border-border/70 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid size-8 shrink-0 place-items-center rounded-md bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-primary">
            <Icon className="size-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {widget.titleLabel ?? t(widget.titleKey)}
          </div>
          {added && <div className="text-[11px] text-muted-foreground">{t('widget.in_dashboard')}</div>}
        </div>
        <Plus className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>
    </div>
  )
}
