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

use MelisCore\Model\MelisPlatformColor;
use MelisCore\Model\Tables\MelisPlatformColorTable;

class MelisCorePlatformColorTableFactory implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $sl)
    {
        $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisPlatformColor());
        $tableGateway = new TableGateway('melis_core_platform_color', $sl->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);

        return new MelisPlatformColorTable($tableGateway);
    }

}