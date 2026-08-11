import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Info, Loader2, RotateCcw } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/i18n-context'
import { FormErrorBanner } from '@/shared/melis-form-errors'
import type { I18nKey } from '@/i18n/dictionaries'
import { listAvailableModules, saveModuleSelection, type ModuleCatalog } from '@/lib/setup-api'
import type { RegisterBeforeNext } from '../wizard-steps'

interface WebOptionDef {
  value: string
  titleKey: I18nKey
  descKey: I18nKey
  hintKey: I18nKey
  /** `data-dependency` du radio legacy : modules cochés d'office et non décochables. */
  dependencies: string[]
}

/** Les 4 options de `selection.phtml`, avec les mêmes dépendances imposées. */
const WEB_OPTIONS: WebOptionDef[] = [
  {
    value: 'MelisCoreOnly',
    titleKey: 'setup.modules.opt_core_title',
    descKey: 'setup.modules.opt_core_desc',
    hintKey: 'setup.modules.opt_core_hint',
    dependencies: [],
  },
  {
    value: 'None',
    titleKey: 'setup.modules.opt_none_title',
    descKey: 'setup.modules.opt_none_desc',
    hintKey: 'setup.modules.opt_none_hint',
    dependencies: ['MelisEngine', 'MelisFront', 'MelisCms'],
  },
  {
    value: 'NewSite',
    titleKey: 'setup.modules.opt_newsite_title',
    descKey: 'setup.modules.opt_newsite_desc',
    hintKey: 'setup.modules.opt_newsite_hint',
    dependencies: ['MelisEngine', 'MelisFront', 'MelisCms'],
  },
  {
    value: 'MelisDemoCms',
    titleKey: 'setup.modules.opt_democms_title',
    descKey: 'setup.modules.opt_democms_desc',
    hintKey: 'setup.modules.opt_democms_hint',
    dependencies: [
      'MelisEngine', 'MelisFront', 'MelisCms', 'MelisCmsNews',
      'MelisCmsSlider', 'MelisCmsProspects', 'MelisCmsPageScriptEditor',
    ],
  },
]

/** `data-dependency` des radios « Site to Install » du legacy — identique pour tous les sites. */
const SITE_DEPENDENCIES = ['MelisEngine', 'MelisFront', 'MelisCms', 'MelisCmsNews', 'MelisCmsSlider', 'MelisCmsProspects']

/** Options sans site démo : la valeur stockée en session est l'option elle-même. */
const NON_SITE_OPTIONS = ['MelisCoreOnly', 'None', 'NewSite']

/** Option par défaut du legacy : `indexAction` retombe sur `MelisCoreOnly` quand la session
 *  ne contient encore aucun `site_module`. */
const DEFAULT_WEB_OPTION = WEB_OPTIONS[0]

/**
 * Step 3.1 — type d'installation, site à installer et modules Melis, décalqué de
 * `selection.phtml` + du `dependencyChecker()` de `setup.js` legacy : le choix de plateforme
 * impose ses modules (cochés, non décochables), cocher un module coche ses dépendances,
 * le décocher décoche ceux qui en dépendent. Le seul bloc legacy non porté est
 * « install an additional framework » (multi-framework/demo tool).
 *
 * Catalogue récupéré en direct depuis le marketplace Packagist (même appel réseau que le
 * carousel) : peut être vide si le marketplace est injoignable, comme côté legacy.
 */
export function Step31ModuleSelection({ onStatusChange, registerBeforeNext }: {
  onStatusChange?: (passed: boolean) => void
  registerBeforeNext?: RegisterBeforeNext
}) {
  const { t } = useI18n()
  const [catalog, setCatalog] = useState<ModuleCatalog | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [webOption, setWebOption] = useState(DEFAULT_WEB_OPTION.value)
  const [site, setSite] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(() => new Set(DEFAULT_WEB_OPTION.dependencies))
  const [language, setLanguage] = useState('')
  const [websiteName, setWebsiteName] = useState('')
  // Éditable, contrairement au champ readonly du legacy : la valeur servira à mettre à jour
  // MELIS_MODULE dans le .env (fonctionnalité à venir).
  const [websiteModule, setWebsiteModule] = useState('')

  const [saveError, setSaveError] = useState<string | null>(null)
  /** Passe à true dès que l'utilisateur choisit une option — verrouille la reprise de session. */
  const touched = useRef(false)

  const modules = catalog?.modules ?? []
  const option = WEB_OPTIONS.find((o) => o.value === webOption) ?? WEB_OPTIONS[0]
  // Modules imposés par l'option courante : cochés et verrouillés (`main_dependencies` legacy).
  const locked = useMemo(() => new Set(option.dependencies), [option])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await listAvailableModules()
      setCatalog(data)
      // Étape de saisie : rien à valider, Suivant est ouvert dès que le catalogue est là.
      onStatusChange?.(true)
      setLanguage((l) => l || data.selection.language || data.languages[0]?.value || '')
      setWebsiteName((n) => n || data.selection.websiteName || data.websiteModule)
      setWebsiteModule((m) => m || data.selection.websiteModule || data.websiteModule)

      // Reprise de la sélection enregistrée en session : `site` y vaut soit l'option elle-même,
      // soit le module du site démo (cf. `selectedSite` legacy) — un site démo enregistré
      // resélectionne donc l'option « site démo » et son radio. Jamais appliqué si l'utilisateur
      // a déjà touché aux options : le catalogue arrive tard (versions Packagist), il ne doit
      // pas déplacer un choix fait entre-temps.
      const savedSite = data.selection.site
      const savedOption = savedSite && NON_SITE_OPTIONS.includes(savedSite)
        ? savedSite
        : savedSite ? 'MelisDemoCms' : null
      if (savedOption && !touched.current) {
        setWebOption(savedOption)
        const deps = WEB_OPTIONS.find((o) => o.value === savedOption)?.dependencies ?? []
        // La session contient aussi le module du site démo, absent du catalogue de modules.
        const known = new Set(data.modules.map((m) => m.name))
        setSelected(new Set([...deps, ...data.selection.modules].filter((m) => known.has(m))))
      }
      setSite((s) => (savedSite && !NON_SITE_OPTIONS.includes(savedSite) ? savedSite : s) ?? data.sites[0]?.module ?? null)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onStatusChange est recréé à chaque rendu
  }, [])

  useEffect(() => { void load() }, [load])

  /** Changement d'option : on repart des seules dépendances imposées, comme le clic sur un
   *  radio `weboption` legacy (reset de toutes les cases puis dependencyChecker). */
  function selectWebOption(value: string) {
    touched.current = true
    setWebOption(value)
    setSelected(new Set(WEB_OPTIONS.find((o) => o.value === value)?.dependencies ?? []))
  }

  /** Coche un module et, en cascade, ses dépendances (dependencyChecker, status = true). */
  function withDependencies(set: Set<string>, name: string): Set<string> {
    set.add(name)
    const entry = modules.find((m) => m.name === name)
    entry?.dependencies.forEach((dep) => {
      if (modules.some((m) => m.name === dep)) set.add(dep)
    })
    return set
  }

  /** Décoche un module et tous ceux qui le déclarent en dépendance (status = false). */
  function withoutDependents(set: Set<string>, name: string): Set<string> {
    set.delete(name)
    modules.forEach((m) => {
      if (m.dependencies.includes(name)) set.delete(m.name)
    })
    return set
  }

  function toggle(name: string) {
    if (locked.has(name)) return
    setSelected((s) => {
      const next = new Set(s)
      return next.has(name) ? withoutDependents(next, name) : withDependencies(next, name)
    })
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(modules.map((m) => m.name)) : new Set(option.dependencies))
  }

  function selectSite(module: string) {
    setSite(module)
    setSelected((s) => {
      const next = new Set(s)
      SITE_DEPENDENCIES.forEach((dep) => { if (modules.some((m) => m.name === dep)) next.add(dep) })
      return next
    })
  }

  const showModules = webOption !== 'MelisCoreOnly'
  const showSites = webOption === 'MelisDemoCms'
  const showWebForm = webOption === 'NewSite'
  const allSelected = modules.length > 0 && selected.size === modules.length

  /** Enregistrement au passage à l'étape suivante — le legacy poste la sélection au clic sur
   *  Next (`setDownloadableModules`), l'installation elle-même se fait à l'étape d'après. */
  const save = useCallback(async (): Promise<boolean> => {
    if (!catalog) return false
    setSaveError(null)
    const chosen = webOption !== 'MelisCoreOnly'
      ? catalog.modules.filter((m) => selected.has(m.name)).map((m) => ({ name: m.name, package: m.package }))
      : []
    const chosenSite = catalog.sites.find((s) => s.module === site)
    try {
      await saveModuleSelection({
        webOption,
        site: webOption === 'MelisDemoCms' && chosenSite
          ? { module: chosenSite.module, package: chosenSite.package }
          : null,
        modules: chosen,
        language: webOption === 'NewSite' ? language : null,
        websiteName: webOption === 'NewSite' ? websiteName : '',
        websiteModule,
      })
      return true
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
      return false
    }
  }, [catalog, webOption, site, selected, language, websiteName, websiteModule])

  useEffect(() => {
    registerBeforeNext?.(save)
    return () => registerBeforeNext?.(null)
  }, [registerBeforeNext, save])

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-[var(--font-display)] text-sm font-semibold">{t('setup.modules.title')}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('setup.modules.desc')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          aria-label={t('setup.modules.refresh')}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
        </button>
      </div>

      <div className="mt-4 space-y-5 border-t border-border pt-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : loadError ? (
          <p className="text-sm text-destructive">{loadError}</p>
        ) : (
          <>
          {/* Type d'installation — affiché même si le marketplace n'a renvoyé aucun module */}
          <fieldset className="space-y-2">
            <legend className="sr-only">{t('setup.modules.setup_type')}</legend>
            {WEB_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors',
                  webOption === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent',
                )}
              >
                <input
                  type="radio"
                  name="weboption"
                  value={opt.value}
                  checked={webOption === opt.value}
                  onChange={() => selectWebOption(opt.value)}
                  className="mt-1 size-4 shrink-0 accent-[var(--color-primary)]"
                />
                <span className="text-sm">
                  <span className="font-semibold">{t(opt.titleKey)}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{t(opt.descKey)}</span>
                  <span className="mt-0.5 block text-xs italic text-muted-foreground">{t(opt.hintKey)}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {/* Nouveau site : langue + nom + module (module imposé par le vhost, en lecture seule) */}
          {showWebForm && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="site-lang">{t('setup.modules.site_lang')}</Label>
                <select
                  id="site-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {catalog?.languages.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="site-name">{t('setup.modules.site_name')}</Label>
                <Input id="site-name" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="site-module">{t('setup.modules.site_module')}</Label>
                <Input id="site-module" value={websiteModule} onChange={(e) => setWebsiteModule(e.target.value)} />
              </div>
            </div>
          )}

            {/* Site à installer — uniquement pour l'option site démo, comme le legacy */}
            {showSites && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('setup.modules.sites')}</h4>
                {!catalog?.sites.length ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="size-4" />
                    {t('setup.modules.none')}
                  </div>
                ) : catalog.sites.map((s) => (
                  <label key={s.module} className="flex cursor-pointer gap-3 rounded-md px-1.5 py-1.5 hover:bg-accent">
                    <input
                      type="radio"
                      name="site"
                      value={s.module}
                      checked={site === s.module}
                      onChange={() => selectSite(s.module)}
                      className="mt-1 size-4 shrink-0 accent-[var(--color-primary)]"
                    />
                    <span className="text-sm">
                      <span className="font-medium">{s.title}</span>
                      <span className="mt-0.5 block whitespace-pre-line text-xs text-muted-foreground">{s.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Modules — masqués pour « MelisCore seul », comme le slideUp legacy */}
            {showModules && (
              !modules.length ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="size-4" />
                  {t('setup.modules.none')}
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('setup.modules.title')}</h4>
                  <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                    {modules.map((m) => (
                      <li key={m.name} className="flex items-center gap-2">
                        <label
                          className={cn(
                            'flex flex-1 items-center gap-2.5 rounded-md px-1.5 py-1 text-sm',
                            locked.has(m.name) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-accent',
                          )}
                        >
                          <Checkbox
                            checked={selected.has(m.name)}
                            disabled={locked.has(m.name)}
                            onCheckedChange={() => toggle(m.name)}
                          />
                          <span className="truncate">
                            {m.title}
                            {m.version && <span className="text-muted-foreground"> ({m.version})</span>}
                          </span>
                        </label>
                        {m.subtitle && (
                          <span title={m.subtitle} className="shrink-0 text-muted-foreground">
                            <Info className="size-3.5" aria-label={m.subtitle} />
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 text-sm hover:bg-accent">
                    <Checkbox checked={allSelected} onCheckedChange={(v) => toggleAll(v === true)} />
                    {t('setup.modules.select_all')}
                  </label>
                </div>
              )
            )}

            {saveError && <FormErrorBanner title={t('common.check_fields')} issues={[{ message: saveError }]} />}
          </>
        )}
      </div>
    </div>
  )
}
