<?php
	
namespace MelisCore\Service;

interface MelisCoreUserServiceInterface 
{
	const ROLE_ID_CUSTOM = 1;
	
	public function getUserXmlRights($userId = null);
	
	public function isItemRightChecked($xmlRights, $sectionId, $itemId);
}