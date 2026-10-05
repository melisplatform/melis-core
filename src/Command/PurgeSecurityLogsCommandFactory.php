<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Command;

use Interop\Container\ContainerInterface;

/**
 * Builds the purge command with the service manager, same pattern as MelisCron's own command.
 */
class PurgeSecurityLogsCommandFactory
{
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)
    {
        $instance = new $requestedName();
        $instance->setServiceManager($container);

        return $instance;
    }
}
