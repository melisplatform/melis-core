import { RotateCcw } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/i18n/i18n-context'

/** Couleur hex, avec ou sans le dièse. */
const HEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/** Normalise une couleur hex vers la forme `#rrggbb` attendue par l'input natif. */
function toHex(value: string, fallback: string): string {
  const v = value.trim()
  if (!HEX.test(v)) return fallback
  const body = v.startsWith('#') ? v.slice(1) : v
  const full = body.length === 3 ? body.split('').map((c) => c + c).join('') : body
  return `#${full.toLowerCase()}`
}

/**
 * Champ couleur : une pastille (color picker natif), la valeur hex en texte, des presets et un
 * bouton de réinitialisation. `value` vide = le défaut du thème est utilisé.
 */
function ColorField({ label, value, onChange, defaultValue = '#ff0000', presets, disabled, hint, className }: {
  label?: React.ReactNode
  value: string
  onChange: (value: string) => void
  /** Couleur affichée et restaurée quand la valeur stockée est vide. */
  defaultValue?: string
  /** Pastilles de sélection rapide. */
  presets?: string[]
  disabled?: boolean
  hint?: React.ReactNode
  className?: string
}) {
  const { t } = useI18n()
  const current = toHex(value, defaultValue)
  const valid = value.trim() === '' || HEX.test(value.trim())

  return (
    <div className={className}>
      {label && <label className="mb-2 block text-sm font-medium">{label}</label>}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="color"
          value={current}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-label={typeof label === 'string' ? label : undefined}
          className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-card p-1 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Input
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={defaultValue}
          className={cn('h-9 w-32 font-mono text-xs', !valid && 'border-destructive')}
        />
        {presets && presets.length > 0 && (
          <div className="flex items-center gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={disabled}
                onClick={() => onChange(preset)}
                title={preset}
                aria-label={preset}
                className={cn(
                  'size-6 rounded-full border transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50',
                  current === toHex(preset, defaultValue) ? 'border-foreground' : 'border-border',
                )}
                style={{ background: preset }}
              />
            ))}
          </div>
        )}
        {value.trim() !== '' && !disabled && (
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground"
            onClick={() => onChange('')}>
            <RotateCcw className="size-3.5" />{t('common.reset')}
          </Button>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export { ColorField }
