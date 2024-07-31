<?php 
    return array(
        'plugins' => array(
            'meliscore' => [
                'ressources' => [
                    'css' => [],
                    'js' => []
                ],
                'interface' => [
                    'melis_dashboardplugin' => array(
                        'interface' => [
                            'melisdashboardplugin_section' => [
                                'interface' => [
                                    'MelisCoreDashboardAnnouncementPlugin' => [
                                        'conf' => [
                                            'name' => 'MelisCoreDashboardAnnouncementPlugin',
                                            'melisKey' => 'MelisCoreDashboardAnnouncementPlugin'
                                        ],
                                        'datas' => [
                                            'exclude_rights_display' => true,//exclude this plugin from displaying in the rights(tree)
                                            'plugin_id' => 'AnnouncementPlugin',
                                            'plugin' => 'MelisCoreDashboardAnnouncementPlugin',
                                            'name' => 'tr_melis_core_announcement_plugin_title',
                                            'description' => 'tr_melis_core_announcement_plugin_description',
                                            'icon' => 'fa fa-sitemap',
                                            'thumbnail' => '/MelisCore/plugins/images/MelisCoreDashboardAnnouncementPlugin.png',
                                            'jscallback' => '',
                                            'max_lines' => 8,
                                            'height' => 6,
                                            'width' => 6,
                                            'x-axis' => 0,
                                            'y-axis' => 0,
                                        ],
                                        'forward' => [
                                            'module' => 'MelisCore',
                                            'plugin' => 'MelisCoreDashboardAnnouncementPlugin',
                                            'function' => 'getAnnouncements',
                                            'jscallback' => '',
                                            'jsdatas' => []
                                        ],
                                    ],
                                ]
                            ]
                        ],
                    ),
                ],
            ],
        ),
    );
