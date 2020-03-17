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
use MelisCore\Service\MelisCoreImageService;

class MelisCoreImageServiceFactory implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $sl)
    {
        $melisCoreImage = new MelisCoreImageService();
        $melisCoreImage->setServiceLocator($sl);

        return $melisCoreImage;
    }

}
