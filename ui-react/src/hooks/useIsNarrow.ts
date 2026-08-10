import { useEffect, useState } from 'react'

/**
 * True when the viewport is narrower than `breakpoint`. Single source of truth for every
 * responsive decision on a page — callers branch on this boolean directly (className/layout
 * ternaries) instead of using Tailwind's `sm:` breakpoint classes, so there is never a CSS
 * cascade/specificity question about which rule "wins": exactly one branch is ever rendered.
 */
export function useIsNarrow(breakpoint = 640): boolean {
  const [narrow, setNarrow] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])
  return narrow
}
