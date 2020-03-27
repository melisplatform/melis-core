<?php
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */
namespace MelisCore\Service\Factory;

use Psr\Container\ContainerInterface;
use Laminas\ServiceManager\Factory\AbstractFactoryInterface;

class AbstractFactory
{
    public function __invoke(ContainerInterface $container, $requestedName)
    {
        $instance = new $requestedName();
        $instance->setServiceManager($container);
        return $instance;
    }
}