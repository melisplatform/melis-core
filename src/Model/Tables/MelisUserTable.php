<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Zend\Db\TableGateway\TableGateway;

class MelisUserTable extends MelisGenericTable
{
	public function __construct(TableGateway $tableGateway)
	{
		parent::__construct($tableGateway);
		$this->idField = 'usr_id';
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
}
