import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/theme/theme-context'

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'studio'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'platform' : 'studio')}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        className,
      )}
    >
      {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  )
}
