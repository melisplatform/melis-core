<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use Laminas\View\Model\JsonModel;
use MelisCore\Controller\DashboardPlugins\MelisCoreDashboardTemplatingPlugin;
use Laminas\View\Model\ViewModel;

class MelisCoreDashboardBubbleNotificationsPlugin extends MelisCoreDashboardTemplatingPlugin
{
    public function __construct()
    {
        $this->pluginModule = 'meliscore';
        parent::__construct();
    }

    /**
     * @return \Laminas\View\Model\ViewModel
     */
    public function notifications()
    {
        $view = new ViewModel();
        $view->setTemplate('melis-core/dashboard-plugin/bubble-notifications');
        return $view;
    }

    public function getNotifications()
    {
        $translator = $this->getServiceManager()->get('translator');
        $service = $this->getServiceManager()->get('MelisCoreFlashMessenger');
        $notifications = json_decode($service->getFlashMessengerMessages(), true);
        $count = 0;

        if (! empty($notifications))
            $count = count($notifications);

        return new JsonModel([
            'count' => $count,
            'data' => $notifications
        ]);
    }
}