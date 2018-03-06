<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use Zend\Mvc\MvcEvent;
use Zend\View\Model\ViewModel;
use Zend\Json\Json;
/**
 *
 */
class MelisCoreDashboardMenuListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events)
    {
        $callBackHandler = $events->attach(
            MvcEvent::EVENT_DISPATCH,
            function(MvcEvent $e){
                
                // Get route match to know if we are displaying in back or front
                $routeMatch = $e->getRouteMatch();
                
                $sm = $e->getApplication()->getServiceManager();
                
                $view = $e->getApplication()->getMvcEvent()->getViewModel();
                
                $plugins = array();
                
                $config = $sm->get('config');
                
                foreach ($config['plugins'] As $key => $val)
                {
                    if (!empty($val['dashboard_plugins']))
                    {
                        $plugins[$key] = array();
                        
                        $modulePlugins = $val['dashboard_plugins'];
                        
                        foreach ($modulePlugins As $keyPlugin => $plugin)
                        {
                            if ($keyPlugin != 'MelisCoreDashboardDragDropZonePlugin')
                            {
                                $plugins[$key][$keyPlugin] = array(
                                    'plugin'        => $keyPlugin,
                                    'name'          => !empty($plugin['name'])           ? $plugin['name'] : $keyPlugin,
                                    'description'   => !empty($plugin['description'])    ? $plugin['description']  : '',
                                    'icon'          => !empty($plugin['icon'])           ? $plugin['icon'] : '',
                                    'thumbnail'     => !empty($plugin['thumbnail'])      ? $plugin['thumbnail'] : '/MelisCore/plugins/images/default.jpg',
                                );
                            }
                        }
                    }
                }
                
                $menu = new ViewModel();
                $menu->setTemplate('melis-core/dashboard-plugin/dashboard-menu');
                $menu->setVariable('plugins', $plugins);
                
                $view->addChild($menu, 'dashboardMenu');
                
                $e->getApplication()->getMvcEvent()->setViewModel($view);
            });
        
        $this->listeners[] = $callBackHandler;
    }
}