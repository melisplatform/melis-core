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

class MelisCoreLogTypeSelectFactory extends MelisSelectFactory
{
    protected function loadValueOptions(ServiceManager $serviceManager)
    {
        $logTypeTable = $serviceManager->get('MelisCoreTableLogType');
        $valueoptions = [];

        foreach ($logTypeTable->getLogTypeOrderByCode() As $val)
            $valueoptions[$val->logt_id] = $val->logt_code;

		return $valueoptions;
	}
}