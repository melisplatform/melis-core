<?php
namespace MelisCore;
use PHPUnit_Framework_TestCase;
use Zend\ServiceManager\ServiceManager;
use Zend\Mvc\Service\ServiceManagerConfig;
use Zend\Db\ResultSet\HydratingResultSet;
use Zend\Db\TableGateway\TableGateway;
use Zend\Stdlib\Hydrator\ObjectProperty;
use Zend\Db\Adapter\Adapter;
class ServiceManagerGrabber extends PHPUnit_Framework_TestCase
{
    protected static $serviceConfig = null;

    public static function setServiceConfig()
    {
        $config = include '../../../test/test.application.config.php';
        static::$serviceConfig = $config;
    }

    public static function getServiceConfig()
    {
        return static::$serviceConfig;
    }

    public function getServiceManager()
    {
        $configuration = static::$serviceConfig ? : include '../../../../test/test.application.config.php';
        $smConfig = isset($configuration['service_manager']) ? $configuration['service_manager'] : array();
        $serviceManager = new ServiceManager(new ServiceManagerConfig($smConfig));
        $serviceManager->setService('ApplicationConfig', $configuration);
        $serviceManager->get('ModuleManager')->loadModules();
        return $serviceManager;
    }

    public function getTableGateway($model, $table)
    {
        if(static::$serviceConfig) {
            $cfg = !is_null(static::getServiceConfig()) ? static::getServiceConfig() : static::setServiceConfig(include '../../../../test/test.application.config.php');
            $cfg = $cfg['module_listener_options']['config_glob_paths'];
            $db  = array();
            $tmpArray = array();
            foreach($cfg as $config) {
                $path = __DIR__.'/../../../../'.$config;
                if(file_exists($path)) {
                    $dbConf = include($path);
                        if(isset($dbConf['db'])) {
                            foreach($dbConf['db'] as $key => $value) {
                                $db['db'][$key] = $value;
                            }
                        }

                }
            }
            if(is_array($db) && !empty($db)) {
                $config = new \Zend\Config\Config($db);
                $adapter = new Adapter($config->db->toArray());
                $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), $model);
                $tableGateway = new TableGateway($table, $adapter, null, $hydratingResultSet);
                return $tableGateway;
            }
        }
    }

    public function getTableMock($modelClass, $tableNameClass, $tableName, $method)
    {
        if(static::$serviceConfig) {
            $tableGateway = $this->getTableGateway($modelClass, $tableName);
            $testCase = $this->getMockBuilder($tableNameClass)->setConstructorArgs(array($tableGateway))->setMethods(array($method))->getMock();
            return $testCase;
        }
        return null;

    }

    public function getPhpUnitTool()
    {
        $tool = $this->getServiceManager()->get('MelisPhpUnitTool');
        return $tool;
    }

}