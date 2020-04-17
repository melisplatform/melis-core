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

/**
 * Listenner for getting rights of MelisCore
 * - Interface exclusions
 * - Tools
 * Rights are added to session to combine with other modules
 */
class MelisCoreGetRightsTreeViewListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        // Listening to Tool User start
        $this->attachEventListener(
            $events,
        	'MelisCore',
        	'meliscore_tooluser_getrightstreeview_start',
        	function($e){

        		$sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
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
        100
        );
    }
}
