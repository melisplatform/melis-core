<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\TableGateway\TableGateway;

class MelisDashboardsTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_dashboards';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'd_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
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