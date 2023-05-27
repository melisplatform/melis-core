<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use MelisCore\Service\MelisGeneralService;

class MelisUpdatePasswordHistoryService extends MelisGeneralService
{
    /**
     * Saves a user's password to the password history.
     *
     * @param int $userId The ID of the user.
     * @param string $password The password to be saved.
     */
    public function saveItem($userId, $password)
    {
        $passwordHistoryTable = $this->getServiceManager()->get('MelisUserPasswordHistoryTable');

        $passwordHistoryTable->getTableGateway()->insert([
            'uph_user_id' => $userId,
            'uph_password' => $password,
            'uph_password_updated_date' => date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Retrieves the last password updated date for a user.
     *
     * @param int $userId The ID of the user.
     * @return array Returns an array containing the last password updated date.
     */
    public function getLastPasswordUpdatedDate($userId)
    {
        $passwordHistoryTable = $this->getServiceManager()->get('MelisUserPasswordHistoryTable');

        return $passwordHistoryTable->getLastPasswordUpdatedDate($userId)->toArray();
    }

    /**
     * Retrieves the password history for a user.
     *
     * @param int $userId The ID of the user.
     * @param int $duplicateLifetime The duplicate password lifetime (in days).
     * @return array Returns an array containing the user's password history.
     */
    public function getUserPasswordHistory($userId, $duplicateLifetime)
    {
        $passwordHistoryTable = $this->getServiceManager()->get('MelisUserPasswordHistoryTable');

        return $passwordHistoryTable->getUserPasswordHistory($userId, $duplicateLifetime)->toArray();
    }
}