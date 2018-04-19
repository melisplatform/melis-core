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
// use Zend\View\Model\JsonModel;
// use Zend\Stdlib\ArrayUtils;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\EventManager\EventManager;
use Zend\EventManager\EventManagerInterface;
use Zend\Stdlib\Parameters;
use Zend\Session\Container;
use Zend\Stdlib\ArrayUtils;
// use Zend\Session\Container;

/**
 *  
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
    
    abstract public function modelVars();

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
        return $request->getPost()->toArray();
    }
    
    public function savePluginConfigToXml($config)
    {
        return '';
    }
    
    public function render($pluginConfig = array(), $generatePluginId = false)
    {
        $this->updatesPluginConfig = $pluginConfig;
        
        $this->getPluginConfig($generatePluginId);
        
        if (!empty($this->pluginConfig['interface']) && is_array($this->pluginConfig['interface']))
        {
            foreach ($this->pluginConfig['interface'] As $cKey => $cVal)
            {
                $appconfigpath = '/'.$this->pluginModule.'/dashboard_plugins/'.$this->pluginName.'/interface/'.$cKey;
                break;
            }
            
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
            $model = $this->modelVars();

        }
        
        return $this->sendViewResult($model);
    }
    
    public function getPluginConfig($generatePluginId = false)
    {
        $config = $this->getServiceLocator()->get('config');
        
        $pluginConfig = $config['plugins'][$this->pluginModule]['dashboard_plugins'][$this->pluginName];
        
        $this->pluginConfig = ArrayUtils::merge($pluginConfig, $this->updatesPluginConfig);
        
        $this->getPluginValueFromDb();
        
        $this->pluginConfig = ArrayUtils::merge($this->pluginConfig, $this->loadDbXmlToPluginConfig());
        $this->pluginConfig = ArrayUtils::merge($this->pluginConfig, $this->loadGetDataPluginConfig());
        $this->pluginConfig = ArrayUtils::merge($this->pluginConfig, $this->loadPostDataPluginConfig());
        
        // Generate pluginId if needed
        if ($generatePluginId)
        {
            if (!empty($this->pluginConfig['plugin_id']))
            {
                $this->pluginConfig['plugin_id'] .= '_'.time();
            }
        }
        
        $this->pluginConfig['module'] = $this->pluginModule;
        
        $this->pluginConfig = $this->translateConfig($this->pluginConfig);
    }
    
    public function sendViewResult($modelVars)
    {
        if (empty($this->pluginConfig['interface']))
        {
            $pluginView = new ViewModel();
            
            $pluginView->setTemplate($this->pluginConfig['template_path']);
            
            foreach ($modelVars As $key => $var)
            {
                $pluginView->$key = $var;
            }
            
        }
        else 
        {
            $pluginView = $modelVars;
            
            // TODO : removing interface from plugin rendered view config json
            unset($this->pluginConfig['interface']);
        }
        
        

        $pluginView->pluginConfig = $this->pluginConfig;
        $pluginView->jsonPluginConfig = json_encode($this->pluginConfig);
        
        if (isset($this->pluginConfig['skip_plugin_container']))
            return $pluginView;
            
        return $this->setPluginContainer($pluginView);
    }
    
    public function setPluginContainer($pluginView)
    {
        // Setting the plugin view container
        $plugin = new ViewModel();
        $plugin->setTemplate('melis-core/dashboard-plugin/plugin-container');
        $plugin->setVariables($pluginView->getVariables());
        
        $viewRender = $this->getServiceLocator()->get('ViewRenderer');
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
        $dashboardId = $this->pluginConfig['dashboard_id'];
        
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
                                $this->pluginConfig[$key] = (string)$val;
                            }
                        }
                    }
                }
            }
        }
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