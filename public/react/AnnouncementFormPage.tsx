import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Loader2, Megaphone, Save, ToggleLeft, ToggleRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichEditor, type RichEditorEngine } from '@/components/ui/rich-editor'
import { cn } from '@/lib/utils'
import * as annApi from '@/lib/announcement-api'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Field({ label, required, children, error }: {
  label: string; required?: boolean; children: React.ReactNode; error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

/** datetime SQL "Y-m-d H:i:s" → valeur d'input datetime-local "Y-m-dTH:i". */
function toLocalInput(sql: string | null): string {
  if (!sql) return ''
  const d = new Date(sql.replace(' ', 'T'))
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AnnouncementFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isNew = !id || id === 'new'
  const annId = isNew ? 0 : parseInt(id as string, 10)

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [title, setTitle]   = useState('')
  const [text, setText]     = useState('')
  const [status, setStatus] = useState<0 | 1>(1)
  const [date, setDate]     = useState('')
  const [author, setAuthor] = useState<string | null>(null)
  const [editorEngine, setEditorEngine] = useState<RichEditorEngine>('tiptap')

  const [fieldErrors, setFieldErrors] = useState<{ title?: string; text?: string }>({})

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    annApi.fetchAnnouncementById(annId)
      .then(a => {
        setTitle(a.title)
        setText(a.text)
        setStatus(a.status)
        setDate(toLocalInput(a.date))
        setAuthor(a.author)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [annId, isNew])

  function validate(): boolean {
    const errs: { title?: string; text?: string } = {}
    if (!title.trim()) errs.title = 'Le titre est obligatoire.'
    if (!text.trim())  errs.text  = 'Le texte est obligatoire.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    setError(null)
    try {
      // datetime-local "Y-m-dTH:i" → "Y-m-d H:i:s" (vide = laisser le backend mettre maintenant)
      const sqlDate = date ? date.replace('T', ' ') + ':00' : undefined
      await annApi.saveAnnouncement({
        id: isNew ? null : annId,
        title: title.trim(),
        text,
        status,
        date: sqlDate,
      })
      navigate('/announcements')
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/announcements')}
            className="rounded-lg p-2 transition-colors hover:bg-accent"
            title="Retour"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Megaphone className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{isNew ? 'Nouvelle annonce' : 'Modifier l’annonce'}</h1>
              {author && !isNew && <p className="text-xs text-muted-foreground">Créée par {author}</p>}
            </div>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950/20">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm">
        <Field label="Titre" required error={fieldErrors.title}>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Titre de l’annonce"
            maxLength={255}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Date">
            <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
          </Field>
          <Field label="Statut">
            <button
              type="button"
              onClick={() => setStatus(s => (s === 1 ? 0 : 1))}
              className={cn(
                'flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors',
                status === 1
                  ? 'border-emerald-200 bg-emerald-500/10 text-emerald-600'
                  : 'border-amber-200 bg-amber-500/10 text-amber-600',
              )}
            >
              {status === 1 ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
              {status === 1 ? 'Active' : 'Inactive'}
            </button>
          </Field>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Texte<span className="ml-0.5 text-destructive">*</span>
            </Label>
            {/* Switch moteur d'édition — tiptap / tinymce, comme News */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
              {(['tiptap', 'tinymce'] as RichEditorEngine[]).map((eng) => (
                <button
                  key={eng}
                  type="button"
                  onClick={() => setEditorEngine(eng)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                    editorEngine === eng ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {eng}
                </button>
              ))}
            </div>
          </div>
          <RichEditor
            engine={editorEngine}
            value={text}
            onChange={setText}
            placeholder="Contenu de l’annonce…"
            minRows={6}
          />
          {fieldErrors.text && <p className="text-xs text-destructive">{fieldErrors.text}</p>}
        </div>
      </div>
    </div>
  )
}
