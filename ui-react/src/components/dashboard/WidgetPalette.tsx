import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Plus, X } from 'lucide-react'
import { GridStack } from 'gridstack'

import { cn } from '@/lib/utils'
import { Collapsible } from '@/components/ui/collapsible'
import { useI18n } from '@/i18n/i18n-context'
import { makeInstanceId } from './dashboard-store'
import { WIDGETS, WIDGET_SECTIONS, WIDGET_MAP, type WidgetDef } from './widget-registry'

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
  extraWidgets = [],
}: {
  present: Set<string>
  onAdd: (widgetId: string) => void
  onClose: () => void
  /** Vide le dashboard — cf. `dashboard-plugin-delete-all` du legacy. */
  onRemoveAll: () => void
  /** Nombre de tuiles POSÉES (pas de widgets distincts) : sert à désactiver « tout supprimer »
   *  sur un dashboard déjà vide, comme le `if ($items.length !== 0)` du legacy. */
  widgetCount: number
  extraWidgets?: WidgetDef[]
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
    const allWidgetMap = { ...WIDGET_MAP, ...Object.fromEntries(extraWidgets.map((w) => [w.id, w])) }
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
  }, [present, extraWidgets])

  return (
    <aside data-widget-palette className="flex w-72 shrink-0 flex-col border-l border-border bg-card">
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

      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {WIDGET_SECTIONS.map((sectionKey) => {
          // Les widgets natifs déclarant un `sectionLabel` sont rendus plus bas, dans le groupe
          // dynamique du module correspondant (ex. Recent activity → MELISCORE).
          const items = WIDGETS.filter((w) => w.sectionKey === sectionKey && !w.sectionLabel)
          if (!items.length) return null
          const key = `sec:${sectionKey}`
          return (
            <div key={sectionKey}>
              {/* Sections natives React (pas des sections marketplace) → `section=""` : aucune
                  couleur ne leur correspond, elles prennent le rouge plateforme par défaut,
                  comme n'importe quelle section inconnue du helper legacy. */}
              <GroupHeader
                label={t(sectionKey)}
                section=""
                open={openSection === key}
                onToggle={() => toggleSection(key)}
              />
              <Collapsible open={openSection === key}>
                <div className="space-y-1.5">
                  {items.map((w) => (
                    <PaletteItem
                      key={w.id}
                      widget={w}
                      added={present.has(w.id)}
                      onAdd={() => onAdd(w.id)}
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
          const dynamicWidgets = [...WIDGETS.filter((w) => w.sectionLabel), ...extraWidgets]
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
                  // `sectionLabel` BRUT (pas le libellé affiché) : c'est la clé du helper legacy —
                  // 'CustomProjects' porte une couleur, 'Custom / Projects' n'en aurait aucune.
                  section={sectionLabel}
                  open={openSection === sectionKey}
                  onToggle={() => toggleSection(sectionKey)}
                />
                <Collapsible open={openSection === sectionKey}>
                  <div className="space-y-2.5">
                    {Array.from(modules.entries()).map(([moduleLabel, items]) => {
                      if (!showModuleTitles) {
                        return <div key={moduleLabel} className="space-y-1.5">{items.map(renderItem)}</div>
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
                            <div className="space-y-1.5">{items.map(renderItem)}</div>
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
          className="w-full cursor-pointer rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-40"
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

/** Couleur de pastille par section marketplace — reprise à l'identique du helper PHP legacy
 *  `MelisCoreSectionIconsHelper` (une seule et même icône Melis, seul le fond change).
 *  Section inconnue → rouge plateforme, exactement comme la branche `else` du helper. */
const SECTION_COLORS: Record<string, string> = {
  MelisCore: '#ee6622',
  MelisCms: '#69b344',
  MelisMarketing: '#70469c',
  MelisCommerce: '#2780c4',
  CustomProjects: '#676767',
}

/** Logo Melis sur carré arrondi coloré — portage React du SVG inline du helper legacy
 *  (mêmes `path`/`circle`, même viewBox 0 0 80 80). Aucun appel PHP : la seule variable est
 *  la couleur de fond, donnée par `SECTION_COLORS`. */
function SectionIcon({ section }: { section: string }) {
  return (
    <svg viewBox="0 0 80 80" className="size-5 shrink-0" aria-hidden="true" focusable="false">
      <rect fill={SECTION_COLORS[section] ?? '#ff0000'} x=".07" y=".13" width="79.86" height="79.86" rx="15.36" ry="15.36" />
      <path fill="#FFFFFF" d="M57.78,15.87c-3.47,0-6.29,2.81-6.29,6.29v35.85c0,3.47,2.81,6.29,6.29,6.29s6.29-2.81,6.29-6.29V22.16c0-3.47-2.81-6.29-6.29-6.29Z" />
      <path fill="#FFFFFF" d="M27.79,19.16c-1.62-3.07-5.43-4.24-8.5-2.62-3.07,1.62-4.24,5.43-2.62,8.5l19.01,35.93c1.62,3.07,5.43,4.24,8.5,2.62,3.07-1.62,4.24-5.43,2.62-8.5L27.79,19.16Z" />
      <circle fill="#FFFFFF" cx="22.36" cy="57.88" r="6.43" />
    </svg>
  )
}

/** En-tête de groupe repliable — équivalent des `melis-core-dashboard-filter-btn` (section) et
 *  `melis-core-dashboard-category-btn` (module) du legacy, chevron `fa-angle-down` compris.
 *  Deux niveaux : `section` (majuscules, appuyé) et `module` (plus discret, légèrement indenté). */
function GroupHeader({
  label,
  open,
  onToggle,
  level = 'section',
  /** Clé de section pour la pastille colorée. Niveau `module` : aucune icône, comme le legacy. */
  section,
}: {
  label: string
  open: boolean
  onToggle: () => void
  level?: 'section' | 'module'
  section?: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={cn(
        'mb-1.5 flex w-full cursor-pointer items-center gap-2 rounded px-1 py-1 text-left transition-colors hover:bg-accent',
        level === 'section'
          ? 'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70'
          : 'pl-2 text-[11px] font-medium text-muted-foreground/60',
      )}
    >
      {section !== undefined && <SectionIcon section={section} />}
      {/* `mr-auto` plutôt qu'un `justify-between` sur le parent : avec l'icône en tête, seul le
          libellé doit absorber l'espace libre, sinon un trou se creuse entre icône et texte. */}
      <span className="mr-auto truncate">{label}</span>
      {/* Chevron pivoté plutôt qu'échangé contre une autre icône : la rotation est animable et
          garde la même empreinte, donc l'en-tête ne « saute » pas au dépliage. */}
      <ChevronDown className={cn('size-3.5 shrink-0 transition-transform', open && 'rotate-180')} />
    </button>
  )
}

function PaletteItem({
  widget,
  added,
  onAdd,
  wrapperRef,
}: {
  widget: WidgetDef
  added: boolean
  onAdd: () => void
  wrapperRef: (el: HTMLDivElement | null) => void
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
      title="Glisser vers le dashboard (ou cliquer pour ajouter)"
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
        className="flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-3 pr-3 text-left"
      >
        {widget.thumbnail ? (
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
