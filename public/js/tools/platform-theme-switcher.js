/**  
 * Theme Switcher Module using jQuery Modular Pattern
 * Included UI styles: flat, rounded as its almost the same implementation
 */
var themeSwitcher = (function($) {
    'use strict';

    // private variables
    var currentTheme            = 'default',
        storageKey              = 'preferred-theme',
        $html                   = $('html'),
        $defaultTheme           = $('#default-theme'), // light = system colors, default
        $darkTheme              = $('#dark-theme'),
        $rounded                = $('#rounded'),
        currentUiStyle          = 'flat',
        uiStorageKey            = 'preferred-ui-style',
        themeControlsObserver   = null,
        themeControlsPollId     = null,
        isInitialized           = false;

        // private methods
        function init() {
            if (isInitialized) return;
            isInitialized = true;

            loadSavedTheme(); // theme
            loadSavedUiStyle(); // ui style
            setupEventListeners();
            ensureThemeControlsState();
            watchThemeControls();
            
            startIframeStartupSync();
        }

        function loadSavedTheme() {
            var savedTheme = localStorage.getItem(storageKey);
                if (savedTheme) {
                    setTheme(savedTheme);
                } else {
                    // default to light theme if no saved preference
                    setTheme('default');
                }
        }

        function setupEventListeners() {
            // ui style handler
            $(document).on('click', '#ui-style .theme-option', function(e) {
                e.preventDefault();

                var style = $(this).data("style");
                    setUiStyle(style);
                    saveUiStyle(style);
            });

            // keep page-edition iframe in sync with selected theme
            bindPageEditionIframeLoadListeners();

            // page opener trigger from nav menu
            $(document).on("click", "#melis-id-nav-bar-tabs [data-tool-meliskey='meliscms_page'] .tab-element", function () {
                // bind the load listeners to the page edition iframes
                bindPageEditionIframeLoadListeners();
            });

            // tabs are created/updated dynamically; only rebind on page-edition related tabs
            $(document).on("shown.bs.tab", "a[data-bs-toggle='tab']", function (e) {
                var $tab = $(e.target),
                    targetSelector = $tab.attr("href"),
                    isPageTabTrigger = $tab.closest("[data-tool-meliskey='meliscms_page']").length > 0,
                    isPageTabPane = false;

                    if (targetSelector && targetSelector.charAt(0) === "#") {
                        var $targetPane = $(targetSelector);
                        isPageTabPane =
                            $targetPane.is('[data-meliskey="meliscms_page"]') ||
                            $targetPane.find('[data-meliskey="meliscms_page"], .meliscms-page-tab-edition, .melis-iframe').length > 0;
                    }

                    if (!isPageTabTrigger && !isPageTabPane) {
                        return;
                    }

                    // bind the load listeners to the page edition iframes
                    bindPageEditionIframeLoadListeners();
            });
        }

        // start ui style
        function loadSavedUiStyle() {
            var savedStyle = localStorage.getItem(uiStorageKey);
                if (savedStyle === 'rounded' || savedStyle === 'flat') {
                    setUiStyle(savedStyle);
                } else {
                    setUiStyle('flat');
                }
        }

        function setUiStyle(style) {
            style = (style || '').toString().toLowerCase();
            if (['flat', 'rounded'].indexOf(style) === -1) {
                console.warn('Invalid UI style:', style);
                return;
            }
        
            currentUiStyle = style;
            applyUiStyle(style);
            updateUiStyleUI();
        }
        
        function saveUiStyle(style) {
            localStorage.setItem(uiStorageKey, style);
        }
        
        function applyUiStyle(style) {
            style = (style || currentUiStyle || 'flat').toString().toLowerCase();

            // keep <html> in sync
            $html.attr('data-style', style);

            // target the back-office UI elements you want styled
            /* var $targets = $(
                '.widget, .panel, .card, .modal-content, .sidebar, .dropdown-menu, .table,' +
                '.panel-heading, .panel-body, .card-header, .card-body, .form-control, .input-group-text,' +
                '.btn, .list-group-item, .well, .nav-link, .dropdown-item, .modal-header, .modal-body, .modal-footer,' +
                'input:not(.theme-radio), select, textarea'
            );
        
            if (style === 'rounded') {
                $targets.removeClass('flat').addClass('rounded');
            } else {
                $targets.removeClass('rounded').addClass('flat');
            } */

            // apply the ui style to the page edition iframe
            applyUiStyleToPageEditionIframe(style);
        }
        
        function updateUiStyleUI() {
            var $options = $('#ui-style .theme-option');
                $options.removeClass('active');
                $options.filter('[data-style="' + currentUiStyle + '"]').addClass('active');
        }
        // end ui style

        function setTheme(theme) {
            // normalize
            theme = (theme || '').toString().trim();
            
            // validate theme
            if (['default', 'dark'].indexOf(theme) === -1) {
                console.warn('Invalid theme:', theme);
                return;
            }
            
            currentTheme = theme;
            applyTheme(theme);
            updateUI();
        }

        function applyTheme(theme) {
            // remove existing theme attributes
            $html.removeAttr('data-bs-theme');
            
            // set data-theme attribute for your custom CSS
            $html.attr('data-theme', theme);
            
            // enable/disable CSS files based on theme
            if (theme === 'dark') {
                $defaultTheme.prop('disabled', true);
                $darkTheme.prop('disabled', false);
            } else {
                // default stylesheet as base
                $defaultTheme.prop('disabled', false); // default
                $darkTheme.prop('disabled', true);
            }

            applyThemeToPageEditionIframe(theme);
            
            // trigger custom event for other components
            $(document).trigger('themeChanged', [theme]);
        }

        // apply the theme to the page edition iframe
        function applyThemeToPageEditionIframe(theme, iframeEl) {
            var $iframes = getPageEditionIframes(iframeEl);
                if (!$iframes.length) {
                    return;
                }
                //console.log('applyThemeToPageEditionIframe() $iframes: ', $iframes);
                $iframes.each(function() {
                    var iframe = this,
                        iframeDoc = iframe && iframe.contentDocument;
                        //console.log('applyThemeToPageEditionIframe() iframeDoc: ', iframeDoc);
                        if (!iframeDoc) {
                            return;
                        }

                        try {
                            ensureThemeStylesheetsInIframe(iframeDoc);

                            var $iframeDefaultTheme = $(iframeDoc).find('#default-theme'),
                                $iframeDarkTheme = $(iframeDoc).find('#dark-theme'),
                                $iframeHtml = $(iframeDoc.documentElement),
                                $iframeBody = $(iframeDoc.body);

                                $iframeHtml.removeAttr('data-bs-theme').attr('data-theme', theme);
                                $iframeBody.attr('data-theme', theme);

                                if (theme === 'dark') {
                                    $iframeDefaultTheme.prop('disabled', true);
                                    $iframeDarkTheme.prop('disabled', false);
                                } else {
                                    $iframeDefaultTheme.prop('disabled', false);
                                    $iframeDarkTheme.prop('disabled', true);
                                }

                                $(iframeDoc).trigger('themeChanged', [theme]);
                        } catch (e) {
                            // ignore cross-origin or not-ready iframe documents
                        }
                });
        }

        // apply the ui style to the page edition iframe
        function applyUiStyleToPageEditionIframe(style, iframeEl) {
            var uiStyle = (style || currentUiStyle || 'flat').toString().toLowerCase(),
                $iframes = getPageEditionIframes(iframeEl);
                if (!$iframes.length) {
                    return;
                }

                $iframes.each(function() {
                    var iframe = this,
                        iframeDoc = iframe && iframe.contentDocument;
                        if (!iframeDoc) {
                            return;
                        }

                        try {
                            var $iframeHtml = $(iframeDoc.documentElement);
                                /* $targets = $(iframeDoc).find(
                                    '.widget, .panel, .card, .modal-content, .sidebar, .dropdown-menu, .table,' +
                                    '.panel-heading, .panel-body, .card-header, .card-body, .form-control, .input-group-text,' +
                                    '.btn, .list-group-item, .well, .nav-link, .dropdown-item, .modal-header, .modal-body, .modal-footer,' +
                                    'input:not(.theme-radio), select, textarea,' +
                                    '.melis-dragdrop-zone, .melis-dragdrop-box, .melis-draggable-item, .ui-sortable, .ui-sortable-handle'
                                ); */

                                $iframeHtml.attr('data-style', uiStyle);

                                /* if (uiStyle === 'rounded') {
                                    $targets.removeClass('flat').addClass('rounded');
                                } else {
                                    $targets.removeClass('rounded').addClass('flat');
                                } */
                        } catch (e) {
                            // ignore cross-origin or not-ready iframe documents
                        }
                });
        }

        // bind the load listeners to the page edition iframes
        function bindPageEditionIframeLoadListeners() {
            var $iframes = getPageEditionIframes();
                if (!$iframes.length) {
                    return;
                }
                //console.log('bindPageEditionIframeLoadListeners() $iframes: ', $iframes);
                $iframes.each(function() {
                    var iframe = this;
                        $(iframe)
                            .off('load.themeSwitcher')
                            .on('load.themeSwitcher', function() {
                                applyThemeToPageEditionIframe(currentTheme, this);
                                applyUiStyleToPageEditionIframe(currentUiStyle, this);
                            });

                        // If iframe is already loaded before binding, sync immediately.
                        try {
                            var iframeDoc = iframe.contentDocument;
                                if (iframeDoc && iframeDoc.documentElement) {
                                    applyThemeToPageEditionIframe(currentTheme, iframe);
                                    applyUiStyleToPageEditionIframe(currentUiStyle, iframe);
                                }
                        } catch (e) {
                            // ignore cross-origin or not-ready iframe documents
                        }

                        scheduleIframeSyncRetries(iframe);
                });
        }

        // get the page edition iframes
        function getPageEditionIframes(iframeEl) {
            if (iframeEl) {
                return $(iframeEl);
            }

            var $iframes = $(
                '.meliscms-page-tab-edition .melis-iframe, ' +
                '[data-meliskey="meliscms_page"] .melis-iframe'
            );

            // Fallback for restored tabs where wrapper classes are attached later.
            if (!$iframes.length) {
                $iframes = $('.melis-iframe');
            }

            return $iframes;
        }

        // when page is refreshed, the iframe is not loaded immediately, so we need to schedule retries
        function scheduleIframeSyncRetries(iframe) {
            var retryDelays = [100, 300, 700, 1200, 2000, 3000, 5000, 7000, 10000];
                retryDelays.forEach(function(delay) {
                    setTimeout(function() {
                        try {
                            var iframeDoc = iframe && iframe.contentDocument;
                                if (!iframeDoc || !iframeDoc.documentElement) {
                                    return;
                                }

                                if (iframeDoc.readyState === 'loading') {
                                    return;
                                }

                                applyThemeToPageEditionIframe(currentTheme, iframe);
                                applyUiStyleToPageEditionIframe(currentUiStyle, iframe);
                        } catch (e) {
                            // ignore cross-origin or not-ready iframe documents
                        }
                    }, delay);
                });
        }

        // when page is loaded, the iframe is not loaded immediately, so we need to start a timer to sync the theme/ui style
        function startIframeStartupSync() {
            var attempts = 0,
                maxAttempts = 12,
                intervalMs = 1000,
                timer = setInterval(function() {
                    attempts += 1;
                    syncPageEditionIframes();
                    if (attempts >= maxAttempts) {
                        clearInterval(timer);
                    }
                }, intervalMs);
        }

        // sync the theme/ui style to the iframe
        function syncPageEditionIframes() {
            bindPageEditionIframeLoadListeners();
            applyThemeToPageEditionIframe(currentTheme);
            applyUiStyleToPageEditionIframe(currentUiStyle);
        }

        // added for page edition iframe, schemes.css and dark.css
        function ensureThemeStylesheetsInIframe(iframeDoc) {
            var head = iframeDoc.head || iframeDoc.getElementsByTagName('head')[0];
                if (!head) {
                    return;
                }

            var defaultHref = $defaultTheme.attr('href') || '/assets/css/schemes.css',
                darkHref = $darkTheme.attr('href') || '/assets/css/dark.css',
                roundedHref = $rounded.attr('href') || '/assets/css/rounded.css';

                // Create <link> nodes with the iframe's document — jQuery-created nodes
                // belong to the parent document and can end up appended to <body> when
                // moved into another document.
                function appendStylesheetLink(id, href) {
                    if (iframeDoc.getElementById(id)) {
                        return;
                    }

                    var link = iframeDoc.createElement('link');
                        link.id = id;
                        link.href = href;
                        link.media = 'screen';
                        link.rel = 'stylesheet';
                        link.type = 'text/css';
                        head.appendChild(link);
                }

                appendStylesheetLink('default-theme', defaultHref);
                appendStylesheetLink('dark-theme', darkHref);
                appendStylesheetLink('rounded', roundedHref);
        }

        function saveTheme(theme) {
            localStorage.setItem(storageKey, theme);
        }

        function updateUI() {
            // sync new card UI
            var $cards = $('#color-themes .theme-option');
                $cards.removeClass('active');
                $cards.filter('[data-theme="' + currentTheme + '"]').addClass('active');

            var config = getThemeConfig(currentTheme);
                $('#currentTheme').text(config.displayName);
        }
    
        // watch for new theme controls
        function watchThemeControls() {
            if (typeof MutationObserver !== 'undefined') {
                if (!themeControlsObserver) {
                    themeControlsObserver = new MutationObserver(function (mutations) {
                        let shouldUpdate = mutations.some(function(m) {
                            return detectNewControls(m.addedNodes);
                        });
    
                        if (shouldUpdate) {
                            ensureThemeControlsState();
                        }
                    });
    
                    themeControlsObserver.observe(document.body, { childList: true, subtree: true });
                }
            } else {
                // fallback polling for old browsers
                if (!themeControlsPollId) {
                    themeControlsPollId = setInterval(function() {
                        if (controlsExist()) {
                            ensureThemeControlsState();
                        }
                    }, 300);
                }
            }
        }
    
        // detect if new theme controls appear
        function detectNewControls(addedNodes) {
            if (!addedNodes || !addedNodes.length) return false;
    
            return Array.from(addedNodes).some(function(node) {
                if (!node || node.nodeType !== 1) return false;
    
                let $node = $(node);
    
                return (
                    $node.is('.theme-switcher') ||
                    $node.is('.theme-radio') ||
                    $node.find('.theme-switcher').length > 0 ||
                    $node.find('.theme-radio').length > 0
                );
            });
        }
    
        // check if radio UI exists
        function controlsExist() {
            return (
                $('.theme-radio').length > 0 || 
                $('#color-themes .theme-option').length > 0 || 
                $('#ui-style .theme-option').length > 0
            );
        }
    
        // ensure radio buttons display correct state
        function ensureThemeControlsState() {
            if (!controlsExist()) return;
                updateUI();
                updateUiStyleUI();
        }

        function getThemeConfig(theme) {
            var configs = {
                default: { icon: '☀️', name: 'Default', displayName: 'Default' },
                dark: { icon: '🌙', name: 'Dark', displayName: 'Dark' }
                // custom: { icon: '⭐', name: 'Custom', displayName: 'Custom' }
            };

            return configs[theme] || configs.default;
        }

        function getCurrentTheme() {
            return currentTheme;
        }

        function toggleTheme() {
            var newTheme = currentTheme === 'default' ? 'dark' : 'default';
                setTheme(newTheme);
                saveTheme(newTheme);
        }

        // public methods
        return {
            init            : init,
            getCurrentTheme : getCurrentTheme,
            setTheme        : setTheme,
            toggleTheme     : toggleTheme,
            loadSavedTheme  : loadSavedTheme,
            syncPageEditionIframes : syncPageEditionIframes,
            //reApplyUiStyle  : function () { applyUiStyle(); }
        };
})(jQuery);

$(function() {
    // init theme switcher
    themeSwitcher.init();

    // on tab shown, re-sync theme/ui style (supports restored/reopened tabs)
    $(document).on("shown.bs.tab", "a[data-bs-toggle='tab']", function () {
        if (window.themeSwitcher) {
            if (typeof themeSwitcher.syncPageEditionIframes === 'function') {
                themeSwitcher.syncPageEditionIframes();
            }

            /* if (typeof themeSwitcher.reApplyUiStyle === 'function') {
                themeSwitcher.reApplyUiStyle();
            } */
        }
    });
});