<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2019 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use Zend\Db\ResultSet\HydratingResultSet;
use Zend\Db\TableGateway\TableGateway;
use Zend\Stdlib\Hydrator\ObjectProperty;

use MelisCore\Model\MelisPlugins;
use MelisCore\Model\Tables\MelisPluginsTable;

class MelisCorePluginsTableFactory implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $sl)
    {
        $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisPlugins());
        $tableGateway = new TableGateway('melis_plugins', $sl->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);

        return new MelisPluginsTable($tableGateway);
    }

}