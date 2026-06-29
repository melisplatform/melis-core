<?php

/**
 * Capacités d'outils — droits avancés du back-office React (déclaration plate, par module).
 *
 * Fichier VOLONTAIREMENT SÉPARÉ (pas dans module.config.php) : chaque module déclare ICI les
 * capacités de SES outils, par `melisKey`. Indépendant de `app.interface.php` et du rendu legacy
 * → se migre proprement le jour où le backend est réécrit (les capacités voyagent avec le module).
 *
 * Sémantique : ces capacités gouvernent les COMPOSANTS INTERNES d'un outil déjà autorisé
 * (la liste / créer / éditer / supprimer, et plus tard des clés custom). Default-allow.
 * Lu par MelisReactApi\Service\Capabilities via la config mergée (clé `melisReactToolCapabilities`).
 * Mergé dans MelisCore\Module::getConfig().
 */

return [
    'melisReactToolCapabilities' => [
        // Outils natifs MelisCore. `export` n'est déclaré QUE pour les outils qui ont un bouton Export.
        'melis_core_announcement_tool' => ['list', 'create', 'edit', 'delete', 'export'],
        'meliscore_tool_user'          => ['list', 'create', 'edit', 'delete', 'export'],
        'meliscore_tool_platform'      => ['list', 'create', 'edit', 'delete'],
        'meliscore_tool_language'      => ['list', 'create', 'edit', 'delete'],
        'meliscore_tool_emails_mngt'   => ['list', 'create', 'edit', 'delete'],
        'meliscore_tool_other_config'  => ['list', 'edit'], // page de réglages (voir / enregistrer)
        'meliscore_tool_platform_scheme' => ['list', 'edit'], // thème : voir / enregistrer
        'meliscore_logs_tool'          => ['list'], // viewer read-only
    ],
];
