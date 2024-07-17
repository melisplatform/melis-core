<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Laminas\ModuleManager\ModuleEvent;
use MelisCore\Controller\ModulesController;

/**
 * Listener to check if bundle all file arleady exist, if not
 * it will rebundle all the assets
 *
 * Class MelisGenerateBundleListener
 * @package MelisCore\Listener
 */
class MelisGenerateBundleListener
{
    public function onLoadModulesPost(ModuleEvent $e)
    {
        if(!empty($_SERVER['REQUEST_URI'])){
            $uri = $_SERVER['REQUEST_URI'];

            //we don't want listener to be executed if it's not a php code
            preg_match('/.*\.((?!php).)+(?:\?.*|)$/i', $uri, $matches, PREG_OFFSET_CAPTURE);
            if (count($matches) > 1)
                return;

            //check if we are in BO
            if ($uri == '/melis' || $uri == '/melis/login')
            {
                /** @var ServiceManager $serviceManager */
                $serviceManager = $e->getParam('ServiceManager');

                //check if bundle already exist
                if (!file_exists($_SERVER['DOCUMENT_ROOT'] . '/'.ModulesController::BUNDLE_FOLDER_NAME.'/css/bundle-all.css')
                    && !file_exists($_SERVER['DOCUMENT_ROOT'] . '/'.ModulesController::BUNDLE_FOLDER_NAME.'/js/bundle-all.js')) {

                    $coreConfig = $serviceManager->get('MelisCoreConfig');
                    $buildBundle = $coreConfig->getItem('/meliscore/datas/')['build_bundle'] ?? true;
                    /**
                     * Check if we build the bundle all
                     */
                    if($buildBundle) {
                        $moduleService = $serviceManager->get('ModulesService');
                        $moduleService->generateBundle();
                    }
                }
            }
        }
    }
}