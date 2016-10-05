<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;
use MelisCore\Form\Factory\MelisSelectFactory;

/**
 * Use Role select factory to fill the Use Roles list
 */
class MelisUserRoleSelectFactory extends MelisSelectFactory
{
	protected function loadValueOptions(ServiceLocatorInterface $formElementManager)
	{
		$serviceManager = $formElementManager->getServiceLocator();

		$userRolesTable = $serviceManager->get('MelisCoreTableUserRole');
		$roles = $userRolesTable->fetchAll();
		
		$valueoptions = array();
		
		// default option
		$valueoptions[''] = 'tr_meliscms_form_common_Choose';
		
		$max = $roles->count();
		for ($i = 0; $i < $max; $i++)
		{
			$role = $roles->current();
			$valueoptions[$role->urole_id] = $role->urole_name;
			$roles->next();
		}
		
		return $valueoptions;
	}

}