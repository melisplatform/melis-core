<?php
/**
 * Created by PhpStorm.
 * User: LENOVO
 * Date: 7/26/2022
 * Time: 3:31 PM
 */

namespace MelisCore\Validator\Factory;

use Laminas\Stdlib\ArrayUtils;
use Psr\Container\ContainerInterface;
use Laminas\ServiceManager\ServiceManager;
use MelisCore\Validator\MelisPasswordValidatorWithConfig;

class MelisPasswordValidatorWithConfigFactory
{
    public function __invoke(ContainerInterface $container, string $requestedName, array $options = [])
    {
        $options = ArrayUtils::merge($options, [
            'serviceManager' => $container->get('ServiceManager'),
        ]);

        return new MelisPasswordValidatorWithConfig($options);
    }
}