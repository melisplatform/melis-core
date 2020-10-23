<?php
return array(
    'plugins' => array(
        'meliscore' => array(
            'ressources' => array(
                'css' => array(),
                'js' => array(
                    '/MelisCore/plugins/js/MelisCoreDashboardBubbleNewsMelisPlugin.js'
                )
            ),
            'interface' => [
                'melis_dashboardplugin' => [
                    'interface' => [
                        'melisdashboardplugin_section' => array(
                            'interface' => array(
                                'MelisCoreDashboardBubbleNewsMelisPlugin' => array(
                                    'conf' => [
                                        'name' => 'MelisCoreDashboardBubbleNewsMelisPlugin',
                                        'melisKey' => 'MelisCoreDashboardBubbleNewsMelisPlugin'
                                    ],
                                    'datas' => [
                                        'is_bubble_plugin' => true,
                                        'skip_plugin_container' => true,
                                        'dashboard_id' => '',
                                        'name' => 'bubblenewsmelisplugin',
                                        'jscallback' => 'MelisCoreDashboardBubbleNewsMelisPlugin.init()'
                                    ],
                                    'forward' => array(
                                        'module' => 'MelisCore',
                                        'plugin' => 'MelisCoreDashboardBubbleNewsMelisPlugin',
                                        'function' => 'newsmelis',
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