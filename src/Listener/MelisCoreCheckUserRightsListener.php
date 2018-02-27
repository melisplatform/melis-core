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
use Zend\Mvc\MvcEvent;
use Zend\Session\Container;
class MelisCoreCheckUserRightsListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{

    public function attach(EventManagerInterface $events)
    {
        $sharedEvents    = $events->getSharedManager();
        $callBackHandler = $sharedEvents->attach('*', MvcEvent::EVENT_DISPATCH,
            function($e){

                // update the session last check and interval
                $container = new Container('meliscore');

                $lastUpdate = new \DateTime(date('H:i:s', strtotime($container->melis_user_session_last_update)));
                $timeNow    = new \DateTime(date("H:i:s"));
                $difference = $lastUpdate->diff($timeNow)->i;

                // checks the user accessibility in every 5 minutes
                if($difference >= 5) {
                    $container->melis_user_session_last_update = date('H:i:s');

                    $sm   = $e->getTarget()->getServiceLocator();
                    $uri  = $_SERVER['REQUEST_URI'];
                    $user = $sm->get('MelisCoreAuth');

                    if($user->hasIdentity()) {
                        $user     = $user->getIdentity();
                        $userId   = (int) $user->usr_id;
                        $tblUser  = $sm->get('MelisCoreTableUser');
                        $userData = $tblUser->getEntryById($userId)->current();


                        // check if the user is still in the database
                        if(empty($userData)) {
                            $e->getTarget()->forward()->dispatch(
                                'MelisCore\Controller\MelisAuth',array('action' => 'logout'));
                            // force redirect to login
                            $e->getTarget()->plugin('redirect')->toUrl('/melis/login');
                        }
                        else {
                            $isActive= (bool) $userData->usr_status;
                            // check if the user is still active
                            if(!$isActive) {
                                $e->getTarget()->forward()->dispatch(
                                    'MelisCore\Controller\MelisAuth',array('action' => 'logout'));
                                $e->getTarget()->plugin('redirect')->toUrl('/melis/login');
                            }
                            else {
                                // or, reload the rights
                                $user->usr_rights = $userData->usr_rights;
                            }
                        }
                    }

                }

            }, -10000);

        $this->listeners[] = $callBackHandler;
    }


}