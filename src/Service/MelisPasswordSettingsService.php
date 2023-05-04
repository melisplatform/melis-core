<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use MelisCore\Service\MelisGeneralService;
use MelisCommerce\Service\MelisComGeneralService;

class MelisPasswordSettingsService extends MelisComGeneralService
{
    public function saveItem($passwordSettingsData, $id = null)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $arrayParameters = $this->sendEvent('password_settings_service_save_item_start', $arrayParameters);
        
        if ($passwordSettingsData) {
            $success = '';
            $textTitle = 'Other config';
            $textMessage = '';
            $errors = [];

            $melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
            $formElements = $this->getServiceManager()->get('FormElementManager');
            $translator = $this->getServiceManager()->get('translator');

            $factory = new \Laminas\Form\Factory();
            $factory->setFormElementManager($formElements);

            $appConfigForm = $melisCoreConfig->getItem('meliscore/forms/meliscore_other_config_password_form');
            $passwordForm = $factory->createForm($appConfigForm);
            
            if (empty($passwordSettingsData['password_validity_status'])) {
                $passwordForm->getInputFilter()->remove('password_validity_lifetime');
            }
            
            $passwordForm->setData($passwordSettingsData);

            if ($passwordForm->isValid()) {
                $success = 1;
                $textMessage = $translator->translate('tr_meliscore_tool_other_config_create_success');
                

                $file = $_SERVER['DOCUMENT_ROOT'] . '/../vendor/melisplatform/melis-core/config/app.login.php';

                if (file_exists($file)) {
                    $configFolder = $_SERVER['DOCUMENT_ROOT'] . '/../vendor/melisplatform/melis-core/config/';
                    chown($configFolder, 'www-data');
                    chmod($file, 0777);
                    $configFactory = new \Laminas\Config\Factory();
                    $configFactory->toFile($file, $passwordSettingsData);
                }
            } else {
                $success = 0;
                $textMessage = 'Unable to save';
                $errors = $passwordForm->getMessages();

                foreach ($errors as $keyError => $valueError){
                    $errors[$keyError]['label'] = $translator->translate('tr_meliscore_tool_other_config_label_' . $keyError);
                }
            }
        }

        $arrayParameters['result'] = [
            'success' => $success,
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'errors' => $errors
        ];

        $arrayParameters = $this->sendEvent('password_settings_service_save_item_end', $arrayParameters);

        return $arrayParameters['result'];
    }
}