<?php
namespace MelisCore\Model\Tables\Factory;
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use Zend\Hydrator\ObjectProperty;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use Zend\Db\ResultSet\HydratingResultSet;
use Zend\Db\TableGateway\TableGateway;
use MelisCore\Model\MelisGdprDeleteConfig;
use MelisCore\Model\Tables\MelisGdprDeleteConfigTable;

class MelisGdprDeleteConfigTableFactory implements FactoryInterface
{
    /**
     * @param ServiceLocatorInterface $sl
     * @return MelisGdprDeleteConfigTable
     */
    public function createService(ServiceLocatorInterface $sl)
    {
        $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisGdprDeleteConfig());
        $tableGateway = new TableGateway('melis_core_gdpr_delete_config', $sl->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);

        return new MelisGdprDeleteConfigTable($tableGateway);
    }

}