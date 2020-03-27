<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Interop\Container\ContainerInterface;
use Laminas\Form\Element\Select;

class MelisSelectFactory
{
    /**
     * @param ContainerInterface $container
     * @param $requestedName
     * @return Select
     */
    public function __invoke(ContainerInterface $container, $requestedName)
    {
		$element = new Select;
		$element->setValueOptions($this->loadValueOptions($container));

		return $element;
	}
}