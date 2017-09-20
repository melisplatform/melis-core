<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Zend\Session\Container;

/**
 * This class renders User Profile Management
 */
class UserProfileController extends AbstractActionController
{
    
    const TOOL_KEY = 'meliscore_user_profile_management';
    
    /**
     * Function to render the user profile
     * @return \Zend\View\Model\ViewModel
     */
    public function renderUserProfileAction()
    {
        $melisKey = $this->getMelisKey();

        $view = new ViewModel();
        $view->melisKey = $melisKey;

        return $view;
    }
    
    /**
     * Function to render user profile right side view
     * @return \Zend\View\Model\ViewModel
     */
    public function renderUserProfileRightAction()
    {
        $melisKey = $this->getMelisKey();
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        
        return $view;
    }
    
    /**
     * Function to render user profile tabs on right side view
     * @return \Zend\View\Model\ViewModel
     */
    public function renderUserProfileTabsAction()
    {
        $melisKey = $this->getMelisKey();
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        
        return $view;
    }
    
    /**
     * Function to render user profile left side view
     * @return \Zend\View\Model\ViewModel
     */
    public function renderUserProfileLeftAction()
    {
        $melisKey = $this->getMelisKey();
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        //get the user data
        $uInfo = $this->getCurrentUserInfo(true);
        $data = array();
        
        //loop through each data to return and display the user informations
        foreach($uInfo AS $key=>$val)
        {
           array_push($data, array(
                                    'usr_image'         =>  $uInfo[$key]['usr_image'],
                                    'usr_name'          =>  $uInfo[$key]['usr_firstname']." ".$uInfo[$key]['usr_lastname'],
                                    'usr_login'         =>  $uInfo[$key]['usr_login'],
                                    'usr_email'         =>  $uInfo[$key]['usr_email'],
                                    'usr_creation_date' =>  date("M d, Y" , strtotime($uInfo[$key]['usr_creation_date'])),
                                    'usr_role'          =>  $uInfo[$key]['usr_role'],
                                  )); 
        }
        
        $view->userInfo = $data;
        
        return $view;
    }
    
    /**
     * Function to render user form
     * @return \Zend\View\Model\ViewModel
     */
    public function renderUserProfileFormAction()
    {
        //get the melisKey
        $melisKey = $this->getMelisKey();
        
        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        
        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey('meliscore', $this::TOOL_KEY);
        //prepare the user profile form
        $form = $melisTool->getForm('meliscore_user_profile_form');
        //make the usr_image field hidden (where just going to trigger the file input on user image click)
        $form->get('usr_image')->setAttribute('style', 'display:none');
        //set the data to the form
        $form->setData($this->getCurrentUserInfo()[0]);
                
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->setVariable('meliscore_user_profile_form', $form);
        
        return $view;
    }
    
    /**
     * Function to update basic user information
     * @return \Zend\View\Model\JsonModel
     */
    public function updateUserInformationAction()
    {
        
        $newPass = "";
        $success = false;
        $msg = "";
        $data = array();
        $uInfo = array();
        $errors = array();
        $formErrors = array();
        $reloadPage = false;
        // translator
        $translator = $this->getServiceLocator()->get('translator');
        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey('meliscore', $this::TOOL_KEY);
        //get the user profile form
        $userUpdateForm = $melisTool->getForm('meliscore_user_profile_form');
        //prepare the users table
        $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
        //prepare the image service
        $imgService = $this->getServiceLocator()->get('MelisCoreImage');
        
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem('meliscore/tools/meliscore_user_profile_management/forms/meliscore_user_profile_form');
        $appConfigForm = $appConfigForm['elements'];
        
        //check if the request is on POST
        if($this->getRequest()->isPost())
        {
            //process the data from form
            $postValues = get_object_vars($this->getRequest()->getPost());
            $postValues = $melisTool->sanitizePost($postValues);
            $postValues = $this->getRequest()->getPost();
            
            //set the data to from from postValues
            $userUpdateForm->setData($postValues);
            
            $password  = $this->getRequest()->getPost('usr_password');
            $confirmPass = $this->getRequest()->getPost('usr_confirm_password');
            $userId = $this->getCurrentUserInfo()[0]['usr_id'];
            $userImage = $this->getCurrentUserInfo()[0]['usr_image'];
            $userLangIdCurrent = $this->getCurrentUserInfo()[0]['usr_lang_id'];
            
            //validate the password
            $passValidator = $this->validatePassword($password, $confirmPass, $translator, $melisCoreAuth);
            
            if($userUpdateForm->isValid())//validate form
            {
                if($passValidator['success'])//validate password
                {
                    $data = $userUpdateForm->getData();
                    $imageContent = null;
    
                    // create tmp folder if not exists
                    $dirName = $_SERVER['DOCUMENT_ROOT'].'media/images/profile/tmp/';
                    if(!file_exists($dirName))
                    {
                        $oldmask = umask(0);
                        mkdir($dirName, 0777, true);
                    }
                    
                    if(file_exists($dirName))
                    {
                        // process image, convert image content into mysql BLOB || image validation needed (file size & file type)
                        $imageFile = $this->params()->fromFiles('usr_image');
                        $tempImg = !empty($imageFile['tmp_name']) ? $imgService->createThumbnail($dirName,$imageFile['name'],$imageFile['tmp_name']) : null;
                        $imageContent = !empty($imageFile['tmp_name']) ? file_get_contents($dirName.'tmb_'.$imageFile['name']) : $userImage;
                        
                        // delete tmp image
                        if(!empty($imageFile['tmp_name']))
                        {
                            unlink($dirName.'tmb_'.$imageFile['name']);
                        }
                    }
                    
                    $data['usr_image'] = $imageContent;
                    
                    if($this->getCurrentUserInfo())
                    {
                        //check if password is valid
                        if($passValidator['success'])
                        {
                            $newPass = $passValidator['newPass'];
                            // remove confirm pass when updating
                            unset($data['usr_confirm_password']);
                            $data['usr_password'] = !empty($newPass) ? $newPass : $this->getCurrentUserInfo()[0]['usr_password'];
                            
                            //save the user data
                            $res = $userTable->save($data, $this->getCurrentUserId());
                            
                            //check if saving was success
                            if($res)
                            {
                                $userSession = $melisCoreAuth->getStorage()->read();
                                // update session data
                                $userSession->usr_email = $data['usr_email'];
                                $userSession->usr_lang_id = $data['usr_lang_id'];
                                $userSession->usr_image = $data['usr_image'];
                                
                                $msg = 'tr_meliscore_user_profile_success_info';
                                
                                //prepare data to update in the view
                                $uInfo = array(
                                    'profilePic'    =>  'data:image/jpeg;base64,'. base64_encode($userSession->usr_image),
                                    'email'         =>  $userSession->usr_email,
                                    'usrLang'       =>  $data['usr_lang_id'],
                                );
                                $success = true;
                                //set whether to reload the page
                                $reloadPage = ($userLangIdCurrent != $data['usr_lang_id']) ? true : false;
                                //set session if $reload is  true
                                if($reloadPage)
                                {
                                    $container = new Container('meliscore');
                                    $container['temp_user_profile_reload_module'] = true;
                                }
                            }
                            else
                            {
                                $success = false;
                                $msg = 'tr_meliscore_user_profile_failed_info';
                            }
                        }
                    }
                }
                else
                {
                    //process the password errors
                    $err = $passValidator['errors'];
                    $errors = $this->processErrors($err, $appConfigForm);
                    $msg = 'tr_meliscore_user_profile_failed_info';
                }
            }
            else
            {
                //process the form errors and merge with password errors if not empty
                $formErrors = $userUpdateForm->getMessages();
                $err = (sizeof($passValidator['errors']) > 0) ? array_merge($formErrors, $passValidator['errors']) : $formErrors ;
                $errors = $this->processErrors($err, $appConfigForm);
                $msg = 'tr_meliscore_tool_user_update_fail_info';
            }
        }
        else
        {
            $msg = 'tr_meliscore_user_profile_failed_info';
        }
        
        //prepare the data to return
        $response = array(
            'success'       => $success,
            'textMessage'   => $msg,
            'data'          => $uInfo,
            'errors'        => $errors,
            'textTitle'     => 'tr_meliscore_user_profile',
            'reLoad'        => $reloadPage,
        );
        //save notifications - whether success or not
        $this->getEventManager()->trigger('meliscore_tooluser_save_end', $this, array_merge($response, array('typeCode' => 'CORE_USER_UPDATE', 'itemId' => $userId)));
        
        return new JsonModel($response);
    }
    
    /**
     * Function to check the user profile whether to show it or not
     * depending if the session exist (it will show only if the user change his / her language)
     * @return \Zend\View\Model\JsonModel
     */
    public function checkUserSessionIfExistAction()
    {
        $container = new Container('meliscore');
        if(!empty($container['temp_user_profile_reload_module']))
        {
            unset($container['temp_user_profile_reload_module']);
            return new JsonModel(array("showUserProfile"=>true));
        }
        else
        {
            return new JsonModel(array("showUserProfile"=>false));
        }
    }
    
    /**
     * Function to process the errors
     * 
     * @param array $errors
     * @param Form $appConfigForm
     * @return array $errors
     */
    private function processErrors($errors, $appConfigForm)
    {
        //loop through each errors
        foreach ($errors as $keyError => $valueError)
        {
            //look in the form for every failed field to specify the errors
            foreach ($appConfigForm as $keyForm => $valueForm)
            {
                //check if field name is equal with the error key to highlight the field
                if ($valueForm['spec']['name'] == $keyError &&
                    !empty($valueForm['spec']['options']['label']))
                    $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
            }
        }
        return $errors;
    }
    
    /**
     * Function to validate password
     * 
     * @param string $password
     * @param string $confirmPass
     * @param translator $translator
     * @param melisCoreAuth $melisCoreAuth
     * @return array
     */
    private function validatePassword($password, $confirmPass, $translator, $melisCoreAuth)
    {
        $errors = array();
        $success = false;
        $newPass = "";
        
        //check if user wants to update his / her password
        if(!empty($password) || !empty($confirmPass))
        {
            //check the length of the password
            if(strlen($password) >= 8)
            {
                //check the length of the confirm password
                if(strlen($confirmPass) >= 8)
                {
                    $passValidator = new \MelisCore\Validator\MelisPasswordValidator();
                    if($passValidator->isValid($password))
                    {
                        // password and confirm password matching
                        if($password == $confirmPass)
                        {
                            $newPass = $melisCoreAuth->encryptPassword($password);
                            $success = true;
                        }
                        else
                        {
                            $errors = array(
                                'usr_password' => array(
                                    'invalidPassword' => $translator->translate('tr_meliscore_tool_user_usr_password_not_match'),
                                    'label' => 'Password',
                                ),
                                'usr_confirm_password' => array(
                                    'invalidPassword' => $translator->translate('tr_meliscore_tool_user_usr_password_not_match'),
                                    'label' => 'Password',
                                ),
                            );
                        } // password and confirm password matching
                    }
                    else
                    {
                        $errors = array(
                            'usr_password' => array(
                                'invalidPassword' => $translator->translate('tr_meliscore_tool_user_usr_password_regex_not_match'),
                                'label' => 'Password',
                            )
                        );
                    } // password regex validator
                }
                else
                {
                    $errors = array(
                        'usr_confirm_password' => array(
                            'invalidPassword' => $translator->translate('tr_meliscore_tool_user_usr_confirm_password_error_low'),
                            'label' => 'Password',
                        )
                    );
                }// end confirm password length
            }
            else 
            {
                $errors = array(
                    'usr_password' => array(
                        'invalidPassword' => $translator->translate('tr_meliscore_tool_user_usr_password_error_low'),
                        'label' => 'Password',
                    )
                );
            }// end password length
        }
        else 
        {
            // update without touching the password
            $success = true;
        } // password and confirm password not empty
        return array("success"=>$success, "errors"=>$errors, 'newPass'=>$newPass);
    }
    
    /**
     * Function to get the current user information
     * @param boolean $encodeImg - default is false, if true, user image is encoded already
     * @return array
     */
    private function getCurrentUserInfo($encodeImg = false)
    {
        $user = $this->getServiceLocator()->get('MelisCoreTableUser');
        $role = $this->getServiceLocator()->get('MelisCoreTableUserRole');
        $usersInfo = $user->getEntryById($this->getCurrentUserId())->toArray();
        foreach($usersInfo AS $key=>$val)
        {
           if($encodeImg)
           {
                $usersInfo[$key]['usr_image'] = ($usersInfo[$key]['usr_image'] != "" && $usersInfo[$key]['usr_image'] != null) ? "data:image/jpeg;base64,".base64_encode($usersInfo[$key]['usr_image']) : "/MelisCore/images/profile/default_picture.jpg";
           }
           //get the user role by role id
           $r = $role->getEntryById($usersInfo[$key]['usr_role_id'])->toArray();
           $usersInfo[$key]['usr_role'] = $r[$key]['urole_name'];
        }
        return $usersInfo;
    }
        
    /**
     * Function to return the current user ID
     * @return Int user ID
     */
    private function getCurrentUserId()
    {
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $userAuthDatas =  $melisCoreAuth->getStorage()->read();
        $userId = (int) $userAuthDatas->usr_id;
        return $userId;
    }
    
    /**
     * Function to get the melis key
     * @return melisKey
     */
    private function getMelisKey()
    {
        $melisKey = $this->params()->fromRoute('melisKey', $this->params()->fromQuery('melisKey'), null);

        return $melisKey;
    }
}