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

            $passwordValidityConfigForm = $melisCoreConfig->getItem('meliscore/forms/meliscore_other_config_password_validity_form');
            $passwordValidityForm = $factory->createForm($passwordValidityConfigForm);
            
            $passwordDuplicateConfigForm = $melisCoreConfig->getItem('meliscore/forms/meliscore_other_config_password_duplicate_form');
            $passwordDuplicateForm = $factory->createForm($passwordDuplicateConfigForm);

            $passwordComplexityConfigForm = $melisCoreConfig->getItem('meliscore/forms/meliscore_other_config_password_complexity_form');
            $passwordComplexityForm = $factory->createForm($passwordComplexityConfigForm);
            
            // remove form validation for password validity lifetime if password validity status is 0
            if (empty($arrayParameters['passwordSettingsData']['password_validity_status'])) {
                $passwordValidityForm->getInputFilter()->remove('password_validity_lifetime');
            }

             // remove form validation for password duplicate lifetime if password duplicate status is 0
            if (empty($arrayParameters['passwordSettingsData']['password_duplicate_status'])) {
                $passwordDuplicateForm->getInputFilter()->remove('password_duplicate_lifetime');
            }
            
            $passwordValidityForm->setData($arrayParameters['passwordSettingsData']);
            $passwordDuplicateForm->setData($arrayParameters['passwordSettingsData']);
            $passwordComplexityForm->setData($arrayParameters['passwordSettingsData']);

            $passwordValidityFormErrors = [];
            $passwordDuplicateFormErrors = [];
            $passwordComplexityFormErrors = [];

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

            if (!empty($passwordValidityFormErrors) || !empty($passwordDuplicateFormErrors) || !empty($passwordComplexityFormErrors)) {
                $mergedErrors = array_merge($passwordValidityFormErrors, $passwordDuplicateFormErrors, $passwordComplexityFormErrors);
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