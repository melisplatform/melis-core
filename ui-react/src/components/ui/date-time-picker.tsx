/**
 * CalendarPopup — sélecteur date + heure **localisé** (langue du BO), sans dépendance.
 *
 * Le picker natif `<input type="datetime-local">` (showPicker) affiche son popup dans la langue du
 * NAVIGATEUR, pas celle de la page, et — surtout — quand l'input natif est caché (size-0 /
 * pointer-events-none) la sélection faite dans le popup ne remonte pas toujours au champ. On rend
 * donc notre propre calendrier, localisé via `Intl` (noms de mois, en-têtes de jours, 1er jour de
 * semaine) → fonctionne pour n'importe quelle langue du BO.
 *
 * Valeur (in/out) au format interne "YYYY-MM-DDTHH:MM" ('' = vide).
 * Pattern repris de l'outil News (melis-cms-news).
 */
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'

const RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
const p2 = (n: number) => String(n).padStart(2, '0')
const fmt = (y: number, mo: number, d: number, h: number, mi: number) =>
  `${y}-${p2(mo)}-${p2(d)}T${p2(h)}:${p2(mi)}`

function firstDayOfWeek(locale: string): number {
  try {
    // Intl.Locale.weekInfo.firstDay : 1 = lundi … 7 = dimanche
    const wi = (new Intl.Locale(locale) as unknown as { weekInfo?: { firstDay?: number }; getWeekInfo?: () => { firstDay?: number } })
    const fd = wi.getWeekInfo?.().firstDay ?? wi.weekInfo?.firstDay
    return fd ?? 1
  } catch {
    return 1
  }
}

export function CalendarPopup({ value, onChange, locale, onClose }: {
  value: string
  onChange: (v: string) => void
  locale: string
  onClose: () => void
}) {
  const { t } = useI18n()
  const parsed = value.match(RE)
  const selY = parsed ? +parsed[1] : null
  const selMo = parsed ? +parsed[2] : null
  const selD = parsed ? +parsed[3] : null
  const curH = parsed ? +parsed[4] : 0
  const curMi = parsed ? +parsed[5] : 0

  const today = new Date()
  const [view, setView] = useState(() =>
    parsed ? new Date(selY!, selMo! - 1, 1) : new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const fdow = useMemo(() => firstDayOfWeek(locale), [locale])

  // En-têtes de jours localisés, dans l'ordre du 1er jour de semaine de la locale.
  const weekdayNames = useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    // 2024-01-01 est un lundi (day=1).
    return Array.from({ length: 7 }, (_, i) => {
      const dow = ((fdow - 1 + i) % 7) // 0..6 où 0 = lundi
      return f.format(new Date(2024, 0, 1 + dow))
    })
  }, [locale, fdow])

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(view),
    [locale, view],
  )

  const y = view.getFullYear()
  const mo = view.getMonth() // 0-based
  const daysInMonth = new Date(y, mo + 1, 0).getDate()
  // Offset : combien de cases vides avant le 1er, selon le 1er jour de semaine de la locale.
  const jsFirstDow = new Date(y, mo, 1).getDay() // 0=dim..6=sam
  const leading = (jsFirstDow - (fdow % 7) + 7) % 7

  const pick = (d: number) => {
    onChange(fmt(y, mo + 1, d, curH, curMi))
  }
  const setTime = (h: number, mi: number) => {
    const yy = selY ?? y, mm = selMo ?? mo + 1, dd = selD ?? today.getDate()
    onChange(fmt(yy, mm, dd, h, mi))
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const isSelected = (d: number) => selY === y && selMo === mo + 1 && selD === d
  const isToday = (d: number) => today.getFullYear() === y && today.getMonth() === mo && today.getDate() === d

  return (
    <div className="absolute right-0 z-50 mt-1 w-[17rem] rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg">
      {/* En-tête : mois + navigation */}
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => setView(new Date(y, mo - 1, 1))}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="prev">
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-xs font-semibold capitalize">{monthLabel}</span>
        <button type="button" onClick={() => setView(new Date(y, mo + 1, 1))}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="next">
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* En-têtes de jours */}
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-muted-foreground">
        {weekdayNames.map((w, i) => <span key={i} className="py-1 capitalize">{w}</span>)}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => d === null
          ? <span key={i} />
          : (
            <button
              key={i}
              type="button"
              onClick={() => pick(d)}
              className={cn(
                'flex h-8 items-center justify-center rounded text-xs transition-colors',
                isSelected(d)
                  ? 'bg-primary font-semibold text-primary-foreground'
                  : isToday(d)
                    ? 'bg-accent font-medium text-foreground'
                    : 'hover:bg-accent hover:text-foreground',
              )}
            >
              {d}
            </button>
          ),
        )}
      </div>

      {/* Heure */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        <input
          type="number" min={0} max={23} value={p2(curH)}
          onChange={(e) => setTime(Math.min(23, Math.max(0, +e.target.value || 0)), curMi)}
          className="h-8 w-12 rounded border border-border bg-background text-center text-xs"
          aria-label="HH"
        />
        <span className="text-muted-foreground">:</span>
        <input
          type="number" min={0} max={59} value={p2(curMi)}
          onChange={(e) => setTime(curH, Math.min(59, Math.max(0, +e.target.value || 0)))}
          className="h-8 w-12 rounded border border-border bg-background text-center text-xs"
          aria-label="MM"
        />
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs">
        <button type="button" onClick={() => { onChange(''); onClose() }}
          className="text-muted-foreground hover:text-destructive">
          {t('cal.clear')}
        </button>
        <button type="button" onClick={() => {
          const n = new Date()
          onChange(fmt(n.getFullYear(), n.getMonth() + 1, n.getDate(), n.getHours(), n.getMinutes()))
          onClose()
        }} className="font-medium text-primary hover:underline">
          {t('cal.today')}
        </button>
      </div>
    </div>
  )
}
