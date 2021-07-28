<?php

use MelisCore\Support\MelisCore;

return array(
    'plugins' => array(
        'meliscore' => array(
            'conf' => array(
                'id' => 'id_melis_core',
                'name' => 'tr_meliscore_meliscore',
                'rights_checkbox_disable' => true,
            ),
            'datas' => array(
                'zf2' => array(
                    'maxNestedForwards' => 100
                ),

                // Override these datas iMelisFront404CatcherListener.phpConfig !
                'default' => array(
                    'host' => $_SERVER['HTTP_HOST'],
                    'scheme' => $_SERVER['REQUEST_SCHEME'],
                    'logo' => '/img/MelisTech.png',
                    'errors' => array(
                        'error_reporting' => E_ALL & ~E_USER_DEPRECATED,
                        'display_errors' => 1,
                    ),
                    'accounts' => array(
                        'hash_method' => 'sha256',
                        'salt' => 'salt_#{3xamPle;',
                        'use_mcrypt' => true
                    ),
                    'emails' => array(
                        'active' => 1,
                    ),
                    'pwd_request_expiry' => 1440, //minutes (1440 min = 24 hrs)
                    'pwd_expiry' => 720, //minutes (720 hrs = 30 days)
                    'export' => array(
                        'csv' => array(
                            'separator' => ',',
                            'enclosed' => '"',
                            'striptags' => 1,
                            'defaultFileName' => 'melis_data_export.csv',
                        ),
                    ),
                    'auth_cookies' => array(
                        'remember' => '+1 day',
                        'expire' => '1 day',
                    ),
                    'auto_logout' => array(
                        'after' => 86400, // 1 day
                        //'after' => 60,
                    ),
                    'diagnostics' => array(
                        /**
                         * set to "true" if you want to use diagnostics
                         */
                        'active' => true,
                        'windows' => array(
                            // the setup is done here, so you don't need to do a batch file to register
                            // phpunit globally, instead we just call them directly from their directory to execute it.
                            // Download latest release: https://phar.phpunit.de/phpunit.phar

                            // php executable file path
                            'php_cli' => '"A:\xampp\php\php.exe"',
                            // the path where you save your phpunit
                            'phpunit' => 'C:/bin/phpunit.phar'
                        ),
                        'others' => array(
                            /**
                             * How to install PHPUnit in Linux and Mac
                             * Run in Terminal:
                             * --------------------------------------
                             * wget https://phar.phpunit.de/phpunit.phar
                             * chmod +x phpunit.phar
                             * --------------------------------------
                             * Once downloaded we have to move or copy phpunit.phar into /usr/local/bin/ so we can call it globally
                             * Run this command: sudo cp phpunit.phar /usr/local/bin/phpunit
                             * -- OR --
                             * sudo mv phpunit.phar /usr/local/bin/phpunit
                             *
                             *
                             * And also, make sure that the php cli is available globally, if not just run this command:
                             * sudo cp /path/of/php /usr/local/bin/php
                             * To test if your phpunit is working, just run this command: phpunit --version
                             * It should return something like this:
                             * -------------------------------
                             * PHPUnit 5.7.4 by Sebastian Bergmann and contributors.
                             *
                             * -------------------------------
                             */
                            'php_cli' => '/usr/local/bin/php',
                            'phpunit' => '/usr/local/bin/phpunit',
                            /**
                             * NOTE: CURRENTLY WORKING ON PHPUnit 5.7.21
                             */
                        ),
                    ),
                    'langauges' => array(
                        'default_trans_files' => array(
                            'defaultTransInterface' => 'en_EN.interface',
                            'defaultTransForms' => 'en_EN.forms',
                            'defaultFrTransInterface' => 'fr_FR.interface',
                            'defaultFrTransForms' => 'fr_FR.forms',
                        ),
                        'default_trans_dir' => array(
                            'path' => $_SERVER['DOCUMENT_ROOT'] . '/../module/MelisModuleConfig/languages/',
                        ),
                        'trans_list_dir' => array(
                            $_SERVER['DOCUMENT_ROOT'] . '/../module/MelisModuleConfig/config/translation.list.php',
                        ),
                    ),
                ),
                /*
                 * fallback melis marketplace module section
                 *  - if the platform is not connected to the internet
                 */
                'fallBacksection' => [
                    'MelisCore',
                    'MelisCms',
                    'MelisMarketing',
                    'MelisCommerce',
                    'MelisSites'
                ],
                /*
                 * duration of new plugins (dashboard and templating(pages)) notifications
                 * in ( number of days )
                 */
                'new_plugin_notification' => [
                    'menu_handler' => "5", // equivalent to 5 days
                    "inside_menu"  => "10" // equivalent to 10 days
                ],
                /**
                 * time in hours of the data to be anonymized
                 *  - this is for testing only by default it's days
                 *
                 * m - minutes
                 * d - days
                 */
                'gdpr_auto_anonymized_time_format' => "d",

                /**
                 * scheme configuration to use in the url
                 *  - override this in the MelisModuleConfig
                 */
                getenv('MELIS_PLATFORM') => [
                    // host
                    'host' => $_SERVER['HTTP_HOST'],
                    // scheme
                    'platform_scheme' => $_SERVER['REQUEST_SCHEME']
                ]

            ),
            'ressources' => array(
                'css' => array(
                    '/MelisCore/assets/components/library/jquery-ui/css/jquery-ui.min.css',
                    // '/MelisCore/assets/components/modules/admin/forms/elements/bootstrap-datepicker/assets/lib/css/bootstrap-datepicker.css',
                    '/MelisCore/assets/components/modules/admin/charts/easy-pie/assets/lib/css/jquery.easy-pie-chart.css',
                    '/MelisCore/assets/components/modules/admin/notifications/notyfy/assets/lib/css/jquery.notyfy.css',
                    '/MelisCore/assets/components/modules/admin/notifications/notyfy/assets/lib/css/notyfy.theme.default.css',

                    '/MelisCore/assets/components/modules/admin/forms/elements/bootstrap-select/assets/lib/css/bootstrap-select.css',
                    '/MelisCore/assets/components/modules/admin/forms/elements/uniform/assets/lib/css/uniform.default.css',

                    '/MelisCore/assets/components/modules/admin/gallery/blueimp-gallery/assets/lib/css/blueimp-gallery.min.css',

                    '/MelisCore/assets/components/modules/admin/forms/elements/bootstrap-switch/assets/lib/css/bootstrap-switch.css',
                    '/MelisCore/assets/components/modules/admin/notifications/gritter/assets/lib/css/jquery.gritter.css',
                    '/MelisCore/assets/components/modules/admin/forms/editors/wysihtml5/assets/lib/css/bootstrap-wysihtml5-0.0.2.css',
                    '/MelisCore/assets/components/modules/admin/forms/elements/jasny-fileupload/assets/css/fileupload.css',
                    '/MelisCore/assets/components/modules/admin/forms/elements/select2/assets/lib/css/select2.css',
                    '/MelisCore/assets/components/modules/admin/forms/elements/bootstrap-timepicker/assets/lib/css/bootstrap-timepicker.css',
                    '/MelisCore/assets/components/modules/admin/forms/elements/colorpicker-farbtastic/assets/css/farbtastic.css',

                    // Data Tables
                    '/MelisCore/assets/components/modules/admin/tables/datatables/assets/css/datatables.min.css',
                    /* '/MelisCore/assets/components/modules/admin/tables/datatables/assets/css/dataTables.bootstrap.css',
                    '/MelisCore/assets/components/modules/admin/tables/datatables/assets/extensions/Responsive/css/responsive.bootstrap.css',
                    '/MelisCore/assets/components/modules/admin/tables/datatables/assets/extensions/Buttons/css/buttons.bootstrap.css', */

                    // fancytree
                    '/MelisCore/js/library/fancytree/src/skin-lion/ui.fancytree.css',
                    '/MelisCore/js/library/fancytree/extensions/contextmenu/css/jquery.contextMenu.css',

                    '/MelisCore/assets/components/library/bootstrap/css/bootstrap.min.css',
                    '/MelisCore/assets/components/library/icons/fontawesome/assets/css/font-awesome.min.css',
                    '/MelisCore/assets/components/library/icons/glyphicons/assets/css/glyphicons_regular.css',
                    '/MelisCore/assets/components/library/icons/glyphicons/assets/css/glyphicons_social.css',
                    '/MelisCore/assets/components/library/icons/glyphicons/assets/css/glyphicons_filetypes.css',
                    '/MelisCore/assets/components/library/icons/pictoicons/css/picto.css',
                    '/MelisCore/assets/components/library/animate/animate.min.css',
                    '/MelisCore/assets/components/modules/admin/tables/responsive/assets/lib/css/footable.core.min.css',

                    // datetimepicker
                    '/MelisCore/assets/components/plugins/bootstrap-datepicker-4/css/bootstrap-datetimepicker.min.css',

                    // admin
                    '/MelisCore/assets/css/admin/module.admin.page.form_elements.min.css',
                    '/MelisCore/assets/css/admin/module.admin.page.tables_responsive.min.css',


                    // Melis Admin
                    '/MelisCore/assets/css/admin/module.admin.page.core.min.css',

                    // Bootstrap Dialog
                    '/MelisCore/css/bootstrap-dialog.min.css',

                    // Plugins Move css group
                    '/MelisCore/css/plugin.group.css',

                    // MelisCore main CSS - should always be in bottom
                    '/MelisCore/css/styles.css',
                    // custom-style.css for the update on jquery 3.3.1 and bootstrap 4.3.1
                    '/MelisCore/css/custom-style.css',
                    '/MelisCore/css/diagnostic.css',

                    // Custom font-awesome checkbox
                    '/MelisCore/css/custom-fontawesome.css',

                ),
                'js' => array(
                    '/melis/get-translations',
                    '/MelisCore/assets/components/library/jquery/jquery.min.js',
                    //'/MelisCore/assets/components/library/jquery-ui/js/jquery-ui.min.js',

                    // Concat plugins
                    '/MelisCore/js/pluginConcat/melis-core-concat-plugins.js',
                    '/MelisCore/assets/components/core/js/core.init.js',

                    // Concat plugins
                    '/MelisCore/js/pluginConcat/melis-core-concat-dataTables.js',
                    '/MelisCore/js/core/melisDataTable.js',

                    // Concat plugins
                    '/MelisCore/js/pluginConcat/melis-core-concat-fancytree.js',

                    // tinyMCE
                    '/MelisCore/js/library/tinymce/tinymce.js?v=' . time(),
                    '/MelisCore/js/library/tinymce/icons/default/icons.min.js',
                    '/MelisCore/js/library/tinymce/langs/fr_FR.js',
                    '/MelisCore/js/tinyMCE/melis_tinymce.js',
                    '/MelisCore/js/tinyMCE/tinymce_cleaner.js',

                    '/MelisCore/assets/components/modules/admin/notifications/gritter/assets/custom/js/gritter.init.js',

                    // flot charts
                    '/MelisCore/assets/components/modules/admin/charts/flot/assets/lib/excanvas.js?v=v1.2.3',
                    '/MelisCore/assets/components/modules/admin/charts/flot/assets/lib/jquery.flot.js?v=v1.2.3',
                    '/MelisCore/assets/components/modules/admin/charts/flot/assets/lib/jquery.flot.resize.js?v=v1.2.3',
                    '/MelisCore/assets/components/modules/admin/charts/flot/assets/lib/jquery.flot.time.js?v=v1.2.3',
                    '/MelisCore/assets/components/modules/admin/charts/flot/assets/lib/plugins/jquery.flot.tooltip.min.js?v=v1.2.3',
                    '/MelisCore/assets/components/modules/admin/charts/flot/assets/lib/jquery.flot.stack.js',
                    '/MelisCore/assets/components/modules/admin/charts/flot/assets/custom/js/flotcharts.common.js?v=v1.2.3',

                    //datepicker translations
                    '/MelisCore/assets/components/library/bootstrap/js/bootstrap-datepicker.fr.js',

                    // datetimepicker
                    '/MelisCore/assets/components/plugins/bootstrap-datepicker-4/js/bootstrap-datetimepicker.min.js',
                    //'/MelisCore/assets/components/modules/admin/forms/elements/bootstrap-timepicker/assets/lib/js/bootstrap-timerpicker.js',
                    '/MelisCore/assets/components/FileSaver/FileSaver.min.js',

                    '/MelisCore/js/core/melisCore.js',
                    '/MelisCore/js/core/tabExpander.js',
                    '/MelisCore/js/rightsFancytree/rightsFancytreeInit.js',
                    '/MelisCore/js/core/melisSidebar.js',
                    '/MelisCore/js/core/melisHelper.js',
                    '/MelisCore/js/tools/melisCoreTool.js',
                    '/MelisCore/js/tools/users.tools.js',
                    '/MelisCore/js/tools/modules.tools.js',
                    '/MelisCore/js/tools/platforms.tools.js',
                    '/MelisCore/js/tools/lang.tools.js',
                    '/MelisCore/js/tools/emailMngt.tools.js',
                    '/MelisCore/js/tools/melisPHPUnitTool.js',
                    '/MelisCore/js/tools/logs.tool.js',
                    '/MelisCore/js/tools/user-profile.js',
                    '/MelisCore/js/tools/melisModalOpenTools.js',
                    '/MelisCore/js/tools/platform.scheme.tools.js',

                    '/MelisCore/js/tools/melis-core-gdpr-tool.js',
                    '/MelisCore/js/core/loader.js'
                ),
                /**
                 * the "build" configuration compiles all assets into one file to make
                 * lesser requests
                 */
                'build' => [
                    //'disable_bundle' => true,
                    // set to "true" if you want to use the build assets
                    'use_build_assets' => true,
                    // path to where the build CSS and JS are located
                    'build_path' => 'public/build/',

                    // lists of assets that will be loaded in the layout
                    'css' => [
                        '/MelisCore/build/css/bundle.css',

                    ],
                    'js' => [
                        '/melis/get-translations',
                        '/MelisCore/build/js/bundle.js',
                    ]
                ]
            ),
            'interface' => array(
                'meliscore_header' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_header',
                        'melisKey' => 'meliscore_header',
                        'name' => 'tr_meliscore_header',
                        'rightsDisplay' => 'none',
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'header',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                    'interface' => array(
                        'meliscore_header_close_all_tabs' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_header_close_all_tabs',
                                'melisKey' => 'meliscore_header_close_all_tabs',
                                'name' => 'tr_melis_user_tabs_close_all_open_tabs',
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Index',
                                'action' => 'close-all-tabs',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                        ),
                        'meliscore_header_flash_messenger' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_header_flash_messenger',
                                'melisKey' => 'meliscore_header_flash_messenger',
                                'name' => 'tr_meliscore_header_flash_messenger_title',
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'MelisFlashMessenger',
                                'action' => 'headerFlashMessenger',
                                'jscallback' => 'melisCore.flashMessenger();',
                                'jsdatas' => array()
                            ),
                        ),
                        'meliscore_header_language' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_header_language',
                                'melisKey' => 'meliscore_header_language',
                                'name' => 'tr_meliscore_header_language',
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'headerLanguage',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                        ),
                        'meliscore_header_logout' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_header_logout',
                                'melisKey' => 'meliscore_header_logout',
                                'name' => 'tr_meliscore_header_logout',
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'MelisAuth',
                                'action' => 'headerLogout',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                        ),
                    ),
                ),
                'meliscore_leftmenu' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_leftmenu',
                        'melisKey' => 'meliscore_leftmenu',
                        'name' => 'tr_meliscore_leftmenu_leftmenu',
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'left-menu',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                    'interface' => array(
                        'meliscore_leftmenu_identity' =>  array(
                            'conf' => array(
                                'id' => 'id_meliscore_leftmenu_identity',
                                'melisKey' => 'meliscore_leftmenu_identity',
                                'name' => 'tr_meliscore_leftmenu_identity',
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'MelisAuth',
                                'action' => 'identityMenu',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                            'interface' => array(
                                'meliscore_user_profile' => array(
                                    'conf' => array(
                                        'id' => 'id_meliscore_user_profile',
                                        'melisKey' => 'meliscore_user_profile',
                                        'name' => 'tr_meliscore_user_profile',
                                    ),
                                    'forward' => array(
                                        'module' => 'MelisCore',
                                        'controller' => 'UserProfile',
                                        'action' => 'render-user-profile',
                                        'jscallback' => '',
                                        'jsdatas' => array()
                                    ),
                                    'interface' => array(
                                        'meliscore_user_profile_left' => array(
                                            'conf' => array(
                                                'id' => 'id_meliscore_user_profile_left',
                                                'melisKey' => 'meliscore_user_profile_left',
                                                'rightsDisplay' => 'none',
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCore',
                                                'controller' => 'UserProfile',
                                                'action' => 'render-user-profile-left',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                        ),
                                        'meliscore_user_profile_right' => array(
                                            'conf' => array(
                                                'id' => 'id_meliscore_user_profile_right',
                                                'melisKey' => 'meliscore_user_profile_right',
                                                'rightsDisplay' => 'none',
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCore',
                                                'controller' => 'UserProfile',
                                                'action' => 'render-user-profile-right',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                            'interface' => array(
                                                'meliscore_user_profile_tabs' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_user_profile_tabs',
                                                        'melisKey' => 'meliscore_user_profile_tabs',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'UserProfile',
                                                        'action' => 'render-user-profile-tabs',
                                                        'jscallback' => '',
                                                        'jsdatas' => array()
                                                    ),
                                                    'interface' =>  array(
                                                        'meliscore_user_profile_form' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_user_profile_form',
                                                                'melisKey' => 'meliscore_user_profile_form',
                                                                'name' => 'tr_meliscore_user_profile_profile_text',
                                                                'icon' => 'user',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'UserProfile',
                                                                'action' => 'render-user-profile-form',
                                                                'jscallback' => '',
                                                                'jsdatas' => array()
                                                            ),
                                                        ),
                                                    ),
                                                ),
                                            ),
                                        ),
                                    ),
                                ),
                            )
                        ),
                        'meliscore_leftmenu_dashboard' =>  array(
                            'conf' => array(
                                'id' => 'id_meliscore_leftmenu_dashboard',
                                'melisKey' => 'meliscore_leftmenu_dashboard',
                                'name' => 'tr_meliscore_dashboard',
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Dashboard',
                                'action' => 'leftmenu-dashboard',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                        ),
                        'meliscore_footer' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_footer',
                                'melisKey' => 'meliscore_footer',
                                'name' => 'tr_meliscore_footer_footer'
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Index',
                                'action' => 'footer',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                        )
                    ),
                ),
                'meliscore_center' => array(
                    'conf' => array(
                        'rightsDisplay' => 'none',
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'center',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                    'interface' => array(
                        'meliscore_dashboard' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_toolstree_section_dashboard',
                                'name' => 'tr_meliscore_dashboard',
                                'melisKey' => 'meliscore_dashboard',
                                'icon' => 'fa-tachometer',
                                'dashboard' => true
                            ),
                            'interface' => [
                                'meliscore_dashboard_header' => [
                                    'conf' => [
                                        'id' => 'id_meliscore_center_dashboard_header',
                                        'melisKey' => 'meliscore_center_dashboard_header',
                                        'name' => 'tr_meliscore_dashboard',
                                        'rightsDisplay' => 'none'
                                    ],
                                    'forward' => [
                                        'module' => 'MelisCore',
                                        'controller' => 'DashboardPlugins',
                                        'action' => 'render-dashboard-plugins-header',
                                    ]
                                ],
                                'meliscore_dashboard_bubble_plugins' => [
                                    'conf' => [
                                        'id' => 'id_meliscore_dashboard_bubble_plugins',
                                        'melisKey' => 'meliscore_dashboard_bubble_plugins',
                                        'name' => 'tr_meliscore_dashboard',
                                        'rightsDisplay' => 'none'
                                    ],
                                    'forward' => [
                                        'module' => 'MelisCore',
                                        'controller' => 'DashboardPlugins',
                                        'action' => 'render-dashboard-bubble-plugins',
                                    ]
                                ],
                            ]
                        ),
                    )
                ),
                'meliscore_dashboard_menu' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_center_dashboard_menu',
                        'melisKey' => 'meliscore_center_dashboard_menu',
                        'name' => 'tr_meliscore_center_dashboard_menu'
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'DashboardPlugins',
                        'action' => 'dashboard-menu',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                ),
                'melis_dashboardplugin' => array(
                    'conf' => array(
                        MelisCore::DISPLAY => MelisCore::DISPLAY_NONE
                    ),
                    'interface' => array()
                ),
            ),
        ),
        'meliscore_login' => array(
            'ressources' => array(
                'css' => array(
                    '/MelisCore/css/OpenSans.css',
                    '/MelisCore/css/Roboto.css',
                    '/MelisCore/css/Monseratt.css',

                    '/MelisCore/assets/components/library/bootstrap/css/bootstrap.min.css',
                    '/MelisCore/assets/components/library/icons/fontawesome/assets/css/font-awesome.min.css',
                    '/MelisCore/assets/components/library/icons/glyphicons/assets/css/glyphicons_regular.css',
                    '/MelisCore/assets/components/library/icons/glyphicons/assets/css/glyphicons_social.css',
                    '/MelisCore/assets/components/library/icons/glyphicons/assets/css/glyphicons_filetypes.css',
                    '/MelisCore/assets/components/library/icons/pictoicons/css/picto.css',
                    '/MelisCore/assets/components/library/animate/animate.min.css',

                    '/MelisCore/assets/components/library/jquery-ui/css/jquery-ui.min.css',
                    '/MelisCore/assets/components/modules/admin/forms/elements/bootstrap-datepicker/assets/lib/css/bootstrap-datepicker.css',
                    '/MelisCore/assets/components/modules/admin/charts/easy-pie/assets/lib/css/jquery.easy-pie-chart.css',
                    '/MelisCore/assets/components/modules/admin/notifications/notyfy/assets/lib/css/jquery.notyfy.css',
                    '/MelisCore/assets/components/modules/admin/notifications/notyfy/assets/lib/css/notyfy.theme.default.css',

                    '/MelisCore/assets/components/modules/admin/forms/elements/bootstrap-select/assets/lib/css/bootstrap-select.css',
                    '/MelisCore/assets/components/modules/admin/forms/elements/uniform/assets/lib/css/uniform.default.css',

                    '/MelisCore/assets/components/modules/admin/gallery/blueimp-gallery/assets/lib/css/blueimp-gallery.min.css',

                    '/MelisCore/assets/components/modules/admin/forms/elements/bootstrap-switch/assets/lib/css/bootstrap-switch.css',
                    '/MelisCore/assets/components/modules/admin/notifications/gritter/assets/lib/css/jquery.gritter.css',
                    '/MelisCore/assets/components/modules/admin/forms/editors/wysihtml5/assets/lib/css/bootstrap-wysihtml5-0.0.2.css',
                    '/MelisCore/assets/components/modules/admin/forms/elements/jasny-fileupload/assets/css/fileupload.css',
                    '/MelisCore/assets/components/modules/admin/forms/elements/select2/assets/lib/css/select2.css',
                    '/MelisCore/assets/components/modules/admin/forms/elements/bootstrap-timepicker/assets/lib/css/bootstrap-timepicker.css',
                    '/MelisCore/assets/components/modules/admin/forms/elements/colorpicker-farbtastic/assets/css/farbtastic.css',


                    '/MelisCore/assets/css/admin/module.admin.page.core.min.css',
                    // MelisCore main CSS - should always be in bottom
                    '/MelisCore/css/styles.css',
                    // custom-style.css for the update on jquery 3.3.1 and bootstrap 4.3.1
                    '/MelisCore/css/custom-style.css',
                ),
                'js' => array(
                    '/melis/get-translations',
                    '/MelisCore/assets/components/library/jquery/jquery.min.js?v=v1.2.3',
                    '/MelisCore/js/tools/melisCoreTool.js',
                    '/MelisCore/js/core/login.js',
                    '/MelisCore/js/core/melispasswordservice.js',
                ),
            ),
            'conf' => array(
                'id' => 'id_melis_core_login',
                'melisKey' => 'meliscore_login',
                'rightsDisplay' => 'none',
            ),
            'datas' => array(
                'askaccount_email' => 'askaccount@test.com',
                'lostpassword_email' => 'lostpassword@test.com',
                'login_background' => '/MelisCore/images/login/melis-blackboard.jpg',
                'login_logo' => '/MelisCore/images/login/melis-box.png',
            ),
            'interface' => array(
                'meliscore_login_header' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_login_header',
                        'melisKey' => 'meliscore_login_header'
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'header',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                    'interface' => array(
                        'meliscore_headerlogin_language' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_header_language',
                                'melisKey' => 'meliscore_headerlogin_language'
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'headerLanguage',
                                'jscallback' => '',
                                'jsdatas' => array('variable2' => 'titi')
                            ),
                        ),
                    ),
                ),
                'meliscore_login_center' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_login_center',
                        'melisKey' => 'meliscore_login_center'
                    ),
                    'interface' => array(
                        'meliscore_login_loginform' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_login_loginform',
                                'melisKey' => 'meliscore_login_loginform'
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'MelisAuth',
                                'action' => 'login',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                        ),
                    ),
                ),
                'meliscore_login_footer' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_login_footer',
                        'melisKey' => 'meliscore_login_footer'
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'footer',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                )
            )
        ),
        'meliscore_lost_password' => array(
            'conf' => array(
                'rightsDisplay' => 'none',
            ),
            'datas' => array(
                'login_background' => 'MelisCore/images/login/melis-blackboard.jpg',
                'lost_password_logo' => '/MelisCore/images/login/melis-box.png',
            ),
            'interface' => array(
                'meliscore_lost_password_header' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_lost_password_header',
                        'melisKey' => 'meliscore_lost_password_header'
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'header',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                    'interface' => array(
                        'meliscore_headerlogin_language' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_header_language',
                                'melisKey' => 'meliscore_headerlogin_language'
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'headerLanguage',
                                'jscallback' => '',
                                'jsdatas' => array('variable2' => 'titi')
                            ),
                        ),
                    ),
                ),

                'meliscore_lost_password_center' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_lost_password_center',
                        'melisKey' => 'meliscore_lost_password_center'
                    ),
                    'interface' => array(
                        'meliscore_lost_password_form' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_lost_password_form',
                                'melisKey' => 'meliscore_lost_password_form',
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'User',
                                'action' => 'retrievePage',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                        ),
                    ),
                ),

                'meliscore_lost_password_footer' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_login_footer',
                        'melisKey' => 'meliscore_lost_password_footer'
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'footer',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                )
            ),
        ),

        'meliscore_reset_password' => array(
            'conf' => array(
                'rightsDisplay' => 'none',
            ),
            'datas' => array(
                'login_background' => 'MelisCore/images/login/melis-blackboard.jpg',
                'reset_password_logo' => '/MelisCore/images/login/melis-box.png',
            ),
            'interface' => array(
                'meliscore_reset_password_header' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_reset_password_header',
                        'melisKey' => 'meliscore_reset_password_header'
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'header',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                    'interface' => array(
                        'meliscore_headerlogin_language' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_header_language',
                                'melisKey' => 'meliscore_headerlogin_language'
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'headerLanguage',
                                'jscallback' => '',
                                'jsdatas' => array('variable2' => 'titi')
                            ),
                        ),
                    ),
                ),

                'meliscore_reset_password_center' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_reset_password_center',
                        'melisKey' => 'meliscore_reset_password_center'
                    ),
                    'interface' => array(
                        'meliscore_reset_password_form' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_reset_password_form',
                                'melisKey' => 'meliscore_reset_password_form',
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'User',
                                'action' => 'reset-password',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                        ),
                    ),
                ),
                'meliscore_reset_password_footer' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_login_footer',
                        'melisKey' => 'meliscore_reset_password_footer'
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'footer',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                ),
            ),
        ),
        'meliscore_generate_password' => array(
            'conf' => array(
                'rightsDisplay' => 'none',
            ),
            'datas' => array(
                'login_background' => 'MelisCore/images/login/melis-blackboard.jpg',
                'generate_password_logo' => '/MelisCore/images/login/melis-box.png',
            ),
            'interface' => array(
                'meliscore_generate_password_header' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_generate_password_header',
                        'melisKey' => 'meliscore_generate_password_header'
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'header',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                    'interface' => array(
                        'meliscore_headerlogin_language' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_header_language',
                                'melisKey' => 'meliscore_headerlogin_language'
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'headerLanguage',
                                'jscallback' => '',
                                'jsdatas' => array('variable2' => 'titi')
                            ),
                        ),
                    ),
                ),

                'meliscore_generate_password_center' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_generate_password_center',
                        'melisKey' => 'meliscore_generate_password_center'
                    ),
                    'interface' => array(
                        'meliscore_generate_password_form' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_generate_password_form',
                                'melisKey' => 'meliscore_generate_password_form',
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'User',
                                'action' => 'generate-password',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                        ),
                    ),
                ),
                'meliscore_generate_password_footer' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_login_footer',
                        'melisKey' => 'meliscore_generate_password_footer'
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'footer',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                ),
            ),
        ),
        'meliscore_renew_password' => array(
            'conf' => array(
                'rightsDisplay' => 'none',
            ),
            'datas' => array(
                'login_background' => 'MelisCore/images/login/melis-blackboard.jpg',
                'renew_password_logo' => '/MelisCore/images/login/melis-box.png',
            ),
            'interface' => array(
                'meliscore_renew_password_header' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_renew_password_header',
                        'melisKey' => 'meliscore_renew_password_header'
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'header',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                    'interface' => array(
                        'meliscore_headerlogin_language' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_header_language',
                                'melisKey' => 'meliscore_headerlogin_language'
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'headerLanguage',
                                'jscallback' => '',
                                'jsdatas' => array('variable2' => 'titi')
                            ),
                        ),
                    ),
                ),

                'meliscore_renew_password_center' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_renew_password_center',
                        'melisKey' => 'meliscore_renew_password_center'
                    ),
                    'interface' => array(
                        'meliscore_renew_password_form' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_renew_password_form',
                                'melisKey' => 'meliscore_renew_password_form',
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'User',
                                'action' => 'renew-password',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                        ),
                    ),
                ),
                'meliscore_renew_password_footer' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_login_footer',
                        'melisKey' => 'meliscore_renew_password_footer'
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Index',
                        'action' => 'footer',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                ),
            ),
        ),
        'microservice' => array(
            'conf' => array(
                'rightsDisplay' => 'none',
            ),
        )
    )
);
