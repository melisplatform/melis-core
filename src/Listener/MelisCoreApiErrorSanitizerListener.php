<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;
use Laminas\Http\Request as HttpRequest;
use Laminas\Http\Response as HttpResponse;
use Laminas\Mvc\MvcEvent;

/**
 * Back-office JSON error responses.
 *
 * Runs on EVENT_FINISH for JSON responses under `/melis…`. A response that is a 5xx, or that
 * carries an exception-shaped payload (`file`, `trace`, `traceAsString`… keys), has its body
 * replaced by
 *
 *     {"success":false,"error":"An unexpected error occurred","errorRef":"a1b2c3d4e5f6"}
 *
 * and the original payload is written to the PHP log under the same reference, with the route
 * and the user, so a reference shown to the user can be matched to its log line.
 *
 * 2xx/3xx responses, the front-office, the assets and the CLI are not touched. A 4xx keeps its
 * status; only its body is replaced, and only when it is exception-shaped.
 */
class MelisCoreApiErrorSanitizerListener implements ListenerAggregateInterface
{
    public $listeners = [];

    const LOG_PREFIX = 'MELIS_API_ERROR';

    /** Back-office path tree. Case-sensitive, so the `/MelisCore/…` assets stay out. */
    const BACKOFFICE_PATH_PREFIX = '/melis';

    /** What the client is told instead of the exception message. */
    const GENERIC_MESSAGE = 'An unexpected error occurred';

    /** Payload keys that, alone, prove the body was built from an exception. */
    const LEAKING_KEYS = ['file', 'trace', 'traceAsString', 'exception', 'line'];

    public function attach(EventManagerInterface $events, $priority = -9000)
    {
        // Low priority, but strictly above -10000 (Laminas' SendResponseListener): at -10000 this
        // listener would run after the response has been sent.
        $this->listeners[] = $events->attach(MvcEvent::EVENT_FINISH, [$this, 'onFinish'], $priority);
    }

    public function detach(EventManagerInterface $events)
    {
        foreach ($this->listeners as $index => $listener) {
            if ($events->detach($listener)) {
                unset($this->listeners[$index]);
            }
        }
    }

    public function onFinish(MvcEvent $e)
    {
        if (php_sapi_name() === 'cli') {
            return;
        }

        $request  = $e->getRequest();
        $response = $e->getResponse();

        if (!$request instanceof HttpRequest || !$response instanceof HttpResponse) {
            return;
        }

        $path = (string) $request->getUri()->getPath();
        if (strpos($path, self::BACKOFFICE_PATH_PREFIX) !== 0) {
            return; // front-office, assets, another route tree: out of scope
        }

        if (!$this->isJson($response)) {
            return;
        }

        $status  = (int) $response->getStatusCode();
        $content = (string) $response->getContent();

        if ($content === '' || $status < 400) {
            return;
        }

        $payload = json_decode($content, true);
        if (!is_array($payload)) {
            return; // not a JSON object: nothing to reason about, leave it alone
        }

        if (!$this->isLeaking($payload, $status)) {
            return;
        }

        $ref = $this->reference();
        $this->log($ref, $status, $request, $payload, $e);

        if ($this->getMode($e) === 'passthrough') {
            return;
        }

        $this->scrub($response, $ref);
    }

    /**
     * A 5xx is always replaced. Below that, only an exception-shaped payload is: a 400 saying
     * "Invalid email" is a real message for the user and is kept.
     */
    private function isLeaking(array $payload, $status)
    {
        if ($status >= 500) {
            return true;
        }

        foreach (self::LEAKING_KEYS as $key) {
            if (array_key_exists($key, $payload)) {
                return true;
            }
        }

        return false;
    }

    /** Replaces the body, keeping the status: the client still knows the call failed. */
    private function scrub(HttpResponse $response, $ref)
    {
        $body = json_encode([
            'success'  => false,
            'error'    => self::GENERIC_MESSAGE,
            'errorRef' => $ref,
        ]);

        $response->setContent($body);

        $headers = $response->getHeaders();
        if ($headers->has('Content-Length')) {
            $headers->removeHeader($headers->get('Content-Length'));
            $headers->addHeaderLine('Content-Length', (string) strlen($body));
        }
    }

    private function isJson(HttpResponse $response)
    {
        $header = $response->getHeaders()->get('Content-Type');
        if (!$header) {
            return false;
        }

        return stripos((string) $header->getFieldValue(), 'json') !== false;
    }

    /** Short, unique, quotable over the phone. */
    private function reference()
    {
        try {
            return bin2hex(random_bytes(6));
        } catch (\Throwable $ignored) {
            return substr(md5(uniqid('', true)), 0, 12);
        }
    }

    /** The whole original payload, on one line. */
    private function log($ref, $status, HttpRequest $request, array $payload, MvcEvent $e)
    {
        $original = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (strlen($original) > 4000) {
            $original = substr($original, 0, 4000) . '…[truncated]';
        }

        error_log(sprintf(
            '%s ref=%s status=%d method=%s path=%s user=%s ip=%s payload=%s',
            self::LOG_PREFIX,
            $ref,
            $status,
            strtoupper((string) $request->getMethod()),
            (string) $request->getUri()->getPath(),
            $this->userId($e),
            isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '-',
            str_replace(["\r", "\n"], ' ', $original)
        ));
    }

    /** Back-office user behind the failing call, '-' when there is none. */
    private function userId(MvcEvent $e)
    {
        try {
            $identity = $e->getApplication()->getServiceManager()->get('MelisCoreAuth')->getIdentity();
            if (!empty($identity->usr_id)) {
                return (string) $identity->usr_id;
            }
        } catch (\Throwable $ignored) {
        }

        return '-';
    }

    /** 'sanitize' (default) or 'passthrough'. */
    private function getMode(MvcEvent $e)
    {
        try {
            $config = $e->getApplication()->getServiceManager()
                ->get('MelisCoreConfig')->getItem('meliscore/datas/security');
            if (is_array($config) && !empty($config['api_error_mode'])) {
                $mode = strtolower((string) $config['api_error_mode']);

                return $mode === 'passthrough' ? 'passthrough' : 'sanitize';
            }
        } catch (\Throwable $ignored) {
        }

        return 'sanitize';
    }
}
