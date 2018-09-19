<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\Session\Container;

use MelisCore\Service\MelisCoreRightsService;

/**
 * This class renders Melis CMS Dashboard
*/
class DashboardController extends AbstractActionController
{
	/**
	 * Shows the leftmenu dasboard entry point
	 * 
	 * @return \Zend\View\Model\ViewModel
	 */
    public function leftmenuDashboardAction()
    {
    	$melisKey = $this->params()->fromRoute('melisKey', '');
    	
    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
    	 
    	return $view;
    }
    
    /**
     * Shows the Dashboard page
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function dashboardAction()
    {
    	$melisKey = $this->params()->fromRoute('melisKey', '');
    	$isAccessible = null;
    	
    	$melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
    	$datas = $melisAppConfig->getItemPerPlatform('/meliscore/datas');
    	
		// Check if dashboard is available
    	$melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
    	$melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
    	if($melisCoreAuth->hasIdentity()){
    	    $xmlRights = $melisCoreAuth->getAuthRights();
    	    $isAccessible = $melisCoreRights->isAccessible($xmlRights,
    	        MelisCoreRightsService::MELISCORE_PREFIX_INTERFACE,
    	        '/meliscore_dashboard');
    	}
    	
    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
    	$view->isAccessible = $isAccessible;
    	 
    	return $view;
    }
    
    /**
     * Shows Recent Activity Dashboard Plugin
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function recentActivityAction()
    { 
    	$melisKey = $this->params()->fromRoute('melisKey', '');
    	 
    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
    	 
    	return $view;
    }
    
    /**
     * Add Users' recent activity feature in dashboard
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function recentActivityUsersAction()
    { 
    	$melisKey = $this->params()->fromRoute('melisKey', '');
    	
    	$melisTranslation = $this->getServiceLocator()->get('MelisCoreTranslation');
    	$melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
    	$melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
    	$melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
    	
    	$melisKeys = $melisAppConfig->getMelisKeys();
    	$fullKey = $melisKeys['meliscore_dashboard_recent_activity_users'];
    	$fullKeyToolUser = $melisKeys['meliscore_tool_user'];
    	
    	// Check if User can access the users' tool for making links on users' names
    	$xmlRights = $melisCoreAuth->getAuthRights();
    	$isAccessible = $melisCoreRights->isAccessible($xmlRights, MelisCoreRightsService::MELISCORE_PREFIX_TOOLS, 'meliscore_tool_user');

    	$toolName = '';
    	$toolId = '';
    	$toolMelisKey = '';
    	$itemConfigToolUser = $melisAppConfig->getItem($fullKeyToolUser);
    	if ($itemConfigToolUser)
    	{
    		$toolName = $itemConfigToolUser['conf']['name'];
    		$toolId = $itemConfigToolUser['conf']['id'];
    		$toolMelisKey = $itemConfigToolUser['conf']['melisKey'];
    	}
    	else
    		$isAccessible = false; // Not possible in theory
    	
    	$container = new Container('meliscore');
    	$locale = $container['melis-lang-locale'];
    	$userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
    	$itemConfig = $melisAppConfig->getItem($fullKey);
    	
    	// Max lines
    	$maxLines = 8;
    	if (!empty($itemConfig['conf']['maxLines']))
    		$maxLines = $itemConfig['conf']['maxLines'];
    	
    	// Getting last users' logged in
    	$users = $userTable->getLastLoggedInUsers($maxLines);
    	if ($users)
    	{
    		$users = $users->toArray();
    		foreach ($users as $keyUser => $user)
    		{
    			$users[$keyUser]['usr_last_login_date'] = strftime($melisTranslation->getDateFormatByLocate($locale), strtotime($user['usr_last_login_date']));
    		}
    	}

    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
    	$view->users = $users;
    	$view->toolIsAccessible = $isAccessible;
    	$view->toolName = $toolName;
    	$view->toolId = $toolId;
    	$view->toolMelisKey = $toolMelisKey;
    	return $view;
    }

    public function lastActivityAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $view = new ViewModel();
        $view->melisKey = $melisKey;

        return $view;
    }
}
