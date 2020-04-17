<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisCoreGeneralListener;
class MelisCoreMicroServiceRouteParamListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{

    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
            'MelisCore',
            'melis_core_microservice_route_param',
            function($e){

                $sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
                $params = $e->getParams();

                $module  = isset($params['module'])  ? $params['module']  : null;
                $service = isset($params['service']) ? $params['service'] : null;
                $method  = isset($params['method'])  ? $params['method']  : null;
                $post    = isset($params['post'])  ? $params['post']  : null;

                //
                if($module == 'MelisCore' && $service == 'MelisCoreMicroServiceTestService' && $method == 'acceptArrayParam') {

                    /**
                     * This listens to the sample service test
                     * /melis/api/abcd123/MelisCore/service/MelisCoreMicroServiceTestService/acceptArrayParam
                     */

                    /**
                     * This explodes the string coming from arrayParam post value
                     * Sample string value: 1,3,1,4,1
                     */
                    $post['arrayParam'] = explode(',', $post['arrayParam']);
                }

                return array(
                    'module'  => $module,
                    'service' =>  $service,
                    'method'  => $method,
                    'post'    => $post
                );
            },
            -10000
        );
    }
}