<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;
use Laminas\Session\Container;

use MelisCore\Listener\MelisCoreGeneralListener;

/**
 * Listenner for getting rights of MelisCore
 * - Interface exclusions
 * - Tools
 * Rights are added to session to combine with other modules
 */
class MelisCoreGetRightsTreeViewListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();

        // Listening to Tool User start
        $callBackHandler = $sharedEvents->attach(
        	'MelisCore',
        	'meliscore_tooluser_getrightstreeview_start',
        	function($e){

        		$sm = $e->getTarget()->getServiceLocator();
        		$container = new Container('meliscore');

	        	$userId = $sm->get('request')->getQuery()->get('userId');

	        	// Getting the rights
	        	if (empty($container['action-tool-user-getrights-tmp']))
	        		$container['action-tool-user-getrights-tmp'] = array();
	        	$melisCoreRights = $sm->get('MelisCoreRights');
	        	$rightsCore = $melisCoreRights->getRightsValues($userId);

	        	// Loading rights into session for further use
	        	$container['action-tool-user-getrights-tmp'] = array_merge($container['action-tool-user-getrights-tmp'], $rightsCore);
        	},
        100);

        $this->listeners[] = $callBackHandler;
    }
}
