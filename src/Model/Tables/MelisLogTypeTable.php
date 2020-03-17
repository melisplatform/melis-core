<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\TableGateway\TableGateway;

class MelisLogTypeTable extends MelisGenericTable
{
	public function __construct(TableGateway $tableGateway)
	{ 
		parent::__construct($tableGateway);
		$this->idField = 'logt_id';
	}
	
	public function getLogTypeOrderByCode()
	{
	    $select = $this->tableGateway->getSql()->select();
	     
	    $select->order(array('logt_code' => 'asc'));
	     
	    $resultSet = $this->tableGateway->selectWith($select);
	     
	    return $resultSet;
	}
}
