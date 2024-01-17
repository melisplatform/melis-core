<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use MelisCore\Service\MelisCoreDashboardPluginsRightsService;
use Laminas\View\Model\JsonModel;
use Laminas\View\Model\ViewModel;

/**
 * This class handles the request from AJAX call in 
 * generating plugin and saving Dashboard plugins
 */
class DashboardPluginsController extends MelisAbstractActionController
{
    public function renderDashboardPluginsHeaderAction() {}

    /**
     * Render Dashboard Menu
     * 
     * @return \Laminas\View\Model\ViewModel
     */
    public function dashboardMenuAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $plugins = [];
        /** @var \MelisCore\Service\MelisCoreConfigService $config */
        $config = $this->getServiceManager()->get('MelisCoreConfig');

        /** @var \MelisCore\Service\MelisCoreDashboardPluginsRightsService $dashboardPluginsService */
        $dashboardPluginsService = $this->getServiceManager()->get('MelisCoreDashboardPluginsService');

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
                        $translationService = $this->getServiceManager()->get('MelisCoreTranslation');
                        $module = $plugin['forward']['module'];
                        $isNewPlugin = $plugin['datas']['is_new_plugin'] = true;
                        $name = $plugin['datas']['name'];
                        $description = $plugin['datas']['description'];

                        //if no translated value for the current locale, use the English translation instead
                        if (substr(trim($name), 0, 3) == 'tr_') {                            
                            $name = $translationService->getMessage($name);
                        }

                        if (substr(trim($description), 0, 3) == 'tr_') {
                            $description = $translationService->getMessage($description);
                        }                               

                        //use the plugin name if translated value is null
                        $name = !empty($name)?$name:$pluginName; 
                        $pluginRaw = json_encode($plugin);
                        $plugins[$module][$name] = [
                            'module' => $module,
                            'plugin' => $pluginName,
                            'name' => $name,
                            'plugin_id' => !empty($plugin['datas']['plugin_id']) ? $plugin['datas']['plugin_id'] : '',
                            'x-axis' => !empty($plugin['datas']['x-axis']) ? $plugin['datas']['x-axis'] : '',
                            'y-axis' => !empty($plugin['datas']['y-axis']) ? $plugin['datas']['y-axis'] : '',
                            'width' => !empty($plugin['datas']['width']) ? $plugin['datas']['width'] : '',
                            'height' => !empty($plugin['datas']['height']) ? $plugin['datas']['height'] : '',
                            'description' => !empty($description) ? $description : '',
                            'icon' => !empty($plugin['datas']['icon']) ? $plugin['datas']['icon'] : '',
                            'thumbnail' => !empty($plugin['datas']['thumbnail']) ? $plugin['datas']['thumbnail'] : '/MelisCore/plugins/images/default.jpg',
                            'is_new_plugin' => $isNewPlugin,
                            'pluginRaw' => $pluginRaw,
                            'section' => !empty($plugin['datas']['section']) ? $plugin['datas']['section'] : "",
                        ];
                    }
                }

            }
        }
        // melis plugin service
        $pluginSvc = $this->getServiceManager()->get('MelisCorePluginsService');
        // check for new  or manually installed plugins and saved in db
        $pluginSvc->checkDashboardPlugins();
        // put section of dashboard plugins
        $plugins = $this->putSectionOnPlugins($plugins);
        // organized plugins or put them into their respective sections
        $plugins = array_filter($this->organizedPluginsBySection($plugins));
        // get the latest plugin installed
        $latesPlugin = $pluginSvc->getLatestPlugin($pluginSvc::DASHBOARD_PLUGIN_TYPE);
        // for new plugin notifications
        $pluginMenuHandler = $pluginSvc->getNewPluginMenuHandlerNotifDuration();

        $view = new ViewModel();
        $view->setVariable('plugins', $plugins);
        $view->melisKey = $melisKey;
        $view->latestPluginInstalled = $latesPlugin;
        $view->newPluginNotification = $pluginMenuHandler;
        
        return $view;
    }
    
    /**
     * This render the Dashboard plugins Drag and Drop Zone
     * 
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderDashboardPluginsAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        /** @var \MelisCore\Service\MelisCoreDashboardPluginsRightsService $dashboardPluginsService */
        $dashboardPluginsService = $this->getServiceManager()->get('MelisCoreDashboardPluginsService');
        $hasPlugins = $dashboardPluginsService->hasPlugins();

        // Dashboard ID
        $dashboardId = $this->params()->fromQuery('dashboardId', 'id_meliscore_toolstree_section_dashboard');

        $moduleSvc = $this->getServiceManager()->get('MelisAssetManagerModulesService');
        $activeMods = implode("-", $moduleSvc->getActiveModules());

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->dashboardId = $dashboardId;
        $view->hasPlugins = $hasPlugins;
        $view->activeMods = $activeMods;

        return $view;
    }
    
    /**
     * This method used to generate Dashboard plugin 
     * requested from a forward() request
     * 
     * @return \Laminas\View\Model\ViewModel;
     */
    public function generateDahsboardPluginAction()
    {
        $plugin = $this->params()->fromRoute('plugin');
        $function = $this->params()->fromRoute('function');
        
        try 
        {
            $pluginManager = $this->getServiceManager()->get('ControllerPluginManager');
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
     * @return \Laminas\View\Model\JsonModel
     */
    public function getPluginAction()
    {
        // return plugin view
        $request = $this->getRequest();
        $pluginConfigPost = $request->getPost()->toArray();

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

        $pluginManager = $this->getServiceManager()->get('ControllerPluginManager');
        $viewRender = $this->getServiceManager()->get('ViewRenderer');

        $module = $pluginConfigPost['module'] ?? (!empty($pluginConfigPost['forward']['module'])) ? $pluginConfigPost['forward']['module'] : null;
        $pluginName = $pluginConfigPost['plugin'] ?? (!empty($pluginConfigPost['forward']['plugin'])) ? $pluginConfigPost['forward']['plugin'] : null;
        $newPlugin = (isset($pluginConfigPost['datas']['is_new_plugin'])) ? true : false;
        $plugin = $pluginManager->get($pluginName);
        $pluginModel = $plugin->render($pluginConfigPost, $newPlugin);

        $html = $viewRender->render($pluginModel);

        $jsCallBacks = array();
        $datasCallback = array();

        $config = $this->getServiceManager()->get('MelisCoreConfig');

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
     * @return \Laminas\View\Model\JsonModel
     */
    public function saveDashboardPluginsAction()
    {
        $success = 0;
        $request = $this->getRequest();
        $post = $request->getPost()->toArray();
        $result = array();
        try{
            /**
             * Calling MelisCoreDashboardDragDropZonePlugin to save Dashboard plugins
             */
            $pluginManager = $this->getServiceManager()->get('ControllerPluginManager');
            $dragDropPlugin = $pluginManager->get('MelisCoreDashboardDragDropZonePlugin');
            $success = $dragDropPlugin->savePlugins($post);
            
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
                       $pluginId = $conf['plugin_id'] ?? $conf['plugin'];
                       if (! isset($conf['section']) && empty($conf['section'])) {
                           // if there is no ['section']key on  config
                           // or there is a ['section'] key but empty
                           // we put it in the OTHER section directly
                           $conf['section'] = "Others";
                       }

                       $pluginList[$moduleName][$pluginId] = $conf;
                   }
               }
            }
        }


        return $pluginList;
    }
    private function organizedPluginsBySection($plugins)
    {
        $moduleSvc = $this->getServiceManager()->get('ModulesService');
        $configSvc = $this->getServiceManager()->get('MelisCoreConfig');
        $melisPuginsSvc = $this->getServiceManager()->get('MelisCorePluginsService');
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
            'MelisCommerce', // special section
            'Others',
            'CustomProjects',
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
            $publicModules = $melisPuginsSvc->getMelisPublicModules(null,true);
           foreach ($plugins  as $moduleName => $dashboardPlugins) {
               /*
                * check first if the module is public or not
                *  if public we will based the section on what is set from marketplace
                *  if private this will return null
                */

               $moduleSection = "";
               if (array_key_exists($moduleName,$publicModules)) {
                   $moduleSection = $publicModules[$moduleName]['section'];
               }
               if (! empty($dashboardPlugins) && is_array($dashboardPlugins)) {
                   foreach ($dashboardPlugins as $pluginName => $config) {
                       $pluginId = $config['plugin_id'] ?? $config['plugin'];
                       // put section for public module
                       if (! empty($moduleSection)) {
                           $pluginSection = $moduleSection;
                       } else {
                           // if it goes here means module is either private or there is no internet connection
                           $pluginSection = $config['section'];
                       }
                       if (in_array($pluginSection,$melisSection)) {
                           // set a plugin in a section
                           $newPluginList[$pluginSection][$moduleName][$pluginId] = $config;
                           // indication that the plugin is newly installed
                           $newPluginList[$pluginSection][$moduleName][$pluginId]['isNew'] = $melisPuginsSvc->pluginIsNew($pluginId);
                       } else {
                           /*
                            * if the section does not belong to the group it will go to the
                            * others section direclty
                            */
                           $newPluginList['Others'][$moduleName][$pluginId] = $config;
                       }
                   }
               }
           }
        }

        return $newPluginList;
    }

    public function renderDashboardBubblePluginsAction()
    {
        $showBubblePlugins = $this->getCookie();

        $view = new ViewModel();
        $view->showBubblePlugins = $showBubblePlugins;

        return $view;
    }

    public function renderDashboardPluginModalAction()
    {
        $translator = $this->getServiceManager()->get('translator');
        $parameters = $this->getRequest()->getQuery('parameters', array());

        $dashboardId = (!empty($parameters['dashboardId'])) ? $parameters['dashboardId'] : '';
        $pluginName = (!empty($parameters['pluginName'])) ? $parameters['pluginName'] : '';
        $pluginId = (!empty($parameters['pluginId'])) ? $parameters['pluginId'] : 1;
        $pluginModule = (!empty($parameters['pluginId'])) ? $parameters['pluginModule'] : 1;
        $pluginHardcodedConfig = (!empty($parameters['pluginFrontConfig'])) ? $parameters['pluginFrontConfig'] : [];

        $errors = '';
        $tag = '';
        $tabs = array();

        if (empty($pluginModule) || empty($pluginName) || empty($dashboardId)) {
            $errors = $translator->translate('tr_meliscore_generate_error_No module or plugin or idpage parameters');
        }
        
        if (empty($errors)) {
            try {
                $pluginHardcodedConfig['dashboard_id'] = $dashboardId;
                $pluginHardcodedConfig['plugin_id'] = $pluginId;
                $melisPlugin = $this->getServiceManager()->get('ControllerPluginManager')->get($pluginName);
                $melisPlugin->setUpdatesPluginConfig($pluginHardcodedConfig);
                $melisPlugin->getPluginConfig();
                $tabs = $melisPlugin->createOptionsForms();
            } catch (\Exception $e) {
                $errors = $translator->translate('tr_meliscore_generate_error_Plugin cant be created');
            }
        }

        if ($errors != '' || count($tabs) == 0) {
            $tabs[] = array('tabName' => 'Error', 'html' => $errors);
        }

        $view = new ViewModel();
        $view->setTerminal(true);
        $view->dashboardId = $dashboardId;
        $view->pluginId = $pluginId;
        $view->pluginName = $pluginName;
        $view->pluginModule = $pluginModule;
        $view->tabs = $tabs;
        return $view;
    }

    public function validateDashboardPluginModalAction()
    {
        $translator = $this->getServiceManager()->get('translator');
        $parameters = $this->getRequest()->getPost()->toArray();

        $dashboardId = (!empty($parameters['dashboardId'])) ? $parameters['dashboardId'] : '';
        $pluginName = (!empty($parameters['pluginName'])) ? $parameters['pluginName'] : '';
        $pluginId = (!empty($parameters['pluginId'])) ? $parameters['pluginId'] : 1;
        $pluginModule = (!empty($parameters['pluginId'])) ? $parameters['pluginModule'] : 1;

        $errors = '';
        $tag = '';
        $tabs = array();

        if (empty($pluginModule) || empty($pluginName) || empty($dashboardId)) {
            $errors = $translator->translate('tr_meliscore_generate_error_No module or plugin or idpage parameters');
        }

        if (empty($errors)) {
            try {
                $pluginHardcodedConfig['dashboard_id'] = $dashboardId;
                $melisPlugin = $this->getServiceManager()->get('ControllerPluginManager')->get($pluginName);
                $melisPlugin->setUpdatesPluginConfig($pluginHardcodedConfig);
                $melisPlugin->getPluginConfig();
                $errorsTabs = $melisPlugin->createOptionsForms();
            } catch (\Exception $e) {
                $errors = $translator->translate('tr_meliscore_generate_error_Plugin cant be created');
            }
        }

        $success = 1;
        $finalErrors = array();

        if ($errors != '') {
            $success = 0;
            $finalErrors = array('general' => $errors);
        }

        foreach ($errorsTabs as $response) {
            if (!$response['success']) {
                $success = 0;
            }
        }

        $finalErrors = $errorsTabs;

        $result = [
            'success' => $success,
            'errors' => $finalErrors,
        ];

        return new JsonModel($result);
    }

    private function getCookie()
    {
        if (empty($_COOKIE['show_bubble_plugins'])) {
            $this->makeCookie();
            return true;
        }

        return (filter_var($_COOKIE['show_bubble_plugins'], FILTER_VALIDATE_BOOLEAN));
    }

    private function makeCookie()
    {
        // timeout is set to 2038-01-19 04:14:07 maximum time for 32bit php
        \setcookie('show_bubble_plugins', 'true', 2147483647);
    }
}