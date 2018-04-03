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
        
        if (!empty($plugins['plugins']))
        {
            foreach ($plugins['plugins']->plugin As $xKey => $xVal)
            {
                /**
                 *  CHECKING IF THE PLUGIN IS ACCESSABLE OR MODULE IS ACTIVATED
                 */
                $plugin = $pluginManager->get((string)$xVal->attributes()->plugin);
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
            $plugin = $dashboardPluginsTbl->getDashboardPlugins($dashboardId, $userId)->current();
            
            if (!empty($plugin->d_content))
            {
                $plugins['plugins'] = simplexml_load_string($plugin->d_content);
            }
        }
        
        return $plugins;
    }
    
    public function savePlugins($plugins)
    {
        $success = 0;
        
        if (!empty($plugins['dashboard_id']))
        {
            if (!empty($plugins['plugins']))
            {
                $pluginXml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<Plugins>%s'."\n".'</Plugins>';
                $pluginXmlData = '';
                
                $pluginManager = $this->getServiceLocator()->get('ControllerPluginManager');
                
                foreach ($plugins['plugins'] As $pluginName => $pluginIds)
                {
                    $plugin = $pluginManager->get($pluginName);
                    
                    if (!empty($pluginIds))
                    {
                        foreach ($pluginIds As $pluginId => $config)
                        {
                            $pluginXmlData .= "\n".'<plugin plugin="'.$pluginName.'" plugin_id="'.$pluginId.'">'."\n";
                            $pluginXmlData .= "\t".'<x-axis><![CDATA['.$config['x-axis'].']]></x-axis>'."\n";
                            $pluginXmlData .= "\t".'<y-axis><![CDATA['.$config['y-axis'].']]></y-axis>'."\n";
                            $pluginXmlData .= "\t".'<height><![CDATA['.$config['height'].']]></height>'."\n";
                            $pluginXmlData .= "\t".'<width><![CDATA['.$config['width'].']]></width>'."\n";
                            $pluginXmlData .= $plugin->savePluginConfigToXml($config);
                            $pluginXmlData .= '</plugin>';
                        }
                    }
                }
                
                $pluginXml = sprintf($pluginXml, $pluginXmlData);
                
                $pluginDashboardId = null;
                
                $dashboardId = $plugins['dashboard_id'];
                
                $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
                $userAuthDatas =  $melisCoreAuth->getStorage()->read();
                $userId = (int) $userAuthDatas->usr_id;
                
                $dashboardPluginsTbl = $this->getServiceLocator()->get('MelisCoreDashboardsTable');
                $pluginDbData = $dashboardPluginsTbl->getDashboardPlugins($dashboardId, $userId)->current();
                
                if (!empty($pluginDbData))
                {
                    $pluginDashboardId = $pluginDbData->d_id;
                }
                
                $pluginDashboard = array(
                    'd_dashboard_id' => $dashboardId,
                    'd_user_id' => $userId,
                    'd_content' => $pluginXml,
                );
                
                $res = $dashboardPluginsTbl->save($pluginDashboard, $pluginDashboardId);
                
                if ($res)
                {
                    $success = 1;
                }
            }
        }
        
        return $success;
    }
}