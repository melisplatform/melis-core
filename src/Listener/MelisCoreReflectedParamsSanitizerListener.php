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
 * Normalisation des paramètres-identifiants du back-office.
 *
 * `melisKey` / `id` / `codename` / `configId`… sont par sémantique des identifiants (clés de
 * config Melis, ids DOM, codenames d'emails), jamais du HTML. Tout caractère hors
 * [A-Za-z0-9_.-] est retiré du RouteMatch et de la query string, pour toutes les routes de
 * l'arbre `melis-backoffice` (même périmètre que checkIdentity ; le site front n'est pas touché).
 * Un identifiant valide passe inchangé.
 */
class MelisCoreReflectedParamsSanitizerListener implements ListenerAggregateInterface
{
    /** Paramètres traités — tous identifiants par contrat dans toute la plateforme. */
    private const IDENTIFIER_PARAMS = ['melisKey', 'id', 'codename', 'configId', 'boeId', 'zoneId'];

    public $listeners = [];

    public function attach(EventManagerInterface $events, $priority = 1)
    {
        // Après le routing (le router écoute EVENT_ROUTE à priorité haute) : le RouteMatch existe.
        $this->listeners[] = $events->attach(MvcEvent::EVENT_ROUTE, function (MvcEvent $e) {
            $routeMatch = $e->getRouteMatch();
            if (!$routeMatch) {
                return;
            }
            // Périmètre : le back-office uniquement (même arbre que checkIdentity).
            if (strpos((string) $routeMatch->getMatchedRouteName(), 'melis-backoffice') !== 0) {
                return;
            }

            foreach (self::IDENTIFIER_PARAMS as $param) {
                $value = $routeMatch->getParam($param);
                if (is_string($value) && $value !== '') {
                    $routeMatch->setParam($param, self::sanitizeIdentifier($value));
                }
            }

            $request = $e->getRequest();
            if (method_exists($request, 'getQuery')) {
                $query = $request->getQuery();
                foreach (self::IDENTIFIER_PARAMS as $param) {
                    $value = $query->get($param);
                    if (is_string($value) && $value !== '') {
                        $query->set($param, self::sanitizeIdentifier($value));
                    }
                }
            }
        }, $priority);
    }

    public function detach(EventManagerInterface $events)
    {
        foreach ($this->listeners as $index => $listener) {
            $events->detach($listener);
            unset($this->listeners[$index]);
        }
    }

    /** Garde uniquement les caractères d'identifiant ; borne la longueur (aucun id légitime ne dépasse ça). */
    public static function sanitizeIdentifier(string $value): string
    {
        return substr((string) preg_replace('/[^A-Za-z0-9_.\-]/', '', $value), 0, 191);
    }
}
