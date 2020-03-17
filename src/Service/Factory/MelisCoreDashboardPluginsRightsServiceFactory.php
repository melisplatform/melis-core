<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2019 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service\Factory;

use MelisCore\Service\MelisCoreDashboardPluginsRightsService;
use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;

class MelisCoreDashboardPluginsRightsServiceFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{
		$melisCoreDashboardPluginsRightsService = new MelisCoreDashboardPluginsRightsService();
        $melisCoreDashboardPluginsRightsService->setServiceLocator($sl);
		
		return $melisCoreDashboardPluginsRightsService;
	}

}