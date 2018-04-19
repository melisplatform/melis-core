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

class MelisCoreDashboardRecentUserActivityPlugin extends MelisCoreDashboardTemplatingPlugin
{
    public function __construct()
    {
        $this->pluginModule = 'meliscore';
        parent::__construct();
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
    
    public function testAction()
    {
        $view = new ViewModel();
        
        $view->setTemplate('melis-core/dashboard-plugin/no-template');
        return $view;
    }
    
    /**
     * This method will decode the XML in DB to make it in the form of the plugin config file
     * so it can overide it. Only front key is needed to update.
     * The part of the XML corresponding to this plugin can be found in $this->pluginXmlDbValue
     */
    public function loadDbXmlToPluginConfig()
    {
        $configValues = array();
        
        /* $xml = simplexml_load_string($this->pluginXmlDbValue);
        if ($xml)
        {
            if (!empty($xml->template_path))
                $configValues['template_path'] = (string)$xml->template_path;
            if (!empty($xml->pageIdRootBreadcrumb))
                $configValues['pageIdRootBreadcrumb'] = (string)$xml->pageIdRootBreadcrumb;
        }
         */
        return $configValues;
    }
}