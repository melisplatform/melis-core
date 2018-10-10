<?php

namespace MelisCore\Form;

use Zend\Form\Form;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;

class MelisForm extends Form implements ServiceLocatorAwareInterface
{
    /**
     * @var \Zend\ServiceManager\ServiceLocatorInterface $serviceLocator
     */
    protected $serviceLocator;

    /**
     * @return \Zend\ServiceManager\ServiceLocatorInterface
     */
    public function getServiceLocator()
    {
        return $this->serviceLocator;
    }

    /**
     * @param \Zend\ServiceManager\ServiceLocatorInterface $sl
     *
     * @return $this
     */
    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;

        return $this;
    }

    /**
     * @param null $triggerEvent
     * @param array $params
     *
     * @return bool|\Zend\EventManager\ResponseCollection
     */
    public  function isValid($triggerEvent = null, $params = [])
    {
        $data = null;
        $isValid = parent::isValid();

        if ($isValid) {
            $data = $this->data;

            /**
             * @var \Zend\EventManager\EventManagerInterface $e
             */
            $e = $this->getServiceLocator()
                ->getServiceLocator()->get('eventmanager');

            if ($triggerEvent) {
                return $e->trigger($triggerEvent, $this, array_merge($data, $params));
            }
        }

        return $isValid;

    }
}
