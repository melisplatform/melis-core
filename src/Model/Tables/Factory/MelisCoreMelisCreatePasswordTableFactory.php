<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables\Factory;

use MelisCore\Model\MelisCreatePassword;
use MelisCore\Model\Tables\MelisCreatePasswordTable;
use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;
use Laminas\Db\ResultSet\HydratingResultSet;
use Laminas\Db\TableGateway\TableGateway;
use Laminas\Stdlib\Hydrator\ObjectProperty;

class MelisCoreMelisCreatePasswordTableFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{
    	$hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisCreatePassword());
    	$tableGateway = new TableGateway('melis_core_create_password', $sl->get('Laminas\Db\Adapter\Adapter'), null, $hydratingResultSet);
		
    	return new MelisCreatePasswordTable($tableGateway);
	}

}