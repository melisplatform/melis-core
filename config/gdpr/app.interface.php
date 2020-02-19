<?php

return [
    'plugins' => [
        'meliscore' => [
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
                                                                                ]
                                                                            ]
                                                                        ]
                                                                        // </editor-fold>
                                                                    ]
                                                                ]
                                                                // </editor-fold>
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