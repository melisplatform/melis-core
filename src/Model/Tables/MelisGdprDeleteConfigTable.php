<?php
namespace MelisCore\Model\Tables;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use Zend\Db\Sql\Where;
use Zend\Db\TableGateway\TableGateway;

class MelisGdprDeleteConfigTable extends MelisGenericTable
{
    /**
     * MelisGdprDeleteConfigTable constructor.
     * @param TableGateway $tableGateway
     */
	public function __construct(TableGateway $tableGateway)
	{
		parent::__construct($tableGateway);
		$this->idField = 'mgdprc_id';
	}

    /**
     * @param string $search
     * @param array $searchableColumns
     * @param string $orderBy
     * @param string $orderDirection
     * @param int $start
     * @param null $limit
     * @param int $siteId
     * @param null $module
     * @return \Zend\Db\ResultSet\ResultSetInterface
     */
    public function getGdprDeleteConfigData($search = "",$searchableColumns = [], $orderBy = '', $orderDirection = "DESC" , $start = 0 ,$limit = null, $siteId = 0 , $module = null )
    {
        // table selection query
        $select = $this->tableGateway->getSql()->select();
        // columns to select
        $select->columns(array('*'));
        // searchable columns and search string
        if (!empty($searchableColumns) && !empty($search)) {
            // zend where class
            $searchWhere = new Where();
            // nesting searchable columns
            $nest = $searchWhere->nest();
            // concatenating search keys
            foreach ($searchableColumns as $column) {
                $nest->like($column, '%' . $search . '%')->or;
            }
            // set where query
            $select->where($searchWhere);
        }
        // site filter
        if ($siteId) {
            $select->where->equalTo('mgdprc_site_id', $siteId);
        }
        // module filter
        if ($module) {
            $select->where->equalTo('mgdprc_module_name', $module);
        }
        // length of the data
        if (!empty($limit)) {
            $select->limit($limit);
        }
        // starting point of data
        if (!empty($start)) {
            $select->offset($start);
        }
        // order direction and order by
        if (!empty($orderBy) && !empty($orderDirection)) {
            $select->order($orderBy . ' ' . $orderDirection);
        }

        // set current data count for pagination
        $this->setCurrentDataCount((int) $this->tableGateway->selectWith($select)->count());

        return $this->tableGateway->selectWith($select);
    }

}
