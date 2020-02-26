<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;

class MelisGdprAutoDeleteModuleListSelectFactory extends MelisSelectFactory
{
    /**
     * @param ServiceLocatorInterface $serviceLocator
     * @return array
     */
    protected function loadValueOptions(ServiceLocatorInterface $serviceLocator)
    {
        return $serviceLocator->getServiceLocator()->get('MelisCoreGdprAutoDeleteService')->getAutoDeleteModulesList();
    }

}