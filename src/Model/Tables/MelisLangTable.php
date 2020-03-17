<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\TableGateway\TableGateway;

class MelisLangTable extends MelisGenericTable
{
	public function __construct(TableGateway $tableGateway)
	{ 
		parent::__construct($tableGateway);
		$this->idField = 'lang_id';
	}
	
	public function getLanguageInOrdered()
	{
	    $select = $this->tableGateway->getSql()->select();
	    
	    $select->order(array('lang_name' => "asc"));
	     
	    $resultSet = $this->tableGateway->selectWith($select);
	    return $resultSet;
	}
}
