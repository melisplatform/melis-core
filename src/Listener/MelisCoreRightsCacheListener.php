<?php

namespace MelisCore\Listener;

use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisGeneralListener;

/**
 * (Re)génération du cache de droits par utilisateur (colonne `usr_rights_cache`) à la SAUVEGARDE,
 * et propagation IMMÉDIATE des droits d'un rôle à tous ses utilisateurs.
 *
 * C'est le point de génération unique du cache lu ensuite partout par
 * MelisCoreRights::canAccess()/getResolvedRights() (menu, denyUnlessAccess, /me).
 *
 * - Users (ancien BO, ToolUserController) : `meliscore_tooluser_save_end` / `_savenew_end`
 *   (param `itemId` = userId) → régénère SON cache.
 * - Rôles (MelisSmallBusiness, ToolUserRoleController) : `melissb_userrole_update_end` /
 *   `_new_end` (param `itemId` = roleId) → recopie `urole_rights` sur tous les membres + régénère
 *   leurs caches (les changements de rôle prennent effet sans re-sauver chaque utilisateur).
 *
 * (Le save React des users appelle regenerateUserCache() directement dans MelisReactApiUserController
 *  — il n'émet pas d'event, d'où le hook inline plutôt qu'ici.)
 */
class MelisCoreRightsCacheListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        // Sauvegarde d'un utilisateur (ancien BO) → régénère SON cache.
        $this->attachEventListener(
            $events,
            'MelisCore',
            ['meliscore_tooluser_save_end', 'meliscore_tooluser_savenew_end'],
            function ($e) {
                $userId = (int) $e->getParam('itemId');
                if ($userId <= 0) {
                    return;
                }
                try {
                    $e->getTarget()->getServiceManager()->get('MelisCoreRights')->regenerateUserCache($userId, null);
                } catch (\Throwable) {
                }
            },
            $priority
        );

        // Sauvegarde d'un rôle → propage aux utilisateurs du rôle + régénère leurs caches.
        $this->attachEventListener(
            $events,
            'MelisSmallBusiness',
            ['melissb_userrole_update_end', 'melissb_userrole_new_end'],
            function ($e) {
                $roleId = (int) $e->getParam('itemId');
                if ($roleId <= 0) {
                    return;
                }
                try {
                    $e->getTarget()->getServiceManager()->get('MelisCoreRights')->propagateRoleToUsers($roleId, null);
                } catch (\Throwable) {
                }
            },
            $priority
        );
    }
}
