<?php

namespace MelisCore\View\Helper;

use Zend\View\Helper\AbstractHelper;
use MelisCore\Library\MelisAppConfig;

class MelisDashboardDragDropZonePluginHelper extends AbstractHelper
{
	public $serviceManager;

	public function __construct($sm)
	{
		$this->serviceManager = $sm;
	}
	
	public function __invoke($dashboardId)
	{
	    $melisDashboardDragDropZone = $this->serviceManager->get('ControllerPluginManager')->get('MelisDashboardDragDropZonePlugin');
		
	    $melisDashboardDragDropZoneView = $melisDashboardDragDropZone->render(array(
	        'dashboard_id' => $dashboardId,
		));
		
		$viewRender = $this->serviceManager->get('ViewRenderer');
		$dom = $viewRender->render($melisDashboardDragDropZoneView);
		
		return $dom;
		
	}
}