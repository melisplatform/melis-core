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
     * @param null $siteId
     * @param null $moduleName
     * @return \Zend\Db\ResultSet\ResultSetInterface
     */
    public function getGdprDeleteEmailsLogsData($search = "",$searchableColumns = [], $orderBy = '', $orderDirection = "DESC" , $start = 0 ,$limit = null, $siteId = null, $moduleName = null)
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
        // filter by site id
        if (!is_null($siteId)) {
            $select->where->equalTo('mgdprl_site_id', $siteId);
        }
        // module filter
        if (!is_null($moduleName)) {
            $select->where->equalTo('mgdprl_module_name', $moduleName);
        }

        // set current data count for pagination
        $this->setCurrentDataCount((int) $this->tableGateway->selectWith($select)->count());

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

        return $this->tableGateway->selectWith($select);
    }

    public function getGdprDeleteEmailsLogs($siteId, $module, $date)
    {
        // table selection query
        $select = $this->tableGateway->getSql()->select();
        // columns to select
        $select->columns(array('*'));
        // site filter
        if ($siteId) {
            $select->where->equalTo('mgdprl_site_id', $siteId);
        }
        // module filter
        if ($module) {
            $select->where->equalTo('mgdprl_module_name', $module);
        }

        return $this->tableGateway->selectWith($select);
    }
    /**
     * get warning/deleted email logs by siteId and module name
     * @param $siteId
     * @param $moduleName
     * @return \Zend\Db\ResultSet\ResultSetInterface
     */
    public function getWarningDeletedEmailBySiteIdModuleName($siteId, $moduleName)
    {
        // table selection query
        $select = $this->tableGateway->getSql()->select();
        // columns to select
        $select->columns(array('*'));
        // site filter
        if ($siteId) {
            $select->where->equalTo('mgdprl_site_id', $siteId);
        }
        // module filter
        if ($moduleName) {
            $select->where->equalTo('mgdprl_module_name', $moduleName);
        }

        return $this->tableGateway->selectWith($select);
    }

    /**
     * @param $date
     * @return \Zend\Db\ResultSet\ResultSetInterface
     */
    public function getEmailsLogsByDate($date, $siteId, $module)
    {
        // table selection query
        $select = $this->tableGateway->getSql()->select();
        // columns to select
        $select->columns(array('*'));
        // site filter
        if ($date) {
            $select->where->equalTo('mgdprl_log_date',$date);
        }
        // site filter
        if ($siteId) {
            $select->where->equalTo('mgdprl_site_id', $siteId);
        }
        // module filter
        if ($module) {
            $select->where->equalTo('mgdprl_module_name', $module);
        }

        return $this->tableGateway->selectWith($select);
    }

}
