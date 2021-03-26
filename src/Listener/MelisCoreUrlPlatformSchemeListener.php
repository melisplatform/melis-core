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
use Laminas\Mvc\MvcEvent;
use Laminas\Session\Container;

class MelisCoreUrlPlatformSchemeListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
            '*',
            MvcEvent::EVENT_DISPATCH,
            function ($e) {
                // get service manager
                $sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
				$configSvc  = $sm->get('MelisCoreConfig');
                // get platform scheme config
                $config = $configSvc->getItem('meliscore/datas/' . getenv('MELIS_PLATFORM'));
                // check for platform_scheme config
				if (isset($config['platform_scheme']) && $config['platform_scheme']) {
					// check if current scheme is not the same as the set platform_scheme
					if ($_SERVER['REQUEST_SCHEME'] != $config['platform_scheme']) {
						// we redirect according to its config scheme
						$url = $config['platform_scheme'] . "://" . $config['host'] . "/melis";
						// redirect
						$e->getTarget()->plugin('redirect')->toUrl($url);
					}
				}
            },
            -10000
        );
    }
}
