<?php

return [
    'plugins' => [
        'MelisCoreGdprAutoDelete' => [
            'conf' => [
                // user rights exclusions
                'rightsDisplay' => 'none',
            ],
            'tools' => [
                // <editor-fold desc="GDPR Auto delete config table">
               'melis_core_gdpr_auto_delete' => [
                   'table' => [
                       'target' => '#tableAutoDeleteListConfig',
                       'ajaxUrl' => '/melis/MelisCore/MelisCoreGdprAutoDelete/getGdprDeleteConfigData',
                       'dataFunction' => 'initGdprAutoDeleteConfigFilters',
                       'ajaxCallback' => '',
                       'filters' => [
                           'left' => [
                                'tool_limit_config' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'MelisCoreGdprAutoDelete',
                                    'action' => 'render-content-accordion-list-config-content-limit'
                                ],
                               'tool_site_filter' => [
                                   'module' => 'MelisCore',
                                   'controller' => 'MelisCoreGdprAutoDelete',
                                   'action' => 'render-content-accordion-list-config-content-site-filter'
                               ],
                               'tool_module_filter' => [
                                   'module' => 'MelisCore',
                                   'controller' => 'MelisCoreGdprAutoDelete',
                                   'action' => 'render-content-accordion-list-config-content-module-filter'
                               ]
                           ],
                           'center' => [
                               'table_search' => [
                                   'module' => 'MelisCore',
                                   'controller' => 'MelisCoreGdprAutoDelete',
                                   'action' => 'render-content-accordion-list-config-content-search'
                               ]
                           ],
                           'right' => [
                               'table_refresh_auto_delete_list' => [
                                   'module' => 'MelisCore',
                                   'controller' => 'MelisCoreGdprAutoDelete',
                                   'action' => 'render-content-accordion-list-config-content-refresh'
                               ]
                           ],
                       ],
                       'columns' => [
                           'mgdprc_id' => [
                               'text' => 'tr_melis_core_gdpr_autodelete_log_table_col_id',
                               'css' => ['width' => '5%', 'padding-right' => '0'],
                               'sortable' => true,
                           ],
                           'mgdprc_site_id' => [
                               'text' => 'Site',
                               'css' => ['width' => '15%', 'padding-right' => '0'],
                               'sortable' => true,
                           ],
                           'mgdprc_module_name' => [
                               'text' => 'tr_melis_core_gdpr_auto_delete_module',
                               'css' => ['width' => '15%', 'padding-right' => '0'],
                               'sortable' => true,
                           ],
                           'mgdprc_alert_email_status' => [
                               'text' => 'tr_melis_core_gdpr_autodelete_label_table_col_alert_1',
                               'css' => ['width' => '25%', 'padding-right' => '0'],
                               'sortable' => false,
                           ],
                           'mgdprc_alert_email_resend' => [
                               'text' => 'tr_melis_core_gdpr_autodelete_label_table_col_alert_2',
                               'css' => ['width' => '25%', 'padding-right' => '0'],
                               'sortable' => false,
                           ],
                           'mgdprc_delete_days' => [
                               'text' => 'tr_melis_core_gdpr_autodelete_label_table_col_delete_heading',
                               'css' => ['width' => '25%', 'padding-right' => '0'],
                               'sortable' => false,
                           ],
                       ],
                       // define what columns can be used in searching
                       'searchables' => ['mgdprc_id', 'mgdprc_module_name','mgdprc_site_id'],
                       'actionButtons' => [
                           'edit' => array(
                               'module' => 'MelisCore',
                               'controller' => 'MelisCoreGdprAutoDelete',
                               'action' => 'render-content-accordion-list-config-content-edit',
                           ),
                           'delete' => array(
                               'module' => 'MelisCore',
                               'controller' => 'MelisCoreGdprAutoDelete',
                               'action' => 'render-content-accordion-list-config-content-delete',
                           ),
                       ],
                   ]
               ],
                //</editor-fold>
                // <editor-fold desc="GDPR Auto delete logs table">
                'melis_core_gdpr_auto_delete_log' => [
                    'table' => [
                        'target' => '#tableGdprAutoDeleteLogs',
                        'ajaxUrl' => '/melis/MelisCore/MelisCoreGdprAutoDeleteTabs/getGdprDeleteEmailsLogs',
                        'dataFunction' => 'initGdprDeleteEmailsLogsFilters',
                        'ajaxCallback' => '',
                        'filters' => [
                            'left' => [
                                'tool_limit_config' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'MelisCoreGdprAutoDelete',
                                    'action' => 'render-content-accordion-list-config-content-limit'
                                ],
                            ],
                            'center' => [
                                'table_search_log' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'MelisCoreGdprAutoDelete',
                                    'action' => 'render-content-accordion-list-config-content-search'
                                ]
                            ],
                            'right' => [
                                'table_refresh' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'MelisCoreGdprAutoDeleteTabs',
                                    'action' => 'render-logs-table-refresh'
                                ]
                            ],
                        ],
                        'columns' => [
                            'mgdprl_id' => [
                                'text' => 'tr_melis_core_gdpr_autodelete_log_table_col_id',
                                'css' => ['width' => '5%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'mgdprl_log_date' => [
                                'text' => 'tr_melis_core_gdpr_autodelete_log_table_col_log_date',
                                'css' => ['width' => '15%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'mgdprl_warning1_ok' => [
                                'text' => 'tr_melis_core_gdpr_autodelete_log_table_col_warning1_ok',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'mgdprl_warning1_ko' => [
                                'text' => 'tr_melis_core_gdpr_autodelete_log_table_col_warning1_ko',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'mgdprl_warning2_ok' => [
                                'text' => 'tr_melis_core_gdpr_autodelete_log_table_col_warning2_ok',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'mgdprl_warning2_ko' => [
                                'text' => 'tr_melis_core_gdpr_autodelete_log_table_col_warning2_ko',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'mgdprl_delete_ok' => [
                                'text' => 'tr_melis_core_gdpr_autodelete_log_table_col_delete_ok',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'mgdprl_delete_ko' => [
                                'text' => 'tr_melis_core_gdpr_autodelete_log_table_col_delete_ko',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                        ],
                        // define what columns can be used in searching
                        'searchables' => [
                            'mgdprl_id',
                            'mgdprl_log_date',
                            'mgdprl_warning1_ko',
                            'mgdprl_warning1_ko',
                            'mgdprl_warning2_ok',
                            'mgdprl_warning2_ko',
                            'mgdprl_delete_ok',
                            'mgdprl_delete_ko',
                        ],
                        'actionButtons' => [
                            'show_details' => array(
                                'module' => 'MelisCore',
                                'controller' => 'MelisCoreGdprAutoDeleteTabs',
                                'action' => 'render-logs-table-show-details',
                            ),
                        ],
                    ]
                ]
                //</editor-fold>
            ]
        ]
    ]
];
