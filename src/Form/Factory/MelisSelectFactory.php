<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Zend\Form\Element\Select;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

class MelisSelectFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $formElementManager)
	{
		$element = new Select;
		$element->setValueOptions($this->loadValueOptions($formElementManager));
		return $element;
	}

}