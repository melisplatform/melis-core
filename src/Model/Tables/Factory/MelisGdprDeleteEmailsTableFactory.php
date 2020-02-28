<?php
namespace MelisCore\Model\Tables\Factory;
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCore\Model\MelisGdprDeleteEmails;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsTable;
use Zend\Hydrator\ObjectProperty;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use Zend\Db\ResultSet\HydratingResultSet;
use Zend\Db\TableGateway\TableGateway;

class MelisGdprDeleteEmailsTableFactory implements FactoryInterface
{
    /**
     * @param ServiceLocatorInterface $sl
     * @return MelisGdprDeleteEmailsTable
     */
    public function createService(ServiceLocatorInterface $sl)
    {
        $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisGdprDeleteEmails());
        $tableGateway = new TableGateway('melis_core_gdpr_delete_emails', $sl->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);

        return new MelisGdprDeleteEmailsTable($tableGateway);
    }

}