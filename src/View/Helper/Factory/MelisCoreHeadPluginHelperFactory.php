<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\View\Helper\Factory;

use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;
use MelisCore\View\Helper\MelisCoreHeadPluginHelper;

class MelisCoreHeadPluginHelperFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{
	    $serviceLoc = $sl->getServiceLocator();
		$helper = new MelisCoreHeadPluginHelper($serviceLoc);
		
		return $helper;
	}

}