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

class MelisCoreNewPlatformListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
            'MelisInstaller',
            'melis_install_new_platform_start',
        	function($e){
        		$sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
        		$params = $e->getParams();
        		$container = new Container('melisinstaller');
        		$platforms = $params['siteDomain'];
                $ctr = 0;
                $container->platforms = array();
        		foreach($platforms as $platform) {
        		    // avoid duplicates
        		    if(empty($container['platforms'][$platform['environment']])) {
        		        $container['platforms'][$platform['environment']] = array(
        		          'plf_name' => $platform['environment']
        		        );
        		    }
        		    $ctr++;
        		}
        	},
        100
        );
    }
}