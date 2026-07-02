import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { RotateCcw, Save, Settings2, ShieldAlert, Clock, KeyRound, Repeat } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import * as api from '@/lib/otherconfig-api'
import type { OtherConfig } from '@/lib/otherconfig-api'
import { useTabs } from '@/components/tabs/tab-store'
import { MelisClassicFrame, ViewModeToggle, type ViewMode } from '@/components/MelisClassicView'
import { toolHasViewToggle } from '@/lib/module-registry'
import { routeForForward } from '@/lib/tool-routes'
import { useI18n } from '@/i18n/i18n-context'
import { useCan } from '@/lib/capabilities'

const TOOL_KEY = 'meliscore_tool_other_config'

function notify(kind: 'ok' | 'ko', title: string, message: string) {
  window.postMessage({ __melisNotif: true, kind, title, message }, '*')
}

// ─── Cache module-level (page montée en permanence) ────────────────────────────
interface PageCache { config: OtherConfig | null; mode: ViewMode; iframeLoaded: boolean }
let _cache: PageCache | null = null

/** Switch on/off accessible (on='1' / off='0'). */
function Switch({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-emerald-500' : 'bg-red-500', disabled && 'cursor-not-allowed opacity-50')}>
      <span className={cn('inline-block size-4 transform rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
  )
}

export default function OtherConfigPage() {
  const location = useLocation()
  const { openTab } = useTabs()
  const { t } = useI18n()
  const base = routeForForward('MelisCore/MelisCoreOtherConfig') ?? '/otherconfig'

  const canList = useCan(TOOL_KEY, 'list')
  const canEdit = useCan(TOOL_KEY, 'edit')

  const showViewToggle = toolHasViewToggle('otherconfig')
  const [mode, setMode] = useState<ViewMode>(_cache?.mode ?? 'react')
  const [iframeLoaded, setIframeLoaded] = useState(_cache?.iframeLoaded ?? false)
  const effectiveMode: ViewMode = showViewToggle ? mode : 'react'

  const [cfg, setCfg] = useState<OtherConfig | null>(_cache?.config ?? null)
  const [loading, setLoading] = useState(!_cache?.config)
  const [saving, setSaving] = useState(false)

  const cacheRef = useRef({ cfg, mode, iframeLoaded })
  useEffect(() => { cacheRef.current = { cfg, mode, iframeLoaded } })
  useEffect(() => () => { _cache = { config: cacheRef.current.cfg, mode: cacheRef.current.mode, iframeLoaded: cacheRef.current.iframeLoaded } }, [])

  useEffect(() => {
    if (location.pathname === base) openTab({ id: base, label: t('otherconfig.title'), path: base })
  }, [location.pathname, openTab, base, t])

  function load() {
    setLoading(true)
    api.fetchOtherConfig()
      .then((c) => setCfg(c))
      .catch((e) => notify('ko', t('otherconfig.title'), String(e?.message ?? e)))
      .finally(() => setLoading(false))
  }
  useEffect(() => { if (!_cache?.config) load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof OtherConfig>(key: K, value: string) { setCfg((c) => (c ? { ...c, [key]: value } : c)) }
  const bool = (v: string) => v === '1'

  async function save() {
    if (!cfg) return
    setSaving(true)
    try {
      await api.saveOtherConfig(cfg)
      notify('ok', t('otherconfig.title'), t('otherconfig.saved'))
      _cache = null
    } catch (e) {
      notify('ko', t('otherconfig.title'), String((e as Error)?.message ?? e))
    } finally { setSaving(false) }
  }

  // ─── Petits helpers de rendu ────────────────────────────────────────────────
  const Section = ({ icon: Icon, title, children }: { icon: typeof KeyRound; title: string; children: React.ReactNode }) => (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-primary" />{title}</h3>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  )
  const Row = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  )
  const Num = (key: keyof OtherConfig, opts: { w?: string } = {}) => (
    <Input type="number" min={0} value={cfg![key]} disabled={!canEdit}
      onChange={(e) => set(key, e.target.value.replace(/[^\d]/g, ''))}
      className={cn('h-8 text-sm', opts.w ?? 'w-24')} />
  )

  return (
    <div className={cn('flex flex-col gap-6 p-6', effectiveMode === 'iframe' ? 'h-full' : 'flex-1')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold"><Settings2 className="size-5 text-primary" />{t('otherconfig.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('otherconfig.subtitle')}</p>
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
            <Button size="sm" className="gap-1.5" onClick={save} disabled={saving || !cfg}>
              <Save className="size-4" />{saving ? t('otherconfig.saving') : t('common.save')}
            </Button>
          )}
        </div>
      </div>

      {/* Vue Melis classique (iframe) */}
      <MelisClassicFrame melisKey={TOOL_KEY} title="Autres Configurations — Vue Melis"
        visible={effectiveMode === 'iframe'} loaded={iframeLoaded} />

      {/* Vue React */}
      <div className={cn('flex flex-1 flex-col gap-6', effectiveMode === 'react' ? 'flex' : 'hidden')}>
        {!canList ? (
          <p className="text-sm text-muted-foreground">{t('otherconfig.no_list')}</p>
        ) : loading || !cfg ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : (<>
          {/* 1. Verrouillage du compte */}
          <Section icon={ShieldAlert} title={t('otherconfig.lock.title')}>
            <Row label={t('otherconfig.lock.enable')} hint={t('otherconfig.lock.enable_hint')}>
              <Switch checked={bool(cfg.login_account_lock_status)} disabled={!canEdit}
                onChange={(v) => set('login_account_lock_status', v ? '1' : '0')} />
            </Row>
            {bool(cfg.login_account_lock_status) && (<>
              <Row label={t('otherconfig.lock.admin_email')}>
                <Input type="email" value={cfg.login_account_admin_email} disabled={!canEdit}
                  onChange={(e) => set('login_account_admin_email', e.target.value)} className="h-8 w-72 text-sm" />
              </Row>
              <Row label={t('otherconfig.lock.attempts')}>{Num('login_account_lock_number_of_attempts')}</Row>
              <Row label={t('otherconfig.lock.type')}>
                <div className="flex items-center gap-4 text-sm">
                  {['admin', 'timer'].map((v) => (
                    <label key={v} className="flex items-center gap-1.5">
                      <input type="radio" name="lock_type" value={v} checked={cfg.login_account_type_of_lock === v}
                        disabled={!canEdit} onChange={() => set('login_account_type_of_lock', v)} className="accent-primary" />
                      {t(v === 'admin' ? 'otherconfig.lock.type_admin' : 'otherconfig.lock.type_timer')}
                    </label>
                  ))}
                </div>
              </Row>
              {cfg.login_account_type_of_lock === 'timer' && (
                <Row label={t('otherconfig.lock.duration')}>
                  <div className="flex items-center gap-2 text-sm">
                    {Num('login_account_duration_days', { w: 'w-16' })}<span className="text-muted-foreground">{t('otherconfig.unit.days')}</span>
                    {Num('login_account_duration_hours', { w: 'w-16' })}<span className="text-muted-foreground">{t('otherconfig.unit.hours')}</span>
                    {Num('login_account_duration_minutes', { w: 'w-16' })}<span className="text-muted-foreground">{t('otherconfig.unit.minutes')}</span>
                  </div>
                </Row>
              )}
            </>)}
          </Section>

          {/* 2. Durée de validité du mot de passe */}
          <Section icon={Clock} title={t('otherconfig.validity.title')}>
            <Row label={t('otherconfig.validity.enable')} hint={t('otherconfig.validity.enable_hint')}>
              <Switch checked={bool(cfg.password_validity_status)} disabled={!canEdit}
                onChange={(v) => set('password_validity_status', v ? '1' : '0')} />
            </Row>
            {bool(cfg.password_validity_status) && (
              <Row label={t('otherconfig.validity.lifetime')}>
                {Num('password_validity_lifetime')}<span className="text-sm text-muted-foreground">{t('otherconfig.unit.days')}</span>
              </Row>
            )}
          </Section>

          {/* 3. Réutilisation de mot de passe */}
          <Section icon={Repeat} title={t('otherconfig.duplicate.title')}>
            <Row label={t('otherconfig.duplicate.enable')} hint={t('otherconfig.duplicate.enable_hint')}>
              <Switch checked={bool(cfg.password_duplicate_status)} disabled={!canEdit}
                onChange={(v) => set('password_duplicate_status', v ? '1' : '0')} />
            </Row>
            {bool(cfg.password_duplicate_status) && (
              <Row label={t('otherconfig.duplicate.lifetime')}>
                {Num('password_duplicate_lifetime')}<span className="text-sm text-muted-foreground">{t('otherconfig.unit.days')}</span>
              </Row>
            )}
          </Section>

          {/* 4. Complexité du mot de passe */}
          <Section icon={KeyRound} title={t('otherconfig.complexity.title')}>
            <Row label={t('otherconfig.complexity.min_chars')}>{Num('password_complexity_number_of_characters')}</Row>
            {([
              ['password_complexity_use_lower_case', 'otherconfig.complexity.lower'],
              ['password_complexity_use_upper_case', 'otherconfig.complexity.upper'],
              ['password_complexity_use_digit', 'otherconfig.complexity.digit'],
              ['password_complexity_use_special_characters', 'otherconfig.complexity.special'],
            ] as const).map(([key, lbl]) => (
              <Row key={key} label={t(lbl)}>
                <Switch checked={bool(cfg[key])} disabled={!canEdit} onChange={(v) => set(key, v ? '1' : '0')} />
              </Row>
            ))}
          </Section>
        </>)}
      </div>
    </div>
  )
}
