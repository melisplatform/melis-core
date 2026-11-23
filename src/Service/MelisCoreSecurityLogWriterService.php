<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

/**
 * Writes a copy of every log event outside the platform's own database, as one JSON line
 * per event.
 *
 * The destination is chosen by configuration, because it depends on the hosting:
 *   - a container (Docker, Kubernetes) collects stderr, so 'stderr' is enough there
 *   - a classic Apache server has rsyslog, which can forward to a remote SIEM: 'syslog'
 *   - 'file' suits an agent (Filebeat, Fluent Bit, Wazuh) that tails a path
 *
 * Several destinations can be combined, comma separated ('stderr,file').
 *
 * Default is 'none'.
 *
 * @see config/app.security.php
 */
class MelisCoreSecurityLogWriterService extends MelisGeneralService
{
    /**
     * Mirrors one log event.
     *
     * @param array $event log row (title, message, typeCode, user, ip...)
     */
    public function write(array $event)
    {
        $config = $this->getServiceManager()->get('MelisCoreSecurityAudit')->getSecurityConfig();
        $target = isset($config['log_target']) ? $config['log_target'] : 'none';

        if ($target === 'none' || $target === '') {
            return;
        }

        $line = json_encode($this->buildPayload($event), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        if ($line === false) {
            return;
        }

        // Several destinations at once are allowed, comma separated.
        foreach (array_filter(array_map('trim', explode(',', $target))) as $destination) {
            switch ($destination) {
                case 'stderr':
                    $this->writeToStderr($line);
                    break;
                case 'syslog':
                    $this->writeToSyslog($line);
                    break;
                case 'file':
                    $this->writeToFile($line, $config);
                    break;
            }
        }
    }

    /**
     * The event as it leaves the platform.
     *
     * Only what a SIEM needs: never a password, a hash, a token or a session id.
     *
     * @return array
     */
    private function buildPayload(array $event)
    {
        $payload = [
            'ts'      => date('c'),
            'app'     => 'melis',
            'event'   => isset($event['typeCode']) ? $event['typeCode'] : 'LOG',
            'status'  => !empty($event['status']) ? 'success' : 'failure',
            'message' => isset($event['message']) ? $event['message'] : '',
            'user_id' => isset($event['userId']) ? $event['userId'] : null,
            'item_id' => isset($event['itemId']) ? $event['itemId'] : null,
            'ip'      => isset($event['ip']) ? $event['ip'] : null,
        ];

        // Only present on failed attempts against an account that does not exist.
        if (!empty($event['login_attempted'])) {
            $payload['login_attempted'] = $event['login_attempted'];
        }

        if (!empty($event['data']) && is_array($event['data'])) {
            $payload['data'] = $event['data'];
        }

        return $payload;
    }

    /**
     * One line on stderr.
     *
     * Note for PHP-FPM: workers send their output to /dev/null unless the pool sets
     * catch_workers_output = yes (with decorate_workers_output = no, so the line stays valid
     * JSON).
     */
    private function writeToStderr($line)
    {
        $stream = fopen('php://stderr', 'w');

        if ($stream === false) {
            return;
        }

        fwrite($stream, $line . "\n");
        fclose($stream);
    }

    /**
     * The system log daemon, which on a classic server is the simplest way to get the events
     * off the machine: rsyslog forwards the local0 facility to a remote collector with one
     * config line.
     */
    private function writeToSyslog($line)
    {
        openlog('melis-security', LOG_ODELAY | LOG_PID, LOG_LOCAL0);
        syslog(LOG_WARNING, $line);
        closelog();
    }

    /**
     * Append to a file, meant to be tailed by a log shipping agent.
     */
    private function writeToFile($line, array $config)
    {
        $path = isset($config['log_file']) ? $config['log_file'] : '';

        if (empty($path)) {
            return;
        }

        // LOCK_EX so two concurrent requests cannot interleave half-lines.
        file_put_contents($path, $line . "\n", FILE_APPEND | LOCK_EX);
    }
}
