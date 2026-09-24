<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

/**
 * Single server-side password policy, shared by the legacy back-office and the React API.
 *
 * Every path that sets a password (user tool, own profile, reset / create / renew links,
 * React endpoints) MUST go through check(). It applies, in order:
 *   1. complexity   — the effective login config (config/otherconfig.php defaults overridden by
 *                     config/app.login.php, i.e. the "Other config" tool)
 *   2. blocklist    — config/password-blocklist.txt (common passwords) and the user's own
 *                     login / e-mail local part
 *   3. history      — password_duplicate_status / password_duplicate_lifetime, when a user id is
 *                     known (MelisCoreAuth::isPasswordDuplicate)
 *
 * Audit item 16.0.
 */
class MelisPasswordPolicyService extends MelisGeneralService
{
    const BLOCKLIST_FILE = __DIR__ . '/../../config/password-blocklist.txt';

    /** Fallback when no service manager is reachable (defensive, mirrors config/otherconfig.php). */
    const DEFAULTS = [
        'password_complexity_number_of_characters'  => '12',
        'password_complexity_use_special_characters' => '1',
        'password_complexity_use_lower_case'         => '1',
        'password_complexity_use_upper_case'         => '1',
        'password_complexity_use_digit'              => '1',
        'password_duplicate_status'                  => '1',
        'password_duplicate_lifetime'                => '183',
    ];

    /** @var array|null */
    private static $blocklist = null;

    /**
     * Effective login/password config: defaults overridden by app.login.php.
     */
    public function getConfig(): array
    {
        $cfg = self::DEFAULTS;
        try {
            $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
            $defaults = $melisConfig->getItem('meliscore/datas/otherconfig_default/login');
            $saved    = $melisConfig->getItem('meliscore/datas/login');
            if (is_array($defaults)) {
                $cfg = array_merge($cfg, $defaults);
            }
            if (is_array($saved)) {
                $cfg = array_merge($cfg, $saved);
            }
        } catch (\Throwable $e) {
            // keep DEFAULTS
        }
        return $cfg;
    }

    /**
     * Validate a candidate password against the whole policy.
     *
     * @param string      $password
     * @param int|null    $userId  known user → password history is checked
     * @param string|null $login   known login → rejected when the password contains it
     * @param string|null $email   known e-mail → rejected when the password contains its local part
     * @return array  list of TRANSLATED error messages; empty = password accepted
     */
    public function check(string $password, ?int $userId = null, ?string $login = null, ?string $email = null): array
    {
        $errors = array_merge(
            $this->checkComplexity($password),
            $this->checkBlocklist($password, $login, $email)
        );

        if ($userId) {
            $errors = array_merge($errors, $this->checkHistory($password, $userId));
        }

        return $errors;
    }

    /**
     * Rules 1: length + character classes, each one only when enabled in the config.
     *
     * @return string[] translated messages
     */
    public function checkComplexity(string $password): array
    {
        $cfg    = $this->getConfig();
        $errors = [];

        $min = (int) ($cfg['password_complexity_number_of_characters'] ?? 0);
        if ($min > 0 && mb_strlen($password) < $min) {
            $errors[] = str_replace('%min%', (string) $min, $this->tr('tr_meliscore_other_config_password_too_short'));
        }
        if (!empty($cfg['password_complexity_use_lower_case']) && !preg_match('/[a-z]/', $password)) {
            $errors[] = $this->tr('tr_meliscore_other_config_password_no_lower');
        }
        if (!empty($cfg['password_complexity_use_digit']) && !preg_match('/\d/', $password)) {
            $errors[] = $this->tr('tr_meliscore_other_config_password_no_digit');
        }
        if (!empty($cfg['password_complexity_use_upper_case']) && !preg_match('/[A-Z]/', $password)) {
            $errors[] = $this->tr('tr_meliscore_other_config_password_no_upper');
        }
        if (!empty($cfg['password_complexity_use_special_characters']) && !preg_match('/[\p{P}\p{S}]/u', $password)) {
            $errors[] = $this->tr('tr_meliscore_other_config_password_no_special_character');
        }

        return $errors;
    }

    /**
     * Rule 2: common-password blocklist + no login / e-mail inside the password.
     *
     * @return string[] translated messages
     */
    public function checkBlocklist(string $password, ?string $login = null, ?string $email = null): array
    {
        $errors = [];
        $lower  = mb_strtolower($password);

        if (isset($this->getBlocklist()[$lower])) {
            $errors[] = $this->tr('tr_meliscore_other_config_password_too_common');
        }

        foreach ([$login, $email ? strstr($email, '@', true) ?: $email : null] as $needle) {
            $needle = mb_strtolower(trim((string) $needle));
            if (mb_strlen($needle) >= 3 && mb_strpos($lower, $needle) !== false) {
                $errors[] = $this->tr('tr_meliscore_other_config_password_contains_login');
                break;
            }
        }

        return $errors;
    }

    /**
     * Rule 3: password re-use within password_duplicate_lifetime days (only when enabled).
     *
     * @return string[] translated messages
     */
    public function checkHistory(string $password, int $userId): array
    {
        $cfg = $this->getConfig();
        if (empty($cfg['password_duplicate_status'])) {
            return [];
        }
        $lifetime = (int) ($cfg['password_duplicate_lifetime'] ?: 183);

        try {
            $auth = $this->getServiceManager()->get('MelisCoreAuth');
            if ($auth->isPasswordDuplicate($userId, $password, $lifetime)) {
                return [sprintf($this->tr('tr_meliscore_tool_other_config_password_duplicate_has_been_used_previously'), $lifetime)];
            }
        } catch (\Throwable $e) {
            // history table unavailable: do not block the change
        }

        return [];
    }

    /**
     * Record a freshly set password (its HASH) so that the history rule can see it later.
     * Safe to call on every path; does nothing when the hash is empty.
     */
    public function recordHistory(int $userId, string $passwordHash): void
    {
        if (!$userId || $passwordHash === '') {
            return;
        }
        try {
            $this->getServiceManager()->get('MelisUpdatePasswordHistoryService')->saveItem($userId, $passwordHash);
        } catch (\Throwable $e) {
            // never break a password change because the history could not be written
        }
    }

    /**
     * Policy as exposed to the UIs (React feedback), without any secret.
     */
    public function describe(): array
    {
        $cfg = $this->getConfig();
        return [
            'minLength'      => (int) ($cfg['password_complexity_number_of_characters'] ?: 0),
            'requireLower'   => !empty($cfg['password_complexity_use_lower_case']),
            'requireUpper'   => !empty($cfg['password_complexity_use_upper_case']),
            'requireDigit'   => !empty($cfg['password_complexity_use_digit']),
            'requireSpecial' => !empty($cfg['password_complexity_use_special_characters']),
            'historyDays'    => !empty($cfg['password_duplicate_status']) ? (int) $cfg['password_duplicate_lifetime'] : 0,
            'blocklist'      => true,
        ];
    }

    private function getBlocklist(): array
    {
        if (self::$blocklist === null) {
            self::$blocklist = [];
            if (is_readable(self::BLOCKLIST_FILE)) {
                foreach (file(self::BLOCKLIST_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                    $line = mb_strtolower(trim($line));
                    if ($line !== '' && $line[0] !== '#') {
                        self::$blocklist[$line] = true;
                    }
                }
            }
        }
        return self::$blocklist;
    }

    private function tr(string $key): string
    {
        try {
            return $this->getServiceManager()->get('translator')->translate($key);
        } catch (\Throwable $e) {
            return $key;
        }
    }
}
