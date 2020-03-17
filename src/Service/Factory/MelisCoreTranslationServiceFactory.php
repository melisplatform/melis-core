<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service\Factory;

use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;
use MelisCore\Service\MelisCoreTranslationService;

class MelisCoreTranslationServiceFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{
		$melisCoreTranslation = new MelisCoreTranslationService();
		$melisCoreTranslation->setServiceLocator($sl);
		
		return $melisCoreTranslation;
	}

}