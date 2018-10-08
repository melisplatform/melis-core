<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Zend\Form\Element\Textarea;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

/**
 * MelisCore TinyMCE textarea field
 */

class MelisCoreTinyMCEFactory extends Textarea implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $formElementManager)
    {
        $element = new Textarea;
        $element->setAttribute('meliscore-tinymce-textarea', true);

        return $element;
    }
}

