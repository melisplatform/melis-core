/**
 * Droits « API / microservices » (section core `<meliscore_microservice>`, audit C4).
 *
 * Le catalogue est AUTORITATIF et groupé par module, servi par
 *   GET /melis/react-api/rights/microservices
 * — énuméré côté core depuis la config fusionnée (`plugins/microservice`) : les modules ne
 * déclarent que leur `app.microservice.php`, rien d'autre.
 *
 * Modèle XML : ALLOW-LIST, default-DENY — seuls les services explicitement activés sont listés :
 *   <meliscore_microservice><id>MelisCms/MelisCmsSiteService</id></meliscore_microservice>
 * Section absente = AUCUN service accessible (même sémantique que la allow-list d'outils
 * `meliscore_leftmenu` ; usr_admin=1 bypasse côté serveur). Un seul droit (activer/désactiver),
 * pas de capacités. Édition React uniquement (onglet API du formulaire user) : le legacy
 * transporte la section sans la lire (préservée à son save par
 * MelisReactApiCapabilityPreserveUserListener).
 */

export interface MicroserviceRight {
  /** Clé de droit : `Module/Service` (ex. `MelisCore/MelisCoreAnnouncementService`). */
  key: string
  /** Nom de la classe de service (affiché). */
  name: string
  /** Description traduite (locale BO courante) — peut être vide. */
  description: string
  /** Méthodes exposées (contexte d'affichage uniquement — le droit est au niveau service). */
  methods: string[]
}

export interface MicroserviceModuleGroup {
  module: string
  services: MicroserviceRight[]
}

/** Catalogue des microservices déclarés, dans l'ordre de merge des modules. */
export async function fetchMicroserviceRights(): Promise<MicroserviceModuleGroup[]> {
  try {
    const res = await fetch('/melis/react-api/rights/microservices', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'include',
    })
    if (!res.ok) return []
    const data = await res.json()
    const raw: unknown[] = Array.isArray(data?.data) ? data.data : []
    return raw
      .map((g) => {
        const o = g as { module?: string; services?: unknown[] }
        if (!o.module || !Array.isArray(o.services)) return null
        const services = o.services
          .map((s) => {
            const v = s as { key?: string; name?: string; description?: string; methods?: string[] }
            return v.key
              ? { key: v.key, name: v.name ?? v.key, description: v.description ?? '', methods: v.methods ?? [] }
              : null
          })
          .filter((s): s is MicroserviceRight => s !== null)
        return services.length ? { module: o.module, services } : null
      })
      .filter((g): g is MicroserviceModuleGroup => g !== null)
  } catch {
    return []
  }
}

/**
 * Réécrit LA SEULE section `<meliscore_microservice>` d'un XML usr_rights, sans toucher au reste
 * (réécriture textuelle ciblée — l'éditeur de droits, lui, reconstruit tout le document ; ici le
 * panneau vit dans l'onglet API et ne doit pas interférer avec les autres sections).
 * Allow-list : aucune clé activée → section omise (default-DENY, l'absence dit déjà « rien »).
 */
export function spliceMicroserviceGrants(xml: string, allowed: Set<string>): string {
  const section = allowed.size
    ? '<meliscore_microservice>\n' + [...allowed].sort().map((k) => `\t<id>${k}</id>`).join('\n') + '\n</meliscore_microservice>'
    : ''
  // Retire la section existante (y compris un éventuel saut de ligne traînant).
  const out = (xml ?? '').replace(/<meliscore_microservice>[\s\S]*?<\/meliscore_microservice>\n?/, '')
  if (!section) return out
  if (out.includes('</document>')) return out.replace('</document>', `${section}\n</document>`)
  if (!out.trim()) {
    // Droits vides (compte piloté par son rôle) : même sémantique que l'éditeur de droits, qui
    // écrit lui aussi un document complet au premier changement.
    return '<?xml version="1.0" encoding="UTF-8"?><document type="MelisUserRights" author="MelisTechnology" version="2.0">\n' + section + '\n</document>'
  }
  return out + '\n' + section
}

/** Clés `Module/Service` explicitement activées dans un XML usr_rights. */
export function parseMicroserviceGrants(xml: string): Set<string> {
  const allowed = new Set<string>()
  if (!xml?.trim()) return allowed
  try {
    const doc = new DOMParser().parseFromString(xml, 'text/xml')
    doc.querySelectorAll('meliscore_microservice > id').forEach((n) => {
      const v = n.textContent?.trim()
      if (v) allowed.add(v)
    })
  } catch { /* XML malformé */ }
  return allowed
}
