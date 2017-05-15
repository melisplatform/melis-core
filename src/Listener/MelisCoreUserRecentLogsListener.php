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

class MelisCoreUserRecentLogsListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
	
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();
        
        $callBackHandler = $sharedEvents->attach(
        	'MelisCore',
            'meliscore_get_recent_user_logs',
        	function($e){
        	    
        		$sm = $e->getTarget()->getServiceLocator();
        		
    		    // Get Cureent User ID
    		    $melisCoreAuth = $sm->get('MelisCoreAuth');
    		    $userAuthDatas =  $melisCoreAuth->getStorage()->read();
    		    $userId = (int) $userAuthDatas->usr_id;
    		    
    		    $logSrv = $sm->get('MelisCoreLogService');
    		    $recentUserLogs = $logSrv->getLogList(null, null, $userId, null, null, null, 50, 'desc');
    		    
    		    $flashMsgSrv = $sm->get('MelisCoreFlashMessenger');
    		    
    		    $recentUserLogs = array_reverse($recentUserLogs);
    		    
        		foreach ($recentUserLogs As $key => $val)
        		{
        		    // Retrieving the Log from Log Entity
        		    $log = $val->getLog();
        		    
        		    $title   = $log->log_title;
        		    $message = $log->log_message;
        		    $icon = ($log->log_action_status) ? $flashMsgSrv::INFO : $flashMsgSrv::WARNING;
        		    
        		    $flashMsgSrv->addToFlashMessenger($title, $message, $icon, $log->log_date_added);
        		}
    	});
        
        $this->listeners[] = $callBackHandler;
    }
}