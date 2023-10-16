<?php
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use MelisCore\Service\MelisCoreCreatePasswordService;
use Laminas\View\Model\ViewModel;
use Laminas\View\Model\JsonModel;
use Laminas\Session\Container;
use Laminas\Form\Factory;
use MelisCore\Model\Hydrator\MelisResultSet;



/**
 * This class deals with User functionalities
 *
 */
class UserController extends MelisAbstractActionController
{
    const CONFIG_PATH = 'meliscore/datas';
    protected $_hash = '';
    
    /**
     * Rendering the Melis CMS interface
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderLostPasswordAction() 
    {

        $view = $this->forward()->dispatch('MelisCore\Controller\PluginView',
        array('action' => 'generate',
            'appconfigpath' => '/meliscore_lost_password',
            'keyview' => 'meliscore_lost_password'));

        $background = '';
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem('/meliscore_login');
        if (!empty($appConfigForm['datas']['login_background']))
            $background = $appConfigForm['datas']['login_background'];

        $this->layout()->addChild($view, 'content');
        $this->layout()->isLogin = 1;
        $this->layout()->login_background = $background;
        $this->layout()->schemes          = $this->getSchemes();
             
        return $view;
    }
    

    /**
     * Renders to the Lost Password form
     * @return \Laminas\View\Model\ViewModel
     */
    public function retrievePageAction()
    {
        
        $configPath = 'meliscore/datas';
        $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $cfg = $melisConfig->getItemPerPlatform($configPath);

        $pathAppConfigForm = '/meliscore/forms/meliscore_forgot';
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $melisLostPass = $this->getServiceManager()->get('MelisCoreLostPassword');
        $appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
        
        $factory = new \Laminas\Form\Factory();
        $forgotForm = $factory->createForm($appConfigForm);
        
        $translator = $this->getServiceManager()->get('translator');
        $this->getServiceManager()->get('ViewHelperManager')->get('HeadTitle')->set($translator->translate('tr_meliscore_forgot_page_title'));
        
        $view = new ViewModel();
        $view->setVariable('meliscore_forgot', $forgotForm);
        $view->setVariable('formFactory', $factory);
        $view->setVariable('formConfig', $appConfigForm);
        $this->layout()->schemes = $this->getSchemes();

        return $view;
    }
    
    /**
     * Processes the lost password request 
     * @return \Laminas\View\Model\JsonModel
     */
    public function lostPasswordRequestAction() 
    {
        $pathAppConfigForm = '/meliscore/forms/meliscore_forgot';
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
        $translator = $this->getServiceManager()->get('translator');
        
        $success = false;
        $errors  = array();
        $message = '';

        
        if($this->getRequest()->isPost())
        {
            $login = $this->getRequest()->getPost('usr_login');
            $email = $this->getRequest()->getPost('usr_email');
            
            $melisLostPass = $this->getServiceManager()->get('MelisCoreLostPassword');
            $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
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
     * @return \Laminas\View\Model\ViewModel
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
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem('/meliscore_login');
        if (!empty($appConfigForm['datas']['login_background']))
            $background = $appConfigForm['datas']['login_background'];
        
            
        $this->layout()->addChild($view, 'content');
        $this->layout()->isLogin = 1;
        $this->layout()->login_background = $background;
        $this->layout()->schemes = $this->getSchemes();

        return $view;
    }
    
    /**
     * Renders to the reset password view and process it after clicking the reset button
     * @return \Laminas\View\Model\ViewModel
     */
    public function resetPasswordAction() 
    {
        $pathAppConfigForm = '/meliscore/forms/meliscore_resetpass';
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
        $translator = $this->getServiceManager()->get('translator');

        $rhash = $this->getHash();
        $melisLostPass = $this->getServiceManager()->get('MelisCoreLostPassword');
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


        $factory = new \Laminas\Form\Factory();
        $forgotForm = $factory->createForm($appConfigForm);
        
        $translator = $this->getServiceManager()->get('translator');
        $this->getServiceManager()->get('ViewHelperManager')->get('HeadTitle')->set($translator->translate('tr_meliscore_reset_password_header') . ' - ');
        
        $view = new ViewModel();
        if($this->getRequest()->isPost())
        {
            
            $password = $this->getRequest()->getPost('usr_pass');
            $confirmPass = $this->getRequest()->getPost('usr_pass_confirm');
            $passValidator = new \MelisCore\Validator\MelisPasswordValidator();
            
                if(strlen($password) >= 8) {
                    // if(strlen($confirmPass) >= 8) {
                        //$passValidator = new \Laminas\Validator\Regex(array('pattern' => '/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[^\w\s]).{8,}$/'));
                        $passValidator = new \MelisCore\Validator\MelisPasswordValidator();
                        if($passValidator->isValid($password))
                        {
                            // password and confirm password matching
                            if($password == $confirmPass)
                            {
                                $melisLostPass->processUpdatePassword($rhash, $password);   
                                $textMessage = "tr_meliscore_user_password_change_succes";
                                $success = 1;

                                header( "location:/melis/login");
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
                    // }
                    // else {
                    //     $success = 0;
                    //     $textMessage = 'tr_meliscore_tool_user_usr_confirm_password_error_low';
                    // }// end confirm password length
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
        $view->rhash =  $rhash;
        $this->layout()->schemes = $this->getSchemes();

        return $view;
    }

    /**
     *
     * This will reset your old password with the new password
     *
     * @return JsonModel
     */
    public function resetOldPasswordAction()
    {
        $this->getEventManager()->trigger('meliscore_user_reset_old_password_start', $this, []);

        $pathAppConfigForm = '/meliscore/forms/meliscore_resetpass';
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
        $translator = $this->getServiceManager()->get('translator');
        $request = $this->getRequest();

        $postValues = $request->getPost()->toArray();
        $rhash = $postValues['rhash'] ?? null;
        $melisLostPass = $this->getServiceManager()->get('MelisCoreLostPassword');
        $hashExists = false;
        $textMessage = '';
        $success = false;
        $login = '';
        $data = array();
        if($melisLostPass->hashExists($rhash)) {
            $hashExists = true;
            $data = $melisLostPass->getPasswordRequestData($rhash);
            foreach($data as $val) {
                $login = $val->rh_login;
            }
        }

        $factory = new \Laminas\Form\Factory();
        $forgotForm = $factory->createForm($appConfigForm);

        $translator = $this->getServiceManager()->get('translator');
        $this->getServiceManager()->get('ViewHelperManager')->get('HeadTitle')->set($translator->translate('tr_meliscore_reset_password_header') . ' - ');

        $view = new ViewModel();

        if($this->getRequest()->isPost())
        {
            $password = $this->getRequest()->getPost('usr_pass');
            $confirmPass = $this->getRequest()->getPost('usr_pass_confirm');
            $passValidator = new \MelisCore\Validator\MelisPasswordValidatorWithConfig(['serviceManager' => $this->getServiceManager()]);

            // password and confirm password matching
            if ($password == $confirmPass) {
                $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
                $user = $userTable->getEntryByField('usr_login', $login)->current();
                $userId = $user->usr_id;

                $config = $this->getServiceManager()->get('MelisCoreConfig')->getItem('meliscore/datas/login');

                $passwordDuplicateCheckSuccessful = true;

                if ($config['password_duplicate_status'] == 1) {
                    if ($this->getServiceManager()->get('MelisCoreAuth')->isPasswordDuplicate($userId, $password, $config['password_duplicate_lifetime'])) {                                    
                        $textMessage = sprintf(
                            $translator->translate('tr_meliscore_tool_other_config_password_duplicate_has_been_used_previously'), 
                            $config['password_duplicate_lifetime']
                        );

                        $success = false;
                        $passwordDuplicateCheckSuccessful = false;
                    }
                }

                if ($passwordDuplicateCheckSuccessful) {
                    if ($passValidator->isValid($password)) {
                        $melisLostPass->processUpdatePassword($rhash, $password);
                        $textMessage = "tr_meliscore_user_password_change_succes";
                        $success = true;
                    } else {
                        $errorMessages = $passValidator->getMessages();

                        $textMessage = '<br>';
                        
                        foreach ($errorMessages as $message) {
                            $textMessage .= $message . "<br>";
                        }
                        
                        $success = false;
                    }
                }
            } else {
                $textMessage = 'tr_meliscore_tool_user_usr_password_not_match';
                $success = false;
            }
        }

        $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
        $user = $userTable->getEntryByField('usr_login', $login)->current();
        $userId = $user->usr_id;
        $password = $user->usr_password;

        $response = [];
        $response['success'] = $success;
        $response['datas']['usr_id'] = $userId;
        $response['datas']['usr_password'] = $password;
        
        $this->getEventManager()->trigger('meliscore_user_reset_old_password_end', $this, $response);

        $data = [
            'success' => $success,
            'message' => $translator->translate($textMessage)
        ];
        
        return new JsonModel($data);
    }

    /**
     * Rendering the Melis CMS interface
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderGeneratePasswordAction()
    {
        $this->setHashAction();

        $view = $this->forward()->dispatch('MelisCore\Controller\PluginView',
            array('action' => 'generate',
                'appconfigpath' => '/meliscore_generate_password',
                'keyview' => 'meliscore_generate_password',
            ));

        $background = '';
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem('/meliscore_login');
        if (!empty($appConfigForm['datas']['login_background']))
            $background = $appConfigForm['datas']['login_background'];

        $this->layout()->addChild($view, 'content');
        $this->layout()->isLogin = 1;
        $this->layout()->login_background = $background;
        $this->layout()->schemes = $this->getSchemes();

        return $view;
    }

    /**
     * Renders to the reset password view and process it after clicking the reset button
     * @return \Laminas\View\Model\ViewModel
     */
    public function generatePasswordAction()
    {
        $pathAppConfigForm = '/meliscore/forms/meliscore_generatepass';
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
        $translator = $this->getServiceManager()->get('translator');

        $rhash = $this->getHash();
        /** @var MelisCoreCreatePasswordService $melisCreatePass */
        $melisCreatePass = $this->getServiceManager()->get('MelisCoreCreatePassword');
        $hashExists = false;
        $textMessage = '';
        $success = 0;
        $login = '';
        $data = array();
        if($melisCreatePass->hashExists($rhash)) {
            $hashExists = true;
            $data = $melisCreatePass->getPasswordRequestData($rhash);
            foreach($data as $val) {
                $login = $val->mcp_login;
            }
        }

        $isRequestNotExpired = $melisCreatePass->isRequestExpired($login);
        $isUserExist = $melisCreatePass->isUserExist($login);

        $factory = new \Laminas\Form\Factory();
        $forgotForm = $factory->createForm($appConfigForm);

        $translator = $this->getServiceManager()->get('translator');
        $this->getServiceManager()->get('ViewHelperManager')->get('HeadTitle')->set($translator->translate('tr_meliscore_reset_password_header') . ' - ');

        $view = new ViewModel();
        if($this->getRequest()->isPost())
        {

            if($isUserExist && $isRequestNotExpired) {
                $password = $this->getRequest()->getPost('usr_pass');
                $confirmPass = $this->getRequest()->getPost('usr_pass_confirm');
                $passValidator = new \MelisCore\Validator\MelisPasswordValidator();

                if (strlen($password) >= 8) {
                    // if (strlen($confirmPass) >= 8) {
                        //$passValidator = new \Laminas\Validator\Regex(array('pattern' => '/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[^\w\s]).{8,}$/'));
                        $passValidator = new \MelisCore\Validator\MelisPasswordValidator();
                        if ($passValidator->isValid($password)) {
                            // password and confirm password matching
                            if ($password == $confirmPass) {
                                $melisCreatePass->processUpdatePassword($rhash, $password);
                                $textMessage = "tr_meliscore_user_password_change_succes";
                                $success = 1;
                                header("location:/melis/login");
                            } else {
                                $success = 0;
                                $textMessage = 'tr_meliscore_tool_user_usr_password_not_match';
                            } // password and confirm password matching
                        } else {
                            $success = 0;
                            $textMessage = 'tr_meliscore_tool_user_usr_password_regex_not_match';
                        } // password regex validator
                    // } else {
                    //     $success = 0;
                    //     $textMessage = 'tr_meliscore_tool_user_usr_confirm_password_error_low';
                    // }// end confirm password length
                } else {
                    $success = 0;
                    $textMessage = 'tr_meliscore_tool_user_usr_password_error_low';
                }// end password length
            }
            else {
                $success = 0;
                $textMessage = 'tr_meliscore_tool_user_password_request_invalid';
            }// end confirm if link is valid
        }


        $view->setVariable('meliscore_resetpass', $forgotForm);
        $view->setVariable('formFactory', $factory);
        $view->setVariable('formConfig', $appConfigForm);
        $view->hashExists = $hashExists;
        $view->message = $translator->translate($textMessage);
        $view->success = $success;
        $view->isRequestNotExpired = $isRequestNotExpired;
        $view->isUserExist = $isUserExist;
        $view->rhash =  $rhash;
        $this->layout()->schemes = $this->getSchemes();

        return $view;
    }

    /**
     * Rendering the Melis CMS interface
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderRenewPasswordAction()
    {
        $this->setHashAction();

        $view = $this->forward()->dispatch('MelisCore\Controller\PluginView',
            array('action' => 'generate',
                'appconfigpath' => '/meliscore_renew_password',
                'keyview' => 'meliscore_renew_password',
            ));

        $background = '';
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem('/meliscore_login');
        if (!empty($appConfigForm['datas']['login_background']))
            $background = $appConfigForm['datas']['login_background'];

        $this->layout()->addChild($view, 'content');
        $this->layout()->isLogin = 1;
        $this->layout()->login_background = $background;
        $this->layout()->schemes = $this->getSchemes();

        return $view;
    }

    /**
     * Renders to the renew password view and process it after clicking the submit button
     * @return \Laminas\View\Model\ViewModel
     */
    public function renewPasswordAction()
    {
        $pathAppConfigForm = '/meliscore/forms/meliscore_renewpass';
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
        $translator = $this->getServiceManager()->get('translator');

        $rhash = $this->getHash();
        /** @var MelisCoreCreatePasswordService $melisCreatePass */
        $melisCreatePass = $this->getServiceManager()->get('MelisCoreCreatePassword');
        $hashExists = false;
        $textMessage = '';
        $success = 0;
        $login = '';
        $data = array();
        if($melisCreatePass->hashExists($rhash)) {
            $hashExists = true;
            $data = $melisCreatePass->getPasswordRequestData($rhash);
            foreach($data as $val) {
                $login = $val->mcp_login;
            }
        }

        $isRequestNotExpired = $melisCreatePass->isRequestExpired($login);
        $isUserExist = $melisCreatePass->isUserExist($login);

        $factory = new \Laminas\Form\Factory();
        $forgotForm = $factory->createForm($appConfigForm);

        $translator = $this->getServiceManager()->get('translator');
        $this->getServiceManager()->get('ViewHelperManager')->get('HeadTitle')->set($translator->translate('tr_meliscore_reset_password_header') . ' - ');

        $view = new ViewModel();
        if($this->getRequest()->isPost())
        {

            if($isUserExist && $isRequestNotExpired) {
                $password = $this->getRequest()->getPost('usr_pass');
                $confirmPass = $this->getRequest()->getPost('usr_pass_confirm');
                $passValidator = new \MelisCore\Validator\MelisPasswordValidator();

                if (strlen($password) >= 8) {
                    // if (strlen($confirmPass) >= 8) {
                        //$passValidator = new \Laminas\Validator\Regex(array('pattern' => '/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[^\w\s]).{8,}$/'));
                        $passValidator = new \MelisCore\Validator\MelisPasswordValidator();
                        if ($passValidator->isValid($password)) {
                            // password and confirm password matching
                            if ($password == $confirmPass) {
                                $melisCreatePass->processUpdatePassword($rhash, $password);
                                $textMessage = "tr_meliscore_user_password_change_succes";
                                $success = 1;
                                header("location:/melis/login");
                            } else {
                                $success = 0;
                                $textMessage = 'tr_meliscore_tool_user_usr_password_not_match';
                            } // password and confirm password matching
                        } else {
                            $success = 0;
                            $textMessage = 'tr_meliscore_tool_user_usr_password_regex_not_match';
                        } // password regex validator
                    // } else {
                    //     $success = 0;
                    //     $textMessage = 'tr_meliscore_tool_user_usr_confirm_password_error_low';
                    // }// end confirm password length
                } else {
                    $success = 0;
                    $textMessage = 'tr_meliscore_tool_user_usr_password_error_low';
                }// end password length
            }
            else {
                $success = 0;
                $textMessage = 'tr_meliscore_tool_user_password_request_invalid';
            }// end confirm if link is valid
        }

        $config = $this->getServiceManager()->get('MelisCoreConfig')->getItem('meliscore/datas/login');

        $view->setVariable('meliscore_renewpass', $forgotForm);
        $view->setVariable('formFactory', $factory);
        $view->setVariable('formConfig', $appConfigForm);
        $view->setVariable('passwordValidityLifetime', $config['password_validity_lifetime']);
        $view->hashExists = $hashExists;
        $view->message = $translator->translate($textMessage);
        $view->success = $success;
        $view->isRequestNotExpired = $isRequestNotExpired;
        $view->isUserExist = $isUserExist;
        $view->rhash =  $rhash;
        $this->layout()->schemes = $this->getSchemes();

        return $view;
    }

    /**
     *
     * This will create password for the new user
     *
     * @return JsonModel
     */
    public function createPasswordAction()
    {
        $this->getEventManager()->trigger('meliscore_user_create_password_start', $this, []);

        $pathAppConfigForm = '/meliscore/forms/meliscore_generatepass';
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
        $translator = $this->getServiceManager()->get('translator');

        $postValues = $this->getRequest()->getPost()->toArray();
        $rhash = $postValues['rhash'] ?? null;
        /** @var MelisCoreCreatePasswordService $melisCreatePwdSvc */
        $melisCreatePwdSvc = $this->getServiceManager()->get('MelisCoreCreatePassword');
        $hashExists = false;
        $textMessage = '';
        $success = false;
        $login = '';
        $data = array();
        if($melisCreatePwdSvc->hashExists($rhash)) {
            $hashExists = true;
            $data = $melisCreatePwdSvc->getPasswordRequestData($rhash);
            foreach($data as $val) {
                $login = $val->mcp_login;
            }
        }

        $factory = new \Laminas\Form\Factory();
        $forgotForm = $factory->createForm($appConfigForm);

        $translator = $this->getServiceManager()->get('translator');
        $this->getServiceManager()->get('ViewHelperManager')->get('HeadTitle')->set($translator->translate('tr_meliscore_reset_password_header') . ' - ');

        $isRequestNotExpired = $melisCreatePwdSvc->isRequestExpired($login);
        $isUserExist = $melisCreatePwdSvc->isUserExist($login);

        $view = new ViewModel();
        if($this->getRequest()->isPost())
        {
            $password = $this->getRequest()->getPost('usr_pass');
            $confirmPass = $this->getRequest()->getPost('usr_pass_confirm');
            $passValidator = new \MelisCore\Validator\MelisPasswordValidatorWithConfig(['serviceManager' => $this->getServiceManager()]);
            
            if($isRequestNotExpired && $isUserExist) {
                if ($password == $confirmPass) {
                    $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
                    $user = $userTable->getEntryByField('usr_login', $login)->current();
                    $userId = $user->usr_id;

                    $config = $this->getServiceManager()->get('MelisCoreConfig')->getItem('meliscore/datas/login');

                    $passwordDuplicateCheckSuccessful = true;

                    if ($config['password_duplicate_status'] == 1) {
                        if ($this->getServiceManager()->get('MelisCoreAuth')->isPasswordDuplicate($userId, $password, $config['password_duplicate_lifetime'])) {                                    
                            $textMessage = sprintf(
                                $translator->translate('tr_meliscore_tool_other_config_password_duplicate_has_been_used_previously'), 
                                $config['password_duplicate_lifetime']
                            );
    
                            $success = false;
                            $passwordDuplicateCheckSuccessful = false;
                        }
                    } 

                    if ($passwordDuplicateCheckSuccessful) {
                        if ($passValidator->isValid($password)) {
                            $melisCreatePwdSvc->processUpdatePassword($rhash, $password);
                            $textMessage = "tr_meliscore_user_password_change_succes";
                            $success = true;
                        } else {
                            $errorMessages = $passValidator->getMessages();

                            $textMessage = '<br>';
                        
                            foreach ($errorMessages as $message) {
                                $textMessage .= $message . "<br>";
                            }
                            
                            $success = false;
                        }
                    }
                } else {
                    $textMessage = 'tr_meliscore_tool_user_usr_password_not_match';
                    $success = false;
                }
            }
            else {
                $success = false;
                $textMessage = 'tr_meliscore_tool_user_password_request_invalid';
            }// end confirm if link is valid
        }
        
        $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
        $user = $userTable->getEntryByField('usr_login', $login)->current();
        $userId = $user->usr_id;
        $password = $user->usr_password;

        $response = [];
        $response['success'] = $success;
        $response['datas']['usr_id'] = $userId;
        $response['datas']['usr_password'] = $password;

        $this->getEventManager()->trigger('meliscore_user_create_password_end', $this, $response);
        
        $data = [
            'success' => $success,
            'message' => $translator->translate($textMessage)
        ];
        return new JsonModel($data);
    }

    /**
     * Renders the header for the user password configuration tab.
     *
     * @return ViewModel The view model for rendering the header.
     */
    public function renderTabsUserPasswordHeaderAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

    /**
     * Renders the content for the user password configuration tab.
     *
     * @return ViewModel The view model for rendering the content.
     */
    public function renderTabsUserPasswordContentAction()
	{
		$melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
		
        $factory = new Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');
        $factory->setFormElementManager($formElements);

        $loginAccountLockConfigForm = $melisCoreConfig->getFormMergedAndOrdered('meliscore/forms/meliscore_other_config_login_account_lock_form', 'meliscore_other_config_login_account_lock_form');
        $loginAccountLockForm = $factory->createForm($loginAccountLockConfigForm);

        $passwordValidityConfigForm = $melisCoreConfig->getFormMergedAndOrdered('meliscore/forms/meliscore_other_config_password_validity_form', 'meliscore_other_config_password_validity_form');
        $passwordValidityForm = $factory->createForm($passwordValidityConfigForm);

        $passwordDuplicateConfigForm = $melisCoreConfig->getFormMergedAndOrdered('meliscore/forms/meliscore_other_config_password_duplicate_form', 'meliscore_other_config_password_duplicate_form');
        $passwordDuplicateForm = $factory->createForm($passwordDuplicateConfigForm);

        $passwordComplexityConfigForm = $melisCoreConfig->getFormMergedAndOrdered('meliscore/forms/meliscore_other_config_password_complexity_form', 'meliscore_other_config_password_complexity_form');
        $passwordComplexityForm = $factory->createForm($passwordComplexityConfigForm);
        
		$file = $_SERVER['DOCUMENT_ROOT'] . '/../vendor/melisplatform/melis-core/config/app.login.php';

        if (file_exists($file)) {
            $config = $this->getServiceManager()->get('MelisCoreConfig')->getItem('meliscore/datas/login');

        }

        $loginAccountLockData = new MelisResultSet();

        if (isset($config['login_account_lock_status'])) {
            $loginAccountLockData->login_account_lock_status = $config['login_account_lock_status'];
        }
        
        if (isset($config['login_account_admin_email'])) {
            $loginAccountLockData->login_account_admin_email = $config['login_account_admin_email'];
        }

        if (isset($config['login_account_lock_number_of_attempts'])) {
            $loginAccountLockData->login_account_lock_number_of_attempts = $config['login_account_lock_number_of_attempts'];
        }

        if (isset($config['login_account_type_of_lock'])) {
            $loginAccountLockData->login_account_type_of_lock = $config['login_account_type_of_lock'];
        }

        if (isset($config['login_account_duration_days'])) {
            $loginAccountLockData->login_account_duration_days = $config['login_account_duration_days'];
        }

        if (isset($config['login_account_duration_hours'])) {
            $loginAccountLockData->login_account_duration_hours = $config['login_account_duration_hours'];
        }

        if (isset($config['login_account_duration_minutes'])) {
            $loginAccountLockData->login_account_duration_minutes = $config['login_account_duration_minutes'];
        }

        $passwordValidityData = new MelisResultSet();

        if (isset($config['password_validity_status'])) {
            $passwordValidityData->password_validity_status = $config['password_validity_status'];
        }

        if (isset($config['password_duplicate_lifetime'])) {
            $passwordValidityData->password_validity_lifetime = $config['password_validity_lifetime'];
        }

        $passwordDuplicateData = new MelisResultSet();

        if (isset($config['password_duplicate_status'])) {
            $passwordDuplicateData->password_duplicate_status = $config['password_duplicate_status'];
        }

        if (isset($config['password_duplicate_lifetime'])) {
            $passwordDuplicateData->password_duplicate_lifetime = $config['password_duplicate_lifetime'];
        }

        $passwordComplexityData = new MelisResultSet();

        if (isset($config['password_complexity_number_of_characters'])) {
            $passwordComplexityData->password_complexity_number_of_characters = $config['password_complexity_number_of_characters'];
        }

        if (isset($config['password_complexity_use_special_characters'])) {
            $passwordComplexityData->password_complexity_use_special_characters = $config['password_complexity_use_special_characters'];
        }

        if (isset($config['password_complexity_use_lower_case'])) {
            $passwordComplexityData->password_complexity_use_lower_case = $config['password_complexity_use_lower_case'];
        }

        if (isset($config['password_complexity_use_upper_case'])) {
            $passwordComplexityData->password_complexity_use_upper_case = $config['password_complexity_use_upper_case'];
        }

        if (isset($config['password_complexity_use_digit'])) {
            $passwordComplexityData->password_complexity_use_digit = $config['password_complexity_use_digit'];
        }
        
        $loginAccountLockForm->bind($loginAccountLockData);
        $passwordValidityForm->bind($passwordValidityData);
        $passwordDuplicateForm->bind($passwordDuplicateData);
        $passwordComplexityForm->bind($passwordComplexityData);

		$melisKey = $this->params()->fromRoute('melisKey', '');
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		$view->loginAccountLockForm = $loginAccountLockForm;
		$view->passwordValidityForm = $passwordValidityForm;
		$view->passwordDuplicateForm = $passwordDuplicateForm;
		$view->passwordComplexityForm = $passwordComplexityForm;
        
		return $view;
	}
    
    protected function recoverHashAction() {
        $hash = $this->params()->fromRoute('rhash', $this->params()->fromQuery('rhash',''));
        $this->_hash = $hash;
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

    private function getSchemes()
    {
        $schemeSvc  = $this->getServiceManager()->get('MelisCorePlatformSchemeService');
        $schemeData = $schemeSvc->getCurrentScheme();

        return $schemeData;
    }

    /**
     * Renders the main tab for user password configuration.
     *
     * @return ViewModel The view model for rendering the main tab.
     */
    public function renderUserLoginTabsMainAction()
    {
        $filePermissionErrors = [];

        $module = $_SERVER['DOCUMENT_ROOT'] . '/../vendor/melisplatform/melis-core';
        $configFile = $module . '/config/app.login.php';
        
        if (!is_writable($module)) {
            $filePermissionErrors[] = 'tr_meliscore_tool_other_config_password_config_file_permission_module';
        }

        if (!is_writable($configFile)) {
            $filePermissionErrors[] = 'tr_meliscore_tool_other_config_password_config_file_permission_config';
        }

        $view = new ViewModel();
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $view->melisKey = $melisKey;

        if (!empty($filePermissionErrors)) {
            $view->filePermissionErrors = $filePermissionErrors;
        }

        return $view;
    }
}
