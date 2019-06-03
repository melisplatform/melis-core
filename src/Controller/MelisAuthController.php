<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Http\Header\SetCookie;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\Session\Container;
use Zend\Session\SessionManager;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;

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
            [
                'action' => 'generate',
                'appconfigpath' => '/meliscore_login',
                'keyview' => 'meliscore_login',
            ]);

        $background = '';
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem('/meliscore_login');
        if (!empty($appConfigForm['datas']['login_background'])) {
            $background = $appConfigForm['datas']['login_background'];
        }

        $schemeSvc = $this->getServiceLocator()->get('MelisCorePlatformSchemeService');
        $schemeData = $schemeSvc->getCurrentScheme();

        $bundleAsset = $this->getServiceLocator()->get('MelisAssetManagerWebPack')->getAssets();


        $this->layout()->addChild($view, 'content');

        $this->layout()->isLogin = 1;
        $this->layout()->login_background = $background;
        $this->layout()->schemes = $schemeData;
        $this->layout()->bundle = $bundleAsset;

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
        if ($isRemembered == 1) {
            $user = $this->crypt($_COOKIE['cookie1'], 'decrypt');
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
     * Encryption of passwords for melis
     *
     * @param array $data
     * @param string $type
     *
     * @return string
     */
    protected function crypt($data, $type = 'encrypt')
    {
        $melisConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $datas = $melisConfig->getItemPerPlatform('meliscore/datas');

        $hashMethod = $datas['accounts']['hash_method'];
        $salt = $datas['accounts']['salt'];

        if ($type == 'encrypt') {
            return base64_encode($data);
        }

        if ($type == 'decrypt') {
            return base64_decode($data);
        }

        return;
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

        if ($request->isPost()) {
            $postValues = get_object_vars($request->getPost());

            $loginForm->setData($postValues);

            // Validate datas
            if ($loginForm->isValid()) {
                // check if the user exists
                $userData = $userTable->getEntryByField('usr_login', $postValues['usr_login']);
                $userData = $userData->current();

                if (!empty($userData)) {

                    /**
                     * PASSWORD UPDATE - June 05, 2017
                     * description: the following code below checks if the user's password is currently still on MD5,
                     * if it's on MD5, it will still accept it, once correctly matched then it will update the user's password
                     * encryption.
                     */

                    // @var $requiresPasswordReset - Flag for password update when successfully logged-in
                    $requiresPasswordReset = false;
                    // @var $password - user provided password
                    $password = $postValues['usr_password'];
                    // @var $newPassword - variable holder for new password encryption
                    $newPassword = null;
                    // @var $md5Regex - regular expression for checking if the password in the user table is on MD5
                    $md5Regex = '/^[a-f0-9]{32}$/';
                    // @var $needReset - Flag if user need's to use the forgot password link
                    $needReset = false;

                    // if the user password in the user table is on MD5
                    if (preg_match($md5Regex, $userData->usr_password)) {
                        // set $requiresPasswordReset flag to "true" to update to new password encryption
                        $requiresPasswordReset = true;
                        // encrypt the password to new encryption
                        $newPassword = $melisCoreAuth->encryptPassword($password);
                        // set the MD5 value of the user provided password, to match its' value to the user table password field
                        $password = md5($postValues['usr_password']);
                    } else {
                        // check if the user password in user table is already in the new password encryption algorithm
                        if (strlen($userData->usr_password) != 60) {

                            // get the 'use_mcrypt' config
                            $useMcrypt = $melisMelisCoreConfig->getItem('/meliscore/datas/default/accounts')['use_mcrypt'];
                            // encrypt the password to new encryption
                            $newPassword = $melisCoreAuth->encryptPassword($password);

                            /**
                             * if 'use_mcrypt' is set to "true", then we'll use the mcrypt API for password checking,
                             * however, this will still update the password to new password encryption.
                             *
                             * WARNING: mcrypt API is deprecated on PHP 7.1
                             */
                            if ($useMcrypt) {
                                // salt config
                                $salt = $melisMelisCoreConfig->getItem('/meliscore/datas/default/accounts')['salt'];
                                // hash_method config
                                $hash = $melisMelisCoreConfig->getItem('/meliscore/datas/default/accounts')['hash_method'];

                                $enc = new \Zend\Crypt\BlockCipher(new \Zend\Crypt\Symmetric\Mcrypt([
                                    'algo' => 'aes',
                                    'mode' => 'cfb',
                                    'hash' => $hash,
                                ]));
                                $enc->setKey($salt);

                                // get the encrypted password value from the user table
                                $userEncPassword = $userData->usr_password;
                                // get the decrypted password value from the user table
                                $decryptedPassword = $enc->decrypt($userData->usr_password);

                                // try to login using AES SHA256 by matching the decrypted user password to the user provided password
                                if ($password == $decryptedPassword) {
                                    // set $requiresPasswordReset flag to "true" to update to new password encryption
                                    $requiresPasswordReset = true;
                                    // encrypt the password to new encryption
                                    $newPassword = $melisCoreAuth->encryptPassword($password);
                                    // set the MD5 value of the user provided password, to match its' value to the user table password field
                                    $password = $userEncPassword;
                                }
                            } else {
                                // asked the password to reset their password (by using "forgot password" link)
                                $needReset = true;
                            }
                        } else {
                            $userPassword = $userData->usr_password;
                            if ($melisCoreAuth->isPasswordCorrect($password, $userPassword)) {
                                // this will be used in setCredential method
                                $password = $userPassword;
                            }

                        }
                    }

                    // If user is active
                    if ($userData->usr_status != self::USER_INACTIVE) {
                        if (!$needReset) {
                            $melisCoreAuth->getAdapter()->setIdentity($postValues['usr_login'])
                                ->setCredential($password);

                            $result = $melisCoreAuth->authenticate();

                            if ($result->isValid()) {
                                $user = $melisCoreAuth->getAdapter()->getResultRowObject();

                                // Update the rights of the user if it's not a custom role
                                if ($user->usr_role_id != self::ROLE_ID_CUSTOM) {
                                    // Get rights from Role table
                                    $rightsXML = '';
                                    $tableUserRole = $this->serviceLocator->get('MelisCoreTableUserRole');
                                    $datasRole = $tableUserRole->getEntryById($user->usr_role_id);
                                    if ($datasRole) {
                                        $datasRole = $datasRole->current();
                                        if (!empty($datasRole)) {
                                            $user->usr_rights = $datasRole->urole_rights;
                                        }
                                    }
                                }

                                // Write session
                                $melisCoreAuth->getStorage()->write($user);

                                // Update Melis BO locale
                                $melisLangTable = $this->serviceLocator->get('MelisCore\Model\Tables\MelisLangTable');
                                $datasLang = $melisLangTable->getEntryById($user->usr_lang_id);

                                if (!empty($datasLang->current())) {
                                    $datasLang = $datasLang->current();
                                    $container = new Container('meliscore');
                                    $container['melis-lang-id'] = $user->usr_lang_id;
                                    $container['melis-lang-locale'] = $datasLang->lang_locale;
                                }

                                // update last login
                                $loggedInDate = date('Y-m-d H:i:s');
                                $this->getEventManager()->trigger('melis_core_auth_login_ok', $this, [
                                    'login_date' => $loggedInDate,
                                    'usr_id' => $user->usr_id,
                                ]);

                                // update user password if the password is on MD5
                                if ($requiresPasswordReset) {
                                    $userTable->save([
                                        'usr_password' => $newPassword,
                                    ], $userData->usr_id);
                                }

                                // Retrieving recent user logs on database
                                $this->getEventManager()->trigger('meliscore_get_recent_user_logs', $this, []);

                                // check if the user clicked remember me button
                                $rememberMe = (int) $request->getPost('remember');
                                if ($rememberMe == 1) {
                                    $this->rememberMe($postValues['usr_login'], $postValues['usr_password']);
                                } else {
                                    $this->forgetMe($postValues['usr_login'], $postValues['usr_password']);
                                }

                                $result = [
                                    'success' => true,
                                    'errors' => [],
                                ];
                            } else {
                                $result = [
                                    'success' => false,
                                    'errors' => ['empty' => $translator->translate('tr_meliscore_login_auth_Failed authentication')],
                                ];
                            }
                        } else {
                            $result = [
                                'success' => false,
                                'require_reset_password' => true,
                                'errors' => ['empty' => $translator->translate('tr_meliscore_login_password_enc_update')],
                            ];
                        }

                    } else {
                        $result = [
                            'success' => false,
                            'errors' => ['empty' => $translator->translate('tr_meliscore_login_auth_Failed authentication')],
                        ];
                    }
                } else {
                    $result = [
                        'success' => false,
                        'errors' => ['empty' => $translator->translate('tr_meliscore_login_auth_Failed authentication')],
                    ];
                }
            } else {
                $result = [
                    'success' => false,
                    'errors' => [$loginForm->getMessages()],
                ];
            }
        } else {
            $result = [
                'success' => false,
                'errors' => ['empty' => $translator->translate('tr_meliscore_login_errors_Empty datas')],
            ];
        }

        return new JsonModel($result);
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
        $remember = new SetCookie('remember', 0, strtotime($expire, time()));

        $this->getResponse()->getHeaders()->addHeader($user);
        $this->getResponse()->getHeaders()->addHeader($remember);

        // add code here to remove session
        $sessionManager = new SessionManager();
        $sessionManager->forgetMe();
        Container::setDefaultManager($sessionManager);
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

        $userAuthDatas = $melisCoreAuth->getStorage()->read();

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
        $flashMessenger->clearFlashMessageSession();

        $melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');

        if ($melisCoreAuth->hasIdentity()) {
            $userData = $melisCoreAuth->getIdentity();
            $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
            # get the latest rights
            $userData  = $userTable->getEntryById($userData->usr_id)->current();

            $data = [
                'usr_is_online' => 0,
                'usr_rights' => $userData->usr_rights
            ];


            $userTable->save($data, $userData->usr_id);

            $this->getEventManager()->trigger('meliscore_logout_event', $this, ['usr_id' => $userData->usr_id]);
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
        $user = $melisCoreAuth->getIdentity();
        $imageDefault = $moduleSvc->getModulePath('MelisCore') . '/public/images/profile/default_picture.jpg';

        if (!empty($user) && !empty($user->usr_image)) {
            $image = $user->usr_image;
        } else {
            $image = file_get_contents($imageDefault);
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

        return new JsonModel(['login' => $user->usr_login]);
    }

    public function getCurrentLoggedInIdAction()
    {

        $melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
        $user = $melisCoreAuth->getIdentity();
        $id = $user->usr_id; //get user identity through user id

        $data = [];
        $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
        if ($this->getRequest()->isXmlHttpRequest()) {
            if (is_numeric($id)) {
                $data['usr_id'] = $userTable->getEntryById($id)->current()->usr_id;
            }
        }

        return new JsonModel([
            'user' => $data,
        ]);

    }

    public function isLoggedInAction()
    {
        $isLoggedIn = false;
        if ($this->getRequest()->isXmlHttpRequest()) {
            $melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
            $user = $melisCoreAuth->getIdentity();
            if (!empty($user)) {
                $isLoggedIn = true;

                // update the connection time.
                $table = $this->getServiceLocator()->get('MelisUserConnectionDate');
                $data = $table->getUserLastConnectionDate((int) $user->usr_id, $user->usr_last_login_date)->current();

                $currentData = date('Y-m-d H:i:s');
                $userCmId = null;
                $userCm = [];
                if ($data) {

                    $userCmId = $data->usrcd_id;
                    $userCm = [
                        'usrcd_last_connection_time' => $currentData,
                    ];

                } else {
                    $userCm = [
                        'usrcd_usr_login' => $user->usr_id,
                        'usrcd_last_login_date' => $currentData,
                        'usrcd_last_connection_time' => $currentData,
                    ];
                }

                $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
                $userTable->update([
                    'usr_is_online' => 1,
                ], 'usr_login',$user->usr_id);

                $table->save($userCm, $userCmId);

                // Updating new last login of the current user
                $user->usr_last_login_date = $currentData;
            }
        }

        return new JsonModel(['login' => $isLoggedIn]);
    }

    public function getIdentityMenuAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');

        $userAuthDatas = $melisCoreAuth->getStorage()->read();

        $view = new ViewModel();
        $view->melisKey = $melisKey;


        return $view;
    }


}
