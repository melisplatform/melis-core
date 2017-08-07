<?php
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;

/**
 * This class deals with User functionalities
 *
 */
class UserController extends AbstractActionController
{
    const CONFIG_PATH = 'meliscore/datas';
    protected $_hash = '';
    
    /**
     * Rendering the Melis CMS interface
     * @return \Zend\View\Model\ViewModel
     */
    public function renderLostPasswordAction() 
    {

        $view = $this->forward()->dispatch('MelisCore\Controller\PluginView',
            array('action' => 'generate',
                'appconfigpath' => '/meliscore_lost_password',
                'keyview' => 'meliscore_lost_password'));
            
            $background = '';
            $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
            $appConfigForm = $melisMelisCoreConfig->getItem('/meliscore_login');
            if (!empty($appConfigForm['datas']['login_background']))
                $background = $appConfigForm['datas']['login_background'];
            
            $this->layout()->addChild($view, 'content');
            $this->layout()->isLogin = 1;
            $this->layout()->login_background = $background;
             
        return $view;
    }
    

    /**
     * Renders to the Lost Password form
     * @return \Zend\View\Model\ViewModel
     */
    public function retrievePageAction()
    {
        
        $configPath = 'meliscore/datas';
        $melisConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $cfg = $melisConfig->getItemPerPlatform($configPath);

        $pathAppConfigForm = '/meliscore/forms/meliscore_forgot';
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $melisLostPass = $this->getServiceLocator()->get('MelisCoreLostPassword');
        $appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
        
        $factory = new \Zend\Form\Factory();
        $forgotForm = $factory->createForm($appConfigForm);
        
        $translator = $this->getServiceLocator()->get('translator');
        $this->getServiceLocator()->get('ViewHelperManager')->get('HeadTitle')->set($translator->translate('tr_meliscore_forgot_page_title'));
        
        $view = new ViewModel();
        $view->setVariable('meliscore_forgot', $forgotForm);
        $view->setVariable('formFactory', $factory);
        $view->setVariable('formConfig', $appConfigForm);
        return $view;
    }
    
    /**
     * Processes the lost password request 
     * @return \Zend\View\Model\JsonModel
     */
    public function lostPasswordRequestAction() 
    {
        $pathAppConfigForm = '/meliscore/forms/meliscore_forgot';
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
        $translator = $this->getServiceLocator()->get('translator');
        
        $success = false;
        $errors  = array();
        $message = '';

        
        if($this->getRequest()->isPost())
        {
            $login = $this->getRequest()->getPost('usr_login');
            $email = $this->getRequest()->getPost('usr_email');
            
            $melisLostPass = $this->getServiceLocator()->get('MelisCoreLostPassword');
            $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
            $userData = $userTable->getDataByLoginAndEmail($login, $email);
            $userData = $userData->current();
            
            if($userData) 
            {
                if($melisLostPass->userExists($login))
                {
                    $success = $melisLostPass->addLostPassRequest($login, $email);
                    if($success)
                    {
                        $message = $translator->translate('tr_meliscore_email_lost_password_request_success');
                    }
                    else
                    {
                        $message = $translator->translate('tr_meliscore_email_lost_password_request_failed');
                    }
                }
                else
                {
                    $message = $translator->translate('tr_meliscore_email_lost_password_request_failed');
                }
            }
            else 
            {
                $success = false;
                $message = $translator->translate('tr_meliscore_email_failed');
            }
        }
        
        return new JsonModel(array('success' => $success, 'message' => $message));
    }
    
    /**
     * Rendering the Melis CMS interface
     * @return \Zend\View\Model\ViewModel
     */
    public function renderResetPasswordAction()
    {
        $rhash = $this->params()->fromRoute('rhash', null);
        $view = $this->forward()->dispatch('MelisCore\Controller\PluginView',
            array('action' => 'generate',
                'appconfigpath' => '/meliscore_reset_password',
                'keyview' => 'meliscore_reset_password',
            ));
        
        $background = '';
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem('/meliscore_login');
        if (!empty($appConfigForm['datas']['login_background']))
            $background = $appConfigForm['datas']['login_background'];
        
            
        $this->layout()->addChild($view, 'content');
        $this->layout()->isLogin = 1;
        $this->layout()->login_background = $background;

        return $view;
    }
    
    /**
     * Renders to the reset password view and process it after clicking the reset button
     * @return \Zend\View\Model\ViewModel
     */
    public function resetPasswordAction() 
    {
        $pathAppConfigForm = '/meliscore/forms/meliscore_resetpass';
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
        $translator = $this->getServiceLocator()->get('translator');

        $rhash = $this->getHash();
        $melisLostPass = $this->getServiceLocator()->get('MelisCoreLostPassword');
        $hashExists = false;
        $textMessage = '';
        $success = 0;
        $login = '';
        $data = array();
        if($melisLostPass->hashExists($rhash)) {
            $hashExists = true;
            $data = $melisLostPass->getPasswordRequestData($rhash);
            foreach($data as $val) {
                $login = $val->rh_login;
            }
        }


        $factory = new \Zend\Form\Factory();
        $forgotForm = $factory->createForm($appConfigForm);
        
        $translator = $this->getServiceLocator()->get('translator');
        $this->getServiceLocator()->get('ViewHelperManager')->get('HeadTitle')->set($translator->translate('tr_meliscore_reset_password_header') . ' - ');
        
        $view = new ViewModel();
        if($this->getRequest()->isPost())
        {
            
            $password = $this->getRequest()->getPost('usr_pass');
            $confirmPass = $this->getRequest()->getPost('usr_pass_confirm');
            $passValidator = new \MelisCore\Validator\MelisPasswordValidator();
            
                if(strlen($password) >= 8) {
                    if(strlen($confirmPass) >= 8) {
                        //$passValidator = new \Zend\Validator\Regex(array('pattern' => '/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[^\w\s]).{8,}$/'));
                        $passValidator = new \MelisCore\Validator\MelisPasswordValidator();
                        if($passValidator->isValid($password))
                        {
                            // password and confirm password matching
                            if($password == $confirmPass)
                            {
                                $melisLostPass->processUpdatePassword($rhash, $password);
                                $textMessage = "tr_meliscore_user_password_change_succes";
                                $success = 1;
                                header( "refresh:3;url=/melis/login");
                            }
                            else
                            {
                                $success = 0;
                                $textMessage = 'tr_meliscore_tool_user_usr_password_not_match';
                            } // password and confirm password matching
                        }
                        else {
                                $success = 0;
                                $textMessage = 'tr_meliscore_tool_user_usr_password_regex_not_match';
                        } // password regex validator
                    }
                    else {
                        $success = 0;
                        $textMessage = 'tr_meliscore_tool_user_usr_confirm_password_error_low';
                    }// end confirm password length
                }
                else {
                    $success = 0;
                    $textMessage = 'tr_meliscore_tool_user_usr_password_error_low';
                }// end password length
        }
        
        
        $view->setVariable('meliscore_resetpass', $forgotForm);
        $view->setVariable('formFactory', $factory);
        $view->setVariable('formConfig', $appConfigForm);
        $view->hashExists = $hashExists;
        $view->message = $translator->translate($textMessage);
        $view->success = $success;

        return $view;
    }
    
    
    /**
     * Retrieves the passed hash 
     */
    protected function setHashAction() {
        $hash = $this->params()->fromRoute('rhash', $this->params()->fromQuery('rhash',''));
        $this->_hash = $hash;
    }
    
    /**
     * Stores the hash value so resetPasswordAction function can use it
     * @return string|mixed
     */
    protected function getHash() 
    {
        return $this->_hash;
    }
}
