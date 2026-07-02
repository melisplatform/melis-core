<?php

namespace MelisCore\Listener;

use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;
use Laminas\Session\Container;
use MelisCore\Listener\MelisGeneralListener;
use MelisReactApi\Service\Capabilities;

/**
 * Préservation des capacités d'outils (droits avancés React) quand l'ANCIEN BO sauvegarde un user.
 *
 * Le legacy ToolUserController RECONSTRUIT entièrement `usr_rights` à partir des fragments que les
 * listeners poussent dans le container `action-tool-user-setrights-tmp` (event
 * `meliscore_tooluser_save_start`). Il ne connaît PAS la section `<meliscore_tool_capabilities>`
 * → sans nous, il la TRASHERAIT. Ce listener relit l'usr_rights ACTUEL en base (à `save_start`,
 * la sauvegarde n'a pas encore eu lieu) et ré-injecte la section telle quelle. L'ancien BO la
 * transporte ainsi sans la lire ni l'éditer → compat parfaite pendant la période parallèle.
 *
 * (Le save React, lui, écrit `usr_rights` directement avec la section depuis l'éditeur de droits ;
 *  il ne passe pas par ce container — aucun conflit.) Cf. MelisReactApi\Service\Capabilities.
 */
class MelisReactApiCapabilityPreserveUserListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
            'MelisCore',
            'meliscore_tooluser_save_start',
            function ($event) {
                $sm = $event->getTarget()->getEvent()->getApplication()->getServiceManager();

                $postUser = $sm->get('request')->getPost();
                $userId   = !empty($postUser['usr_id']) ? (int) $postUser['usr_id'] : null;
                if (!$userId) {
                    return; // création : aucun droit existant à préserver
                }

                try {
                    $db   = $sm->get('Laminas\Db\Adapter\AdapterInterface');
                    $rows = iterator_to_array($db->query('SELECT usr_rights FROM melis_core_user WHERE usr_id = ?', [$userId]));
                    $fragment = Capabilities::extractSection((string) ($rows[0]['usr_rights'] ?? ''));
                } catch (\Throwable) {
                    return;
                }
                if ($fragment === '') {
                    return; // pas de capacités sur ce user → rien à faire
                }

                $container = new Container('meliscore');
                if (empty($container['action-tool-user-setrights-tmp'])) {
                    $container['action-tool-user-setrights-tmp'] = [];
                }
                $container['action-tool-user-setrights-tmp'] = array_merge(
                    $container['action-tool-user-setrights-tmp'],
                    [$fragment]
                );
            },
            $priority
        );
    }
}
