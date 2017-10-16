<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Zend\Db\TableGateway\TableGateway;

class MelisMicroServiceAuthTable extends MelisGenericTable
{
    public function __construct(TableGateway $tableGateway)
    {
        parent::__construct($tableGateway);
        $this->idField = 'msoa_id';
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
