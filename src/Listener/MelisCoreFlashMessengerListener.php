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

class MelisCoreFlashMessengerListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
	
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();
        
        $callBackHandler = $sharedEvents->attach(
        	'MelisCore',
        	array(
        	    'meliscore_tooluser_savenew_end', 
        	    'meliscore_tooluser_save_end', 
        	    'meliscore_tooluser_delete_end',
        	    'meliscore_module_management_save_end', 
        	    'meliscore_platform_save_end', 
        	    'meliscore_platform_delete_end', 
        	    'meliscore_language_new_end',
                'meliscore_language_update_end',
        	    'meliscore_language_delete_end', 
        	    'meliscore_tool_bo_emails_end',
        	    'meliscore_save_log_type_trans',
                'meliscore_profile_save_end',
                'melis_core_platform_scheme_save_end',
                'melis_core_platform_scheme_reset_end',
                'melis_core_platform_scheme_reset_end',
                'meliscore_tooluser_resend_password_create_email_end'
        	),
        	function($e){

        		$sm = $e->getTarget()->getServiceLocator();
        		
        		$flashMessenger = $sm->get('MelisCoreFlashMessenger');
        		$params = $e->getParams();
        		//$flashMessenger->addToFlashMessenger($params['textTitle'], $params['textMessage'], $flashMessenger::WARNING);
        		$results = $e->getTarget()->forward()->dispatch(
        		    'MelisCore\Controller\MelisFlashMessenger',
        		    array_merge(array('action' => 'log'), $params))->getVariables();

        	},
        -1000);
        
        $this->listeners[] = $callBackHandler;
    }
}