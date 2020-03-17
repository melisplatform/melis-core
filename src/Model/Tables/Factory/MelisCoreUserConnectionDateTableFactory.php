<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables\Factory;

use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;
use Laminas\Db\ResultSet\HydratingResultSet;
use Laminas\Db\TableGateway\TableGateway;
use Laminas\Stdlib\Hydrator\ObjectProperty;

use MelisCore\Model\MelisUserConnectionDate;
use MelisCore\Model\Tables\MelisUserConnectionDateTable;

class MelisCoreUserConnectionDateTableFactory implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $sl)
    {
        $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisUserConnectionDate());
        $tableGateway = new TableGateway('melis_core_user_connection_date', $sl->get('Laminas\Db\Adapter\Adapter'), null, $hydratingResultSet);

        return new MelisUserConnectionDateTable($tableGateway);
    }

}