<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Psr\Container\ContainerInterface;
use Laminas\Form\Element\Text;

/**
 * MelisCore date field
 *
 * Source:
 * https://cdnjs.com/libraries/bootstrap-datetimepicker
 * http://eonasdan.github.io/bootstrap-datetimepicker/
 */

class DatePickerFactory extends Text
{
    public function __invoke(ContainerInterface $container, $requestedName)
    {
        $element = new Text;
        $element->setAttribute('meliscore-datetimepicker', true);
        $element->setAttribute('melis-datepicker', true);

        return $element;
    }
}

