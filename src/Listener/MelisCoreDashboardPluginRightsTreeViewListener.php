<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2019 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;


use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use Zend\Session\Container;

class MelisCoreDashboardPluginRightsTreeViewListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();

        $callBackHandler = $sharedEvents->attach(
            'MelisCore',
            'meliscore_tooluser_getrightstreeview_start',
            function ($e) {
                $sm = $e->getTarget()->getServiceLocator();
                $container = new Container('meliscore');

                // Add MelisDashboardPlugins right management rights management
                $userId = $sm->get('request')->getQuery()->get('userId');

                if (empty($container['action-tool-user-getrights-tmp']))
                    $container['action-tool-user-getrights-tmp'] = array();
                $melisCmsRights = $sm->get('MelisCoreDashboardPluginsService');
                $rightsCms = $melisCmsRights->getRightsValues($userId);


                // Merge the CMS rights with other ones (from Core or other modules)
                $container['action-tool-user-getrights-tmp'] = array_merge($container['action-tool-user-getrights-tmp'], $rightsCms);
            },
            100);

        $this->listeners[] = $callBackHandler;
    }
}