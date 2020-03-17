<?php

namespace MelisCore\Service;

use Laminas\ServiceManager\ServiceLocatorAwareInterface;
use Laminas\ServiceManager\ServiceLocatorInterface;
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
	
	/**
	 * This method return JsCallbacks of active plugins
	 * 
	 * @param unknown $fullKey
	 * @param unknown $dashboardId
	 * @return array[]
	 */
	public function getDashboardPluginsJsCallbackJsDatas($dashboardId)
	{
	    $dashboardPluginsTbl = $this->getServiceLocator()->get('MelisCoreDashboardsTable');
	    $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
	    
	    $userId = null;
	    $userAuthDatas =  $melisCoreAuth->getStorage()->read();
	    if (!empty($userAuthDatas->usr_id))
	    {
	        $userId = (int) $userAuthDatas->usr_id;
	    }
	    
	    $jsCallBacks = array();
	    $datasCallback = array();
	    
	    if (!empty($dashboardId) && !is_null($userId))
	    {
	        $plugins = $dashboardPluginsTbl->getDashboardPlugins($dashboardId, $userId)->current();

	        if (!empty($plugins))
	        {
	            $configs = $this->getServiceLocator()->get('config');
	            $plugins = simplexml_load_string($plugins->d_content);
	            
	            if (!empty($plugins->plugin))
	            {
	                if(!empty($configs['plugins']['meliscore']['interface']['melis_dashboardplugin']['interface']['melisdashboardplugin_section']['interface'])) {
	                    $pluginLists = $configs['plugins']['meliscore']['interface']['melis_dashboardplugin']['interface']['melisdashboardplugin_section']['interface'];
                        $this->getPluginCallbacks($plugins, $pluginLists, $configs,$jsCallBacks);
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

    /**
     * @param $plugins
     * @param $pluginLists
     * @param $configs
     * @param $jsCallBacks
     */
    private function getPluginCallbacks($plugins, $pluginLists, $configs, &$jsCallBacks)
    {
        foreach ($pluginLists As $plugin => $config) {
            foreach ($plugins->plugin As $xKey => $xVal) {
                if ($plugin == (string)$xVal->attributes()->plugin) {
                    $pluginConfig = $config;
                    if(!empty($pluginConfig['datas'])) {
                        if (!empty($pluginConfig['datas']['jscallback'])) {
                            array_push($jsCallBacks, $pluginConfig['datas']['jscallback']);
                        }
                    }else{
                        if (!empty($pluginConfig['conf']['type'])) {
                            $pluginType = explode('/', $pluginConfig['conf']['type']);
                            if(!empty($configs['plugins'][$pluginType[1]]['interface'])){
                                $typePLugins = $configs['plugins'][$pluginType[1]]['interface'];
                                $this->getPluginCallbacks($plugins, $typePLugins, $configs,$jsCallBacks);
                            }
                        }
                    }
                }
            }
        }
    }
}