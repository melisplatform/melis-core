<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use MelisCore\Controller\DashboardPlugins\MelisCoreDashboardTemplatingPlugin;
use Zend\View\Model\ViewModel;

class MelisCoreDashboardDragDropZonePlugin extends MelisCoreDashboardTemplatingPlugin
{
    public function __construct()
    {
        $this->pluginModule = 'meliscore';
        parent::__construct();
    }
    
    /**
     * Render Dashboard plugin to Drag and Drop Zone
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function dragdropzone()
    {
        $view = new ViewModel();
        $view->setTemplate('melis-core/dashboard-plugin/dragdropzone');
        
        $pluginManager = $this->getServiceLocator()->get('ControllerPluginManager');
        $viewRender = $this->getServiceLocator()->get('ViewRenderer');
        $plugins = $this->getDashboardPlugins();
        
        $activePlugins = $this->getActivePlugins();
        
        $html = '';
        
        if (!empty($plugins['plugins']))
        {
            foreach ($plugins['plugins']->plugin As $xKey => $xVal)
            {
                $pluginName = (string)$xVal->attributes()->plugin;
                
                // Checking if the plugin is active 
                if (in_array($pluginName, $activePlugins))
                {
                    $plugin = $pluginManager->get($pluginName);
                    $pluginModel = $plugin->render(
                        array(
                            'dashboard_id' => $this->pluginConfig['dashboard_id'],
                            'plugin_id' => (string)$xVal->attributes()->plugin_id
                        )
                    );
                    
                    // Concatinating plugin view after redering to html
                    $html .= $viewRender->render($pluginModel);
                }
            }
        }
        
        $data = array(
            'htmlPlugins' => $html,
            'dashboardId' => $this->pluginConfig['dashboard_id'],
        );
        
        $view->setVariables($data);
        
        return $view;
    }
    
    /**
     * Getting active plugins saved from User Dashboard plugins
     * 
     * @return SimpleXMLElement[]
     */
    private function getDashboardPlugins()
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
    
    /**
     * This method saving the dashboard plugin in Drag and drop zone
     */
    public function savePlugins($plugins)
    {
        $success = 0;
        
        if (!empty($plugins['dashboard_id']))
        {
            $pluginXml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<Plugins>%s'."\n".'</Plugins>';
            $pluginXmlData = '';
            
            if (!empty($plugins['plugins']))
            {
                
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
                            /**
                             * Adding custom xml data from plugin 
                             */
                            $pluginXmlData .= $plugin->savePluginConfigToXml($config);
                            $pluginXmlData .= '</plugin>';
                        }
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
            
            /**
             * Saving dashboard plugins to database
             */
            $res = $dashboardPluginsTbl->save($pluginDashboard, $pluginDashboardId);
            
            if ($res)
            {
                $success = 1;
            }
        }
        
        return $success;
    }
    
    /**
     * Returns active plugins based on module activation
     * 
     * @return array
     */
    private function getActivePlugins()
    {
        $activePlugins = array();
        
        $config = $this->getServiceLocator()->get('config');
        
        foreach ($config['plugins'] As $module)
        {
            if (!empty($module['dashboard_plugins']))
            {
                foreach ($module['dashboard_plugins'] As $pluginName => $config)
                {
                    array_push($activePlugins, $pluginName);
                }
            }
        }
        
        return $activePlugins;
    }
}