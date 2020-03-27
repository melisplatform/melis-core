<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Laminas\View\Model\ViewModel;
use Laminas\Session\Container;

use MelisCore\Service\MelisCoreRightsService;

/**
 * This class renders Melis CMS Dashboard
*/
class DashboardController extends AbstractActionController
{
	/**
	 * Shows the leftmenu dasboard entry point
	 * 
	 * @return \Laminas\View\Model\ViewModel
	 */
    public function leftmenuDashboardAction()
    {
    	$melisKey = $this->params()->fromRoute('melisKey', '');
    	
    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
    	 
    	return $view;
    }
}
