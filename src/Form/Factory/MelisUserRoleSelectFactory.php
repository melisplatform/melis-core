<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Laminas\ServiceManager\ServiceManager;
use MelisCore\Form\Factory\MelisSelectFactory;

/**
 * Use Role select factory to fill the Use Roles list
 */
class MelisUserRoleSelectFactory extends MelisSelectFactory
{
    protected function loadValueOptions(ServiceManager $serviceManager)
    {
		$userRolesTable = $serviceManager->get('MelisCoreTableUserRole');
		$roles = $userRolesTable->fetchAll();
		
		$valueoptions = [];
		
		// default option
		$valueoptions[''] = 'tr_meliscms_form_common_Choose';
		
        foreach ($roles->fetchAll() As $role)
            $valueoptions[$role->urole_id] = $role->urole_name;
		
		return $valueoptions;
	}

}