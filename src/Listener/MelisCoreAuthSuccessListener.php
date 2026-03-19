<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use DateTime;
use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;

class MelisCoreAuthSuccessListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    const WRONG_LOGIN_CREDENTIALS = 'WRONG_LOGIN_CREDENTIALS';
    const ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED';

    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
            '*',
            'melis_core_auth_login_ok',
            function ($e) {
                $sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
                $table = $sm->get('MelisUserConnectionDate');
                $params = $e->getParams();
                $userTable = $sm->get('MelisCoreTableUser');
                $authSvc = $sm->get('MelisCoreAuth');
                $userId = (int) ($params['usr_id'] ?? 0);

                // update the session last_login_date
                $user = $authSvc->getStorage()->read();

                if (!empty($user)) {
                    $this->resetFailedLoginCounterIfNeeded($sm, $userId);
                    $user->usr_last_login_date = $params['login_date'];
                    $isOnline = (bool) $user->usr_is_online;

                    if (!$isOnline) {
                        $table->save([
                            'usrcd_usr_login' => $params['usr_id'],
                            'usrcd_last_login_date' => $params['login_date'],
                            'usrcd_last_connection_time' => $params['login_date'],
                        ]);
                    }

                    $userTable->save([
                        'usr_last_login_date' => $params['login_date'],
                        'usr_is_online' => true,
                    ], $params['usr_id']);
                }
            },
            -10000);
    }

    private function resetFailedLoginCounterIfNeeded($sm, $userId)
    {
        if (empty($userId)) {
            return;
        }

        $file = $_SERVER['DOCUMENT_ROOT'] . '/../vendor/melisplatform/melis-core/config/app.login.php';
        if (file_exists($file)) {
            $config = $sm->get('MelisCoreConfig')->getItem('meliscore/datas/login');
        } else {
            $config = $sm->get('MelisCoreConfig')->getItem('meliscore/datas/otherconfig_default/login');
        }

        if (empty($config['login_account_lock_status'])) {
            return;
        }

        $userTable = $sm->get('MelisCoreTableUser');
        $user = $userTable->getEntryById($userId)->current();
        $lastLoginDate = $user->usr_last_login_date ?? null;

        $passwordHistory = $sm->get('MelisUpdatePasswordHistoryService');
        $passwordHistoryData = $passwordHistory->getLastPasswordUpdatedDate($userId);
        $userLastPasswordUpdatedDate = $passwordHistoryData[0]['uph_password_updated_date'] ?? null;

        $melisCoreTableLogType = $sm->get('MelisCoreTableLogType');
        $melisCoreTableLog = $sm->get('MelisCoreTableLog');
        $wrongCredentialsLogType = $melisCoreTableLogType->getEntryByField('logt_code', self::WRONG_LOGIN_CREDENTIALS)->toArray();

        if (empty($wrongCredentialsLogType)) {
            return;
        }

        $accountUnlockedLogType = $melisCoreTableLogType->getEntryByField('logt_code', self::ACCOUNT_UNLOCKED)->toArray();
        $dateAccountWasUnlocked = empty($accountUnlockedLogType)
            ? null
            : $melisCoreTableLog->getDateAccountWasUnlocked(current($accountUnlockedLogType)['logt_id'], $userId);

        $resetReferenceDate = $this->getLatestResetReferenceDate([
            $lastLoginDate,
            $userLastPasswordUpdatedDate,
            $dateAccountWasUnlocked,
        ]);

        $startDate = $this->getFailedLoginCountStartDate($resetReferenceDate ?: '1970-01-01 00:00:00');
        $numberOfFailedLoginAttempts = $melisCoreTableLog->getFailedLoginAttempts(
            current($wrongCredentialsLogType)['logt_id'],
            $userId,
            $startDate
        );

        if ((int) $numberOfFailedLoginAttempts > 0) {
            $sm->get('MelisCoreLogService')->saveLog(
                'Account unlocked',
                'Account unlocked',
                true,
                self::ACCOUNT_UNLOCKED,
                $userId
            );
        }
    }

    private function getLatestResetReferenceDate(array $dates)
    {
        $dates = array_values(array_filter($dates));

        if (empty($dates)) {
            return null;
        }

        return max($dates);
    }

    private function getFailedLoginCountStartDate($date)
    {
        if (empty($date)) {
            return $date;
        }

        return (new DateTime($date))
            ->modify('+1 second')
            ->format('Y-m-d H:i:s');
    }
}
