<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables\Factory;

use Psr\Container\ContainerInterface;
use Laminas\Db\Adapter\Adapter;
use Laminas\Db\TableGateway\TableGateway;
use Laminas\Stdlib\Hydrator\ObjectProperty;

class AbstractTableGatewayFactory
{
    public function __invoke(ContainerInterface $container, $requestedName)
    {
        // Requested class instance
        $instance = new $requestedName();

        $resultSetPrototype = null;
        if (method_exists($instance, 'hydratingResultSet')) {
            $resultSetPrototype = $instance->hydratingResultSet();
        }

        // TableGateway
        $tableGateway = new TableGateway(
            $instance::TABLE,
            $container->get(Adapter::class),
            null,
            $resultSetPrototype);
        // TableGateway requested class setter
        $instance->setTableGateway($tableGateway);
        // Service manager instance
        $instance->setServiceManager($container);

        return $instance;
    }
}