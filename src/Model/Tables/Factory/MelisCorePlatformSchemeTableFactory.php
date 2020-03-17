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

use MelisCore\Model\MelisPlatformScheme;
use MelisCore\Model\Tables\MelisPlatformSchemeTable;

class MelisCorePlatformSchemeTableFactory implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $sl)
    {
        $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisPlatformScheme());
        $tableGateway = new TableGateway('melis_core_platform_scheme', $sl->get('Laminas\Db\Adapter\Adapter'), null, $hydratingResultSet);

        return new MelisPlatformSchemeTable($tableGateway);
    }

}