<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service\Factory;

use MelisCore\Service\MelisCoreCreatePasswordService;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

class MelisCoreCreatePasswordServiceFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{
		$melisCoreCreatePass = new MelisCoreCreatePasswordService();
        $melisCoreCreatePass->setServiceLocator($sl);
		
		return $melisCoreCreatePass;
	}

}