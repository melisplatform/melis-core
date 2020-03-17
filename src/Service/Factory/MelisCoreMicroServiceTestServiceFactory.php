<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service\Factory;

use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;

use MelisCore\Service\MelisCoreMicroServiceTestService;

class MelisCoreMicroServiceTestServiceFactory implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $sl)
    {
        $service = new MelisCoreMicroServiceTestService();
        $service->setServiceLocator($sl);

        return $service;
    }
}