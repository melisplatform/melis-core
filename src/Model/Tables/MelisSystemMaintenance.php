<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use MelisCore\Model\Tables\MelisGenericTable;
use Laminas\Db\Sql\Expression;
use Laminas\Db\Sql\Predicate\Like;
use Laminas\Db\Sql\Predicate\PredicateSet;
use Laminas\Db\TableGateway\TableGateway;

class MelisSystemMaintenance extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_cms_site';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'site_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }

    public function getList($start = null, $limit = null, $searchKeys = [], $searchValue = null, $orderKey = null, $order = 'ASC', $langId = 1, $count = false)
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

        if ($orderKey == $this->idField)
            $orderKey = 'DT_RowId';

        if (!is_null($orderKey) && !$count)
            $select->order($orderKey.' '.$order);

        if (!is_null($start))
            $select->offset((int) $start);

        if (!is_null($limit))
            $select->limit((int) $limit);

        if (!$count) 
        $select->group('DT_RowId');

        $resultSet = $this->getTableGateway()->selectWith($select);

        return $resultSet;
    }


}
