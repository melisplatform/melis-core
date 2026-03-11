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
        currentUiStyle          = 'flat',
        uiStorageKey            = 'preferred-ui-style',
        themeControlsObserver   = null,
        themeControlsPollId     = null;

        // private methods
        function init() {
            loadSavedTheme(); // theme
            loadSavedUiStyle(); // ui style
            setupEventListeners();
            ensureThemeControlsState();
            watchThemeControls();
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
            // theme option clicks (delegated for dynamically injected markup)
            $(document).on('click', '#color-themes .theme-option', function(e) {
                e.preventDefault();

                var theme = $(this).data("theme");
                    themeSwitcher.setTheme(theme);
                    themeSwitcher.toggleTheme;

                    setTheme(theme);
                    saveTheme(theme);
            });

            // ui style handler
            $(document).on('click', '#ui-style .theme-option', function(e) {
                e.preventDefault();

                var style = $(this).data("style");
                    setUiStyle(style);
                    saveUiStyle(style);
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
            var $targets = $(
                '.widget, .panel, .card, .modal-content, .sidebar, .dropdown-menu, .table,' +
                '.panel-heading, .panel-body, .card-header, .card-body, .form-control, .input-group-text,' +
                '.btn, .list-group-item, .well, .nav-link, .dropdown-item, .modal-header, .modal-body, .modal-footer,' +
                'input:not(.theme-radio), select, textarea'
            );
        
            if (style === 'rounded') {
                $targets.removeClass('flat').addClass('rounded');
            } else {
                $targets.removeClass('rounded').addClass('flat');
            }
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
            
            // trigger custom event for other components
            $(document).trigger('themeChanged', [theme]);
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
            reApplyUiStyle  : function () { applyUiStyle(); }
        };
})(jQuery);

$(function() {
    // init theme switcher
    themeSwitcher.init();

    // on tab shown, reapply ui style
    $(document).on("shown.bs.tab", "a[data-bs-toggle='tab']", function () {
        if (window.themeSwitcher && typeof themeSwitcher.reApplyUiStyle === 'function') {
            themeSwitcher.reApplyUiStyle();
        }
    });
});