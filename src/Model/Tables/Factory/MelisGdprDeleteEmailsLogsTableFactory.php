<?php
namespace MelisCore\Model\Tables\Factory;
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCore\Model\MelisGdprDeleteEmailsLogs;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsLogsTable;
use Zend\Hydrator\ObjectProperty;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use Zend\Db\ResultSet\HydratingResultSet;
use Zend\Db\TableGateway\TableGateway;

class MelisGdprDeleteEmailsLogsTableFactory implements FactoryInterface
{
    /**
     * @param ServiceLocatorInterface $sl
     * @return MelisGdprDeleteEmailsLogsTable
     */
    public function createService(ServiceLocatorInterface $sl)
    {
        $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisGdprDeleteEmailsLogs());
        $tableGateway = new TableGateway('melis_core_gdpr_delete_emails_logs', $sl->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);

        return new MelisGdprDeleteEmailsLogsTable($tableGateway);
    }

}