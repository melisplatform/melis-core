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
     * Render Dashboard Menu
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function dashboardMenuAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $plugins = array();
        $config = $this->getServiceLocator()->get('config');
        
        foreach ($config['plugins'] As $key => $val)
        {
            if (!empty($val['dashboard_plugins']))
            {
                $plugins[$key] = array();
                
                $modulePlugins = $val['dashboard_plugins'];
                
                foreach ($modulePlugins As $keyPlugin => $plugin)
                {
                    // Skipping DragDropZone plugin
                    if ($keyPlugin != 'MelisCoreDashboardDragDropZonePlugin')
                    {
                        $plugins[$key][$keyPlugin] = array(
                            'module'         => $key,
                            'plugin'         => $keyPlugin,
                            'name'           => !empty($plugin['name'])          ? $plugin['name'] : $keyPlugin,
                            'plugin_id'      => !empty($plugin['plugin_id'])     ? $plugin['plugin_id']  : '',
                            'x-axis'         => !empty($plugin['x-axis'])         ? $plugin['x-axis']  : '',
                            'y-axis'         => !empty($plugin['y-axis'])        ? $plugin['y-axis']  : '',
                            'width'          => !empty($plugin['width'])         ? $plugin['width']  : '',
                            'height'         => !empty($plugin['height'])        ? $plugin['height']  : '',
                            'description'    => !empty($plugin['description'])   ? $plugin['description']  : '',
                            'icon'           => !empty($plugin['icon'])          ? $plugin['icon'] : '',
                            'thumbnail'      => !empty($plugin['thumbnail'])     ? $plugin['thumbnail'] : '/MelisCore/plugins/images/default.jpg',
                            'is_new_plugin'  => true,
                            'section'       => !empty($plugin['section'])       ? $plugin['section'] : null,
                        );
                    }
                }
            }
        }

        // categorized plugins by putting a section in every plugins
        $plugins = $this->putSectionOnPlugins($plugins);
        $plugins = $this->organizedPluginsBySection($plugins);


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
        
        $isAccessible = null;
        
        // Check if dashboard is available
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
        
        if($melisCoreAuth->hasIdentity())
        {
            $xmlRights = $melisCoreAuth->getAuthRights();
            $isAccessible = $melisCoreRights->isAccessible($xmlRights, MelisCoreRightsService::MELISCORE_PREFIX_INTERFACE, '/meliscore_dashboard');
        }
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->isAccessible = $isAccessible;
        $view->dashboardId = $dashboardId;
        
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
        
        $module = $pluginConfigPost['module'] ?? null;
        $pluginName = $pluginConfigPost['plugin'] ?? null;
        
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
    private  function putSectionOnPlugins($plugins)
    {
        $pluginList = [];
        if (! empty($plugins)) {
            foreach ($plugins as $moduleName => $dashboardPlugin) {
               if (is_array($dashboardPlugin)) {
                   foreach ($dashboardPlugin as $pluginName => $conf) {
                       if ( (isset($conf['section']) || ! isset($conf['section'])) && empty($conf['section'])) {
                           // if there is no ['section']key on  config
                           // or there is a ['section'] key but empty
                           // we put it in the OTHER section directly
                           $conf['section'] = "Others";
                       }
//                       if (isset($conf['section']) && ! empty($conf['section'])) {
//                          echo $moduleName;
//                       }

                       $pluginList[$moduleName][$pluginName] = $conf;
                   }
               }
            }
        }


        return $pluginList;
    }
    private function organizedPluginsBySection($plugins)
    {
        $moduleSvc = $this->getServiceLocator()->get('ModulesService');
        $configSvc = $this->getServiceLocator()->get('MelisCoreConfig');
        $melisPuginsSvc = $this->getServiceLocator()->get('MelisCorePluginsService');
        $marketPlaceModuleSection = $melisPuginsSvc->getPackagistCategories();
        /*
         * In case there is no internet or cant connect to the markeplace domain
         * we put a predefined section just not destroy the plugins menu
         * file location : melis-core/config/app.interface [meliscore][datas][fallBacksection]
         */
        if (empty($marketPlaceModuleSection)) {
            $fallbackSection = $configSvc->getItem('/meliscore/datas/fallBacksection');
            $marketPlaceModuleSection = $fallbackSection;
        }
        //custom section
        $customSection = [
            'Others',
            'CustomProjects'
        ];
        // merge all sections
        $melisSection = array_merge($marketPlaceModuleSection, $customSection);
        $newPluginList = [];
        // put the section in order
        if (! empty($melisSection)) {
            foreach ($melisSection as $idx => $val) {
                $newPluginList[$val] = [];
            }
        }
        if (! empty($plugins)) {
            // organized plugins by section
           foreach ($plugins  as $moduleName => $dashboardPlugins) {
               if (! empty($dashboardPlugins) && is_array($dashboardPlugins)) {
                   foreach ($dashboardPlugins as $pluginName => $config) {
                       $pluginSection = $config['section'];
                       if (in_array($pluginSection,$melisSection)) {
                           // set a plugin in a section
                           $newPluginList[$pluginSection][$moduleName][$pluginName] = $config;
                           // indication that the plugin is newly installed
                           $newPluginList[$pluginSection][$moduleName][$pluginName]['isNew'] = $melisPuginsSvc->pluginIsNew($pluginName);
                       } else {
                           /*
                            * if the section does not belong to the group it will go to the
                            * others section direclty
                            */
                           $newPluginList['Others'][$moduleName][$pluginName] = $config;
                       }
                   }
               }
           }
        }


        return $newPluginList;
    }
}