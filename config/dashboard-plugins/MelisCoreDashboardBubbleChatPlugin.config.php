<?php
return array(
    'plugins' => array(
        'meliscore' => array(
            'ressources' => array(
                'css' => array(),
                'js' => array(
                    '/MelisCore/plugins/js/MelisCoreDashboardBubbleChatPlugin.js'
                )
            ),
            'interface' => [
                'melis_dashboardplugin' => [
                    'interface' => [
                        'melisdashboardplugin_section' => array(
                            'interface' => array(
                                'MelisCoreDashboardBubbleChatPlugin' => array(
                                    'conf' => [
                                        'name' => 'MelisCoreDashboardBubbleChatPlugin',
                                        'melisKey' => 'MelisCoreDashboardBubbleChatPlugin'
                                    ],
                                    'datas' => [
                                        'is_bubble_plugin' => true,
                                        'skip_plugin_container' => true,
                                        'dashboard_id' => '',
                                        'name' => 'bubblechatplugin',
                                        'jscallback' => 'MelisCoreDashboardBubbleChatPlugin.init()'
                                    ],
                                    'forward' => array(
                                        'module' => 'MelisCore',
                                        'plugin' => 'MelisCoreDashboardBubbleChatPlugin',
                                        'function' => 'chat',
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