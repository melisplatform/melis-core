<?php

namespace MelisCore\Service\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

use MelisCore\Service\MelisCoreGdprService;

class MelisCoreGdprServiceFactory implements FactoryInterface{
    public function createService(ServiceLocatorInterface $sl)
    {
        $melisCoreGdprService = new MelisCoreGdprService();
        $melisCoreGdprService->setServiceLocator($sl);
        return $melisCoreGdprService;
    }
}