<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisCoreGeneralListener;
use Zend\Session\Container;

class MelisCorePluginsRemovalListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
	
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();
        
        $callBackHandler = $sharedEvents->attach(
        	'MelisMarketPlace',
        	array(
                'melis_marketplace_product_do_start'
        	),
        	function($e){

        		$sm = $e->getTarget()->getServiceLocator();
        		$corePluginSvc = $sm->get('MelisCorePluginsService');
                $pluginsTbl    = $corePluginSvc->pluginsTbl;
                $params        = $e->getParams();
                $action        = $params['action'];
                $module        = strtolower($params['module']);
        		// get dashboard plugins
                if ($action == 'remove') {
                    $pluginsTbl->deleteByField('plugin_module',$module);
                }

//                // save dashboard plugins
//                if (! empty($dashboardPlugins)) {
//                    foreach ($dashboardPlugins as $moduleName => $plugins) {
//                        if (is_array($plugins) && ! empty($plugins)) {
//                            foreach ($plugins as $idx => $pluginName) {
//                                // check if plugin is already exists
//                                // we only save for those plugins that are not on db
//                                $pluginData = $pluginsTbl->getEntryByField('plugin_name',$pluginName)->current();
//                                if (empty($pluginData) || !$pluginData) {
//                                    $tmpData = [
//                                        'plugin_name' => $pluginName,
//                                        'plugin_module' => $moduleName,
//                                        'plugin_date_installed' => date('Y-m-d h:i:s'),
//                                        'plugin_type' => 'dashboard'
//                                    ];
//                                    $pluginsTbl->save($tmpData);
//                                }
//                            }
//                        }
//                    }
//                }
//                // get templating plugins
//                $templatingPlugins = $corePluginSvc->getTemplatingPlugins();
//                // save dashboard plugins
//                if (! empty($templatingPlugins)) {
//                    foreach ($templatingPlugins as $moduleName => $plugins) {
//                        if (is_array($plugins) && ! empty($plugins)) {
//                            foreach ($plugins as $idx => $pluginName) {
//                                // check if plugin is already exists
//                                // we only save for those plugins that are not on db
//                                $pluginData = $pluginsTbl->getEntryByField('plugin_name',$pluginName)->current();
//                                if (empty($pluginData) || !$pluginData) {
//                                    $tmpData = [
//                                        'plugin_name' => $pluginName,
//                                        'plugin_module' => $moduleName,
//                                        'plugin_date_installed' => date('Y-m-d h:i:s'),
//                                        'plugin_type' => 'templating'
//                                    ];
//                                    $pluginsTbl->save($tmpData);
//                                }
//                            }
//                        }
//
//                    }
//                }
        	},
        100);
        
        $this->listeners[] = $callBackHandler;
    }
}