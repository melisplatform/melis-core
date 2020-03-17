<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;
use Laminas\Form\Element\Text;

class MelisCoreMultiValueInputFactory extends Text implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $formElementManager)
    {
        $element = new Text;
        // added melis-multi-val-input for multiple input
        $element->setAttribute('data-tags', '');
        $element->setAttribute('class', 'melis-multi-val-input');
        
        return $element;
    }
}