<?php
namespace MelisCore\Model\Tables;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use Laminas\Db\Sql\Where;

class MelisGdprDeleteConfigTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_gdpr_delete_config';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'mgdprc_id';

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
     * @param int $siteId
     * @param null $module
     * @return \Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getGdprDeleteConfigData($search = "",$searchableColumns = [], $orderBy = '', $orderDirection = "DESC" , $start = 0 ,$limit = null, $siteId = 0 , $module = null )
    {
        // table selection query
        $select = $this->getTableGateway()->getSql()->select();
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
        // set current data count for pagination
        $this->setCurrentDataCount((int) $this->getTableGateway()->selectWith($select)->count());
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

        return $this->getTableGateway()->selectWith($select);
    }

    /**
     * get delete configuration by siteId and module name
     * @param $siteId
     * @param $moduleName
     * @return \Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getDeleteConfigBySiteIdModuleName($siteId, $moduleName)
    {
        // table selection query
        $select = $this->getTableGateway()->getSql()->select();
        // columns to select
        $select->columns(array('*'));
        if ($siteId) {
            $select->where->equalTo('mgdprc_site_id', $siteId);
        }
        // module filter
        if ($moduleName) {
            $select->where->equalTo('mgdprc_module_name', $moduleName);
        }

        return $this->getTableGateway()->selectWith($select);
    }

}
