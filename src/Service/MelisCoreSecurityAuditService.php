<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

/**
 * Security audit trail (DEKRA correction plan, item 21.0).
 *
 * One entry point for every security event, used by BOTH back-offices:
 * the legacy jQuery controllers and the React API controllers call the same methods, so an
 * action logs identically whichever interface performed it.
 *
 *     $audit = $this->getServiceManager()->get('MelisCoreSecurityAudit');
 *     $audit->logExport('Users', 250);
 *
 * Events are written to melis_core_log through MelisCoreLogService (the existing log service),
 * then mirrored outside the platform and checked against the detection rules.
 *
 * Nothing here is allowed to break the action it observes: a logging failure must never turn a
 * successful login or export into an error. Every public method is therefore exception-safe.
 */
class MelisCoreSecurityAuditService extends MelisGeneralService
{
    /**
     * Log type codes. They match the rows seeded by flyway V36.
     */
    const LOGIN_OK                = 'LOGIN_OK';
    const LOGOUT                  = 'LOGOUT';
    const LOGIN_FAIL_UNKNOWN_USER = 'LOGIN_FAIL_UNKNOWN_USER';
    const WRONG_LOGIN_CREDENTIALS = 'WRONG_LOGIN_CREDENTIALS';
    const ACCOUNT_LOCKED          = 'ACCOUNT_LOCKED';
    const ACCOUNT_UNLOCKED        = 'ACCOUNT_UNLOCKED';
    const USER_EXPORT             = 'USER_EXPORT';
    const SENSITIVE_READ          = 'SENSITIVE_READ';
    const FILE_UPLOAD             = 'FILE_UPLOAD';
    const FILE_DELETE             = 'FILE_DELETE';
    const FILE_RENAME             = 'FILE_RENAME';
    const FILE_MOVE               = 'FILE_MOVE';
    const FILE_EDIT               = 'FILE_EDIT';
    const FILE_CREATE_DIR         = 'FILE_CREATE_DIR';
    const SECURITY_ALERT          = 'SECURITY_ALERT';

    /**
     * Events that can happen without anyone being logged in. For these, and only these,
     * a log row with no user id is kept instead of being dropped.
     */
    const ANONYMOUS_TYPES = [
        self::LOGIN_FAIL_UNKNOWN_USER,
        self::WRONG_LOGIN_CREDENTIALS,
        self::ACCOUNT_LOCKED,
        self::ACCOUNT_UNLOCKED,
        self::SECURITY_ALERT,
    ];

    /**
     * Security events, as opposed to the ordinary "a page was saved" logs. Used to decide
     * what the Logs tool shows under its Security filter, and what the detection rules read.
     */
    const SECURITY_TYPES = [
        self::LOGIN_OK,
        self::LOGOUT,
        self::LOGIN_FAIL_UNKNOWN_USER,
        self::WRONG_LOGIN_CREDENTIALS,
        self::ACCOUNT_LOCKED,
        self::ACCOUNT_UNLOCKED,
        self::USER_EXPORT,
        self::SENSITIVE_READ,
        self::FILE_UPLOAD,
        self::FILE_DELETE,
        self::FILE_RENAME,
        self::FILE_MOVE,
        self::FILE_EDIT,
        self::FILE_CREATE_DIR,
        self::SECURITY_ALERT,
    ];

    /**
     * A successful login. Called from the login event, so the 2FA module's own login event is
     * covered as well.
     *
     * @param int    $userId
     * @param string $login
     */
    public function logLoginSuccess($userId, $login = '')
    {
        $this->write(
            self::LOGIN_OK,
            'tr_meliscore_security_log_login_ok',
            'Successful login',
            1,
            $userId,
            ['login' => $login]
        );
    }

    /**
     * A logout.
     *
     * @param int $userId
     */
    public function logLogout($userId)
    {
        $this->write(self::LOGOUT, 'tr_meliscore_security_log_logout', 'Logout', 1, $userId);
    }

    /**
     * A login attempt on an account that does not exist.
     *
     * The response shown to the visitor must stay identical to a wrong-password response
     * (otherwise the login form tells an attacker which accounts exist); only the log knows
     * the difference.
     *
     * @param string $login the login that was typed
     */
    public function logLoginFailureUnknownUser($login)
    {
        $this->write(
            self::LOGIN_FAIL_UNKNOWN_USER,
            'tr_meliscore_security_log_login_unknown',
            'Login attempt on an unknown account',
            0,
            null,
            ['login_attempted' => $login]
        );
    }

    /**
     * An export of data out of the platform (CSV/Excel download of a tool's list).
     *
     * @param string $toolName  human readable tool name, e.g. "Users"
     * @param int    $rowCount  how many records left the platform
     * @param array  $context   optional extra details (the filter used...)
     */
    public function logExport($toolName, $rowCount = 0, array $context = [])
    {
        $this->write(
            self::USER_EXPORT,
            'tr_meliscore_security_log_export',
            'Export of ' . $rowCount . ' record(s) from ' . $toolName,
            1,
            null,
            array_merge(['tool' => $toolName, 'rows' => (int) $rowCount], $context)
        );
    }

    /**
     * A read of sensitive data: user rights, microservice tokens, connection history,
     * platform configuration. Ordinary list browsing is NOT logged - the trail has to stay
     * readable, and an entry per page view would bury the events that matter.
     *
     * @param string   $what   what was read, e.g. "user microservice token"
     * @param int|null $itemId the record concerned
     */
    public function logSensitiveRead($what, $itemId = null, array $context = [])
    {
        $this->write(
            self::SENSITIVE_READ,
            'tr_meliscore_security_log_sensitive_read',
            'Read: ' . $what,
            1,
            null,
            array_merge(['what' => $what], $context),
            $itemId
        );
    }

    /**
     * A write in the media library / file manager.
     *
     * @param string      $action     one of the FILE_* codes of this class
     * @param string      $path       path of the file, relative to the media folder
     * @param string|null $targetPath destination, for a move or a copy
     */
    public function logFileAction($action, $path, $targetPath = null)
    {
        if (!in_array($action, self::SECURITY_TYPES, true)) {
            return;
        }

        $message = $action . ': ' . $path;
        if (!empty($targetPath)) {
            $message .= ' -> ' . $targetPath;
        }

        $context = ['path' => $path];
        if (!empty($targetPath)) {
            $context['target_path'] = $targetPath;
        }

        $this->write($action, 'tr_meliscore_security_log_file', $message, 1, null, $context);
    }

    /**
     * Records that a detection rule fired and an alert was raised.
     *
     * The rule key is written between brackets at the start of the message: that is what the
     * throttle reads back to know whether the same alert was already sent recently.
     *
     * @param string $ruleKey identifies the rule and its target, e.g. "failed_per_ip_1.2.3.4"
     * @param string $message
     * @param int    $status  1 = the alert was delivered, 0 = it could not be sent
     */
    public function logSecurityAlert($ruleKey, $message, $status = 1)
    {
        $this->write(
            self::SECURITY_ALERT,
            'tr_meliscore_security_log_alert',
            '[' . $ruleKey . '] ' . $message,
            $status,
            null,
            ['rule' => $ruleKey]
        );
    }

    /**
     * Client IP of the current request.
     *
     * X-Forwarded-For is only trusted when the request actually reaches us through one of the
     * configured reverse proxies: the header is a plain request header, anyone can send it.
     *
     * @return string|null
     */
    public function getClientIp()
    {
        $remoteAddr = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : null;

        if (empty($remoteAddr)) {
            return null;
        }

        $config         = $this->getSecurityConfig();
        $trustedProxies = array_filter(array_map('trim', explode(',', (string) $config['trusted_proxies'])));

        if (!in_array($remoteAddr, $trustedProxies, true) || empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $remoteAddr;
        }

        // The header is "client, proxy1, proxy2": the client is the first entry.
        $forwarded = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $clientIp  = trim($forwarded[0]);

        return filter_var($clientIp, FILTER_VALIDATE_IP) ? $clientIp : $remoteAddr;
    }

    /**
     * Security configuration.
     *
     * The defaults are repeated here so that every key always exists: the platform turns PHP
     * warnings into exceptions, so reading a missing key would abort the logging instead of
     * simply logging with a default.
     *
     * @return array
     * @see config/app.security.php
     */
    public function getSecurityConfig()
    {
        $defaults = [
            'log_target'          => 'none',
            'log_file'            => '',
            'alerts_enabled'      => false,
            'alert_emails'        => '',
            'window_minutes'      => 15,
            'failed_per_account'  => 5,
            'failed_per_ip'       => 10,
            'unknown_per_ip'      => 5,
            'file_deletes'        => 20,
            'throttle_minutes'    => 60,
            'trusted_proxies'     => '',
            'log_retention_days'  => 0,
        ];

        try {
            $config = $this->getServiceManager()->get('MelisCoreConfig')->getItem('meliscore/datas/security');
        } catch (\Exception $e) {
            $config = null;
        }

        return is_array($config) ? array_merge($defaults, $config) : $defaults;
    }

    /**
     * True when the log type is one of the security events.
     *
     * @param string $typeCode
     * @return bool
     */
    public function isSecurityType($typeCode)
    {
        return in_array($typeCode, self::SECURITY_TYPES, true);
    }

    /**
     * True when the log type may be stored without a user id.
     *
     * @param string $typeCode
     * @return bool
     */
    public function isAnonymousType($typeCode)
    {
        return in_array($typeCode, self::ANONYMOUS_TYPES, true);
    }

    /**
     * Called by MelisCoreLogService right after a log row has been written.
     *
     * Two things happen outside the database: the event is mirrored to wherever the logs are
     * externalised, and the detection rules are given a chance to raise an alert.
     *
     * @param array $event the log row as it was saved, plus its type code
     */
    public function onLogSaved(array $event)
    {
        try {
            $this->getServiceManager()->get('MelisCoreSecurityLogWriter')->write($event);
        } catch (\Exception $e) {
            // Externalisation must never break the request that produced the log.
        }

        try {
            if ($this->isSecurityType(isset($event['typeCode']) ? $event['typeCode'] : '')) {
                $this->getServiceManager()->get('MelisCoreSecurityAlert')->evaluate($event);
            }
        } catch (\Exception $e) {
            // Same for alerting.
        }
    }

    /**
     * Writes one security event through the ordinary log service.
     *
     * @param string      $typeCode
     * @param string      $title    translation key shown in the Logs tool
     * @param string      $message  human readable message
     * @param int         $status   1 = the action succeeded, 0 = it failed
     * @param int|null    $userId   user concerned, null = the one logged in (or nobody)
     * @param array       $context  small details stored as JSON
     * @param int|null    $itemId   record concerned, defaults to the user id
     */
    private function write($typeCode, $title, $message, $status, $userId = null, array $context = [], $itemId = null)
    {
        try {
            $logService = $this->getServiceManager()->get('MelisCoreLogService');

            if ($itemId === null) {
                $itemId = $userId;
            }

            $logService->saveLog($title, $message, $status, $typeCode, $itemId, null, [
                'userId'          => $userId,
                'ip'              => $this->getClientIp(),
                'login_attempted' => isset($context['login_attempted']) ? $context['login_attempted'] : null,
                'data'            => $context,
            ]);
        } catch (\Exception $e) {
            // A security event that cannot be stored must not break the action it describes.
        }
    }
}
