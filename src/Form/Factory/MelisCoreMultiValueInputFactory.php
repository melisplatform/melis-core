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
        $element->setAttribute('data-tags', '');
        $element->setAttribute('class', 'melis-multi-val-input');
        
        return $element;
    }
}