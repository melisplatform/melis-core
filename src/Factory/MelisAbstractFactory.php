<?php

/**
 * @see       https://github.com/laminas/laminas-cache for the canonical source repository
 * @copyright https://github.com/laminas/laminas-cache/blob/master/COPYRIGHT.md
 * @license   https://github.com/laminas/laminas-cache/blob/master/LICENSE.md New BSD License
 */

namespace MelisCore\Factory;

use Interop\Container\ContainerInterface;
use Laminas\Db\Adapter\Adapter;
use Laminas\Db\TableGateway\TableGateway;
use Laminas\ServiceManager\AbstractFactoryInterface;
use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\Db\Adapter\AdapterAbstractServiceFactory;

/**
 * This Abstract factory targeting only Melis Services
 *
 * This also avoid deplication of factories
 */
class MelisAbstractFactory implements AbstractFactoryInterface
{

    /**
     * Service manager factory prefix
     * for Melis Services
     *
     * @var string
     */
    const SERVICE_PREFIX = 'Melis';

    /**
     * @param ContainerInterface $container
     * @param string $requestedName
     * @return boolean
     */
    public function canCreate(ContainerInterface $container, $requestedName)
    {
        /**
         * RequestedName must have Melis to create the service
         */
//        $reflector = new \ReflectionClass($requestedName);
//        if (0 !== strpos($requestedName, self::SERVICE_PREFIX) &&
//            0 !== strpos($reflector->getFileName(), '\\module\\') &&
//            0 !== strpos($reflector->getFileName(), '\\melisplatform\\'))
//            return false;

        if (class_exists($requestedName)) {
            $instance = new $requestedName();

            if (method_exists($instance, 'setTableGateway') ||
                method_exists($instance, 'setServiceManager'))
                return true;
            else
                return false;
        }else
            return false;
    }

    /**
     * Create an object
     *
     * @param  ContainerInterface $container
     * @param  string             $requestedName
     * @param  null|array         $options
     * @return object
     */
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)
    {
        // Requested class instance
        $instance = new $requestedName();

        /**
         * This method initialized the tableGateway to requsted service name
         */
        if (method_exists($instance, 'setTableGateway')) {

            /**
             * Object result set
             */
            $resultSetPrototype = null;
            if (method_exists($instance, 'hydratingResultSet')) {
                $resultSetPrototype = $instance->hydratingResultSet();
            }

            /**
             * TableGateway instance
             */
            $tableGateway = new TableGateway(
                /**
                 * const Table variable MUST declared on the Model
                 */
                $instance::TABLE,
                $container->get(Adapter::class),
                null,
                $resultSetPrototype);
            /**
             * TableGateway instance requested class setter
             */
            $instance->setTableGateway($tableGateway);
        }

        /**
         * This method initialized the serviceManger to requsted service name
         */
        if (method_exists($instance, 'setServiceManager')) {
            // Service manager instance
            $instance->setServiceManager($container);
        }

        return $instance;
    }

    /**
     * @param  ServiceLocatorInterface $serviceLocator
     * @param  string $name
     * @param  string $requestedName
     * @return boolean
     */
    public function canCreateServiceWithName(ServiceLocatorInterface $serviceLocator, $name, $requestedName)
    {
        return $this->canCreate($serviceLocator, $requestedName);
    }

    /**
     * Create service with name
     *
     * @param ServiceLocatorInterface $serviceLocator
     * @param string $name
     * @param string $requestedName
     * @return Adapter
     */
    public function createServiceWithName(ServiceLocatorInterface $serviceLocator, $name, $requestedName)
    {
        return $this($serviceLocator, $requestedName);
    }
}
