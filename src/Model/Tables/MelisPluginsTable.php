<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2019 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Zend\Db\Sql\Expression;
use Zend\Db\TableGateway\TableGateway;

class MelisPluginsTable extends MelisGenericTable
{
	public function __construct(TableGateway $tableGateway)
	{
		parent::__construct($tableGateway);
		$this->idField = 'plugin_id';
	}

    /**
     * Get the latest plugin installed
     * @param $pluginType   ( dashboard || templating )
     * @return \Zend\Db\ResultSet\ResultSetInterface
     */
	public function getLatestPlugin($pluginType)
    {
        $select = $this->tableGateway->getSql()->select();
        $select->columns(['plugin_id','plugin_name','plugin_module','latest_plugin_datetime' => new Expression('max(`plugin_date_installed`)')]);
        $select->where->equalTo('plugin_type',$pluginType);
        $select->group('plugin_name');
        $select->limit(1);
        $resultSet = $this->tableGateway->selectWith($select);

        return $resultSet;
    }

}
