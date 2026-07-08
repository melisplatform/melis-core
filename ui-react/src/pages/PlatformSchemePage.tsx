import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Image as ImageIcon, LogIn, Palette, Save, Upload, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  EMPTY_SCHEME, fetchReactScheme, saveReactScheme,
  type ReactScheme, type ThemeLang,
} from '@/lib/platformscheme-react-api'
import { setReactTheme } from '@/lib/react-theme'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import { useCan } from '@/lib/capabilities'

/**
 * Outil "Thème de la plateforme" — VERSION REACT (distincte du legacy). Données :
 * melis_core_platform_scheme_react (images) + ..._trans (textes login par langue).
 * Sections : Back-office (header logo) ; Login (logo, fond + titre/sous-titre TRADUISIBLES par
 * langue du BO avec drapeaux). Appliqué instantanément (store react-theme).
 */

const TOOL_KEY = 'meliscore_tool_platform_scheme'

function notify(kind: 'ok' | 'ko', title: string, message: string) {
  window.postMessage({ __melisNotif: true, kind, title, message }, '*')
}

function Flag({ locale }: { locale: string }) {
  return (
    <img src={`/MelisCore/images/lang/${locale}.png`} alt={locale}
      className="h-3.5 w-auto shrink-0 rounded-[2px] object-cover"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
  )
}

/** Section (niveau module : sinon remontage → perte de focus des inputs). */
function Section({ icon: Icon, title, children }: { icon: typeof Palette; title: string; children: React.ReactNode }) {
  return (
    <section className="max-w-2xl rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-primary" />{title}</h3>
      <div className="mt-4 flex flex-col gap-5">{children}</div>
    </section>
  )
}

/** Champ image : aperçu + URL + upload (data URI) + reset. */
function ImageField({ label, value, note, canEdit, onChange }: {
  label: string; value: string; note: string; canEdit: boolean; onChange: (v: string) => void
}) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    const r = new FileReader(); r.onload = () => onChange(String(r.result)); r.readAsDataURL(f); e.target.value = ''
  }
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-2 flex items-center gap-4">
        <div className="grid h-14 w-40 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted/30">
          {value
            ? <img src={value} alt="" className="max-h-12 max-w-[150px] object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden' }} />
            : <span className="px-2 text-center text-[11px] text-muted-foreground">{note}</span>}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Input value={value} disabled={!canEdit} onChange={(e) => onChange(e.target.value)}
            placeholder={t('scheme.logo_url_ph')} className="h-9 font-mono text-xs" />
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onPick} />
            <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={!canEdit}
              onClick={() => fileRef.current?.click()}>
              <Upload className="size-3.5" />{t('scheme.choose_image')}
            </Button>
            {value && canEdit && (
              <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => onChange('')}>
                <X className="size-3.5" />{t('scheme.clear')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Sélecteur de langue en pastilles bordées (calqué sur l'outil Catégories) : la langue active
 * ressort clairement (bordure primaire + fond card + texte foreground) au lieu d'un simple
 * soulignement peu lisible. Un point de statut indique si la langue a du contenu saisi.
 */
function LangTabs({ langs, active, onChange, isFilled }: {
  langs: ThemeLang[]; active: number; onChange: (id: number) => void; isFilled?: (id: number) => boolean
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {langs.map((l) => {
        const isActive = l.id === active
        const filled = isFilled?.(l.id) ?? false
        return (
          <button key={l.id} type="button" onClick={() => onChange(l.id)}
            aria-pressed={isActive}
            className={cn(
              'inline-flex h-[30px] items-center gap-1.5 rounded-md border px-3 text-[13px] transition-colors',
              isActive
                ? 'border-primary bg-primary/10 text-foreground font-semibold ring-2 ring-primary/40'
                : 'border-border bg-transparent font-medium text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground',
            )}>
            <Flag locale={l.locale} />
            <span>{l.name || l.locale}</span>
            <span aria-hidden
              className={cn('size-1.5 shrink-0 rounded-full', filled ? 'bg-green-500' : 'bg-border')} />
          </button>
        )
      })}
    </div>
  )
}

/** Champ texte (mono-langue : pour la langue active des onglets). */
function TextField({ label, value, canEdit, onChange }: {
  label: string; value: string; canEdit: boolean; onChange: (value: string) => void
}) {
  const { t } = useI18n()
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <textarea value={value} disabled={!canEdit} rows={2} onChange={(e) => onChange(e.target.value)}
        placeholder={t('scheme.text_default_note')}
        className="mt-2 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  )
}

export default function PlatformSchemePage() {
  const location = useLocation()
  const { openTab } = useTabs()
  const { t } = useI18n()
  const base = routeForForward('MelisCore/PlatformScheme') ?? '/platform-scheme'

  const canList = useCan(TOOL_KEY, 'list')
  const canEdit = useCan(TOOL_KEY, 'edit')

  const showViewToggle = toolHasViewToggle('platformscheme')
  const [mode, setMode] = useState<ViewMode>('react')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  const [scheme, setScheme] = useState<ReactScheme>(EMPTY_SCHEME)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeLang, setActiveLang] = useState(0)
  const curLang = activeLang || scheme.languages[0]?.id || 0

  function setSingle<K extends 'headerLogo' | 'loginLogo' | 'loginBackground'>(key: K, value: string) {
    setScheme((s) => ({ ...s, [key]: value }))
  }
  function setTrans(field: 'loginTitle' | 'loginSubtitle', langId: number, value: string) {
    setScheme((s) => ({ ...s, translations: { ...s.translations, [field]: { ...s.translations[field], [String(langId)]: value } } }))
  }

  useEffect(() => {
    if (location.pathname === base) openTab({ id: base, label: t('scheme.title'), path: base })
  }, [location.pathname, openTab, base, t])

  useEffect(() => {
    fetchReactScheme()
      .then((s) => { setScheme(s); setReactTheme(s) })
      .catch((e) => notify('ko', t('scheme.title'), String(e?.message ?? e)))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    setSaving(true)
    try {
      await saveReactScheme({
        scheme: { headerLogo: scheme.headerLogo, loginLogo: scheme.loginLogo, loginBackground: scheme.loginBackground },
        translations: scheme.translations,
      })
      setReactTheme(scheme) // application instantanée (shell + login)
      notify('ok', t('scheme.title'), t('scheme.saved'))
    } catch (e) {
      notify('ko', t('scheme.title'), String((e as Error)?.message ?? e))
    } finally { setSaving(false) }
  }

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold"><Palette className="size-5 text-primary" />{t('scheme.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('scheme.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {showViewToggle && (
            <ViewModeToggle mode={effectiveMode} onChange={(m) => { setMode(m); if (m === 'iframe') setIframeLoaded(true) }} />
          )}
          {canEdit && effectiveMode === 'react' && (
            <Button size="sm" className="gap-1.5" onClick={save} disabled={saving || loading}>
              <Save className="size-4" />{saving ? t('scheme.saving') : t('common.save')}
            </Button>
          )}
        </div>
      </div>

      {/* Vue Melis classique (iframe) — outil legacy complet */}
      <MelisClassicFrame melisKey={TOOL_KEY} title="Thème de la plateforme — Vue Melis"
        visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      {/* Vue React */}
      <div className={cn('flex flex-1 flex-col gap-6', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {!canList ? (
          <p className="text-sm text-muted-foreground">{t('scheme.no_list')}</p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : (<>
          <Section icon={ImageIcon} title={t('scheme.section_backoffice')}>
            <ImageField label={t('scheme.header_logo')} value={scheme.headerLogo} note={t('scheme.logo_default_note')}
              canEdit={canEdit} onChange={(v) => setSingle('headerLogo', v)} />
            <p className="text-[11px] text-muted-foreground">{t('scheme.header_logo_desc')}</p>
          </Section>

          <Section icon={LogIn} title={t('scheme.section_login')}>
            <ImageField label={t('scheme.login_logo')} value={scheme.loginLogo} note={t('scheme.logo_default_note')}
              canEdit={canEdit} onChange={(v) => setSingle('loginLogo', v)} />

            {/* Textes traduisibles : édition par onglet de langue */}
            {scheme.languages.length > 0 && (
              <div>
                <LangTabs langs={scheme.languages} active={curLang} onChange={setActiveLang}
                  isFilled={(id) => (scheme.translations.loginTitle[String(id)] ?? '').trim() !== ''
                    || (scheme.translations.loginSubtitle[String(id)] ?? '').trim() !== ''} />
                <div className="mt-4 flex flex-col gap-5">
                  <TextField label={t('scheme.login_title')} value={scheme.translations.loginTitle[String(curLang)] ?? ''}
                    canEdit={canEdit} onChange={(v) => setTrans('loginTitle', curLang, v)} />
                  <TextField label={t('scheme.login_subtitle')} value={scheme.translations.loginSubtitle[String(curLang)] ?? ''}
                    canEdit={canEdit} onChange={(v) => setTrans('loginSubtitle', curLang, v)} />
                </div>
              </div>
            )}

            <ImageField label={t('scheme.login_bg')} value={scheme.loginBackground} note={t('scheme.bg_default_note')}
              canEdit={canEdit} onChange={(v) => setSingle('loginBackground', v)} />
          </Section>
        </>)}
      </div>
    </div>
  )
}
