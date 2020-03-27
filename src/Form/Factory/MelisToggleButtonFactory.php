<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Interop\Container\ContainerInterface;
use Laminas\Form\Element\Checkbox;

/**
 * Creates a toggle button by using a checkbox element, 
 * toggle button is being shown once it renders to the 
 * templates theme and features.<br/>
 * Files needed:
 * bootstrap-switch.js?v=v1.2.3 & bootstrap-switch.init.js?v=v1.2.3
 */
class MelisToggleButtonFactory
{
    /**
     * @param ContainerInterface $container
     * @param $requestedName
     * @return Checkbox
     */
    public function __invoke(ContainerInterface $container, $requestedName)
    {
        $element = new Checkbox;
        $element->setAttribute('class', 'switch');
        return $element;
    }
}

