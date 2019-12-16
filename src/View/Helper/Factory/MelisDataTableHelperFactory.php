<?php

namespace MelisCore\View\Helper\Factory;

use MelisCore\View\Helper\MelisDataTableHelper;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

class MelisDataTableHelperFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{
		$serviceLoc = $sl->getServiceLocator();
		$helper = new MelisDataTableHelper($serviceLoc);
	    
	    return $helper;
	}
}