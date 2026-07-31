/**
 * melis_tinymce_mobile.js — responsive mobile tuning for EVERY TinyMCE instance of the
 * React back-office, applied globally and automatically.
 *
 * Why a global patch instead of per-editor props: TinyMCE wrappers are duplicated across
 * modules (melis-core, melis-cms-news, melis-commerce, melis-cms, melis-ai-*, …). They all
 * end up calling `window.tinymce.init(cfg)` on the SAME singleton, so wrapping `init` once
 * at the window level makes every existing and future field responsive with zero change in
 * the modules' bricks.
 *
 * What it does (https://www.tiny.cloud/docs/tinymce/latest/tinymce-for-mobile/):
 *  1. `cfg.mobile` — TinyMCE's own device-detected mobile mode already hides the menubar and
 *     switches to a scrolling toolbar; we additionally TRIM the toolbar (the Melis 'tool'
 *     config ships ~14 groups, unusable on a phone even when scrolling).
 *  2. Narrow WINDOW (< 640px, the `useIsNarrow()` breakpoint of the React UI). TinyMCE's
 *     mobile mode is DEVICE-detected, not width-detected: a desktop browser resized narrow
 *     keeps the full menubar and stacks the 14 toolbar groups into a tall multi-row block
 *     above the editor. We apply the same overrides at the top level.
 *  3. Re-inits open editors when the viewport crosses the breakpoint (window resize /
 *     device rotation), preserving their content.
 *
 * Everything is a no-op on a wide viewport: the config object is only cloned/altered when
 * `window.innerWidth < 640`, so desktop rendering is bit-for-bit unchanged.
 */
;(function () {
  if (window.__melisTinyMceMobile) return
  window.__melisTinyMceMobile = true

  var BP = 640 // must stay in sync with useIsNarrow()'s default breakpoint

  // Toolbar buttons worth keeping on a small screen, in no particular order — the original
  // ORDER of the config's toolbar is preserved, we only filter it.
  var KEEP = {
    undo: 1, redo: 1, blocks: 1, bold: 1, italic: 1, underline: 1, strikethrough: 1,
    bullist: 1, numlist: 1, link: 1, unlink: 1, image: 1, forecolor: 1, removeformat: 1,
    minitemplate: 1, code: 1, fullscreen: 1
  }

  // Boutons candidats à la RANGÉE visible, par ordre de priorité. Combien en tiennent vraiment
  // est MESURÉ (fitCount) : si le 1ᵉʳ groupe dépasse, TOUT bascule dans le popup et la rangée
  // n'affiche plus que « … ».
  var PRIMARY = ['undo', 'redo', 'bold', 'italic', 'underline', 'bullist', 'link']
  // Un bouton fait 34px, mais le calcul de débordement de TinyMCE est plus gourmand que la
  // simple somme des largeurs : mesuré sur un éditeur de 296px, 5 boutons passent, 6 font
  // basculer TOUTE la rangée dans le popup (« … » seul). D'où la marge (45px/bouton).
  var BTN_W = 45
  var OVERHEAD = 50 // bouton « … » + rembourrage de la barre

  /** Combien de boutons tiennent dans la largeur de la cible — volontairement prudent. */
  function fitCount(selector) {
    var w = 0
    try { var el = document.querySelector(selector); w = el ? el.clientWidth || el.offsetWidth : 0 } catch (e) { w = 0 }
    if (!w) w = window.innerWidth - 48 // la cible n'est pas encore mesurable : approximation
    var n = Math.floor((w - OVERHEAD) / BTN_W)
    return Math.max(2, Math.min(PRIMARY.length, n))
  }

  function isNarrow() { return window.innerWidth < BP }

  /** Every button of the original toolbar (any shape), flattened, order preserved. */
  function flattenButtons(toolbar) {
    var src = []
    if (typeof toolbar === 'string') src = [toolbar]
    else if (Object.prototype.toString.call(toolbar) === '[object Array]') {
      for (var i = 0; i < toolbar.length; i++) {
        var row = toolbar[i]
        if (typeof row === 'string') src.push(row)
        else if (row && typeof row.items === 'string') src.push(row.items)
      }
    } else return null
    return src.join(' | ').split(/[|\s]+/).filter(function (b) { return !!b })
  }

  /**
   * Rebuild the toolbar as EXACTLY TWO groups: the essentials that must stay visible, then
   * everything else. TinyMCE breaks at a group boundary, so this grouping is what decides the
   * layout — one filled row + a visible « … » button opening the rest.
   */
  function trimToolbar(toolbar, selector) {
    var all = flattenButtons(toolbar)
    if (!all) return toolbar
    var present = {}
    for (var i = 0; i < all.length; i++) if (KEEP[all[i]]) present[all[i]] = 1

    var primary = PRIMARY.filter(function (b) { return present[b] }).slice(0, fitCount(selector))
    var rest = all.filter(function (b, idx) {
      return present[b] && primary.indexOf(b) === -1 && all.indexOf(b) === idx // dédoublonne
    })
    if (!primary.length && !rest.length) return toolbar
    return primary.join(' ') + (rest.length ? ' | ' + rest.join(' ') : '')
  }

  /**
   * Overrides applied to `cfg.mobile` (device mode) and, when the window is narrow, to `cfg`.
   *
   * `toolbar_mode: 'sliding'` plutôt que le 'scrolling' par défaut de la doc : le débordement
   * est atteint par un bouton « … » VISIBLE (et un panneau où la largeur ne compte plus, donc
   * les listes déroulantes `blocks`/`fontsize` y restent utilisables), là où 'scrolling' cache
   * la suite derrière un défilement horizontal sans affordance — inatteignable à la souris.
   */
  function mobileOverrides(cfg) {
    var o = {
      menubar: false,
      toolbar_mode: 'sliding',
      toolbar_sticky: false,
      elementpath: false, // the element path overflows a narrow status bar
      resize: false,
      object_resizing: false
    }
    var toolbar = trimToolbar(cfg.toolbar, cfg.selector)
    if (toolbar) o.toolbar = toolbar
    return o
  }

  /**
   * Returns the config to hand over to TinyMCE. `cfg.mobile` is always enriched (real
   * devices); the top level only when the window itself is narrow.
   */
  function adapt(cfg) {
    if (!cfg || typeof cfg !== 'object') return cfg
    var overrides = mobileOverrides(cfg)

    // 1. real mobile devices — merge into the caller's own `mobile` block (it wins).
    var out = shallowClone(cfg)
    out.mobile = merge(overrides, out.mobile)

    // 2. narrow window on any device.
    if (isNarrow()) out = merge(out, overrides)
    return out
  }

  function shallowClone(o) { var c = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) c[k] = o[k]; return c }
  function merge(base, over) { var c = shallowClone(base); for (var k in over) if (Object.prototype.hasOwnProperty.call(over, k)) c[k] = over[k]; return c }

  // ─── init() wrapping ────────────────────────────────────────────────────────
  // Every config passed through init() is remembered so we can re-init on a breakpoint
  // crossing with the ORIGINAL (untrimmed) config.
  var lastConfigs = []

  function remember(cfg) {
    for (var i = 0; i < lastConfigs.length; i++) {
      if (lastConfigs[i].selector && lastConfigs[i].selector === cfg.selector) { lastConfigs[i] = cfg; return }
    }
    lastConfigs.push(cfg)
  }

  function wrapInit(tinymce) {
    if (!tinymce || typeof tinymce.init !== 'function' || tinymce.__melisMobileWrapped) return
    var origInit = tinymce.init.bind(tinymce)
    tinymce.init = function (cfg) {
      try { remember(cfg); return origInit(adapt(cfg)) } catch (e) { return origInit(cfg) }
    }
    tinymce.__melisMobileWrapped = true
  }

  // Install the wrapper the moment TinyMCE assigns its global — race-free, whichever module
  // loads tinymce.min.js first.
  if (window.tinymce) {
    wrapInit(window.tinymce)
  } else {
    var stored
    try {
      Object.defineProperty(window, 'tinymce', {
        configurable: true,
        get: function () { return stored },
        set: function (v) { stored = v; wrapInit(v) }
      })
    } catch (e) { /* a stricter host: fall back to the resize hook only */ }
  }

  // ─── Re-init on breakpoint crossing ─────────────────────────────────────────
  var wasNarrow = isNarrow()
  var timer = null

  function reinitAll() {
    var tinymce = window.tinymce
    if (!tinymce || !tinymce.editors) return
    // Snapshot: remove() mutates tinymce.editors while we iterate.
    var editors = [].slice.call(tinymce.editors)
    for (var i = 0; i < editors.length; i++) {
      (function (ed) {
        var cfg = null
        for (var j = 0; j < lastConfigs.length; j++) {
          if (lastConfigs[j].selector === '#' + ed.id) { cfg = lastConfigs[j]; break }
        }
        if (!cfg) return // not one of ours (no remembered config) — leave it alone
        var content
        try { content = ed.getContent() } catch (e) { return }
        try { ed.remove() } catch (e) { return }
        if (!document.getElementById(ed.id)) return // target gone (unmounted meanwhile)
        var next = shallowClone(cfg)
        var prevCb = cfg.init_instance_callback
        next.init_instance_callback = function (editor) {
          if (typeof prevCb === 'function') { try { prevCb(editor) } catch (e) { /* ignore */ } }
          try { editor.setContent(content || '') } catch (e) { /* ignore */ }
        }
        try { window.tinymce.init(next) } catch (e) { /* ignore */ }
      })(editors[i])
    }
  }

  window.addEventListener('resize', function () {
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      var narrow = isNarrow()
      if (narrow === wasNarrow) return
      wasNarrow = narrow
      reinitAll()
    }, 250)
  })
})()
