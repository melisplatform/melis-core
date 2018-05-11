<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;
use MelisCore\Service\MelisCoreRightsService;

/**
 * This class handles the request from AJAX call in 
 * generating plugin and saving Dashboard plugins
 */
class DashboardPluginsController extends AbstractActionController
{
    /**
     * This render the Dashboard plugins Drag and Drop Zone
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderDashboardPluginsAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $isAccessible = null;
        
        // Check if dashboard is available
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
        if($melisCoreAuth->hasIdentity()){
            $xmlRights = $melisCoreAuth->getAuthRights();
            $isAccessible = $melisCoreRights->isAccessible($xmlRights,
                MelisCoreRightsService::MELISCORE_PREFIX_INTERFACE,
                '/meliscore_dashboard');
        }
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->isAccessible = $isAccessible;
        
        return $view;
    }
    
    /**
     * This method used to generate Dashboard plugin 
     * requested from a forward() request
     * 
     * @return Zend\View\Model\ViewModel;
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
        
        $pluginManager = $this->getServiceLocator()->get('ControllerPluginManager');
        $viewRender = $this->getServiceLocator()->get('ViewRenderer');
        
        $module = $pluginConfigPost['module'];
        $pluginName = $pluginConfigPost['plugin'];
        
        $newPlugin = (isset($pluginConfigPost['is_new_plugin'])) ? true : false;
        
        $plugin = $pluginManager->get($pluginName);
        $pluginModel = $plugin->render($pluginConfigPost, $newPlugin);
        
        $html = $viewRender->render($pluginModel);
        
        $jsCallBacks = array();
        $datasCallback = array();
        
        $config = $this->getServiceLocator()->get('config');
        
        $pluginConfig = $config['plugins'][$module]['dashboard_plugins'][$pluginName];
        
        if (!empty($pluginConfig['interface']) && is_array($pluginConfig['interface']))
        {
            $melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
            list($jsCallBacks, $datasCallback) = $melisAppConfig->getJsCallbacksDatas($pluginConfig);
        }
        
        if (!empty($pluginConfig['jscallback']))
        {
            array_push($jsCallBacks, $pluginConfig['jscallback']);
        }
        
        $data = array(
            'html' => $html,
            'jsCallbacks' => $jsCallBacks,
            'jsDatas' => $datasCallback
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