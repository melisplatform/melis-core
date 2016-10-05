<?php

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\Authentication\AuthenticationService;

class MelisCoreUserService implements MelisCoreUserServiceInterface, ServiceLocatorAwareInterface
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
	
	public function getUserXmlRights($userId = null)
	{
		$rightsXML = '';
		
		if (!empty($userId))
		{
			$tableUser = $this->serviceLocator->get('MelisCoreTableUser');
			$user = $tableUser->getEntryById($userId);
			if ($user)
			{
				$user = $user->current();
				if (!empty($user))
				{
					if ($user->usr_role_id != self::ROLE_ID_CUSTOM)
					{
						// Get rights from Role table
						$tableUserRole = $this->serviceLocator->get('MelisCoreTableUserRole');
						$datasRole = $tableUserRole->getEntryById($user->usr_role_id);
						if ($datasRole)
						{
							$datasRole = $datasRole->current();
							if (!empty($datasRole))
							{
								$rightsXML = $datasRole->urole_rights;
							}
						}
					}
					else
						$rightsXML = $user->usr_rights;
				}
			}
		}
	/*	else
		{
			$melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
			$user = $melisCoreAuth->getIdentity();
			
			$rightsXML = '';
			if (!empty($user))
				$rightsXML = $user->usr_rights;
		} */
	
		return $rightsXML;
	}
	
	
	public function isItemRightChecked($xmlRights, $sectionId, $itemId)
	{
		$rightsObj = simplexml_load_string($xmlRights);
		
		if (empty($rightsObj))
			return false;
		
		
		if (!empty($rightsObj->$sectionId))
		{
			foreach ($rightsObj->$sectionId->id as $itemIdXml)
			{
				if ($itemIdXml == $itemId)
					return true;
			}
		}
		
		return false;
	}
}