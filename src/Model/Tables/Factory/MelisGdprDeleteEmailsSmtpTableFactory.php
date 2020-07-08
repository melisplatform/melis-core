<?php
namespace MelisCore\Model\Tables\Factory;
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCore\Model\MelisGdprDeleteEmailsSmtp;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsSmtpTable;
use Zend\Hydrator\ObjectProperty;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use Zend\Db\ResultSet\HydratingResultSet;
use Zend\Db\TableGateway\TableGateway;

class MelisGdprDeleteEmailsSmtpTableFactory implements FactoryInterface
{
    /**
     * @param ServiceLocatorInterface $sl
     * @return MelisGdprDeleteEmailsSmtpTable
     */
    public function createService(ServiceLocatorInterface $sl)
    {
        $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisGdprDeleteEmailsSmtp());
        $tableGateway = new TableGateway('melis_core_gdpr_delete_emails_smtp', $sl->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);

        return new MelisGdprDeleteEmailsSmtpTable($tableGateway);
    }

}