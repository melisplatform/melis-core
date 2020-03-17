<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Laminas\Form\Element\Checkbox;
use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;

/**
 * Creates a toggle button by using a checkbox element, 
 * toggle button is being shown once it renders to the 
 * templates theme and features.<br/>
 * Files needed:
 * bootstrap-switch.js?v=v1.2.3 & bootstrap-switch.init.js?v=v1.2.3
 */
class MelisToggleButtonFactory implements FactoryInterface
{
    /**
     * {@inheritDoc}
     * @see \Laminas\ServiceManager\FactoryInterface::createService()
     */
    public function createService(ServiceLocatorInterface $formElementManager)
    {
        $element = new Checkbox;
        $element->setAttribute('class', 'switch');
        return $element;
    }
    
}

