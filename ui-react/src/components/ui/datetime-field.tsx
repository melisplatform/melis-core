/**
 * DateTimeField — champ date+heure dont l'AFFICHAGE suit la langue du BO (dynamique), pas la locale
 * du navigateur. `<input type="datetime-local">` s'affiche toujours dans la locale du NAVIGATEUR
 * (ignore l'attribut `lang` sous Chromium) → un BO FR sur navigateur EN montrerait mm/dd/yyyy.
 *
 * Ce champ affiche/édite au format de la locale passée (ordre jour/mois déduit via `Intl`, donc
 * valable pour N'IMPORTE QUELLE langue), tout en conservant la valeur interne "YYYY-MM-DDTHH:MM"
 * (format `datetime-local`) et un calendrier **custom localisé** (CalendarPopup). Le picker natif
 * (input caché + showPicker()) est proscrit : hors langue navigateur, la sélection faite dans son
 * popup ne remontait pas au champ (input caché en size-0/pointer-events-none).
 *
 * Pattern repris de l'outil News (melis-cms-news, DateTimeField) — mutualisé ici pour les outils
 * natifs de MelisCore (ex. Annonces).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/i18n/i18n-context'
import { CalendarPopup } from '@/components/ui/date-time-picker'

/** L'ordre d'affichage de cette locale est-il jour-avant-mois (jj/mm) ? Déduit via Intl. */
function localeDayFirst(locale: string): boolean {
  try {
    const parts = new Intl.DateTimeFormat(locale || 'en').formatToParts(new Date(2000, 0, 2))
    const di = parts.findIndex((p) => p.type === 'day')
    const mi = parts.findIndex((p) => p.type === 'month')
    return di !== -1 && mi !== -1 && di < mi
  } catch {
    return false
  }
}
// "YYYY-MM-DDTHH:MM" → "jj/mm/aaaa HH:MM" (ou "mm/jj/aaaa HH:MM").
function dtToDisplay(value: string, dayFirst: boolean): string {
  const m = value && value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/)
  if (!m) return ''
  const [, y, mo, d, h, mi] = m
  const date = dayFirst ? `${d}/${mo}/${y}` : `${mo}/${d}/${y}`
  return `${date} ${h}:${mi}`
}
// Saisie localisée "jj/mm/aaaa[ HH:MM]" (ou mm/jj) → "YYYY-MM-DDTHH:MM". '' si vide, null si invalide.
function dtFromDisplay(text: string, dayFirst: boolean): string | null {
  const s = text.trim()
  if (s === '') return ''
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?$/)
  if (!m) return null
  const a = m[1], b = m[2], y = m[3]
  const h = m[4] ?? '00', mi = m[5] ?? '00'
  const day = dayFirst ? a : b
  const mon = dayFirst ? b : a
  const D = +day, M = +mon, H = +h, MI = +mi
  if (M < 1 || M > 12 || D < 1 || D > 31 || H > 23 || MI > 59) return null
  const p2 = (n: number) => String(n).padStart(2, '0')
  return `${y}-${p2(M)}-${p2(D)}T${p2(H)}:${p2(MI)}`
}

export function DateTimeField({ value, onChange, locale, className }: {
  /** Valeur interne au format `datetime-local` : "YYYY-MM-DDTHH:MM" (ou '' si vide). */
  value: string
  onChange: (v: string) => void
  /** Locale du BO (ex. "fr-FR", "en-GB") — pilote le format d'affichage. */
  locale: string
  className?: string
}) {
  const { t } = useI18n()
  const dayFirst = useMemo(() => localeDayFirst(locale), [locale])
  const [text, setText] = useState(() => dtToDisplay(value, dayFirst))
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Resynchronise l'affichage quand la valeur change de l'extérieur (chargement, changement de langue).
  useEffect(() => { setText(dtToDisplay(value, dayFirst)) }, [value, dayFirst])

  // Ferme le calendrier au clic en dehors.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const commit = () => {
    const iso = dtFromDisplay(text, dayFirst)
    if (iso === null) { setText(dtToDisplay(value, dayFirst)); return } // saisie invalide → on revient à la valeur
    onChange(iso)
  }

  return (
    <div className={`relative ${className ?? ''}`} ref={wrapRef}>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur() }}
        placeholder={dayFirst ? t('ui.datetime.placeholder_dayfirst') : t('ui.datetime.placeholder_monthfirst')}
        inputMode="numeric"
        className="pr-9"
      />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        tabIndex={-1}
        aria-label={t('ui.datetime.calendar')}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        <Calendar className="size-4" />
      </button>
      {/* Calendrier custom localisé — remplace le picker natif (langue navigateur + sélection non
          remontée quand l'input natif est caché). */}
      {open && <CalendarPopup value={value} onChange={onChange} locale={locale} onClose={() => setOpen(false)} />}
    </div>
  )
}
