<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\View\Helper\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use MelisCore\View\Helper\MelisDashboardDragDropZonePluginHelper;

class MelisDashboardDragDropZonePluginFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{
	    $serviceLoc = $sl->getServiceLocator();
	    $helper = new MelisDashboardDragDropZonePluginHelper($serviceLoc);
		
		return $helper;
	}
}