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
            function($event) {
                $params = $event->getParams();
                $response = ['errors' => []];
               
                // Get the structured payload array sent from the JS ---
                $allConfigFormsData = $params['all_config_forms_data'] ?? [];
               
                $coreConfigData = [];

                // Loop through the payload and merge data from Core forms
                foreach ($allConfigFormsData as $formEntry) {
                    $formName = $formEntry['form_name'] ?? null;
                    $config = $formEntry['data'];
                   
                    // Identify Core forms by their common form_name
                    if ($formName === 'otherConfigForm') {
                        // Merge data from the current core form into the final container
                        $coreConfigData = array_merge($coreConfigData, $config);
                    }
                }

                // If Core config data wasn't found, stop and return
                if (empty($coreConfigData)) {
                    return $response;
                }

                // Extract and Map data from the merged array ($coreConfigData) ---
                $passwordSettings = [];
                $passwordSettings['login_account_lock_status']              = $coreConfigData['login_account_lock_status'] ?? '';
                $passwordSettings['login_account_admin_email']              = $coreConfigData['login_account_admin_email'] ?? '';
                $passwordSettings['login_account_lock_number_of_attempts']  = $coreConfigData['login_account_lock_number_of_attempts'] ?? '';
                $passwordSettings['login_account_type_of_lock']             = $coreConfigData['login_account_type_of_lock'] ?? '';
                $passwordSettings['login_account_duration_days']            = $coreConfigData['login_account_duration_days'] ?? '';
                $passwordSettings['login_account_duration_hours']           = $coreConfigData['login_account_duration_hours'] ?? '';
                $passwordSettings['login_account_duration_minutes']         = $coreConfigData['login_account_duration_minutes'] ?? '';
                $passwordSettings['password_validity_status']               = $coreConfigData['password_validity_status'] ?? '';
                $passwordSettings['password_validity_lifetime']             = $coreConfigData['password_validity_lifetime'] ?? '';
                $passwordSettings['password_duplicate_status']              = $coreConfigData['password_duplicate_status'] ?? '';
                $passwordSettings['password_duplicate_lifetime']            = $coreConfigData['password_duplicate_lifetime'] ?? '';
                $passwordSettings['password_complexity_number_of_characters'] = $coreConfigData['password_complexity_number_of_characters'] ?? '';
                $passwordSettings['password_complexity_use_special_characters'] = $coreConfigData['password_complexity_use_special_characters'] ?? '';
                $passwordSettings['password_complexity_use_lower_case']     = $coreConfigData['password_complexity_use_lower_case'] ?? '';
                $passwordSettings['password_complexity_use_upper_case']     = $coreConfigData['password_complexity_use_upper_case'] ?? '';
                $passwordSettings['password_complexity_use_digit']          = $coreConfigData['password_complexity_use_digit'] ?? '';

                // Save Data to app.login.php
                $passwordSettingsService = $event->getTarget()->getEvent()->getApplication()->getServiceManager()->get('MelisPasswordSettingsService');
                $result = $passwordSettingsService->saveItem($passwordSettings);
               
                if (!$result['success']) {
                    $response['errors'] = $result['errors'];
                    return $response;
                }
               
                return $response;
            },
        );
    }
}