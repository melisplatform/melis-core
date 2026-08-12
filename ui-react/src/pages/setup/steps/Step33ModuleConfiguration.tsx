import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import { FormErrorBanner, type FormIssue } from '@/shared/melis-form-errors'
import {
  getModuleConfigurationForms,
  submitModuleConfigurationForm,
  validateModuleConfigurationForm,
} from '@/lib/setup-api'
import type { RegisterBeforeNext } from '../wizard-steps'

/**
 * Le legacy renvoie un bloc à onglets Bootstrap (`.nav-tabs` + `.tab-pane`) suivi de son propre
 * bouton Next. Sans Bootstrap JS les onglets ne commuteraient pas : on garde les panneaux, un
 * par module, empilés et titrés, et on jette la navigation et le bouton du carousel.
 */
function extractModulePanes(html: string): { module: string; content: string }[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(doc.querySelectorAll('.tab-pane')).map((pane) => ({
    // id = 'id' + nom du module (cf. getModuleConfigurationFormsAction)
    module: pane.id.replace(/^id/, ''),
    content: pane.innerHTML,
  }))
}

/** Une erreur rattachée à un champ précis d'un module. */
interface FieldError {
  module?: string
  field: string
  label: string
  message: string
}

interface ParsedErrors {
  /** Erreurs par champ — affichées sous l'input correspondant. */
  fields: FieldError[]
  /** Messages sans champ identifiable — bandeau uniquement. */
  global: FormIssue[]
}

/** Clés de validateur signalant une saisie absente (Laminas `NotEmpty`). */
const EMPTY_VALIDATORS = new Set(['isEmpty', 'notEmpty'])

/**
 * Décortique la réponse de `validate/submitModuleConfigurationForm`. Elle arrive sous la forme
 * d'une liste par module — `[{name, message, errors: {champ: {validateur: message, label}}}]` —
 * parfois réduite à la map de champs seule. Chaque message de validateur donne une entrée,
 * rattachée à son champ pour pouvoir être affichée sous l'input.
 *
 * Les formulaires des modules ne posent pas `break_chain_on_failure` : TOUS les validateurs
 * d'un champ répondent, même ceux qui n'ont plus de sens. Un mot de passe de confirmation vide
 * remontait ainsi « Veuillez saisir votre mot de passe », « au moins 8 caractères », « au moins
 * 1 lettre et 1 chiffre » et « ne correspond pas » d'un coup — des exigences contradictoires
 * pour un champ que l'utilisateur n'a tout simplement pas rempli. On ne garde donc que
 * l'absence de saisie quand elle est signalée, et on dédoublonne les libellés identiques
 * (plusieurs validateurs partagent souvent le même message).
 */
function parseErrors(errors: unknown): ParsedErrors {
  const parsed: ParsedErrors = { fields: [], global: [] }

  const addFields = (fields: unknown, module?: string) => {
    if (!fields || typeof fields !== 'object') return
    Object.entries(fields as Record<string, unknown>).forEach(([field, messages]) => {
      if (typeof messages === 'string') {
        parsed.fields.push({ module, field, label: field, message: messages })
        return
      }
      if (!messages || typeof messages !== 'object') return
      const entries = messages as Record<string, unknown>
      // `label` n'est pas un message de validateur mais le libellé du champ.
      const label = typeof entries.label === 'string' ? entries.label : field
      const raised = Object.entries(entries)
        .filter((e): e is [string, string] => e[0] !== 'label' && typeof e[1] === 'string')
      const missing = raised.filter(([validator]) => EMPTY_VALIDATORS.has(validator))
      const seen = new Set<string>()
      ;(missing.length ? missing : raised).forEach(([, message]) => {
        if (seen.has(message)) return
        seen.add(message)
        parsed.fields.push({ module, field, label, message })
      })
    })
  }

  const modules = Array.isArray(errors) ? errors : [errors]
  modules.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return
    const module = entry as { name?: string; message?: string; errors?: unknown }
    const before = parsed.fields.length
    // Une entrée sans `errors` mais avec name/message ne porte que le message global du module.
    const isModuleEnvelope = 'name' in module || 'message' in module
    addFields(module.errors ?? (isModuleEnvelope ? undefined : module), module.name)
    // Aucun détail par champ : on garde au moins le message global du module.
    if (parsed.fields.length === before && typeof module.message === 'string') {
      parsed.global.push({ label: module.name, message: module.message })
    }
  })

  return parsed
}

const NO_ERRORS: ParsedErrors = { fields: [], global: [] }

/**
 * Step 3.3 — configuration des modules fraîchement installés. Les formulaires sont produits
 * par chaque module (`MelisSetupPostDownload::getFormAction`) et n'existent qu'en HTML : on
 * injecte donc le même bloc que le carousel legacy, et on rejoue ses deux appels
 * (`validateModuleConfigurationForm` puis `submitModuleConfigurationForm`) au passage à
 * l'étape suivante. Le HTML étant du Bootstrap legacy, il ne suit pas le style du SPA — un
 * module devra exposer ses champs en JSON pour qu'on puisse les rendre nativement.
 */
export function Step33ModuleConfiguration({ onStatusChange, registerBeforeNext }: {
  onStatusChange?: (passed: boolean) => void
  registerBeforeNext?: RegisterBeforeNext
}) {
  const { t } = useI18n()
  const [panes, setPanes] = useState<{ module: string; content: string }[]>([])
  const [activeTab, setActiveTab] = useState('')
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<ParsedErrors>(NO_ERRORS)
  /** Miroir de `errors` pour les écouteurs DOM (enregistrés une seule fois). */
  const errorsRef = useRef<ParsedErrors>(NO_ERRORS)
  /** Une soumission réussie ne doit pas être rejouée : les formulaires des modules CRÉENT des
   *  données (le compte administrateur de MelisCore, par exemple), un second envoi les
   *  dupliquerait — un `admin` en double rend ensuite l'authentification ambiguë et le login
   *  échoue. Repasser par cette étape ne renvoie donc rien tant que rien n'a changé. */
  const submittedRef = useRef(false)
  const container = useRef<HTMLDivElement>(null)
  const paneRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    let cancelled = false
    getModuleConfigurationForms()
      .then((content) => {
        if (cancelled) return
        const parsed = extractModulePanes(content)
        setPanes(parsed)
        setActiveTab(parsed[0]?.module ?? '')
        // Rien à valider tant que l'utilisateur n'a rien saisi : l'étape s'ouvre validée,
        // c'est le passage à l'étape suivante qui refuse d'avancer en cas d'erreur.
        onStatusChange?.(true)
      })
      .catch((e) => {
        if (cancelled) return
        setErrors({ fields: [], global: [{ message: e instanceof Error ? e.message : String(e) }] })
        onStatusChange?.(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chargement unique au montage
  }, [])

  /** Sérialise tous les formulaires injectés, comme `$("#...  form").serialize()` legacy. */
  function serializeForms(): string {
    const forms = container.current?.querySelectorAll('form') ?? []
    const params = new URLSearchParams()
    forms.forEach((form) => {
      new FormData(form).forEach((value, key) => {
        if (typeof value === 'string') params.append(key, value)
      })
    })
    return params.toString()
  }

  /** Les erreurs d'un module masqué passeraient inaperçues : on ouvre son onglet. */
  function reportErrors(parsed: ParsedErrors) {
    setErrors(parsed)
    const firstFaulty = parsed.fields.find((f) => f.module)?.module
    if (firstFaulty) setActiveTab(firstFaulty)
  }

  const submit = useCallback(async (): Promise<boolean> => {
    if (submittedRef.current) return true
    setErrors(NO_ERRORS)
    const query = serializeForms()
    try {
      const validation = await validateModuleConfigurationForm(query)
      if (!validation.success) {
        reportErrors(parseErrors(validation.errors))
        return false
      }
      const submission = await submitModuleConfigurationForm(query)
      if (!submission.success) {
        reportErrors(parseErrors(submission.errors))
        return false
      }
      submittedRef.current = true
      return true
    } catch (e) {
      setErrors({ fields: [], global: [{ message: e instanceof Error ? e.message : String(e) }] })
      return false
    }
  }, [])

  // Injection du HTML rendu par les modules — une fois par panneau, hors du cycle de rendu React
  // (un `dangerouslySetInnerHTML` réévalué remettrait les champs à leur valeur initiale).
  useEffect(() => {
    panes.forEach((pane) => {
      const el = paneRefs.current[pane.module]
      if (!el || el.dataset.filled === '1') return
      el.innerHTML = pane.content
      el.dataset.filled = '1'
    })
  }, [panes])

  // Les formulaires sont du HTML injecté : on pose les messages directement sous l'input
  // concerné, dans le DOM du module, plutôt que de reconstruire les champs côté React.
  useEffect(() => {
    const root = container.current
    if (!root) return

    root.querySelectorAll('.melis-legacy-field-error').forEach((node) => node.remove())
    root.querySelectorAll('.melis-legacy-invalid').forEach((node) => node.classList.remove('melis-legacy-invalid'))

    errors.fields.forEach(({ module, field, message }) => {
      const pane = module ? root.querySelector(`[data-module="${CSS.escape(module)}"]`) : root
      const input = pane?.querySelector(`[name="${CSS.escape(field)}"]`)
      if (!input) return
      input.classList.add('melis-legacy-invalid')
      const line = document.createElement('p')
      line.className = 'melis-legacy-field-error'
      line.textContent = message
      const group = input.closest('.form-group') ?? input.parentElement
      group?.appendChild(line)
    })
  }, [errors, panes, activeTab])

  /** Champ (nom + module) d'un input du HTML injecté. */
  function locate(target: EventTarget | null): { field: string; module?: string } | null {
    if (!(target instanceof HTMLElement)) return null
    const name = target.getAttribute('name')
    if (!name || !('form' in target)) return null
    return { field: name, module: target.closest('[data-module]')?.getAttribute('data-module') ?? undefined }
  }

  useEffect(() => { errorsRef.current = errors }, [errors])

  // Un champ en erreur est revalidé auprès du serveur quand l'utilisateur en sort (ou change
  // une valeur de liste) : le message ne disparaît que si la valeur est devenue réellement
  // valide, et il se met à jour si l'erreur change. Volontairement PAS pendant la frappe : le
  // repaint des messages sous le champ perturbait la saisie en cours. Les champs sans erreur ne
  // déclenchent rien — c'est la validation du bouton Suivant qui les tranchera.
  useEffect(() => {
    const root = container.current
    if (!root) return

    let timer: ReturnType<typeof setTimeout> | undefined

    const revalidate = async (hit: { field: string; module?: string }) => {
      const same = (f: FieldError) => f.field === hit.field && f.module === hit.module
      try {
        const result = await validateModuleConfigurationForm(serializeForms())
        const fresh = result.success ? [] : parseErrors(result.errors).fields.filter(same)
        setErrors((prev) => {
          if (!prev.fields.some(same)) return prev
          return { ...prev, fields: [...prev.fields.filter((f) => !same(f)), ...fresh] }
        })
      } catch { /* réseau : on garde l'erreur affichée, le Suivant tranchera */ }
    }

    const onSettled = (e: Event) => {
      const hit = locate(e.target)
      // Rien à faire tant que ce champ n'affiche pas d'erreur.
      if (!hit || !errorsRef.current.fields.some((f) => f.field === hit.field && f.module === hit.module)) return
      clearTimeout(timer)
      // Micro-délai : laisse le focus se poser ailleurs avant de retoucher au DOM du champ.
      timer = setTimeout(() => { void revalidate(hit) }, 50)
    }

    root.addEventListener('change', onSettled)
    root.addEventListener('focusout', onSettled)
    return () => {
      clearTimeout(timer)
      root.removeEventListener('change', onSettled)
      root.removeEventListener('focusout', onSettled)
    }
  }, [panes])

  // Le bandeau ne répète pas les erreurs de champ (affichées sous chaque input) : il ne porte
  // que le rappel général, plus les messages qui ne visent aucun champ précis.
  const hasErrors = errors.fields.length > 0 || errors.global.length > 0

  /** Nombre d'erreurs par module — pastille sur l'onglet correspondant. */
  const errorCount = errors.fields.reduce<Record<string, number>>((acc, f) => {
    if (f.module) acc[f.module] = (acc[f.module] ?? 0) + 1
    return acc
  }, {})

  useEffect(() => {
    registerBeforeNext?.(submit)
    return () => registerBeforeNext?.(null)
  }, [registerBeforeNext, submit])

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-[var(--font-display)] text-sm font-semibold">{t('setup.config.title')}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{t('setup.config.desc')}</p>

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        {hasErrors && <FormErrorBanner title={t('common.check_fields')} issues={errors.global} />}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : !panes.length ? (
          <p className="text-sm text-muted-foreground">{t('setup.config.none')}</p>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Onglets : un module par onglet, comme le bloc `nav-tabs` legacy — mais pilotés
                par React, le SPA n'embarque pas le JS Bootstrap. */}
            <nav className="flex shrink-0 gap-1 overflow-x-auto sm:w-48 sm:flex-col" aria-label={t('setup.config.title')}>
              {panes.map((pane) => (
                <button
                  key={pane.module}
                  type="button"
                  onClick={() => setActiveTab(pane.module)}
                  aria-current={activeTab === pane.module}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                    activeTab === pane.module
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  {pane.module}
                  {errorCount[pane.module] > 0 && (
                    <span className="ml-1.5 rounded-full bg-destructive/15 px-1.5 py-0.5 text-xs font-medium text-destructive">
                      {errorCount[pane.module]}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            {/* Tous les panneaux restent montés (seul l'actif est visible) : la validation
                sérialise l'ensemble des formulaires, comme le legacy. Le HTML des modules est
                injecté UNE seule fois (effet ci-dessus) et n'est plus jamais retouché par React :
                les valeurs saisies et le focus survivent aux rendus (affichage des erreurs,
                changement d'onglet…). */}
            <div ref={container} className="min-w-0 flex-1">
              {panes.map((pane) => (
                <div
                  key={pane.module}
                  ref={(el) => { paneRefs.current[pane.module] = el }}
                  data-module={pane.module}
                  hidden={activeTab !== pane.module}
                  className="melis-legacy-forms max-w-lg"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
