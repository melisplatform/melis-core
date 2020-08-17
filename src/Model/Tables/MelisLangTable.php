<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

class MelisLangTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_lang';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'lang_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }

	public function getLanguageInOrdered()
	{
	    $select = $this->tableGateway->getSql()->select();
	    
	    $select->order(array('lang_name' => "asc"));
	     
	    $resultSet = $this->tableGateway->selectWith($select);
	    return $resultSet;
	}
}
