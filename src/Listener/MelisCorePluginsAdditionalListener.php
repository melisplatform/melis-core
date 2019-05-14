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

class MelisCorePluginsAdditionalListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{

    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();

        $callBackHandler = $sharedEvents->attach(
            'MelisMarketPlace',
            array(
                'melis_marketplace_product_do_start'
            ),
            function($e){
                $sm = $e->getTarget()->getServiceLocator();
                $corePluginSvc = $sm->get('MelisCorePluginsService');
                $pluginsTbl    = $corePluginSvc->pluginsTbl;
                $params        = $e->getParams();
                $action        = $params['action'];
                $module        = strtolower($params['module']);
                // get dashboard plugins
                if ($action == \MelisComposerDeploy\Service\MelisComposerService::DOWNLOAD || $action == \MelisComposerDeploy\Service\MelisComposerService::UPDATE) {
                    $pluginsTbl->deleteByField('plugin_module',$module);
                    $modulePlugins = $corePluginSvc->getModulePlugins($module);
                    if (! empty($modulePlugins)) {
                        foreach ($modulePlugins as $pluginType => $pluginName) {
                            // check if plugin is already added
                            $tmpPluginData = $corePluginSvc->pluginsTbl->getEntryByField('plugin_name',$pluginName)->current();
                            // if plugin is not existing then add
                            if (empty($tmpPluginData)) {
                                $tmpData = [
                                    'plugin_name' => $pluginName,
                                    'plugin_module' => $module,
                                    'plugin_date_installed' => date('Y-m-d h:i:s'),
                                    'plugin_type' => $pluginType
                                ];
                            }
                        }
                    }
                }
            },
            100);

        $this->listeners[] = $callBackHandler;
    }
}