<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore;

use Zend\Mvc\ModuleRouteListener;
use Zend\Mvc\MvcEvent;
use Zend\Mvc\Application;
use Zend\ModuleManager\ModuleManager;
use Zend\Session\Container;
use Zend\Session\SessionManager;
use Zend\Session\Config\SessionConfig;
use Zend\Stdlib\ArrayUtils;
use Zend\I18n\Translator\Translator;
use Zend\Validator\AbstractValidator;
use Zend\Authentication\Adapter\DbTable as DbTableAuthAdapter;
use Zend\Db\TableGateway\TableGateway;
use Zend\Stdlib\Hydrator\ObjectProperty;
use Zend\Db\ResultSet\HydratingResultSet;
use Zend\ModuleManager\ModuleEvent;

use MelisCore\Listener\MelisCoreGetRightsTreeViewListener;
use MelisCore\Listener\MelisCoreToolUserAddNewUserListener;
use MelisCore\Listener\MelisCoreToolUserUpdateUserListener;
use MelisCore\Listener\MelisCoreFlashMessengerListener;
use MelisCore\Listener\MelisCoreNewPlatformListener;
use MelisCore\Listener\MelisCoreInstallNewPlatformListener;
use MelisCore\Listener\MelisCoreInstallCreateNewUserListener;

use MelisCore\Model\MelisPlatform;
use MelisCore\Model\Tables\MelisPlatformTable;
use MelisCore\Model\MelisLang;
use MelisCore\Model\Tables\MelisLangTable;
use MelisCore\Model\MelisUser;
use MelisCore\Model\Tables\MelisUserTable;
use MelisCore\Model\MelisUserRole;
use MelisCore\Model\Tables\MelisUserRoleTable;
use MelisCore\Model\MelisLostPassword;
use MelisCore\Model\Tables\MelisLostPasswordTable;

use MelisCore\Model\Tables\MelisBOEmailsTable;
use MelisCore\Model\MelisBOEmails;
use MelisCore\Model\Tables\MelisBOEmailsDetailsTable;
use MelisCore\Model\MelisBOEmailsDetails;

use Zend\ServiceManager;
class Module
{   
    public function onBootstrap(MvcEvent $e)
    {
        $this->initShowErrorsByconfig($e);
        
        $eventManager        = $e->getApplication()->getEventManager();
        $moduleRouteListener = new ModuleRouteListener();
        $moduleRouteListener->attach($eventManager);

        $this->initSession($e);
        $this->createTranslations($e);
        
        $eventManager->getSharedManager()->attach(__NAMESPACE__,
        		MvcEvent::EVENT_DISPATCH, function($e) {
        			$e->getTarget()->layout('layout/layoutCore');
        		});

        $eventManager->attach(MvcEvent::EVENT_DISPATCH, function($e) {
        	$this->checkIdentity($e);
        });
        
     /*   $eventManager->attach(MvcEvent::EVENT_DISPATCH_ERROR, function($e) {
            $e->getTarget()->layout('layout/layoutError');
        }, 100);
       */ 

        $eventManager->attach(new MelisCoreGetRightsTreeViewListener());
        $eventManager->attach(new MelisCoreToolUserAddNewUserListener());
        $eventManager->attach(new MelisCoreToolUserUpdateUserListener());
        $eventManager->attach(new MelisCoreFlashMessengerListener());
        $eventManager->attach(new MelisCoreNewPlatformListener());
        
        $eventManager->attach(new MelisCoreInstallNewPlatformListener());
        $eventManager->attach(new MelisCoreInstallCreateNewUserListener());

    }
    
    public function initShowErrorsByconfig(MvcEvent $e)
    {
        $sm = $e->getApplication()->getServiceManager();
    	$melisAppConfig = $sm->get('MelisCoreConfig');
    	$coreConfig = $melisAppConfig->getItemPerPlatform('/meliscore/datas/');
    	if (!empty($coreConfig['errors']) &&
    			isset($coreConfig['errors']['error_reporting']) &&
    			isset($coreConfig['errors']['display_errors']))
    	{
    		error_reporting($coreConfig['errors']['error_reporting']);
    		ini_set('display_errors', $coreConfig['errors']['display_errors']);
    	}
    	else {
    	    
    	    $eventManager = $e->getApplication()->getEventManager();
    	    
            $eventManager->attach(MvcEvent::EVENT_DISPATCH_ERROR, function($e) {
            	$viewModel = $e->getViewModel();
            	$viewModel->setTemplate('layout/layoutError');
            	$e->stopPropagation();
            }, 500);
            
            $eventManager->attach(MvcEvent::EVENT_RENDER_ERROR, function($e) {
            	$viewModel = $e->getViewModel();
            	$viewModel->setTemplate('layout/layoutError');
            	$e->stopPropagation();
            }, 500);
            
    	}
    }
    
    public function checkIdentity(MvcEvent $e)
    {
    	$sm = $e->getApplication()->getServiceManager();
    	$melisCoreAuth = $sm->get('MelisCoreAuth');

    	$routeMatch = $e->getRouteMatch();
    	$matchedRouteName = $routeMatch->getMatchedRouteName();

    	$excludedRoutes = array(
    		'melis-backoffice/login',
    		'melis-backoffice/authenticate',
    		'melis-backoffice/change-language',
    	    'melis-backoffice/get-translations',
    	    'melis-backoffice/lost-password',
    	    'melis-backoffice/lost-password-request',
    	    'melis-backoffice/reset-password',
    	    'melis-backoffice/islogin',
    	    'melis-backoffice/setup',
    	    'melis-backoffice/application-MelisInstaller/default',
    	    'melis-backoffice/MelisInstaller',
    	);
    	if (in_array($matchedRouteName, $excludedRoutes))
    		return true;
    	
    	if (!$melisCoreAuth->hasIdentity())
    	{
    		$controller = $e->getTarget();
    		$controller->plugin('redirect')->toUrl('/melis/login');
    		$e->stopPropagation();
    		return false;
    	}
    }
    
    public function init(ModuleManager $mm) 
    {
        $mm->getEventManager()->getSharedManager()->attach('MelisCore', MvcEvent::EVENT_DISPATCH, function($e) {
            
            $routeMatch  = $e->getRouteMatch();
            $routeParams = $routeMatch->getParams();
            
            $controller = '';
            $action = '';
            
            if(!empty($routeParams['controller']))
                $controller = $routeParams['controller'];
            if (!empty($routeParams['action']))
                $action = $routeParams['action'];
            if($controller == 'MelisCore\Controller\User' && $action == 'renderResetPassword') 
            {
                $sm = $e->getApplication()->getServiceManager();
                $oController = $e->getTarget();
                $rhash = $e->getRouteMatch()->getParam('rhash');
                $result = @$oController->forward()->dispatch('MelisCore\Controller\User',
        							array('action' => 'setHash', 
        							      'rhash' => $rhash))->getVariables();
            }
            
        }, 100);
        

       $events = $mm->getEventManager();
       
            // Registering a listener at default priority, 1, which will trigger
            // after the ConfigListener merges config.
       $events->attach(ModuleEvent::EVENT_MERGE_CONFIG, array($this, 'melisAssetsCaching'));
        
    }
    
    public function initSession(MvcEvent $e)
    {
    	$sm = $e->getApplication()->getServiceManager();
    	$container = new Container('meliscore');
    	
    	$translator = $sm->get('translator');
    	$locale = $translator->getLocale();
    	$langId = 1;
    	
    	// check first if the db config is available
    	$env = getenv('MELIS_PLATFORM');
    	$dbConfFile = 'config/autoload/platforms/'.$env.'.php';
    	if(file_exists($dbConfFile)) {
    	    if (empty($container['melis-lang-locale']))
    	    {
    	        $melisLangTable = $sm->get('MelisCore\Model\Tables\MelisLangTable');
    	        $datasLang = $melisLangTable->getEntryByField('lang_locale', $locale);
    	        $datasLang = $datasLang->current();
    	        $container['melis-lang-locale'] = $locale;
    	        $langId = is_null($datasLang->lang_id) ? 1 : $datasLang->lang_id;
    	    }

    	}
    	else {
    	    $container['melis-lang-id'] = $langId;
    	    $container['melis-lang-locale'] = $locale;
    	}

    }
    
    
    public function createTranslations($e, $locale = 'en_EN')
    {
    	$sm = $e->getApplication()->getServiceManager();
		$translator = $sm->get('translator');

    	$container = new Container('meliscore');
    	$locale = $container['melis-lang-locale'];
    	
    	$translator->addTranslationFile('phparray', __DIR__ . '/../language/' . $locale . '.interface.php');
    	$translator->addTranslationFile('phparray', __DIR__ . '/../language/' . $locale . '.forms.php');
    	
    	$lang = explode('_', $locale);
    	$lang = $lang[0];
    
    /*	
    	$translatorVal = new Translator();
    	$translatorVal->addTranslationFile(
    			'phpArray',
    			'vendor/ZF2/resources/languages/' . $lang. '/Zend_Validate.php',
    			'default',
    			$locale
    	);
    	$translatorVal->addTranslationFile(
    			'phpArray',
    			'vendor/ZF2/resources/languages/' . $lang. '/Zend_Captcha.php',
    			'default',
    			$locale
    	);
    	
    	AbstractValidator::setDefaultTranslator(new \Zend\Mvc\I18n\Translator($translatorVal));
    */	
    	
    }

    public function getConfig()
    {
    	$config = array();
    	$configFiles = array(
			include __DIR__ . '/../config/module.config.php',
			include __DIR__ . '/../config/app.interface.php',
			include __DIR__ . '/../config/app.forms.php',
	        include __DIR__ . '/../config/app.tools.php',
	        include __DIR__ . '/../config/app.emails.php',
	        include __DIR__ . '/../config/diagnostic.config.php',
    	);
    	
    	
    	
    	foreach ($configFiles as $file) 
    	{
    	   $config = ArrayUtils::merge($config, $file);
    	    
    	} 
    	
    	return $config;
    }
    
    public function melisAssetsCaching(ModuleEvent $e)
    {
        $configListener = $e->getConfigListener();
        $config         = $configListener->getMergedConfig(false);
    
        if (!empty($config['asset_manager']))
        {
            if (!empty($config['asset_manager']['activate_cache']))
            {
                $activateCache = 1;
                $activateCacheArray = $config['asset_manager']['activate_cache'];
                $platform = getenv('MELIS_PLATFORM');
                if (isset($activateCacheArray['platforms'][$platform]))
                    $activateCache = $activateCacheArray['platforms'][$platform];
                else
                    if (isset($activateCacheArray['platforms']['default']))
                        $activateCache = $activateCacheArray['platforms']['default'];
            }
            
            if (!$activateCache)
                unset($config['asset_manager']['caching']);
        }
    
        // Pass the changed configuration back to the listener:
        $configListener->setMergedConfig($config);
    }
    
    public function getServiceConfig()
    {
    	return array(
    			'factories' => array(
    					'MelisCore\Service\MelisCoreConfigService' =>  function($sm) {
    						$melisCoreConfigService = new \MelisCore\Service\MelisCoreConfigService();
    						$melisCoreConfigService->setServiceLocator($sm);
    						return $melisCoreConfigService;
    					},
    					'MelisCore\Service\MelisCoreDispatchService' =>  function($sm) {
    						$melisCoreDispatchService = new \MelisCore\Service\MelisCoreDispatchService();
    						$melisCoreDispatchService->setServiceLocator($sm);
    						return $melisCoreDispatchService;
    					},
    					'MelisCore\Service\MelisCoreAuthService' =>  function($sm) {
    						$dbAdapter = $sm->get('Zend\Db\Adapter\Adapter');
    						$dbTableAuthAdapter  = new DbTableAuthAdapter($dbAdapter);
    						$dbTableAuthAdapter->setTableName('melis_core_user')
									    		->setIdentityColumn('usr_login')
									    		->setCredentialColumn('usr_password');

    						$authService = new \MelisCore\Service\MelisCoreAuthService();
    						$authService->setAdapter($dbTableAuthAdapter);
    						
    						$storage = new \Zend\Authentication\Storage\Session('Melis_Auth');
    						$authService->setStorage($storage);
    						//$authService->setStorage($sm->get('MelisAuthSessionService'));
    						
    						return $authService;
    					}, 
    					'MelisCore\Service\MelisCoreUserService' =>  function($sm) {
    						$melisCoreUserService = new \MelisCore\Service\MelisCoreUserService();
    						$melisCoreUserService->setServiceLocator($sm);
    						return $melisCoreUserService;
    					},
    					'MelisCore\Service\MelisCoreRightsService' =>  function($sm) {
    						$melisCoreRightsService = new \MelisCore\Service\MelisCoreRightsService();
    						$melisCoreRightsService->setServiceLocator($sm);
    						return $melisCoreRightsService;
    					},
    					'MelisCore\Service\MelisCoreFlashmessenger' => function($sm) {
        					$melisCoreFlashMessenger = new \MelisCore\Service\MelisCoreFlashMessengerService();
        					$melisCoreFlashMessenger->setServiceLocator($sm);
        					return $melisCoreFlashMessenger;
    					},
    					'MelisCore\Service\MelisCoreImage' => function($sm) {
        					$melisCoreImage = new \MelisCore\Service\MelisCoreImageService();
        					$melisCoreImage->setServiceLocator($sm);
        					return $melisCoreImage;
    					},
    					'MelisCore\Service\MelisCoreTranslation' => function($sm) { 
        					$melisCoreTranslation = new \MelisCore\Service\MelisCoreTranslationService();
        					$melisCoreTranslation->setServiceLocator($sm);
        					return $melisCoreTranslation;
    					},
    					'MelisCore\Service\MelisCoreLostPassword' => function($sm) {
        					$melisCoreLostPass = new \MelisCore\Service\MelisCoreLostPasswordService();
        					$melisCoreLostPass->setServiceLocator($sm);
        					return $melisCoreLostPass;
    					},
    					'MelisCore\Service\MelisCoreTool' => function($sm) {
        					$melisCoreTool = new \MelisCore\Service\MelisCoreToolService();
        					$melisCoreTool->setServiceLocator($sm);
        					return $melisCoreTool;
    					},
    					'MelisCore\Model\Tables\MelisPlatformTable' =>  function($sm) {
    						return new MelisPlatformTable($sm->get('MelisPlatformTableGateway'));
    					},
    					'MelisPlatformTableGateway' => function ($sm) {
    						$hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisPlatform());
    						return new TableGateway('melis_core_platform', $sm->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);	
    					},
    					'MelisCore\Model\Tables\MelisLangTable' =>  function($sm) {
    						return new MelisLangTable($sm->get('MelisLangTableGateway'));
    					},
    					'MelisLangTableGateway' => function ($sm) {
    						$hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisLang());
    						return new TableGateway('melis_core_lang', $sm->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);	
    					},
    					'MelisCore\Model\Tables\MelisUserTable' =>  function($sm) {
    						return new MelisUserTable($sm->get('MelisUserTableGateway'));
    					},
    					'MelisUserTableGateway' => function ($sm) {
    						$hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisUser());
    						return new TableGateway('melis_core_user', $sm->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);	
    					}, 
    					'MelisCore\Model\Tables\MelisUserRoleTable' =>  function($sm) {
    						return new MelisUserRoleTable($sm->get('MelisUserRoleTableGateway'));
    					},
    					'MelisUserRoleTableGateway' => function ($sm) {
    						$hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisUserRole());
    						return new TableGateway('melis_core_user_role', $sm->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);	
    					}, 
    					'MelisUserRoleTableGateway' => function ($sm) {
        					$hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisUserRole());
        					return new TableGateway('melis_core_user_role', $sm->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);
    					},
    					'MelisLostPasswordTableGateway' => function ($sm) {
        					$hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisLostPassword());
        					return new TableGateway('melis_core_lost_password', $sm->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);
    					},
    					'MelisCore\Model\Tables\MelisLostPasswordTable' =>  function($sm) {
    					   return new MelisLostPasswordTable($sm->get('MelisLostPasswordTableGateway'));
    					},
    					
    					'MelisCore\Model\Tables\MelisBOEmailsTable' =>  function($sm) {
    					   return new MelisBOEmailsTable($sm->get('MelisBOEmailsTableGateway'));
    					},
    					'MelisBOEmailsTableGateway' => function ($sm) {
    					$hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisBOEmails());
    					   return new TableGateway('melis_core_bo_emails', $sm->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);
    					},
    					'MelisCore\Model\Tables\MelisBOEmailsDetailsTable' =>  function($sm) {
    					   return new MelisBOEmailsDetailsTable($sm->get('MelisBOEmailsDetailsTableGateway'));
    					},
    					'MelisBOEmailsDetailsTableGateway' => function ($sm) {
        					$hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisBOEmailsDetails());
        					return new TableGateway('melis_core_bo_emails_details', $sm->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);
    					},
    					'MelisCore\Service\MelisCoreBOEmailService' =>  function($sm) {
        					$melisCalendarService = new \MelisCore\Service\MelisCoreBOEmailService();
        					$melisCalendarService->setServiceLocator($sm);
        					return $melisCalendarService;
    					},
    					'MelisCore\Service\MelisCoreEmailSendingService' =>  function($sm) {
        					$melisCalendarService = new \MelisCore\Service\MelisCoreEmailSendingService();
        					$melisCalendarService->setServiceLocator($sm);
        					return $melisCalendarService;
    					},
    					'MelisCore\Service\MelisCoreModulesService' =>  function($sm) {
    					$modulesSvc = new \MelisCore\Service\MelisCoreModulesService();
    					$modulesSvc->setServiceLocator($sm);
    					return $modulesSvc;
    					},
    			),
    	); 
    }
    
    public function getViewHelperConfig()
	{
		return array(
			'factories' => array(
							'MelisCoreHeadPlugin' => function($sm) {
							$sm = $sm->getServiceLocator();
 							$helper = new \MelisCore\View\Helper\MelisCoreHeadPluginHelper($sm);
							return $helper;
    					}
    				)
    		);
    }
}