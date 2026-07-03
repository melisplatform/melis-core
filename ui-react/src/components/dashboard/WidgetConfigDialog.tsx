import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Modale de configuration d'un widget plugin legacy — équivalent React du bouton engrenage
 * (`dashboard-plugin-properties`) du dashboard Melis PHP. Le formulaire de config du plugin est
 * rendu par le backend (`/melis/react-dashboard-plugin-config?plugin=…`) et affiché dans une iframe,
 * même mécanisme que le widget lui-même. Beaucoup de plugins n'ont aucune option → l'iframe montre
 * alors juste l'onglet "Propriétés" vide.
 */
export function WidgetConfigDialog({
  pluginName,
  title,
  onClose,
}: {
  pluginName: string
  title: string
  onClose: () => void
}) {
  // Ferme sur Échap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-[var(--font-display)] truncate text-sm font-semibold">
            Configuration — {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>
        <iframe
          src={`/melis/react-dashboard-plugin-config?plugin=${encodeURIComponent(pluginName)}`}
          className="min-h-[280px] w-full flex-1 border-0 bg-white"
          title={`config-${pluginName}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>,
    document.body,
  )
}
