<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\Session\Container;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;

class MelisSetupController extends AbstractActionController
{
    public function setupFormAction()
    {


        $request = $this->getRequest();

        //startSetup button indicator
        $btnStatus = (bool) $request->getQuery()->get('btnStatus');

        $form = $this->getForm();
        $container = new Container('melis_modules_configuration_status');
        $formData = isset($container['formData']) ? (array) $container['formData'] : null;

        if ($formData) {
            $form->setData($formData);
        }

        $view = new ViewModel();
        $view->setTerminal(true);
        $view->setVariable('form', $form);
        $view->btnStatus = $btnStatus;

        return $view;

    }

    public function setupValidateDataAction()
    {
        $success = 0;
        $message = 'tr_install_setup_message_ko';
        $errors = [];

        $data = $this->getTool()->sanitizeRecursive($this->params()->fromRoute());

        $form = $this->getForm();
        $form->setData($data);

        if ($form->isValid()) {
            $success = 1;
            $message = 'tr_install_setup_message_ok';
        } else {
            $errors = $this->formatErrorMessage($form->getMessages());
        }


        $response = [
            'success' => $success,
            'message' => $this->getTool()->getTranslation($message),
            'errors' => $errors,
            'form' => 'melis_core_setup_user_form',
        ];

        return new JsonModel($response);
    }

    public function setupResultAction()
    {
        $success = 0;
        $message = 'tr_install_setup_message_ko';
        $errors = [];

        $data = $this->getTool()->sanitizeRecursive($this->params()->fromRoute());


        $form = $this->getForm();
        $form->setData($data);


        if ($form->isValid()) {

            $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
            $tableUser = $this->getServiceLocator()->get('MelisCoreTableUser');

            $userLogin = $form->get('login')->getValue();
            $userEmail = $form->get('email')->getValue();
            $password = $melisCoreAuth->encryptPassword($form->get('password')->getValue());
            $userFirstname = $form->get('firstname')->getValue();
            $userLastname = $form->get('lastname')->getValue();


            $container = new Container('melis_modules_configuration_status');
            $hasErrors = false;

            foreach ($container->getArrayCopy() as $module) {
                if (!$module) {
                    $hasErrors = true;
                }
            }

            if (false === $hasErrors) {

                try {

                    $tableUser->save([
                        'usr_status' => 1,
                        'usr_login' => $userLogin,
                        'usr_email' => $userEmail,
                        'usr_password' => $password,
                        'usr_firstname' => $userFirstname,
                        'usr_lastname' => $userLastname,
                        'usr_lang_id' => 1,
                        'usr_admin' => 1,
                        'usr_role_id' => 1,
                        'usr_rights' => '<?xml version="1.0" encoding="UTF-8"?><document type="MelisUserRights" author="MelisTechnology" version="2.0"><meliscms_pages>
	<id>-1</id>
</meliscms_pages>
<meliscore_interface>
</meliscore_interface>
<meliscore_leftmenu>
	<meliscore_toolstree_section>
	</meliscore_toolstree_section>
	<meliscms_toolstree_section>
	</meliscms_toolstree_section>
	<melismarketing_toolstree_section>
	</melismarketing_toolstree_section>
	<meliscommerce_toolstree_section>
	</meliscommerce_toolstree_section>
	<melisothers_toolstree_section>
	</melisothers_toolstree_section>
	<meliscustom_toolstree_section>
	</meliscustom_toolstree_section>
	<id>meliscore_leftmenu_root</id>
</meliscore_leftmenu>
</document>',

                    ]);

                    $installerSession = new Container('melisinstaller');
                    // save platforms
                    $melisCorePlatformTable = $this->getServiceLocator()->get('MelisCoreTablePlatform');
                    $defaultPlatform = getenv('MELIS_PLATFORM');
                    $platforms = isset($installerSession['environments']) ? $installerSession['environments'] : null;

                    $melisCorePlatformTable->save(['plf_name' => $defaultPlatform]);

                    if (isset($platforms['new'])) {
                        foreach ($platforms['new'] as $platform) {
                            $melisCorePlatformTable->save([
                                'plf_name' => $platform[0]['sdom_env'],
                                'plf_update_marketplace' => 1,
                            ]);
                        }
                    }


                    $success = 0;
                    $message = 'tr_install_setup_message_ok';

                } catch (\Exception $e) {
                    $errors = $e->getMessage();
                }


            }

        } else {
            $errors = $this->formatErrorMessage($form->getMessages());
        }

        $response = [
            'success' => $success,
            'message' => $this->getTool()->getTranslation($message),
            'errors' => $errors,
            'form' => 'melis_core_setup_user_form',
        ];

        return new JsonModel($response);

    }

    /**
     * Returns the Tool Service Class
     * @return MelisCoreTool
     */
    private function getTool()
    {
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('MelisCmsSlider', 'MelisCmsSlider_details');

        return $melisTool;

    }

    /**
     * Create a form from the configuration
     *
     * @param $formConfig
     *
     * @return \Zend\Form\ElementInterface
     */
    private function getForm()
    {
        $coreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $form = $coreConfig->getItem('melis_core_setup/forms/melis_core_setup_user_form');

        $factory = new \Zend\Form\Factory();
        $formElements = $this->serviceLocator->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $form = $factory->createForm($form);

        return $form;

    }

    private function formatErrorMessage($errors = [])
    {
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem('melis_core_setup/forms/melis_core_setup_user_form');
        $appConfigForm = $appConfigForm['elements'];

        foreach ($errors as $keyError => $valueError) {
            foreach ($appConfigForm as $keyForm => $valueForm) {
                if ($valueForm['spec']['name'] == $keyError &&
                    !empty($valueForm['spec']['options']['label'])) {
                    $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
                }
            }
        }

        return $errors;
    }
}
