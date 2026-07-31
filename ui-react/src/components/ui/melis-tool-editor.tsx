/**
 * MelisToolEditor — éditeur WYSIWYG basé sur le TinyMCE **autonome** de melis-core
 * (`/MelisCore/js/library/tinymce/tinymce.min.js`, TinyMCE 6.7 complet avec ses propres
 * plugins/themes/models/skins) configuré avec la configuration **'tool'** de melis-core
 * (`public/js/tinyMCE/tool.php`, servie par `/melis/MelisCore/MelisTinyMce/preloadTinyMceConfig`).
 *
 * On ne charge QUE tinymce.min.js (+ le mini tinymce_cleaner.js, autonome) — PAS bundle.js, PAS
 * jQuery, PAS melis_tinymce.js : la pile legacy entière n'est pas nécessaire et ses
 * auto-initialiseurs (gridstack…) polluent le shell.
 *
 * La config 'tool' est conservée FIDÈLEMENT (plugins, minitemplate, font sizes…). On ne remplace
 * que les callbacks qui vivent dans melis_tinymce.js (couplés jQuery/moxiemanager) :
 *   - `setup` ('melisTinyMCE.tinyMceActionEvent') → notre setup (sync onChange) ;
 *   - `file_picker_callback` ('filePickerCallback') → picker base64 vanilla ;
 *   - `init_instance_callback` ('tinyMceCleaner') → résolu via tinymce_cleaner.js (autonome).
 * Seul le bouton `insertfile` (media library moxiemanager) est retiré de la barre — il exige le
 * gestionnaire de médias legacy, absent du shell.
 */
import { useEffect, useId, useRef } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window { tinymce?: any; tinyMceCleaner?: (editor: any) => void; __melisTinyMceMobile?: boolean }
}

const TINYMCE_SRC = '/MelisCore/js/library/tinymce/tinymce.min.js'
// Patch responsive mobile global (wrappe tinymce.init) — normalement déjà chargé par
// index.html ; rechargé ici par sécurité pour les hôtes qui ne servent pas ce shell.
// Idempotent (garde `window.__melisTinyMceMobile`) et DOIT précéder tinymce.min.js.
const TINYMCE_MOBILE_SRC = '/MelisCore/js/tinyMCE/melis_tinymce_mobile.js'
const TINYMCE_CLEANER_SRC = '/MelisCore/js/tinyMCE/tinymce_cleaner.js' // définit le global tinyMceCleaner (autonome)
const TINYMCE_CSS = '/MelisCore/css/melis_tinymce.css'                 // styles UI Melis (minitemplate…)
const TINYMCE_BASE = '/MelisCore/js/library/tinymce' // skins/plugins/themes/models y résident (v6.7)
const CONFIG_URL = '/melis/MelisCore/MelisTinyMce/preloadTinyMceConfig'

// ─── Chargement paresseux (singleton) : tinymce.min.js + config 'tool' ──────────
let _ready: Promise<boolean> | null = null
let _toolConfig: any = null

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-melis-src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.async = false
    s.dataset.melisSrc = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`MelisToolEditor: échec de chargement ${src}`))
    document.head.appendChild(s)
  })
}

function loadCssOnce(href: string): void {
  if (document.querySelector(`link[data-melis-css="${href}"]`)) return
  const l = document.createElement('link')
  l.rel = 'stylesheet'; l.href = href; l.dataset.melisCss = href
  document.head.appendChild(l)
}

function ensureToolEditor(): Promise<boolean> {
  if (_ready) return _ready
  _ready = (async () => {
    try {
      loadCssOnce(TINYMCE_CSS)
      if (!window.__melisTinyMceMobile) await loadScript(TINYMCE_MOBILE_SRC).catch(() => {})
      await loadScript(TINYMCE_SRC)
      await loadScript(TINYMCE_CLEANER_SRC).catch(() => {}) // tinyMceCleaner (optionnel)
      // attendre le global tinymce
      const t0 = Date.now()
      while (!window.tinymce && Date.now() - t0 < 8000) { await new Promise((r) => setTimeout(r, 60)) }
      if (!window.tinymce) return false
      // config 'tool' (source de vérité = tool.php côté melis-core)
      const res = await fetch(CONFIG_URL, { headers: { 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'include' })
      const data = await res.json()
      _toolConfig = data?.tool ?? null
      return !!_toolConfig
    } catch {
      return false
    }
  })()
  return _ready
}

/** Sélecteur de fichier image → base64 inline (équivalent du filePickerCallback de melis_tinymce). */
function filePickerBase64(cb: (url: string, meta?: any) => void): void {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const editor = window.tinymce?.activeEditor
        const blobCache = editor?.editorUpload?.blobCache
        const base64 = String(reader.result).split(',')[1]
        const blobInfo = blobCache.create('blobid' + Date.now(), file, base64)
        blobCache.add(blobInfo)
        cb(blobInfo.blobUri(), { title: file.name })
      } catch { /* ignore */ }
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

interface MelisToolEditorProps {
  value: string
  onChange: (html: string) => void
  readOnly?: boolean
  locale?: string
  minHeight?: number
}

export function MelisToolEditor({ value, onChange, readOnly, minHeight = 280 }: MelisToolEditorProps) {
  const rawId = useId().replace(/[:]/g, '')
  const id = `mce-tool-${rawId}`
  const onChangeRef = useRef(onChange); onChangeRef.current = onChange
  const valueRef = useRef(value); valueRef.current = value

  useEffect(() => {
    let disposed = false
    ensureToolEditor().then((ok) => {
      if (disposed || !ok || !window.tinymce || !_toolConfig) return

      // Config 'tool' conservée FIDÈLEMENT — on ne touche QUE ce qui dépend du legacy.
      const cfg: any = { ...JSON.parse(JSON.stringify(_toolConfig)), selector: `#${id}`, base_url: TINYMCE_BASE }
      delete cfg.mode
      // init_instance_callback ('tinyMceCleaner') : résolu via le global chargé (tinymce_cleaner.js).
      cfg.init_instance_callback = typeof window.tinyMceCleaner === 'function' ? window.tinyMceCleaner : undefined
      if (typeof cfg.toolbar === 'string') {
        // Seul `insertfile` (media library moxiemanager) exige le legacy → on le retire. On GARDE
        // minitemplate (plugin autonome) et tout le reste de la barre 'tool'.
        cfg.toolbar = cfg.toolbar.replace(/\binsertfile\b/g, '').replace(/\s{2,}/g, ' ').replace(/\|\s*\|/g, '|').replace(/^\s*\|\s*/, '').trim()
      }
      if (readOnly) cfg.readonly = true
      cfg.min_height = minHeight
      cfg.file_picker_callback = (cb: any) => filePickerBase64(cb)
      cfg.setup = (editor: any) => {
        editor.on('init', () => { try { editor.setContent(valueRef.current || '') } catch { /* ignore */ } })
        const push = () => { try { onChangeRef.current(editor.getContent()) } catch { /* ignore */ } }
        editor.on('change keyup input undo redo SetContent', push)
        editor.on('blur', push)
      }

      try { window.tinymce.remove(`#${id}`) } catch { /* ignore */ }
      window.tinymce.init(cfg)
    })

    return () => {
      disposed = true
      try {
        const ed = window.tinymce?.get(id)
        if (ed) { try { onChangeRef.current(ed.getContent()) } catch { /* ignore */ } ed.remove() }
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <textarea
      id={id}
      defaultValue={value}
      readOnly={readOnly}
      // Fallback visible tant que TinyMCE n'a pas pris la main (ou s'il échoue).
      className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
      style={{ minHeight }}
    />
  )
}
