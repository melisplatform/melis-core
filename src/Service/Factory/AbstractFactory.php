<?php
namespace MelisCore\Service\Factory;

use Interop\Container\ContainerInterface;
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