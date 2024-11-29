<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;


use Laminas\Db\Sql\Expression;
use Laminas\Db\Sql\Predicate\Like;
use Laminas\Db\Sql\Predicate\PredicateSet;

class MelisAnnouncementTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_announcement';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'mca_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }

    /**
     * @param null $status
     * @param string $searchValue
     * @param array $searchKeys
     * @param null $start
     * @param null $limit
     * @param string $orderColumn
     * @param string $order
     * @param bool $count
     * @return \Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getLists($status = null, $searchValue = '', $searchKeys = [], $start = null, $limit = null, $orderColumn = 'mca_id', $order = 'DESC', $count = false)
    {
        $select = $this->getTableGateway()->getSql()->select();

        $slct = ['*', new Expression($this->getTableGateway()->getTable() . '.' . $this->idField.' As DT_RowId')];
        if ($count) {
            $slct = [new Expression('COUNT(' . $this->getTableGateway()->getTable() . '.' . $this->idField . ') As totalRecords')];
        }
        $select->columns($slct);

        if (!empty($searchValue)){
            $search = [];
            foreach ($searchKeys As $col)
                $search[$col] = new Like($col, '%'.$searchValue.'%');

            $filters = [new PredicateSet($search, PredicateSet::COMBINED_BY_OR)];
            $select->where($filters);
        }

        if(!is_null($status) && $status != '')
            $select->where->equalTo('mca_status', $status);

        if (!empty($start))
        {
            $select->offset($start);
        }

        if (!empty($limit) && $limit != -1)
        {
            $select->limit((int) $limit);
        }

        if(!empty($orderColumn))
            $select->order($orderColumn .' '. $order);

        $resultData = $this->getTableGateway()->selectWith($select);
        return $resultData;
    }
}