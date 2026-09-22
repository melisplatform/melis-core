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
use MelisCore\Service\MelisCoreRateLimitService;

/**
 * GLOBAL rate-limit gate of the authentication entry points (security audit item 17.0).
 *
 * Runs before dispatch on every POST that reaches one of the routes below and asks
 * MelisCoreRateLimitService whether the client is currently locked. Locked = HTTP 429 with a
 * `Retry-After` header, the controller never runs.
 *
 *   scope `login`  - MelisAuth::authenticate (legacy form and React form post the same route).
 *                    Keys: the client IP and the account name typed in. The FAILURES are counted
 *                    by the controller itself (MelisAuthController::buildFailedAuthResult), which
 *                    is the only place that knows the outcome; a success clears the account key.
 *   scope `reset`  - every password request/reset/renewal endpoint, legacy and React API.
 *                    Key: the client IP. Every POST counts as an attempt (these endpoints answer
 *                    the same whatever happens, on purpose - see audit item 9.0 - so there is no
 *                    "failure" to tell apart; what is limited is the number of mails and of token
 *                    guesses a single client can trigger).
 *
 * The coupon scope is not here: the coupon form is a front-office plugin rendered inside a page,
 * so the two validateCoupon() services call the rate limiter themselves.
 *
 * Modes (`meliscore/datas/security/rate_limit_mode`, env MELIS_RATE_LIMIT_MODE): enforce
 * (default), report (log only, grep MELIS_RATELIMIT), off.
 */
class MelisCoreRateLimitListener implements ListenerAggregateInterface
{
    public $listeners = [];

    /** controller => [action => scope] */
    const ROUTES = [
        'MelisCore\Controller\MelisAuth' => [
            'authenticate'       => 'login',
        ],
        'MelisCore\Controller\User' => [
            'lostPasswordRequest' => 'reset',
            'resetPassword'       => 'reset',
            'resetOldPassword'    => 'reset',
            'generatePassword'    => 'reset',
            'renewPassword'       => 'reset',
            'createPassword'      => 'reset',
        ],
        'MelisReactApiAuth' => [
            'forgotPassword'     => 'reset',
            'resetPassword'      => 'reset',
        ],
    ];

    public function attach(EventManagerInterface $events, $priority = -110)
    {
        // After the CSRF gate (-100): a forged request is refused as such, not counted.
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
        if (php_sapi_name() === 'cli') {
            return;
        }

        $request = $e->getRequest();
        if (!$request instanceof HttpRequest || !$request->isPost()) {
            return;
        }

        $scope = $this->scopeOf($e);
        if ($scope === null) {
            return;
        }

        $sm = $e->getApplication()->getServiceManager();
        try {
            /** @var MelisCoreRateLimitService $limiter */
            $limiter = $sm->get('MelisCoreRateLimit');
        } catch (\Throwable $ignored) {
            return; // no limiter, no gate (fail-open, like the service itself)
        }

        $keys = ['ip:' . $limiter->clientIp()];
        if ($scope === 'login') {
            $login = trim((string) $request->getPost('usr_login', ''));
            if ($login !== '') {
                $keys[] = 'user:' . $login;
            }
        }

        $wait = $limiter->check($scope, $keys);
        if ($wait > 0) {
            return $this->deny($e, $wait);
        }

        if ($scope === 'reset') {
            $limiter->hit($scope, $keys);
        }
    }

    /** Scope of the matched route, null when the route is not rate limited. */
    private function scopeOf(MvcEvent $e)
    {
        $match = $e->getRouteMatch();
        if (!$match) {
            return null;
        }

        $controller = (string) $match->getParam('controller', '');
        $action     = (string) $match->getParam('action', '');

        // Short controller names of the React API are prefixed by __NAMESPACE__ at dispatch
        // time only; here they are still the bare alias ("MelisReactApiAuth").
        $controller = ltrim(str_replace('MelisCore\Controller\MelisReactApiAuth', 'MelisReactApiAuth', $controller), '\\');

        if (!isset(self::ROUTES[$controller])) {
            return null;
        }

        // Laminas normalises "lost-password-request" to lostPasswordRequest at dispatch; the
        // route param may carry either spelling.
        $normalized = lcfirst(str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $action))));

        return isset(self::ROUTES[$controller][$normalized]) ? self::ROUTES[$controller][$normalized] : null;
    }

    /**
     * 429 + Retry-After. JSON for XHR / React API calls, plain text otherwise. Returning a
     * Response from EVENT_ROUTE short-circuits the dispatch.
     */
    private function deny(MvcEvent $e, $wait)
    {
        $request  = $e->getRequest();
        $response = $e->getResponse();
        $response->setStatusCode(429);
        $response->getHeaders()->addHeaderLine('Retry-After', (string) $wait);

        $message = $this->message($e, $wait);

        $xhr    = $request->getHeaders()->get('X-Requested-With');
        $isXhr  = $xhr && strtolower($xhr->getFieldValue()) === 'xmlhttprequest';
        $isJson = $isXhr || strpos((string) $request->getUri()->getPath(), '/melis/react-api') === 0;

        if ($isJson) {
            $response->getHeaders()->addHeaderLine('Content-Type', 'application/json; charset=utf-8');
            $response->setContent(json_encode([
                'success'     => false,
                'error'       => 'too_many_attempts',
                'retry_after' => $wait,
                'message'     => $message,
                // Shape of a legacy login answer, so the jQuery form shows the text as-is.
                'errors'      => ['empty' => $message],
            ]));
        } else {
            $response->getHeaders()->addHeaderLine('Content-Type', 'text/plain; charset=utf-8');
            $response->setContent('429 Too Many Requests - ' . $message);
        }

        $e->stopPropagation(true);

        return $response;
    }

    private function message(MvcEvent $e, $wait)
    {
        $text = 'Too many attempts. Please retry in %d seconds.';
        try {
            $translator = $e->getApplication()->getServiceManager()->get('translator');
            $translated = $translator->translate('tr_meliscore_rate_limit_too_many_attempts');
            if ($translated && $translated !== 'tr_meliscore_rate_limit_too_many_attempts') {
                $text = $translated;
            }
        } catch (\Throwable $ignored) {
        }

        return sprintf($text, $wait);
    }
}
