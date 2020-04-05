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
                               'text' => 'Id',
                               'css' => ['width' => '5%', 'padding-right' => '0'],
                               'sortable' => true,
                           ],
                           'mgdprc_site_id' => [
                               'text' => 'Site',
                               'css' => ['width' => '15%', 'padding-right' => '0'],
                               'sortable' => false,
                           ],
                           'mgdprc_module_name' => [
                               'text' => 'Module',
                               'css' => ['width' => '15%', 'padding-right' => '0'],
                               'sortable' => false,
                           ],
                           'mgdprc_alert_email_status' => [
                               'text' => 'Warning 1',
                               'css' => ['width' => '25%', 'padding-right' => '0'],
                               'sortable' => false,
                           ],
                           'mgdprc_alert_email_resend' => [
                               'text' => 'Warning 2',
                               'css' => ['width' => '25%', 'padding-right' => '0'],
                               'sortable' => false,
                           ],
                           'mgdprc_delete_days' => [
                               'text' => 'Delete',
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
                                'text' => 'Id',
                                'css' => ['width' => '5%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'mgdprl_log_date' => [
                                'text' => 'Date',
                                'css' => ['width' => '15%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'mgdprl_warning1_ok' => [
                                'text' => 'W1 OK',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'mgdprl_warning1_ko' => [
                                'text' => 'WI KO',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'mgdprl_warning2_ok' => [
                                'text' => 'w2 OK',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'mgdprl_warning2_ko' => [
                                'text' => 'w2 KO',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'mgdprl_delete_ok' => [
                                'text' => 'Del OK',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'mgdprl_delete_ko' => [
                                'text' => 'Del KO',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                        ],
                        // define what columns can be used in searching
                        'searchables' => [
                            'mgdprl_id',
                            'mgdpr_log_date',
                            'mgdprl_warning1_ko',
                            'mgdprl_warning1_ko',
                            'mgdprl_warning2_ok',
                            'mgdprl_warning2_ko',
                            'mgdpr_delete_ok',
                            'mgdpr_delete_ko',
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