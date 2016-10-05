<?php
	
namespace MelisCore\Service;

interface MelisCoreDispatchServiceInterface 
{
	public function dispatchPluginAction($e, $nameContainer, $nameVarSession, $disptachController, $dispatchVars);
}