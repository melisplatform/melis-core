<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use Zend\Mvc\Controller\Plugin\AbstractPlugin;
use Zend\View\Model\ViewModel;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\EventManager\EventManager;
use Zend\EventManager\EventManagerInterface;
use Zend\Stdlib\Parameters;
use Zend\Session\Container;
use Zend\Stdlib\ArrayUtils;

/**
 *  Class that handle the Dashboard plugin 
 */
abstract class MelisCoreDashboardTemplatingPlugin extends AbstractPlugin  implements ServiceLocatorAwareInterface
{
    protected $pluginName;
    protected $pluginModule   = '';
    
    protected $pluginConfig = array();
    
    protected $updatesPluginConfig = array();
    
    protected $pluginXmlDbValue = '';
    
    protected $serviceLocator;
    protected $eventManager;
    
    protected $locale;
    
    
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
    
    public function setServiceLocator(ServiceLocatorInterface $serviceLocator) 
    {
        $this->serviceLocator = $serviceLocator;
    }
    
    public function getServiceLocator()
    {
        return $this->serviceLocator->getServiceLocator();
    }
    
    public function setEventManager(EventManagerInterface $eventManager)
    {
        $this->eventManager = $eventManager;
    }
    
    public function getEventManager()
    {
        return $this->eventManager;
    }
    
    public function loadDbXmlToPluginConfig()
    {
        return array();
    }
    
    public function loadGetDataPluginConfig()
    {
        $request = $this->getServiceLocator()->get('request');
        return $request->getQuery()->toArray();
    }
    
    public function loadPostDataPluginConfig()
    {
        $request = $this->getServiceLocator()->get('request');
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
     * @return \Zend\View\Model\ViewModel
     */
    public function render($pluginConfig = array(), $generatePluginId = false)
    {
        $this->updatesPluginConfig = $pluginConfig;

        $melisCoreGeneralSrv = $this->getServiceLocator()->get('MelisCoreGeneralService');
        $this->updatesPluginConfig = $melisCoreGeneralSrv->sendEvent($this->pluginName . '_melisdashboard_render_start', $this->updatesPluginConfig);

        $this->getPluginConfig($generatePluginId);

        // Checking plugin interface otherwise return view with error message
        if (!empty($this->pluginConfig['conf']) && is_array($this->pluginConfig['conf']))
        {
            $appconfigpath = $this->pluginConfig['conf']['path'];
            $request = $this->getServiceLocator()->get('request');

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
        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        $pluginConfig = $config->getItem("/meliscore/interface/melis_dashboardplugin/interface/melisdashboardplugin_section/interface/$this->pluginName");
        $this->pluginConfig = ArrayUtils::merge($pluginConfig, $this->updatesPluginConfig);

        $this->getPluginValueFromDb();
        $this->pluginConfig = $this->updateFrontConfig($this->pluginConfig, $this->loadDbXmlToPluginConfig());
        $this->pluginConfig = $this->updateFrontConfig($this->pluginConfig, $this->loadGetDataPluginConfig());
        $this->pluginConfig = $this->updateFrontConfig($this->pluginConfig, $this->loadPostDataPluginConfig());
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

        $melisCoreGeneralSrv = $this->getServiceLocator()->get('MelisCoreGeneralService');
        $this->pluginConfig = $melisCoreGeneralSrv->sendEvent($this->pluginName . '_melisdashboard_getpluginconfig_end', $this->pluginConfig);
    }
    
    /**
     * Creating view of the plugin
     * with adding datas to to view and setting up the container of the plugin
     * 
     * @param unknown $modelVars - the view generate from interface
     * 
     * @return \Zend\View\Model\ViewModel
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
     * @return \Zend\View\Model\ViewModel
     */
    public function setPluginContainer($pluginView)
    {
        // Setting the plugin view container
        $plugin = new ViewModel();
        $plugin->setTemplate('melis-core/dashboard-plugin/plugin-container');
        $plugin->setVariables($pluginView->getVariables());

        // Delete Callback datas
        if (!empty($this->pluginConfig['deleteCallback'])){
            $plugin->deleteCallBack = $this->pluginConfig['deleteCallback'];
        }

        $viewRender = $this->getServiceLocator()->get('ViewRenderer');

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
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $userAuthDatas =  $melisCoreAuth->getStorage()->read();
        $userId = (int) $userAuthDatas->usr_id;
        // Dashboard Id
        $dashboardId = isset($this->pluginConfig['dashboard_id']) ? $this->pluginConfig['dashboard_id'] : $this->pluginConfig['datas']['dashboard_id'];
        
        // Plugin Id
        $pluginId = isset($this->pluginConfig['plugin_id']) ? $this->pluginConfig['plugin_id'] : null;

        if (!empty($dashboardId))
        {
            // Retreiving User dashboard from database
            $dashboardPluginsTbl = $this->getServiceLocator()->get('MelisCoreDashboardsTable');
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
        $translator = $this->getServiceLocator()->get('translator');
        
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
}