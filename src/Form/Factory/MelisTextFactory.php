<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory; 

use Zend\Form\Element\Text;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
/**
 * Melis Text Input Element
 * 
 */

class MelisTextFactory implements FactoryInterface
{
    /**
     * {@inheritDoc}
     * @see \Zend\ServiceManager\FactoryInterface::createService()
     */
    public function createService(ServiceLocatorInterface $formElementManager)
    {
        $element = new Text;

        $element->setAttribute('class', 'form-control');
        $element->setLabelOption('class','col-sm-2 control-label');
        
        return $element;
    }
    
}

