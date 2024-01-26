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
use Laminas\Mvc\MvcEvent;
use Laminas\Session\Container;

class MelisCoreCheckUserRightsListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    const INTERVAL_TO_UPDATE = 5;

    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
            '*',
            MvcEvent::EVENT_DISPATCH,
            function ($e) {

                $sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
                // update the session last check and interval
                $container  = new Container('meliscore');
                $userSvc    = $sm->get('MelisCoreAuth');
                $user       = $userSvc->getIdentity();
                $difference = 0;
                if(!empty($container->melis_user_session_last_update)) {
                    $lastUpdate = new \DateTime(date('H:i:s', strtotime($container->melis_user_session_last_update)));
                    $timeNow = new \DateTime(date("H:i:s"));
                    $difference = $lastUpdate->diff($timeNow)->i;
                }

                // checks the user accessibility in every 5 minutes
                if($difference >= self::INTERVAL_TO_UPDATE) {

                    $container->melis_user_session_last_update = date('H:i:s');
                    $uri  = $_SERVER['REQUEST_URI'];

                    if ($userSvc->hasIdentity()) {
                        $userId   = (int) $user->usr_id;
                        $tblUser  = $sm->get('MelisCoreTableUser');
                        $userData = $tblUser->getEntryById($userId)->current();

                        if (empty($userData)) {
                            $e->getTarget()->forward()->dispatch(
                                'MelisCore\Controller\MelisAuth',array('action' => 'logout'));
                            // force redirect to login
                            $e->getTarget()->plugin('redirect')->toUrl('/melis/login');
                        }  else {
                            $isActive= (bool) $userData->usr_status;
                            // check if the user is still active
                            if (!$isActive) {
                                $e->getTarget()->forward()->dispatch(
                                    'MelisCore\Controller\MelisAuth',array('action' => 'logout'));
                                $e->getTarget()->plugin('redirect')->toUrl('/melis/login');
                            } else {
                                // or, reload the rights

                                // Update the rights of the user if it's not a custom role
                                if ($user->usr_role_id != 1) {
                                    // Get rights from Role table
                                    $tableUserRole = $sm->get('MelisCoreTableUserRole');
                                    $datasRole = $tableUserRole->getEntryById($user->usr_role_id);
                                    if ($datasRole) {
                                        $datasRole = $datasRole->current();
                                        if (!empty($datasRole)) {
                                            $user->usr_rights = $datasRole->urole_rights;
                                        }
                                    }
                                }else{
                                    $user->usr_rights = $userData->usr_rights;
                                }
                            }
                        }
                    }
                }
            },
            -10000
        );
    }
}
