<?php

namespace MelisCore\Service;

use Laminas\Form\Factory as LaminasFormFactory;
use Laminas\Hydrator\ArraySerializable;
use Laminas\ServiceManager\ServiceManager;
use MelisCore\Form\MelisForm;

class MelisFormService extends LaminasFormFactory
{
    /**
     * @var Laminas\ServiceManager\ServiceManager $serviceManager
     */
    protected $serviceManager;

    /**
     * @param ServiceManager $service
     */
    public function setServiceManager(ServiceManager $service)
    {
        $this->serviceManager = $service;
    }

    /**
     * @return Laminas\ServiceManager\ServiceManager
     */
    public function getServiceManager()
    {
        return $this->serviceManager;
    }

    /**
     * Create a form
     *
     * @param  array $spec
     * @return ElementInterface
     */
    public function createForm($spec)
    {
        if (! isset($spec['type']))
            $spec['type'] = MelisForm::class;

        if (!isset($spec['hydrator']))
            $spec['hydrator'] = ArraySerializable::class;

        return $this->create($spec);
    }
}
