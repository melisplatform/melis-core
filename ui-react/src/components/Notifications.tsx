import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

/**
 * Toast notifications (green = success / red = error), shown top-right in the BO chrome.
 * Fed by the bridge in buildToolPage: legacy tools' melisOkNotification/melisKoNotification
 * AND any tool action answering JSON {success,textMessage} are forwarded here via postMessage
 * (de-duped) so they appear over the React shell instead of inside the tool iframe.
 */
interface ErrorField { label: string; messages: string[] }
interface Toast { id: number; kind: 'ok' | 'ko'; title: string; message: string; fields?: ErrorField[] }

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
      const d = e.data as { __melisNotif?: boolean; kind?: string; title?: string; message?: string; fields?: ErrorField[] } | null
      if (!d || !d.__melisNotif) return
      const kind: Toast['kind'] = d.kind === 'ko' ? 'ko' : 'ok'
      const title = (d.title ?? '').trim()
      const message = (d.message ?? '').trim()
      const fields = Array.isArray(d.fields) ? d.fields.filter(f => f && f.label) : []
      // The XHR bridge and melisKoNotification both fire for the same save with an identical
      // payload (same kind/title/message/fields) → de-dup on that key collapses them to one.
      const key = `${kind}|${title}|${message}`
      const now = Date.now()
      if (key === lastKey && now - lastAt < DEDUP_MS) return
      lastKey = key
      lastAt = now
      const id = ++seq
      // Keep only the most recent few — never replay a history of toasts.
      setToasts((ts) => [...ts, { id, kind, title, message, fields }].slice(-4))
      // Auto-dismiss both kinds; errors linger longer so they can be read (and can still be
      // closed early via the ✕). Field-error lists get extra time to scan.
      const delay = kind === 'ok' ? 4000 : (fields.length ? 9000 : 7000)
      window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), delay)
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
            {t.fields && t.fields.length > 0 && (
              <ul className="mt-1.5 space-y-1 border-t border-white/25 pt-1.5 text-xs">
                {t.fields.map((f, i) => (
                  <li key={i} className="leading-snug">
                    <span className="font-semibold">{f.label}:</span>{' '}
                    <span className="opacity-95">{f.messages.join(' ')}</span>
                  </li>
                ))}
              </ul>
            )}
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
