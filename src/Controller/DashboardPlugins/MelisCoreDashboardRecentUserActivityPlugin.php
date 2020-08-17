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
use MelisCore\Service\MelisCoreRightsService;

class MelisCoreDashboardRecentUserActivityPlugin extends MelisCoreDashboardTemplatingPlugin
{
    public function __construct()
    {
        $this->pluginModule = 'meliscore';
        parent::__construct();
    }
    
    public function recentActivityUsers()
    {
        $melisTranslation = $this->getServiceManager()->get('MelisCoreTranslation');
        $melisAppConfig = $this->getServiceManager()->get('MelisCoreConfig');

        $melisKeys = $melisAppConfig->getMelisKeys();
        $fullKeyToolUser = $melisKeys['meliscore_tool_user'];

        /** @var \MelisCore\Service\MelisCoreDashboardPluginsRightsService $dashboardPluginsService */
        $dashboardPluginsService = $this->getServiceManager()->get('MelisCoreDashboardPluginsService');
        //get the class name to make it as a key to the plugin
        $path = explode('\\', __CLASS__);
        $className = array_pop($path);

        $isAccessible = $dashboardPluginsService->canAccess($className);

        $toolName = '';
        $toolId = '';
        $toolMelisKey = '';
        $toolIcon = '';
        $itemConfigToolUser = $melisAppConfig->getItem($fullKeyToolUser);
        if ($itemConfigToolUser) {
            $toolName = $itemConfigToolUser['conf']['name'];
            $toolId = $itemConfigToolUser['conf']['id'];
            $toolMelisKey = $itemConfigToolUser['conf']['melisKey'];
            $toolIcon = $itemConfigToolUser['conf']['icon'];
        } else
            $isAccessible = false; // Not possible in theory
            
        $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
        
        // Max lines
        $maxLines = 8;
        if (!empty($this->pluginConfig['max_lines']))
            $maxLines = $this->pluginConfig['max_lines'];
            
        // Getting last users' logged in
        $users = $userTable->getLastLoggedInUsers((int)$maxLines);
        if ($users) {
            $users = $users->toArray();
            foreach ($users as $keyUser => $user)
                $users[$keyUser]['usr_last_login_date'] = strftime($melisTranslation->getDateFormatByLocate($this->locale), strtotime($user['usr_last_login_date']));
        }
        
        $view = new ViewModel();
        $view->setTemplate('melis-core/dashboard-plugin/recent-user-activity');
        $view->users = $users;
        $view->toolIsAccessible = $isAccessible;
        $view->toolName = $toolName;
        $view->toolId = $toolId;
        $view->toolMelisKey = $toolMelisKey;
        $view->toolIcon = $toolIcon;
        return $view;
    }
}