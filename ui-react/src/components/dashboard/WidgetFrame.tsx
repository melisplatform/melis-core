import type { ReactNode } from 'react'
import { GripVertical, RotateCcw, Settings, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useI18n } from '@/i18n/i18n-context'

/** Cadre d'un widget : header (poignée de drag + titre + config/recharger/retirer) + corps.
 *  Le header porte `.widget-drag-handle` → c'est la zone de déplacement (le
 *  corps reste interactif). Équivalent du `widget-head` de Melis (cog/refresh/trash).
 *
 *  ⚠️ Les boutons d'action sont TOUJOURS visibles (pas de `opacity-0` révélé au survol) :
 *  le corps d'un widget legacy est une <iframe> et le survol de l'iframe ne propage PAS
 *  le `:hover` au parent → les boutons masqués restaient introuvables sur ces widgets. */
export function WidgetFrame({
  title,
  icon: Icon,
  onRemove,
  onReload,
  onConfig,
  children,
}: {
  title: string
  icon: LucideIcon
  onRemove: () => void
  onReload: () => void
  /** Fourni uniquement pour les widgets configurables (plugins legacy) → affiche le bouton engrenage. */
  onConfig?: () => void
  children: ReactNode
}) {
  const { t } = useI18n()
  const btn =
    'grid size-6 shrink-0 place-items-center rounded text-muted-foreground/70 transition-colors hover:text-foreground'
  return (
    <div className="group/widget flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-card text-card-foreground shadow-card">
      <div className="widget-drag-handle flex cursor-move select-none items-center gap-2 border-b border-border/60 px-4 py-2.5">
        <GripVertical className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover/widget:text-muted-foreground/70" />
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <h3 className="font-[var(--font-display)] truncate text-sm font-semibold">{title}</h3>
        <div className="ml-auto flex items-center gap-1">
          {onConfig && (
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={onConfig}
              className={`${btn} hover:bg-accent`}
              aria-label={t('layout.widget_configure')}
              title={t('layout.widget_configure')}
            >
              <Settings className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onReload}
            className={`${btn} hover:bg-accent`}
            aria-label={t('layout.reload')}
            title={t('layout.reload')}
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onRemove}
            className={`${btn} hover:bg-destructive/10 hover:text-destructive`}
            aria-label={t('layout.widget_remove')}
            title={t('layout.widget_remove')}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}
