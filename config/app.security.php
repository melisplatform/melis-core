<?php

/**
 * Back-office security configuration.
 *
 * The security audit trail is written to the database; the optional features below are
 * configured per environment through env vars.
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

                    // Minimum delay, in minutes, between two identical alerts.
                    'throttle_minutes'   => (int) $env('MELIS_SECURITY_THROTTLE_MINUTES', 60),

                    // Reverse proxy IPs, comma separated. For requests coming from one of them, the
                    // client IP is read from X-Forwarded-For.
                    'trusted_proxies'    => $env('MELIS_SECURITY_TRUSTED_PROXIES', ''),

                    // How long audit entries are kept, in days. 0 = forever. Applied by the
                    // console command melis:security:purge-logs, which has to be scheduled.
                    'log_retention_days' => (int) $env('MELIS_SECURITY_LOG_RETENTION_DAYS', 0),

                    // Back-office authorization gate. MelisCoreAuthorizationListener resolves the
                    // tool behind the routed controller (its MELIS_KEY/TOOL_KEY constant) and
                    // checks the user's rights before the controller runs.
                    // 'enforce' | 'report'. Default: enforce.
                    'access_gate_mode'   => $env('MELIS_ACCESS_GATE_MODE', 'enforce'),

                    // Also deny a route whose controller declares no tool key. '0' | '1'.
                    // Default: 0.
                    'access_gate_strict' => $env('MELIS_ACCESS_GATE_STRICT', '0'),

                    // Shared secret for the GDPR auto-delete cron, sent by the scheduler in the
                    // X-Melis-Cron-Token header. Leave empty to disable remote calls (the CLI
                    // command still works). Use a long random value, e.g. openssl rand -hex 32.
                    'gdpr_cron_token'    => $env('MELIS_GDPR_CRON_TOKEN', ''),

                    // CSRF protection. MelisCoreCsrfListener checks, on every state-changing
                    // back-office request, the session token echoed back by the UI (header
                    // X-Melis-Csrf or field melis_csrf) and the Origin/Referer host.
                    // 'enforce' | 'report'. Default: enforce.
                    'csrf_mode'          => $env('MELIS_CSRF_MODE', 'enforce'),

                    // JSON error responses. MelisCoreApiErrorSanitizerListener replaces the body of
                    // a failing back-office JSON response with a generic message plus a correlation
                    // id, and writes the original to the PHP log.
                    // 'sanitize' | 'passthrough' (local development only). Default: sanitize.
                    'api_error_mode'     => $env('MELIS_API_ERROR_MODE', 'sanitize'),
                ],
            ],
        ],
    ],
];
