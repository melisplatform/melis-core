<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service\Factory;

use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;
use Laminas\Authentication\Storage\Session;
use Laminas\Authentication\Adapter\DbTable as DbTableAuthAdapter;
use MelisCore\Service\MelisCoreAuthService;

class MelisCoreAuthServiceFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{ 
		$dbAdapter = $sl->get('Laminas\Db\Adapter\Adapter');
		$dbTableAuthAdapter  = new DbTableAuthAdapter($dbAdapter);
		$dbTableAuthAdapter->setTableName('melis_core_user')
				    		->setIdentityColumn('usr_login')
				    		->setCredentialColumn('usr_password');

		$authService = new MelisCoreAuthService();
		$authService->setAdapter($dbTableAuthAdapter);
		
		$storage = new Session('Melis_Auth');
		$authService->setStorage($storage);
		
		return $authService;
	}

}