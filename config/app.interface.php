<?php


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

                // Override these datas in MelisModuleConfig !
                'default' => array(
                    'host' => 'http://www.melisv2url.local',
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
                        'expire' => '-1 day',
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
                            'defaultTransInterface' =>  'en_EN.interface',
                            'defaultTransForms' => 'en_EN.forms',
                        ),
                        'default_trans_dir' => array(
                            'path' => $_SERVER['DOCUMENT_ROOT'] . '/../module/MelisModuleConfig/languages/',
                        ),
                        'trans_list_dir' => array(
                            $_SERVER['DOCUMENT_ROOT'] . '/../module/MelisModuleConfig/config/translation.list.php',
                        ),
                    ),
                ),
            ),
            'ressources' => array(
                'css' => array(
					'https://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700',
					'https://fonts.googleapis.com/css?family=Roboto:400,300,700',
					'https://fonts.googleapis.com/css?family=Montserrat:300,400,700',

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

                    // Data Tables
                    '/MelisCore/assets/components/modules/admin/tables/datatables/assets/css/dataTables.bootstrap.css',
                    '/MelisCore/assets/components/modules/admin/tables/datatables/assets/extensions/Responsive/css/responsive.bootstrap.css',
                    '/MelisCore/assets/components/modules/admin/tables/datatables/assets/extensions/Buttons/css/buttons.bootstrap.css',

                    // fancytree
                    '/MelisCore/js/library/fancytree/src/skin-lion/ui.fancytree.css',
                    '/MelisCore/js/library/fancytree/extensions/contextmenu/css/jquery.contextMenu.css',

                    '/MelisCore/assets/css/admin/module.admin.page.form_elements.min.css',
                    '/MelisCore/assets/css/admin/module.admin.page.tables_responsive.min.css',


                    // Melis Admin
                    '/MelisCore/assets/css/admin/module.admin.page.core.min.css',

                    '/MelisCore/assets/components/library/bootstrap/css/bootstrap.min.css',
                    '/MelisCore/assets/components/library/icons/fontawesome/assets/css/font-awesome.min.css',
                    '/MelisCore/assets/components/library/icons/glyphicons/assets/css/glyphicons_regular.css',
                    '/MelisCore/assets/components/library/icons/glyphicons/assets/css/glyphicons_social.css',
                    '/MelisCore/assets/components/library/icons/glyphicons/assets/css/glyphicons_filetypes.css',
                    '/MelisCore/assets/components/library/icons/pictoicons/css/picto.css',
                    '/MelisCore/assets/components/library/animate/animate.min.css',
                    '/MelisCore/assets/components/modules/admin/tables/responsive/assets/lib/css/footable.core.min.css',

                    // Bootstrap Dialog
                    '/MelisCore/css/bootstrap-dialog.min.css',

                    // Plugins Move css group
                    '/MelisCore/css/plugin.group.css',

                    // MelisCore main CSS - should always be in bottom
                    '/MelisCore/css/styles.css',
                    '/MelisCore/css/diagnostic.css',

                    
                    // Custom font-awesome checkbox
                    '/MelisCore/css/custom-fontawesome.css'
                ),
                'js' => array(
                    '/melis/get-translations',
                    '/MelisCore/assets/components/library/jquery/jquery.min.js?v=v1.2.3',

                    // Concat plugins
                    '/MelisCore/js/pluginConcat/melis-core-concat-plugins.js',
                    '/MelisCore/assets/components/core/js/core.init.js',

                    // Concat plugins
                    '/MelisCore/js/pluginConcat/melis-core-concat-dataTables.js',

                    // Concat plugins
                    '/MelisCore/js/pluginConcat/melis-core-concat-fancytree.js',

                    // tinyMCE
                    '/MelisCore/js/library/tinymce/tinymce.min.js?v='. time(),
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
                    '/MelisCore/assets/components/modules/admin/charts/flot/assets/custom/js/flotcharts.common.js?v=v1.2.3',

                    //datepicker translations
                    '/MelisCore/assets/components/library/bootstrap/js/bootstrap-datepicker.fr.js',

                    '/MelisCore/js/core/tabExpander.js',
                    '/MelisCore/js/core/melisSidebar.js',
                    '/MelisCore/js/rightsFancytree/rightsFancytreeInit.js',
                    '/MelisCore/js/core/melisCore.js',
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

                ),
                /**
                 * the "build" configuration compiles all assets into one file to make
                 * lesser requests
                 */
                'build' => [
                    // set to "true" if you want to use the build assets
                    'use_build_assets' =>  true,

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
                        'jscallback' => 'enableSidebarScroll();',
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
                                'name' => 'tr_meliscore_center_Dashboard',
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Dashboard',
                                'action' => 'leftmenu-dashboard',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                        ),
                        'meliscore_toolstree' =>  array(
                            'conf' => array(
                                'id' => 'id_meliscore_menu_toolstree',
                                'name' => 'tr_meliscore_menu_toolstree_Name',
                                'melisKey' => 'meliscore_toolstree',
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'TreeTools',
                                'action' => 'render-tree-tools',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                            'interface' => array(
                                'meliscore_tool_system_config' => array(
                                    'conf' => array(
                                        'id' => 'id_meliscore_tool_system_config',
                                        'name' => 'tr_meliscore_system_configuration',
                                        'icon' => 'fa-sliders',
                                        'rights_checkbox_disable' => true,
                                    ),
                                    'interface' => array(
                                        // PhpUnit
                                        'meliscore_tool_phpunit' => array(
                                            'conf' => array(
                                                'id' => 'id_meliscore_tool_phpunit',
                                                'name' => 'Diagnostic',
                                                'melisKey' => 'meliscore_tool_phpunit',
                                                'icon' => 'fa fa-stethoscope',
                                                'rights_checkbox_disable' => true,
                                                'follow_regular_rendering' => false,
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCore',
                                                'controller' => 'MelisPhpUnitTool',
                                                'action' => 'render-phpunit-container',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                            'interface' => array(
                                                'meliscore_tool_phpunit_header' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_phpunit_header',
                                                        'name' => 'PHPUnit Header',
                                                        'melisKey' => 'meliscore_tool_phpunit_header',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'MelisPhpUnitTool',
                                                        'action' => 'render-phpunit-header',
                                                        'jscallback' => '',
                                                        'jsdatas' => array()
                                                    ),
                                                    'interface' => array(
                                                        'meliscore_tool_phpunit_header_run_all' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_phpunit_header_run_all',
                                                                'name' => 'PHPUnit Header Run All',
                                                                'melisKey' => 'meliscore_tool_phpunit_header_run_all',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'MelisPhpUnitTool',
                                                                'action' => 'render-phpunit-header-run-all',
                                                                'jscallback' => '',
                                                                'jsdatas' => array()
                                                            ),
                                                        ),
                                                    )
                                                ),
                                                'meliscore_tool_phpunit_content' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_phpunit_content',
                                                        'name' => 'PHPUnit Content',
                                                        'melisKey' => 'meliscore_tool_phpunit_content',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'MelisPhpUnitTool',
                                                        'action' => 'render-phpunit-content',
                                                        'jscallback' => '',
                                                        'jsdatas' => array()
                                                    ),
                                                ),
                                            )
                                        ),
                                        // End PhpUnit
                                        // MODULE MANAGEMENT
                                        'meliscore_tool_user_module_management' => array(
                                            'conf' => array(
                                                'id' => 'id_meliscore_tool_user_module_management',
                                                'name' => 'tr_meliscore_module_management_modules',
                                                'melisKey' => 'meliscore_tool_user_module_management',
                                                'icon' => 'fa-puzzle-piece',
                                                'rights_checkbox_disable' => true,
                                                'follow_regular_rendering' => false,
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCore',
                                                'controller' => 'Modules',
                                                'action' => 'render-tool-modules',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                            'interface' => array(
                                                'meliscore_tool_user_module_management_header' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_user_module_management_header',
                                                        'name' => 'tr_meliscore_module_management_header',
                                                        'melisKey' => 'meliscore_tool_user_module_management_header',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'Modules',
                                                        'action' => 'render-tool-modules-header',
                                                        'jscallback' => '',
                                                        'jsdatas' => array()
                                                    ),
                                                ),
                                                'meliscore_tool_user_module_management_content' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_user_module_management_content',
                                                        'name' => 'tr_meliscore_module_management_content',
                                                        'melisKey' => 'meliscore_tool_user_module_management_content',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'Modules',
                                                        'action' => 'render-tool-modules-content',
                                                        'jscallback' => 'setOnOff();',
                                                        'jsdatas' => array()
                                                    ),
                                                ),
                                            ), // end module management
                                        ),
                                        // END MODULE MANAGEMENT

                                        // PLATFORM TOOL
                                        'meliscore_tool_platform' => array(
                                            'conf' => array(
                                                'id' => 'id_meliscore_tool_platform',
                                                'name' => 'tr_meliscore_tool_platform_title',
                                                'melisKey' => 'meliscore_tool_platform',
                                                'icon' => 'fa-television',
                                                'rights_checkbox_disable' => true,
                                                'follow_regular_rendering' => false,
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCore',
                                                'controller' => 'Platforms',
                                                'action' => 'render-platform-container',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                            'interface' => array(
                                                'meliscore_tool_platform_header' => array(
                                                    'conf' => array(
                                                        'id' => 'meliscore_tool_platform_header',
                                                        'name' => 'tr_meliscore_tool_platform_header',
                                                        'melisKey' => 'meliscore_tool_platform_header',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'Platforms',
                                                        'action' => 'render-platform-header-container',
                                                        'jscallback' => '',
                                                        'jsdatas' => array()
                                                    ),
                                                    'interface' => array(
                                                        'meliscore_tool_platform_header_add' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_platform_header_add',
                                                                'name' => 'tr_meliscore_tool_platform_header_add',
                                                                'melisKey' => 'meliscore_tool_platform_header_add',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'Platforms',
                                                                'action' => 'render-platform-header-add',
                                                                'jscallback' => '',
                                                                'jsdatas' => array()
                                                            ),
                                                        ),
                                                    ),
                                                ),
                                                'meliscore_tool_platform_content' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_platform_content',
                                                        'name' => 'tr_meliscore_tool_platform_content',
                                                        'melisKey' => 'meliscore_tool_platform_content',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'Platforms',
                                                        'action' => 'render-platform-content',
                                                        'jscallback' => '',
                                                        'jsdatas' => array()
                                                    ),
                                                    'interface' => array(
                                                        'meliscore_tool_platform_generic_form' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_platform_generic_form',
                                                                'name' => 'tr_meliscore_tool_platform_generic_form',
                                                                'melisKey' => 'meliscore_tool_platform_generic_form',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'Platforms',
                                                                'action' => 'render-platform-generic-form',
                                                                'jscallback' => '',
                                                                'jsdatas' => array()
                                                            ),
                                                        )
                                                    ),
                                                ),
                                            ),
                                        ),
                                        // END PLASTFORM TOOL

                                        // LANGUAGE TOOL
                                        'meliscore_tool_language' => array(
                                            'conf' => array(
                                                'id' => 'id_meliscore_tool_language',
                                                'name' => 'tr_meliscore_tool_language',
                                                'melisKey' => 'meliscore_tool_language',
                                                'icon' => 'fa-language',
                                                'rights_checkbox_disable' => true,
                                                'follow_regular_rendering' => false,
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCore',
                                                'controller' => 'Language',
                                                'action' => 'render-tool-language-container',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                            'interface' => array(
                                                'meliscore_tool_language_header' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_language_header',
                                                        'name' => 'tr_meliscore_tool_language_header',
                                                        'melisKey' => 'meliscore_tool_language_header',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'Language',
                                                        'action' => 'render-tool-language-header',
                                                        'jscallback' => '',
                                                        'jsdatas' => array()
                                                    ),
                                                    'interface' => array(
                                                        'meliscore_tool_language_header_add' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_language_header_add',
                                                                'name' => 'tr_meliscore_tool_language_new',
                                                                'melisKey' => 'meliscore_tool_language_header_add',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'Language',
                                                                'action' => 'render-tool-language-header-add',
                                                                'jscallback' => '',
                                                                'jsdatas' => array()
                                                            ),
                                                        ),
                                                    ),
                                                ),

                                                'meliscore_tool_language_content' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_language_content',
                                                        'name' => 'tr_meliscore_tool_language_content',
                                                        'melisKey' => 'meliscore_tool_language_content',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'Language',
                                                        'action' => 'render-tool-language-content',
                                                        'jscallback' => '',
                                                        'jsdatas' => array()
                                                    ),
                                                ),

                                                'meliscore_tool_language_modal' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_language_modal',
                                                        'name' => 'tr_meliscore_tool_language_modal',
                                                        'melisKey' => 'meliscore_tool_language_modal',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'Language',
                                                        'action' => 'render-tool-language-modal',
                                                        'jscallback' => '',
                                                        'jsdatas' => array()
                                                    ),
                                                    'interface' => array(
                                                        'meliscore_tool_language_modal_handler_add' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_language_modal',
                                                                'name' => 'tr_meliscore_tool_language_modal',
                                                                'melisKey' => 'meliscore_tool_language_modal',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'Language',
                                                                'action' => 'render-tool-language-modal-add-handler',
                                                                'jscallback' => '',
                                                                'jsdatas' => array()
                                                            ),
                                                        ),
                                                    ),
                                                ),
                                            ),
                                        ),
                                        // END LANGUAGE TOOL
                                        // BO EMAILS MANAGEMENT
                                        'meliscore_tool_emails_mngt' => array(
                                            'conf' => array(
                                                'id' => 'id_meliscore_tool_emails_mngt',
                                                'name' => 'tr_meliscore_tool_emails_mngt',
                                                'melisKey' => 'meliscore_tool_emails_mngt',
                                                'icon' => 'fa-envelope-o',
                                                'rights_checkbox_disable' => true,
                                                'follow_regular_rendering' => false,
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCore',
                                                'controller' => 'EmailsManagement',
                                                'action' => 'render-tool-emails-mngt-container',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                            'interface' => array(
                                                'meliscore_tool_emails_mngt_header' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_emails_mngt_header',
                                                        'name' => 'tr_meliscore_tool_emails_mngt',
                                                        'melisKey' => 'meliscore_tool_emails_mngt_header',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'EmailsManagement',
                                                        'action' => 'render-tool-emails-mngt-header',
                                                        'jscallback' => '',
                                                        'jsdatas' => array()
                                                    ),
                                                    'interface' => array(
                                                        'meliscore_tool_emails_mngt_header_btn_add' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_emails_mngt_header_btn_add',
                                                                'name' => 'tr_meliscore_tool_emails_mngt_header_btn_add',
                                                                'melisKey' => 'meliscore_tool_emails_mngt_header_btn_add',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'EmailsManagement',
                                                                'action' => 'render-tool-emails-mngt-header-btn-add',
                                                                'jscallback' => '',
                                                                'jsdatas' => array()
                                                            )
                                                        )
                                                    )
                                                ),
                                                'meliscore_tool_emails_mngt_content' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_emails_mngt_content',
                                                        'name' => 'tr_meliscore_tool_emails_mngt_content',
                                                        'melisKey' => 'meliscore_tool_emails_mngt_content',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'EmailsManagement',
                                                        'action' => 'render-tool-emails-mngt-content',
                                                        'jscallback' => '',
                                                        'jsdatas' => array()
                                                    ),
                                                    'interface' => array(
                                                        'meliscore_tool_emails_mngt_content_table' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_emails_mngt_content',
                                                                'name' => 'tr_meliscore_tool_emails_mngt_content_table',
                                                                'melisKey' => 'meliscore_tool_emails_mngt_content',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'EmailsManagement',
                                                                'action' => 'render-tool-emails-mngt-content-table',
                                                                'jscallback' => '',
                                                                'jsdatas' => array()
                                                            ),
                                                        )
                                                    )
                                                ),
                                                /* Email Management Create and Edition */
                                                'meliscore_tool_emails_mngt_generic_from' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_emails_mngt_generic_from',
                                                        'name' => 'tr_meliscore_tool_emails_mngt_generic_from',
                                                        'melisKey' => 'meliscore_tool_emails_mngt_generic_from'
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'EmailsManagement',
                                                        'action' => 'render-emails-mngt',
                                                        'jscallback' => '',
                                                        'jsdatas' => array()
                                                    ),
                                                    'interface' => array(
                                                        'meliscore_tool_emails_mngt_generic_from_header' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_emails_mngt_generic_from_header',
                                                                'name' => 'tr_meliscore_tool_emails_mngt_generic_from_header',
                                                                'melisKey' => 'meliscore_tool_emails_mngt_generic_from_header'
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'EmailsManagement',
                                                                'action' => 'render-emails-mngt-header',
                                                                'jscallback' => '',
                                                                'jsdatas' => array()
                                                            ),
                                                            'interface' => array(
                                                                'meliscore_tool_emails_mngt_generic_from_header_save' => array(
                                                                    'conf' => array(
                                                                        'id' => 'id_meliscore_tool_emails_mngt_generic_from_header_save',
                                                                        'name' => 'tr_meliscore_tool_emails_mngt_generic_from_header_save',
                                                                        'melisKey' => 'meliscore_tool_emails_mngt_generic_from_header_save'
                                                                    ),
                                                                    'forward' => array(
                                                                        'module' => 'MelisCore',
                                                                        'controller' => 'EmailsManagement',
                                                                        'action' => 'render-emails-mngt-header-save',
                                                                        'jscallback' => '',
                                                                        'jsdatas' => array()
                                                                    ),
                                                                ),
                                                            )
                                                        ),
                                                        'meliscore_tool_emails_mngt_generic_from_content' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_emails_mngt_generic_from_content',
                                                                'name' => 'tr_meliscore_tool_emails_mngt_generic_from_content',
                                                                'melisKey' => 'meliscore_tool_emails_mngt_generic_from_content'
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'EmailsManagement',
                                                                'action' => 'render-emails-mngt-content',
                                                                'jscallback' => '',
                                                                'jsdatas' => array()
                                                            ),
                                                            'interface' => array(
                                                                'meliscore_tool_emails_mngt_generic_from_content_tab_nav' => array(
                                                                    'conf' => array(
                                                                        'id' => 'id_meliscore_tool_emails_mngt_generic_from_content_tab_nav',
                                                                        'name' => 'tr_meliscore_tool_emails_mngt_generic_from_content_tab_nav',
                                                                        'melisKey' => 'meliscore_tool_emails_mngt_generic_from_content_tab_nav'
                                                                    ),
                                                                    'forward' => array(
                                                                        'module' => 'MelisCore',
                                                                        'controller' => 'EmailsManagement',
                                                                        'action' => 'render-emails-mngt-content-lang-tab-nav',
                                                                        'jscallback' => '',
                                                                        'jsdatas' => array()
                                                                    ),
                                                                ),
                                                                'meliscore_tool_emails_mngt_generic_from_content_tab_content' => array(
                                                                    'conf' => array(
                                                                        'id' => 'id_meliscore_tool_emails_mngt_generic_from_content_tab_content',
                                                                        'name' => 'tr_meliscore_tool_emails_mngt_generic_from_content_tab_content',
                                                                        'melisKey' => 'meliscore_tool_emails_mngt_generic_from_content_tab_content'
                                                                    ),
                                                                    'forward' => array(
                                                                        'module' => 'MelisCore',
                                                                        'controller' => 'EmailsManagement',
                                                                        'action' => 'render-emails-mngt-content-lang-tab-content',
                                                                        'jscallback' => 'initEmailsEditors();',
                                                                        'jsdatas' => array()
                                                                    ),
                                                                )
                                                            )
                                                        )
                                                    )
                                                ),
                                            )
                                        ),
                                        // END BO EMAILS MANAGEMENT
                                        // LOGS TOOL
                                        'meliscore_logs_tool' => array(
                                            'conf' => array(
                                                'id' => 'id_meliscore_logs_tool',
                                                'name' => 'tr_meliscore_logs_tool',
                                                'melisKey' => 'meliscore_logs_tool',
                                                'icon' => 'fa-list',
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCore',
                                                'controller' => 'Log',
                                                'action' => 'render-logs-tool',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                            'interface' => array(
                                                'meliscore_logs_tool_header' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_logs_tool_header',
                                                        'name' => 'tr_meliscore_logs_tool_header',
                                                        'melisKey' => 'meliscore_logs_tool_header',
                                                        'rightsDisplay' => 'none',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'Log',
                                                        'action' => 'render-logs-tool-header',
                                                    ),
                                                ),
                                                'meliscore_logs_tool_content' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_logs_tool_content',
                                                        'name' => 'tr_meliscore_logs_tool_content',
                                                        'melisKey' => 'meliscore_logs_tool_content',
                                                        'rightsDisplay' => 'none',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'Log',
                                                        'action' => 'render-logs-tool-content',
                                                    ),
                                                    'interface' => array(
                                                        'meliscore_logs_tool_table' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_logs_tool_table',
                                                                'name' => 'tr_meliscore_logs_tool_table',
                                                                'melisKey' => 'meliscore_logs_tool_table',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'Log',
                                                                'action' => 'render-logs-tool-table',
                                                            ),
                                                            'interface' => array(
                                                                'meliscore_logs_tool_log_type_form' => array(
                                                                    'conf' => array(
                                                                        'id' => 'id_meliscore_logs_tool_log_type_form',
                                                                        'name' => 'tr_meliscore_logs_tool_log_type_form',
                                                                        'melisKey' => 'meliscore_logs_tool_log_type_form',
                                                                    ),
                                                                    'forward' => array(
                                                                        'module' => 'MelisCore',
                                                                        'controller' => 'Log',
                                                                        'action' => 'render-logs-tool-table-log-type-form',
                                                                    ),
                                                                )
                                                            )
                                                        ),
                                                    )
                                                ),
                                            ),
                                        ),
                                        // END LOGS TOOL
                                        'meliscore_tool_platform_scheme' => array(
                                            'conf' => array(
                                                'id' => 'id_meliscore_tool_platform_scheme_tool_content',
                                                'name' => 'tr_meliscore_platform_scheme',
                                                'melisKey' => 'meliscore_tool_platform_scheme',
                                                'icon' => 'fa fa-fw icon-paint-palette',
                                                'rights_checkbox_disable' => true,
                                            ),
                                            'datas' => array(
                                                // 3MB
                                                'image_size_limit' => '3145728',
                                                'allowed_file_extension' => 'jpeg,jpg,png,gif,svg,ico',
                                                'platform_scheme_dir' => '/media/platform-scheme/'
                                            ),
                                            'interface' => array(
                                                'meliscore_tool_platform_scheme_tool_content' => array(
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_platform_scheme_tool_content',
                                                        'name' => 'tr_meliscore_platform_color',
                                                        'melisKey' => 'meliscore_tool_platform_color_tool_content',
                                                        'icon' => 'fa fa-fw icon-paint-palette',
                                                        'rights_checkbox_disable' => false,
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'PlatformScheme',
                                                        'action' => 'tool-container',
                                                    )
                                                )
                                            )
                                        )
                                    ),
                                ),
                                'meliscore_tool_admin_section' => array(
                                    'conf' => array(
                                        'id' => 'id_meliscore_tool_admin_section',
                                        'name' => 'tr_meliscore_menu_toolstree_section_Admin',
                                        'icon' => 'fa-institution',
                                        'rights_checkbox_disable' => true,
                                    ),
                                    'interface' => array(
                                        'meliscore_tool_user' => array( // tool User Management
                                            'conf' => array(
                                                'id' => 'id_meliscore_tool_user',
                                                'name' => 'tr_meliscore_tool_user',
                                                'melisKey' => 'meliscore_tool_user',
                                                'icon' => 'fa-users',
                                                'rights_checkbox_disable' => true,
                                                'follow_regular_rendering' => false,
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCore',
                                                'controller' => 'ToolUser',
                                                'action' => 'render-tool-user',
                                                'jscallback' => '',
                                                'jsdatas' => array()
                                            ),
                                            'interface' => array(
                                                'meliscore_tool_user_header_buttons' => array( // tool header
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_user_header',
                                                        'name' => 'tr_meliscore_tool_gen_header',
                                                        'melisKey' => 'meliscore_tool_user_header',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'ToolUser',
                                                        'action' => 'render-tool-user-header',
                                                        'jscallback' => '',
                                                        'jsdatas' => array(),
                                                    ),
                                                    'interface' => array(
                                                        'meliscore_tool_user_action_new_user' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_user_action_new_user',
                                                                'name' => 'tr_meliscore_tool_gen_new',
                                                                'melisKey' => 'meliscore_tool_user_action_new_user',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'ToolUser',
                                                                'action' => 'render-tool-user-action-new-user',
                                                                'jscallback' => '',
                                                                'jsdatas' => array(),
                                                            ),
                                                        ),
                                                    ),
                                                ), // end tool header
                                                'meliscore_tool_user_contents' => array( // tool content
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_user_contents',
                                                        'name' => 'tr_meliscore_tool_gen_content',
                                                        'melisKey' => 'meliscore_tool_user_contents',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'ToolUser',
                                                        'action' => 'render-tool-user-content',
                                                        'jscallback' => '',
                                                        'jsdatas' => array(),
                                                    ),
                                                    'interface' => array(
                                                        'meliscore_tool_user_contents_action_edit' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_user_contents_action_edit',
                                                                'name' => 'tr_meliscore_tool_gen_edit',
                                                                'melisKey' => 'meliscore_tool_user_contents_action_edit',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'ToolUser',
                                                                'action' => 'render-tool-user-content-action-edit',
                                                                'jscallback' => '',
                                                                'jsdatas' => array(),
                                                            ),
                                                        ),
                                                        'meliscore_tool_user_contents_action_delete' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_user_contents_action_delete',
                                                                'name' => 'tr_meliscore_tool_gen_delete',
                                                                'melisKey' => 'meliscore_tool_user_contents_action_delete',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'ToolUser',
                                                                'action' => 'render-tool-user-content-action-delete',
                                                                'jscallback' => '',
                                                                'jsdatas' => array(),
                                                            ),
                                                        ),
                                                    ),
                                                ), // end tool content

                                                'meliscore_tool_user_content_modal' =>  array( // too modal
                                                    'conf' => array(
                                                        'id' => 'id_meliscore_tool_user_content_modal',
                                                        'name' => 'tr_meliscore_tool_gen_modal',
                                                        'melisKey' => 'meliscore_tool_user_content_modal',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'ToolUser',
                                                        'action' => 'render-tool-user-modal-container',
                                                        'jscallback' => '',
                                                        'jsdatas' => array(),
                                                    ),
                                                    'interface' => array(
                                                        'meliscore_tool_user_new_modal_handler' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_user_new_modal_handler',
                                                                'name' => 'tr_meliscore_tool_gen_new',
                                                                'melisKey' => 'meliscore_tool_user_new_modal_handler',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'ToolUser',
                                                                'action' => 'render-tool-user-modal-handler-new',
                                                                'jscallback' => '',
                                                                'jsdatas' => array(),
                                                            ),
                                                        ),
                                                        'meliscore_tool_user_edit_modal_handler' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_user_edit_modal_handler',
                                                                'name' => 'tr_meliscore_tool_gen_edit',
                                                                'melisKey' => 'meliscore_tool_user_edit_modal_handler',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'ToolUser',
                                                                'action' => 'render-tool-user-modal-handler-edit',
                                                                'jscallback' => '',
                                                                'jsdatas' => array(),
                                                            ),
                                                        ),
                                                        'meliscore_tool_user_rights_modal_handler' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_user_rights_modal_handler',
                                                                'name' => 'tr_meliscore_tool_user_modal_rights',
                                                                'melisKey' => 'meliscore_tool_user_rights_modal_handler',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'ToolUser',
                                                                'action' => 'render-tool-user-modal-handler-rights',
                                                                'jscallback' => '',
                                                                'jsdatas' => array(),
                                                            ),
                                                        ),
                                                        'meliscore_tool_user_new_rights_modal_handler' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_user_new_rights_modal_handler',
                                                                'name' => 'tr_meliscore_tool_user_modal_new_rights',
                                                                'melisKey' => 'meliscore_tool_user_new_rights_modal_handler',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'ToolUser',
                                                                'action' => 'render-tool-user-modal-handler-new-rights',
                                                                'jscallback' => '',
                                                                'jsdatas' => array(),
                                                            ),
                                                        ),
                                                        'meliscore_tool_user_view_date_connection_handler' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_user_view_date_connection_handler',
                                                                'name' => 'tr_meliscore_tool_user_view_date_connection_handler',
                                                                'melisKey' => 'meliscore_tool_user_view_date_connection_handler',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'ToolUser',
                                                                'action' => 'render-tool-user-view-date-connection-modal-handler',
                                                                'jscallback' => '',
                                                                'jsdatas' => array(),
                                                            ),
                                                        ),
                                                        'meliscore_tool_user_microservice_modal_handler' => array(
                                                            'conf' => array(
                                                                'id' => 'id_meliscore_tool_user_microservice_handler',
                                                                'name' => 'tr_meliscore_microservice_modal',
                                                                'melisKey' => 'meliscore_tool_user_microservice_handler',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'MelisCoreMicroService',
                                                                'action' => 'render-tool-user-view-micro-service-modal-handler',
                                                                'jscallback' => 'setOnOff();',
                                                                'jsdatas' => array(),
                                                            ),
                                                        ),
                                                    ), // end modal interface
                                                ), // end tool modal

                                            ), // end tool interface
                                        ), // end user management tool
                                    ),
                                ),
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
                        'meliscore_center_dashboard' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_center_dashboard',
                                'name' => 'tr_meliscore_center_Dashboard',
                                'melisKey' => 'meliscore_center_dashboard',
                                'icon' => 'fa-tachometer',
                                'type' => '/meliscore_dashboard'
                            ),
                        ),
                    )
                ),
            )
        ),
        'meliscore_dashboard' => array(
            'conf' => array(
                'id' => 'id_meliscore_center_dashboard',
                'name' => 'tr_meliscore_center_Melis Dashboard',
                'melisKey' => 'meliscore_center_dashboard',
                'icon' => 'fa-tachometer'
            ),
            'forward' => array(
                'module' => 'MelisCore',
                'controller' => 'Dashboard',
                'action' => 'dashboard',
                'jscallback' => '',
                'jsdatas' => array()
            ),
            'interface' => array(
                'meliscore_dashboard_recent_activity' => array(
                    'conf' => array(
                        'id' => 'id_meliscore_dashboard_recent_activity',
                        'name' => 'tr_meliscore_dashboard_Recent Activity',
                        'melisKey' => 'meliscore_dashboard_recent_activity',
                        'width' => 6,
                        'height' => 'dashboard-medium',
                    ),
                    'forward' => array(
                        'module' => 'MelisCore',
                        'controller' => 'Dashboard',
                        'action' => 'recentActivity',
                        'jscallback' => '',
                        'jsdatas' => array()
                    ),
                    'interface' => array(
                        'meliscore_dashboard_recent_activity_users' => array(
                            'conf' => array(
                                'id' => 'id_meliscore_dashboard_recent_activity_users',
                                'name' => 'tr_meliscore_dashboard_recent_activity_Users',
                                'melisKey' => 'meliscore_dashboard_recent_activity_users',
                                'icon' => 'parents',
                                'maxLines' => 8,
                            ),
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Dashboard',
                                'action' => 'recentActivityUsers',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                        ),
                    ),
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
        'microservice' => array(
            'conf' => array(
                'rightsDisplay' => 'none',
            ),
        )
    )
);