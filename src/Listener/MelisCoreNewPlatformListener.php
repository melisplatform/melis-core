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
class MelisCoreNewPlatformListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
	
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();
        
        $callBackHandler = $sharedEvents->attach(
        	'MelisInstaller',
        	array(
                'melis_install_new_platform_start'
        	),
        	function($e){

        		$sm = $e->getTarget()->getServiceLocator();
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
        100);
        
        $this->listeners[] = $callBackHandler;
    }
}