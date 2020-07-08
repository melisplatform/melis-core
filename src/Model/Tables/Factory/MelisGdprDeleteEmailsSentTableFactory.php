<?php
namespace MelisCore\Model\Tables\Factory;
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCore\Model\MelisGdprDeleteEmailsSent;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsSentTable;
use Zend\Hydrator\ObjectProperty;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use Zend\Db\ResultSet\HydratingResultSet;
use Zend\Db\TableGateway\TableGateway;

class MelisGdprDeleteEmailsSentTableFactory implements FactoryInterface
{
    /**
     * @param ServiceLocatorInterface $sl
     * @return MelisGdprDeleteEmailsSentTable
     */
    public function createService(ServiceLocatorInterface $sl)
    {
        $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisGdprDeleteEmailsSent());
        $tableGateway = new TableGateway('melis_core_gdpr_delete_emails_sent', $sl->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);

        return new MelisGdprDeleteEmailsSentTable($tableGateway);
    }

}