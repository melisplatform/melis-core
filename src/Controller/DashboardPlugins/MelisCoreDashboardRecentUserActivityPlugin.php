<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use MelisCore\Controller\DashboardPlugins\MelisCoreDashboardTemplatingPlugin;
use Zend\View\Model\ViewModel;

use MelisCore\Service\MelisCoreRightsService;
use Zend\Session\Container;

class MelisCoreDashboardRecentUserActivityPlugin extends MelisCoreDashboardTemplatingPlugin
{
    public function __construct()
    {
        $this->pluginModule = 'meliscore';
        parent::__construct();
    }
    
    public function recentActivityUsers()
    {
        $melisTranslation = $this->getServiceLocator()->get('MelisCoreTranslation');
        $melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
        
        $melisKeys = $melisAppConfig->getMelisKeys();
        $fullKeyToolUser = $melisKeys['meliscore_tool_user'];

        // Checks wether the user has access to this tools or not
        $melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
        $isAccessible = $melisCoreRights->canAccess('meliscore_tool_user');

        $toolName = '';
        $toolId = '';
        $toolMelisKey = '';
        $toolIcon = '';
        $itemConfigToolUser = $melisAppConfig->getItem($fullKeyToolUser);
        if ($itemConfigToolUser)
        {
            $toolName = $itemConfigToolUser['conf']['name'];
            $toolId = $itemConfigToolUser['conf']['id'];
            $toolMelisKey = $itemConfigToolUser['conf']['melisKey'];
            $toolIcon = $itemConfigToolUser['conf']['icon'];
        }
        else
            $isAccessible = false; // Not possible in theory
            
        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];
        $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
        
        // Max lines
        $maxLines = 8;
        if (!empty($this->pluginConfig['max_lines']))
            $maxLines = $this->pluginConfig['max_lines'];
            
        // Getting last users' logged in
        $users = $userTable->getLastLoggedInUsers((int)$maxLines);
        if ($users)
        {
            $users = $users->toArray();
            foreach ($users as $keyUser => $user)
            {
                $users[$keyUser]['usr_last_login_date'] = strftime($melisTranslation->getDateFormatByLocate($locale), strtotime($user['usr_last_login_date']));
            }
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