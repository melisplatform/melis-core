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
use Laminas\Mvc\MvcEvent;
use MelisCore\Service\MelisCoreCsrfService;

/**
 * Back-office CSRF check.
 *
 * On state-changing back-office requests, checks:
 *   1. the token (see MelisCoreCsrfService): header `X-Melis-Csrf`, or `melis_csrf` POST field;
 *   2. the origin: the `Origin` (or, failing that, `Referer`) host must be our own host.
 *
 * The legacy back-office and the React one both echo the cookie back, so no per-controller
 * call is needed.
 *
 * Mode: `meliscore/datas/security/csrf_mode` (`enforce` by default).
 */
class MelisCoreCsrfListener implements ListenerAggregateInterface
{
    public $listeners = [];

    const LOG_PREFIX = 'MELIS_CSRF';

    /** Back-office path prefix (case-sensitive). */
    const BACKOFFICE_PATH_PREFIX = '/melis';

    /** Methods that must not change state, hence not checked. */
    const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

    public function attach(EventManagerInterface $events, $priority = -100)
    {
        // Negative priority: runs after Module::checkIdentity() and before the controller is dispatched.
        $this->listeners[] = $events->attach(MvcEvent::EVENT_ROUTE, [$this, 'onRoute'], $priority);
    }

    public function detach(EventManagerInterface $events)
    {
        foreach ($this->listeners as $index => $listener) {
            if ($events->detach($listener)) {
                unset($this->listeners[$index]);
            }
        }
    }

    public function onRoute(MvcEvent $e)
    {
        $result = $this->gate($e);

        // The token field is transport only. Once checked, drop it from the POST so controllers
        // that persist `getPost()->toArray()` as is (many legacy tools do) never try to write a
        // `melis_csrf` column.
        $request = $e->getRequest();
        if ($request instanceof HttpRequest
            && strpos((string) $request->getUri()->getPath(), self::BACKOFFICE_PATH_PREFIX) === 0
        ) {
            $post = $request->getPost();
            if ($post->offsetExists(MelisCoreCsrfService::FIELD_NAME)) {
                $post->offsetUnset(MelisCoreCsrfService::FIELD_NAME);
            }
        }

        return $result;
    }

    private function gate(MvcEvent $e)
    {
        if (php_sapi_name() === 'cli') {
            return;
        }

        $request = $e->getRequest();
        if (!$request instanceof HttpRequest) {
            return;
        }

        $method = strtoupper((string) $request->getMethod());
        if (in_array($method, self::SAFE_METHODS, true)) {
            return;
        }

        $path = (string) $request->getUri()->getPath();
        if (strpos($path, self::BACKOFFICE_PATH_PREFIX) !== 0) {
            return;
        }

        if (MelisCoreCsrfService::getToken() === '') {
            return;
        }

        if (MelisCoreCsrfService::wasJustMinted()) {
            $this->log('ALLOW', 'token-just-minted', 'grace', $method, $path);

            return;
        }

        $reason = $this->check($request);
        if ($reason === null) {
            return;
        }

        $sm   = $e->getApplication()->getServiceManager();
        $mode = $this->getMode($sm);

        $this->log('DENY', $reason, $mode, $method, $path);

        return $mode === 'enforce' ? $this->deny($e, $reason) : null;
    }

    /** null when the request is legitimate, otherwise the failure reason (for the log). */
    private function check(HttpRequest $request)
    {
        if (!$this->isSameOrigin($request)) {
            return 'origin';
        }

        $header    = $request->getHeaders()->get(MelisCoreCsrfService::HEADER_NAME);
        $submitted = $header ? $header->getFieldValue() : $request->getPost(MelisCoreCsrfService::FIELD_NAME);

        if (!MelisCoreCsrfService::isValid($submitted)) {
            return empty($submitted) ? 'token-missing' : 'token-mismatch';
        }

        return null;
    }

    /**
     * Compares the `Origin` host (or `Referer` when absent) with the request host.
     */
    private function isSameOrigin(HttpRequest $request)
    {
        $headers = $request->getHeaders();

        foreach (['Origin', 'Referer'] as $name) {
            $header = $headers->get($name);
            if (!$header) {
                continue;
            }

            $value = trim((string) $header->getFieldValue());
            if ($value === '' || $value === 'null') {
                continue;
            }

            $host = parse_url($value, PHP_URL_HOST);
            if (empty($host)) {
                continue;
            }

            $port = parse_url($value, PHP_URL_PORT);
            $host = $host . ($port ? ':' . $port : '');
            $self = $this->requestHost($request);

            // The Host header carries the port only when it is not the default one, so compare
            // both with and without it rather than guessing the scheme's default port.
            return strcasecmp($host, $self) === 0
                || strcasecmp(preg_replace('/:\d+$/', '', $host), preg_replace('/:\d+$/', '', $self)) === 0;
        }

        return false;
    }

    /** Host as the browser addressed it ("dev6.local", "example.com:8080"). */
    private function requestHost(HttpRequest $request)
    {
        $header = $request->getHeaders()->get('Host');

        return $header ? trim((string) $header->getFieldValue()) : '';
    }

    /** 'enforce' (default) or 'report'. */
    private function getMode($sm)
    {
        $mode = 'enforce';

        try {
            $config = $sm->get('MelisCoreConfig')->getItem('meliscore/datas/security');
            if (is_array($config) && !empty($config['csrf_mode'])) {
                $mode = strtolower((string) $config['csrf_mode']);
            }
        } catch (\Throwable $ignored) {
        }

        return $mode === 'report' ? 'report' : 'enforce';
    }

    /**
     * 403. JSON for API/XHR calls (the React front expects `{success,error}`), plain text otherwise.
     * Returning a Response from EVENT_ROUTE short-circuits the dispatch.
     *
     * The reason (origin / token-missing / token-mismatch) is sent in `X-Melis-Csrf-Reason`.
     */
    private function deny(MvcEvent $e, $reason = '')
    {
        $request  = $e->getRequest();
        $response = $e->getResponse();
        $response->setStatusCode(403);

        if ($reason !== '') {
            $response->getHeaders()->addHeaderLine('X-Melis-Csrf-Reason', $reason);
        }

        $xhr    = $request->getHeaders()->get('X-Requested-With');
        $isXhr  = $xhr && strtolower($xhr->getFieldValue()) === 'xmlhttprequest';
        $isJson = $isXhr || strpos((string) $request->getUri()->getPath(), '/melis/react-api') === 0;

        if ($isJson) {
            $response->getHeaders()->addHeaderLine('Content-Type', 'application/json; charset=utf-8');
            $response->setContent(json_encode(['success' => false, 'error' => 'Invalid CSRF token']));
        } else {
            $response->getHeaders()->addHeaderLine('Content-Type', 'text/plain; charset=utf-8');
            $response->setContent('403 Forbidden - invalid CSRF token');
        }

        $e->stopPropagation(true);

        return $response;
    }

    private function log($decision, $reason, $mode, $method, $path)
    {
        error_log(sprintf(
            '%s %s mode=%s reason=%s method=%s path=%s ip=%s',
            self::LOG_PREFIX,
            $decision,
            $mode,
            $reason,
            $method,
            $path,
            isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '-'
        ));
    }
}
