import React from 'react'
import type { LucideIcon } from 'lucide-react'

// ─── Melis "M" module icons ──────────────────────────────────────────────────
//
// Icône Melis colorée (M plein, viewBox 0 0 70 70) déclinée par module. PARTAGÉE entre la
// navigation de gauche (useNavMenu) et la palette de widgets du dashboard (WidgetPalette) pour
// qu'elles rendent STRICTEMENT la même icône par section (même glyphe, même couleur).

const M_PATH1 = 'M57.4,0c-4.8,0-8.6,3.9-8.6,8.6v49.2c0,4.8,3.9,8.6,8.6,8.6s8.6-3.9,8.6-8.6V8.7C66,3.9,62.2,0,57.4,0Z'
const M_PATH2 = 'M16.3,4.6C14,.4,8.8-1.2,4.6,1,.4,3.2-1.2,8.5,1,12.7l26.1,49.3c2.2,4.2,7.4,5.8,11.7,3.6,4.2-2.2,5.8-7.4,3.6-11.7L16.3,4.6Z'

function makeSolidM(color: string): LucideIcon {
  return (({ className }: { className?: string }) =>
    React.createElement('svg', { className, viewBox: '0 0 70 70', fill: color },
      React.createElement('path', { d: M_PATH1 }),
      React.createElement('path', { d: M_PATH2 }),
      React.createElement('circle', { cx: '8.8', cy: '57.7', r: '8.8' }),
    )
  ) as unknown as LucideIcon
}

// Solid-color M icons per module
const MelisCoreIcon        = makeSolidM('#f97316')  // orange
const MelisCmsIcon         = makeSolidM('#22c55e')  // green
const MelisMarketingIcon   = makeSolidM('#a855f7')  // purple
const MelisCommerceIcon    = makeSolidM('#3b82f6')  // blue
const MelisMarketplaceIcon = makeSolidM('#ef4444')  // red
const MelisDefaultIcon     = makeSolidM('currentColor')

// Melis AI: pink → purple → cyan gradient (from melis-ai-hero.svg)
const MelisAiIcon = (({ className }: { className?: string }) =>
  React.createElement('svg', { className, viewBox: '0 0 70 70' },
    React.createElement('defs', null,
      React.createElement('linearGradient', { id: 'mai-g', x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
        React.createElement('stop', { offset: '0%',   stopColor: '#ff2d7a' }),
        React.createElement('stop', { offset: '50%',  stopColor: '#9b5cf6' }),
        React.createElement('stop', { offset: '100%', stopColor: '#00b8d4' }),
      ),
    ),
    React.createElement('path', { fill: 'url(#mai-g)', d: M_PATH1 }),
    React.createElement('path', { fill: 'url(#mai-g)', d: M_PATH2 }),
    React.createElement('circle', { fill: 'url(#mai-g)', cx: '8.8', cy: '57.7', r: '8.8' }),
  )
) as unknown as LucideIcon

/** Retourne l'icône Melis colorée d'un module/section par correspondance sur son nom/clé. */
export function getMelisIcon(name: string, key = ''): LucideIcon {
  const n = (name + ' ' + key).toLowerCase()
  if (n.includes('ai'))                                          return MelisAiIcon
  if (n.includes('core'))                                        return MelisCoreIcon
  if (n.includes('cms'))                                         return MelisCmsIcon
  if (n.includes('marketing'))                                   return MelisMarketingIcon
  if (n.includes('commerce'))                                    return MelisCommerceIcon
  if (n.includes('marketplace') || n.includes('market_place'))  return MelisMarketplaceIcon
  return MelisDefaultIcon
}
