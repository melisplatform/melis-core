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
use Laminas\Session\Container;

class MelisCorePluginsListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
        	'MelisCore',
        	[
                'melis_core_auth_login_ok'
        	],
        	function($e){
        		$sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
        		$corePluginSvc = $sm->get('MelisCorePluginsService');
        		// check for new dashboard plugins
                $corePluginSvc->checkDashboardPlugins();
                // check for new templating plugins
                $corePluginSvc->checkTemplatingPlugins();
        	},
        -1000
        );
    }
}