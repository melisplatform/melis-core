<?php
return [
// meliscore/interface/meliscore_leftmenu/interface/meliscore_toolstree/interface
    'plugins' => [
        'meliscore' => [
            'interface' => [
                'meliscore_leftmenu' => [
                    'interface' => [
                        'meliscore_toolstree_section' => [
                            'conf' => [
                                'id' => 'meliscore_toolstree_section',
                                'melisKey' => 'meliscore_toolstree_section',
                                'name' => 'MelisCore',
                                'icon' => '',
                                'rights_checkbox_disable' => false,
                            ],
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'TreeTools',
                                'action' => 'render-tree-tools',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                            'interface' => [
                                'meliscore_tool_system_config' => array(
                                    'conf' => array(
                                        'id' => 'id_meliscore_tool_system_config',
                                        'name' => 'tr_meliscore_system_configuration',
                                        'icon' => 'fa-sliders',
                                        'rights_checkbox_disable' => true,
                                        'melisKey' => 'meliscore_tool_system_config'

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
                                                'category' => 'cms'
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
                                        'melisKey' => 'meliscore_tool_admin_section',
                                        'category' => 'core',
                                    ),
                                    'interface' => array(
                                        // tool GDPR start
                                        'melis_core_gdpr' => array(
                                            'conf' => array(
                                                'id' => 'id_melis_core_gdpr',
                                                'name' => 'tr_melis_core_gdpr',
                                                'melisKey' => 'melis_core_gdpr',
                                                'icon' => 'fa-lock',
                                                'rights_checkbox_disable' => true,
                                                'follow_regular_rendering' => false,
                                            ),
                                            'forward' => array(
                                                'module' => 'MelisCore',
                                                'controller' => 'MelisCoreGdpr',
                                                'action' => 'renderMelisCoreGdprContainer',
                                                'jscallback' => '',
                                            ),
                                            'interface' => array(
                                                'melis_core_gdpr_gdpr_header' => array(
                                                    'conf' => array(
                                                        'id' => 'id_melis_core_gdpr_gdpr_header',
                                                        'melisKey' => 'melis_core_gdpr_gdpr_header',
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'MelisCoreGdpr',
                                                        'action' => 'renderMelisCoreGdprHeader',
                                                        'jscallback' => '',
                                                    ),
                                                ),
                                                'melis_core_gdpr_content' => array(
                                                    'conf' => array(
                                                        'id' => 'id_melis_core_gdpr_content',
                                                        'melisKey' => 'melis_core_gdpr_content'
                                                    ),
                                                    'forward' => array(
                                                        'module' => 'MelisCore',
                                                        'controller' => 'MelisCoreGdpr',
                                                        'action' => 'renderMelisCoreGdprContent',
                                                        'jscallback' => '',
                                                    ),
                                                    'interface' => array(
                                                        'melis_core_gdpr_gdpr_search_form' => array(
                                                            'conf' => array(
                                                                'id' => 'id_melis_core_gdpr_gdpr_search_form',
                                                                'melisKey' => 'melis_core_gdpr_gdpr_search_form',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'MelisCoreGdpr',
                                                                'action' => 'renderMelisCoreGdprSearchForm',
                                                                'jscallback' => '',
                                                            ),
                                                        ),
                                                        'melis_core_gdpr_content_tabs' => array(
                                                            'conf' => array(
                                                                'id' => 'id_melis_core_gdpr_content_tabs',
                                                                'melisKey' => 'melis_core_gdpr_content_tabs',
                                                            ),
                                                            'forward' => array(
                                                                'module' => 'MelisCore',
                                                                'controller' => 'MelisCoreGdpr',
                                                                'action' => 'renderMelisCoreGdprTabs',
                                                                'jscallback' => '',
                                                            ),
                                                        ),
                                                    ),
                                                ),
                                            ),
                                        ),// end of GDPR
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

                                                'meliscore_tool_user_content_modal' => array( // too modal
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
                            ]
                        ],
                        'meliscms_toolstree_section' => [
                            'conf' => [
                                'id' => 'meliscms_toolstree_section',
                                'melisKey' => 'meliscms_toolstree_section',
                                'name' => 'MelisCms',
                                'icon' => '',
                                'rights_checkbox_disable' => false,
                            ],
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'TreeTools',
                                'action' => 'render-tree-tools',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                            'interface' => []
                        ],
                        'melismarketing_toolstree_section' => [
                            'conf' => [
                                'id' => 'melismarketing_toolstree_section',
                                'melisKey' => 'melismarketing_toolstree_section',
                                'name' => 'MelisMarketing',
                                'icon' => '',
                                'rights_checkbox_disable' => false,
                            ],
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'TreeTools',
                                'action' => 'render-tree-tools',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                            'interface' => []
                        ],
                        'meliscommerce_toolstree_section' => [
                            'conf' => [
                                'id' => 'meliscommerce_toolstree_section',
                                'melisKey' => 'meliscommerce_toolstree_section',
                                'name' => 'MelisCommerce',
                                'icon' => '',
                                'rights_checkbox_disable' => false,
                            ],
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'TreeTools',
                                'action' => 'render-tree-tools',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                            'interface' => []
                        ],
                        'melisothers_toolstree_section' => [
                            'conf' => [
                                'id' => 'melisothers_toolstree_section',
                                'melisKey' => 'melisothers_toolstree_section',
                                'name' => 'Others',
                                'icon' => '',
                                'rights_checkbox_disable' => false,
                            ],
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'TreeTools',
                                'action' => 'render-tree-tools',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                            'interface' => []
                        ],
                        'meliscustom_toolstree_section' => [
                            'conf' => [
                                'id' => 'meliscustom_toolstree_section',
                                'melisKey' => 'meliscustom_toolstree_section',
                                'name' => 'Custom / Projects',
                                'icon' => '',
                                'rights_checkbox_disable' => false,
                            ],
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'TreeTools',
                                'action' => 'render-tree-tools',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                            'interface' => []
                        ],
                        'melismarketplace_toolstree_section' => [
                            'forward' => array(
                                'module' => 'MelisCore',
                                'controller' => 'TreeTools',
                                'action' => 'render-tree-tools',
                                'jscallback' => '',
                                'jsdatas' => array()
                            ),
                            'interface' => []
                        ],
                        'melisdashboardplugin_section' => [
                            'conf' => [
                                'id' => 'melisdashboardplugin_section',
                                'melisKey' => 'melisdashboardplugin_section',
                                'name' => 'tr_melisdashboardplugin_section',
                                'icon' => 'fa fa-shopping-cart',
                                'rights_checkbox_disable' => false,
                            ],
                            'interface' => []
                        ]
                    ]
                ]
            ]
        ]
    ]
];
