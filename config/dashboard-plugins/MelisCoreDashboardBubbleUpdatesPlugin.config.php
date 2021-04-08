<?php
return array(
    'plugins' => array(
        'meliscore' => array(
            'ressources' => array(
                'css' => array(),
                'js' => array(
                    '/MelisCore/plugins/js/MelisCoreDashboardBubbleUpdatesPlugin.js'
                )
            ),
            'interface' => [
                'melis_dashboardplugin' => [
                    'interface' => [
                        'melisdashboardplugin_section' => array(
                            'interface' => array(
                                'MelisCoreDashboardBubbleUpdatesPlugin' => array(
                                    'conf' => [
                                        'name' => 'MelisCoreDashboardBubbleUpdatesPlugin',
                                        'melisKey' => 'MelisCoreDashboardBubbleUpdatesPlugin'
                                    ],
                                    'datas' => [
                                        'is_bubble_plugin' => true,
                                        'skip_plugin_container' => true,
                                        'dashboard_id' => '',
                                        'name' => 'bubbleupdatesplugin',
                                        'jscallback' => 'MelisCoreDashboardBubbleUpdatesPlugin.init()',
                                    ],
                                    'forward' => array(
                                        'module' => 'MelisCore',
                                        'plugin' => 'MelisCoreDashboardBubbleUpdatesPlugin',
                                        'function' => 'updates',
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