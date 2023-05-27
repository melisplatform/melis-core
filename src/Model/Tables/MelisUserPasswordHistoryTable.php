<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\ResultSet\HydratingResultSet;
use Laminas\Db\Sql\Where;
use Laminas\Db\TableGateway\TableGateway;
use Laminas\Hydrator\ObjectPropertyHydrator;
use MelisCore\Model\Hydrator\MelisUser;

class MelisUserPasswordHistoryTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_user_password_history';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'uph_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }

    /**
     * Retrieves the last password updated date for a given user.
     *
     * @param int $userId The ID of the user.
     * @return HydratingResultSet The result set containing the last password updated date.
     */
    public function getLastPasswordUpdatedDate($userId)
	{
        $select = $this->tableGateway->getSql()->select();
        $select->columns(['uph_password_updated_date']);
        $select->where(['uph_user_id' => $userId]);
        $select->order('uph_password_updated_date DESC');
        $select->limit(1);
        
        $resultSet = $this->tableGateway->selectWith($select);
        
        return $resultSet;
	}

    /**
     * Retrieves the password history for a user within a specified duplicate lifetime.
     *
     * @param int $userId The ID of the user.
     * @param int $duplicateLifetime The duplicate password lifetime (in days).
     * @return HydratingResultSet The result set containing the user password history.
     */
    public function getUserPasswordHistory($userId, $duplicateLifetime)
    {
        $select = $this->tableGateway->getSql()->select();
        $select->columns(['uph_password_updated_date', 'uph_password']);
        
        $select->where([
            'uph_user_id' => $userId, 
            'uph_password_updated_date >= DATE_SUB(NOW(), INTERVAL ' . $duplicateLifetime . ' DAY)'
        ]);

        $select->order('uph_password_updated_date DESC');
        
        $resultSet = $this->tableGateway->selectWith($select);
        
        return $resultSet;
    }
}
