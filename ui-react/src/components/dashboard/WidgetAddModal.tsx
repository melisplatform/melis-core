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

        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('widget.no_results')}</p>
          ) : (
            // Fiches COMPACTES (retour ticket 0011018, 2ᵉ passe : « trop chargé ») : liseré haut
            // coloré par groupe + logo de groupe (carré « M ») en haut à droite — la COULEUR suffit à
            // distinguer le module, donc ni nom de module ni description sur la fiche (la
            // description reste en infobulle et dans la recherche). La miniature du plugin ne
            // couvre plus toute la moitié gauche : petite vignette encadrée, avec sa marge, le nom
            // à côté. Deux fiches par ligne à la largeur normale de la modale (une en étroit).
            //
            // ⚠️ Colonnes en style INLINE (auto-fill), PAS `grid-cols-2 sm:grid-cols-3` : les briques
            // des modules injectent leur propre CSS Tailwind (feuilles inline, chargées APRÈS celle
            // de l'hôte) qui redéclare `.grid-cols-2` dans la même couche `utilities` — cette règle
            // plus tardive l'emporte sur le variant `sm:` de l'hôte, et la grille restait à 2
            // colonnes quelle que soit la largeur. Un style inline n'est écrasable par aucune brique.
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
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
                    title={w.description ? `${title} — ${w.description}` : title}
                    className={cn(
                      'group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                      added
                        ? 'border-primary/50 bg-primary/[0.05] hover:border-primary'
                        : 'border-border/70 bg-card hover:border-primary/60',
                    )}
                  >
                    {/* Liseré haut à la couleur du groupe — même repère que sur une fiche du marketplace. */}
                    <span aria-hidden className="h-[3px] w-full shrink-0" style={{ background: color }} />
                    <span className="flex min-h-[104px] flex-1 items-center gap-5 py-5 pl-7 pr-14">
                      {/* Vignette ENCADRÉE (pas en couverture) : miniature du plugin, ou l'icône du
                          widget sur un fond teinté par le groupe quand il n'en a pas. */}
                      <span
                        className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border/60"
                        style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${color} 18%, transparent), var(--color-muted, rgba(0,0,0,.05)))` }}
                      >
                        {w.thumbnail && loadThumbnails ? (
                          <img
                            src={w.thumbnail}
                            alt=""
                            draggable={false}
                            loading="lazy"
                            className="absolute inset-0 size-full object-cover"
                          />
                        ) : (
                          <span className="absolute inset-0 grid place-items-center" style={{ color }}>
                            <w.icon className="size-7 opacity-80" />
                          </span>
                        )}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                          {title}
                        </span>
                        {added && (
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            <Check className="size-2.5" strokeWidth={3} />
                            {t('widget.in_dashboard')}
                          </span>
                        )}
                      </span>
                    </span>
                    {/* Logo de groupe — carré arrondi à la couleur du groupe + « M » blanc, coin haut
                        droit, comme le `.melis-svg` des fiches du marketplace et du BO legacy. C'est
                        LUI (et le liseré) qui identifie le module, à la place d'un libellé. */}
                    <span
                      className="absolute right-2.5 top-3 grid size-5 place-items-center rounded-md p-[3px] shadow-sm"
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
