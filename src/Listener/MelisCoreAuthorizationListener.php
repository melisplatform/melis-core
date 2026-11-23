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
use Laminas\Mvc\MvcEvent;

/**
 * Back-office route authorization.
 *
 * On every back-office route, resolves the tool key of the routed controller and checks it
 * with `MelisCoreRights::canAccess()` before the controller is dispatched.
 *
 * The key is read from the controller CLASS (`const MELIS_KEY`, `TOOL_KEY` or `INTERFACE_KEY`),
 * so a module adding a controller declares its key in the controller itself.
 *
 * A controller serving several tools can also declare a per-action map:
 *     const TOOL_KEY_MAP = ['getUserConnectionData' => 'user_view_date_connection_tool'];
 * (key = action name, compared case-insensitively and without dashes; otherwise the class
 * constant applies). The value can also be:
 *   - a LIST of keys — the action is shared by several tools, ONE of them is enough:
 *         'getOrderListData' => ['meliscommerce_order_list_page', 'meliscommerce_clients_list_page'],
 *   - `'@login'` (self::LOGIN_ONLY) — generic read used by any tool (page selector, author
 *     list…): requires an authenticated user, no tool right.
 */
class MelisCoreAuthorizationListener implements ListenerAggregateInterface
{
    public $listeners = [];

    const LOG_PREFIX = 'MELIS_ACCESS_GATE';

    const BACKOFFICE_ROUTE_PREFIX = 'melis-backoffice';

    /** TOOL_KEY_MAP value: authenticated user, no tool right required. */
    const LOGIN_ONLY = '@login';

    public function attach(EventManagerInterface $events, $priority = -100)
    {
        // Negative priority: runs after Module::checkIdentity(), so the user is already authenticated.
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

        $routeMatch = $e->getRouteMatch();
        if (empty($routeMatch)) {
            return;
        }

        $routeName = (string) $routeMatch->getMatchedRouteName();
        if (strpos($routeName, self::BACKOFFICE_ROUTE_PREFIX) !== 0) {
            return;
        }

        $sm = $e->getApplication()->getServiceManager();

        if ($this->isExcludedRoute($sm, $routeName)) {
            return;
        }

        $controller = (string) $routeMatch->getParam('controller', '');
        $action     = (string) $routeMatch->getParam('action', '');
        $mode       = $this->getMode($sm);

        // Per-action rule (TOOL_KEY_MAP) takes precedence over the class key.
        $rule = $this->resolveActionRule($sm, $controller, $action);

        if ($rule === self::LOGIN_ONLY) {
            $this->log('OPEN', $mode, $routeName, $controller, $action, self::LOGIN_ONLY);

            return;
        }

        if (is_array($rule) && count($rule) > 1) {
            // Shared action: access to ONE of the keys is enough.
            $grantable = array_values(array_filter($rule, function ($key) use ($sm) {
                return $this->isGrantableKey($sm, $key);
            }));
            if (!$grantable) {
                $this->log('UNMAPPED', $mode, $routeName, $controller, $action, $rule[0]);

                return;
            }
            foreach ($grantable as $key) {
                if ($sm->get('MelisCoreRights')->canAccess($key)) {
                    return;
                }
            }
            $toolKey = implode('|', $grantable);
            $this->log('DENY', $mode, $routeName, $controller, $action, $toolKey);

            return $mode === 'enforce' ? $this->deny($e, $toolKey) : null;
        }

        $candidates = $rule !== null ? $rule : $this->resolveToolKey($sm, $controller, $action);

        // First candidate known to the rights tree.
        $toolKey = null;
        foreach ((array) $candidates as $candidate) {
            if ($this->isGrantableKey($sm, $candidate)) {
                $toolKey = $candidate;
                break;
            }
        }

        if ($toolKey === null) {
            if (!empty($candidates)) {
                $this->log('UNMAPPED', $mode, $routeName, $controller, $action, $candidates[0]);

                return;
            }

            $this->log('UNMAPPED', $mode, $routeName, $controller, $action, null);

            return $this->isStrict($sm) && $mode === 'enforce' ? $this->deny($e, $controller) : null;
        }

        if ($sm->get('MelisCoreRights')->canAccess($toolKey)) {
            return;
        }

        $this->log('DENY', $mode, $routeName, $controller, $action, $toolKey);

        return $mode === 'enforce' ? $this->deny($e, $toolKey) : null;
    }

    /**
     * Whether the key exists in the rights tree (sections and tools of getToolSectionMap,
     * under their config key and their resolved melisKey).
     */
    private function isGrantableKey($sm, $key)
    {
        static $grantable = null;

        if ($grantable === null) {
            $grantable = [];
            try {
                $collect = function ($nodes, $depth) use (&$collect, &$grantable) {
                    foreach ((array) $nodes as $node) {
                        if (!is_array($node)) {
                            continue;
                        }
                        if ($depth > 0) {
                            foreach (['key', 'melisKey'] as $field) {
                                if (!empty($node[$field]) && is_string($node[$field])) {
                                    $grantable[$node[$field]] = true;
                                }
                            }
                        }
                        if (!empty($node['children'])) {
                            $collect($node['children'], $depth + 1);
                        }
                    }
                };
                $collect($sm->get('MelisCoreRights')->getToolSectionMap(), 0);
            } catch (\Throwable $e) {
                $grantable = [];
            }
        }

        return isset($grantable[$key]);
    }

    /**
     * TOOL_KEY_MAP rule for the routed action: self::LOGIN_ONLY, a list of keys, or null
     * (no entry → the class key applies).
     */
    private function resolveActionRule($sm, $controller, $action)
    {
        $class = $this->resolveControllerClass($sm, $controller);
        if ($class === null) {
            return null;
        }

        try {
            $reflection = new \ReflectionClass($class);
            if (!$reflection->hasConstant('TOOL_KEY_MAP')) {
                return null;
            }

            $wanted = $this->normalizeAction($action);
            foreach ((array) $reflection->getConstant('TOOL_KEY_MAP') as $mappedAction => $mappedKey) {
                if ($this->normalizeAction($mappedAction) !== $wanted || empty($mappedKey)) {
                    continue;
                }
                if ($mappedKey === self::LOGIN_ONLY) {
                    return self::LOGIN_ONLY;
                }
                $keys = array_values(array_filter(array_map('strval', (array) $mappedKey)));

                return $keys ?: null;
            }
        } catch (\Throwable $ignored) {
        }

        return null;
    }

    /**
     * Tool keys declared by the routed controller class, in order of preference, or null.
     *
     * No instantiation: the controller name is mapped to its class through the `controllers`
     * config (invokables/aliases/factories), then read by reflection. Candidates are returned
     * in order and the caller keeps the first one the rights tree knows.
     */
    private function resolveToolKey($sm, $controller, $action)
    {
        $class = $this->resolveControllerClass($sm, $controller);
        if ($class === null) {
            return null;
        }

        try {
            $reflection = new \ReflectionClass($class);

            $candidates = [];
            foreach (['MELIS_KEY', 'TOOL_KEY', 'INTERFACE_KEY'] as $constant) {
                if ($reflection->hasConstant($constant)) {
                    $key = $reflection->getConstant($constant);
                    if (is_string($key) && $key !== '') {
                        $candidates[] = $key;
                    }
                }
            }
            if ($candidates) {
                return $candidates;
            }
        } catch (\Throwable $ignored) {
        }

        return null;
    }

    /** Routed controller name to class name, without instantiating it. */
    private function resolveControllerClass($sm, $controller)
    {
        if ($controller === '') {
            return null;
        }
        if (class_exists($controller)) {
            return $controller;
        }

        try {
            $controllersConfig = $sm->get('config')['controllers'] ?? [];
        } catch (\Throwable $ignored) {
            return null;
        }

        foreach (['invokables', 'aliases'] as $section) {
            $target = $controllersConfig[$section][$controller] ?? null;
            if (is_string($target) && $target !== '') {
                // An alias may point to another alias: follow it once.
                return class_exists($target)
                    ? $target
                    : ($controllersConfig['invokables'][$target] ?? $controllersConfig['aliases'][$target] ?? null);
            }
        }

        return isset($controllersConfig['factories'][$controller]) && class_exists($controller)
            ? $controller
            : null;
    }

    /** `get-user-connection-data`, `getUserConnectionData`, `GetUserConnectionData` → same key. */
    private function normalizeAction($action)
    {
        return strtolower(str_replace(['-', '_'], '', (string) $action));
    }

    private function isExcludedRoute($sm, $routeName)
    {
        try {
            $excluded = $sm->get('MelisConfig')->getItem('/meliscore/datas/excluded_routes');
        } catch (\Throwable $ignored) {
            return false;
        }

        return is_array($excluded) && in_array($routeName, $excluded, true);
    }

    private function getMode($sm)
    {
        $mode = strtolower((string) $this->getSecurityValue($sm, 'access_gate_mode', 'report'));

        return $mode === 'enforce' ? 'enforce' : 'report';
    }

    private function isStrict($sm)
    {
        $strict = strtolower((string) $this->getSecurityValue($sm, 'access_gate_strict', '0'));

        return in_array($strict, ['1', 'true', 'yes', 'on'], true);
    }

    private function getSecurityValue($sm, $key, $default)
    {
        try {
            $config = $sm->get('MelisCoreConfig')->getItem('meliscore/datas/security');
            if (is_array($config) && isset($config[$key]) && $config[$key] !== '') {
                return $config[$key];
            }
        } catch (\Throwable $ignored) {
        }

        return $default;
    }

    /**
     * 403 response: JSON for API/XHR calls (the React front expects `{success,error}`), plain text
     * otherwise. Returning a Response from EVENT_ROUTE short-circuits the dispatch.
     */
    private function deny(MvcEvent $e, $what)
    {
        $request  = $e->getRequest();
        $response = $e->getResponse();
        $response->setStatusCode(403);

        $xhr    = $request->getHeaders()->get('X-Requested-With');
        $isXhr  = $xhr && strtolower($xhr->getFieldValue()) === 'xmlhttprequest';
        $isJson = $isXhr || strpos((string) $request->getUri()->getPath(), '/melis/react-api') === 0;

        if ($isJson) {
            $response->getHeaders()->addHeaderLine('Content-Type', 'application/json; charset=utf-8');
            $response->setContent(json_encode(['success' => false, 'error' => 'Forbidden']));
        } else {
            $response->getHeaders()->addHeaderLine('Content-Type', 'text/plain; charset=utf-8');
            $response->setContent('403 Forbidden');
        }

        $e->stopPropagation(true);

        return $response;
    }

    private function log($decision, $mode, $routeName, $controller, $action, $toolKey)
    {
        error_log(sprintf(
            '%s %s mode=%s route=%s controller=%s action=%s key=%s',
            self::LOG_PREFIX,
            $decision,
            $mode,
            $routeName,
            $controller !== '' ? $controller : '-',
            $action !== '' ? $action : '-',
            $toolKey !== null ? $toolKey : '-'
        ));
    }
}
