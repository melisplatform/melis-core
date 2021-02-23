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
                                        'jscallback' => 'MelisCoreDashboardBubbleNewsMelisPlugin.init()',
                                        'url' => 'https://www.melistechnology.com/melis/api/hVrGO7mB9fhkTGfC/MelisCmsNews/service/MelisCmsNewsService/getNewsList',
                                        'filter' => [
                                            'status' => true,
                                            'langId' => 1,
                                            'dateMin' => '',
                                            'dateMax' => '',
                                            'publishDateMin' => '',
                                            'publishDateMax' => '',
                                            'unpublishFilter' => true,
                                            'start' => 0,
                                            'limit' => '',
                                            'orderColumn' => 'cnews_publish_date',
                                            'order' => 'DESC',
                                            'siteId' => 2,
                                            'search' => ''
                                        ]
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