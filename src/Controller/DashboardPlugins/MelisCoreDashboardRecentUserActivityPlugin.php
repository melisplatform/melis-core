<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use MelisCore\Controller\DashboardPlugins\MelisDashboardTemplatingPlugin;
use Zend\Session\Container;

class MelisCoreDashboardRecentUserActivityPlugin extends MelisDashboardTemplatingPlugin
{
    public function __construct($updatesPluginConfig = array())
    {
        $this->pluginName = 'MelisCoreDashboardRecentUserActivityPlugin';
        $this->pluginModule = 'meliscore';
        parent::__construct($updatesPluginConfig);
    }
    
    public function modelVars()
    {
        $melisTranslation = $this->getServiceLocator()->get('MelisCoreTranslation');
        
        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];
        
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
                $users[$keyUser]['usr_last_login_date'] = strftime($melisTranslation->getDateFormatByLocate($locale), strtotime($user['usr_last_login_date']));
            }
        }
        
        $modelVariable = array(
            'users' => $users
        );
        
        return $modelVariable;
    }
}