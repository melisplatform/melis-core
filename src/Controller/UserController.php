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
        $pathAppConfigForm = '/meliscore/forms/meliscore_resetpass';
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
        $translator = $this->getServiceManager()->get('translator');

        $postValues = get_object_vars($this->getRequest()->getPost());
        $rhash = $postValues['rhash'] ?? null;
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


        $view->setVariable('meliscore_renewpass', $forgotForm);
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
     *
     * This will create password for the new user
     *
     * @return JsonModel
     */
    public function createPasswordAction()
    {
        $pathAppConfigForm = '/meliscore/forms/meliscore_generatepass';
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
        $translator = $this->getServiceManager()->get('translator');

        $postValues = get_object_vars($this->getRequest()->getPost());
        $rhash = $postValues['rhash'] ?? null;
        /** @var MelisCoreCreatePasswordService $melisCreatePwdSvc */
        $melisCreatePwdSvc = $this->getServiceManager()->get('MelisCoreCreatePassword');
        $hashExists = false;
        $textMessage = '';
        $success = 0;
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
            $passValidator = new \MelisCore\Validator\MelisPasswordValidator();

            if($isRequestNotExpired && $isUserExist) {
                if (strlen($password) >= 8) {
                    // if (strlen($confirmPass) >= 8) {
                        //$passValidator = new \Laminas\Validator\Regex(array('pattern' => '/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[^\w\s]).{8,}$/'));
                        $passValidator = new \MelisCore\Validator\MelisPasswordValidator();
                        if ($passValidator->isValid($password)) {
                            // password and confirm password matching
                            if ($password == $confirmPass) {
                                $melisCreatePwdSvc->processUpdatePassword($rhash, $password);
                                $textMessage = "tr_meliscore_user_password_change_succes";
                                $success = 1;
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

        $data = [
            'success' => $success,
            'message' => $translator->translate($textMessage)
        ];
        return new JsonModel($data);
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


}
