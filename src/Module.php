<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore;

use Laminas\ModuleManager\ModuleEvent;
use MelisCore\Listener\MelisChangeLangOnCreatePassListener;
use MelisCore\Listener\MelisCoreClearCacheListenerListener;
use MelisCore\Listener\MelisCoreDashboardPluginRightsTreeViewListener;
use MelisCore\Listener\MelisCoreAuthSuccessListener;
use MelisCore\Listener\MelisCoreCheckUserRightsListener;
use MelisCore\Listener\MelisCoreDashboardMenuListener;
use MelisCore\Listener\MelisCoreFlashMessengerListener;
use MelisCore\Listener\MelisCoreGetRightsTreeViewListener;
use MelisCore\Listener\MelisCoreInsertDashboardPluginListener;
use MelisCore\Listener\MelisCoreInstallCreateNewUserListener;
use MelisCore\Listener\MelisCoreMicroServiceRouteParamListener;
use MelisCore\Listener\MelisCoreNewPlatformListener;
use MelisCore\Listener\MelisCorePhpWarningListener;
use MelisCore\Listener\MelisCorePluginsAdditionalListener;
use MelisCore\Listener\MelisCorePluginsListener;
use MelisCore\Listener\MelisCorePluginsRemovalListener;
use MelisCore\Listener\MelisCoreTableColumnDisplayListener;
use MelisCore\Listener\MelisCoreTinyMCEConfigurationListener;
use MelisCore\Listener\MelisCoreToolUserAddNewUserListener;
use MelisCore\Listener\MelisCoreToolUserUpdateUserListener;
use MelisCore\Listener\MelisCoreUrlAccessCheckerListenner;
use MelisCore\Listener\MelisCoreUserRecentLogsListener;
use MelisCore\Listener\MelisCoreUrlPlatformSchemeListener;
use MelisCore\Listener\MelisCoreOtherConfigListener;
use MelisCore\Listener\MelisCoreUpdatePasswordHistoryListener;
use Laminas\ModuleManager\ModuleManager;
use Laminas\Mvc\ModuleRouteListener;
use Laminas\Mvc\MvcEvent;
use Laminas\Session\Container;
use Laminas\Stdlib\ArrayUtils;
use MelisCore\Listener\MelisGenerateBundleListener;

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

        $eventManager = $e->getApplication()->getEventManager();
        $moduleRouteListener = new ModuleRouteListener();
        $moduleRouteListener->attach($eventManager);

        $this->initSession($e);
        $this->createTranslations($e);

        $eventManager->getSharedManager()->attach(
            __NAMESPACE__,
            MvcEvent::EVENT_DISPATCH,
            function ($e) {
                $e->getTarget()->layout('layout/layoutCore');
            }
        );

        $eventManager->attach(MvcEvent::EVENT_ROUTE, function ($e) {
            $this->checkIdentity($e);
        });

        /** @var \MelisCore\Service\MelisCoreModulesService $moduleSvc */
        $moduleSvc = $e->getApplication()->getServiceManager()->get('ModulesService');
        $moduleSvc->unloadModule('MelisInstaller');

        if (!$this->isInInstallMode($e)) {
            // url platform scheme redirector

            (new MelisCoreOtherConfigListener())->attach($eventManager);
            (new MelisCoreUpdatePasswordHistoryListener())->attach($eventManager);
            (new MelisCoreUrlPlatformSchemeListener())->attach($eventManager);
            (new MelisCoreFlashMessengerListener())->attach($eventManager);
            (new MelisCoreGetRightsTreeViewListener())->attach($eventManager);
            (new MelisCoreToolUserAddNewUserListener())->attach($eventManager);
            (new MelisCoreToolUserUpdateUserListener())->attach($eventManager);
            (new MelisCoreNewPlatformListener())->attach($eventManager);
            (new MelisCoreUserRecentLogsListener())->attach($eventManager);
            (new MelisCoreCheckUserRightsListener())->attach($eventManager);
            (new MelisCoreTinyMCEConfigurationListener())->attach($eventManager);
            (new MelisCoreMicroServiceRouteParamListener())->attach($eventManager);
            (new MelisCoreAuthSuccessListener())->attach($eventManager);
            (new MelisCorePhpWarningListener())->attach($eventManager);
            (new MelisCoreDashboardPluginRightsTreeViewListener())->attach($eventManager);
            (new MelisCoreUrlAccessCheckerListenner())->attach($eventManager);
            (new MelisCoreTableColumnDisplayListener())->attach($eventManager);
            (new MelisCoreClearCacheListenerListener())->attach($eventManager);
            (new MelisCoreInsertDashboardPluginListener())->attach($eventManager);
        }
    }

    public function initShowErrorsByconfig(MvcEvent $e)
    {
        $sm = $e->getApplication()->getServiceManager();
        $melisAppConfig = $sm->get('MelisCoreConfig');
        $coreConfig = $melisAppConfig->getItemPerPlatform('/meliscore/datas/');
        if (
            !empty($coreConfig['errors']) &&
            isset($coreConfig['errors']['error_reporting']) &&
            isset($coreConfig['errors']['display_errors'])
        ) {
            error_reporting($coreConfig['errors']['error_reporting']);
            ini_set('display_errors', $coreConfig['errors']['display_errors']);
        } else {
            $eventManager = $e->getApplication()->getEventManager();

            $eventManager->attach(MvcEvent::EVENT_DISPATCH_ERROR, function ($e) {
                $viewModel = $e->getViewModel();
                $viewModel->setTemplate('layout/layoutError');
                $e->stopPropagation();
            }, 500);

            $eventManager->attach(MvcEvent::EVENT_RENDER_ERROR, function ($e) {
                $viewModel = $e->getViewModel();
                $viewModel->setTemplate('layout/layoutError');
                $e->stopPropagation();
            }, 500);
        }
    }

    public function initSession(MvcEvent $e)
    {
        // set cookie attribute samesite
        if (session_status() == PHP_SESSION_NONE) {
            ini_set('session.cookie_samesite', 'Strict');
            session_start();
        }

        $sm = $e->getApplication()->getServiceManager();
        $container = new Container('meliscore');

        $translator = $sm->get('translator');
        $locale = $translator->getLocale();
        $langId = 1;

        // check first if the db config is available
        $env = getenv('MELIS_PLATFORM');
        $dbConfFile = 'config/autoload/platforms/' . $env . '.php';
        if (file_exists($dbConfFile)) {
            if (empty($container['melis-lang-locale'])) {
                $melisLangTable = $sm->get('MelisCoreTableLang');
                $datasLang = $melisLangTable->getEntryByField('lang_locale', $locale)->current();

                if ($datasLang) {
                    $container['melis-lang-locale'] = $locale;
                    $langId = is_null($datasLang->lang_id) ? 1 : $datasLang->lang_id;
                } else {
                    $container['melis-lang-locale'] = 'en_EN';
                }
            }
        } else {
            $container['melis-lang-id'] = $langId;
            $container['melis-lang-locale'] = $locale;
        }
    }

    public function changePasswordPageLangOverride($e)
    {
        // AssetManager, we don't want listener to be executed if it's not a php code
        $uri = $_SERVER['REQUEST_URI'];

        $route = isset(explode('/', $uri)[2]) ? explode('/', $uri)[2] : null;
        $rhash = isset(explode('/', $uri)[3]) ? explode('/', $uri)[3] : null;
        $sm = $e->getApplication()->getServiceManager();

        if (!empty($route)) {
            if (strpos($route, "change-language") !== false) {
                $container = new Container('meliscore');
                $container['melis-lang-changed'] = true;
            } else {
                if ($route == "generate-password" || $route == "renew-password" || $route == "reset-password") {
                    /** @var MelisCoreCreatePasswordService $melisCreatePass */
                    $melisCreatePass = $sm->get('MelisCoreCreatePassword');

                    $melisLostPass = $sm->get('MelisCoreLostPassword');
                    $usr = $route != "reset-password" ? $melisCreatePass->getUserByHash($rhash) : $melisLostPass->getUserByHash($rhash);

                    $container = new Container('meliscore');
                    $isLangChanged = $container['melis-lang-changed'];
                    if ($usr && !$isLangChanged) {
                        $usrLang = isset($usr->usr_lang_id) ? $usr->usr_lang_id : null;

                        $melisLangTable = $sm->get('MelisCore\Model\Tables\MelisLangTable');
                        $melisUserTable = $sm->get('MelisCore\Model\Tables\MelisUserTable');
                        $melisCoreAuth = $sm->get('MelisCoreAuth');

                        $datasLang = $melisLangTable->getEntryById($usrLang);


                        // If the language was found and then exists
                        if (!empty($datasLang)) {
                            $datasLang = $datasLang->current();

                            // Update session locale for melis BO
                            $container = new Container('meliscore');
                            $container['melis-lang-id'] = $usrLang;
                            $container['melis-lang-locale'] = isset($datasLang->lang_locale) ? $datasLang->lang_locale : "EN_en";
                            $container['melis-login-lang-locale'] = isset($datasLang->lang_locale) ? $datasLang->lang_locale : "EN_en";

                            // Get user id from session auth
                            $userAuthDatas = $melisCoreAuth->getStorage()->read();
                            if (!isset($userAuthDatas->usr_lang_id))
                                $userAuthDatas = (object)array("usr_lang_id" => '');

                            // Update auth user session
                            $userAuthDatas->usr_lang_id = $usrLang;
                        }
                    }
                    $container = new Container('meliscore');
                    $container['melis-lang-changed'] = false;
                }
            }
        }
    }

    public function createTranslations($e, $locale = 'en_EN')
    {
        $sm = $e->getApplication()->getServiceManager();
        $translator = $sm->get('translator');

        $this->changePasswordPageLangOverride($e);

        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];

        if (!empty($locale)) {

            $translationType = [
                'interface',
                'forms',
                'install',
                'setup',
                'gdpr.autodelete',
            ];

            $translationList = [];
            if (file_exists($_SERVER['DOCUMENT_ROOT'] . '/../module/MelisModuleConfig/config/translation.list.php')) {
                $translationList = include 'module/MelisModuleConfig/config/translation.list.php';
            }

            foreach ($translationType as $type) {

                $transPath = '';
                $moduleTrans = __NAMESPACE__ . "/$locale.$type.php";

                if (in_array($moduleTrans, $translationList)) {
                    $transPath = "module/MelisModuleConfig/languages/" . $moduleTrans;
                }

                if (empty($transPath)) {

                    // if translation is not found, use melis default translations
                    $defaultLocale = (file_exists(__DIR__ . "/../language/$locale.$type.php")) ? $locale : "en_EN";
                    $transPath = __DIR__ . "/../language/$defaultLocale.$type.php";
                }

                $translator->addTranslationFile('phparray', $transPath);
            }
        }

        $lang = explode('_', $locale);
        $lang = $lang[0];
    }


    public function checkIdentity(MvcEvent $e)
    {
        $sm = $e->getApplication()->getServiceManager();
        $melisCoreAuth = $sm->get('MelisCoreAuth');
        $routeMatch = $e->getRouteMatch();
        $matchedRouteName = $routeMatch->getMatchedRouteName();

        // Get excluded routes
        $excludedRoutes = $sm->get('MelisConfig')->getItem('/meliscore/datas/excluded_routes');

        // INFO: If the route is in excludedRoutes or it's a CLI request, allow it
        if (in_array($matchedRouteName, $excludedRoutes) || php_sapi_name() == 'cli') {
            return true;
        }

        $request = $e->getRequest();
        $method = strtoupper($request->getMethod());

        // INFO: Check if the user is authenticated
        $isAuthenticated = $melisCoreAuth->hasIdentity();

        // INFO: If method is not GET and not authenticated, return 404
        if ($method !== 'GET' && !$isAuthenticated) {
            header("HTTP/1.0 404 Not Found");
            $e->stopPropagation();
            exit;
        }

        // INFO: If method is GET and not authenticated, redirect to login
        if ($method === 'GET' && !$isAuthenticated) {
            $e->stopPropagation();
            header('Location: /melis/login');
            exit;
        }

        // INFO: If authenticated and not caught by any of the above conditions, allow access
        return true;
    }


    private function isInInstallMode($e)
    {
        $sm = $e->getApplication()->getServiceManager();
        $mm = $sm->get('ModuleManager');
        $loadedModules = array_keys($mm->getLoadedModules());

        if (in_array('MelisInstaller', $loadedModules)) {
            return true;
        }

        return false;
    }

    public function init(ModuleManager $mm)
    {
        $mm->getEventManager()->getSharedManager()->attach('MelisCore', MvcEvent::EVENT_DISPATCH, function ($e) {

            $routeMatch = $e->getRouteMatch();
            $routeParams = $routeMatch->getParams();

            $controller = '';
            $action = '';

            if (!empty($routeParams['controller'])) {
                $controller = $routeParams['controller'];
            }
            if (!empty($routeParams['action'])) {
                $action = $routeParams['action'];
            }
            if ($controller == 'MelisCore\Controller\User' && $action == 'renderResetPassword') {
                $sm = $e->getApplication()->getServiceManager();
                $oController = $e->getTarget();
                $rhash = $e->getRouteMatch()->getParam('rhash');
                $result = @$oController->forward()->dispatch(
                    'MelisCore\Controller\User',
                    [
                        'action' => 'setHash',
                        'rhash' => $rhash,
                    ]
                )->getVariables();
            }
        }, 100);

        $events = $mm->getEventManager();

        $events->attach(ModuleEvent::EVENT_LOAD_MODULES_POST, [new MelisGenerateBundleListener(), 'onLoadModulesPost']);
    }



    public function getConfig()
    {
        $config = [];
        $configFiles = [
            include __DIR__ . '/../config/module.config.php',
            include __DIR__ . '/../config/app.interface.php',
            include __DIR__ . '/../config/app.toolstree.php',
            include __DIR__ . '/../config/app.forms.php',
            include __DIR__ . '/../config/otherconfig.php',
            include __DIR__ . '/../config/app.tools.php',
            include __DIR__ . '/../config/app.emails.php',
            include __DIR__ . '/../config/diagnostic.config.php',
            include __DIR__ . '/../config/app.microservice.php',
            include __DIR__ . '/../config/setup/download.config.php',
            include __DIR__ . '/../config/setup/update.config.php',
            include __DIR__ . '/../config/dashboard-plugins/MelisCoreDashboardDragDropZonePlugin.config.php',
            include __DIR__ . '/../config/dashboard-plugins/MelisCoreDashboardRecentUserActivityPlugin.config.php',
            include __DIR__ . '/../config/dashboard-plugins/MelisCoreDashboardBubblePlugin.config.php',
            include __DIR__ . '/../config/dashboard-plugins/MelisCoreDashboardBubbleNewsMelisPlugin.config.php',
            include __DIR__ . '/../config/dashboard-plugins/MelisCoreDashboardBubbleUpdatesPlugin.config.php',
            include __DIR__ . '/../config/dashboard-plugins/MelisCoreDashboardBubbleNotificationsPlugin.config.php',
            include __DIR__ . '/../config/dashboard-plugins/MelisCoreDashboardBubbleChatPlugin.config.php',
            include __DIR__ . '/../config/dashboard-plugins/MelisCoreDashboardAnnouncementPlugin.config.php',
            /*
             * gdpr auto delete
             */
            include __DIR__ . '/../config/gdpr-autodelete/app.interface.php',
            include __DIR__ . '/../config/gdpr-autodelete/app.tools.php',
            include __DIR__ . '/../config/gdpr-autodelete/app.forms.php',
            include __DIR__ . '/../config/gdpr-autodelete/app.smtp.form.php',
            /*
             * excluded routes
             */
            include __DIR__ . '/../config/excluded.routes.php'

        ];

        // include login config if it exists
        $loginConfigPath = __DIR__ . '/../config/app.login.php';
        $configFiles[] = file_exists($loginConfigPath) ? include $loginConfigPath : [];

        foreach ($configFiles as $file) {
            $config = ArrayUtils::merge($config, $file);
        }

        return $config;
    }

    public function getAutoloaderConfig()
    {
        return [
            'Laminas\Loader\StandardAutoloader' => [
                'namespaces' => [
                    __NAMESPACE__ => __DIR__ . '/src/' . __NAMESPACE__,
                ],
            ],
        ];
    }
}
