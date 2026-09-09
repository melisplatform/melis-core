import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import { getMelisIcon } from '@/lib/melis-icons'
import type { WidgetDef } from './widget-registry'

/**
 * Catalogue d'ajout de widget, en modale centrée — calqué sur la palette « + » de l'éditeur de
 * page (EditionCanvas.tsx, melis-cms) : puces de section + recherche + grille de vignettes,
 * plutôt que l'ancien panneau latéral en accordéon (WidgetPalette). Un clic ajoute et ferme
 * (même geste qu'un ajout de plugin côté éditeur de page) ; pas de glisser-déposer — cette
 * modale n'a pas de canevas où déposer, contrairement à la palette de l'éditeur de page.
 */
export function WidgetAddModal({
  present,
  nativeWidgets,
  extraWidgets,
  onAdd,
  onClose,
  loadThumbnails,
}: {
  present: Set<string>
  nativeWidgets: WidgetDef[]
  extraWidgets: WidgetDef[]
  onAdd: (widgetId: string) => void
  onClose: () => void
  loadThumbnails: boolean
}) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [section, setSection] = useState<string>('all')

  const all = useMemo(() => [...nativeWidgets, ...extraWidgets], [nativeWidgets, extraWidgets])

  const sections = useMemo(() => {
    const labels = new Set<string>()
    for (const w of all) labels.add(w.sectionLabel ?? t(w.sectionKey))
    return Array.from(labels)
  }, [all, t])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((w) => {
      const label = w.sectionLabel ?? t(w.sectionKey)
      if (section !== 'all' && label !== section) return false
      if (!q) return true
      const title = (w.titleLabel ?? t(w.titleKey)).toLowerCase()
      const desc = (w.description ?? '').toLowerCase()
      return title.includes(q) || desc.includes(q)
    })
  }, [all, query, section, t])

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <h2 className="font-[var(--font-display)] text-sm font-semibold">{t('widget.add')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label={t('layout.close')}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 border-b border-border px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('widget.search_placeholder')}
              className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <SectionChip label={t('widget.section_all')} active={section === 'all'} onClick={() => setSection('all')} />
            {sections.map((s) => (
              <SectionChip
                key={s}
                label={s === 'CustomProjects' ? 'Custom / Projects' : s}
                icon={getMelisIcon(s)}
                active={section === s}
                onClick={() => setSection(s)}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('widget.no_results')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {filtered.map((w) => {
                const added = present.has(w.id)
                const sectionLabel = w.sectionLabel ?? t(w.sectionKey)
                const GroupIcon = getMelisIcon(sectionLabel)
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => onAdd(w.id)}
                    title={w.description || undefined}
                    className={cn(
                      'relative flex cursor-pointer flex-col items-center gap-2 rounded-md border px-3 py-3 text-center transition-colors',
                      added
                        ? 'border-primary/40 bg-primary/[0.06] hover:border-primary/60 hover:bg-primary/10'
                        : 'border-border/70 bg-background hover:border-primary/40 hover:bg-accent',
                    )}
                  >
                    {/* Groupe (section Melis) auquel appartient ce widget — même icône colorée
                        que la puce de filtre correspondante, pour relier visuellement les deux. */}
                    <span
                      className="absolute left-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-card/80"
                      title={sectionLabel === 'CustomProjects' ? 'Custom / Projects' : sectionLabel}
                    >
                      <GroupIcon className="size-3" />
                    </span>
                    {added && (
                      <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    )}
                    {w.thumbnail && loadThumbnails ? (
                      <img src={w.thumbnail} alt="" draggable={false} className="size-10 rounded-md border border-border/70 object-cover" loading="lazy" />
                    ) : (
                      <div className="grid size-10 place-items-center rounded-md bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-primary">
                        <w.icon className="size-5" />
                      </div>
                    )}
                    <span className="line-clamp-2 text-xs font-medium text-foreground">
                      {w.titleLabel ?? t(w.titleKey)}
                    </span>
                    {added && (
                      <span className="text-[10px] font-medium text-primary">{t('widget.in_dashboard')}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function SectionChip({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string
  active: boolean
  onClick: () => void
  icon?: import('lucide-react').LucideIcon
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {Icon && <Icon className="size-3" />}
      {label}
    </button>
  )
}
