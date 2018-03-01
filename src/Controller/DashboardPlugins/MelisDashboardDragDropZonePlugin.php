<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use MelisCore\Controller\DashboardPlugins\MelisDashboardTemplatingPlugin;

class MelisDashboardDragDropZonePlugin extends MelisDashboardTemplatingPlugin
{
    public function __construct($updatesPluginConfig = array())
    {
        $this->pluginName = 'MelisDashboardDragDropZonePlugin';
        $this->pluginModule = 'meliscore';
        parent::__construct($updatesPluginConfig);
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
                $pluginModel = $plugin->render();
                $html .= $viewRender->render($pluginModel);
            }
        }
        
        $this->getServiceLocator()->get('config');
        
        $data = array(
            'htmlPlugins' => $html,
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