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

class MelisCoreTableColumnDisplayListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $sharedEvents      = $events->getSharedManager();

        $this->attachEventListener(
            $events,
            '*',
            'melis_tool_column_display_dot_color',
            function($e){

                $sm = $e->getTarget()->getServiceManager();
                $params = $e->getParams();

                $params['data'] = '<span class="text-'.($params['data'] ? 'success' : 'danger').'"><i class="fa fa-fw fa-circle"></i></span>';
            }
        );

        $this->attachEventListener(
            $events,
            '*',
            'melis_tool_column_display_char_length_limit',
            function($e){

                $sm = $e->getTarget()->getServiceManager();
                $params = $e->getParams();

                $str = $params['data'];
                $charLimit = !empty($params['char_limit']) ? $params['char_limit'] : 50 ;

                if (strlen($str) > $charLimit)
                    $str = substr($str, 0, $charLimit) . '...';

                $params['data'] = $str;
            }
        );

        $this->attachEventListener(
            $events,
            '*',
            'melis_tool_column_display_admin_name',
            function($e){

                $sm = $e->getTarget()->getServiceManager();
                $params = $e->getParams();

                $tblUser  = $sm->get('MelisCoreTableUser');
                $userData = $tblUser->getEntryById($params['data'])->current();

                $str = $params['data'];
                if (!empty($userData))
                    $str = $userData->usr_firstname . ' ' . $userData->usr_lastname;

                $params['data'] = $str;
            }
        );
    }
}