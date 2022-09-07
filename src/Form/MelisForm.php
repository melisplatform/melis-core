<?php

namespace MelisCore\Form;

use Laminas\EventManager\EventManager;
use Laminas\EventManager\EventManagerAwareInterface;
use Laminas\EventManager\EventManagerInterface;
use Laminas\Form\Form;
use Laminas\ServiceManager\ServiceManager;

class MelisForm extends Form implements EventManagerAwareInterface
{
    /**
     * @var $events
     */
    protected $events;

    /**
     * @param EventManagerInterface $events
     */
    public function setEventManager(EventManagerInterface $events)
    {
        $events->setIdentifiers([
            __CLASS__,
            get_class($this)
        ]);
        $this->events = $events;
    }

    /**
     * @return EventManagerInterface
     */
    public function getEventManager()
    {
        if (!$this->events) {
            $this->setEventManager(new EventManager());
        }
        return $this->events;
    }

    /**
     * @param null $triggerEvent
     * @param array $params
     *
     * @return bool|\Laminas\EventManager\ResponseCollection
     */
    public  function isValid($triggerEvent = null, $params = []): bool
    {
        $data = null;
        $isValid = parent::isValid();

        if ($isValid) {
            $data = $this->data;

            if ($triggerEvent) {
                return $this->getEventManager()->trigger($triggerEvent, $this, [
                    'elements' => $this->getElements(),
                    'data' => array_merge($data, $params)
                ]);
            }
        }

        return $isValid;
    }
}
