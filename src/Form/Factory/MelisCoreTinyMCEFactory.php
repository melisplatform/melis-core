<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Psr\Container\ContainerInterface;
use Laminas\Form\Element\Textarea;

/**
 * MelisCore TinyMCE textarea field
 */

class MelisCoreTinyMCEFactory extends Textarea
{
    public function __invoke(ContainerInterface $container, $requestedName)
    {
        $element = new Textarea;
        $element->setAttribute('meliscore-tinymce-textarea', true);

        return $element;
    }
}

