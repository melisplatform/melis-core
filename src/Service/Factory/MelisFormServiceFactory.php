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
use MelisCore\Service\MelisFormService;

class MelisFormServiceFactory implements FactoryInterface
{
    /**
     * @param \Laminas\ServiceManager\ServiceLocatorInterface $sl
     *
     * @return \MelisCore\Service\MelisFormService|mixed
     */
    public function createService(ServiceLocatorInterface $sl)
    {
        $service = new MelisFormService();
        $service->setServiceLocator($sl);

        return $service;
    }

}
