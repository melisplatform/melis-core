<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use MelisCore\Service\MelisCoreDashboardPluginsRightsService;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;

/**
 * This class handles the request from AJAX call in 
 * generating plugin and saving Dashboard plugins
 */
class DashboardPluginsController extends AbstractActionController
{
    /**
     * Render Dashboard Menu
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function dashboardMenuAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $plugins = [];
        /** @var \MelisCore\Service\MelisCoreConfigService $config */
        $config = $this->getServiceLocator()->get('MelisCoreConfig');

        /** @var \MelisCore\Service\MelisCoreDashboardPluginsRightsService $dashboardPluginsService */
        $dashboardPluginsService = $this->getServiceLocator()->get('MelisCoreDashboardPluginsService');

        $dashboardPlugins = $config->getItem('/meliscore/interface/melis_dashboardplugin/interface/melisdashboardplugin_section');
        if (isset($dashboardPlugins['interface']) && count($dashboardPlugins['interface'])) {
            foreach ($dashboardPlugins['interface'] as $pluginName => $pluginConf) {
                $plugin = $pluginConf;

                $path = $pluginConf['conf']['type'] ?? null;

                if ($path) {
                    $plugin = $config->getItem($path);
                }

                if (is_array($plugin) && count($plugin) && $dashboardPluginsService->canAccess($pluginName)) {
                    if(!isset($plugin['datas']['skip_plugin_container'])) {
                        $module = $plugin['forward']['module'];
                        $isNewPlugin = $plugin['datas']['is_new_plugin'] = true;
                        $name = $plugin['datas']['name'];
                        $pluginRaw = json_encode($plugin);
                        $plugins[$module][$name] = [
                            'module' => $module,
                            'plugin' => $pluginName,
                            'name' => !empty($plugin['datas']['name']) ? $plugin['datas']['name'] : $pluginName,
                            'plugin_id' => !empty($plugin['datas']['plugin_id']) ? $plugin['datas']['plugin_id'] : '',
                            'x-axis' => !empty($plugin['datas']['x-axis']) ? $plugin['datas']['x-axis'] : '',
                            'y-axis' => !empty($plugin['datas']['y-axis']) ? $plugin['datas']['y-axis'] : '',
                            'width' => !empty($plugin['datas']['width']) ? $plugin['datas']['width'] : '',
                            'height' => !empty($plugin['datas']['height']) ? $plugin['datas']['height'] : '',
                            'description' => !empty($plugin['datas']['description']) ? $plugin['datas']['description'] : '',
                            'icon' => !empty($plugin['datas']['icon']) ? $plugin['datas']['icon'] : '',
                            'thumbnail' => !empty($plugin['datas']['thumbnail']) ? $plugin['datas']['thumbnail'] : '/MelisCore/plugins/images/default.jpg',
                            'is_new_plugin' => $isNewPlugin,
                            'pluginRaw' => $pluginRaw,
                        ];
                    }
                }

            }
        }
        $view = new ViewModel();
        $view->setVariable('plugins', $plugins);
        $view->melisKey = $melisKey;
        return $view;
    }
    
    /**
     * This render the Dashboard plugins Drag and Drop Zone
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderDashboardPluginsAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        // Dashboard ID
        $dashboardId = $this->params()->fromQuery('dashboardId', 'id_meliscore_toolstree_section_dashboard');
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->dashboardId = $dashboardId;
        return $view;
    }
    
    /**
     * This method used to generate Dashboard plugin 
     * requested from a forward() request
     * 
     * @return \Zend\View\Model\ViewModel;
     */
    public function generateDahsboardPluginAction()
    {
        $plugin = $this->params()->fromRoute('plugin');
        $function = $this->params()->fromRoute('function');
        
        try 
        {
            $pluginManager = $this->getServiceLocator()->get('ControllerPluginManager');
            $tmp = $pluginManager->get($plugin);
            return $tmp->$function(); 
        }
        catch (\Exception $e)
        {
            echo $e->getMessage();
        }
    }
    
    /**
     * This method handles the AJAX request to generate plugin
     * 
     * @return \Zend\View\Model\JsonModel
     */
    public function getPluginAction()
    {
        // return plugin view
        $request = $this->getRequest();
        $pluginConfigPost = get_object_vars($request->getPost());

        /**
         * decode the string
         */
        foreach($pluginConfigPost as $key => $value){
            if(!is_array($value)) {
                $tempValue = json_decode($value, true);
                if (is_array($tempValue)) {
                    $pluginConfigPost[$key] = $tempValue;
                }
            }
        }

        $pluginManager = $this->getServiceLocator()->get('ControllerPluginManager');
        $viewRender = $this->getServiceLocator()->get('ViewRenderer');

        $module = $pluginConfigPost['module'] ?? (!empty($pluginConfigPost['forward']['module'])) ? $pluginConfigPost['forward']['module'] : null;
        $pluginName = $pluginConfigPost['plugin'] ?? (!empty($pluginConfigPost['forward']['plugin'])) ? $pluginConfigPost['forward']['plugin'] : null;
        $newPlugin = (isset($pluginConfigPost['datas']['is_new_plugin'])) ? true : false;
        $plugin = $pluginManager->get($pluginName);
        $pluginModel = $plugin->render($pluginConfigPost, $newPlugin);

        $html = $viewRender->render($pluginModel);

        $jsCallBacks = array();
        $datasCallback = array();

        $config = $this->getServiceLocator()->get('MelisCoreConfig');

        $pluginConfig = $config->getItem("/meliscore/interface/melis_dashboardplugin/interface/melisdashboardplugin_section/interface/$pluginName");

        if (!empty($pluginConfig['forward']) && is_array($pluginConfig['forward']))
        {
            list($jsCallBacks, $datasCallback) = $config->getJsCallbacksDatas($pluginConfig);
        }

        if (!empty($pluginConfig['datas']['jscallback']))
        {
            array_push($jsCallBacks, $pluginConfig['datas']['jscallback']);
        }

        $data = array(
            'html' => $html,
            'jsCallbacks' => $jsCallBacks,
            'jsDatas' => $datasCallback,
        );
        
        return new JsonModel($data);
    }
    
    /**
     * This method manage saving Dashboard plugins
     * 
     * @return \Zend\View\Model\JsonModel
     */
    public function saveDashboardPluginsAction()
    {
        $success = 0;
        $request = $this->getRequest();
        $post = $request->getPost();
        $result = array();
        try{
            /**
             * Calling MelisCoreDashboardDragDropZonePlugin to save Dashboard plugins
             */
            $pluginManager = $this->getServiceLocator()->get('ControllerPluginManager');
            $dragDropPlugin = $pluginManager->get('MelisCoreDashboardDragDropZonePlugin');
            $success = $dragDropPlugin->savePlugins(get_object_vars($post));
            
            $result = array(
                'success' => $success
            );
            
        }catch (\Exception $e){
            $result = array(
                'success' => $success,
                'message' => $e->getMessage()
            );
        }
        
        return new JsonModel($result);
    }
}