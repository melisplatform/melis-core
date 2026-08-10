import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Zone repliable animée — équivalent des `slideUp`/`slideDown` jQuery du back-office legacy.
 *
 *  Technique : on anime `grid-template-rows` de `0fr` à `1fr` sur un conteneur grid d'une seule
 *  ligne. C'est le seul moyen purement CSS d'animer vers la hauteur NATURELLE du contenu :
 *  `height: auto` n'est pas interpolable, et mesurer au JS (ce que fait jQuery) obligerait à
 *  recalculer à chaque changement de contenu (chargements asynchrones, filtres…).
 *
 *  Le contenu reste MONTÉ même replié — indispensable pour que l'animation de fermeture ait lieu.
 *  D'où `inert` : il retire le bloc du parcours clavier et des événements pointeur tant qu'il est
 *  fermé, sans toucher au rendu (contrairement à `hidden`/`invisible`, qui couperaient net
 *  l'animation).
 *
 *  ⚠️ Le contenu doit porter ses propres marges/paddings verticaux : ils sont rognés avec lui
 *  pendant l'animation. Un padding posé sur le Collapsible resterait visible une fois replié. */
export function Collapsible({
  open,
  children,
  className,
}: {
  open: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-300 ease-out',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className,
      )}
    >
      <div className="overflow-hidden" inert={!open}>
        {children}
      </div>
    </div>
  )
}
