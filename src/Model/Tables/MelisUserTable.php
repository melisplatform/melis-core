<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\Sql\Where;
use Laminas\Db\TableGateway\TableGateway;

class MelisUserTable extends MelisGenericTable
{
	public function __construct(TableGateway $tableGateway)
	{
		parent::__construct($tableGateway);
		$this->idField = 'usr_id';
	}
	
	public function getUserOrderByName()
	{
	    $select = $this->tableGateway->getSql()->select();
	    
	    $select->order(array('usr_firstname' => 'asc', 'usr_lastname' => 'asc'));
	    
	    $resultSet = $this->tableGateway->selectWith($select);
	    
	    return $resultSet;
	}

	public function getLastLoggedInUsers($max = 5)
	{
		$select = $this->tableGateway->getSql()->select();
		
		$select->where->isNotNull('usr_last_login_date');
		$select->columns(array('*'));
		$select->order('usr_last_login_date DESC');
		$select->limit($max);
	
		$resultSet = $this->tableGateway->selectWith($select);
	
		return $resultSet;
	}
	

	public function getDataByLoginAndEmail($login, $email)
	{
	    $select = $this->tableGateway->getSql()->select();
	
	    $select->where(array('usr_login' => $login))
	    ->where(array('usr_email' => $email)
	        );
	    $resultSet = $this->tableGateway->selectWith($select);
	
	    return $resultSet;
	}

	public function getUsersByRole($roleId = 0)
	{ 
		$select = $this->tableGateway->getSql()->select();

		if ($roleId != 0)
			$select->where(array('usr_role_id' => $roleId));

		$resultSet = $this->tableGateway->selectWith($select);

		return $resultSet;
	}

    /**
     * Retrieves Users based from the
     * Where condition provided
     * @param array $where
     */
    public function getUsers(array $where = [
        'getColumns' => ['*'],
        'search' => null,
        'searchableColumns' => [],
        'orderBy' => null,
        'orderDirection' => null,
        'start' => null,
        'limit' => null,
        'siteId' => null,
        'status' => 1,
    ])
    {

        $select = $this->tableGateway->getSql()->select();
        $select->columns($where['getColumns']);

        if (!empty($where['searchableColumns']) && !empty($where['search'])) {
            $searchWhere = new Where();
            $nest = $searchWhere->nest();

            foreach ($where['searchableColumns'] as $column) {
                $nest->like($column, '%' . $where['search'] . '%')->or;
            }
            $select->where($searchWhere);
        }


        $status = empty($where['status']) ? 1 : $where['status'];
        $select->where->equalTo('usr_status', $status);
        /**
         * Get "unfiltered" data (no offset and limit applied yet)
         */
        $unfilteredData = $this->tableGateway->selectWith($select);

        if (!empty($where['limit'])) {
            $select->limit($where['limit']);
        }

        if (!empty($where['start'])) {
            $select->offset($where['start']);
        }

        if (!empty($where['orderBy']) && !empty($where['orderDirection'])) {
            $select->order($where['orderBy'] . ' ' . $where['orderDirection']);
        }
        $resultSet = $this->tableGateway->selectWith($select);

        $resultSet->getObjectPrototype()->setUnfilteredDataCount($unfilteredData->count());
        $resultSet->getObjectPrototype()->setFilteredDataCount($resultSet->count());

        return $resultSet;
    }
}
