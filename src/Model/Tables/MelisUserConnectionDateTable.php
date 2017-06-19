<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Zend\Db\TableGateway\TableGateway;

class MelisUserConnectionDateTable extends MelisGenericTable
{
    public function __construct(TableGateway $tableGateway)
    {
        parent::__construct($tableGateway);
        $this->idField = 'usrcd_id';
    }

     public function getUserConnectionData($userId, $lastLoginDate = null, $search = '', $searchableColumns = [], $orderBy = '', $orderDirection = 'ASC', $start = 0, $limit = null)
     {
         $select = $this->tableGateway->getSql()->select();

         $select->columns(['*']);

         $select->join('melis_core_user', 'melis_core_user.usr_id = melis_core_user_connection_date.usrcd_usr_login', ['usr_firstname' => 'usr_firstname', 'usr_id' => 'usr_id', 'usr_last_login_date' => 'usr_last_login_date'], $select::JOIN_LEFT);

         if(!empty($searchableColumns) && !empty($search)) {
             foreach($searchableColumns as $column) {
                 $select->where->or->nest->like($column, '%'.$search.'%')->unnest;
             }
         }

         $date   = date('Y-m-d H:i:s', strtotime($lastLoginDate));
         $userId = (int) $userId;

         $select->where->equalTo('usrcd_usr_login', $userId);
         if(!is_null($lastLoginDate)) {
             $select->where->and->equalTo('usrcd_last_login_date', $date);
         }

         if(!empty($orderBy)) {
             $select->order($orderBy . ' ' . $orderDirection);
         }

         $getCount = $this->tableGateway->selectWith($select);
         // set current data count for pagination
         $this->setCurrentDataCount((int) $getCount->count());

         if(!empty($limit)) {
             $select->limit($limit);
         }

         if(!empty($start)) {
             $select->offset($start);
         }

//         echo $this->getRawSql($select);

         $resultSet = $this->tableGateway->selectWith($select);

         return $resultSet;
     }

}
