<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use MelisCore\Service\MelisGeneralService;

class MelisPasswordSettingsService extends MelisGeneralService
{   
    /**
     * Saves an item with password settings.
     *
     * @param array $passwordSettingsData The password settings data to be saved.
     * @return array Returns an array with the updated parameters.
     */
    public function saveItem($passwordSettingsData)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $arrayParameters = $this->sendEvent('password_settings_service_save_item_start', $arrayParameters);

        if ($arrayParameters['passwordSettingsData']) {
            $melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
            $formElements = $this->getServiceManager()->get('FormElementManager');
            $translator = $this->getServiceManager()->get('translator');

            $factory = new \Laminas\Form\Factory();
            $factory->setFormElementManager($formElements);

            $loginAccountLockConfigForm = $melisCoreConfig->getItem('meliscore/forms/meliscore_other_config_login_account_lock_form');
            $loginAccountLockForm = $factory->createForm($loginAccountLockConfigForm);

            $passwordValidityConfigForm = $melisCoreConfig->getItem('meliscore/forms/meliscore_other_config_password_validity_form');
            $passwordValidityForm = $factory->createForm($passwordValidityConfigForm);
            
            $passwordDuplicateConfigForm = $melisCoreConfig->getItem('meliscore/forms/meliscore_other_config_password_duplicate_form');
            $passwordDuplicateForm = $factory->createForm($passwordDuplicateConfigForm);

            $passwordComplexityConfigForm = $melisCoreConfig->getItem('meliscore/forms/meliscore_other_config_password_complexity_form');
            $passwordComplexityForm = $factory->createForm($passwordComplexityConfigForm);
            
            // remove form validation for type of lock duration in days if login type of lock selected is admin
            if ($arrayParameters['passwordSettingsData']['login_account_type_of_lock'] == 'admin') {
                $inputFilter = $loginAccountLockForm->getInputFilter();
                
                $inputFilter->remove('login_account_duration_days');
                $inputFilter->remove('login_account_duration_hours');
                $inputFilter->remove('login_account_duration_minutes');

                // Add this numeric validation rule for 'login_account_duration_days' field
                $inputFilter->add([
                    'name'       => 'login_account_duration_days',
                    'required'   => false,
                    'validators' => [
                        [
                            'name'    => 'Regex',
                            'options' => [
                                'pattern' => '/^[0-9]+$/',
                                'messages' => [
                                    \Laminas\Validator\Regex::NOT_MATCH => $translator->translate('tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric')
                                ],
                                'encoding' => 'UTF-8',
                            ],
                        ],
                    ],
                ]);

                // Add this numeric validation rule for 'login_account_duration_hours' field
                $inputFilter->add([
                    'name'       => 'login_account_duration_hours',
                    'required'   => false,
                    'validators' => [
                        [
                            'name'    => 'Regex',
                            'options' => [
                                'pattern' => '/^[0-9]+$/',
                                'messages' => [
                                    \Laminas\Validator\Regex::NOT_MATCH => $translator->translate('tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric')
                                ],
                                'encoding' => 'UTF-8',
                            ],
                        ],
                    ],
                ]);

                // Add this numeric validation rule for 'login_account_duration_minutes' field
                $inputFilter->add([
                    'name'       => 'login_account_duration_minutes',
                    'required'   => false,
                    'validators' => [
                        [
                            'name'    => 'Regex',
                            'options' => [
                                'pattern' => '/^[0-9]+$/',
                                'messages' => [
                                    \Laminas\Validator\Regex::NOT_MATCH => $translator->translate('tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric')
                                ],
                                'encoding' => 'UTF-8',
                            ],
                        ],
                    ],
                ]);
            }

            // if type of lock is timer then add filter that checks if either days or hours or minutes 
            // has value then the validation for the others can be removed
            if ($arrayParameters['passwordSettingsData']['login_account_type_of_lock'] == 'timer') {
                $durationInDays = $arrayParameters['passwordSettingsData']['login_account_duration_days'];
                $durationInHours = $arrayParameters['passwordSettingsData']['login_account_duration_hours'];
                $durationInMinutes = $arrayParameters['passwordSettingsData']['login_account_duration_minutes'];
                $inputFilter = $loginAccountLockForm->getInputFilter();
                
                if (!empty($durationInDays)) { 
                    if (filter_var($durationInHours, FILTER_VALIDATE_INT) || empty($durationInHours)) {
                        $inputFilter->remove('login_account_duration_hours');
                    }
                    
                    if (filter_var($durationInMinutes, FILTER_VALIDATE_INT) || empty($durationInMinutes)) {
                        $inputFilter->remove('login_account_duration_minutes');
                    }
                }

                if (!empty($durationInHours)) {
                    if (filter_var($durationInDays, FILTER_VALIDATE_INT) || empty($durationInDays)) {
                        $inputFilter->remove('login_account_duration_days');
                    }
                    
                    if (filter_var($durationInMinutes, FILTER_VALIDATE_INT) || empty($durationInMinutes)) {
                        $inputFilter->remove('login_account_duration_minutes');
                    }
                }

                if (!empty($durationInMinutes)) {
                    if (filter_var($durationInDays, FILTER_VALIDATE_INT) || empty($durationInDays)) {
                        $inputFilter->remove('login_account_duration_days');
                    }
                    
                    if (filter_var($durationInHours, FILTER_VALIDATE_INT) || empty($durationInHours)) {
                        $inputFilter->remove('login_account_duration_hours');
                    }
                }
            }
            
            // remove form validation for password validity lifetime if password validity status is 0
            if (empty($arrayParameters['passwordSettingsData']['password_validity_status'])) {
                $inputFilter = $passwordValidityForm->getInputFilter();
                
                $inputFilter->remove('password_validity_lifetime');

                // Add a new validation rule for 'password_validity_lifetime' field
                $inputFilter->add([
                    'name'       => 'password_validity_lifetime',
                    'required'   => false,
                    'validators' => [
                        [
                            'name'    => 'Regex',
                            'options' => [
                                'pattern' => '/^[0-9]+$/',
                                'messages' => [
                                    \Laminas\Validator\Regex::NOT_MATCH => $translator->translate('tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric')
                                ],
                                'encoding' => 'UTF-8',
                            ],
                        ],
                    ],
                ]);
            }

            // remove form validation for number of attempts before account is locked if login account lock status is 0
             if (empty($arrayParameters['passwordSettingsData']['login_account_lock_status'])) {
                $inputFilter = $loginAccountLockForm->getInputFilter();
                
                $inputFilter->remove('login_account_lock_number_of_attempts');

                // Add a new validation rule for 'number of attempts before account is locked' field
                $inputFilter->add([
                    'name'       => 'login_account_lock_number_of_attempts',
                    'required'   => false,
                    'validators' => [
                        [
                            'name'    => 'Regex',
                            'options' => [
                                'pattern' => '/^[0-9]+$/',
                                'messages' => [
                                    \Laminas\Validator\Regex::NOT_MATCH => $translator->translate('tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric')
                                ],
                                'encoding' => 'UTF-8',
                            ],
                        ],
                    ],
                ]);
            }

            // remove form validation for password duplicate lifetime if password duplicate status is 0
            if (empty($arrayParameters['passwordSettingsData']['password_duplicate_status'])) {
                $inputFilter = $passwordDuplicateForm->getInputFilter();
                
                $inputFilter->remove('password_duplicate_lifetime');

                // Add a new validation rule for 'password_validity_lifetime' field
                $inputFilter->add([
                    'name'       => 'password_duplicate_lifetime',
                    'required'   => false,
                    'validators' => [
                        [
                            'name'    => 'Regex',
                            'options' => [
                                'pattern' => '/^[0-9]+$/',
                                'messages' => [
                                    \Laminas\Validator\Regex::NOT_MATCH => $translator->translate('tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric')
                                ],
                                'encoding' => 'UTF-8',
                            ],
                        ],
                    ],
                ]);
            }
            
            // if password duplicate field is empty then use default value to populate
            if (empty($arrayParameters['passwordSettingsData']['password_duplicate_lifetime'])) {
                $arrayParameters['passwordSettingsData']['password_duplicate_lifetime'] = 183;
            }

            // if number of characters field is empty then use default value to populate
            if (empty($arrayParameters['passwordSettingsData']['password_complexity_number_of_characters'])) {
                $arrayParameters['passwordSettingsData']['password_complexity_number_of_characters'] = 8;
            }

            $loginAccountLockForm->setData($arrayParameters['passwordSettingsData']);
            $passwordValidityForm->setData($arrayParameters['passwordSettingsData']);
            $passwordDuplicateForm->setData($arrayParameters['passwordSettingsData']);
            $passwordComplexityForm->setData($arrayParameters['passwordSettingsData']);

            $loginAccountLockFormErrors = [];
            $passwordValidityFormErrors = [];
            $passwordDuplicateFormErrors = [];
            $passwordComplexityFormErrors = [];

            if (!$loginAccountLockForm->isValid()) {
                $loginAccountLockFormErrors = $loginAccountLockForm->getMessages();

                foreach ($loginAccountLockFormErrors as $keyError => $valueError){
                    $loginAccountLockFormErrors[$keyError]['label'] = $translator->translate('tr_meliscore_tool_other_config_label_' . $keyError);
                }
            }

            if (!$passwordValidityForm->isValid()) {
                $passwordValidityFormErrors = $passwordValidityForm->getMessages();

                foreach ($passwordValidityFormErrors as $keyError => $valueError){
                    $passwordValidityFormErrors[$keyError]['label'] = $translator->translate('tr_meliscore_tool_other_config_label_' . $keyError);
                }
            }

            if (!$passwordDuplicateForm->isValid()) {
                $passwordDuplicateFormErrors = $passwordDuplicateForm->getMessages();

                foreach ($passwordDuplicateFormErrors as $keyError => $valueError){
                    $passwordDuplicateFormErrors[$keyError]['label'] = $translator->translate('tr_meliscore_tool_other_config_label_' . $keyError);
                }
            }

            if (!$passwordComplexityForm->isValid()) {
                $passwordComplexityFormErrors = $passwordComplexityForm->getMessages();

                foreach ($passwordComplexityFormErrors as $keyError => $valueError){
                    $passwordComplexityFormErrors[$keyError]['label'] = $translator->translate('tr_meliscore_tool_other_config_label_' . $keyError);
                }
            }

            if (!empty($passwordValidityFormErrors) || !empty($passwordDuplicateFormErrors) || !empty($passwordComplexityFormErrors) || !empty($loginAccountLockFormErrors)) {
                $mergedErrors = array_merge($passwordValidityFormErrors, $passwordDuplicateFormErrors, $passwordComplexityFormErrors, $loginAccountLockFormErrors);
                $arrayParameters['success'] = 0;
                $arrayParameters['errors'] = $mergedErrors;
            } else {
                $file = $_SERVER['DOCUMENT_ROOT'] . '/../vendor/melisplatform/melis-core/config/app.login.php';

                chmod($file, 0777);
                $configFactory = new \Laminas\Config\Factory();

                $config = [
                    'plugins' => [
                        'meliscore' => [
                            'datas' => [
                                'login' => $arrayParameters['passwordSettingsData']
                            ]
                        ]
                    ]
                ];

                $configFactory->toFile($file, $config);

                // check if opcache zend_extension is installed/enabled in server
                if (function_exists('opcache_reset')) {
                    opcache_reset();
                }

                $arrayParameters['success'] = 1;
            }
        }
        
        $arrayParameters = $this->sendEvent('password_settings_service_save_item_end', $arrayParameters);

        return $arrayParameters;
    }
}