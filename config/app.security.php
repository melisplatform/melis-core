<?php

/**
 * Security audit configuration (DEKRA correction plan, item 21.0).
 *
 * Everything is off by default: the audit trail is written to the database and nothing else
 * happens. An environment turns a feature on with an env var - no file to edit to deploy.
 *
 * Read with: $sm->get('MelisCoreConfig')->getItem('meliscore/datas/security')
 */

// Reads an env var, falls back to the default.
$env = function ($name, $default) {
    $value = getenv($name);

    return ($value === false || $value === '') ? $default : $value;
};

return [
    'plugins' => [
        'meliscore' => [
            'datas' => [
                'security' => [

                    // Send a copy of every log entry outside the database, so it survives an
                    // intrusion. 'none' | 'stderr' (containers, Kubernetes) | 'syslog' (classic
                    // server, can forward to a SIEM) | 'file' (for a log agent to tail).
                    // Several at once, comma separated: 'stderr,file' keeps a copy the
                    // application cannot erase plus a local file that is easy to search.
                    'log_target'         => $env('MELIS_SECURITY_LOG_TARGET', 'none'),
                    'log_file'           => $env('MELIS_SECURITY_LOG_FILE', ''),

                    // Email an administrator when a detection rule fires. Recipients default to
                    // the administrator address of Other Config > Login. Several: comma separated.
                    'alerts_enabled'     => $env('MELIS_SECURITY_ALERTS_ENABLED', '0') === '1',
                    'alert_emails'       => $env('MELIS_SECURITY_ALERT_EMAILS', ''),

                    // Detection rules: how many events, within how many minutes, before alerting.
                    'window_minutes'     => (int) $env('MELIS_SECURITY_WINDOW_MINUTES', 15),
                    'failed_per_account' => (int) $env('MELIS_SECURITY_FAILED_PER_ACCOUNT', 5),
                    'failed_per_ip'      => (int) $env('MELIS_SECURITY_FAILED_PER_IP', 10),
                    'unknown_per_ip'     => (int) $env('MELIS_SECURITY_UNKNOWN_PER_IP', 5),
                    'file_deletes'       => (int) $env('MELIS_SECURITY_FILE_DELETES', 20),

                    // Minimum delay between two identical alerts, so an attack in progress sends
                    // one email instead of a thousand.
                    'throttle_minutes'   => (int) $env('MELIS_SECURITY_THROTTLE_MINUTES', 60),

                    // Behind a reverse proxy every request seems to come from the proxy, which
                    // makes the per-IP rules useless. Listing the proxy here makes the real client
                    // IP be read from X-Forwarded-For - a header anyone can forge, hence the list.
                    'trusted_proxies'    => $env('MELIS_SECURITY_TRUSTED_PROXIES', ''),

                    // How long audit entries are kept, in days. 0 = forever. Applied by the
                    // console command melis:security:purge-logs, which has to be scheduled.
                    'log_retention_days' => (int) $env('MELIS_SECURITY_LOG_RETENTION_DAYS', 0),

                    // Global back-office authorization gate (item 7.0). checkIdentity() only
                    // authenticates; MelisCoreAuthorizationListener resolves the tool behind the
                    // routed controller (its MELIS_KEY/TOOL_KEY constant) and asks canAccess()
                    // BEFORE the controller runs.
                    // 'report'  = nothing blocked, every decision written to the PHP log
                    //             (grep MELIS_ACCESS_GATE). Inventory phase. DEFAULT.
                    // 'enforce' = a denial becomes a real 403 before dispatch.
                    'access_gate_mode'   => $env('MELIS_ACCESS_GATE_MODE', 'enforce'),

                    // With mode=enforce only: also deny a route whose controller declares NO tool
                    // key (deny by default). Turn on last, once the report log is clean.
                    'access_gate_strict' => $env('MELIS_ACCESS_GATE_STRICT', '0'),

                    // Shared secret for the GDPR auto-delete cron (item 7.0).
                    // /melis/gdprautodelete/ is a PUBLIC route (a cron has no session) that DELETES
                    // data. It now needs this token, as header X-Melis-Cron-Token or ?token=:
                    //   curl -sS -H "X-Melis-Cron-Token: $MELIS_GDPR_CRON_TOKEN" \
                    //        https://<host>/melis/gdprautodelete/
                    // Empty (default) = no remote call accepted at all: a destructive endpoint
                    // must fail closed. CLI, and a logged-in user with the GDPR tool right, always
                    // pass. Generate one with: openssl rand -hex 32
                    'gdpr_cron_token'    => $env('MELIS_GDPR_CRON_TOKEN', ''),

                    // Global CSRF gate (item 10.0). MelisCoreCsrfListener checks, on every
                    // state-changing back-office request (POST/PUT/PATCH/DELETE under /melis…),
                    // the session token echoed back by the UI (header X-Melis-Csrf or field
                    // melis_csrf) and the Origin/Referer host.
                    // 'enforce' = a failure becomes a real 403 before dispatch. DEFAULT: a
                    //             security control that ships disabled protects nobody - that is
                    //             exactly how the SameSite=None line in public/.htaccess survived
                    //             for years behind a "@todo uncomment for prod".
                    // 'report'  = escape hatch: nothing blocked, every failure written to the PHP
                    //             log (grep MELIS_CSRF). Pull it with MELIS_CSRF_MODE=report if a
                    //             legitimate POST turns out not to carry the token yet, read the
                    //             inventory, fix it, and put it back. No code change, no deploy.
                    'csrf_mode'          => $env('MELIS_CSRF_MODE', 'enforce'),

                    // JSON error-response scrubber (item 13.0). MelisCoreApiErrorSanitizerListener
                    // replaces the body of a failing back-office JSON response (a 5xx, or any
                    // payload carrying file/trace/line - the shape the React API controllers build
                    // from a caught exception) with a generic message plus a correlation id, and
                    // writes the original to the PHP log (grep MELIS_API_ERROR).
                    // 'sanitize'    = DEFAULT. The exception message, the absolute paths and the
                    //                 stack trace never reach the browser, on any environment.
                    // 'passthrough' = developer machine only: the original body is returned as-is
                    //                 (still logged). This is the very leak the listener closes -
                    //                 never set it on a shared or public environment.
                    'api_error_mode'     => $env('MELIS_API_ERROR_MODE', 'sanitize'),

                    // Rate limiting with progressive delay (item 17.0). MelisCoreRateLimitService
                    // counts the failed attempts per key (IP, and account for the login) in the
                    // table melis_core_rate_limit; MelisCoreRateLimitListener applies it before
                    // dispatch on the login and password-reset routes, the coupon validation
                    // calls it directly (front-office plugin, no dedicated route).
                    // 'enforce' = DEFAULT. Once the free attempts are spent, every further
                    //             failure locks the key for base_delay * 2^n seconds (capped at
                    //             max_delay): HTTP 429 + Retry-After. A success on the login
                    //             clears the account counter, the IP counter only expires.
                    // 'report'  = escape hatch: nothing blocked, every lock written to the PHP
                    //             log (grep MELIS_RATELIMIT).
                    // 'off'     = no counting at all.
                    'rate_limit_mode'    => $env('MELIS_RATE_LIMIT_MODE', 'enforce'),
                    'rate_limit'         => [
                        // free_attempts : failures allowed before the first delay
                        // base_delay    : seconds of the first lock, doubled on each failure
                        // max_delay     : cap of the lock, seconds
                        // window        : seconds without an attempt after which the counter
                        //                 starts again from zero
                        'login' => [
                            'free_attempts' => (int) $env('MELIS_RATE_LIMIT_LOGIN_FREE', 5),
                            'base_delay'    => 2,
                            'max_delay'     => 900,
                            'window'        => 900,
                        ],
                        'reset' => [
                            'free_attempts' => (int) $env('MELIS_RATE_LIMIT_RESET_FREE', 5),
                            'base_delay'    => 30,
                            'max_delay'     => 3600,
                            'window'        => 3600,
                        ],
                        'coupon' => [
                            'free_attempts' => (int) $env('MELIS_RATE_LIMIT_COUPON_FREE', 10),
                            'base_delay'    => 5,
                            'max_delay'     => 600,
                            'window'        => 600,
                        ],
                    ],
                ],
            ],
        ],
    ],
];
