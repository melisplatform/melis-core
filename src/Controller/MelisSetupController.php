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
use Zend\Validator\File\Size;
use Zend\Validator\File\IsImage;
use Zend\Validator\File\Upload;
use Zend\File\Transfer\Adapter\Http;
use Zend\Session\Container;

class MelisSetupController extends AbstractActionController
{
    public function setupFormAction()
    {
        $coreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $form = $coreConfig->getItem('melis_core_setup/forms/melis_installer_user_data');

        $request = $this->getRequest();

        //startSetup button indicator
        $btnStatus = (bool) $request->getQuery()->get('btnStatus');

        $view = new ViewModel();
        $view->form = $form;
        $view->setTerminal(true);
        $view->btnStatus = $btnStatus;
        return $view;

    }

    public function setupResultAction()
    {
        $success = 0;
        $message = 'tr_install_setup_message_ko';
        $title   = 'tr_install_setup_title';
        $errors  = array();

        $request = $this->getRequest();

        if($request->isPost()){

            //Services
            $melisCore     = $this->getServiceLocator()->get('MelisCoreTableUser');
            $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
            $tableUser     = $this->getServiceLocator()->get('MelisCoreTableUser');

            //FormData
            $userData = $request->getPost();
            if(!empty($userData)){

                $userLogin      = $userData->get('login');
                $userEmail      = $userData->get('email');
                $password       = $melisCoreAuth->encryptPassword($userData->get('password'));
                $userFirstname  = $userData->get('firstname');
                $userLastname   = $userData->get('lastname');

                //Save userData
                $tableUser->save(array(
                    'usr_status'        => 1,
                    'usr_login'         => $userLogin,
                    'usr_email'         => $userEmail,
                    'usr_password'      => $password,
                    'usr_firstname'     => $userFirstname,
                    'usr_lastname'      => $userLastname,
                    'usr_lang_id'       => 1,
                    'usr_admin'         => 0,
                    'usr_role_id'       => 1,
                    'usr_rights'        => '<?xml version="1.0" encoding="UTF-8"?><document type="MelisUserRights" author="MelisTechnology" version="2.0"><meliscms_pages>	<id>-1</id></meliscms_pages><meliscore_interface></meliscore_interface><meliscore_tools>	<id>meliscore_tools_root</id></meliscore_tools></document>',
                    'usr_creation_date' => date('Y-m-d H:i:s'),
                ));

                $success = 1;
                $message = 'tr_install_setup_message_ok';
            }

        }

        $response = array(
            'success' => $success,
            'message' => $this->getTool()->getTranslation($message),
            'errors'  => $errors
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
}