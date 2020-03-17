<?php

namespace MelisCore\Service;

use Laminas\ServiceManager\ServiceLocatorAwareInterface;
use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\Form\Factory as LaminasFormFactory;
use MelisCore\Form\MelisForm;

class MelisFormService extends LaminasFormFactory implements ServiceLocatorAwareInterface
{
    /**
     * @var \Laminas\ServiceManager\ServiceLocatorInterface $serviceLocator
     */
    public $serviceLocator;

    /**
     * @param \Laminas\ServiceManager\ServiceLocatorInterface $sl
     *
     * @return $this
     */
    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;
        return $this;
    }

    /**
     * @return \Laminas\ServiceManager\ServiceLocatorInterface
     */
    public function getServiceLocator()
    {
        return $this->serviceLocator;
    }

    /**
     * Create a form
     *
     * @param  array $spec
     * @return ElementInterface
     */
    public function createForm($spec)
    {
        if (! isset($spec['type'])) {
            $spec['type'] = MelisForm::class;
        }

        return $this->create($spec);
    }
}
