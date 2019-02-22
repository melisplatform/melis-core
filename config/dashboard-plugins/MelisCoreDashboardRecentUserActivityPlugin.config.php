<?php 
return array(
    'plugins' => array(
        'meliscore' => array(
            'ressources' => array(
                'css' => array(
                ),
                'js' => array(
                )
            ),
            'interface' => [
                'melis_dashboardplugin' => [
                    'interface' => [
                        'melisdashboardplugin_section' => [
                            'interface' => [
                                'MelisCoreDashboardRecentUserActivityPlugin' => array(
                                    'conf' => [
                                        'name' => 'MelisCoreDashboardRecentUserActivityPlugin',
                                        'melisKey' => 'MelisCoreDashboardRecentUserActivityPlugin'
                                    ],
                                    'datas' => [
                                        'plugin_id' => 'RecentUserActivity',
                                        'name' => 'tr_meliscore_dashboard_Recent Activity',
                                        'description' => 'tr_meliscore_dashboard_Recent Activity description',
                                        'icon' => 'fa fa-users',
                                        'thumbnail' => '/MelisCore/plugins/images/MelisCoreDashboardRecentUserActivityPlugin.jpg',
                                        'jscallback' => '',
                                        'max_lines' => 8,
                                        'height' => 4,
                                        'width' => 6,
                                        'x-axis' => 0,
                                        'y-axis' => 0,
                                    ],
                                    'forward' => array(
                                        'module' => 'MelisCore',
                                        'plugin' => 'MelisCoreDashboardRecentUserActivityPlugin',
                                        'function' => 'recentActivityUsers',
                                        'jscallback' => '',
                                        'jsdatas' => array()
                                    ),
                                ),
                            ]
                        ]
                    ]
                ],
            ],
        ),
    ),
);