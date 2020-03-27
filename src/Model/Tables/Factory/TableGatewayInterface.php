<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables\Factory;

use Laminas\Db\TableGateway\TableGateway;
use Laminas\ServiceManager\ServiceManager;

interface TableGatewayInterface
{
    /**
     * Set TableGateway
     * @param TableGateway $tableGateway
     */
    public function setTableGateway(TableGateway $tableGateway);

    /**
     * Set Servive Manager
     * @param ServiceManager $serviceManager
     */
    public function setServiceManager(ServiceManager $serviceManager);
}