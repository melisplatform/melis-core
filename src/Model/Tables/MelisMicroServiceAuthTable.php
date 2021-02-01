<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\TableGateway\TableGateway;

class MelisMicroServiceAuthTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_microservice_auth';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'msoa_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }

    public function getUserByApiKey($apiKey)
    {
        $select = $this->tableGateway->getSql()->select();

        $select->join('melis_core_user', 'melis_core_user.usr_id = melis_core_microservice_auth.msoa_user_id', array('*'), $select::JOIN_LEFT);


        $select->where->equalTo('melis_core_microservice_auth.msoa_api_key', $apiKey);

        $resultSet = $this->tableGateway->selectWith($select);

        return $resultSet;
    }

    public function getUser($userId)
    {
        $select = $this->tableGateway->getSql()->select();

        $select->join('melis_core_user', 'melis_core_user.usr_id = melis_core_microservice_auth.msoa_user_id', array('*'), $select::JOIN_LEFT);

        $select->where->equalTo('melis_core_microservice_auth.msoa_user_id', (int) $userId);

        $resultSet = $this->tableGateway->selectWith($select);

        return $resultSet;
    }
}
