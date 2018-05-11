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
     * Shows the leftmenu dasboard entry point
     *
     * @return \Zend\View\Model\ViewModel
     */
    public function leftmenuDashboard2Action()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        
        return $view;
    }
    
    /**
     * Shows the leftmenu dasboard entry point
     *
     * @return \Zend\View\Model\ViewModel
     */
    public function dashboard2Action()
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
}
