<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\View\Helper\Factory;

use MelisCore\View\Helper\MelisCoreSectionIconsHelper;
use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;

class MelisCoreSectionIconsHelperFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{
	    $serviceLoc = $sl->getServiceLocator();
		$helper = new MelisCoreSectionIconsHelper($serviceLoc);
		
		return $helper;
	}

}