<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2019 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;


use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;
use Laminas\Session\Container;

class MelisCoreDashboardPluginRightsTreeViewListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $sharedEvents      = $events->getSharedManager();

        $callBackHandler = $sharedEvents->attach(
            'MelisCore',
            'meliscore_tooluser_getrightstreeview_start',
            function ($e) {
                $sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
                $container = new Container('meliscore');

                // Add MelisDashboardPlugins right management rights management
                $userId = $sm->get('request')->getQuery()->get('userId');

                if (empty($container['action-tool-user-getrights-tmp']))
                    $container['action-tool-user-getrights-tmp'] = array();
                $melisCmsRights = $sm->get('MelisCoreDashboardPluginsService');
                $rightsDashboard = $melisCmsRights->getRightsValues($userId);


                // Merge the DashboardPlugin rights with other ones (from Core or other modules)
                $container['action-tool-user-getrights-tmp'] = array_merge($container['action-tool-user-getrights-tmp'], $rightsDashboard);
            },
            100);

        $this->listeners[] = $callBackHandler;
    }
}