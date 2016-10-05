<?php
	
namespace MelisCore\Service;

interface MelisCoreRightsServiceInterface 
{
	const XML_ENDLINE = "\n";
	const XML_SPACER = "\t";
	
	public function isAccessible($xmlRights, $sectionId, $itemId);
	
	public function getRightsValues($userId);
	
	public function createXmlRightsValues($userId, $datas);
}