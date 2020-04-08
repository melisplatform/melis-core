<?php

namespace MelisCore\Service;

use Laminas\Session\Container;

class MelisCoreDispatchService extends MelisServiceManager implements MelisCoreDispatchServiceInterface
{	
	/**
	 * Dispatch to a module/controller/action to get back a json result
	 * With success/errors/datas returned
	 * Use the meliscms session container to add result in a queue for further use
	 * Used for handling save page
	 *
	 * @param MvcEvent $e
	 * @param String $nameVarSession
	 * @param String $disptachController
	 * @param array $dispatchVars
	 * @return array
	 */
	public function dispatchPluginAction($e, $nameContainer, $nameVarSession, 
										 $disptachController, $dispatchVars)
	{
		// Get session of module
		$container = new Container($nameContainer);
		if (empty($container[$nameVarSession]))
			$container[$nameVarSession] = array();
		if (empty($container[$nameVarSession]['success']))
			$container[$nameVarSession]['success'] = 1;
		if (empty($container[$nameVarSession]['errors']))
			$container[$nameVarSession]['errors'] = array();
		if (empty($container[$nameVarSession]['datas']))
			$container[$nameVarSession]['datas'] = array();
	
		// Get the controller to be able to use forward
		$oController = $e->getTarget();
		$success = $container[$nameVarSession]['success'];
		$errors = $container[$nameVarSession]['errors'];
		$datas = $container[$nameVarSession]['datas'];
		$resultForward = $oController->forward()->dispatch($disptachController, $dispatchVars);
		
		if (!empty($resultForward))
		{
		    $resultTmp = $resultForward->getVariables();
		    	
		    // Check the result
		    if ($resultTmp['success'] == 0)
		        $success = 0;
		        	
		        	
		        // Add errors to previously existing ones in session
		        //  && count($resultTmp['errors']) > 0
		        if ($resultTmp['success'] == 0)
		        {
		            foreach ($resultTmp['errors'] as $error)
		            {
		                foreach ($error as $keyError => $valError)
		                    $errors[$keyError] = $valError;
		            }
		        }
		        	
		        // add datas to session
		        if (!empty($resultTmp['datas']))
		            $datas = array_merge_recursive($datas, $resultTmp['datas']);
		            	
		            // Final table to send back
		            $result = array('success' => $success, 'errors' => $errors, 'datas' => $datas);
		            	
		            // Copy new results in session
		            $container[$nameVarSession] = $result;
		    
		            // also return results
		            return array($success, $errors, $datas);
		}
		else
		    return array(1, array(), array());
	}
}