<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Laminas\Form\Element\Textarea;
use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;

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

