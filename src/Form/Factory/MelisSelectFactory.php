<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Laminas\Form\Element\Select;
use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;

class MelisSelectFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $formElementManager)
	{
		$element = new Select;
		$element->setValueOptions($this->loadValueOptions($formElementManager));
		return $element;
	}

}