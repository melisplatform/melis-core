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
                // Avoid ajax request
                if (!$e->getApplication()->getMvcEvent()->getRequest()->isXmlHttpRequest())
                {
                    // Get route match to know if we are displaying in back or front
                    $routeMatch = $e->getRouteMatch();
                    
                    $sm = $e->getApplication()->getServiceManager();
                    
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
                                        'module'         => $key,
                                        'name'           => !empty($plugin['name'])          ? $plugin['name'] : $keyPlugin,
                                        'plugin_id'      => !empty($plugin['plugin_id'])     ? $plugin['plugin_id']  : '',
                                        'width'          => !empty($plugin['width'])         ? $plugin['width']  : '',
                                        'height'         => !empty($plugin['height'])        ? $plugin['height']  : '',
                                        'description'    => !empty($plugin['description'])   ? $plugin['description']  : '',
                                        'icon'           => !empty($plugin['icon'])          ? $plugin['icon'] : '',
                                        'thumbnail'      => !empty($plugin['thumbnail'])     ? $plugin['thumbnail'] : '/MelisCore/plugins/images/default.jpg',
                                        'is_new_plugin'  => true,
                                    );
                                }
                            }
                        }
                    }
                    
                    $menu = new ViewModel();
                    $menu->setTemplate('melis-core/dashboard-plugin/dashboard-menu');
                    $menu->setVariable('plugins', $plugins);
                    
                    $e->getApplication()->getMvcEvent()->getViewModel()->addChild($menu, 'dashboardMenu');
                }
            });
        
        $this->listeners[] = $callBackHandler;
    }
}