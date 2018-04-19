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
                'dashboard_plugins' => array(
                    'MelisCoreDashboardRecentUserActivityPlugin' => array(
                        'template_path' => 'melis-core/dashboard-plugin/recent-user-activity',
                        'plugin_id' => 'RecentUserActivity',
                        'name' => 'tr_meliscore_dashboard_Recent Activity',
                        'description' => 'tr_meliscore_dashboard_Recent Activity description',
                        'icon' => 'fa fa-users',
                        'thumbnail' => '',
                        'jscallback' => 'console.log("James")',
                        
                        'interface' => array(
                            'meliscore_dashboard_recent_activity_users' => array(
                                'conf' => array(
                                    'id' => 'id_meliscore_dashboard_recent_activity_users',
                                    'name' => 'tr_meliscore_dashboard_recent_activity_Users',
                                    'melisKey' => 'meliscore_dashboard_recent_activity_users',
                                ),
                                'forward' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Dashboard',
                                    'action' => 'recentActivityUsers',
                                    'jscallback' => 'console.log("Bryan")',
                                    'jsdatas' => array()
                                ),
                            ),
                        )
                    )
                ),
                
            )
        ),
        'controller_plugins' => array(
            'invokables' => array(
                'MelisCoreDashboardRecentUserActivityPlugin' => 'MelisCore\Controller\DashboardPlugins\MelisCoreDashboardRecentUserActivityPlugin',
            )
        ),
        'view_manager' => array(
            'template_map' => array(
                'melis-core/dashboard-plugin/recent-user-activity'  => __DIR__ . '/../../view/melis-core/dashboard-plugins/recent-user-activity.phtml',
            ),
        ),
    );