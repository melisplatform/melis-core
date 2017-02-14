<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisCoreGeneralListener;
class MelisCoreInstallCreateNewUserListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
	
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();
        
        $callBackHandler = $sharedEvents->attach(
        	'MelisInstaller',
        	array(
                'melis_install_last_process_start'
        	),
        	function($e){

        		$sm = $e->getTarget()->getServiceLocator();
        		$params = $e->getParams();
        		$userData  = $params['user_data'];
         		$tableUser = $sm->get('MelisCoreTableUser');
         		$installHelper = $sm->get('InstallerHelper');
        		
        		// add the default platform

        		
                if(!empty($userData)) {
                    $tableUser->save(array(
                        'usr_status' => 1,
                        'usr_login'  => $userData['login'],
                        'usr_email'  => $userData['email'],
                        'usr_password' => md5($userData['password']),
                        'usr_firstname' => $userData['firstname'],
                        'usr_lastname'  => $userData['lastname'],
                        'usr_lang_id'   => 1,
                        'usr_admin'     => 0,
                        'usr_role_id'   => 1,
                        'usr_rights' => '<?xml version="1.0" encoding="UTF-8"?><document type="MelisUserRights" author="MelisTechnology" version="2.0"><meliscms_pages>	<id>-1</id></meliscms_pages><meliscore_interface></meliscore_interface><meliscore_tools>	<id>meliscore_tools_root</id></meliscore_tools></document>',
                        'usr_creation_date' => date('Y-m-d H:i:s'),  
                    ));
                }
        	},
        -1500);
        
        $this->listeners[] = $callBackHandler;
    }
}