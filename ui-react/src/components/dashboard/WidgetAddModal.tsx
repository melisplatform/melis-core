import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import { getMelisIcon, MelisMarkIcon } from '@/lib/melis-icons'
import { getMelisColor } from '@/lib/melis-colors'
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
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl"
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
            // Fiches calquées sur les cartes du marketplace (MarketPlacePage.tsx, PackageCard),
            // ticket 0011018 : liseré haut coloré par groupe, logo de groupe (carré « M ») en haut
            // à droite, et — au lieu d'une vignette 40px perdue au milieu — la miniature du plugin
            // occupe TOUTE la moitié gauche de la fiche, le nom + la description (quand le plugin
            // en a une) à droite. Toujours DEUX fiches par ligne, quelle que soit la largeur.
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((w) => {
                const added = present.has(w.id)
                const sectionLabel = w.sectionLabel ?? t(w.sectionKey)
                const sectionName = sectionLabel === 'CustomProjects' ? 'Custom / Projects' : sectionLabel
                const color = getMelisColor(sectionLabel)
                const title = w.titleLabel ?? t(w.titleKey)
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => onAdd(w.id)}
                    title={w.description || undefined}
                    className={cn(
                      'group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                      added
                        ? 'border-primary/50 bg-primary/[0.05] hover:border-primary'
                        : 'border-border/70 bg-card hover:border-primary/60',
                    )}
                  >
                    {/* Liseré haut à la couleur du groupe — même repère que sur une fiche du marketplace. */}
                    <span aria-hidden className="h-[3px] w-full shrink-0" style={{ background: color }} />
                    <span className="flex min-h-[104px] flex-1">
                      {/* Moitié gauche : miniature du plugin en couverture (object-cover), ou, sans
                          miniature, l'icône du widget sur un fond teinté par le groupe — jamais de
                          rectangle gris vide (même parti pris que le marketplace sans visuel). */}
                      <span
                        className="relative w-1/2 shrink-0 overflow-hidden"
                        style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${color} 18%, transparent), var(--color-muted, rgba(0,0,0,.05)))` }}
                      >
                        {w.thumbnail && loadThumbnails ? (
                          <img
                            src={w.thumbnail}
                            alt=""
                            draggable={false}
                            loading="lazy"
                            className="absolute inset-0 size-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <span className="absolute inset-0 grid place-items-center" style={{ color }}>
                            <w.icon className="size-9 opacity-70" />
                          </span>
                        )}
                      </span>
                      {/* Moitié droite : nom, description (si le plugin en déclare une), module. Marge
                          droite réservée au logo de groupe posé en absolu (cf. ci-dessous). */}
                      <span className="flex min-w-0 flex-1 flex-col gap-1 py-2.5 pl-3 pr-9">
                        <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                          {title}
                        </span>
                        {w.description && (
                          <span className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">{w.description}</span>
                        )}
                        <span className="mt-auto flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
                          <span className="truncate">{w.moduleLabel ?? sectionName}</span>
                          {added && (
                            <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                              <Check className="size-2.5" strokeWidth={3} />
                              {t('widget.in_dashboard')}
                            </span>
                          )}
                        </span>
                      </span>
                    </span>
                    {/* Logo de groupe — carré arrondi à la couleur du groupe + « M » blanc, coin haut
                        droit, comme le `.melis-svg` des fiches du marketplace et du BO legacy. */}
                    <span
                      className="absolute right-2 top-2.5 grid size-6 place-items-center rounded-md p-1 shadow-sm"
                      style={{ background: color }}
                      title={sectionName}
                    >
                      <MelisMarkIcon className="size-full" />
                    </span>
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
