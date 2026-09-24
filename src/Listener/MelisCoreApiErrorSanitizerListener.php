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
 * GLOBAL scrubber for back-office JSON error responses (audit item 13.0).
 *
 * THE PROBLEM IT SOLVES
 * ---------------------
 * The HTML error page is already safe (`display_errors=0`, `layout/layoutError`), but that gate
 * only covers the exception that BUBBLES UP to the framework. The React API controllers never let
 * one bubble: each catches `\Throwable` itself and hand-builds its JSON body, typically
 *
 *     return $this->jsonResponse([
 *         'success' => false,
 *         'error'   => $e->getMessage(),
 *         'file'    => basename($e->getFile()) . ':' . $e->getLine(),
 *     ], 500);
 *
 * No configuration is consulted on that path, so the exception message - and in two cases a stack
 * trace with absolute server paths - was returned to the browser on EVERY environment, production
 * included. ~160 such returns exist across ~76 controllers in ~32 modules.
 *
 * WHY A LISTENER AND NOT 76 PATCHES
 * ---------------------------------
 * Every one of those controllers answers under `/melis…`, returns a real `Laminas\Http\Response`
 * from its action, and none calls `send()` itself - so all of them pass through EVENT_FINISH.
 * Scrubbing the response here fixes the whole surface from MelisCore alone: no module is edited,
 * no module can regress it, and a controller added tomorrow is covered the day it ships.
 *
 * WHAT IS SCRUBBED
 * ----------------
 * A JSON response under `/melis…` that is either a 5xx, or carries a `file` / `trace` /
 * `traceAsString` key (the exception-shaped payload above, at any status). Its body becomes
 *
 *     {"success":false,"error":"An unexpected error occurred","errorRef":"a1b2c3d4e5f6"}
 *
 * and the ORIGINAL payload goes to the PHP log under that same reference, with the route and the
 * user - so support can match a screenshot to a log line (`grep MELIS_API_ERROR <ref>`).
 *
 * 2xx/3xx responses, the front-office, the assets and the CLI are never touched. A 4xx keeps its
 * status; only its body is replaced, and only if it was leaking internals.
 *
 * NOTE ON THE LOG: the exception object is long gone (the controller swallowed it), so the log
 * records the original message and `file:line` as the payload carried them, not a full stack
 * trace. Getting real traces would mean editing the controllers - the point of this listener is
 * that we do not have to.
 *
 * TWO MODES (`meliscore/datas/security/api_error_mode`, env `MELIS_API_ERROR_MODE`):
 *   - `sanitize` (DEFAULT): as described above.
 *   - `passthrough`: the original body is returned untouched, and still logged. For a developer
 *     machine only - it is exactly the leak this listener exists to close.
 */
class MelisCoreApiErrorSanitizerListener implements ListenerAggregateInterface
{
    public $listeners = [];

    /** Log prefix: `docker logs <container> | grep MELIS_API_ERROR`. */
    const LOG_PREFIX = 'MELIS_API_ERROR';

    /** Back-office path tree. Case-sensitive, so the `/MelisCore/…` assets stay out. */
    const BACKOFFICE_PATH_PREFIX = '/melis';

    /** What the client is told instead of the exception message. */
    const GENERIC_MESSAGE = 'An unexpected error occurred';

    /** Payload keys that, alone, prove the body was built from an exception. */
    const LEAKING_KEYS = ['file', 'trace', 'traceAsString', 'exception', 'line'];

    public function attach(EventManagerInterface $events, $priority = -9000)
    {
        // Low priority: run after everything else that may still touch the response - but STRICTLY
        // ABOVE -10000, which is where Laminas' own SendResponseListener sits. At -10000 we would
        // tie with it and, being attached later, run second: the body would already be on the wire
        // and the scrubbing a no-op (the log line would still appear, which makes the mistake look
        // like it worked). Verified: at -10000 the exception message still reached the client.
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
            return; // developer machine: keep the detail on screen (logged either way)
        }

        $this->scrub($response, $ref);
    }

    /**
     * A 5xx is an unhandled failure by definition, so its body is never meant for a human. Below
     * that, only an exception-shaped payload is touched - a 400 saying "Invalid email" is a real
     * message for the user and must survive.
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

    /**
     * The whole original payload, on one line, so nothing of what the developer wanted to see is
     * lost - it just moves from the browser to the server.
     */
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
            // No auth service, no session, or a broken one: the reference is enough.
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
            // Unreadable configuration: stay on the default, which protects.
        }

        return 'sanitize';
    }
}
