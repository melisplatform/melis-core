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
    /**
     * Model table
     */
    const TABLE = 'melis_core_log_type';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'logt_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
	
	public function getLogTypeOrderByCode()
	{
	    $select = $this->tableGateway->getSql()->select();
	     
	    $select->order(array('logt_code' => 'asc'));
	     
	    $resultSet = $this->tableGateway->selectWith($select);
	     
	    return $resultSet;
	}
}
