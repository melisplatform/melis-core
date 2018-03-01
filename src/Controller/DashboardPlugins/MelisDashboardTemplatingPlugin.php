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
// use Zend\Session\Container;

/**
 *  
 */
abstract class MelisDashboardTemplatingPlugin extends AbstractPlugin  implements ServiceLocatorAwareInterface
{
    protected $pluginName;
    protected $pluginModule   = '';
    
    protected $pluginConfig = array();
    
    protected $updatesPluginConfig = array();
    
    protected $serviceLocator;
    protected $eventManager;
    
    public function __construct($updatesPluginConfig = array())
    {
        $this->setEventManager(new EventManager());
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
    
    public function render($pluginConfig = array())
    {
        $this->updatesPluginConfig = $pluginConfig;
        
        $this->getPluginConfig();
        
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
    
    public function getPluginConfig()
    {
        $config = $this->getServiceLocator()->get('config');
        
        $pluginConfig = $config['plugins'][$this->pluginModule]['dashboard_plugins'][$this->pluginName];
        
        $this->pluginConfig = array_merge($pluginConfig, $this->updatesPluginConfig);
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
        }
        
        $pluginView->pluginConfig = $this->pluginConfig;
        
        if (isset($this->pluginConfig['plugin_container']))
            return $pluginView;
            
        return $this->setPluginContainer($pluginView);
    }
    
    public function setPluginContainer($pluginView)
    {
        // Setting the plugin view container
        // CAN SET THE WIDTH AND HEIGHT OF THE PLUGIN
        $plugin = new ViewModel();
        $plugin->setTemplate('melis-core/dashboard-plugin/plugin-container');
        $plugin->setVariables($pluginView->getVariables());
        
        $viewRender = $this->getServiceLocator()->get('ViewRenderer');
        $pluginHtml = $viewRender->render($pluginView);
        $plugin->pluginView = $pluginHtml;
        
        return $plugin;
    }
    
    public function translateConfig($array)
    {
        $translator = $this->getServiceLocator()->get('translator');
        
        $final = array();
        foreach($array as $key => $value)
        {
            if (is_array($value))
            {
                $children = $this->translateAppConfig($value);
                $final[$key] = $children;
            }
            else
            {
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