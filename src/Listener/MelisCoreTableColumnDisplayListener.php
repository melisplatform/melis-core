<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;

class MelisCoreTableColumnDisplayListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();

        $this->listeners[] = $sharedEvents->attach(
            '*',
            'melis_tool_column_display_dot_color',
            function($e){

                $sm = $e->getTarget()->getServiceLocator();
                $params = $e->getParams();

                $params['data'] = '<span class="text-'.($params['data'] ? 'success' : 'danger').'"><i class="fa fa-fw fa-circle"></i></span>';
            }
        );

        $this->listeners[] = $sharedEvents->attach(
            '*',
            'melis_tool_column_display_char_length_limit',
            function($e){

                $sm = $e->getTarget()->getServiceLocator();
                $params = $e->getParams();

                $str = $params['data'];
                $charLimit = !empty($params['char_limit']) ? $params['char_limit'] : 50 ;

                if (strlen($str) > $charLimit)
                    $str = substr($str, 0, $charLimit) . '...';

                $params['data'] = $str;
            }
        );
    }
}