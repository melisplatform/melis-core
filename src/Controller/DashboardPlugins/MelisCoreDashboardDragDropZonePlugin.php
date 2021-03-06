<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use MelisCore\Controller\DashboardPlugins\MelisCoreDashboardTemplatingPlugin;
use Laminas\View\Model\ViewModel;

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
     * @return \Laminas\View\Model\ViewModel
     */
    public function dragdropzone()
    {
        $data = [];
        $view = new ViewModel();
        $view->setTemplate('melis-core/dashboard-plugin/dragdropzone');
        
        $pluginManager = $this->getServiceManager()->get('ControllerPluginManager');
        $viewRender = $this->getServiceManager()->get('ViewRenderer');
        $plugins = $this->getDashboardPlugins();

        $activePlugins = $this->getActivePlugins();
        $html = '';

        if(!empty($this->pluginConfig)) {
            if (!empty($plugins['plugins'])) {
                foreach ($plugins['plugins']->plugin As $xKey => $xVal) {
                    $pluginName = (string)$xVal->attributes()->plugin;

                    // Checking if the plugin is active
                    if (in_array($pluginName, $activePlugins)) {
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
        }
        $view->setVariables($data);
        
        return $view;
    }
    
    /**
     * Getting active plugins s                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            aved from User Dashboard plugins
     * 
     * @return SimpleXMLElement[]
     */
    private function getDashboardPlugins()
    {
        $plugins = array();
        
        $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
        $userAuthDatas =  $melisCoreAuth->getStorage()->read();
        $userId = (int) $userAuthDatas->usr_id;
        if (!empty($this->pluginConfig['dashboard_id']))
        {
            $dashboardId = $this->pluginConfig['dashboard_id'];
            $dashboardPluginsTbl = $this->getServiceManager()->get('MelisCoreDashboardsTable');
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
                $pluginManager = $this->getServiceManager()->get('ControllerPluginManager');
                
                foreach ($plugins['plugins'] As $pluginName => $pluginIds)
                {
                    $plugin = $pluginManager->get($pluginName);
                    
                    if (!empty($pluginIds))
                    {
                        foreach ($pluginIds As $pluginId => $config)
                        {
                            $xAxis = $config['x-axis'] ?? 0;
                            $yAxis = $config['y-axis'] ?? 0;
                            $height = $config['height'] ?? 6;
                            $width = $config['width'] ?? 6;

                            $pluginXmlData .= "\n".'<plugin plugin="'.$pluginName.'" plugin_id="'.$pluginId.'">'."\n";
                            $pluginXmlData .= "\t".'<x-axis><![CDATA['.$xAxis.']]></x-axis>'."\n";
                            $pluginXmlData .= "\t".'<y-axis><![CDATA['.$yAxis.']]></y-axis>'."\n";
                            $pluginXmlData .= "\t".'<height><![CDATA['.$height.']]></height>'."\n";
                            $pluginXmlData .= "\t".'<width><![CDATA['.$width.']]></width>'."\n";
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
            
            $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
            $userAuthDatas =  $melisCoreAuth->getStorage()->read();
            $userId = (int) $userAuthDatas->usr_id;
            
            $dashboardPluginsTbl = $this->getServiceManager()->get('MelisCoreDashboardsTable');
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
        
        $config = $this->getServiceManager()->get('MelisCoreConfig');
        $dashboardPlugins = $config->getItem('/meliscore/interface/melis_dashboardplugin/interface/melisdashboardplugin_section');

        if (isset($dashboardPlugins['interface']) && count($dashboardPlugins['interface'])) {
            foreach ($dashboardPlugins['interface'] as $pluginName => $pluginConf) {
                array_push($activePlugins, $pluginName);
            }
        }
        return $activePlugins;
    }
}