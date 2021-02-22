<?php

namespace MelisCore\View\Helper;

use Laminas\ServiceManager\ServiceManager;
use Laminas\View\Helper\AbstractHelper;

class MelisDashboardBubblePluginsZoneHelper extends AbstractHelper
{
    public $serviceManager;

    public function setServiceManager(ServiceManager $serviceManager)
    {
        $this->serviceManager = $serviceManager;
    }

    public function __invoke()
    {
        $melisDashboardDragDropZone = $this->serviceManager->get('ControllerPluginManager')->get('MelisCoreDashboardBubblePlugin');

        $melisDashboardDragDropZoneView = $melisDashboardDragDropZone->render();

        $viewRender = $this->serviceManager->get('ViewRenderer');
        $dom = $viewRender->render($melisDashboardDragDropZoneView);

        return $dom;
    }
}