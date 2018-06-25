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
	/**
	 * @var \Zend\EventManager\EventManagerInterface $e
	 */
	    $e = $this->getServiceLocator()->get('Application')->getEventManager();
	$e->trigger('melis_core_check_user_rights', $this);

	$melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
		$user = $melisCoreAuth->getIdentity();

		$rightsXML = '';
		if (!empty($user)) {
	    $rightsXML = $user->usr_rights;
	}


	return $rightsXML;
    }

    public function encryptPassword($password)
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    public function isPasswordCorrect($providedPassword, $storedHashPassword)
    {
        return password_verify($providedPassword, $storedHashPassword);
    }



	
}
