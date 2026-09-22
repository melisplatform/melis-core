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
 * Garde-fou d'autorisation GLOBAL du back-office (audit DEKRA 7.0).
 *
 * `Module::checkIdentity()` ne vérifie que l'AUTHENTIFICATION : tout compte connecté atteint
 * n'importe quelle action dispatchée. L'autorisation, elle, est laissée à des appels
 * `hasAccess()`/`denyUnlessAccess()` recopiés dans ~190 contrôleurs sur ~500 — en oublier un
 * n'ouvre aucune alarme, ça ouvre juste l'endpoint.
 *
 * Ce listener déplace la décision à l'ENTRÉE : sur chaque route du back-office, il résout l'outil
 * visé et interroge `MelisCoreRights::canAccess()` AVANT que le contrôleur ne s'exécute.
 *
 * RÉSOLUTION SANS TABLE DE CORRESPONDANCE : la clé d'outil est lue sur la CLASSE du contrôleur
 * routé (`const MELIS_KEY` ou `const TOOL_KEY`), constantes qui existent déjà dans une centaine de
 * contrôleurs. Rien à maintenir au centre ; un module qui ajoute un contrôleur déclare sa clé chez
 * lui, comme il déclare déjà ses capacités (`react.capabilities.php`).
 * Cas particulier — un contrôleur qui sert PLUSIEURS outils déclare en plus :
 *     const TOOL_KEY_MAP = ['getUserConnectionData' => 'user_view_date_connection_tool'];
 * (clé = nom d'action, comparé sans tiret/casse ; sinon la constante de classe s'applique).
 *
 * DEUX MODES (`meliscore/datas/security/access_gate_mode`, env `MELIS_ACCESS_GATE_MODE`) :
 *   - `report` (défaut) : rien n'est bloqué, chaque décision est tracée dans le journal PHP. C'est
 *     la phase d'inventaire : elle liste les contrôleurs RÉELLEMENT dispatchés qui n'ont pas encore
 *     de clé, sans risquer d'enfermer qui que ce soit dehors.
 *   - `enforce` : un refus devient un vrai 403. Les routes non résolues restent passantes tant que
 *     `access_gate_strict` n'est pas activé (dernière marche, une fois l'inventaire terminé).
 *
 * Périmètre : uniquement l'arbre de routes du back-office (`melis-backoffice*`). Le site front,
 * la CLI et les `excluded_routes` (login, setup, mot de passe oublié, shell SPA…) ne sont jamais
 * touchés — c'est la même liste que `checkIdentity()`.
 */
class MelisCoreAuthorizationListener implements ListenerAggregateInterface
{
    public $listeners = [];

    /** Préfixe des lignes de journal, pour récolter l'inventaire : `docker logs | grep`. */
    const LOG_PREFIX = 'MELIS_ACCESS_GATE';

    /** Arbre de routes protégé (le back-office). */
    const BACKOFFICE_ROUTE_PREFIX = 'melis-backoffice';

    public function attach(EventManagerInterface $events, $priority = -100)
    {
        // Priorité négative : passe APRÈS Module::checkIdentity() (priorité par défaut), donc
        // l'utilisateur est déjà authentifié — ou déjà redirigé — quand on décide de l'autorisation.
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
            return; // site front, assets, routes d'un autre arbre : hors périmètre
        }

        $sm = $e->getApplication()->getServiceManager();

        if ($this->isExcludedRoute($sm, $routeName)) {
            return; // login, setup, mot de passe oublié, shell SPA… (même liste que checkIdentity)
        }

        $controller = (string) $routeMatch->getParam('controller', '');
        $action     = (string) $routeMatch->getParam('action', '');
        $candidates = $this->resolveToolKey($sm, $controller, $action);
        $mode       = $this->getMode($sm);

        // Première candidate que l'arbre des droits sait accorder (cf. isGrantableKey).
        $toolKey = null;
        foreach ((array) $candidates as $candidate) {
            if ($this->isGrantableKey($sm, $candidate)) {
                $toolKey = $candidate;
                break;
            }
        }

        if ($toolKey === null) {
            if (!empty($candidates)) {
                // Le contrôleur annonce une clé, mais aucune n'est accordable : on journalise.
                $this->log('UNMAPPED', $mode, $routeName, $controller, $action, $candidates[0]);

                return;
            }

            // Inventaire : ce contrôleur n'annonce pas d'outil. On ne bloque qu'en mode strict.
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
     * La clé est-elle accordable par l'arbre des droits (sections + outils de
     * getToolSectionMap, sous leur clé de config ET leur melisKey résolu) ?
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
                $grantable = []; // arbre illisible : plus aucune clé n'est « accordable » → on ne bloque pas
            }
        }

        return isset($grantable[$key]);
    }

    /**
     * Clés d'outil annoncées par la classe du contrôleur routé (par ordre de préférence), ou null.
     *
     * Aucune instanciation : le nom de contrôleur est traduit en classe via la configuration
     * `controllers` (invokables/aliases/factories), puis lu par réflexion.
     */
    private function resolveToolKey($sm, $controller, $action)
    {
        $class = $this->resolveControllerClass($sm, $controller);
        if ($class === null) {
            return null;
        }

        try {
            $reflection = new \ReflectionClass($class);

            if ($reflection->hasConstant('TOOL_KEY_MAP')) {
                $map    = (array) $reflection->getConstant('TOOL_KEY_MAP');
                $wanted = $this->normalizeAction($action);
                foreach ($map as $mappedAction => $mappedKey) {
                    if ($this->normalizeAction($mappedAction) === $wanted && !empty($mappedKey)) {
                        return [(string) $mappedKey];
                    }
                }
            }

            // INTERFACE_KEY est inclus à dessein : plusieurs contrôleurs legacy (Platforms,
            // Langues, Emails, Langues CMS, Platform IDs CMS, liste Blog) portent leur clé de
            // DROIT sous ce nom, `TOOL_KEY` désignant chez eux un identifiant d'outil interne
            // que l'arbre des droits ne connaît pas. Les candidates sont renvoyées dans l'ordre
            // et l'appelant retient la première que l'arbre sait accorder.
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
            // Classe illisible : traité comme non résolu (jamais comme une autorisation).
        }

        return null;
    }

    /** Nom de contrôleur routé → nom de classe, sans instancier le contrôleur. */
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
                // Un alias peut pointer vers un autre alias : on suit une fois.
                return class_exists($target)
                    ? $target
                    : ($controllersConfig['invokables'][$target] ?? $controllersConfig['aliases'][$target] ?? null);
            }
        }

        return isset($controllersConfig['factories'][$controller]) && class_exists($controller)
            ? $controller
            : null;
    }

    /** `get-user-connection-data`, `getUserConnectionData`, `GetUserConnectionData` → même clé. */
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

    /** 'report' (défaut) ou 'enforce'. */
    private function getMode($sm)
    {
        $mode = strtolower((string) $this->getSecurityValue($sm, 'access_gate_mode', 'report'));

        return $mode === 'enforce' ? 'enforce' : 'report';
    }

    /** Mode strict : une route non résolue est refusée (dernière marche du déploiement). */
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
            // Configuration illisible : on reste sur le défaut (report), jamais sur un blocage.
        }

        return $default;
    }

    /**
     * 403. JSON pour les appels d'API/XHR (le front React attend `{success,error}`), texte sinon.
     * Retourner une Response depuis EVENT_ROUTE court-circuite le dispatch : le contrôleur n'est
     * jamais exécuté, donc aucun effet de bord ni fuite de données.
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

    /**
     * Une ligne par requête dans le journal PHP (jamais dans `melis_core_log` : en mode report le
     * volume est celui de la navigation entière, ce n'est pas une alerte de sécurité mais un
     * inventaire). Récolte : `docker logs <conteneur> | grep MELIS_ACCESS_GATE`.
     */
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
