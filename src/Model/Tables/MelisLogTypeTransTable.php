<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Zend\Db\TableGateway\TableGateway;

class MelisLogTypeTransTable extends MelisGenericTable
{
	public function __construct(TableGateway $tableGateway)
	{ 
		parent::__construct($tableGateway);
		$this->idField = 'logtt_id';
	}
	
	public function getLogTypeTranslations($logTypeId, $langId = null)
	{
	    $select = $this->tableGateway->getSql()->select();
	    
	    $select->where('logtt_type_id = '.$logTypeId);
	    
	    if (!is_null($langId) && is_numeric($langId))
	    {
	        $select->where('logtt_lang_id = '.$langId);
	    }

	    $resultSet = $this->tableGateway->selectWith($select);
	    return $resultSet;
	}
}
