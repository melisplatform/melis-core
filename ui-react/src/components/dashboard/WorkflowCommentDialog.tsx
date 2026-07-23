import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, MessageSquarePlus, X } from 'lucide-react'

import { useI18n } from '@/i18n/i18n-context'

/**
 * Modale « Ajouter un commentaire » du plugin Workflow (MelisSmallBusiness), rendue par l'HÔTE React.
 *
 * Après avoir validé / refusé une demande, le tool legacy ouvrait cette modale DANS l'iframe de la
 * tuile (melisHelper.createModal), où une petite tuile la rognait fatalement (position:fixed = viewport
 * de l'iframe). On la remonte donc au niveau de l'hôte, en overlay plein écran centré sur la page —
 * exactement le modèle de la modale d'engrenage (cf. WidgetConfigDialog).
 *
 * L'iframe demande l'ouverture par postMessage (`__melisWorkflowComment`, cf. PluginViewController) en
 * transmettant les paramètres que le legacy passait déjà : l'action (validate|refuse) et l'id de
 * l'objet (`pcom_page_id` / `pcom_news_id` / `pcom_blog_id`). L'ENREGISTREMENT reste celui du legacy :
 * POST form-urlencoded vers `addWorkflowComments`, mêmes champs → la journalisation (titre construit
 * côté serveur à partir de l'action + l'utilisateur) est identique.
 */

export interface WorkflowCommentParams {
  action?: string
  pluginId?: string | number
  pcom_page_id?: string | number
  pcom_news_id?: string | number
  pcom_blog_id?: string | number
  [key: string]: string | number | undefined
}

export function WorkflowCommentDialog({
  params,
  onClose,
  onSaved,
}: {
  params: WorkflowCommentParams
  onClose: () => void
  /** Optionnel : appelé après un enregistrement réussi (la liste est déjà rafraîchie côté iframe). */
  onSaved?: () => void
}) {
  const { t } = useI18n()
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ferme sur Échap (comme la modale d'engrenage).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function save(comment: string) {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      // form-urlencoded : le endpoint lit `$request->getPost()`, exactement comme le formulaire legacy.
      // On reprend tels quels les paramètres de l'iframe (id de l'objet + action) et on ajoute le texte.
      // `pluginId` ne servait qu'au DOM legacy : inutile côté serveur, on l'écarte.
      const body = new URLSearchParams()
      for (const [k, v] of Object.entries(params)) {
        if (k === 'pluginId' || v === undefined || v === null) continue
        body.set(k, String(v))
      }
      body.set('pcom_text', comment)

      const res = await fetch('/melis/MelisSmallBusiness/MelisWorkflow/addWorkflowComments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body,
      })
      const json = (await res.json()) as { success?: number }
      if (json.success) { onSaved?.(); onClose(); return }
      setError(t('dash.wf_comment_error'))
    } catch {
      setError(t('dash.wf_comment_error'))
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="flex min-w-0 items-center gap-2 font-[var(--font-display)] text-sm font-semibold">
            <MessageSquarePlus className="size-4 shrink-0 text-primary" />
            <span className="truncate">{t('dash.wf_comment_title')}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label={t('layout.close')}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-[120px] flex-1 overflow-auto p-5">
          <label htmlFor="wf-comment" className="mb-1.5 block text-xs font-medium text-foreground">
            {t('dash.wf_comment_label')}
          </label>
          <textarea
            id="wf-comment"
            rows={4}
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            className="w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          {/* « Sans commentaire » : enregistre quand même l'entrée de journal (texte vide), comme le legacy. */}
          <button
            type="button"
            onClick={() => save('')}
            disabled={saving}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-60"
          >
            {t('dash.wf_comment_skip')}
          </button>
          <button
            type="button"
            onClick={() => save(text)}
            disabled={saving || !text.trim()}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            {t('dash.wf_comment_add')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
