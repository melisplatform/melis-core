<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\TableGateway\TableGateway;

/**
 * @property int $plf_id
 * @property string $plf_name
 * @property bool $plf_update_marketplace
 *
 * Class MelisPlatformTable
 * @package MelisCore\Model\Tables
 */
class MelisPlatformTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_platform';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'plf_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
}
