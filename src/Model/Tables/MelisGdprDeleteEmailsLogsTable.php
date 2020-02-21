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

class MelisGdprDeleteEmailsLogsTable extends MelisGenericTable
{
    /**
     * MelisGdprDeleteConfigTable constructor.
     * @param TableGateway $tableGateway
     */
	public function __construct(TableGateway $tableGateway)
	{
		parent::__construct($tableGateway);
		$this->idField = 'mgdprl_id';
	}

    /**
     * @param string $search
     * @param array $searchableColumns
     * @param string $orderBy
     * @param string $orderDirection
     * @param int $start
     * @param null $limit
     * @return \Zend\Db\ResultSet\ResultSetInterface
     */
    public function getGdprDeleteEmailsLogsData($search = "",$searchableColumns = [], $orderBy = '', $orderDirection = "DESC" , $start = 0 ,$limit = null )
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
//        $status = empty($where['status']) ? 1 : $where['status'];
//        $select->where->equalTo('usr_status', $status);
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
