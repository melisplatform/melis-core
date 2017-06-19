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
use Zend\Session\Container;
use Zend\Http\Header\SetCookie;
use Zend\Crypt\BlockCipher;
use Zend\Crypt\Symmetric\Mcrypt;
use Zend\Session\Config\SessionConfig;
use Zend\Session\SessionManager;
/**
 * This class deals with authentification to Melis Platform
 */
class MelisAuthController extends AbstractActionController
{
	const ROLE_ID_CUSTOM = 1;
	const USER_INACTIVE = 0;
	
	/**
	 * Rendering the Melis CMS interface
	 * @return \Zend\View\Model\ViewModel
	 */
    public function loginpageAction()
    { 
    	$view = $this->forward()->dispatch('MelisCore\Controller\PluginView',
    			array('action' => 'generate',
    				  'appconfigpath' => '/meliscore_login',
    				  'keyview' => 'meliscore_login')); 
    	
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
     * Shows login form
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function loginAction()
    { 
        $isChecked = false;
    	$pathAppConfigForm = '/meliscore/forms/meliscore_login';

    	$melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
    	$appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);

    	$factory = new \Zend\Form\Factory();
    	$loginForm = $factory->createForm($appConfigForm);
        $loginDataConfig = $melisMelisCoreConfig->getItem('meliscore_login/datas');
        
    	// change to layout login
    	$isRemembered = !empty($_COOKIE['remember']) ? (int) $_COOKIE['remember'] : 0;
    	$user = '';
    	$pass = '';
    	if($isRemembered == 1) {
    	    $user = $this->crypt($_COOKIE['cookie1'], 'decrypt');
    	    $pass = $this->crypt($_COOKIE['cookie2'], 'decrypt');
    	    $loginForm->get('usr_login')->setValue($user);
    	    $loginForm->get('usr_password')->setValue($pass);
    	    $isChecked = true;
    	    
    	}
    	
    	$view = new ViewModel();
    	$view->setVariable('meliscore_login', $loginForm);
    	$view->setVariable('login_logo', $loginDataConfig['login_logo']);
    	$view->isChecked = $isChecked;
    	
    	return $view;
    }
    
    /**
     * Authenticate a user to the platform
     * 
     * @return \Zend\View\Model\JsonModel
     */
    public function authenticateAction()
    {
    	$request = $this->getRequest();
    	$translator = $this->serviceLocator->get('translator');
    	$melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
    	$melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
    	$userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
    	$pathAppConfigForm = '/meliscore/forms/meliscore_login';
    	
    	// Creating the Zend Form to validate datas
    	$appConfigForm = $melisMelisCoreConfig->getItem($pathAppConfigForm);
    	$factory = new \Zend\Form\Factory();
    	$loginForm = $factory->createForm($appConfigForm);
    	
    	if ($request->isPost())
    	{
    		$postValues = get_object_vars($request->getPost());
    		$loginForm->setData($postValues);
    		
    		// Validate datas
    		if ($loginForm->isValid())
    		{
    		    // check if the user exists
    		    $userData = $userTable->getEntryByField('usr_login', $postValues['usr_login']);
    		    $userData = $userData->current();

    		    if(!empty($userData))
    		    {

                    /**
                     * PASSWORD UPDATE - June 05, 2017
                     * description: the following code below checks if the user's password is currently still on MD5,
                     * if it's on MD5, it will still accept it, once correctly matched then it will update the user's password
                     * into AES with hash SHA256. If the password is already in AES, it will push through with the normal authentication
                     * process.
                     */
    		        $isPasswordMd5 = false;
    		        $password      = $postValues['usr_password'];
    		        $newPassword   = null;
    		        $md5Regex      = '/^[a-f0-9]{32}$/';

    		        if(preg_match($md5Regex, $userData->usr_password)) {
    		            $isPasswordMd5 = true;
                        $newPassword   = $melisCoreAuth->encryptPassword($password);
                        $password      = md5($postValues['usr_password']);
                    }
                    else {
                        $userEncPassword = $userData->usr_password;
                        $userDecPassword = $melisCoreAuth->decryptPassword($userEncPassword);
                        if($password == $userDecPassword) {
                            // this will be used in setCredential method
                            $password = $userEncPassword;
                        }

                    }




    		    	// If user is active
    		        if($userData->usr_status != self::USER_INACTIVE)
    		        {
    		            $melisCoreAuth->getAdapter()->setIdentity($postValues['usr_login'])
    		            							->setCredential($password);
    		        
    		            $result = $melisCoreAuth->authenticate();
    		        
    		            if ($result->isValid())
    		            {
    		                $user = $melisCoreAuth->getAdapter()->getResultRowObject();
    		        
    		                // Update the rights of the user if it's not a custom role
    		                if ($user->usr_role_id != self::ROLE_ID_CUSTOM)
    		                {
    		                    // Get rights from Role table
    		                    $rightsXML = '';
    		                    $tableUserRole = $this->serviceLocator->get('MelisCoreTableUserRole');
    		                    $datasRole = $tableUserRole->getEntryById($user->usr_role_id);
    		                    if ($datasRole)
    		                    {
    		                        $datasRole = $datasRole->current();
    		                        if (!empty($datasRole))
    		                        {
    		                            $user->usr_rights = $datasRole->urole_rights;
    		                        }
    		                    }
    		                }
    		        
    		                // Write session
    		                $melisCoreAuth->getStorage()->write($user);
    		                 
    		                // Update Melis BO locale
    		                $melisLangTable = $this->serviceLocator->get('MelisCore\Model\Tables\MelisLangTable');
    		                $datasLang = $melisLangTable->getEntryById($user->usr_lang_id);
    		                
    		                if (!empty($datasLang->current()))
    		                {
    		                    $datasLang = $datasLang->current();
    		                    $container = new Container('meliscore');
    		                    $container['melis-lang-id'] = $user->usr_lang_id;
    		                    $container['melis-lang-locale'] = $datasLang->lang_locale;
    		                }
    		        
    		                // update last login
                            $loggedInDate = date('Y-m-d H:i:s');
    		                $this->getEventManager()->trigger('melis_core_auth_login_ok', $this, [
    		                    'login_date' => $loggedInDate,
                                'usr_id'     => $user->usr_id
                            ]);

    		                // update user password if the password is on MD5
                            if($isPasswordMd5) {
                                $userTable->save([
                                    'usr_password' => $newPassword
                                ], $userData->usr_id);
                            }
    		                
    		                // Retrieving recent user logs on database
    		                $this->getEventManager()->trigger('meliscore_get_recent_user_logs', $this, array());
    		        
    		                // check if the user clicked remember me button
    		                $rememberMe = (int) $request->getPost('remember');
    		                if($rememberMe == 1) 
    		                {
    		                    $this->rememberMe($postValues['usr_login'], $postValues['usr_password']);
    		                }
    		                else 
    		                {
    		                    $this->forgetMe($postValues['usr_login'], $postValues['usr_password']);
    		                }
    		        
    		                $result = array(
    		                    'success' => true,
    		                    'errors' => array(),
    		                );
    		            }
    		            else
    		            {
    		                $result = array(
    		                    'success' => false,
    		                    'errors' => array('empty' => $translator->translate('tr_meliscore_login_auth_Failed authentication')),
    		                );
    		            }
    		        }
    		        else
    		        {
    		            $result = array(
    		                'success' => false,
    		                'errors' => array('empty' => $translator->translate('tr_meliscore_login_auth_Failed authentication')),
    		            );
    		        }
    		    }
    		    else 
    		    {
    		        $result = array(
    		            'success' => false,
    		            'errors' => array('empty' => $translator->translate('tr_meliscore_login_auth_Failed authentication')),
    		        );
    		    }
    		}
    		else
    		{
	    		$result = array(
	    					'success' => false,
	    					'errors' => array($loginForm->getMessages()),
	    		);
    		}
    	}
    	else
    	{
    		$result = array(
    					'success' => false,
    					'errors' => array('empty' => $translator->translate('tr_meliscore_login_errors_Empty datas')),
    		);
    	}
    	
    	return new JsonModel($result);
    }
    
    /**
     * Shows logout button in header
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function headerLogoutAction()
    {
    	$melisKey = $this->params()->fromRoute('melisKey', '');
    	
    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
    	return $view;
    }
    
    /**
     * Shows identity zone in the left menu
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function identityMenuAction()
    {
    	$melisKey = $this->params()->fromRoute('melisKey', '');
    	
    	$melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
    	
    	$userAuthDatas =  $melisCoreAuth->getStorage()->read();
        
    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
    	$view->setVariable('userAuthDatas', $userAuthDatas);
    	
    	return $view;
    }
    
    /**
     * Logout action
     */
    public function logoutAction()
    {
    	$container = new Container('meliscore');
    	$container->getManager()->getStorage()->clear('meliscore');
    	
    	$container = new Container('meliscms');
    	$container->getManager()->getStorage()->clear('meliscms');
    	
    	$flashMessenger = $this->getServiceLocator()->get('MelisCoreFlashMessenger');
    	$flashMessenger->clearFlashMessage();

        $melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');

        if($melisCoreAuth->hasIdentity()) {
            $userData = $melisCoreAuth->getIdentity();
            $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
            $userTable->save([
                'usr_is_online' => 0
            ], $userData->usr_id);
        }
        $melisCoreAuth->getStorage()->clear();
    	// Redirect
    	$this->plugin('redirect')->toUrl('/melis/login');
    	
    	return new JsonModel();
    }

    /**
     * Get the profile picture
     * 
     * @return \Zend\Stdlib\ResponseInterface
     */
    public function getProfilePictureAction()
    {
    	$melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');    	 
    	$moduleSvc = $this->getServiceLocator()->get('ModulesService');
    	$user =  $melisCoreAuth->getIdentity();
    	$imageDefault = $moduleSvc->getModulePath('MelisCore').'/public/images/profile/default_picture.jpg';

    	if (!empty($user) && !empty($user->usr_image))
    		$image = $user->usr_image;
    	else
    	{  
    		$image =  file_get_contents($imageDefault);
    	}
    	
    	$response = $this->getResponse();
    	
    	$response->setContent($image);
    	$response->getHeaders()
    			 ->addHeaderLine('Content-Transfer-Encoding', 'binary')
    			 ->addHeaderLine('Content-Type', 'image/jpg');
    	
    	return $response;
    }
    
    public function getCurrentLoggedInUserAction()
    {
        $melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
        $user = $melisCoreAuth->getIdentity();
        
        return new JsonModel(array('login' => $user->usr_login)); 
    }
    
    public function getCurrentLoggedInIdAction()
    {
        
        $melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
        $user = $melisCoreAuth->getIdentity(); 
        $id = $user->usr_id; //get user identity through user id

        $data = array(); 
        $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
        if($this->getRequest()->isXmlHttpRequest())
        {
            if(is_numeric($id))
            {
                $data['usr_id'] = $userTable->getEntryById($id)->current()->usr_id;
            }
        }   
        return new JsonModel(array(
            'user' => $data,  
        ));
       
    }
    
    public function isLoggedInAction()
    {
        $isLoggedIn = false;
        if($this->getRequest()->isXmlHttpRequest()) {
            $melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
            $user = $melisCoreAuth->getIdentity();
            if(!empty($user)) {
                $isLoggedIn = true;

                // update the connection time.
                $table = $this->getServiceLocator()->get('MelisUserConnectionDate');
                $data  = $table->getUserConnectionData((int) $user->usr_id, $user->usr_last_login_date)->current();

                if($data) {
                    $table->save([
                        'usrcd_last_connection_time' => date('Y-m-d H:i:s')
                    ], $data->usrcd_id);
                }
            }
        }

        
        return new JsonModel(array('login' => $isLoggedIn));
    }
    
    /**
     * Remember me function creation cookie
     * 
     * @param string $username
     * @param string $password
     */
    protected function rememberMe($username, $password)
    {
        $melisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $authCookieConfig = $melisCoreConfig->getItem('meliscore/datas/default/auth_cookies');
        $remember = $authCookieConfig['remember'];
        
        $user = new SetCookie('cookie1', $this->crypt($username), strtotime($remember));
        $pass = new SetCookie('cookie2', $this->crypt($password), strtotime($remember));
        $remember = new SetCookie('remember', 1, strtotime($remember));
        
        $this->getResponse()->getHeaders()->addHeader($user);
        $this->getResponse()->getHeaders()->addHeader($pass);
        $this->getResponse()->getHeaders()->addHeader($remember);
        
        // add code here for the session
        $melisCoreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $autoLogoutTimeConf = $melisCoreConfig->getItem('meliscore/datas/default/auto_logout');
        $autoLogoutTime = (int) $autoLogoutTimeConf['after'];
         
        // automatic logout
        $sessionManager = new SessionManager();
        $sessionManager->rememberMe($autoLogoutTime);
        Container::setDefaultManager($sessionManager);
    }
    
    /**
     * Forget me function
     *
     * @param string $username
     * @param string $password
     */
    protected function forgetMe($username, $password)
    {
        $melisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $authCookieConfig = $melisCoreConfig->getItem('meliscore/datas/default/auth_cookies');
        $expire = $authCookieConfig['expire'];
        
        
        $user = new SetCookie('cookie1', $this->crypt($username), strtotime($expire, time()));
        $pass = new SetCookie('cookie2', $this->crypt($password), strtotime($expire, time()));
        $remember = new SetCookie('remember', 0, strtotime($expire, time()));
    
        $this->getResponse()->getHeaders()->addHeader($user);
        $this->getResponse()->getHeaders()->addHeader($pass);
        $this->getResponse()->getHeaders()->addHeader($remember);
        
        // add code here to remove session
        $sessionManager = new SessionManager();
        $sessionManager->forgetMe();
        Container::setDefaultManager($sessionManager);
    }
    
    /**
     * Encryption of passwords for melis
     * 
     * @param array $data
     * @param string $type
     * @return string
     */
    protected function crypt($data, $type = 'encrypt') 
    {
        $melisConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $datas = $melisConfig->getItemPerPlatform('meliscore/datas');
        
        $hashMethod = $datas['accounts']['hash_method'];
        $salt = $datas['accounts']['salt'];
        // hash password
        $bEncryptor = new BlockCipher(new Mcrypt(array(
            'algo' => 'aes',
            'mode' => 'cfb',
            'hash' => $hashMethod
        )));
        $bEncryptor->setKey($salt);
        
        if($type == 'encrypt') 
        {
            $value = $bEncryptor->encrypt($data);
        }
        elseif($type == 'decrypt') 
        {
            $value = $bEncryptor->decrypt($data);
        }
       
        return $value;
    }

    public function testAction()
    {
        $user = $this->getServiceLocator()->get('MelisUserConnectionDate');
        $user = $user->getUserConnectionData(1);


        print_r($user->toArray());

        die;
    }


}
