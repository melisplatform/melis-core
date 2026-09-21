<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

/**
 * Detection rules and alerting (DEKRA correction plan, item 21.0 - "add detection + alerts").
 *
 * Logging an attack is only half the job: someone has to be told while it is happening.
 * Each rule is a count over the last few minutes in melis_core_log, run right after the event
 * that could trigger it, so no scheduled task is required.
 *
 * Alerts are OFF by default (config/app.security.php). An environment turns them on with
 * MELIS_SECURITY_ALERTS_ENABLED=1, so enabling this never surprises an existing install.
 */
class MelisCoreSecurityAlertService extends MelisGeneralService
{
    /**
     * Checks the rules that the event just saved could have triggered.
     *
     * @param array $event log row, as built by MelisCoreLogService
     */
    public function evaluate(array $event)
    {
        $typeCode = isset($event['typeCode']) ? $event['typeCode'] : '';

        // An alert is itself logged; without this the alert would trigger the rules again.
        if ($typeCode === MelisCoreSecurityAuditService::SECURITY_ALERT) {
            return;
        }

        $config = $this->getAudit()->getSecurityConfig();

        if (empty($config['alerts_enabled'])) {
            return;
        }

        $since = date('Y-m-d H:i:s', strtotime('-' . max(1, (int) $config['window_minutes']) . ' minutes'));
        $ip    = isset($event['ip']) ? $event['ip'] : null;

        switch ($typeCode) {
            case MelisCoreSecurityAuditService::WRONG_LOGIN_CREDENTIALS:
                $this->checkFailedPerAccount($event, $config, $since);
                $this->checkFailedPerIp($config, $since, $ip);
                break;

            case MelisCoreSecurityAuditService::LOGIN_FAIL_UNKNOWN_USER:
                $this->checkUnknownPerIp($config, $since, $ip);
                $this->checkFailedPerIp($config, $since, $ip);
                break;

            case MelisCoreSecurityAuditService::ACCOUNT_LOCKED:
                $this->raise(
                    'account_locked',
                    'Account locked after repeated failed logins',
                    'Account ' . $this->describeUser(isset($event['itemId']) ? $event['itemId'] : null)
                        . ' has been locked after too many failed login attempts. Source IP: ' . $this->displayIp($ip) . '.'
                );
                break;

            case MelisCoreSecurityAuditService::USER_EXPORT:
                $this->raise(
                    'user_export',
                    'User data exported',
                    'A user data export was performed by ' . $this->describeUser(isset($event['userId']) ? $event['userId'] : null)
                        . ' from IP ' . $this->displayIp($ip) . '. Details: ' . (isset($event['message']) ? $event['message'] : '')
                );
                break;

            case MelisCoreSecurityAuditService::FILE_DELETE:
                $this->checkMassFileDeletion($event, $config, $since);
                break;
        }
    }

    /**
     * Repeated failures on ONE account. The account lock (when enabled) already stops the
     * attempt; the alert is what makes someone aware of it.
     */
    private function checkFailedPerAccount(array $event, array $config, $since)
    {
        $userId    = isset($event['itemId']) ? $event['itemId'] : null;
        $threshold = (int) $config['failed_per_account'];

        if (empty($userId) || $threshold <= 0) {
            return;
        }

        $count = $this->countSince(
            [MelisCoreSecurityAuditService::WRONG_LOGIN_CREDENTIALS],
            $since,
            null,
            $userId
        );

        if ($count >= $threshold) {
            $this->raise(
                'failed_per_account_' . $userId,
                'Repeated failed logins on one account',
                $count . ' failed login attempts on account ' . $this->describeUser($userId) . ' in the last '
                    . $config['window_minutes'] . ' minutes.'
            );
        }
    }

    /**
     * Failures from ONE IP across ANY accounts.
     *
     * This is the rule the per-account lock cannot see: an attacker trying one password on a
     * hundred different logins never reaches the lock threshold on any single account.
     */
    private function checkFailedPerIp(array $config, $since, $ip)
    {
        $threshold = (int) $config['failed_per_ip'];

        if (empty($ip) || $threshold <= 0) {
            return;
        }

        $count = $this->countSince(
            [
                MelisCoreSecurityAuditService::WRONG_LOGIN_CREDENTIALS,
                MelisCoreSecurityAuditService::LOGIN_FAIL_UNKNOWN_USER,
            ],
            $since,
            $ip
        );

        if ($count >= $threshold) {
            $this->raise(
                'failed_per_ip_' . $ip,
                'Repeated failed logins from one IP',
                $count . ' failed login attempts from IP ' . $ip . ' in the last '
                    . $config['window_minutes'] . ' minutes (several accounts).'
            );
        }
    }

    /**
     * Attempts on accounts that do not exist: somebody is guessing login names.
     */
    private function checkUnknownPerIp(array $config, $since, $ip)
    {
        $threshold = (int) $config['unknown_per_ip'];

        if (empty($ip) || $threshold <= 0) {
            return;
        }

        $count = $this->countSince([MelisCoreSecurityAuditService::LOGIN_FAIL_UNKNOWN_USER], $since, $ip);

        if ($count >= $threshold) {
            $this->raise(
                'unknown_per_ip_' . $ip,
                'Account enumeration attempt',
                $count . ' login attempts on non-existent accounts from IP ' . $ip
                    . ' in the last ' . $config['window_minutes'] . ' minutes.'
            );
        }
    }

    /**
     * Many files deleted in a short time by one user.
     */
    private function checkMassFileDeletion(array $event, array $config, $since)
    {
        $userId    = isset($event['userId']) ? $event['userId'] : null;
        $threshold = (int) $config['file_deletes'];

        if (empty($userId) || $threshold <= 0) {
            return;
        }

        $count = $this->countSince([MelisCoreSecurityAuditService::FILE_DELETE], $since, null, $userId);

        if ($count >= $threshold) {
            $this->raise(
                'file_deletes_' . $userId,
                'Mass file deletion',
                $count . ' files deleted by ' . $this->describeUser($userId) . ' in the last '
                    . $config['window_minutes'] . ' minutes.'
            );
        }
    }

    /**
     * Sends an alert, unless the same one was already sent recently.
     *
     * The throttle matters: an attack in progress fires its rule on every single attempt, and
     * an inbox with a thousand identical mails is an inbox nobody reads.
     *
     * @param string $ruleKey identifies the rule AND its target (per IP, per account)
     */
    private function raise($ruleKey, $subject, $body)
    {
        $config = $this->getAudit()->getSecurityConfig();

        if ($this->wasRecentlySent($ruleKey, $config)) {
            return;
        }

        $sent = $this->sendEmails($subject, $body, $config);

        // Logged whatever the outcome: the trail has to show that the rule fired, and the
        // rule key in the message is what the throttle reads back.
        $this->getAudit()->logSecurityAlert($ruleKey, $subject . ' - ' . $body, $sent);
    }

    /**
     * True when an alert for the same rule was sent inside the throttle window.
     */
    private function wasRecentlySent($ruleKey, array $config)
    {
        $minutes = max(1, (int) $config['throttle_minutes']);
        $since   = date('Y-m-d H:i:s', strtotime('-' . $minutes . ' minutes'));

        $count = $this->countSince(
            [MelisCoreSecurityAuditService::SECURITY_ALERT],
            $since,
            null,
            null,
            '[' . $ruleKey . ']%'
        );

        return $count > 0;
    }

    /**
     * Recipients: the security configuration first, otherwise the administrator address of the
     * login settings, which is the one an administrator has already filled in.
     */
    private function sendEmails($subject, $body, array $config)
    {
        $recipients = $this->getRecipients($config);

        if (empty($recipients)) {
            return 0;
        }

        $sent    = 0;
        $mailSrv = $this->getServiceManager()->get('MelisCoreEmailSendingService');
        $host    = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'melis';
        $html    = '<p>' . htmlspecialchars($body, ENT_QUOTES, 'UTF-8') . '</p>'
                 . '<p>Platform: ' . htmlspecialchars($host, ENT_QUOTES, 'UTF-8') . '</p>';

        foreach ($recipients as $recipient) {
            try {
                $mailSrv->sendEmail(
                    $recipients[0],
                    'Melis security',
                    $recipient,
                    $recipient,
                    null,
                    '[Melis security] ' . $subject . ' (' . $host . ')',
                    $html,
                    $body . "\nPlatform: " . $host
                );
                $sent++;
            } catch (\Exception $e) {
                // A mail server problem must not stop the other recipients, nor the request.
            }
        }

        return $sent ? 1 : 0;
    }

    /**
     * @return string[]
     */
    private function getRecipients(array $config)
    {
        $emails = isset($config['alert_emails']) ? (string) $config['alert_emails'] : '';

        if (trim($emails) === '') {
            $loginConfig = $this->getServiceManager()->get('MelisCoreConfig')->getItem('meliscore/datas/login');

            if (empty($loginConfig)) {
                $loginConfig = $this->getServiceManager()->get('MelisCoreConfig')
                    ->getItem('meliscore/datas/otherconfig_default/login');
            }

            $emails = isset($loginConfig['login_account_admin_email']) ? $loginConfig['login_account_admin_email'] : '';
        }

        $recipients = array_filter(array_map('trim', explode(',', $emails)));

        return array_values(array_filter($recipients, function ($email) {
            return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
        }));
    }

    /**
     * Counts matching log rows since a date.
     *
     * @param string[]    $typeCodes
     * @param string      $since       'Y-m-d H:i:s'
     * @param string|null $ip
     * @param int|null    $userId
     * @param string|null $messageLike SQL LIKE pattern on the message
     * @return int
     */
    private function countSince(array $typeCodes, $since, $ip = null, $userId = null, $messageLike = null)
    {
        $logService = $this->getServiceManager()->get('MelisCoreLogService');
        $typeIds    = [];

        foreach ($typeCodes as $code) {
            $type = $logService->getLogTypeByTypeCode($code);

            if (!empty($type)) {
                $typeIds[] = (int) $type->logt_id;
            }
        }

        if (empty($typeIds)) {
            return 0;
        }

        return (int) $this->getServiceManager()->get('MelisCoreTableLog')
            ->countSince($typeIds, $since, $ip, $userId, $messageLike);
    }

    /**
     * Names an account in an alert: the login is what an administrator recognises, an id means
     * nothing without a database lookup. The id is kept alongside it to identify the row.
     *
     * @param  int|null $userId
     * @return string e.g. "admin (#1)"
     */
    private function describeUser($userId)
    {
        if (empty($userId)) {
            return 'unknown';
        }

        try {
            $user = $this->getServiceManager()->get('MelisCoreTableUser')->getEntryById($userId)->current();

            if (!empty($user)) {
                return $user->usr_login . ' (#' . $userId . ')';
            }
        } catch (\Exception $e) {
            // Fall through to the id alone.
        }

        return '#' . $userId;
    }

    /**
     * @return MelisCoreSecurityAuditService
     */
    private function getAudit()
    {
        return $this->getServiceManager()->get('MelisCoreSecurityAudit');
    }

    private function displayIp($ip)
    {
        return empty($ip) ? 'unknown' : $ip;
    }
}
