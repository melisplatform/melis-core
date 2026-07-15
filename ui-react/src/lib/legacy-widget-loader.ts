/**
 * Chargeur des assets legacy pour les widgets dashboard rendus en AJAX (sans iframe).
 *
 * Les plugins dashboard sont du code back-office classique : ils supposent jQuery, flot, moment,
 * les globals `translations` / `melisLangId` / `charts` / `activeTabId`, et du CSS Bootstrap+Melis.
 * On injecte donc tout ça dans le shell React — mais de façon contrôlée :
 *
 *  • CSS : une seule feuille, servie par /melis/react-legacy-widget-css, dont TOUTES les règles sont
 *    préfixées `.melis-legacy-widget` côté serveur (LegacyWidgetCssService). Elle ne peut donc pas
 *    repeindre le back-office React. Le wrapper de chaque widget porte cette classe.
 *  • JS : surtout PAS `bundle.js` (= tout le BO : melisCore.js, gridstack, polling de session…). Le
 *    backend renvoie une liste curatée (jQuery + flot + moment) dans `coreJs`.
 *
 * Tout est chargé UNE SEULE FOIS pour la page, quel que soit le nombre de widgets, et les scripts
 * sont chargés SÉQUENTIELLEMENT (flot est un plugin jQuery : il lui faut `$` déjà présent).
 */

/** Id du conteneur racine du dashboard. Les plugins ciblent leur DOM via `$("#"+activeTabId)`. */
export const LEGACY_DASHBOARD_ROOT_ID = 'melis_react_dashboard'

/** Classe portée par le wrapper de chaque widget — c'est le scope du CSS legacy. */
export const LEGACY_WIDGET_CLASS = 'melis-legacy-widget'

export interface LegacyPluginContentPayload {
  success: boolean
  html: string
  callbacks: string[]
  /** Globals du layout legacy (primaryColor, themerPrimaryColor, basePath…), à évaluer AVANT coreJs. */
  globals: string
  coreJs: string[]
  js: string[]
  css: string
}

/** Promesses de chargement, par URL — garantit qu'un asset n'est chargé qu'une fois. */
const loaded = new Map<string, Promise<void>>()

function loadCss(href: string): Promise<void> {
  const existing = loaded.get(href)
  if (existing) return existing

  const p = new Promise<void>((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    // On résout même en cas d'erreur : un widget sans style vaut mieux qu'un widget bloqué.
    link.onload = () => resolve()
    link.onerror = () => resolve()
    document.head.appendChild(link)
  })

  loaded.set(href, p)
  return p
}

function loadScript(src: string): Promise<void> {
  const existing = loaded.get(src)
  if (existing) return existing

  const p = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = false
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Échec du chargement de ${src}`))
    document.head.appendChild(script)
  })

  loaded.set(src, p)
  return p
}

/** Charge des scripts l'un APRÈS l'autre (l'ordre porte les dépendances : jQuery avant flot). */
async function loadScriptsInOrder(srcs: string[]): Promise<void> {
  for (const src of srcs) {
    await loadScript(src)
  }
}

/**
 * Globals que le back-office legacy pose normalement dans son layout et dont les plugins dépendent.
 * `activeTabId` est le plus important : les plugins retrouvent leur conteneur via
 * `$("#" + activeTabId).find(selector)` — s'il est absent, la sélection est VIDE et flot reçoit un
 * conteneur sans dimensions (« createLinearGradient: non-finite value »), donc aucun graphique.
 */
/**
 * Corrections de mise en page du HTML legacy réinjecté dans le cadre React.
 *
 * Le conteneur du plugin (plugin-container.phtml) est prévu pour vivre dans une grille gridstack du
 * BO legacy : la feuille scopée embarque gridstack.css, donc `.grid-stack-item` y est en
 * `position:absolute` — dans notre cadre React ça sort du flux et le widget paraît vide. On le remet
 * en flux normal, et on neutralise le fond/bordure de `.widget` (le cadre, c'est React qui le dessine).
 * L'en-tête legacy, lui, est retiré côté serveur (stripLegacyWidgetHead).
 */
const LAYOUT_FIXES = `
/* Le scoper transforme les règles page-level en règles du wrapper (body → .melis-legacy-widget) :
   le \`body { background: #fff }\` de Bootstrap repeint donc le wrapper en BLANC, y compris en thème
   sombre. C'est le fond de la carte React qui doit se voir → wrapper toujours transparent. */
.${LEGACY_WIDGET_CLASS} {
  background: transparent !important;
}
.${LEGACY_WIDGET_CLASS} .grid-stack-item {
  position: static !important;
  width: auto !important; height: auto !important;
  left: auto !important; top: auto !important;
}
.${LEGACY_WIDGET_CLASS} .grid-stack-item-content {
  position: static !important; overflow: visible !important;
}
.${LEGACY_WIDGET_CLASS} .widget,
.${LEGACY_WIDGET_CLASS} .widget-inverse {
  margin: 0 !important; border: 0 !important;
  background: transparent !important; box-shadow: none !important;
}

/* Le HTML legacy est écrit pour un thème CLAIR : il code en dur des surfaces blanches (.bg-white,
   .widget-body) et des couleurs de texte sombres. En thème studio (sombre), on les remplace par les
   tokens du shell React pour que le contenu du widget suive le thème. Les libellés d'axes et la
   légende de flot portent leur couleur en style INLINE → il faut !important pour la battre. */
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} {
  color: var(--color-foreground);
}
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .bg-white,
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .widget-body,
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .innerAll,
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .panel,
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .tab-content,
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} table {
  background: transparent !important;
  color: var(--color-foreground) !important;
}
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .flot-text,
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .flot-tick-label,
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .legend table,
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .legend .legendLabel {
  color: var(--color-muted-foreground) !important;
  background: transparent !important;
}
/* Liseré clair (inline) du cadre des pastilles de légende. Cibler le cadre EXTÉRIEUR seulement
   (\`> div\`) : la pastille intérieure exprime la couleur de la série via sa PROPRE bordure — la
   repeindre éteindrait les couleurs du graphique. */
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .legend .legendColorBox > div {
  border-color: var(--color-border) !important;
}
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .btn-default {
  background: var(--color-card) !important;
  border-color: var(--color-border) !important;
  color: var(--color-foreground) !important;
}
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .btn-default.focus,
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .btn-check:checked + .btn-default {
  background: var(--color-accent) !important;
  color: var(--color-accent-foreground) !important;
}
[data-theme='studio'] .${LEGACY_WIDGET_CLASS} .separator {
  border-color: var(--color-border) !important;
}
`

function ensureLayoutFixes(): void {
  if (loaded.has('__layout-fixes')) return
  const style = document.createElement('style')
  style.textContent = LAYOUT_FIXES
  document.head.appendChild(style)
  loaded.set('__layout-fixes', Promise.resolve())
}

function ensureGlobals(payload: LegacyPluginContentPayload): void {
  const w = window as unknown as Record<string, unknown>
  w.activeTabId = LEGACY_DASHBOARD_ROOT_ID

  // Les globals du layout legacy (couleurs du thème, chemins). flotcharts.common.js les lit À SON
  // CHARGEMENT pour construire le global `charts` : sans eux il lève « themerPrimaryColor is not
  // defined », `charts` reste indéfini, et les plugins échouent sur `charts.xxx = {…}`.
  // Injectés via une <script> (et non eval) pour que leurs `var` deviennent bien des globals.
  if (payload.globals && !loaded.has('__globals')) {
    const script = document.createElement('script')
    script.textContent = payload.globals
    document.head.appendChild(script)
    loaded.set('__globals', Promise.resolve())
  }
}

/** Le shell est-il en thème sombre ? (ThemeProvider écrit data-theme sur <html>) */
export function isDarkTheme(): boolean {
  return document.documentElement.dataset.theme === 'studio'
}

/**
 * Force flot à dessiner sur un fond TRANSPARENT en thème sombre.
 *
 * Indispensable : le fond du graphique est PEINT DANS LE CANVAS par flot (les plugins codent en dur
 * `grid.backgroundColor = { colors: ["#fff", "#fff"] }`), et aucune règle CSS ne peut repeindre un
 * canvas. On enveloppe donc `$.plot` pour neutraliser ce fond et réaligner grille et bordures sur
 * les tokens du shell — le fond de la carte React transparaît alors sous le graphique.
 */
function patchFlotForTheme(): void {
  const w = window as unknown as { $?: { plot?: unknown } }
  const jq = w.$
  if (!jq?.plot || loaded.has('__flot-theme')) return

  const original = jq.plot as ((...args: unknown[]) => unknown) & Record<string, unknown>

  const patched = function (this: unknown, placeholder: unknown, data: unknown, options: unknown) {
    let opts = options
    if (isDarkTheme() && opts && typeof opts === 'object') {
      const css = getComputedStyle(document.documentElement)
      const border = css.getPropertyValue('--color-border').trim() || '#3f3f46'
      const o = opts as Record<string, unknown>
      const grid = (o.grid ?? {}) as Record<string, unknown>
      opts = {
        ...o,
        grid: {
          ...grid,
          backgroundColor: null, // ← le fond blanc peint dans le canvas
          color: border,
          borderColor: 'transparent',
          tickColor: border,
        },
      }
    }
    return original.call(this, placeholder, data, opts)
  } as unknown as Record<string, unknown>

  // flot accroche des propriétés sur $.plot (notamment $.plot.plugins) — les conserver.
  Object.assign(patched, original)
  ;(w.$ as Record<string, unknown>).plot = patched

  loaded.set('__flot-theme', Promise.resolve())
}

/** Charge (une fois) les assets communs. Les globals PRÉCÈDENT les scripts qui les lisent. */
export async function ensureLegacyAssets(payload: LegacyPluginContentPayload): Promise<void> {
  ensureGlobals(payload)

  // Le CSS part en parallèle (il ne bloque pas l'exécution du JS).
  void loadCss(payload.css)
  ensureLayoutFixes()

  // coreJs commence par /melis/get-translations, qui définit `translations` et `melisLangId` —
  // les plugins s'en servent pour leurs libellés et formats de date.
  await loadScriptsInOrder(payload.coreJs)

  // $.plot n'existe qu'une fois flot chargé → patcher ICI, avant tout appel des plugins.
  patchFlotForTheme()
}

/**
 * Charge les scripts propres au plugin.
 *
 * ⚠️ À appeler APRÈS injection du HTML : le JS d'un plugin s'initialise dans un `$(function(){…})`
 * qui, le DOM étant déjà prêt, s'exécute IMMÉDIATEMENT au chargement du fichier. Or plusieurs
 * plugins y scannent le DOM (`$body.find(".…-placeholder").each(…)`) pour s'accrocher à leurs
 * conteneurs. Chargés avant l'injection, ils ne trouvent rien et le widget reste inerte.
 */
export function loadPluginScripts(payload: LegacyPluginContentPayload): Promise<void> {
  return loadScriptsInOrder(payload.js)
}

/** Exécute les jsCallbacks du plugin (ce qui démarre réellement graphiques et interactions). */
export function runCallbacks(callbacks: string[]): void {
  for (const cb of callbacks) {
    try {
      // Les callbacks sont des expressions JS venues de la config Melis
      // (ex. `commerceDashboardPluginSalesRevenue.loadChart()`), pas des données utilisateur.
      new Function(cb)()
    } catch (e) {
      console.warn(`[melis] jsCallback en échec: ${cb}`, e)
    }
  }
}

/** Récupère le contenu d'un plugin dashboard (HTML + assets + callbacks). */
export async function fetchPluginContent(pluginName: string): Promise<LegacyPluginContentPayload> {
  const res = await fetch(
    `/melis/react-dashboard-plugin-content?plugin=${encodeURIComponent(pluginName)}`,
    { headers: { 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'include' },
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = (await res.json()) as LegacyPluginContentPayload
  if (!data.success) throw new Error('Réponse invalide')

  return data
}
