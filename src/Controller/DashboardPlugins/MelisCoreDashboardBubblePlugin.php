<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use MelisCore\Controller\DashboardPlugins\MelisCoreDashboardTemplatingPlugin;
use Laminas\View\Model\ViewModel;
use Laminas\Http\Header\SetCookie;
use Laminas\Http\Client;

class MelisCoreDashboardBubblePlugin extends MelisCoreDashboardTemplatingPlugin
{
    public const DASHBOARD_CONFIG = '/meliscore/interface/melis_dashboardplugin/interface/melisdashboardplugin_section';

    public function __construct()
    {
        $this->pluginModule = 'meliscore';
        parent::__construct();
    }

    /**
     * Renders the bubble plugins
     * @return \Laminas\View\Model\ViewModel
     */
    public function bubblepluginszone()
    {
        $showBubblePlugins = $this->getCookie();
        $html = '';

        if ($showBubblePlugins) {
            // get the plugins listed in the config
            $config = $this->getServiceManager()->get('MelisCoreConfig');
            $dashboardPlugins = $config->getItem(self::DASHBOARD_CONFIG);
            $bubblePlugins = $dashboardPlugins['interface']['MelisCoreDashboardBubblePlugin']['datas']['plugins'];

            $pluginManager = $this->getServiceManager()->get('ControllerPluginManager');
            $viewRender = $this->getServiceManager()->get('ViewRenderer');

            // render the plugins
            foreach ($bubblePlugins as $pluginName) {
                $plugin = $pluginManager->get($pluginName);
                $pluginModel = $plugin->render();

                $html .= '<div class="col">';
                $html .= $viewRender->render($pluginModel);
                $html .= '</div>';
            }
        }

        $view = new ViewModel();
        $view->setTemplate('melis-core/dashboard-plugin/bubble-plugins-zone');
        $view->setVariables([
            'htmlPlugins' => $html,
            'showBubblePlugins' => $showBubblePlugins
        ]);

        return $view;
    }

    private function getCookie()
    {
        if (empty($_COOKIE['show_bubble_plugins'])) {
            $this->makeCookie();
            return true;
        }

        return (filter_var($_COOKIE['show_bubble_plugins'], FILTER_VALIDATE_BOOLEAN));
    }

    private function makeCookie()
    {
        // timeout is set to 2038-01-19 04:14:07 maximum time for 32bit php
        \setcookie('show_bubble_plugins', 'true', 2147483647);
    }
}