import { Layout, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewMode = 'react' | 'iframe'

/**
 * Toggle « Vue React (New) / Vue Melis classique (Old) ».
 *
 * Bouton segmenté réutilisable par toute page liste d'un module natif.
 * L'état `mode` est géré par la page hôte (pour le persister dans son cache).
 *
 * L'affichage est décidé par la page hôte (flag `viewToggle` par outil dans le
 * registre, cf. `lib/module-registry.ts`) : la page ne monte ce composant que
 * si le toggle est encore actif pour cet outil.
 */
export function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
      <button
        type="button"
        onClick={() => onChange('react')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          mode === 'react'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Sparkles className="size-3.5" />
        New
      </button>
      <button
        type="button"
        onClick={() => onChange('iframe')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          mode === 'iframe'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Layout className="size-3.5" />
        Old
      </button>
    </div>
  )
}

/**
 * Iframe de la vue Melis classique d'un outil.
 *
 * Une fois montée (`loaded`), reste dans le DOM et n'est cachée qu'en CSS
 * pour éviter un rechargement (≈20s) à chaque retoggle. Voir le mécanisme
 * iframe pool dans `melis-tool-iframe-mechanism`.
 */
export function MelisClassicFrame({
  melisKey,
  title,
  visible,
  loaded,
}: {
  melisKey: string
  title: string
  visible: boolean
  /** Ne rend l'iframe qu'après la 1ʳᵉ activation (lazy mount). */
  loaded: boolean
}) {
  if (!loaded) return null
  return (
    <div
      className={cn(
        'flex-1 overflow-hidden rounded-xl border border-border',
        visible ? 'flex' : 'hidden',
      )}
    >
      <iframe
        src={`/melis/react-tool-page?key=${encodeURIComponent(melisKey)}`}
        className="h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        title={title}
      />
    </div>
  )
}
