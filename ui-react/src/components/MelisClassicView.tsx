import { Layout } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'

/** Logo « M » de Melis (même tracé que les icônes de modules de la sidebar). */
function MelisM({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 70 70" fill="currentColor" aria-hidden="true">
      <path d="M57.4,0c-4.8,0-8.6,3.9-8.6,8.6v49.2c0,4.8,3.9,8.6,8.6,8.6s8.6-3.9,8.6-8.6V8.7C66,3.9,62.2,0,57.4,0Z" />
      <path d="M16.3,4.6C14,.4,8.8-1.2,4.6,1,.4,3.2-1.2,8.5,1,12.7l26.1,49.3c2.2,4.2,7.4,5.8,11.7,3.6,4.2-2.2,5.8-7.4,3.6-11.7L16.3,4.6Z" />
      <circle cx="8.8" cy="57.7" r="8.8" />
    </svg>
  )
}

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
  compact = false,
}: {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
  /** Icon-only, no text labels — opt-in so every other call site keeps its current look. */
  compact?: boolean
}) {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
      <button
        type="button"
        onClick={() => onChange('react')}
        title={compact ? t('layout.view_new') : undefined}
        className={cn(
          'flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors',
          compact ? 'px-2 py-1.5' : 'px-3 py-1.5',
          mode === 'react'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <MelisM className="size-3.5" />
        {!compact && t('layout.view_new')}
      </button>
      <button
        type="button"
        onClick={() => onChange('iframe')}
        title={compact ? t('layout.view_old') : undefined}
        className={cn(
          'flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors',
          compact ? 'px-2 py-1.5' : 'px-3 py-1.5',
          mode === 'iframe'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Layout className="size-3.5" />
        {!compact && t('layout.view_old')}
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
        // No `sandbox`: first-party same-origin legacy tool page. allow-scripts + allow-same-origin
        // make the sandbox ineffective (Chrome warns it "can escape its sandboxing"); dropping it
        // clears that console warning with no real security change.
        title={title}
      />
    </div>
  )
}
