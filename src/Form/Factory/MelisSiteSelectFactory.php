<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Laminas\ServiceManager\ServiceManager;
use MelisCore\Form\Factory\MelisSelectFactory;

class MelisSiteSelectFactory extends MelisSelectFactory
{
    protected function loadValueOptions(ServiceManager $serviceManager)
    {
		$tableSite = $serviceManager->get('MelisEngineTableSite');

		$valueoptions = [];
		foreach ($tableSite->fetchAll() As $site)
            $valueoptions[$site->site_id] = !empty($site->site_label) ? $site->site_label : $site->site_name;
		
		return $valueoptions;
	}
}