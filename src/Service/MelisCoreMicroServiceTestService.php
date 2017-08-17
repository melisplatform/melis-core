<?php

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
class MelisCoreMicroServiceTestService implements ServiceLocatorAwareInterface
{
    public $serviceLocator;

    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;
        return $this;
    }

    public function getServiceLocator()
    {
        return $this->serviceLocator;
    }


    public function oneParam($fillMeIn)
    {
        $data = [];

        $data['what_was_received'] = $fillMeIn;

        return $data;
    }

    public function twoParams($fillMe, $andMe)
    {
        $data = [];

        $data['what_was_first_received'] = $fillMe;
        $data['what_was_the_last_argument_received'] = $andMe;

        return $data;
    }

    public function acceptArrayParam(array $arrayParam, $normalArg)
    {
        $data = [];

        $data['array_param'] = $arrayParam;
        $data['what_was_the_last_argument_received'] = $normalArg;

        return $data;
    }

}