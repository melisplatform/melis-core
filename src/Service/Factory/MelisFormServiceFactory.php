<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use MelisCore\Service\MelisFormService;

class MelisFormServiceFactory implements FactoryInterface
{
    /**
     * @param \Zend\ServiceManager\ServiceLocatorInterface $sl
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
