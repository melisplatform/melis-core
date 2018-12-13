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
                    'meliscore_leftmenu' => [
                        'interface' => [
                            'melisdashboardplugin_section' => [
                                'interface' => [

                                    'MelisCoreDashboardRecentUserActivityPlugin' => array(
                                        'plugin_id' => 'RecentUserActivity',
                                        'name' => 'tr_meliscore_dashboard_Recent Activity',
                                        'description' => 'tr_meliscore_dashboard_Recent Activity description',
                                        'icon' => 'fa fa-users',
                                        'thumbnail' => '/MelisCore/plugins/images/MelisCoreDashboardRecentUserActivityPlugin.jpg',
                                        'jscallback' => '',
                                        'max_lines' => 8,
                                        'height' => 4,

                                        'interface' => array(
                                            'meliscore_dashboard_recent_activity_users' => array(
                                                'forward' => array(
                                                    'module' => 'MelisCore',
                                                    'plugin' => 'MelisCoreDashboardRecentUserActivityPlugin',
                                                    'function' => 'recentActivityUsers',
                                                    'jscallback' => '',
                                                    'jsdatas' => array()
                                                ),
                                            ),
                                        )
                                    )

                                ]
                            ]
                        ]
                    ]
                ]
            )
        ),
    );