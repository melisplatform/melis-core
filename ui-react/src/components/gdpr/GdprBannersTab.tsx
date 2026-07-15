import { useEffect, useState } from 'react'
import { Megaphone, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import * as gdprApi from '@/lib/gdpr-api'
import type { BannerMeta, BannerText, LangOption } from '@/lib/gdpr-api'
import { useI18n } from '@/i18n/i18n-context'
import { useCan } from '@/lib/capabilities'
import { GDPR_TOOL_KEY, gdprNotify } from './gdpr-shared'

export default function GdprBannersTab() {
  const { t } = useI18n()
  const canEdit = useCan(GDPR_TOOL_KEY, 'edit')

  const [meta, setMeta] = useState<BannerMeta | null>(null)
  const [siteId, setSiteId] = useState(0)
  const [texts, setTexts] = useState<Record<string, BannerText>>({})
  const [activeLang, setActiveLang] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    gdprApi.fetchBannerMeta().then((m) => {
      setMeta(m)
      if (m.langs.length) setActiveLang(m.langs[0].id)
    }).catch((e) => gdprNotify('ko', t('gdpr.banner.title'), String(e?.message ?? e)))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function loadBanner(sid: number) {
    if (!sid) { setTexts({}); return }
    setLoading(true)
    gdprApi.fetchBanner(sid)
      .then(setTexts)
      .catch((e) => gdprNotify('ko', t('gdpr.banner.title'), String(e?.message ?? e)))
      .finally(() => setLoading(false))
  }

  function onSiteChange(sid: number) { setSiteId(sid); loadBanner(sid) }

  function setLangValue(langId: number, value: string) {
    setTexts((prev) => ({ ...prev, [String(langId)]: { id: prev[String(langId)]?.id ?? 0, value } }))
  }

  async function save() {
    if (!siteId) { gdprNotify('ko', t('gdpr.banner.title'), t('gdpr.banner.no_site')); return }
    setSaving(true)
    try {
      await gdprApi.saveBanner(siteId, texts)
      gdprNotify('ok', t('gdpr.banner.title'), t('gdpr.banner.saved'))
      loadBanner(siteId)
    } catch (e) { gdprNotify('ko', t('gdpr.banner.title'), String((e as Error)?.message ?? e)) }
    finally { setSaving(false) }
  }

  if (!meta) return <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t('common.loading')}</div>
  if (!meta.available || meta.sites.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('gdpr.banner.unavailable')}</p>
  }

  const langs: LangOption[] = meta.langs

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold"><Megaphone className="size-4 text-primary" />{t('gdpr.banner.title')}</div>
        <p className="mt-1 text-xs text-muted-foreground">{t('gdpr.banner.subtitle')}</p>
        <div className="mt-3 max-w-sm">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.banner.site')}</label>
          <select value={siteId} onChange={(e) => onSiteChange(Number(e.target.value))}
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
            <option value={0}>{t('gdpr.banner.choose_site')}</option>
            {meta.sites.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {siteId > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          {/* Onglets de langue */}
          <div className="mb-3 flex flex-wrap gap-1 border-b border-border">
            {langs.map((l) => (
              <button key={l.id} type="button" onClick={() => setActiveLang(l.id)}
                className={`-mb-px border-b-2 px-3 py-1.5 text-sm font-medium transition-colors ${activeLang === l.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {l.name}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">{t('common.loading')}</div>
          ) : (
            langs.map((l) => (
              <div key={l.id} className={activeLang === l.id ? 'block' : 'hidden'}>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('gdpr.banner.content')}</label>
                <textarea
                  value={texts[String(l.id)]?.value ?? ''}
                  onChange={(e) => setLangValue(l.id, e.target.value)}
                  disabled={!canEdit}
                  rows={10}
                  placeholder={t('gdpr.banner.content_placeholder')}
                  className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm"
                />
              </div>
            ))
          )}
          {canEdit && (
            <div className="mt-4 flex justify-end">
              <Button size="sm" className="gap-1.5" onClick={save} disabled={saving}><Save className="size-4" />{saving ? t('gdpr.smtp.saving') : t('common.save')}</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
