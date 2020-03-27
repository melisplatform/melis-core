<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Interop\Container\ContainerInterface;
use Laminas\Form\Element\Text;

class MelisCoreMultiValueInputFactory extends Text
{
    /**
     * @param ContainerInterface $container
     * @param $requestedName
     * @return Text
     */
    public function __invoke(ContainerInterface $container, $requestedName)
    {
        $element = new Text;
        // added melis-multi-val-input for multiple input
        $element->setAttribute('data-tags', '');
        $element->setAttribute('class', 'melis-multi-val-input');
        
        return $element;
    }
}