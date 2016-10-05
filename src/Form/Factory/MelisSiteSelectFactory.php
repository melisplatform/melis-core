<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;
use MelisCore\Form\Factory\MelisSelectFactory;

class MelisSiteSelectFactory extends MelisSelectFactory
{
	protected function loadValueOptions(ServiceLocatorInterface $formElementManager)
	{
		$serviceManager = $formElementManager->getServiceLocator();

		$tableSite = $serviceManager->get('MelisEngineTableSite');
		$sites = $tableSite->fetchAll();
		
		$valueoptions = array();
		$max = $sites->count();
		for ($i = 0; $i < $max; $i++)
		{
			$site = $sites->current();
			$valueoptions[$site->site_id] = $site->site_name;
			$sites->next();
		}
		
		return $valueoptions;
	}

}