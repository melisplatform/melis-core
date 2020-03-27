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
 * Melis Text Input Element
 */
class MelisTextFactory
{
    /**
     * @param ContainerInterface $container
     * @param string $requestedName
     * @return Text|object
     */
    public function __invoke(ContainerInterface $container, $requestedName)
    {
        $element = new Text;

        $element->setAttribute('class', 'form-control');
        $element->setLabelOption('class','col-sm-2 control-label');

        return $element;
    }
}

