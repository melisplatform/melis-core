<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Psr\Container\ContainerInterface;
use Laminas\Form\Element\Select;
use Laminas\ServiceManager\ServiceManager;

/**
 * MelisCoreUserSelect
 *
 * Source:
 * https://select2.org/getting-started
 */

class MelisCoreUsersSelectFactory
{
    /**
     * @param ContainerInterface $container
     * @param $requestedName
     * @return Select
     */
    public function __invoke(ContainerInterface $container, $requestedName)
    {
        $element = new Select;
        $element->setValueOptions($this->loadValueOptions($container));
        return $element;
    }

    /**
     * @param ServiceManager $serviceManager
     * @return array
     */
    protected function loadValueOptions(ServiceManager $serviceManager)
    {
        $valueoptions = [];
        $tableLang = $serviceManager->get('MelisCoreTableUser');
        foreach ($tableLang->fetchAll() As $val)
            $valueoptions[$val->usr_id] = $val->usr_firstname.' '.$val->usr_lastname;

        return $valueoptions;
    }
}

