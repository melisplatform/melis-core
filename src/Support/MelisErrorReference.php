<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Support;

/**
 * Correlation id for an error whose detail must NOT reach the browser (audit item 13.0).
 *
 * MelisCoreApiErrorSanitizerListener covers everything that leaves as a JSON response. A handful
 * of places cannot be reached that way - a caught exception rendered into HTML, or echoed into a
 * JavaScript bundle - and call this instead: the detail goes to the PHP log under a reference,
 * the caller shows the reference alone.
 *
 *     $ref = MelisErrorReference::log($e, 'PluginViewController::generateRec');
 *     $view->setVariable('error', 'An unexpected error occurred (ref: ' . $ref . ')');
 *
 * Read the detail back with: `docker logs <container> | grep MELIS_API_ERROR`.
 */
class MelisErrorReference
{
    /** Same prefix as the listener, so one grep collects both. */
    const LOG_PREFIX = 'MELIS_API_ERROR';

    /** What is shown in place of the exception message. */
    const GENERIC_MESSAGE = 'An unexpected error occurred';

    /**
     * Logs the full exception and returns the short reference to display.
     *
     * @param  \Throwable $e
     * @param  string     $context  where it happened, for the log line
     * @return string               12 hex characters
     */
    public static function log($e, $context = '')
    {
        $ref = self::reference();

        try {
            error_log(sprintf(
                '%s ref=%s context=%s class=%s message=%s at=%s:%d path=%s ip=%s trace=%s',
                self::LOG_PREFIX,
                $ref,
                $context !== '' ? $context : '-',
                get_class($e),
                str_replace(["\r", "\n"], ' ', (string) $e->getMessage()),
                (string) $e->getFile(),
                (int) $e->getLine(),
                isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '-',
                isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '-',
                str_replace(["\r", "\n"], ' | ', substr($e->getTraceAsString(), 0, 3000))
            ));
        } catch (\Throwable $ignored) {
            // Logging must never be the thing that breaks the request.
        }

        return $ref;
    }

    /** Generic message carrying the reference, ready to display. */
    public static function message($e, $context = '')
    {
        return self::GENERIC_MESSAGE . ' (ref: ' . self::log($e, $context) . ')';
    }

    private static function reference()
    {
        try {
            return bin2hex(random_bytes(6));
        } catch (\Throwable $ignored) {
            return substr(md5(uniqid('', true)), 0, 12);
        }
    }
}
