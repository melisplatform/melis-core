<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use Zend\Authentication\Storage\Session;
use Zend\Authentication\Adapter\DbTable as DbTableAuthAdapter;
use MelisCore\Service\MelisCoreAuthService;

class MelisCoreAuthServiceFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{ 
		$dbAdapter = $sl->get('Zend\Db\Adapter\Adapter');
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