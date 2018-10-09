<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Zend\Db\TableGateway\TableGateway;

class MelisDashboardsTable extends MelisGenericTable
{
    public function __construct(TableGateway $tableGateway)
    { 
        parent::__construct($tableGateway);
        $this->idField = 'd_id';
    }
    
    public function getDashboardPlugins($dashboardId, $userId)
    {
        $select = $this->tableGateway->getSql()->select();
        
        $select->where('d_dashboard_id  ="'. $dashboardId .'"');
        $select->where('d_user_id  ='. $userId);
        
        $resultSet = $this->tableGateway->selectWith($select);
        return $resultSet;
    }
}