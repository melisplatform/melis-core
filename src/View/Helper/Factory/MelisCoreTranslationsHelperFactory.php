<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\View\Helper\Factory;

use MelisCore\View\Helper\MelisTranslationHelper;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

class MelisCoreTranslationsHelperFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{
	    $serviceLoc = $sl->getServiceLocator();
		$helper = new MelisTranslationHelper($serviceLoc);
		
		return $helper;
	}

}