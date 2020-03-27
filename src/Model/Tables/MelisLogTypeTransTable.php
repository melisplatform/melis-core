<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\TableGateway\TableGateway;

class MelisLogTypeTransTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_log_type_trans';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'logtt_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
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
