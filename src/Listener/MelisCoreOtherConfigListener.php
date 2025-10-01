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
class MelisCoreOtherConfigListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
        	'MelisCore',
        	'meliscore_save_other_config', 
        	function($event){
                $params = $event->getParams();
                $passwordSettings = [];
                $passwordSettings['login_account_lock_status'] = $params['login_account_lock_status'] ?? '';
                $passwordSettings['login_account_admin_email'] = $params['login_account_admin_email'] ?? '';
                $passwordSettings['login_account_lock_number_of_attempts'] = $params['login_account_lock_number_of_attempts'] ?? '';
                $passwordSettings['login_account_type_of_lock'] = $params['login_account_type_of_lock'] ?? '';
                $passwordSettings['login_account_duration_days'] = $params['login_account_duration_days'] ?? '';
                $passwordSettings['login_account_duration_hours'] = $params['login_account_duration_hours'] ?? '';
                $passwordSettings['login_account_duration_minutes'] = $params['login_account_duration_minutes'] ?? '';
                $passwordSettings['password_validity_status'] = $params['password_validity_status'] ?? '';
                $passwordSettings['password_validity_lifetime'] = $params['password_validity_lifetime'] ?? '';
                $passwordSettings['password_duplicate_status'] = $params['password_duplicate_status'] ?? '';
                $passwordSettings['password_duplicate_lifetime'] = $params['password_duplicate_lifetime'] ?? '';
                $passwordSettings['password_complexity_number_of_characters'] = $params['password_complexity_number_of_characters'] ?? '';
                $passwordSettings['password_complexity_use_special_characters'] = $params['password_complexity_use_special_characters'] ?? '';
                $passwordSettings['password_complexity_use_lower_case'] = $params['password_complexity_use_lower_case'] ?? '';
                $passwordSettings['password_complexity_use_upper_case'] = $params['password_complexity_use_upper_case'] ?? '';
                $passwordSettings['password_complexity_use_digit'] = $params['password_complexity_use_digit'] ?? '';
                $passwordSettingsService =  $event->getTarget()->getEvent()->getApplication()->getServiceManager()->get('MelisPasswordSettingsService');
                $result = $passwordSettingsService->saveItem($passwordSettings);
                
                if (!$result['success']) {
                    $response = [];
                    $response['errors'] = $result['errors'];
                    
                    return $response;
                }
        	},
        );
    }
}