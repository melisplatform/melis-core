<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use Laminas\Mvc\Controller\Plugin\AbstractPlugin;
use Laminas\View\Model\ViewModel;
use Laminas\EventManager\EventManager;
use Laminas\EventManager\EventManagerInterface;
use Laminas\Stdlib\Parameters;
use Laminas\Session\Container;
use Laminas\Stdlib\ArrayUtils;

/**
 *  Class that handle the Dashboard plugin 
 */
abstract class MelisCoreDashboardTemplatingPlugin extends AbstractPlugin
{
    protected $pluginName;
    protected $pluginModule = '';
    protected $pluginConfig = [];
    protected $updatesPluginConfig = [];
    protected $pluginXmlDbValue = '';
    protected $eventManager;
    protected $locale;
    protected $serviceManager;

    public function __construct()
    {
        $className = explode('\\', get_class($this));
        if (count($className) > 0)
            $className = $className[count($className) - 1];
            $this->pluginName = $className;
            
        $this->setEventManager(new EventManager());
        $container = new Container('meliscore');
        $this->locale = $container['melis-lang-locale'];
    }

    public function setEventManager(EventManagerInterface $eventManager)
    {
        $this->eventManager = $eventManager;
    }
    
    public function getEventManager()
    {
        return $this->eventManager;
    }

    public function getServiceManager()
    {
        return $this->getController()->getEvent()->getApplication()->getServiceManager();
    }
    
    public function loadDbXmlToPluginConfig()
    {
        return array();
    }
    
    public function loadGetDataPluginConfig()
    {
        $request = $this->getServiceManager()->get('request');
        return $request->getQuery()->toArray();
    }
    
    public function loadPostDataPluginConfig()
    {
        $request = $this->getServiceManager()->get('request');
        return $this->decodeStringData($request->getPost()->toArray());
    }
    
    public function savePluginConfigToXml($config)
    {
        return '';
    }

    private function decodeStringData($data)
    {
        /**
         * decode the string
         */
        if(!empty($data)) {
            foreach ($data as $key => $value) {
                if (!is_array($value)) {
                    $tempValue = json_decode($value, true);
                    if (is_array($tempValue)) {
                        $data[$key] = $tempValue;
                    }
                }
            }
        }
        return $data;
    }
    
    /**
     * This method render a plugin to a view
     * 
     * @param array $pluginConfig - plugin array that applies to a plugin 
     * @param string $generatePluginId - option to generate plugin id
     * 
     * @return \Laminas\View\Model\ViewModel
     */
    public function render($pluginConfig = array(), $generatePluginId = false)
    {
        $this->updatesPluginConfig = $pluginConfig;

        $melisCoreGeneralSrv = $this->getServiceManager()->get('MelisGeneralService');
        $this->updatesPluginConfig = $melisCoreGeneralSrv->sendEvent($this->pluginName . '_melisdashboard_render_start', $this->updatesPluginConfig);

        $this->getPluginConfig($generatePluginId);

        // Checking plugin interface otherwise return view with error message
        if (!empty($this->pluginConfig['conf']) && is_array($this->pluginConfig['conf']))
        {
            $appconfigpath = $this->pluginConfig['conf']['path'];
            $request = $this->getServiceManager()->get('request');

            if ($request->isXmlHttpRequest())
            {
                $postParam = new Parameters();
                $postParam->set('cpath', $appconfigpath);
                $postParam->set('forceFlagXmlHttpRequestTofalse', true);
                $request->setQuery($postParam);
            }

            $model = $this->getController()->forward()->dispatch('MelisCore\Controller\PluginView',
                array(
                    'action' => 'generate',
                    'appconfigpath' => $appconfigpath
                )
            );
        }
        else
        {
            /*
             * Plugin config no interface
             */
            $model = new ViewModel();
            $model->setTemplate('melis-core/dashboard-plugin/no-plugin-interface');
        }
        return $this->sendViewResult($model);
    }
    
    /**
     * This method return plugin final config
     * includes Dabatase, Post and Get dats and construct a final config
     * 
     * @param boolean $generatePluginId - option to generate plugin id
     */
    public function getPluginConfig($generatePluginId = false)
    {
        $config = $this->getServiceManager()->get('MelisCoreConfig');
        $pluginConfig = $config->getItem("/meliscore/interface/melis_dashboardplugin/interface/melisdashboardplugin_section/interface/$this->pluginName");
        $this->pluginConfig = ArrayUtils::merge($pluginConfig, $this->updatesPluginConfig);

        $this->getPluginValueFromDb();
        $this->pluginConfig['datas'] = $this->updateFrontConfig($this->pluginConfig['datas'], $this->loadDbXmlToPluginConfig());
        $this->pluginConfig['datas'] = $this->updateFrontConfig($this->pluginConfig['datas'], $this->loadGetDataPluginConfig());
        $this->pluginConfig['datas'] = $this->updateFrontConfig($this->pluginConfig['datas'], $this->loadPostDataPluginConfig());

        // Generate pluginId if needed
        if ($generatePluginId)
        {
            if (!empty($this->pluginConfig['datas']['plugin_id']))
            {
                $this->pluginConfig['plugin_id'] = $this->pluginConfig['datas']['plugin_id'].'_'.time();
                
                if (isset($this->pluginConfig['datas']['is_new_plugin']))
                {
                    // Unsetting after generate plugin id
                    unset($this->pluginConfig['datas']['is_new_plugin']);
                }
            }
        }

        $this->pluginConfig['module'] = $this->pluginModule;
        
        $this->pluginConfig = $this->translateConfig($this->pluginConfig);

        $melisCoreGeneralSrv = $this->getServiceManager()->get('MelisGeneralService');
        $this->pluginConfig = $melisCoreGeneralSrv->sendEvent($this->pluginName . '_melisdashboard_getpluginconfig_end', $this->pluginConfig);
    }
    
    /**
     * Creating view of the plugin
     * with adding datas to to view and setting up the container of the plugin
     * 
     * @param unknown $modelVars - the view generate from interface
     * 
     * @return \Laminas\View\Model\ViewModel
     */
    public function sendViewResult($modelVars)
    {
        // Removing interface from plugin rendered view config json
        unset($this->pluginConfig['interface']);

        if (!empty($this->pluginConfig['plugin_id']))
        {
            $modelVars->pluginId = $this->pluginConfig['plugin_id'];
        }
        $modelVars->pluginConfig = $this->pluginConfig;
        $modelVars->jsonPluginConfig = json_encode($this->pluginConfig);

        // Skipping container of a plugin
        if (isset($this->pluginConfig['datas']['skip_plugin_container']))
            return $modelVars;
            
        return $this->setPluginContainer($modelVars);
    }
    
    /**
     * Setting up plugin container
     * 
     * @param ViewModel $pluginView - plugin view
     * 
     * @return \Laminas\View\Model\ViewModel
     */
    public function setPluginContainer($pluginView)
    {
        // Setting the plugin view container
        $plugin = new ViewModel();
        $plugin->setTemplate('melis-core/dashboard-plugin/plugin-container');
        $plugin->setVariables($pluginView->getVariables());

        // Delete Callback datas
        if (!empty($this->pluginConfig['datas']['deleteCallback'])){
            $plugin->deleteCallBack = $this->pluginConfig['datas']['deleteCallback'];
        }

        $viewRender = $this->getServiceManager()->get('ViewRenderer');

        // Rendering sub plugin interface
        if (!empty($pluginView->getChildren())) {
            foreach ($pluginView->getChildren() as $key => $value) {
                if ($value instanceof ViewModel) {
                    try {
                        $pluginView->setVariable($value->captureTo(), $viewRender->render($value));
                    } catch (Exception $e) {}
                }
            }
        }
        
        // Rending the plugin first interface        
        $pluginHtml = $viewRender->render($pluginView);
        $plugin->pluginView = $pluginHtml;
        
        return $plugin;
    }
    
    /**
     * This method will get the xml value of the dashboard
     * and set to the pluginXmlDbValue as xml
     * and pluginConfig
     */
    public function getPluginValueFromDb()
    {
        $this->pluginXmlDbValue = '';
        
        // Retreiving the current user in-order to get the User dashboard
        $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
        $userAuthDatas =  $melisCoreAuth->getStorage()->read();
        $userId = (int) $userAuthDatas->usr_id;
        // Dashboard Id
        $dashboardId = isset($this->pluginConfig['dashboard_id']) ? $this->pluginConfig['dashboard_id'] : $this->pluginConfig['datas']['dashboard_id'];
        
        // Plugin Id
        $pluginId = isset($this->pluginConfig['plugin_id']) ? $this->pluginConfig['plugin_id'] : null;

        if (!empty($dashboardId))
        {
            // Retreiving User dashboard from database
            $dashboardPluginsTbl = $this->getServiceManager()->get('MelisCoreDashboardsTable');
            $plugins = $dashboardPluginsTbl->getDashboardPlugins($dashboardId, $userId)->toArray();

            foreach ($plugins As $key => $val)
            {
                if (!empty($val['d_content']))
                {
                    $pluginXmlContent = simplexml_load_string($val['d_content']);
                    
                    $this->pluginXmlDbValue = $val['d_content'];
                    
                    foreach ($pluginXmlContent As $xKey => $xVal)
                    {
                        if ((string)$xVal->attributes()->plugin_id == $pluginId)
                        {
                            $this->pluginConfig['plugin'] = (string)$xVal->attributes()->plugin;
                            $this->pluginConfig['plugin_id'] = (string)$xVal->attributes()->plugin_id;
                            
                            foreach ($xVal As $key => $val)
                            {
                                $this->pluginConfig['datas'][$key] = (string)$val;
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Updating the current plugin config values to from
     * a new config values
     *
     * This will only update keys that only existing on the
     * plugin config array
     *
     * @param array $pluginConfig
     * @param array $newPluginConfig
     * @return array
     */
    public function updateFrontConfig($pluginConfig, $newPluginConfig)
    {
        if (!empty($newPluginConfig))
        {
            foreach ($pluginConfig As $key => $val)
            {
                /*
                 * Checking if the key is exisitng on the new config
                 */
                if (isset($newPluginConfig[$key]))
                {
                    
                    if (is_array($val) && is_array($newPluginConfig[$key]))
                    {
                        /**
                         * Checking if the value are the same interger array
                         * this will override the current
                         *
                         * else the key of the array is a associative
                         */
                        if ((is_numeric(key($val)) || empty($val)) && is_numeric(key($newPluginConfig[$key])))
                        {
                            $pluginConfig[$key] = $newPluginConfig[$key];
                        }
                        else
                        {
                            $pluginConfig[$key] = $this->updateFrontConfig($val, $newPluginConfig[$key]);
                        }
                    }
                    else
                    {
                        // Assigning new data
                        $pluginConfig[$key] = $newPluginConfig[$key];
                    }
                }
                else
                {
                    if (is_array($val))
                    {
                        $pluginConfig[$key] = $this->updateFrontConfig($val, $newPluginConfig);
                    }
                }
            }
        }
        
        return $pluginConfig;
    }
    
    /**
     * This method translate possible values from the config
     * 
     * @param array $config
     * @return array
     */
    private function translateConfig($config)
    {
        $translator = $this->getServiceManager()->get('translator');
        
        $final = array();
        foreach($config as $key => $value)
        {
            if (is_array($value))
            {
                $children = $this->translateConfig($value);
                $final[$key] = $children;
            }
            else
            {
                // Checking of prefix of the tranlation value
                if (substr($value, 0, 3) == 'tr_')
                {
                    $value = $translator->translate($value);
                }
                
                $final[$key] = $value;
            }
        }
        
        return $final;
    }

    // Creates the plugin parameter form, override this function in your plugin
    // in order to show a specific form. Default shows nothing
    public function createOptionsForms()
    {
        $viewModel = new ViewModel();
        $viewModel->setTemplate('melis-core/dashboard-plugin/noformtemplate');

        $viewRender = $this->getServiceManager()->get('ViewRenderer');
        $html = $viewRender->render($viewModel);

        return [
            [
                'name' => $this->getServiceManager()->get('translator')->translate('tr_meliscore_dashboard_plugin_common_tab_properties'),
                'icon' => 'fa fa-cog',
                'html' => $html,
                'empty' => true
            ]
        ];
    }

        /**
     * This setter can be used to set a hardcoded config if not given through render function
     *
     * @param array $updatesConfig
     */
    public function setUpdatesPluginConfig($updatesConfig)
    {
        $this->updatesPluginConfig = $updatesConfig;
    }


    /**
     * Returns the data to populate the form inside the modals when invoked
     * @return array|bool|null
     */
    public function getFormData()
    {
        // formats the configuration into single array, in order to fill-out the forms with the current pluginFrontConfig value
        $configData  = function($arr, $data, $configData){
            foreach($arr as $key => $items) {
                if(is_array($items)) {
                    foreach($items as $childKey => $childItems) {
                        if(!is_array($childItems)) {
                            $data[$childKey] = $childItems;
                        }
                    }
                    $configData($items, $data, $configData);
                }
                else {
                    $data[$key] = $items;
                }
            }
            return $data;
        };

        return $configData($this->pluginConfig['datas'], [], $configData);
    }
}