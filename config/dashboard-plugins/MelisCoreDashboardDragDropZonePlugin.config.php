<?php 
return array(
    'plugins' => array(
        'meliscore' => array(
            'ressources' => array(
                'css' => array(
                    // Gridstack
                    '/MelisCore/assets/components/plugins/gridstack/css/gridstack.css',

                    // display notify / page walkthrough
                    '/MelisCore/assets/components/plugins/enjoyhint/css/enjoyhint.css'
                ),
                'js' => array(
                    // Gridstack
                    '/MelisCore/assets/components/plugins/gridstack/js/lodash.min.js',
                    '/MelisCore/assets/components/library/jquery-ui-touch/jquery.ui.touch-punch.min.js',
                    '/MelisCore/assets/components/plugins/gridstack/js/gridstack.js',
                    '/MelisCore/assets/components/plugins/gridstack/js/gridstack.jQueryUI.js',

                    // display notify / page walkthrough
                    '/MelisCore/assets/components/plugins/enjoyhint/js/enjoyhint.js',

                    '/MelisCore/js/core/gridstack.init.js',

                    // page walkthrough
                    '/MelisCore/js/core/dashboard-notify.js'
                )
            ),
            'interface' => [
                'melis_dashboardplugin' => [
                    'interface' => [
                        'melisdashboardplugin_section' => array(
                            'interface' => array(
                                'MelisCoreDashboardDragDropZonePlugin' => array(
                                    'conf' => [
                                        'name' => 'MelisCoreDashboardDragDropZonePlugin',
                                        'melisKey' => 'MelisCoreDashboardDragDropZonePlugin'
                                    ],
                                    'datas' => [
                                        'skip_plugin_container' => true,
                                        'dashboard_id' => 'dragdropzone',
                                        'name' => 'dragdropzone',
                                    ],
                                    'forward' => array(
                                        'module' => 'MelisCore',
                                        'plugin' => 'MelisCoreDashboardDragDropZonePlugin',
                                        'function' => 'dragdropzone',
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