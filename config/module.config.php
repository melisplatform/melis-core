<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */


return array(
    'router' => array(
        'routes' => array(
            'melis-backoffice' => array(
                'type' => 'Segment',
                'options' => array(
                    'route' => '/melis[/]',
                    'defaults' => array(
                        'controller' => 'MelisCore\Controller\Index',
                        'action' => 'melis',
                    ),
                ),
                'may_terminate' => true,
                'child_routes' => array(
                    'login' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => 'login[/]',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\MelisAuth',
                                'action' => 'loginpage',
                            ),
                        ),
                    ),
                    'lost-password' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => 'lost-password[/]',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\User',
                                'action' => 'renderLostPassword',
                            ),
                        ),
                    ),
                    'lost-password-request' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => 'lost-password-request[/]',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\User',
                                'action' => 'lostPasswordRequest',
                            ),
                        ),
                    ),
                    'reset-password' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => 'reset-password[/:rhash]',
                            'constraints' => array(
                                'rhash' => '[a-f0-9]*',
                            ),
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\User',
                                'action' => 'renderResetPassword',
                            ),
                        ),
                    ),
                    'authenticate' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => 'authenticate[/]',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\MelisAuth',
                                'action' => 'authenticate',
                            ),
                        ),
                    ),
                    'islogin' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => 'islogin[/]',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\MelisAuth',
                                'action' => 'isLoggedIn',
                            ),
                        ),
                    ),
                    'logout' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => 'logout[/]',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\MelisAuth',
                                'action' => 'logout',
                            ),
                        ),
                    ),
                    'zoneview' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => 'zoneview',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\PluginView',
                                'action' => 'generate',
                            ),
                        ),
                    ),
                    'change-language' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => 'change-language',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\Language',
                                'action' => 'change-language',
                            ),
                        ),
                    ),
                    'get-translations' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => 'get-translations',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\Language',
                                'action' => 'get-translations',
                            ),
                        ),
                    ),
                    'get-platform-color-css' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => 'platform-color-schemes.css',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\PlatformScheme',
                                'action' => 'getStyleColorCss',
                            ),
                        ),
                    ),
                    'application-MelisCore' => array(
                        'type' => 'Literal',
                        'options' => array(
                            'route' => 'MelisCore',
                            'defaults' => array(
                                '__NAMESPACE__' => 'MelisCore\Controller',
                                'controller' => 'Index',
                                'action' => 'melis',
                            ),
                        ),
                        'may_terminate' => true,
                        'child_routes' => array(
                            'default' => array(
                                'type' => 'Segment',
                                'options' => array(
                                    'route' => '/[:controller[/:action]]',
                                    'constraints' => array(
                                        'controller' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                        'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                    ),
                                    'defaults' => array(),
                                ),
                            ),

                        ),
                    ),
                    'microservice_list'  => array(
                        'type'      => 'Segment',
                        'options'   => array(
                            'route' => 'api[/:api_key]',
                            'constraint' => array(
                                'api_key'        => '[a-zA-Z0-9_\-\=\$\@]*',

                            ),
                            'defaults' => array(
                                '__NAMESPACE__' => 'MelisCore\Controller',
                                'controller'    => 'MelisCoreMicroService',
                                'action'        => 'micro-services-list'
                            ),
                        ),
                    ),
                    'microservice'  => array(
                        'type'      => 'Segment',
                        'options'   => array(
                            'route' => 'api[/:api_key][/:module]/service[/:service_alias[/:service_method]]',
                            'constraint' => array(
                                'api_key'        => '[a-zA-Z0-9_\-\=\$\@]*',
                                'module'         => '[A-Z][a-zA-Z0-9_-]*',
                                'service_alias'  => '[A-Z][a-zA-Z0-9_-]*',
                                'service_method' => '[a-zA-Z][a-zA-Z0-9_-]*',

                            ),
                            'defaults' => array(
                                '__NAMESPACE__' => 'MelisCore\Controller',
                                'controller'    => 'MelisCoreMicroService',
                                'action'        => 'run'
                            ),
                        ),
                    ),
                ),
            ),

            /*
             * This route will handle the
             * alone setup of a module
             */
            'setup-melis-core' => array(
                'type'    => 'Literal',
                'options' => array(
                    'route'    => '/MelisCore',
                    'defaults' => array(
                        '__NAMESPACE__' => 'MelisCore\Controller',
                        'controller'    => 'MelisSetup',
                        'action'        => 'setup-form',
                    ),
                ),
                'may_terminate' => true,
                'child_routes' => array(
                    'default' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => '/[:controller[/:action]]',
                            'constraints' => array(
                                'controller' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ),
                            'defaults' => array(
//
                            ),
                        ),
                    ),
                    'setup' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => '/setup',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\MelisSetup',
                                'action' => 'setup-form',
                            ),
                        ),
                    ),
                ),
            ),
        ),
    ),
    'translator' => array(
        'locale' => 'en_EN',
    ),
    'service_manager' => array(
        'aliases' => array(
            'translator' => 'MvcTranslator',
            'MelisCoreTablePlatform' => 'MelisCore\Model\Tables\MelisPlatformTable',
            'MelisCoreTableLang' => 'MelisCore\Model\Tables\MelisLangTable',
            'MelisCoreTableUser' => 'MelisCore\Model\Tables\MelisUserTable',
            'MelisCoreTableUserRole' => 'MelisCore\Model\Tables\MelisUserRoleTable',
            'MelisLostPasswordTable' => 'MelisCore\Model\Tables\MelisLostPasswordTable',
            'MelisCoreTableBOEmails' => 'MelisCore\Model\Tables\MelisBOEmailsTable',
            'MelisCoreTableBOEmailsDetails' => 'MelisCore\Model\Tables\MelisBOEmailsDetailsTable',
            'MelisCoreTableLog' => 'MelisCore\Model\Tables\MelisLogTable',
            'MelisCoreTableLogType' => 'MelisCore\Model\Tables\MelisLogTypeTable',
            'MelisCoreTableLogTypeTrans' => 'MelisCore\Model\Tables\MelisLogTypeTransTable',
            'MelisMicroServiceAuthTable' => 'MelisCore\Model\Tables\MelisMicroServiceAuthTable',
            'MelisUserConnectionDate' => 'MelisCore\Model\Tables\MelisUserConnectionDate' ,
            'MelisCorePlatformSchemeTable' => 'MelisCore\Model\Tables\MelisCorePlatformSchemeTable' ,
        ),
        'factories' => array(
            'MelisCoreConfig' => 'MelisCore\Service\Factory\MelisCoreConfigServiceFactory',
            'MelisCoreDispatch' => 'MelisCore\Service\Factory\MelisCoreDispatchServiceFactory',
            'MelisCoreAuth' => 'MelisCore\Service\Factory\MelisCoreAuthServiceFactory',
            'MelisCoreUser' => 'MelisCore\Service\Factory\MelisCoreUserServiceFactory',
            'MelisCoreRights' => 'MelisCore\Service\Factory\MelisCoreRightsServiceFactory',
            'MelisCoreFlashMessenger' => 'MelisCore\Service\Factory\MelisCoreFlashmessengerServiceFactory',
            'MelisCoreImage' => 'MelisCore\Service\Factory\MelisCoreImageServiceFactory',
            'MelisCoreTranslation' => 'MelisCore\Service\Factory\MelisCoreTranslationServiceFactory',
            'MelisCoreLostPassword' => 'MelisCore\Service\Factory\MelisCoreLostPasswordServiceFactory',
            'MelisCoreTool' => 'MelisCore\Service\Factory\MelisCoreToolServiceFactory',
            'MelisCoreBOEmailService' => 'MelisCore\Service\Factory\MelisCoreBOEmailServiceFactory',
            'MelisCoreEmailSendingService' => 'MelisCore\Service\Factory\MelisCoreEmailSendingServiceFactory',
            'ModulesService' => 'MelisCore\Service\Factory\MelisCoreModulesServiceFactory',
            'MelisCoreLogService' => 'MelisCore\Service\Factory\MelisCoreLogServiceFactory',
            'MelisPhpUnitTool' => 'MelisCore\Service\Factory\MelisPhpUnitToolServiceFactory',
            'MelisCoreMicroServiceTestService' => 'MelisCore\Service\Factory\MelisCoreMicroServiceTestServiceFactory',
            'MelisCorePlatformSchemeService' => 'MelisCore\Service\Factory\MelisCorePlatformSchemeServiceFactory',
            'MelisCoreGdprService' => 'MelisCore\Service\Factory\MelisCoreGdprServiceFactory', 

            'MelisCore\Model\Tables\MelisLangTable' => 'MelisCore\Model\Tables\Factory\MelisCoreMelisLangTableFactory',
            'MelisCore\Model\Tables\MelisUserTable' => 'MelisCore\Model\Tables\Factory\MelisCoreMelisUserTableFactory',
            'MelisCore\Model\Tables\MelisUserRoleTable' => 'MelisCore\Model\Tables\Factory\MelisCoreMelisUserRoleTableFactory',
            'MelisCore\Model\Tables\MelisPlatformTable' => 'MelisCore\Model\Tables\Factory\MelisCoreMelisPlatformTableFactory',
            'MelisCore\Model\Tables\MelisLostPasswordTable' => 'MelisCore\Model\Tables\Factory\MelisCoreMelisLostPasswordTableFactory',
            'MelisCore\Model\Tables\MelisBOEmailsTable' => 'MelisCore\Model\Tables\Factory\MelisCoreMelisBOEmailsTableFactory',
            'MelisCore\Model\Tables\MelisBOEmailsDetailsTable' => 'MelisCore\Model\Tables\Factory\MelisCoreMelisBOEmailsDetailsTableFactory',
            'MelisCore\Model\Tables\MelisLogTable' => 'MelisCore\Model\Tables\Factory\MelisCoreMelisLogTableFactory',
            'MelisCore\Model\Tables\MelisLogTypeTable' => 'MelisCore\Model\Tables\Factory\MelisCoreMelisLogTypeTableFactory',
            'MelisCore\Model\Tables\MelisLogTypeTransTable' => 'MelisCore\Model\Tables\Factory\MelisCoreMelisLogTypeTransTableFactory',
            'MelisCore\Model\Tables\MelisUserConnectionDate'    => 'MelisCore\Model\Tables\Factory\MelisCoreUserConnectionDateTableFactory',
            'MelisCore\Model\Tables\MelisMicroServiceAuthTable' => 'MelisCore\Model\Tables\Factory\MelisMicroServiceAuthTableFactory',
            'MelisCore\Model\Tables\MelisCorePlatformSchemeTable' => 'MelisCore\Model\Tables\Factory\MelisCorePlatformSchemeTableFactory',
        ),
    ),
    'controllers' => array(
        'invokables' => array(
            'MelisCore\Controller\Index' => 'MelisCore\Controller\IndexController',
            'MelisCore\Controller\TreeTools' => 'MelisCore\Controller\TreeToolsController',
            'MelisCore\Controller\Language' => 'MelisCore\Controller\LanguageController',
            'MelisCore\Controller\PluginView' => 'MelisCore\Controller\PluginViewController',
            'MelisCore\Controller\Dashboard' => 'MelisCore\Controller\DashboardController',
            'MelisCore\Controller\MelisAuth' => 'MelisCore\Controller\MelisAuthController',
            'MelisCore\Controller\MelisFlashMessenger' => 'MelisCore\Controller\MelisFlashMessengerController',
            'MelisCore\Controller\ToolUser' => 'MelisCore\Controller\ToolUserController',
            'MelisCore\Controller\User' => 'MelisCore\Controller\UserController',
            'MelisCore\Controller\Modules' => 'MelisCore\Controller\ModulesController',
            'MelisCore\Controller\MelisGenericModal' => 'MelisCore\Controller\MelisGenericModalController',
            'MelisCore\Controller\Platforms' => 'MelisCore\Controller\PlatformsController',
            'MelisCore\Controller\EmailsManagement' => 'MelisCore\Controller\EmailsManagementController',
            'MelisCore\Controller\ModuleDiagnostic' => 'MelisCore\Controller\ModuleDiagnosticController',
            'MelisCore\Controller\Diagnostic' => 'MelisCore\Controller\DiagnosticController',
            'MelisCore\Controller\MelisTinyMce' => 'MelisCore\Controller\MelisTinyMceController',
            'MelisCore\Controller\MelisPhpUnitTool' => 'MelisCore\Controller\MelisPhpUnitToolController',
            'MelisCore\Controller\Log' => 'MelisCore\Controller\LogController',
            'MelisCore\Controller\UserProfile' => 'MelisCore\Controller\UserProfileController',
            'MelisCore\Controller\MelisCoreMicroService' => 'MelisCore\Controller\MelisCoreMicroServiceController',
            'MelisCore\Controller\MelisSetup' => 'MelisCore\Controller\MelisSetupController',
            'MelisCore\Controller\PlatformScheme' => 'MelisCore\Controller\PlatformSchemeController',
            'MelisCore\Controller\MelisCoreGdpr' => 'MelisCore\Controller\MelisCoreGdprController', 
        ),
    ),

    'validators' => array(
        'invokables' => array(
            'MelisPasswordValidator' => 'MelisCore\Validator\MelisPasswordValidator',
        ),
    ),

    'form_elements' => array(
        'factories' => array(
            'MelisSelect' => 'MelisCore\Form\Factory\MelisSelectFactory',
            'MelisCoreLanguageSelect' => 'MelisCore\Form\Factory\LanguageSelectFactory',
            'MelisCoreSiteSelect' => 'MelisCore\Form\Factory\MelisSiteSelectFactory',
            'MelisToggleButton' => 'MelisCore\Form\Factory\MelisToggleButtonFactory',
            'MelisText' => 'MelisCore\Form\Factory\MelisTextFactory',
            'MelisUserRoleSelect' => 'MelisCore\Form\Factory\MelisUserRoleSelectFactory',
            'MelisCoreMultiValInput' => 'MelisCore\Form\Factory\MelisCoreMultiValueInputFactory',
            'DateField' => 'MelisCore\Form\Factory\DateFieldFactory',
        ),
    ),
    'view_helpers' => array(
        'invokables' => array(
            'MelisFieldCollection' => 'MelisCore\Form\View\Helper\MelisFieldCollection',
            'MelisFieldRow' => 'MelisCore\Form\View\Helper\MelisFieldRow',
            'MelisGenericTable' => 'MelisCore\View\Helper\MelisGenericTable',
            'MelisModal' => 'MelisCore\View\Helper\MelisModal',
            'MelisModalInvoker' => 'MelisCore\View\Helper\MelisModalInvoker',
            'MelisTextHelper' => 'MelisCore\View\Helper\MelisTextHelper',
        ),
        'factories' => array(
            'MelisCoreHeadPlugin' => 'MelisCore\View\Helper\Factory\MelisCoreHeadPluginHelperFactory',
        ),
    ),
    'view_manager' => array(
        'display_not_found_reason' => true,
        'display_exceptions' => true,
        'doctype' => 'HTML5',
        'not_found_template' => 'error/404',
        'exception_template' => 'error/index',
        'template_map' => array(
            'layout/layoutError' => __DIR__ . '/../view/layout/layoutError.phtml',
            'layout/layoutCore' => __DIR__ . '/../view/layout/layoutCore.phtml',
            'layout/layoutBlank' => __DIR__ . '/../view/layout/layoutBlank.phtml',
            'layout/layout' => __DIR__ . '/../view/layout/layoutBlank.phtml',
            'melis-core/index/index' => __DIR__ . '/../view/melis-core/index/index.phtml',
            'melis-core/plugin-view/generate' => __DIR__ . '/../view/melis-core/plugin-view/generate.phtml',
            'error/404' => __DIR__ . '/../view/error/404.phtml',
            'error/index' => __DIR__ . '/../view/error/index.phtml',
            'layout/warning' => __DIR__ . '/../view/warning/warning.phtml',
        ),
        'template_path_stack' => array(
            __DIR__ . '/../view',
        ),
        'strategies' => array(
            'ViewJsonStrategy'
        )
    ),
    // Config Files
    'tinyMCE' => array(
        'tool' => 'MelisCore/public/js/tinyMCE/tool.php',
    ),
);
