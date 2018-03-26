<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;
use MelisCore\Service\MelisCoreRightsService;

class DashboardPluginsController extends AbstractActionController
{
    public function renderDashboardPluginsAction()
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
    
    public function getPluginAction()
    {
        // return plugin view
    }
    
    public function savePluginAction()
    {
        // saving plugin to the dashboard
    }
    
    public function removePlugin()
    {
        // removing plugin from dashboard
    }
}