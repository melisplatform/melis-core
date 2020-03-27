<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\TableGateway\TableGateway;

class MelisLostPasswordTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_lost_password';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'rh_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
}
