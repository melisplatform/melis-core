<?php

return [
    'plugins' => [
        'meliscore' => [
            'ressources' => [
                'css' => [
                    // GDPR Auto delete css
                    '/MelisCore/css/gdpr-autodelete.css'
                ],
                'js' => [
                    // GDPR Auto delete js
                    '/MelisCore/js/tools/gdpr-autodelete.js',
                    '/MelisCore/js/tools/gdpr-autodelete-smtp.js'
                ]
            ],
            'interface' => [
                'meliscore_leftmenu' => [
                    'interface' => [
                        'meliscore_toolstree_section' => [
                            'interface' => [
                                'meliscore_tool_admin_section' => [
                                    'interface' => [
                                        'melis_core_gdpr' => [
                                            'interface' => [
                                                'melis_core_gdpr_tabs' => [
                                                    'interface' => [
                                                        // in order to stay the position of banner area
                                                        'melis_cms_gdpr_banner' => [],
                                                        // <editor-fold desc="GDPR Auto delete">
                                                        'meliscoregdpr_auto_delete' => [
                                                            'conf' => [
                                                                'id' => 'id_meliscoregdpr_auto_delete',
                                                                'name' => 'Auto Delete',
                                                                'melisKey' => 'meliscoregdpr_auto_delete',
                                                                'icon' => 'server_minus',
                                                            ],
                                                            'forward' => [
                                                                'module' => 'MelisCore',
                                                                'controller' => 'MelisCoreGdprAutoDelete',
                                                                'action' => 'render-content-container',
                                                                'jscallback' => '',
                                                                'jsdatas' => [],
                                                            ],
                                                            'interface' => [
                                                                // <editor-fold desc="GDPR Auto delete main content">
                                                                'meliscoregdpr_auto_delete_content' => [
                                                                    'conf' => [
                                                                        'id' => 'id_meliscoregdpr_auto_delete_content',
                                                                        'name' => 'Content',
                                                                        'melisKey' => 'meliscoregdpr_auto_delete_content',
                                                                    ],
                                                                    'forward' => [
                                                                        'module' => 'MelisCore',
                                                                        'controller' => 'MelisCoreGdprAutoDelete',
                                                                        'action' => 'render-content',
                                                                        'jscallback' => '',
                                                                        'jsdatas' => [],
                                                                    ],
                                                                    'interface' => [
                                                                        // <editor-fold desc="GDPR Auto delete main content accordion">
                                                                        'meliscoregdpr_auto_delete_content_accordions' => [
                                                                            'conf' => [
                                                                                'id' => 'id_meliscoregdpr_auto_delete_content',
                                                                                'name' => 'Content',
                                                                                'melisKey' => 'meliscoregdpr_auto_delete_content',
                                                                            ],
                                                                            'forward' => [
                                                                                'module' => 'MelisCore',
                                                                                'controller' => 'MelisCoreGdprAutoDelete',
                                                                                'action' => 'render-content-accordions',
                                                                                'jscallback' => '',
                                                                                'jsdatas' => [],
                                                                            ],
                                                                            'interface' => [
                                                                                'meliscoregdpr_auto_delete_content_accordion_list_config_modal' => [
                                                                                    'conf' => [
                                                                                        'id' => 'id_meliscoregdpr_auto_delete_content_accordion_list_config_modal',
                                                                                        'name' => 'How to activate automatic mail sending',
                                                                                        'melisKey' => 'meliscoregdpr_auto_delete_content_accordion_list_config_modal',
                                                                                    ],
                                                                                    'forward' => [
                                                                                        'module' => 'MelisCore',
                                                                                        'controller' => 'MelisCoreGdprAutoDelete',
                                                                                        'action' => 'render-content-modal',
                                                                                        'jscallback' => '',
                                                                                        'jsdatas' => [],
                                                                                    ],
                                                                                ],
                                                                                'meliscoregdpr_auto_delete_content_accordion_list_config' => [
                                                                                    'conf' => [
                                                                                        'id' => 'id_meliscoregdpr_auto_delete_content_accordion_list_config',
                                                                                        'name' => 'List of auto delete configuration',
                                                                                        'melisKey' => 'meliscoregdpr_auto_delete_content_accordion_list_config',
                                                                                    ],
                                                                                    'forward' => [
                                                                                        'module' => 'MelisCore',
                                                                                        'controller' => 'MelisCoreGdprAutoDelete',
                                                                                        'action' => 'render-content-accordion-list-config',
                                                                                        'jscallback' => '',
                                                                                        'jsdatas' => [],
                                                                                    ],
                                                                                    'interface' => [
                                                                                        'meliscoregdpr_auto_delete_content_accordion_list_config_header' => [
                                                                                            'conf' => [
                                                                                                'id' => 'id_meliscoregdpr_auto_delete_content_accordion_list_config_header',
                                                                                                'name' => 'Header',
                                                                                                'melisKey' => 'meliscoregdpr_auto_delete_content_accordion_list_config_header',
                                                                                            ],
                                                                                            'forward' => [
                                                                                                'module' => 'MelisCore',
                                                                                                'controller' => 'MelisCoreGdprAutoDelete',
                                                                                                'action' => 'render-content-accordion-list-config-header',
                                                                                                'jscallback' => '',
                                                                                                'jsdatas' => [],
                                                                                            ],
                                                                                        ],
                                                                                        'meliscoregdpr_auto_delete_content_accordion_list_config_content' => [
                                                                                            'conf' => [
                                                                                                'id' => 'id_meliscoregdpr_auto_delete_content_accordion_list_config_content',
                                                                                                'name' => 'Content',
                                                                                                'melisKey' => 'meliscoregdpr_auto_delete_content_accordion_list_config_content',
                                                                                            ],
                                                                                            'forward' => [
                                                                                                'module' => 'MelisCore',
                                                                                                'controller' => 'MelisCoreGdprAutoDelete',
                                                                                                'action' => 'render-content-accordion-list-config-content',
                                                                                                'jscallback' => '',
                                                                                                'jsdatas' => [],
                                                                                            ],
                                                                                        ]

                                                                                    ]
                                                                                ],
                                                                                'meliscoregdpr_auto_delete_content_accordion_add_edit_config' => [
                                                                                    'conf' => [
                                                                                        'id' => 'id_meliscoregdpr_auto_delete_content_accordion_add_edit_config',
                                                                                        'name' => 'Add / Edit auto delete congi',
                                                                                        'melisKey' => 'meliscoregdpr_auto_delete_content_accordion_add_edit_config',
                                                                                    ],
                                                                                    'forward' => [
                                                                                        'module' => 'MelisCore',
                                                                                        'controller' => 'MelisCoreGdprAutoDelete',
                                                                                        'action' => 'render-content-accordion-add-edit-config',
                                                                                        'jscallback' => '',
                                                                                        'jsdatas' => [],
                                                                                    ],
                                                                                    'interface' => [
                                                                                        'meliscoregdpr_auto_delete_content_accordion_add_edit_config_header' => [
                                                                                            'conf' => [
                                                                                                'id' => 'id_meliscoregdpr_auto_delete_content_accordion_add_edit_config_header',
                                                                                                'name' => 'Add / Edit auto delete config header',
                                                                                                'melisKey' => 'meliscoregdpr_auto_delete_content_accordion_add_edit_config_header',
                                                                                            ],
                                                                                            'forward' => [
                                                                                                'module' => 'MelisCore',
                                                                                                'controller' => 'MelisCoreGdprAutoDelete',
                                                                                                'action' => 'render-content-accordion-add-edit-config-header',
                                                                                                'jscallback' => '',
                                                                                                'jsdatas' => [],
                                                                                            ],
                                                                                        ],
                                                                                        'meliscoregdpr_auto_delete_content_accordion_add_edit_config_content' => [
                                                                                            'conf' => [
                                                                                                'id' => 'id_meliscoregdpr_auto_delete_content_accordion_add_edit_config_content',
                                                                                                'name' => 'Add / Edit auto delete config content',
                                                                                                'melisKey' => 'meliscoregdpr_auto_delete_content_accordion_add_edit_config_content',
                                                                                            ],
                                                                                            'forward' => [
                                                                                                'module' => 'MelisCore',
                                                                                                'controller' => 'MelisCoreGdprAutoDelete',
                                                                                                'action' => 'render-content-accordion-add-edit-config-content',
                                                                                                'jscallback' => '',
                                                                                                'jsdatas' => [],
                                                                                            ],
                                                                                            'interface' => [
                                                                                                'meliscoregdpr_auto_delete_add_edit_config_filters' => [
                                                                                                    'conf' => [
                                                                                                        'id' => 'id_meliscoregdpr_auto_delete_add_edit_config_filters',
                                                                                                        'name' => 'Site and Module Filters',
                                                                                                        'melisKey' => 'meliscoregdpr_auto_delete_add_edit_config_filters',
                                                                                                    ],
                                                                                                    'forward' => [
                                                                                                        'module' => 'MelisCore',
                                                                                                        'controller' => 'MelisCoreGdprAutoDelete',
                                                                                                        'action' => 'render-content-accordion-add-edit-config-filters',
                                                                                                        'jscallback' => '',
                                                                                                        'jsdatas' => [],
                                                                                                    ],
                                                                                                ],
                                                                                                'meliscoregdpr_auto_delete_add_edit_config_multi_tab' => [
                                                                                                    'conf' => [
                                                                                                        'id' => 'id_meliscoregdpr_auto_delete_add_edit_config_multi_tab',
                                                                                                        'name' => 'Add / Edit Multi Tabs ',
                                                                                                        'melisKey' => 'meliscoregdpr_auto_delete_add_edit_config_multi_tab',
                                                                                                    ],
                                                                                                    'forward' => [
                                                                                                        'module' => 'MelisCore',
                                                                                                        'controller' => 'MelisCoreGdprAutoDeleteTabs',
                                                                                                        'action' => 'render-content-add-edit-tabs-handler',
                                                                                                        'jscallback' => '',
                                                                                                        'jsdatas' => [],
                                                                                                    ],
                                                                                                    'interface' => [
                                                                                                        'meliscoregdpr_auto_delete_add_edit_config_tab_config' => [
                                                                                                            'conf' => [
                                                                                                                'id' => 'id_meliscoregdpr_auto_delete_add_edit_config_tab_config',
                                                                                                                'name' => 'Configuration',
                                                                                                                'melisKey' => 'meliscoregdpr_auto_delete_add_edit_config_tab_config',
                                                                                                            ],
                                                                                                            'forward' => [
                                                                                                                'module' => 'MelisCore',
                                                                                                                'controller' => 'MelisCoreGdprAutoDeleteTabs',
                                                                                                                'action' => 'render-config-tab',
                                                                                                                'jscallback' => '',
                                                                                                                'jsdatas' => [],
                                                                                                            ],
                                                                                                            'interface' => [
                                                                                                                'meliscoregdpr_auto_delete_add_edit_config_tab_config_header' => [
                                                                                                                    'conf' => [
                                                                                                                        'id' => 'id_meliscoregdpr_auto_delete_add_edit_config_tab_config',
                                                                                                                        'name' => 'Configuration',
                                                                                                                        'melisKey' => 'meliscoregdpr_auto_delete_add_edit_config_tab_config',
                                                                                                                    ],
                                                                                                                    'forward' => [
                                                                                                                        'module' => 'MelisCore',
                                                                                                                        'controller' => 'MelisCoreGdprAutoDeleteTabs',
                                                                                                                        'action' => 'render-config-tab',
                                                                                                                        'jscallback' => '',
                                                                                                                        'jsdatas' => [],
                                                                                                                    ],
                                                                                                                ]
                                                                                                            ]
                                                                                                        ],
                                                                                                        'meliscoregdpr_auto_delete_add_edit_config_tab_alert_emails' => [
                                                                                                            'conf' => [
                                                                                                                'id' => 'id_meliscoregdpr_auto_delete_add_edit_config_tab_alert_emails',
                                                                                                                'name' => 'Alert Emails',
                                                                                                                'melisKey' => 'meliscoregdpr_auto_delete_add_edit_config_tab_alert_emails',
                                                                                                            ],
                                                                                                            'forward' => [
                                                                                                                'module' => 'MelisCore',
                                                                                                                'controller' => 'MelisCoreGdprAutoDeleteTabs',
                                                                                                                'action' => 'render-alert-email-tab',
                                                                                                                'jscallback' => '',
                                                                                                                'jsdatas' => [],
                                                                                                            ],
                                                                                                        ],
                                                                                                        'meliscoregdpr_auto_delete_add_edit_config_tab_logs' => [
                                                                                                            'conf' => [
                                                                                                                'id' => 'id_meliscoregdpr_auto_delete_add_edit_config_tab_logs',
                                                                                                                'name' => 'Logs',
                                                                                                                'melisKey' => 'meliscoregdpr_auto_delete_add_edit_config_tab_logs',
                                                                                                                'icon' => 'fa-list-alt'
                                                                                                            ],
                                                                                                            'forward' => [
                                                                                                                'module' => 'MelisCore',
                                                                                                                'controller' => 'MelisCoreGdprAutoDeleteTabs',
                                                                                                                'action' => 'render-logs-tab',
                                                                                                                'jscallback' => '',
                                                                                                                'jsdatas' => [],
                                                                                                            ],
                                                                                                        ]
                                                                                                    ]
                                                                                                ]
                                                                                            ]
                                                                                        ]
                                                                                    ]
                                                                                ]
                                                                            ]
                                                                        ]// </editor-fold>
                                                                    ]
                                                                ]// </editor-fold>
                                                            ]
                                                        ], // </editor-fold>
                                                        // <editor-fold desc="GDPR Auto delete SMTP config">
                                                        'meliscoregdpr_auto_delete_smtp_container' => [
                                                            'conf' => [
                                                                'id' => 'id_meliscoregdpr_auto_delete_smtp_container',
                                                                'name' => 'SMTP',
                                                                'melisKey' => 'meliscoregdpr_auto_delete_smtp_container',
                                                                'icon' => 'server',
                                                            ],
                                                            'forward' => [
                                                                'module' => 'MelisCore',
                                                                'controller' => 'MelisCoreGdprAutoDeleteSmtp',
                                                                'action' => 'render-content-container',
                                                                'jscallback' => '',
                                                                'jsdatas' => [],
                                                            ],
                                                            'interface' => [
                                                                'meliscoregdpr_auto_delete_smtp_content' => [
                                                                    'conf' => [
                                                                        'id' => 'id_meliscoregdpr_auto_delete_smtp_content',
                                                                        'name' => 'SMTP content',
                                                                        'melisKey' => 'meliscoregdpr_auto_delete_smtp_content',
                                                                    ],
                                                                    'forward' => [
                                                                        'module' => 'MelisCore',
                                                                        'controller' => 'MelisCoreGdprAutoDeleteSmtp',
                                                                        'action' => 'render-content',
                                                                        'jscallback' => '',
                                                                        'jsdatas' => [],
                                                                    ],
                                                                ]
                                                            ]
                                                        ]
                                                        // </editor-fold>
                                                    ]
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]
];