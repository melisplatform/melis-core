<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Zend\Form\Element\Text;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

/**
 * MelisCore date field
 *
 * Source:
 * https://cdnjs.com/libraries/bootstrap-datetimepicker
 * http://eonasdan.github.io/bootstrap-datetimepicker/
 */

class DatePickerFactory extends Text implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $formElementManager)
    {
        $element = new Text;
        $element->setAttribute('meliscore-datetimepicker', true);
        $element->setAttribute('melis-datepicker', true);

        return $element;
    }
}

