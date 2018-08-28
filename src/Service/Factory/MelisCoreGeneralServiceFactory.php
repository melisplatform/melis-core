<?php

namespace MelisCore\Service\Factory;


use MelisCore\Service\MelisCoreGeneralService;
use Zend\ServiceManager\FactoryInterface;
use Zend\ServiceManager\ServiceLocatorInterface;

class MelisCoreGeneralServiceFactory implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $sl)
    {
        $melisCoreGeneral = new MelisCoreGeneralService();
        $melisCoreGeneral->setServiceLocator($sl);

        return $melisCoreGeneral;
    }
}