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
use MelisCore\Controller\ModulesController;
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
            '*',
            [
                'melissb_userrole_update_end',
                'meliscore_module_management_save_end'
            ],
            function($e){
                $sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
                $params = $e->getParams();

                if($params['success']){
                    $coreCacheService = $sm->get('MelisCoreCacheSystemService');
                    $coreCacheService->deleteCacheByPrefix('*', PluginViewController::cacheConfig);

                    /**
                     * remove bundle-all files inside public/bundles-generated folder
                     *
                     */
                    if(isset($params['typeCode'])){
                        //remove only if it was not coming from user role update
                        if($params['typeCode'] != 'SB_ROLE_UPDATE'){
                            $path = $_SERVER['DOCUMENT_ROOT'] . '/'.ModulesController::BUNDLE_FOLDER_NAME;
                            $this->deleteFiles($path);
                        }
                    }else{
                        $path = $_SERVER['DOCUMENT_ROOT'] . '/'.ModulesController::BUNDLE_FOLDER_NAME;
                        $this->deleteFiles($path);
                    }

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
            }
        );

        /**
         * This listener will delete user cache on dashboard plugins save(for current user only)
         */
        $this->attachEventListener(
            $events,
            'MelisCore',
            'meliscore_save_dashboard_plugin_end',
            function($e){
                $sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
                $params = $e->getParams();
                if($params['success']){
                    $melisCoreAuth = $sm->get('MelisCoreAuth');
                    $userSession = $melisCoreAuth->getStorage()->read();
                    if(!empty($userSession->usr_id)){//we delete only cache by this user
                        $coreCacheService = $sm->get('MelisCoreCacheSystemService');
                        $coreCacheService->deleteCacheByPrefix('*meliscore_dashboard_plugins_'.$userSession->usr_id, PluginViewController::cacheConfig);
                    }
                }
            },
            -1000
        );
    }

    /**
     * @param $path
     */
    private function deleteFiles($path)
    {
        $bundleFiles = glob($path.'/*');
        foreach($bundleFiles as $file){
            if(is_dir($file)){
                //set folder rights to 777
                chmod($file.'/', 0777);
                //iterate again
                $this->deleteFiles($file);
            }else {
                unlink($file); // delete file
            }
        }
    }
}