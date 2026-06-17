import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

/**
 * Toast notifications (green = success / red = error), shown top-right in the BO chrome.
 * Fed by the bridge in buildToolPage: legacy tools' melisOkNotification/melisKoNotification
 * AND any tool action answering JSON {success,textMessage} are forwarded here via postMessage
 * (de-duped) so they appear over the React shell instead of inside the tool iframe.
 */
interface Toast { id: number; kind: 'ok' | 'ko'; title: string; message: string }

let seq = 0
// De-dup window: a tool may both call melisOkNotification AND answer JSON {success,textMessage}
// (the XHR bridge forwards both) — collapse identical toasts fired within this window.
const DEDUP_MS = 1500
let lastKey = ''
let lastAt = 0

export function Notifications() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { __melisNotif?: boolean; kind?: string; title?: string; message?: string } | null
      if (!d || !d.__melisNotif) return
      const kind: Toast['kind'] = d.kind === 'ko' ? 'ko' : 'ok'
      const title = (d.title ?? '').trim()
      const message = (d.message ?? '').trim()
      const key = `${kind}|${title}|${message}`
      const now = Date.now()
      if (key === lastKey && now - lastAt < DEDUP_MS) return
      lastKey = key
      lastAt = now
      const id = ++seq
      // Keep only the most recent few — never replay a history of toasts.
      setToasts((ts) => [...ts, { id, kind, title, message }].slice(-4))
      // Success toasts auto-dismiss; errors stay until closed.
      if (kind === 'ok') {
        window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 4000)
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const dismiss = (id: number) => setToasts((ts) => ts.filter((t) => t.id !== id))

  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 top-16 z-[100000] flex w-80 max-w-[90vw] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className="flex items-start gap-2 rounded-md px-3 py-2 text-sm text-white shadow-lg animate-in fade-in slide-in-from-right-2"
          style={{ background: t.kind === 'ok' ? '#72af46' : '#cb4040' }}
        >
          <div className="min-w-0 flex-1">
            {t.title && <div className="font-semibold leading-tight">{t.title}</div>}
            {t.message && <div className="leading-snug opacity-95">{t.message}</div>}
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="-mr-0.5 shrink-0 rounded p-0.5 opacity-80 transition-opacity hover:opacity-100"
            aria-label="Fermer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
