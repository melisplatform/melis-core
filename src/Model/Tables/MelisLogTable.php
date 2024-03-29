<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\TableGateway\TableGateway;

class MelisLogTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_log';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'log_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
	
	public function getLogList($typeId = null, $itemId = null, $userId = null, $dateCreationMin = null, $dateCreationMax = null, 
                                    $start = 0, $limit = null, $order = null, $search = null, $status = null)
	{
	    $select = $this->tableGateway->getSql()->select();
	    
	    $select->quantifier('DISTINCT');
	    $select->join('melis_core_log_type', 'melis_core_log_type.logt_id=melis_core_log.log_type_id',
	        array(),$select::JOIN_LEFT);
	    $select->join('melis_core_log_type_trans', 'melis_core_log_type_trans.logtt_type_id=melis_core_log_type.logt_id',
	        array(),$select::JOIN_LEFT);
	    
	    if (!is_null($typeId) && is_numeric($typeId) && $typeId != -1)
	    {
	        $select->where('melis_core_log_type.logt_id ='.$typeId);
	    }
	    
	    if (!is_null($itemId))
	    {
	        $select->where('melis_core_log.log_item_id ='.$itemId);
	    }

	    if (!is_null($status))
	    {
	        $select->where('melis_core_log.log_status ='.$status);
	    }
	    
	    if (!is_null($userId) && is_numeric($userId) && $userId != -1)
	    {
	        $select->where('melis_core_log.log_user_id ='.$userId);
	    }
	    
	    if (!is_null($dateCreationMin)) {
	    	$select->where(new \Laminas\Db\Sql\Predicate\Expression('DATE(melis_core_log.log_date_added) >= ?', $dateCreationMin));	  
        }
        
        if (!is_null($dateCreationMax)) {
        	$select->where(new \Laminas\Db\Sql\Predicate\Expression('DATE(melis_core_log.log_date_added) <= ?', $dateCreationMax));  
        }

	    
	    if(!is_null($search))
	    {
	        $search = '%'.$search.'%';
	        $select->where->NEST->like('log_id', $search)
	        ->or->like('melis_core_log_type.logt_code', $search)
	        ->or->like('melis_core_log_type_trans.logtt_name', $search)
	        ->or->like('melis_core_log_type_trans.logtt_description', $search);
	    }
	    
	    if (!is_null($start) && is_numeric($start))
	    {
	        $select->offset((int)$start);
	    }
	    
	    if (!is_null($limit) && is_numeric($limit) && $limit != -1){
	        $select->limit((int)$limit);
	    }
	    
	    $select->order(array('log_id' => $order));
	    
	    $resultSet = $this->tableGateway->selectWith($select);
	    return $resultSet;
	}

	public function getFailedLoginAttempts($logTypeId, $userId, $date)
	{
		$select = $this->getTableGateway()->getSql()->select();
		
		if (!empty($logTypeId) && !empty($userId) && !empty($date)) {
			$select->columns(['count' => new \Laminas\Db\Sql\Expression('COUNT(*)')])
				   ->where('log_type_id = ' . $logTypeId)
				   ->where('log_user_id = ' . $userId)
				   ->where('log_date_added >= "' . $date . '"');
		}
		
		$resultSet = $this->getTableGateway()->selectWith($select);
		
		if (!is_null($resultSet)) {
			return $resultSet->toArray()[0]['count'];
		}
	}

	public function getDateAccountWasLocked($logTypeId, $userId)
	{
		$select = $this->getTableGateway()->getSql()->select();
		
		if (!empty($logTypeId) && !empty($userId)) {
			$select->columns(['log_date_added'])
				   ->where('log_type_id = ' . $logTypeId)
				   ->where('log_user_id = ' . $userId)
				   ->order('log_id DESC')
				   ->limit(1);		
		}
		
		$resultSet = $this->getTableGateway()->selectWith($select);
		
		if (!empty($resultSet->toArray())) {
			return $resultSet->toArray()[0]['log_date_added'];
		}

		return null;
	}

	public function getDateAccountWasUnlocked($logTypeId, $userId)
	{
		$select = $this->getTableGateway()->getSql()->select();
		
		if (!empty($logTypeId) && !empty($userId)) {
			$select->columns(['log_date_added'])
				   ->where('log_type_id = ' . $logTypeId)
				   ->where('log_user_id = ' . $userId)
				   ->order('log_id DESC')
				   ->limit(1);		
		}
		
		$resultSet = $this->getTableGateway()->selectWith($select);
		
		if (!empty($resultSet->toArray())) {
			return $resultSet->toArray()[0]['log_date_added'];
		}

		return null;
	}
}
