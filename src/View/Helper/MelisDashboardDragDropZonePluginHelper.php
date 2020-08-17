<?php

namespace MelisCore\View\Helper;

use Laminas\ServiceManager\ServiceManager;
use Laminas\View\Helper\AbstractHelper;
use MelisCore\Library\MelisAppConfig;

class MelisDashboardDragDropZonePluginHelper extends AbstractHelper
{
	public $serviceManager;

	public function setServiceManager(ServiceManager $serviceManager)
    {
        $this->serviceManager = $serviceManager;
    }
	
	public function __invoke($dashboardId)
	{
	    $melisDashboardDragDropZone = $this->serviceManager->get('ControllerPluginManager')->get('MelisCoreDashboardDragDropZonePlugin');
		
	    $melisDashboardDragDropZoneView = $melisDashboardDragDropZone->render(array(
	        'dashboard_id' => $dashboardId,
		));
		
		$viewRender = $this->serviceManager->get('ViewRenderer');
		$dom = $viewRender->render($melisDashboardDragDropZoneView);
		
		return $dom;
		
	}
}