<?php

namespace MelisCore\Form;

use Laminas\Form\Form;
use Laminas\ServiceManager\ServiceLocatorAwareInterface;
use Laminas\ServiceManager\ServiceLocatorInterface;

class MelisForm extends Form implements ServiceLocatorAwareInterface
{
    /**
     * @var \Laminas\ServiceManager\ServiceLocatorInterface $serviceLocator
     */
    protected $serviceLocator;

    /**
     * @return \Laminas\ServiceManager\ServiceLocatorInterface
     */
    public function getServiceLocator()
    {
        return $this->serviceLocator;
    }

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
     * @param null $triggerEvent
     * @param array $params
     *
     * @return bool|\Laminas\EventManager\ResponseCollection
     */
    public  function isValid($triggerEvent = null, $params = [])
    {
        $data = null;
        $isValid = parent::isValid();

        if ($isValid) {
            $data = $this->data;

            /**
             * @var \Laminas\EventManager\EventManagerInterface $e
             */
            $e = $this->getServiceLocator()
                ->getServiceLocator()->get('eventmanager');

            if ($triggerEvent) {
                return $e->trigger($triggerEvent, $this, [
                    'elements' => $this->getElements(),
                    'data' => array_merge($data, $params)
                ]);
            }
        }

        return $isValid;

    }
}
