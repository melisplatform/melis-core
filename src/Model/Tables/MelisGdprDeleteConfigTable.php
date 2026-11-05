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
        if ($siteId) {
            $select->where->equalTo('mgdprc_site_id', $siteId);
        }
        if ($module) {
            $select->where->equalTo('mgdprc_module_name', $module);
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

    /**
     * get delete configuration by siteId and module name
     * @param $siteId
     * @param $moduleName
     * @return \Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getDeleteConfigBySiteIdModuleName($siteId, $moduleName)
    {
        $select = $this->getTableGateway()->getSql()->select();
        $select->columns(array('*'));
        if ($siteId) {
            $select->where->equalTo('mgdprc_site_id', $siteId);
        }
        if ($moduleName) {
            $select->where->equalTo('mgdprc_module_name', $moduleName);
        }

        return $this->getTableGateway()->selectWith($select);
    }

}
