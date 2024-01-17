<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisGeneralListener;

/**
 * This listener is executed when page publication is asked.
 *
 */
class MelisCoreUpdatePasswordHistoryListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
        	'MelisCore',
        	[
                'meliscore_tooluser_save_info_end', 
                'meliscore_tooluser_savenew_info_end',
                'meliscore_user_reset_old_password_end',
                'meliscore_user_create_password_end',
                'meliscore_update_password_history',
            ], 
        	function($event){
                $params = $event->getParams();
                
                if ($params['success']) {
                    if (isset($params['datas']['usr_id']) && isset($params['datas']['usr_password'])) {
                        $userId = $params['datas']['usr_id'];
                        $password = $params['datas']['usr_password'];
                        
                        $event->getTarget()->getEvent()->getApplication()->getServiceManager()->get('MelisUpdatePasswordHistoryService')->saveItem($userId, $password);
                    }
                }
        	},
        );
    }
}