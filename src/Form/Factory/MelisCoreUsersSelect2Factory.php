<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Zend\Form\Element\Select;
use Zend\ServiceManager\FactoryInterface;
use Zend\ServiceManager\ServiceLocatorInterface;

/**
 * MelisCoreUserSelect using Select2
 *
 * Source:
 * https://select2.org/getting-started
 */

class MelisCoreUsersSelect2Factory implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $formElementManager)
    {
        $element = new Select;
        $element->setValueOptions($this->loadValueOptions($formElementManager));
        $element->setAttribute('meliscore-user-select2', true);
        return $element;
    }

    protected function loadValueOptions(ServiceLocatorInterface $formElementManager)
    {
        $serviceManager = $formElementManager->getServiceLocator();

        $tableLang = $serviceManager->get('MelisCoreTableUser');
        $languages = $tableLang->fetchAll();

        $valueoptions = array();
        foreach ($languages As $val){
            $valueoptions[$val->usr_id] = $val->usr_firstname.' '.$val->usr_lastname;
        }

        return $valueoptions;
    }
}

