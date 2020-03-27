<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2019 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\Sql\Expression;
use Laminas\Db\TableGateway\TableGateway;

class MelisPluginsTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_plugins';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'plugin_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }

    /**
     * Get the latest plugin installed
     * @param $pluginType   ( dashboard || templating )
     * @return \Laminas\Db\ResultSet\ResultSetInterface
     */
	public function getLatestPlugin($pluginType)
    {
        $select = $this->tableGateway->getSql()->select();

        $select->columns(['latest_plugin_datetime' => new Expression('max(`plugin_date_installed`)')]);
        $select->where->equalTo('plugin_type',$pluginType);

        return $this->tableGateway->selectWith($select);
    }
}
