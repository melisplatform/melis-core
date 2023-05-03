<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use MelisCore\Service\MelisGeneralService;
use MelisCommerce\Service\MelisComGeneralService;

class MelisUpdatePasswordHistoryService extends MelisComGeneralService
{
    public function saveItem($userId, $password)
    {
        $passwordHistoryTable = $this->getServiceManager()->get('MelisUserPasswordHistoryTable');

        $passwordHistoryTable->getTableGateway()->insert([
            'uph_user_id' => $userId,
            'uph_password' => $password,
            'uph_password_updated_date' => date('Y-m-d H:i:s')
        ]);
    }

    public function getLastPasswordUpdatedDate($userId)
    {
        $passwordHistoryTable = $this->getServiceManager()->get('MelisUserPasswordHistoryTable');

        return $passwordHistoryTable->getLastPasswordUpdatedDate($userId)->toArray();
    }
}