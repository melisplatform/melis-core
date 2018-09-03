<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisCoreGeneralListener;

class MelisCoreAuthSuccessListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{

    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();

        $callBackHandler = $sharedEvents->attach(
            'MelisCore',
            array(
                'melis_core_auth_login_ok',
            ),
            function($e){

                $sm        = $e->getTarget()->getServiceLocator();
                $table     = $sm->get('MelisUserConnectionDate');
                $params    = $e->getParams();
                $userTable = $sm->get('MelisCoreTableUser');
                $authSvc   = $sm->get('MelisCoreAuth');

                // update the session last_login_date
                $user = $authSvc->getStorage()->read();

                if (!empty($user)) {
                    $user->usr_last_login_date = $params['login_date'];
                    $isOnline                  = (bool) $user->usr_is_online;

                    if (!$isOnline) {
                        $table->save([
                            'usrcd_usr_login'            => $params['usr_id'],
                            'usrcd_last_login_date'      => $params['login_date'],
                            'usrcd_last_connection_time' => $params['login_date'],
                        ]);
                    }

                    $userTable->save(array(
                        'usr_last_login_date' => $params['login_date'],
                        'usr_is_online'       => true,
                    ), $params['usr_id']);

                    // update rights to a new rights structure
                    $oldToolNode = 'meliscore_tools>';
                    $newToolNode = 'meliscore_leftmenu>';
                    $rightsXml   = $user->usr_rights;

                    // update rights to a new rights structure
                    $oldToolNode = 'meliscore_tools';
                    $newToolNode = 'meliscore_leftmenu';
                    $rightsXml   = $user->usr_rights;
                    if (mb_strpos($rightsXml, $oldToolNode) !== false) {
                        $newRightsXml = preg_replace("/$oldToolNode\/>/", $newToolNode.'>', $rightsXml);
                        $user->usr_rights = $newRightsXml;
                    }
                }
            },
            -10000);

        $this->listeners[] = $callBackHandler;
    }
}
