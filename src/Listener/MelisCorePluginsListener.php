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

class MelisCorePluginsListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
	
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();
        
        $callBackHandler = $sharedEvents->attach(
        	'MelisCore',
        	array(
                'melis_core_auth_login_ok'
        	),
        	function($e){

        		$sm = $e->getTarget()->getServiceLocator();
        		$corePluginSvc = $sm->get('MelisCorePluginsService');
        		// check for new dashboard plugins
                $corePluginSvc->checkDashboardPlugins();
                // check for new templating plugins
                $corePluginSvc->checkTemplatingPlugins();
                
        	},
        100);
        
        $this->listeners[] = $callBackHandler;
    }
}