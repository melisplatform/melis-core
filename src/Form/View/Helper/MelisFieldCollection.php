<?php

namespace Meliscore\Form\View\Helper;

use Zend\Form\View\Helper\FormCollection;
use Zend\Form\ElementInterface;

class MelisFieldCollection extends FormCollection
{
    protected $shouldWrap = false;
    protected $defaultElementHelper = 'MelisFieldRow';

    public function __invoke(ElementInterface $element = null, $wrap = false)
    {
        $wrap = $this->shouldWrap;

        if (! $element) {
            return $this;
        }

        $this->setShouldWrap($wrap);

        return $this->render($element);
    }
}