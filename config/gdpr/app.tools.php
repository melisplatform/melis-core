<?php

return [
    'plugins' => [
        'MelisCoreGdprAutoDelete' => [
            'conf' => [
                // user rights exclusions
                'rightsDisplay' => 'none',
            ],
            'tools' => [
               'melis_core_gdpr_auto_delete' => [
                   'table' => [
                       'target' => '#tableAutoDeleteListConfig',
                       'ajaxUrl' => '/melis/MelisCore/MelisCoreGdprAutoDelete/getGdprDeleteConfigData',
                       'dataFunction' => '',
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
               ]
            ]
        ]
    ]
];