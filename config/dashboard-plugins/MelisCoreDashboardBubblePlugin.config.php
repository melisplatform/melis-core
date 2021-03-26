<?php
return [
    'plugins' => [
        'meliscore' => [
            'ressources' => [
                'css' => [

                ],
                'js' => [
                    '/MelisCore/plugins/js/MelisCoreDashboardBubblePlugin.js'
                ],
            ],
            'interface' => [
                'melis_dashboardplugin' => [
                    'interface' => [
                        'melisdashboardplugin_section' => [
                            'interface' => [
                                'MelisCoreDashboardBubblePlugin' => [
                                    'conf' => [
                                        'name' => 'MelisCoreDashboardBubblePlugin',
                                        'melisKey' => 'MelisCoreDashboardBubblePlugin'
                                    ],
                                    'datas' => [
                                        'is_bubble_plugin' => true,
                                        'skip_plugin_container' => true,
                                        'dashboard_id' => '',
                                        'name' => 'bubbleplugin',
                                        'plugins' => [
                                            'MelisCoreDashboardBubbleNewsMelisPlugin',
                                            'MelisCoreDashboardBubbleUpdatesPlugin',
                                            'MelisCoreDashboardBubbleNotificationsPlugin',
                                            'MelisCoreDashboardBubbleChatPlugin'
                                        ],
                                        'jscallback' => 'MelisCoreDashboardBubblePlugin.init()',
                                    ],
                                    'forward' => [
                                        'module' => 'MelisCore',
                                        'plugin' => 'MelisCoreDashboardBubblePlugin',
                                        'function' => 'bubblepluginszone'
                                    ],
                                ]
                            ]
                        ]
                    ]
                ]
            ],
        ],
    ],
];