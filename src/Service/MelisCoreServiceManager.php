<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use Laminas\ServiceManager\ServiceManager;

/**
 *
 * This service handles the Service Manager
 *
 */
class MelisCoreServiceManager
{
    /**
     * @var Laminas\ServiceManager\ServiceManager $serviceManager
     */
    protected $serviceManager;

    /**
     * @param ServiceManager $service
     */
    public function setServiceManager(ServiceManager $service)
    {
        $this->serviceManager = $service;
    }

    /**
     * @return Laminas\ServiceManager\ServiceManager
     */
    public function getServiceManager()
    {
        return $this->serviceManager;
    }
}