<?php

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
class MelisCoreDashboardService implements ServiceLocatorAwareInterface
{
	public $serviceLocator;
	
	public function setServiceLocator(ServiceLocatorInterface $sl)
	{
		$this->serviceLocator = $sl;
		return $this;
	}
	
	public function getServiceLocator()
	{
		return $this->serviceLocator;
	}
	
	public function getDashboardPluginsJsCallbackJsDatas($fullKey, $dashboardId)
	{
	    $melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
	    $dashboardPluginsTbl = $this->getServiceLocator()->get('MelisCoreDashboardsTable');
	    $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
	    
	    $userAuthDatas =  $melisCoreAuth->getStorage()->read();
	    $userId = (int) $userAuthDatas->usr_id;
	    
	    $jsCallBacks = array();
	    $datasCallback = array();
	    
	    if (!empty($dashboardId) && !empty($userId))
	    {
	        $plugins = $dashboardPluginsTbl->getDashboardPlugins($dashboardId, $userId)->current();
	        
	        if (!empty($plugins))
	        {
	            $fullKey = explode('/', $fullKey);
	            $module = $fullKey[1];
	            
	            $pluginConfigs = array();
	            
	            $config = $this->getServiceLocator()->get('config');
	            
	            $plugins = simplexml_load_string($plugins->d_content);
	            
	            if (!empty($plugins->plugin))
	            {
	                foreach ($plugins->plugin As $xKey => $xVal)
	                {
	                    $pluginConfig = $config['plugins'][$module]['dashboard_plugins'][(string)$xVal->attributes()->plugin];
	                    
	                    if (!empty($pluginConfig['interface']) && is_array($pluginConfig['interface']))
	                    {
	                        list($jsCallBacks, $datasCallback) = $melisAppConfig->getJsCallbacksDatas($pluginConfig);
	                    }
	                    
	                    if (!empty($pluginConfig['jscallback']))
	                    {
	                        array_push($jsCallBacks, $pluginConfig['jscallback']);
	                    }
	                }
	            }
	        }
	    }
	    
	    return array($jsCallBacks, $datasCallback);
	}
	
	public function getActiveDashboardPlugins()
	{
	    $plugins = array();
	    
	    $config = $this->getServiceLocator()->get('config');
	    
	    foreach ($config['plugins'] As $key => $val)
	    {
	        if (!empty($val['dashboard_plugins']))
	        {
	            $modulePlugins = $val['dashboard_plugins'];
	            foreach ($modulePlugins As $keyPlugin => $plugin)
	            {
	                array_push($plugins[$key], array(
	                    'name' => $plugin['name'],
	                    'description' => $plugin['description'],
	                    'icon' => $plugin['icon'],
	                    'thumnail' => $plugin['thumnail'],
	                ));
	            }
	        }
	    }
	    
	    return $plugins;
	}
}