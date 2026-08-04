/**
 * Propage le patch responsive TinyMCE (`melis_tinymce_mobile.js`) dans TOUTES les iframes
 * même origine du shell — sans toucher au moindre fichier legacy.
 *
 * Pourquoi c'est nécessaire : un `<script>` ne vaut que pour SON document. Le shell React charge
 * le patch pour lui-même (index.html), mais les éditeurs TinyMCE les plus visibles vivent
 * ailleurs :
 *   - **édition de page** : la page du site rendue en mode édition, dans une iframe imbriquée
 *     (`iframe.melis-iframe`) DANS l'iframe tool-page → édition inline (`html.php`) ;
 *   - **outils legacy** (pool d'iframes, bascule « Old ») : TinyMCE vient de leur bundle.js.
 * Chacun a son propre `window`, donc son propre global `tinymce` : le patch du shell ne les
 * atteint pas. On l'injecte donc dans chaque document, à la volée.
 *
 * Pourquoi ça arrive à temps : `melis_tinymce.js::createTinyMCE()` diffère son `tinyMCE.init()`
 * d'un `setTimeout(…, 1000)`. Un balayage à 500 ms tombe donc largement avant l'init, même quand
 * l'iframe est déjà chargée. Et si on arrivait quand même après, le patch reste inoffensif :
 * il enveloppe `init` pour les éditeurs suivants.
 *
 * Coût : un `querySelectorAll('iframe')` récursif toutes les 500 ms. L'injection est idempotente
 * (marqueur sur `<html>` + garde `__melisTinyMceMobile` dans le script lui-même), et un document
 * sans TinyMCE ne fait qu'héberger un script inerte.
 */

const PATCH_SRC = '/MelisCore/js/tinyMCE/melis_tinymce_mobile.js'
const MARK = 'melisTinymceMobile'
const SCAN_MS = 500

/** Injecte le patch dans un document même origine (idempotent). */
function injectInto(doc: Document): void {
  const root = doc.documentElement
  if (!root || root.dataset[MARK]) return
  // `about:blank` : pas encore le vrai document, on repassera au prochain balayage.
  if (!doc.head && !doc.body) return
  root.dataset[MARK] = '1'
  const s = doc.createElement('script')
  s.src = PATCH_SRC
  s.async = false
  ;(doc.head || doc.body).appendChild(s)
}

/** Parcourt récursivement les iframes accessibles (même origine) à partir d'un document. */
function walk(doc: Document, depth: number): void {
  if (depth > 4) return // édition de page = 2 niveaux ; garde-fou contre une récursion pathologique
  let frames: HTMLIFrameElement[]
  try { frames = Array.from(doc.querySelectorAll('iframe')) } catch { return }
  for (const f of frames) {
    let d: Document | null = null
    try { d = f.contentDocument } catch { continue } // cross-origin → inaccessible, on ignore
    if (!d) continue
    injectInto(d)
    walk(d, depth + 1)
  }
}

let timer: number | null = null

/** Démarre le balayage (appelé une fois par le Shell). Idempotent. */
export function startTinyMceMobileFrameSync(): void {
  if (timer !== null) return
  const tick = () => { try { walk(document, 0) } catch { /* jamais bloquer le shell */ } }
  tick()
  timer = window.setInterval(tick, SCAN_MS)
}
