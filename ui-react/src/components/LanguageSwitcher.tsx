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
  const { lang, langs, currentLocale, currentLangId, changeLocale } = useI18n()

  // La session peut porter la locale sans l'id (melis-lang-id absent → currentLangId = 0) : sans
  // ce repli sur la locale, le bouton se rendrait vide (ni drapeau ni code).
  const current =
    langs.find((l) => l.id === currentLangId) ?? langs.find((l) => l.locale === currentLocale)

  // ⚠️ Le bouton ne DOIT JAMAIS disparaître : au tout premier chargement (pas de cache localStorage
  // + /langs racé/lent par contention du verrou de session PHP au boot), `langs` est vide un instant.
  // On dérive alors le drapeau de la langue COURANTE du contexte i18n (currentLocale du cache, sinon
  // la lang React) → l'icône est toujours présente ; le menu déroulant se peuple dès que /langs arrive.
  const short = (current?.short ?? (currentLocale ? currentLocale.split('_')[0] : lang)).toLowerCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        aria-label="Langue"
      >
        <Flag short={short} />
        <span className="text-xs font-semibold uppercase">{short}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {langs.length === 0 ? (
          // Liste pas encore chargée : un seul item (la langue courante), désactivé.
          <DropdownMenuItem disabled className="gap-2"><Flag short={short} />{short.toUpperCase()}</DropdownMenuItem>
        ) : langs.map((l) => (
          <DropdownMenuItem key={l.id} onSelect={() => changeLocale(l.id)} className="gap-2">
            <Flag short={l.short} />
            {l.label}
            <Check className={cn('ml-auto size-4', l.id === current?.id ? 'opacity-100' : 'opacity-0')} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
