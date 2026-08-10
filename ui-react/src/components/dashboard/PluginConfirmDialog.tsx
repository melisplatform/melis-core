import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'

import { useI18n } from '@/i18n/i18n-context'

/**
 * Pop-up de confirmation « Oui / Non » d'un plugin dashboard legacy, rendue par l'HÔTE React.
 *
 * Le legacy affiche cette confirmation via `melisCoreTool.confirm` → BootstrapDialog DANS l'iframe de
 * la tuile, où une petite tuile la rogne. On la remonte au niveau de l'hôte, centrée sur la page
 * (même modèle que WidgetConfigDialog / WorkflowCommentDialog).
 *
 * ⚠️ Le RÉSULTAT seul remonte ici : le callback (« Oui » = POST + suite) doit s'exécuter DANS l'iframe,
 * avec ses variables scopées. L'iframe demande l'affichage (`__melisConfirm`), on renvoie le choix
 * (`onResult` → postMessage `__melisConfirmResult`), et l'iframe rejoue le bon callback.
 * Les libellés (titre, message, Oui, Non) arrivent DÉJÀ traduits par le legacy → on les affiche tels
 * quels, avec un repli i18n si l'un manque.
 */

export function PluginConfirmDialog({
  title,
  message,
  textOk,
  textNo,
  onResult,
}: {
  title?: string
  message?: string
  textOk?: string
  textNo?: string
  onResult: (kind: 'yes' | 'no' | 'dismiss') => void
}) {
  const { t } = useI18n()

  // Échap = fermeture sans rejouer de callback (comme la croix du BootstrapDialog legacy).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onResult('dismiss') }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onResult])

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      onClick={() => onResult('dismiss')}
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <h2 className="flex min-w-0 items-center gap-2 font-[var(--font-display)] text-sm font-semibold">
            <AlertTriangle className="size-4 shrink-0 text-primary" />
            {title && <span className="truncate">{title}</span>}
          </h2>
          <button
            type="button"
            onClick={() => onResult('dismiss')}
            className="grid size-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label={t('layout.close')}
          >
            <X className="size-4" />
          </button>
        </div>

        {message && (
          <div className="px-5 py-5 text-sm text-muted-foreground">{message}</div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5">
          <button
            type="button"
            onClick={() => onResult('no')}
            className="rounded-md border border-border px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
          >
            {textNo || t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onResult('yes')}
            autoFocus
            className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {textOk || t('common.yes')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
