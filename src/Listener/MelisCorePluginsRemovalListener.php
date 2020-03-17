<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisCoreGeneralListener;
use Laminas\Session\Container;

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
                if ($action == \MelisComposerDeploy\Service\MelisComposerService::REMOVE) {
                    $pluginsTbl->deleteByField('plugin_module',$module);
                }
        	},
        -1000);
        
        $this->listeners[] = $callBackHandler;
    }
}