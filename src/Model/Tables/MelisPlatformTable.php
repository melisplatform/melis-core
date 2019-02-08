<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Zend\Db\TableGateway\TableGateway;

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
     * @string model property
     */
    const ID = 'plf_id';

    /**
     * @string model property
     */
    const NAME = 'plf_name';

    /**
     * @string model property
     */
    const CAN_UPDATE_MARKETPLACE = 'plf_update_marketplace';

    public function __construct(TableGateway $tableGateway)
    {
        parent::__construct($tableGateway);
        $this->idField = 'plf_id';
    }
}
