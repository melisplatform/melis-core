<?php
return array(
    'plugins' => array(
        'meliscore' => array(
            'ressources' => array(
                'css' => array(),
                'js' => array(
                    '/MelisCore/plugins/js/MelisCoreDashboardBubbleNotificationsPlugin.js'
                )
            ),
            'interface' => [
                'melis_dashboardplugin' => [
                    'interface' => [
                        'melisdashboardplugin_section' => array(
                            'interface' => array(
                                'MelisCoreDashboardBubbleNotificationsPlugin' => array(
                                    'conf' => [
                                        'name' => 'MelisCoreDashboardBubbleNotificationsPlugin',
                                        'melisKey' => 'MelisCoreDashboardBubbleNotificationsPlugin'
                                    ],
                                    'datas' => [
                                        'is_bubble_plugin' => true,
                                        'skip_plugin_container' => true,
                                        'dashboard_id' => '',
                                        'name' => 'bubblenotificationsplugin',
                                        'jscallback' => 'MelisCoreDashboardBubbleNotificationsPlugin.init()'
                                    ],
                                    'forward' => array(
                                        'module' => 'MelisCore',
                                        'plugin' => 'MelisCoreDashboardBubbleNotificationsPlugin',
                                        'function' => 'notifications',
                                    ),
                                ),
                            ),
                        )
                    ],
                ],
            ],
        )
    ),
);