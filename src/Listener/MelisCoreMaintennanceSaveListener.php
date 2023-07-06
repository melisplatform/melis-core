<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisGeneralListener;
use Laminas\Session\Container;
use Laminas\Stdlib\ArrayUtils;

class MelisCoreMaintennanceSaveListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
            'Systemmaintenance',
            'systemmaintenance_properties_save_start',
            function($e){

                $result = $this->dispatchPlugin(
                    $e,
                    'Systemmaintenance\Controller\Properties',
                    ['action' => 'saveProperties']
                );



                $container = new Container('systemmaintenance');
                $container['systemmaintenance-save-action'] = $result;

            }
        );
    }

    private function dispatchPlugin($e, $ctrl, $vars)
    {
        $resultForward = $e->getTarget()->forward()->dispatch($ctrl, $vars);

        return $resultForward->getVariables();
    }
}