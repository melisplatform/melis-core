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

/**
 * Logs successful logins and logouts (DEKRA correction plan, item 21.0).
 *
 * Failed logins were already recorded, successful ones were not: the audit trail could show
 * that somebody tried to get in, never that they succeeded.
 *
 * Listening to the events rather than patching the controllers means the three ways of logging
 * in are covered at once: the legacy back-office, the React one (both post to
 * /melis/authenticate) and melis-login-2fa, which triggers the same event after the code is
 * validated.
 */
class MelisCoreSecurityAuditListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
            '*',
            'melis_core_auth_login_ok',
            function ($e) {
                $params = $e->getParams();
                $userId = (int) (isset($params['usr_id']) ? $params['usr_id'] : 0);

                if (empty($userId)) {
                    return;
                }

                // With 2FA the event is triggered twice for one login (once by the login form,
                // once by the 2FA module). One login must appear as one line.
                if ($this->alreadyLoggedThisRequest('login_ok_' . $userId)) {
                    return;
                }

                $this->getAudit($e)->logLoginSuccess($userId);
            },
            -10000
        );

        $this->attachEventListener(
            $events,
            '*',
            'meliscore_logout_event',
            function ($e) {
                $params = $e->getParams();
                $userId = (int) (isset($params['usr_id']) ? $params['usr_id'] : 0);

                if (!empty($userId)) {
                    $this->getAudit($e)->logLogout($userId);
                }
            },
            -10000
        );
    }

    /**
     * @return \MelisCore\Service\MelisCoreSecurityAuditService
     */
    private function getAudit($e)
    {
        return $e->getTarget()->getEvent()->getApplication()->getServiceManager()->get('MelisCoreSecurityAudit');
    }

    /**
     * Guards against the same event being logged twice inside one request.
     *
     * @param string $key
     * @return bool true when it was already logged
     */
    private function alreadyLoggedThisRequest($key)
    {
        static $done = [];

        if (isset($done[$key])) {
            return true;
        }

        $done[$key] = true;

        return false;
    }
}
