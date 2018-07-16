<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore;

use Zend\Mvc\ModuleRouteListener;
use Zend\Mvc\MvcEvent;
use Zend\ModuleManager\ModuleManager;
use Zend\Session\Container;
use Zend\Stdlib\ArrayUtils;
use Zend\ModuleManager\ModuleEvent;

use MelisCore\Listener\MelisCoreGetRightsTreeViewListener;
use MelisCore\Listener\MelisCoreToolUserAddNewUserListener;
use MelisCore\Listener\MelisCoreToolUserUpdateUserListener;
use MelisCore\Listener\MelisCoreFlashMessengerListener;
use MelisCore\Listener\MelisCoreNewPlatformListener;
use MelisCore\Listener\MelisCoreInstallNewPlatformListener;
use MelisCore\Listener\MelisCoreInstallCreateNewUserListener;
use MelisCore\Listener\MelisCoreUserRecentLogsListener;
use MelisCore\Listener\MelisCoreAuthSuccessListener;
use MelisCore\Listener\MelisCoreCheckUserRightsListener;
use MelisCore\Listener\MelisCoreTinyMCEConfigurationListener;
use MelisCore\Listener\MelisCoreMicroServiceRouteParamListener;

/**
 * Class Module
 * @package MelisCore
 * @require melis-core
 */
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


        if(!$this->isInInstallMode($e)) {
            $eventManager->attach(new MelisCoreGetRightsTreeViewListener());
            $eventManager->attach(new MelisCoreToolUserAddNewUserListener());
            $eventManager->attach(new MelisCoreToolUserUpdateUserListener());
            $eventManager->attach(new MelisCoreFlashMessengerListener());
            $eventManager->attach(new MelisCoreNewPlatformListener());
            $eventManager->attach(new MelisCoreUserRecentLogsListener());

            $eventManager->attach(new MelisCoreCheckUserRightsListener());
            $eventManager->attach(new MelisCoreTinyMCEConfigurationListener());
            $eventManager->attach(new MelisCoreMicroServiceRouteParamListener());

            $eventManager->attach(new MelisCoreAuthSuccessListener());
        }

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
    	else 
    	{
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
    	    'melis-backoffice/microservice',
    	    'melis-backoffice/microservice_list',
            'melis-backoffice/get-platform-color-css'
    	);
    	if (in_array($matchedRouteName, $excludedRoutes) || php_sapi_name() == 'cli')
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
                $datasLang = $melisLangTable->getEntryByField('lang_locale', $locale)->current();

                if($datasLang) {
                    $container['melis-lang-locale'] = $locale;
                    $langId = is_null($datasLang->lang_id) ? 1 : $datasLang->lang_id;
                }
                else {
                    $container['melis-lang-locale'] = 'en_EN';
                }
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
    	
    	if (!empty($locale))
    	{
    	    
    	    $translationType = array(
    	        'interface',
    	        'forms',
                'install'
    	    );
    	    
    	    $translationList = array();
    	    if(file_exists($_SERVER['DOCUMENT_ROOT'].'/../module/MelisModuleConfig/config/translation.list.php')){
                $translationList = include 'module/MelisModuleConfig/config/translation.list.php';
            }

            foreach($translationType as $type){
                
                $transPath = '';
                $moduleTrans = __NAMESPACE__."/$locale.$type.php";
                
                if(in_array($moduleTrans, $translationList)){
                    $transPath = "module/MelisModuleConfig/languages/".$moduleTrans;
                }

                if(empty($transPath)){
                    
                    // if translation is not found, use melis default translations
                    $defaultLocale = (file_exists(__DIR__ . "/../language/$locale.$type.php"))? $locale : "en_EN";
                    $transPath = __DIR__ . "/../language/$defaultLocale.$type.php";
                }
                
                $translator->addTranslationFile('phparray', $transPath);
            }
    	}
    	
    	$lang = explode('_', $locale);
    	$lang = $lang[0];
    }

    public function getConfig()
    {
    	$config = array();
    	$configFiles = array(
			include __DIR__ . '/../config/module.config.php',
            include __DIR__ . '/../config/app.interface.php',
            include __DIR__ . '/../config/app.interface.general.php',
            include __DIR__ . '/../config/app.forms.php',
            include __DIR__ . '/../config/app.tools.php',
            include __DIR__ . '/../config/app.emails.php',
            include __DIR__ . '/../config/diagnostic.config.php',
            include __DIR__ . '/../config/app.microservice.php',
            include __DIR__ . '/../config/app.install.php',
    	);
    	
    	foreach ($configFiles as $file) 
    	{
    	   $config = ArrayUtils::merge($config, $file);
    	    
    	} 
    	
    	return $config;
    }

    public function getAutoloaderConfig()
    {
        return array(
            'Zend\Loader\StandardAutoloader' => array(
                'namespaces' => array(
                    __NAMESPACE__ => __DIR__ . '/src/' . __NAMESPACE__,
                ),
            ),
        );
    }

    private function isInInstallMode($e)
    {
        $sm = $e->getApplication()->getServiceManager();
        $mm = $sm->get('ModuleManager');
        $loadedModules = array_keys($mm->getLoadedModules());

        if(in_array('MelisInstaller', $loadedModules))
            return true;

        return false;
    }
}
