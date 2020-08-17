<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Laminas\ServiceManager\ServiceManager;

class MelisGdprAutoDeleteModuleListSelectFactory extends MelisSelectFactory
{
    /**
     * @param ServiceManager $serviceManager
     * @return array
     */
    protected function loadValueOptions(ServiceManager $serviceManager)
    {
        return $serviceManager->get('MelisCoreGdprAutoDeleteToolService')->getAutoDeleteModulesList();
    }
}