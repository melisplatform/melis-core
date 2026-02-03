/**  
 * Theme Switcher Module using jQuery Modular Pattern
 */
var themeSwitcher = (function($) {
    'use strict';

    // private variables
    var currentTheme    = 'light',
        storageKey      = 'preferred-theme',
        $html           = $('html'),
        $lightTheme     = $('#light-theme'), // light = system colors, default
        $darkTheme      = $('#dark-theme'),
        themeControlsObserver = null,
        themeControlsPollId   = null;

        // private methods
        function init() {
            loadSavedTheme();
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
                    setTheme('light');
                }
        }

        function setupEventListeners() {
            // theme option clicks (delegated for dynamically injected markup)
            $(document).on('change', '.theme-radio', function(e) {
                e.preventDefault();

                var theme = $(this).val();
                    setTheme(theme);
                    saveTheme(theme);
            });
        }

        function setTheme(theme) {
            // validate theme
            if (theme !== 'light' && theme !== 'dark') {
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
                $lightTheme.prop('disabled', true);
                $darkTheme.prop('disabled', false);
            } else {
                $lightTheme.prop('disabled', false);
                $darkTheme.prop('disabled', true);
            }
            
            // trigger custom event for other components
            $(document).trigger('themeChanged', [theme]);
        }

        function saveTheme(theme) {
            localStorage.setItem(storageKey, theme);
        }

        function updateUI() {
            $('.theme-radio').each(function () {
                $(this).prop('checked', $(this).val() === currentTheme);
            });
    
            var config = getThemeConfig(currentTheme);
            $('#currentTheme').text(config.displayName); // to display text of the theme
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
            return $('.theme-radio').length > 0;
        }
    
        // ensure radio buttons display correct state
        function ensureThemeControlsState() {
            if (controlsExist()) updateUI();
        }

        function getThemeConfig(theme) {
            var configs = {
                light: { icon: '☀️', name: 'Light', displayName: 'Light' },
                dark: { icon: '🌙', name: 'Dark', displayName: 'Dark' }
            };

            return configs[theme] || configs.light;
        }

        function getCurrentTheme() {
            return currentTheme;
        }

        function toggleTheme() {
            var newTheme = currentTheme === 'light' ? 'dark' : 'light';
                setTheme(newTheme);
                saveTheme(newTheme);
        }

        // public methods
        return {
            init            : init,
            getCurrentTheme : getCurrentTheme,
            setTheme        : setTheme,
            toggleTheme     : toggleTheme,
            loadSavedTheme  : loadSavedTheme
        };
})(jQuery);