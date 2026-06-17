import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTabs } from '@/components/tabs/tab-store'
import { useZonePool } from '@/components/zone/zone-pool'

function formatKey(key: string): string {
  return key
    .replace(/^melis(core|sb|cms)?_tool_?/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim() || key
}

/**
 * Composant route pour /zone/:melisKey.
 *
 * Ne rend pas d'iframe directement — délègue au ZoneFrames rendu dans Shell.
 * Avantage : l'iframe reste montée quand l'utilisateur navigue vers une autre
 * page (display:none), donc la réouverture est instantanée sans rechargement.
 */
export default function ZonePage() {
  const { melisKey }      = useParams<{ melisKey: string }>()
  const { openTab, tabs } = useTabs()
  const { register }      = useZonePool()

  const tabLabel = tabs.find(t => t.id === `/zone/${melisKey}`)?.label
  const title    = tabLabel && tabLabel !== melisKey ? tabLabel : formatKey(melisKey ?? '')

  useEffect(() => {
    if (!melisKey) return
    // Ouvre l'onglet dans la topbar
    openTab({ id: `/zone/${melisKey}`, label: title, path: `/zone/${melisKey}` })
    // Enregistre l'iframe dans le pool (sans effet si déjà enregistrée)
    register(melisKey, `/melis/react-tool-page?key=${encodeURIComponent(melisKey)}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [melisKey])

  // La page elle-même est vide : le contenu est rendu par ZoneFrames dans Shell
  return <div className="h-full w-full" />
}
