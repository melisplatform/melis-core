<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use MelisCore\Controller\DashboardPlugins\MelisCoreDashboardTemplatingPlugin;

class MelisCoreDashboardDragDropZonePlugin extends MelisCoreDashboardTemplatingPlugin
{
    public function __construct()
    {
        $this->pluginName = 'MelisCoreDashboardDragDropZonePlugin';
        $this->pluginModule = 'meliscore';
    }
    
    public function modelVars()
    {
        $pluginManager = $this->getServiceLocator()->get('ControllerPluginManager');
        $viewRender = $this->getServiceLocator()->get('ViewRenderer');
        $plugins = $this->getDashboardPlugins();
        
        $html = '';
        $jsCallBacks = array();
        
        foreach ($plugins As $key => $val)
        {
            foreach ($val['d_content']->plugin As $xKey => $xVal)
            {
                /**
                 *  CHECKING IF THE PLUGIN IS ACCESSABLE OR MODULE IS ACTIVATED
                 */
                $plugin = $pluginManager->get((string)$xVal->attributes()->name);
                $pluginModel = $plugin->render(
                    array(
                        'dashboard_id' => $this->pluginConfig['dashboard_id'],
                        'plugin_id' => (string)$xVal->attributes()->plugin_id
                    )
                );
                $html .= $viewRender->render($pluginModel);
            }
        }
        
        $data = array(
            'htmlPlugins' => $html,
            'dashboardId' => $this->pluginConfig['dashboard_id'],
        );
        
        return $data;
    }
    
    public function getDashboardPlugins()
    {
        $plugins = array();
        
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $userAuthDatas =  $melisCoreAuth->getStorage()->read();
        $userId = (int) $userAuthDatas->usr_id;
        
        $dashboardId = $this->pluginConfig['dashboard_id'];
        
        if (!empty($dashboardId))
        {
            $dashboardPluginsTbl = $this->getServiceLocator()->get('MelisCoreDashboardsTable');
            $plugins = $dashboardPluginsTbl->getDashboardPlugins($dashboardId, $userId)->toArray();
            
            foreach ($plugins As $key => $val)
            {
                if (!empty($val['d_content']))
                {
                    $plugins[$key]['d_content'] = simplexml_load_string($val['d_content']);
                }
            }
        }
        
        return $plugins;
    }
    
    public function savePlugin($plugins)
    {
        // Dashboard Type
        // Dashboard Id
        // Plugin Params to xml
    }
    
    public function removePlugin()
    {
        // Dashboard Type
        // Dashboard Id
    }
}