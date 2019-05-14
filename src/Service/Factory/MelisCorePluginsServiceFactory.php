<?php
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2019 Melis Technology (http://www.melistechnology.com)
 *
 */
namespace MelisCore\Service\Factory;

use MelisCore\Service\MelisCorePluginsService;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

class MelisCorePluginsServiceFactory implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $sl)
    {
        $service = new MelisCorePluginsService();
        $service->setServiceLocator($sl);
        $service->pluginsTbl = $sl->get('MelisPluginsTable');

        return $service;
    }

}