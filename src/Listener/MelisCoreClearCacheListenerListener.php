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
use Laminas\Mvc\MvcEvent;
use Laminas\Session\Container;
use MelisCore\Controller\PluginViewController;

class MelisCoreClearCacheListenerListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        /**
         * This listener will delete user cache on module save(for all user)
         */
        $this->attachEventListener(
            $events,
            'MelisCore',
            'meliscore_module_management_save_end',
            function($e){
                $sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
                $params = $e->getParams();

                if($params['success']){
                    $coreCacheService = $sm->get('MelisCoreCacheSystemService');
                    $coreCacheService->deleteCacheByPrefix('*', PluginViewController::cacheConfig);
                }
            },
            -1000
        );

        /**
         * This listener will delete user cache on user save(for current user only)
         */
        $this->attachEventListener(
            $events,
            'MelisCore',
            'meliscore_tooluser_save_info_end',
            function($e){
                $sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
                $params = $e->getParams();
                if($params['success']){
                    if(!empty($params['datas']['usr_id'])){//we delete only cache by this user
                        $coreCacheService = $sm->get('MelisCoreCacheSystemService');
                        $userId = $params['datas']['usr_id'];
                        $coreCacheService->deleteCacheByPrefix('*_'.$userId, PluginViewController::cacheConfig);
                    }
                }
            },
            200
        );
    }
}