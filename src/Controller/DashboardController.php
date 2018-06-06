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
}
