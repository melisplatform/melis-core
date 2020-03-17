<?php

namespace MelisCore\Service\Factory;

use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;

use MelisCore\Service\MelisCoreGdprService;

class MelisCoreGdprServiceFactory implements FactoryInterface{
    public function createService(ServiceLocatorInterface $sl)
    {
        $melisCoreGdprService = new MelisCoreGdprService();
        $melisCoreGdprService->setServiceLocator($sl);
        return $melisCoreGdprService;
    }
}