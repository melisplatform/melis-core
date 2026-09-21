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
                    'log_target'         => $env('MELIS_SECURITY_LOG_TARGET', 'none'),
                    'log_file'           => $env('MELIS_SECURITY_LOG_FILE', ''),

                    // Email an administrator when a detection rule fires. Recipients default to
                    // the administrator address of Other Config > Login. Several: comma separated.
                    // 'alerts_enabled'     => $env('MELIS_SECURITY_ALERTS_ENABLED', '0') === '1',
                    // 'alert_emails'       => $env('MELIS_SECURITY_ALERT_EMAILS', ''),

                    'alerts_enabled'     => 1,
                    'alert_emails'       => 'zephyrteresa@gmail.com',

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
                ],
            ],
        ],
    ],
];
