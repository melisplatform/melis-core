<?php

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\Authentication\AuthenticationService;

class MelisCoreAuthService 
	extends AuthenticationService 
	implements MelisCoreAuthServiceInterface, ServiceLocatorAwareInterface
{
	public $serviceLocator;
	
	
	public function setServiceLocator(ServiceLocatorInterface $sl)
	{
		$this->serviceLocator = $sl;
		return $this;
	}
	
	public function getServiceLocator()
	{
		return $this->serviceLocator;
	}
	
	public function getAuthRights()
	{
    	$melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
		$user = $this->getIdentity();
		
		$rightsXML = '';
		if (!empty($user))
			$rightsXML = $user->usr_rights;
		
		return $rightsXML;
	}
	
}