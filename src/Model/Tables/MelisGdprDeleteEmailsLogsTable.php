<?php
namespace MelisCore\Model\Tables;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use Laminas\Db\Sql\Where;

class MelisGdprDeleteEmailsLogsTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_gdpr_delete_emails_logs';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'mgdprl_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
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
     * @return \Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getGdprDeleteEmailsLogsData($search = "",$searchableColumns = [], $orderBy = '', $orderDirection = "DESC" , $start = 0 ,$limit = null, $siteId = null, $moduleName = null)
    {
        $select = $this->getTableGateway()->getSql()->select();
        $select->columns(array('*'));
        if (!empty($searchableColumns) && !empty($search)) {
            $searchWhere = new Where();
            $nest = $searchWhere->nest();
            foreach ($searchableColumns as $column) {
                $nest->like($column, '%' . $search . '%')->or;
            }
            $select->where($searchWhere);
        }
        if (!is_null($siteId)) {
            $select->where->equalTo('mgdprl_site_id', $siteId);
        }
        if (!is_null($moduleName)) {
            $select->where->equalTo('mgdprl_module_name', $moduleName);
        }

        $this->setCurrentDataCount((int) $this->getTableGateway()->selectWith($select)->count());

        if (!empty($limit)) {
            $select->limit($limit);
        }
        if (!empty($start)) {
            $select->offset($start);
        }
        // order direction and order by
        if (!empty($orderBy) && !empty($orderDirection)) {
            MelisGenericTable::addSafeOrder($select, $orderBy, $orderDirection);
        }

        return $this->getTableGateway()->selectWith($select);
    }

    public function getGdprDeleteEmailsLogs($siteId, $module, $date = null)
    {
        $select = $this->getTableGateway()->getSql()->select();
        $select->columns(array('*'));
        if ($siteId) {
            $select->where->equalTo('mgdprl_site_id', $siteId);
        }
        if ($module) {
            $select->where->equalTo('mgdprl_module_name', $module);
        }

        return $this->getTableGateway()->selectWith($select);
    }
    /**
     * get warning/deleted email logs by siteId and module name
     * @param $siteId
     * @param $moduleName
     * @return \Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getWarningDeletedEmailBySiteIdModuleName($siteId, $moduleName)
    {
        $select = $this->getTableGateway()->getSql()->select();
        $select->columns(array('*'));
        if ($siteId) {
            $select->where->equalTo('mgdprl_site_id', $siteId);
        }
        if ($moduleName) {
            $select->where->equalTo('mgdprl_module_name', $moduleName);
        }

        return $this->getTableGateway()->selectWith($select);
    }

    /**
     * @param $date
     * @return \Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getEmailsLogsByDate($date, $siteId, $module)
    {
        $select = $this->getTableGateway()->getSql()->select();
        $select->columns(array('*'));
        if ($date) {
            $select->where->equalTo('mgdprl_log_date',$date);
        }
        if ($siteId) {
            $select->where->equalTo('mgdprl_site_id', $siteId);
        }
        if ($module) {
            $select->where->equalTo('mgdprl_module_name', $module);
        }

        return $this->getTableGateway()->selectWith($select);
    }
}
