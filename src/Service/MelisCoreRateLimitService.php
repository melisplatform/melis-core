<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use Laminas\Db\Adapter\Adapter;

/**
 * Global rate limiting with progressive delay (security audit item 17.0).
 *
 * Counts the FAILED attempts per scope and per key, in the table melis_core_rate_limit (shared
 * by every pod), and turns them into a lock that doubles on each further failure:
 *
 *   attempts 1..free_attempts   -> nothing
 *   attempt  free_attempts + n  -> locked for min(base_delay * 2^(n-1), max_delay) seconds
 *   no attempt during `window`  -> the counter starts again from zero
 *
 * Scopes and numbers: `meliscore/datas/security/rate_limit` (config/app.security.php).
 * Mode `meliscore/datas/security/rate_limit_mode`: enforce (default) | report | off.
 *
 * Callers:
 *   - MelisCoreRateLimitListener, before dispatch, for the login and password-reset routes
 *     (legacy and React API);
 *   - MelisComCouponService / MelisComOrderCheckoutService::validateCoupon(), directly (the
 *     coupon form is a front-office plugin, it has no route of its own).
 *
 * Usage:
 *   $rl = $sm->get('MelisCoreRateLimit');
 *   $wait = $rl->check('login', ['ip:1.2.3.4', 'user:admin']);   // seconds to wait, 0 = go
 *   $rl->hit('login', ['ip:1.2.3.4', 'user:admin']);             // one failure, on every key
 *   $rl->clear('login', ['user:admin']);                         // success: forget that key
 *
 * FAIL-OPEN: a database error never blocks anybody (logged, grep MELIS_RATELIMIT). The table is
 * created by Flyway (V36); before that migration ran, the service simply does nothing.
 */
class MelisCoreRateLimitService extends MelisGeneralService
{
    const TABLE = 'melis_core_rate_limit';

    /** Log prefix: `docker logs <container> | grep MELIS_RATELIMIT`. */
    const LOG_PREFIX = 'MELIS_RATELIMIT';

    /** Rows older than this are deleted on every write; the longest window is well below it. */
    const SWEEP_SECONDS = 86400;

    /** Hard-coded fallback, used when the scope is missing from the configuration. */
    private static $defaults = [
        'free_attempts' => 5,
        'base_delay'    => 2,
        'max_delay'     => 900,
        'window'        => 900,
    ];

    /**
     * Seconds the caller must still wait before this attempt may be processed, 0 when it may.
     * Several keys are checked together and the longest remaining lock wins.
     *
     * In `report` mode the lock is logged and 0 is returned; in `off` mode nothing is read.
     *
     * @param string   $scope login | reset | coupon
     * @param string[] $keys  "kind:value" (ip:1.2.3.4, user:admin)
     * @return int
     */
    public function check($scope, array $keys)
    {
        $mode = $this->getMode();
        if ($mode === 'off') {
            return 0;
        }

        $wait = 0;
        $now  = time();

        foreach ($this->normalizeKeys($keys) as $subject) {
            $row = $this->read($scope, $subject);
            if (!$row || empty($row['rl_locked_until'])) {
                continue;
            }
            if ($this->isStale($row, $scope, $now)) {
                continue;
            }
            $remaining = strtotime($row['rl_locked_until']) - $now;
            if ($remaining > $wait) {
                $wait = $remaining;
            }
        }

        if ($wait > 0) {
            $this->log('LOCKED', $scope, implode(',', $keys), $mode, $wait);
        }

        return $mode === 'enforce' ? $wait : 0;
    }

    /**
     * Records one failed attempt on every key and returns the lock (seconds) it produced, 0 when
     * the key is still within its free attempts.
     *
     * @param string   $scope
     * @param string[] $keys
     * @return int
     */
    public function hit($scope, array $keys)
    {
        if ($this->getMode() === 'off') {
            return 0;
        }

        $rule = $this->getRule($scope);
        $now  = time();
        $lock = 0;

        foreach ($this->normalizeKeys($keys) as $subject) {
            $row   = $this->read($scope, $subject);
            $count = ($row && !$this->isStale($row, $scope, $now)) ? (int) $row['rl_count'] : 0;
            $first = $count > 0 ? $row['rl_first_at'] : date('Y-m-d H:i:s', $now);
            $count++;

            $delay = 0;
            $over  = $count - $rule['free_attempts'];
            if ($over > 0) {
                // 2^(n-1) with n capped so the shift can never overflow
                $delay = (int) min($rule['max_delay'], $rule['base_delay'] * (1 << min($over - 1, 30)));
            }

            $this->write($scope, $subject, [
                'rl_count'        => $count,
                'rl_first_at'     => $first,
                'rl_last_at'      => date('Y-m-d H:i:s', $now),
                'rl_locked_until' => $delay > 0 ? date('Y-m-d H:i:s', $now + $delay) : null,
            ]);

            if ($delay > 0) {
                $this->log('LOCK', $scope, $subject, $this->getMode(), $delay, $count);
            }
            if ($delay > $lock) {
                $lock = $delay;
            }
        }

        $this->sweep();

        return $lock;
    }

    /**
     * Forgets the counter of the given keys (a successful login clears the account counter).
     *
     * @param string   $scope
     * @param string[] $keys
     */
    public function clear($scope, array $keys)
    {
        if ($this->getMode() === 'off') {
            return;
        }

        try {
            $sql = 'DELETE FROM ' . self::TABLE . ' WHERE rl_key = ?';
            foreach ($this->normalizeKeys($keys) as $subject) {
                $this->adapter()->query($sql, [$this->keyOf($scope, $subject)]);
            }
        } catch (\Throwable $e) {
            $this->failure('clear', $e);
        }
    }

    /**
     * Client IP of the current request, proxy-aware (same rule as the security audit trail).
     *
     * @return string
     */
    public function clientIp()
    {
        try {
            $ip = $this->getServiceManager()->get('MelisCoreSecurityAudit')->getClientIp();
        } catch (\Throwable $ignored) {
            $ip = null;
        }

        return $ip ?: (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0');
    }

    /** 'enforce' (default) | 'report' | 'off'. */
    public function getMode()
    {
        $config = $this->getSecurityConfig();
        $mode   = isset($config['rate_limit_mode']) ? strtolower(trim((string) $config['rate_limit_mode'])) : 'enforce';

        return in_array($mode, ['report', 'off'], true) ? $mode : 'enforce';
    }

    /**
     * Numbers of a scope, every key guaranteed present.
     *
     * @param string $scope
     * @return array free_attempts, base_delay, max_delay, window
     */
    public function getRule($scope)
    {
        $config = $this->getSecurityConfig();
        $rule   = isset($config['rate_limit'][$scope]) && is_array($config['rate_limit'][$scope])
            ? $config['rate_limit'][$scope]
            : [];

        $rule = array_merge(self::$defaults, $rule);
        foreach ($rule as $k => $v) {
            $rule[$k] = max(0, (int) $v);
        }
        // A window shorter than the longest lock would unlock early: never let it.
        $rule['window'] = max($rule['window'], $rule['max_delay']);

        return $rule;
    }

    // ------------------------------------------------------------------ internals

    private function isStale(array $row, $scope, $now)
    {
        $rule = $this->getRule($scope);

        return (strtotime($row['rl_last_at']) + $rule['window']) < $now;
    }

    private function normalizeKeys(array $keys)
    {
        $out = [];
        foreach ($keys as $key) {
            $key = trim((string) $key);
            if ($key !== '' && substr($key, -1) !== ':') {
                $out[] = mb_substr($key, 0, 191);
            }
        }

        return array_unique($out);
    }

    private function keyOf($scope, $subject)
    {
        return sha1($scope . '|' . mb_strtolower($subject));
    }

    private function read($scope, $subject)
    {
        try {
            $sql = 'SELECT * FROM ' . self::TABLE . ' WHERE rl_key = ?';
            $row = $this->adapter()->query($sql, [$this->keyOf($scope, $subject)])->current();

            return $row ? (array) $row : null;
        } catch (\Throwable $e) {
            $this->failure('read', $e);

            return null;
        }
    }

    private function write($scope, $subject, array $values)
    {
        try {
            $sql = 'INSERT INTO ' . self::TABLE
                . ' (rl_key, rl_scope, rl_subject, rl_count, rl_first_at, rl_last_at, rl_locked_until)'
                . ' VALUES (?, ?, ?, ?, ?, ?, ?)'
                . ' ON DUPLICATE KEY UPDATE rl_count = VALUES(rl_count), rl_first_at = VALUES(rl_first_at),'
                . ' rl_last_at = VALUES(rl_last_at), rl_locked_until = VALUES(rl_locked_until)';
            $this->adapter()->query($sql, [
                $this->keyOf($scope, $subject),
                $scope,
                $subject,
                $values['rl_count'],
                $values['rl_first_at'],
                $values['rl_last_at'],
                $values['rl_locked_until'],
            ]);
        } catch (\Throwable $e) {
            $this->failure('write', $e);
        }
    }

    /** Drops the rows nobody can read any more. Cheap (indexed), so done on every write. */
    private function sweep()
    {
        try {
            $sql = 'DELETE FROM ' . self::TABLE . ' WHERE rl_last_at < ?';
            $this->adapter()->query($sql, [date('Y-m-d H:i:s', time() - self::SWEEP_SECONDS)]);
        } catch (\Throwable $e) {
            $this->failure('sweep', $e);
        }
    }

    /** @return Adapter */
    private function adapter()
    {
        return $this->getServiceManager()->get(Adapter::class);
    }

    private function getSecurityConfig()
    {
        try {
            $config = $this->getServiceManager()->get('MelisCoreConfig')->getItem('meliscore/datas/security');

            return is_array($config) ? $config : [];
        } catch (\Throwable $ignored) {
            return [];
        }
    }

    private function failure($op, \Throwable $e)
    {
        error_log(sprintf('%s FAIL-OPEN op=%s error=%s', self::LOG_PREFIX, $op, $e->getMessage()));
    }

    private function log($decision, $scope, $subject, $mode, $seconds, $count = null)
    {
        error_log(sprintf(
            '%s %s scope=%s subject=%s mode=%s seconds=%d%s ip=%s',
            self::LOG_PREFIX,
            $decision,
            $scope,
            $subject,
            $mode,
            $seconds,
            $count === null ? '' : ' count=' . $count,
            isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '-'
        ));
    }
}
