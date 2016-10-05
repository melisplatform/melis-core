<?php
	
namespace MelisCore\Service;

interface MelisCoreConfigServiceInterface 
{
	public function getItem($pathString = '');
	
	public function prefixIdsKeysRec($array, $prefix);
}