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
                    'MelisDashboardDragDropZonePlugin' => array(
                        'template_path' => 'melis-core/dashboard-plugin/dragdropzone',
                        'plugin_container' => true,
                        'dashboard_id' => '',
                    )
                )
            )
        ),
        'controller_plugins' => array(
            'invokables' => array(
                'MelisDashboardDragDropZonePlugin' => 'MelisCore\Controller\DashboardPlugins\MelisDashboardDragDropZonePlugin',
            )
        ),
        'view_helpers' => array(
            'factories' => array(
                'MelisDashboardDragDropZone' => 'MelisCore\View\Helper\Factory\MelisDashboardDragDropZonePluginFactory',
            ),
        ),
        'view_manager' => array(
            'template_map' => array(
                'melis-core/dashboard-plugin/dragdropzone'          => __DIR__ . '/../../view/melis-core/dashboard-plugins/dragdropzone.phtml',
                'melis-core/dashboard-plugin/plugin-container'      => __DIR__ . '/../../view/melis-core/dashboard-plugins/plugin-container.phtml',
                'melis-core/dashboard-plugin/no-template'           => __DIR__ . '/../../view/melis-core/dashboard-plugins/no-template.phtml',
            ),
        ),
    );