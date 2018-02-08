<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Zend\Session\Container;
class MelisSetupController extends AbstractActionController
{
    public function setupFormAction()
    {
		
		

        $request = $this->getRequest();

        //startSetup button indicator
        $btnStatus = (bool) $request->getQuery()->get('btnStatus');
		
		$form 		= $this->getForm();
		$container  = new Container('melis_modules_configuration_status');
		$formData 	= isset($container['formData']) ? (array) $container['formData'] : null;

		if($formData)
		    $form->setData($formData);

        $view = new ViewModel();
        $view->setTerminal(true);
        $view->setVariable('form' , $form);
        $view->btnStatus = $btnStatus;
        return $view;

    }
	
	public function setupValidateDataAction()
	{
		$success = 0;
        $message = 'tr_install_setup_message_ko';
        $errors  = array();
		
		$data = $this->getTool()->sanitizeRecursive($this->params()->fromRoute());
		
		$form = $this->getForm();
        $form->setData($data);
		
		if($form->isValid()) {
			$success = 1;
			$message = 'tr_install_setup_message_ok';
		}
		else {
			$errors = $this->formatErrorMessage($form->getMessages());
		}
		
		
		$response = array(
            'success' => $success,
            'message' => $this->getTool()->getTranslation($message),
            'errors'  => $errors,
            'form'    => 'melis_core_setup_user_form'
        );

        return new JsonModel($response);
	}

    public function setupResultAction()
    {
        $success = 0;
        $message = 'tr_install_setup_message_ko';
        $errors  = array();

        $data = $this->getTool()->sanitizeRecursive($this->params()->fromRoute());


        $form = $this->getForm();
        $form->setData($data);


        if($form->isValid()) {

            $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
            $tableUser     = $this->getServiceLocator()->get('MelisCoreTableUser');

            $userLogin      = $form->get('login')->getValue();
            $userEmail      = $form->get('email')->getValue();
            $password       = $melisCoreAuth->encryptPassword($form->get('password')->getValue());
            $userFirstname  = $form->get('firstname')->getValue();
            $userLastname   = $form->get('lastname')->getValue();


            $container = new Container('melis_modules_configuration_status');
            $hasErrors = false;

            foreach($container->getArrayCopy() as $module) {
                if(!$module)
                    $hasErrors = true;
            }

            if(false === $hasErrors) {

                try {
                    $tableUser->save(array(
                        'usr_status'        => 1,
                        'usr_login'         => $userLogin,
                        'usr_email'         => $userEmail,
                        'usr_password'      => $password,
                        'usr_firstname'     => $userFirstname,
                        'usr_lastname'      => $userLastname,
                        'usr_lang_id'       => 1,
                        'usr_admin'         => 1,
                        'usr_role_id'       => 1,
                        'usr_rights'        => '<?xml version="1.0" encoding="UTF-8"?><document type="MelisUserRights" author="MelisTechnology" version="2.0"><meliscms_pages> <id>-1</id></meliscms_pages><meliscore_interface></meliscore_interface><meliscore_tools> <id>meliscore_tools_root</id></meliscore_tools></document>',
                   
                    ));

                    // save platforms
                    $melisCorePlatformTable = $this->getServiceLocator()->get('MelisCoreTablePlatform');
                    $defaultPlatform = getenv('MELIS_PLATFORM');
                    $platforms       = isset($container['platforms']) ? $container['platforms'] :null;

                    $melisCorePlatformTable->save(array('plf_name' => $defaultPlatform));

                    if($platforms) {
                        foreach($platforms as $platform) {
                            $melisCorePlatformTable->save($platform);
                        }
                    }

                    $success = 1;
                    $message = 'tr_install_setup_message_ok';

                }catch(\Exception $e) {
                    $errors = $e->getMessage();
                }


            }

        }
        else {
            $errors = $this->formatErrorMessage($form->getMessages());
        }

        $response = array(
            'success' => $success,
            'message' => $this->getTool()->getTranslation($message),
            'errors'  => $errors,
            'form'    => 'melis_core_setup_user_form'
        );

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
     * @param $formConfig
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

    private function formatErrorMessage($errors = array())
    {
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem('melis_core_setup/forms/melis_core_setup_user_form');
        $appConfigForm = $appConfigForm['elements'];

        foreach ($errors as $keyError => $valueError)
        {
            foreach ($appConfigForm as $keyForm => $valueForm)
            {
                if ($valueForm['spec']['name'] == $keyError &&
                    !empty($valueForm['spec']['options']['label']))
                    $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
            }
        }

        return $errors;
    }
}