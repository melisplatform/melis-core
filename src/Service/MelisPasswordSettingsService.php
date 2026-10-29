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
                try {
                    $this->saveLoginSettings($arrayParameters['passwordSettingsData']);
                    $arrayParameters['success'] = 1;
                } catch (\Exception $e) {
                    error_log('MelisCore login settings not saved: ' . $e->getMessage());
                    // Non-empty errors: both the legacy listener and the React API report a failure
                    $arrayParameters['success'] = 0;
                    $arrayParameters['errors'] = [
                        'other_config' => [
                            'label' => $translator->translate('tr_meliscore_tool_other_config'),
                            'saveFailed' => $translator->translate('tr_meliscore_tool_other_config_unable_to_save'),
                        ],
                    ];
                }
            }
        }

        $arrayParameters = $this->sendEvent('password_settings_service_save_item_end', $arrayParameters);

        return $arrayParameters;
    }

    /** @var array|null Per-request cache of getLoginSettings() */
    private $loginSettings = null;

    /**
     * Effective login / password policy: the defaults of config/otherconfig.php
     * (meliscore/datas/otherconfig_default/login) overridden by the values saved in the
     * melis_core_login_config table by the "Other config" tool.
     *
     * @return array
     */
    public function getLoginSettings()
    {
        if ($this->loginSettings === null) {
            $defaults = $this->getServiceManager()->get('MelisCoreConfig')->getItem('meliscore/datas/otherconfig_default/login');
            $saved = [];

            try {
                foreach ($this->getServiceManager()->get('MelisCoreLoginConfigTable')->fetchAll() as $row) {
                    $saved[$row->lcfg_key] = $row->lcfg_value;
                }

                if (empty($saved)) {
                    $saved = $this->importLegacyLoginFile();
                }
            } catch (\Exception $e) {
                // Table not created yet (migration not run): the defaults apply, the login keeps working
                error_log('MelisCore login settings not read, defaults used: ' . $e->getMessage());
                $saved = [];
            }

            $this->loginSettings = array_merge(is_array($defaults) ? $defaults : [], $saved);
        }

        return $this->loginSettings;
    }

    /**
     * Upserts every setting in one transaction, so that every server reads the same policy.
     *
     * @param array $settings setting key => value
     */
    private function saveLoginSettings(array $settings)
    {
        $gateway = $this->getServiceManager()->get('MelisCoreLoginConfigTable')->getTableGateway();
        $connection = $gateway->getAdapter()->getDriver()->getConnection();

        $ids = [];
        foreach ($gateway->select() as $row) {
            $ids[$row->lcfg_key] = $row->lcfg_id;
        }

        $connection->beginTransaction();
        try {
            foreach ($settings as $key => $value) {
                $data = [
                    'lcfg_key' => $key,
                    'lcfg_value' => $value === null ? null : (string) $value,
                ];

                if (isset($ids[$key])) {
                    $gateway->update($data, ['lcfg_id' => $ids[$key]]);
                } else {
                    $gateway->insert($data);
                }
            }
            $connection->commit();
        } catch (\Exception $e) {
            $connection->rollback();
            throw $e;
        }

        $this->loginSettings = null;
    }

    /**
     * One-time upgrade: the policy used to be saved in config/app.login.php, which is lost on
     * every new server pod (hence the table). A platform that still has that file keeps its
     * policy: the values are moved to the table, then the file is deleted.
     *
     * @return array the imported settings, empty when there is no such file
     */
    private function importLegacyLoginFile()
    {
        // Fixed path, never user input: the file Module::getConfig() used to include on every request
        $file = __DIR__ . '/../../config/app.login.php';
        if (!is_file($file)) {
            return [];
        }

        $config = include $file;
        $settings = is_array($config) ? ($config['plugins']['meliscore']['datas']['login'] ?? []) : [];
        if (!is_array($settings) || empty($settings)) {
            return [];
        }

        $this->saveLoginSettings($settings);
        @unlink($file);

        return $settings;
    }
}