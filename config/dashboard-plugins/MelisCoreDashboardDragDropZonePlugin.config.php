<?php 
    return array(
        'plugins' => array(
            'meliscore' => array(
                'ressources' => array(
                    'css' => array(
                        // Gridstack
                        '/MelisCore/assets/components/plugins/gridstack/css/gridstack.min.css',
                    ),
                    'js' => array(
                        // Gridstack
                        '/MelisCore/assets/components/plugins/gridstack/js/lodash.min.js',
                        '/MelisCore/assets/components/plugins/gridstack/js/gridstack.js',
                        '/MelisCore/assets/components/plugins/gridstack/js/gridstack.jQueryUI.js',
                        
                        '/MelisCore/js/core/gridstack.init.js',
                    )
                ),
                'dashboard_plugins' => array(
                    'MelisCoreDashboardDragDropZonePlugin' => array(
                        'skip_plugin_container' => true,
                        'dashboard_id' => 'dragdropzone',
                        'interface' => array(
                            'meliscore_dashboard_drag_drop_zone' => array(
                                'forward' => array(
                                    'module' => 'MelisCore',
                                    'plugin' => 'MelisCoreDashboardDragDropZonePlugin',
                                    'function' => 'dragdropzone',
                                ),
                            ),
                        )
                    )
                )
            )
        ),
    );