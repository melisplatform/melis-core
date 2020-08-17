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
 * Melis commerce date field
 */

class DateFieldFactory extends Text
{
    public function __invoke(ContainerInterface $container, $requestedName)
    { 
        $element = new Text;        
        $element->setAttribute('class', 'form-control melis-date');
        
        return $element;
    }
}

