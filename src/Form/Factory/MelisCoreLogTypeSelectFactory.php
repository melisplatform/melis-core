<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Laminas\ServiceManager\ServiceLocatorInterface;
use MelisCore\Form\Factory\MelisSelectFactory;

class MelisCoreLogTypeSelectFactory extends MelisSelectFactory
{
	protected function loadValueOptions(ServiceLocatorInterface $formElementManager)
	{
        $serviceManager = $formElementManager->getServiceLocator();

        $logTypeTable = $serviceManager->get('MelisCoreTableLogType');
        $logType = $logTypeTable->getLogTypeOrderByCode();
        $valueoptions = array();

        foreach ($logType As $val)
        {
            $valueoptions[$val->logt_id] = $val->logt_code;
        }

		return $valueoptions;
	}
}