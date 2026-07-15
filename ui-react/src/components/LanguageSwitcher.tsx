import { Check } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'

// Flag images shipped by MelisCore, named by the language short code (en.png, fr.png, …).
// Emoji flags don't render on Windows, so we use these real images.
const flagSrc = (short: string) => `/MelisCore/assets/images/lang/${short.toLowerCase()}.png`

export function Flag({ short, width = 18, height = 12 }: { short: string; width?: number; height?: number }) {
  return (
    <img
      src={flagSrc(short)}
      alt=""
      width={width}
      height={height}
      className="inline-block shrink-0 rounded-[2px] object-cover shadow-sm"
      // Hide the image if the flag file is missing (keeps just the language code).
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
    />
  )
}

/**
 * Back-office language switcher. Lists the platform's languages (from the server) and switches
 * the WHOLE platform: changeLocale persists the choice (session + user) and reloads so the menu,
 * tools and tool iframes all follow the new locale.
 */
export function LanguageSwitcher() {
  const { langs, currentLangId, changeLocale } = useI18n()

  if (langs.length === 0) return null
  const current = langs.find((l) => l.id === currentLangId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        aria-label="Langue"
      >
        {current && <Flag short={current.short} />}
        <span className="text-xs font-semibold uppercase">{current?.short}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {langs.map((l) => (
          <DropdownMenuItem key={l.id} onSelect={() => changeLocale(l.id)} className="gap-2">
            <Flag short={l.short} />
            {l.label}
            <Check className={cn('ml-auto size-4', l.id === currentLangId ? 'opacity-100' : 'opacity-0')} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
