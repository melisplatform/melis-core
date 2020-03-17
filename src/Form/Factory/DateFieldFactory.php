<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory; 

use Laminas\Form\Element\Text;
use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;

/**
 * Melis commerce date field
 */

class DateFieldFactory extends Text implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $formElementManager)
    { 
        $element = new Text;        
        $element->setAttribute('class', 'form-control melis-date');
        
        return $element;
    }
}

