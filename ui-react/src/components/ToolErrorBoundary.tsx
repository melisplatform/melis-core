import { Component, type ReactNode, type ContextType } from 'react'

import { I18nContext } from '@/i18n/i18n-context'

/**
 * Isole le crash d'UN outil pour qu'il ne fasse jamais tomber tout le back-office.
 *
 * Contexte (bug récurrent) : les outils full-React sont montés DANS le Shell (listes
 * persistantes, briques, Outlet des formulaires). Sans garde, une exception au render
 * d'un seul outil démonte tout l'arbre React → page blanche SANS MENU. Cette frontière
 * capture l'erreur, affiche un message dans le seul emplacement de l'outil fautif, et
 * laisse le menu + les autres outils intacts.
 *
 * Toujours envelopper chaque emplacement où un composant d'outil (page/brique) est monté.
 */
interface Props { children: ReactNode; label?: string }
interface State { error: Error | null }

export class ToolErrorBoundary extends Component<Props, State> {
  state: State = { error: null }
  // Accès au contexte i18n depuis un composant classe (pas de hook) → libellés traduits.
  static contextType = I18nContext
  declare context: ContextType<typeof I18nContext>

  static getDerivedStateFromError(error: Error): State { return { error } }

  componentDidCatch(error: Error, info: unknown) {
    // Visible en console pour le diagnostic, sans casser l'UI.
    console.error('[ToolErrorBoundary]', this.props.label ?? '', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    const t = this.context?.t
    const errorMsg = this.props.label
      ? (t ? t('layout.tool_error', { label: this.props.label }) : `L'outil « ${this.props.label} » a rencontré une erreur`)
      : (t ? t('layout.tool_error_generic') : 'Cet outil a rencontré une erreur')
    const retryMsg = t ? t('layout.retry') : 'Réessayer'
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
            <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>
        <div className="text-base font-semibold text-foreground">
          {errorMsg}
        </div>
        <div className="max-w-xl break-words text-sm text-muted-foreground">{this.state.error.message}</div>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="mt-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {retryMsg}
        </button>
      </div>
    )
  }
}
