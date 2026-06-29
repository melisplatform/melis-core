import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Palette, RotateCcw, Save, Image as ImageIcon, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import * as api from '@/lib/platformscheme-api'
import type { PlatformScheme, SchemeColors } from '@/lib/platformscheme-api'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import { useCan } from '@/lib/capabilities'

const TOOL_KEY = 'meliscore_tool_platform_scheme'

function notify(kind: 'ok' | 'ko', title: string, message: string) {
  window.postMessage({ __melisNotif: true, kind, title, message }, '*')
}

interface PageCache { scheme: PlatformScheme | null; mode: ViewMode; iframeLoaded: boolean }
let _cache: PageCache | null = null

const COLOR_FIELDS: { key: keyof SchemeColors; lbl: string }[] = [
  { key: 'melis_core_platform_color_primary_color', lbl: 'scheme.color.primary' },
  { key: 'melis_core_platform_color_secondary_color', lbl: 'scheme.color.secondary' },
  { key: 'melis_core_platform_color_sidebar_bg_color', lbl: 'scheme.color.sidebar_bg' },
  { key: 'melis_core_platform_color_login_link_color', lbl: 'scheme.color.login_link' },
]

const IMAGE_FIELDS: { key: keyof PlatformScheme; lbl: string }[] = [
  { key: 'sidebar_header_logo', lbl: 'scheme.img.sidebar_logo' },
  { key: 'login_logo', lbl: 'scheme.img.login_logo' },
  { key: 'login_background', lbl: 'scheme.img.login_bg' },
  { key: 'favicon', lbl: 'scheme.img.favicon' },
]

/** Normalise une valeur en #rrggbb pour <input type=color> (sinon il refuse). */
function toHex(v: string): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec((v || '').trim())
  return m ? `#${m[1]}` : '#000000'
}

export default function PlatformSchemePage() {
  const location = useLocation()
  const { openTab } = useTabs()
  const { t } = useI18n()
  const base = routeForForward('MelisCore/PlatformScheme') ?? '/platform-scheme'

  const canList = useCan(TOOL_KEY, 'list')
  const canEdit = useCan(TOOL_KEY, 'edit')

  const showViewToggle = toolHasViewToggle('platformscheme')
  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  const [scheme, setScheme] = useState<PlatformScheme | null>(_cache?.scheme ?? null)
  const [loading, setLoading] = useState(!_cache?.scheme)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  const cacheRef = useRef({ scheme, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { scheme, mode, iframeLoaded } })
  useEffect(() => () => { _cache = { ...cacheRef.current } }, [])

  useEffect(() => {
    if (location.pathname === base) openTab({ id: base, label: t('scheme.title'), path: base })
  }, [location.pathname, openTab, base, t])

  function load() {
    setLoading(true)
    api.fetchScheme().then(setScheme)
      .catch((e) => notify('ko', t('scheme.title'), String(e?.message ?? e)))
      .finally(() => setLoading(false))
  }
  useEffect(() => { if (!_cache?.scheme) load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function setColor(key: keyof SchemeColors, value: string) {
    setScheme((s) => (s ? { ...s, colors: { ...s.colors, [key]: value } } : s))
  }
  function setField<K extends keyof PlatformScheme>(key: K, value: PlatformScheme[K]) {
    setScheme((s) => (s ? { ...s, [key]: value } : s))
  }

  async function save() {
    if (!scheme) return
    setSaving(true)
    try {
      await api.saveScheme(scheme)
      notify('ok', t('scheme.title'), t('scheme.saved'))
      _cache = null
    } catch (e) { notify('ko', t('scheme.title'), String((e as Error)?.message ?? e)) }
    finally { setSaving(false) }
  }

  async function resetDefault() {
    setResetting(true)
    try {
      await api.resetScheme()
      notify('ok', t('scheme.title'), t('scheme.reset_done'))
      _cache = null
      load()
    } catch (e) { notify('ko', t('scheme.title'), String((e as Error)?.message ?? e)) }
    finally { setResetting(false) }
  }

  const Section = ({ icon: Icon, title, children }: { icon: typeof Palette; title: string; children: React.ReactNode }) => (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-primary" />{title}</h3>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  )

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
          <button type="button" onClick={load} title={t('common.refresh')}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <RotateCcw className={cn('size-3.5', loading && 'animate-spin')} />
          </button>
          {canEdit && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={resetDefault} disabled={resetting || saving}>
              <RefreshCw className={cn('size-3.5', resetting && 'animate-spin')} />{t('scheme.reset')}
            </Button>
          )}
          {canEdit && (
            <Button size="sm" className="gap-1.5" onClick={save} disabled={saving || !scheme}>
              <Save className="size-4" />{saving ? t('scheme.saving') : t('common.save')}
            </Button>
          )}
        </div>
      </div>

      {/* Vue Melis classique (iframe) */}
      <MelisClassicFrame melisKey={TOOL_KEY} title="Thème de la plateforme — Vue Melis"
        visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      {/* Vue React */}
      <div className={cn('flex flex-1 flex-col gap-6', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {!canList ? (
          <p className="text-sm text-muted-foreground">{t('scheme.no_list')}</p>
        ) : loading || !scheme ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : (<>
          {/* Couleurs */}
          <Section icon={Palette} title={t('scheme.colors_title')}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {COLOR_FIELDS.map(({ key, lbl }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium">{t(lbl as Parameters<typeof t>[0])}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={toHex(scheme.colors[key])} disabled={!canEdit}
                      onChange={(e) => setColor(key, e.target.value)}
                      className="size-8 cursor-pointer rounded border border-border bg-transparent p-0.5 disabled:cursor-not-allowed" />
                    <Input value={scheme.colors[key]} disabled={!canEdit}
                      onChange={(e) => setColor(key, e.target.value)} placeholder="#rrggbb"
                      className="h-8 w-28 font-mono text-xs" />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* En-tête / Logos / Favicon */}
          <Section icon={ImageIcon} title={t('scheme.images_title')}>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium">{t('scheme.sidebar_text')}</label>
              <Input value={scheme.sidebar_header_text} disabled={!canEdit}
                onChange={(e) => setField('sidebar_header_text', e.target.value)} className="h-8 w-72 text-sm" />
            </div>
            {IMAGE_FIELDS.map(({ key, lbl }) => {
              const val = scheme[key] as string
              return (
                <div key={key} className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium">{t(lbl as Parameters<typeof t>[0])}</label>
                  <div className="flex items-center gap-2">
                    {val && <img src={val} alt="" className="size-8 rounded border border-border object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden' }} />}
                    <Input value={val} disabled={!canEdit}
                      onChange={(e) => setField(key, e.target.value)} placeholder="/MelisCore/images/…"
                      className="h-8 w-80 font-mono text-xs" />
                  </div>
                </div>
              )
            })}
            <p className="text-[11px] text-muted-foreground">{t('scheme.upload_hint')}</p>
          </Section>
        </>)}
      </div>
    </div>
  )
}
