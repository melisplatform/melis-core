<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use MelisCore\Controller\DashboardPlugins\MelisCoreDashboardTemplatingPlugin;

class MelisCoreDashboardRecentUserActivityPlugin extends MelisCoreDashboardTemplatingPlugin
{
    public function __construct()
    {
        $this->pluginName = 'MelisCoreDashboardRecentUserActivityPlugin';
        $this->pluginModule = 'meliscore';
    }
    
    public function modelVars()
    {
        $melisTranslation = $this->getServiceLocator()->get('MelisCoreTranslation');
        
        // Max lines
        $maxLines = 8;
            
        // Getting last users' logged in
        $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
        $users = $userTable->getLastLoggedInUsers($maxLines);
        if ($users)
        {
            $users = $users->toArray();
            foreach ($users as $keyUser => $user)
            {
                $users[$keyUser]['usr_last_login_date'] = strftime($melisTranslation->getDateFormatByLocate($this->locale), strtotime($user['usr_last_login_date']));
            }
        }
        
        $modelVariable = array(
            'users' => $users
        );
        
        return $modelVariable;
    }
}