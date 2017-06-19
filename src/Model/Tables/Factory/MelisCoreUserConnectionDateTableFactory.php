<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use Zend\Db\ResultSet\HydratingResultSet;
use Zend\Db\TableGateway\TableGateway;
use Zend\Stdlib\Hydrator\ObjectProperty;

use MelisCore\Model\MelisUserConnectionDate;
use MelisCore\Model\Tables\MelisUserConnectionDateTable;

class MelisCoreUserConnectionDateTableFactory implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $sl)
    {
        $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisUserConnectionDate());
        $tableGateway = new TableGateway('melis_core_user_connection_date', $sl->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);

        return new MelisUserConnectionDateTable($tableGateway);
    }

}