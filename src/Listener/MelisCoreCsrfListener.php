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
 * GLOBAL CSRF gate for the back-office (audit item 10.0).
 *
 * Checks, on EVERY state-changing back-office request, two independent things:
 *   1. the token (see MelisCoreCsrfService): header `X-Melis-Csrf`, or `melis_csrf` POST field;
 *   2. the origin: the `Origin` (or, failing that, `Referer`) host must be our own host.
 *
 * ONE place, no per-controller call: the legacy back-office and the React one both simply echo the
 * cookie back, so nothing has to be touched tool by tool (and no .phtml is modified).
 *
 * TWO MODES (`meliscore/datas/security/csrf_mode`, env `MELIS_CSRF_MODE`):
 *   - `enforce` (DEFAULT): a failure becomes a real 403 before dispatch. Default on purpose - a
 *     protection that ships disabled protects nobody.
 *   - `report`: escape hatch. Nothing is blocked, every failure is written to the PHP log. Set
 *     MELIS_CSRF_MODE=report if a legitimate POST turns out not to carry the token yet (a module
 *     doing its own XMLHttpRequest, a hidden-iframe upload, a third-party callback), read the
 *     inventory (`grep MELIS_CSRF`), fix it, and put enforce back. No code change, no deploy.
 *
 * SCOPE: back-office paths only (`/melis…`, which covers `/melis/react-api` and `/melis-react`).
 * The front-office site, the assets (`/MelisCore/…`) and the CLI are never touched.
 *
 * FAIL-OPEN, ON PURPOSE, IN TWO CASES, both of them a session with nothing worth forging yet:
 *   - no token in the session at all (CLI, a cron or microservice call with no session);
 *   - a token minted during THIS request, which the client is only now receiving and therefore
 *     cannot echo back (see MelisCoreCsrfService::wasJustMinted()).
 * An attacker cannot empty a victim's session, so neither case is an authenticated one.
 */
class MelisCoreCsrfListener implements ListenerAggregateInterface
{
    public $listeners = [];

    /** Log prefix, to collect the inventory: `docker logs <container> | grep MELIS_CSRF`. */
    const LOG_PREFIX = 'MELIS_CSRF';

    /** Protected path tree (the back-office). Case-sensitive: `/MelisCore/…` assets are excluded. */
    const BACKOFFICE_PATH_PREFIX = '/melis';

    /** Methods that must not change state, hence not checked. */
    const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

    public function attach(EventManagerInterface $events, $priority = -100)
    {
        // Negative priority: runs AFTER Module::checkIdentity(), i.e. on a request that already
        // has (or does not have) an identity, and still before the controller is dispatched.
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
            return; // front-office, assets, another route tree: out of scope
        }

        if (MelisCoreCsrfService::getToken() === '') {
            return; // no session token: nothing to protect (see class doc)
        }

        if (MelisCoreCsrfService::wasJustMinted()) {
            // The client is being handed the token in THIS response; it cannot have echoed it
            // back. Refusing here would reject the first POST of a fresh browser (typically the
            // React login form on a /melis-react deep link) and make it work only on retry.
            // See MelisCoreCsrfService::wasJustMinted() for why this weakens nothing.
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
     * `Origin` when the browser sends it (all modern browsers do on a cross-site POST, which is
     * exactly the attack), `Referer` otherwise. Neither one = refused: a forged request is not
     * going to be the one advertising where it comes from.
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
            // Unreadable configuration: stay on the default, which protects.
        }

        return $mode === 'report' ? 'report' : 'enforce';
    }

    /**
     * 403. JSON for API/XHR calls (the React front expects `{success,error}`), plain text otherwise.
     * Returning a Response from EVENT_ROUTE short-circuits the dispatch: the controller never runs,
     * so the forged request has no side effect at all.
     *
     * The reason travels back in `X-Melis-Csrf-Reason` (origin / token-missing / token-mismatch).
     * It is the same string written to the PHP log, repeated where an operator can actually read
     * it: the browser's network panel. That is the only way to tell these three apart on an
     * environment whose logs are out of reach, and it hands an attacker nothing - a cross-site
     * forgery cannot read the response it provokes, which is what makes CSRF blind in the first
     * place. The body stays generic.
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
