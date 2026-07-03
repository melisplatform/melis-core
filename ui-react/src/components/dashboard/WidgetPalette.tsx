import { useEffect, useRef } from 'react'
import { GripVertical, Plus, X } from 'lucide-react'
import { GridStack } from 'gridstack'

import { cn } from '@/lib/utils'
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
  extraWidgets = [],
}: {
  present: Set<string>
  onAdd: (widgetId: string) => void
  onClose: () => void
  extraWidgets?: WidgetDef[]
}) {
  const { t } = useI18n()
  // Refs sur les wrappers draggables, indexés par widgetId.
  const wrapperRefs = useRef<Map<string, HTMLDivElement>>(new Map())

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
  }, [present, extraWidgets])

  return (
    <aside data-widget-palette className="flex w-72 shrink-0 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-[var(--font-display)] text-sm font-semibold">{t('widget.add')}</h2>
        <button
          type="button"
          onClick={onClose}
          className="grid size-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={t('widget.done')}
        >
          <X className="size-4" />
        </button>
      </div>

      <p className="px-4 py-2.5 text-xs text-muted-foreground">{t('widget.palette_hint')}</p>

      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {WIDGET_SECTIONS.map((sectionKey) => {
          const items = WIDGETS.filter((w) => w.sectionKey === sectionKey)
          if (!items.length) return null
          return (
            <div key={sectionKey}>
              <div className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t(sectionKey)}
              </div>
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
            </div>
          )
        })}

        {/* Sections dynamiques : plugins legacy PHP (par groupe) */}
        {extraWidgets.length > 0 && (() => {
          const groups = new Map<string, WidgetDef[]>()
          for (const w of extraWidgets) {
            const label = w.sectionLabel ?? w.sectionKey
            if (!groups.has(label)) groups.set(label, [])
            groups.get(label)!.push(w)
          }
          return Array.from(groups.entries()).map(([label, items]) => (
            <div key={label}>
              <div className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {label}
              </div>
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
            </div>
          ))
        })()}
      </div>
    </aside>
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
        'flex items-center gap-1 rounded-md border border-border/70 bg-background transition-colors',
        'hover:border-primary/40 hover:bg-accent',
      )}
    >
      {/* Poignée de drag — glisser ajoute toujours une nouvelle instance */}
      <div
        className="grid h-full w-7 shrink-0 place-items-center self-stretch text-muted-foreground/40 cursor-grab hover:text-muted-foreground/80"
        title="Glisser vers le dashboard"
      >
        <GripVertical className="size-3.5" />
      </div>

      {/* Bouton d'ajout au clic — ajoute toujours une nouvelle instance, même si déjà présent */}
      <button
        type="button"
        onClick={onAdd}
        className="group flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-2.5 pr-3 text-left"
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
      </button>
    </div>
  )
}
