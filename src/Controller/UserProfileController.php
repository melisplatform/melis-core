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
 * This class renders Melis CMS Dashboard
 */
class UserProfileController extends AbstractActionController
{
    
    const TOOL_KEY = 'meliscore_tool_user';
    
    public function renderUserProfileAction()
    {
        $melisKey = $this->getMelisKey();

        $view = new ViewModel();
        $view->melisKey = $melisKey;

        return $view;
    }
    
    public function renderUserProfileRightAction()
    {
        $melisKey = $this->getMelisKey();
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        
        return $view;
    }
    
    public function renderUserProfileTabsAction()
    {
        $melisKey = $this->getMelisKey();
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        
        return $view;
    }
    
    public function renderUserProfileLeftAction(){
        $melisKey = $this->getMelisKey();
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        
        $uInfo = $this->getCurrentUserInfo(true);
        $data = array();
        
        foreach($uInfo AS $key=>$val){
           array_push($data, array(
                                    'usr_image'=>$uInfo[$key]['usr_image'],
                                    'usr_name'=>$uInfo[$key]['usr_firstname']." ".$uInfo[$key]['usr_lastname'],
                                    'usr_login'=>$uInfo[$key]['usr_login'],
                                    'usr_email'=>$uInfo[$key]['usr_email'],
                                  )); 
        }
        $view->userInfo = $data;
        
        return $view;
    }
    
    /**
     * Function to render user form
     * @return \Zend\View\Model\ViewModel
     */
    public function renderUserProfileFormAction(){
        $melisKey = $this->getMelisKey();
        
        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        
        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey('meliscore', $this::TOOL_KEY);
        $form = $melisTool->getForm('meliscore_user_profile_form');
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
    public function updateUserInformationAction(){
        
        $valid = "";
        $newPass = "";
        $success = false;
        $errors = array();
        $msg = "";
        $data = array();
        $uInfo = array();
        // translator
        $translator = $this->getServiceLocator()->get('translator');
        
        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        
        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey('meliscore', $this::TOOL_KEY);
        
        $userUpdateForm = $melisTool->getForm('meliscore_user_profile_form');
        
        $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
        
        $imgService = $this->getServiceLocator()->get('MelisCoreImage');
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        
        $request = $this->getRequest();
        $postValues = get_object_vars($request->getPost());
        
        if($this->getRequest()->isPost())
        {
            $postValues = get_object_vars($this->getRequest()->getPost());
            $postValues = $melisTool->sanitizePost($postValues);
            
            $postValues = $this->getRequest()->getPost();
            $userUpdateForm->setData($postValues);
            
            $password  = $this->getRequest()->getPost('usr_password');
            $confirmPass = $this->getRequest()->getPost('usr_confirm_password');
            
            if($userUpdateForm->isValid())
            {
                $data = $userUpdateForm->getData();
                $imageContent = null;

                // create tmp folder if not exists
                $dirName = $_SERVER['DOCUMENT_ROOT'].'media/images/profile/tmp/';
                if(!file_exists($dirName)) {
                    $oldmask = umask(0);
                    mkdir($dirName, 0777, true);
                }
                
                if(file_exists($dirName)) {
                    // process image, convert image content into mysql BLOB || image validation needed (file size & file type)
                    $imageFile = $this->params()->fromFiles('usr_image');
                    $tempImg = !empty($imageFile['tmp_name']) ? $imgService->createThumbnail($dirName,$imageFile['name'],$imageFile['tmp_name']) : null;
                    $imageContent = !empty($imageFile['tmp_name']) ? file_get_contents($dirName.'tmb_'.$imageFile['name']) : $this->getCurrentUserInfo()[0]['usr_image'];
                    
                    // delete tmp image
                    if(!empty($imageFile['tmp_name'])) {
                        unlink($dirName.'tmb_'.$imageFile['name']);
                    }
                }
                $data['usr_image'] = $imageContent;
                
                if($this->getCurrentUserInfo()){
                    if(!empty($password) || !empty($confirmPass))
                    {
                        if(strlen($password) >= 8) {
                            if(strlen($confirmPass) >= 8) {
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
                                        $msg = $translator->translate('tr_meliscore_tool_user_usr_password_not_match');
                                    } // password and confirm password matching
                                }
                                else {
                                    $msg = $translator->translate('tr_meliscore_tool_user_usr_password_regex_not_match');
                                } // password regex validator
                            }
                            else {
                                $msg = $translator->translate('tr_meliscore_tool_user_usr_confirm_password_error_low');
                            }// end confirm password length
                        }
                        else {
                            $msg = $translator->translate('tr_meliscore_tool_user_usr_password_error_low');
                        }// end password length
                    }
                    else {
                        // update without touching the password
                        $success = true;
                    } // password and confirm password not empty
                    
                    if($success) {
                        // remove confirm pass when updating
                        unset($data['usr_confirm_password']);
                        $data['usr_password'] = !empty($newPass) ? $newPass : $this->getCurrentUserInfo()[0]['usr_password'];
                        
                        $res = $userTable->save($data, $this->getCurrentUserId());
                        if($res){
                            $userSession = $melisCoreAuth->getStorage()->read();
                            // update session data
                            $userSession->usr_email = $data['usr_email'];
                            $userSession->usr_lang_id = $data['usr_lang_id'];
                            $userSession->usr_image = $data['usr_image'];
                            
                            $msg = $translator->translate('tr_meliscore_user_profile_success_info');
                            
                            //prepare data to update in the view
                            $uInfo = array(
                                'profilePic'    =>  'data:image/jpeg;base64,'. base64_encode($userSession->usr_image),
                                'email'         =>  $userSession->usr_email,
                            );
                        }else{
                            $success = false;
                            $msg = $translator->translate('tr_meliscore_user_profile_failed_info');
                        }
                    }
                }
            }else{
                  $msg = $translator->translate('tr_meliscore_user_profile_failed_info');
            }
        }
        
        $response = array(
            'success' => $success,
            'msg' => $msg,
            'data'  =>  $uInfo,
        );
        
        return new JsonModel($response);
    }
    
    /**
     * Function to get the current user information
     * @param boolean $encodeImg - default is false, if true, user image is encoded already
     * @return array
     */
    private function getCurrentUserInfo($encodeImg = false){
        $user = $this->getServiceLocator()->get('MelisCoreTableUser');
        $usersInfo = $user->getEntryById($this->getCurrentUserId())->toArray();
        if($encodeImg){
            foreach($usersInfo AS $key=>$val){
                $usersInfo[$key]['usr_image'] = ($usersInfo[$key]['usr_image'] != "" && $usersInfo[$key]['usr_image'] != null) ? base64_encode($usersInfo[$key]['usr_image']) : "/MelisCore/images/profile/22.jpg";
            }
        }
        return $usersInfo;
    }
        
    /**
     * Function to return the current user ID
     * @return Int user ID
     */
    private function getCurrentUserId(){
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $userAuthDatas =  $melisCoreAuth->getStorage()->read();
        $userId = (int) $userAuthDatas->usr_id;
        return $userId;
    }

    private function getMelisKey()
    {
        $melisKey = $this->params()->fromRoute('melisKey', $this->params()->fromQuery('melisKey'), null);

        return $melisKey;
    }
}