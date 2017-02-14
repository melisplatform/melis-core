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
        $eventManager->attach(new MelisCoreUserRecentLogsListener());
        
        $eventManager->attach(new MelisCoreInstallNewPlatformListener());
        $eventManager->attach(new MelisCoreInstallCreateNewUserListener());

        // Set cache directives
        $eventManager->attach(MvcEvent::EVENT_FINISH, function($e) {
            $sm = $e->getApplication()->getServiceManager();
            
            $assetManagerService = $sm->get('AssetManager\Service\AssetManager');
            
            $response = $e->getResponse();
            $headers = $response->getHeaders();
            
            $headers = array(
                'Cache-Control' => 'public',
                'Pragma' => '',
            );
            $e->getResponse()->getHeaders()->addHeaders($headers);
            
        }, -1000);
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
    	
    	if (!empty($locale))
    	{
    	    
    	    // Inteface translations
    	    $interfaceTransPath = 'module/MelisModuleConfig/languages/MelisCore/' . $locale . '.interface.php';
    	    $default = __DIR__ . '/../language/en_EN.interface.php';
    	    $transPath = (file_exists($interfaceTransPath))? $interfaceTransPath : $default;
    	    $translator->addTranslationFile('phparray', $transPath);
    	    	
     	    // Forms translations
    	    $formsTransPath = 'module/MelisModuleConfig/languages/MelisCore/' . $locale . '.forms.php';
    	    $default = __DIR__ . '/../language/en_EN.forms.php';
    	    $transPath = (file_exists($formsTransPath))? $formsTransPath : $default;
    	    $translator->addTranslationFile('phparray', $transPath);

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
}