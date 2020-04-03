<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCore\Service\Factory\AbstractFactory;
use MelisCore\Model\Tables\Factory\AbstractTableGatewayFactory;
use MelisCore\View\Helper\MelisCoreSectionIconsHelper;
use MelisCore\View\Helper\MelisDataTableHelper;
use MelisCore\Service\MelisCoreConfigService;
use MelisCore\Service\MelisCoreDispatchService;
use MelisCore\Service\MelisCoreAuthService;
use MelisCore\Service\MelisCoreUserService;
use MelisCore\Service\MelisCoreRightsService;
use MelisCore\Service\MelisCoreFlashMessengerService;
use MelisCore\Service\MelisCoreImageService;
use MelisCore\Service\MelisCoreTranslationService;
use MelisCore\Service\MelisCoreLostPasswordService;
use MelisCore\Service\MelisCoreCreatePasswordService;
use MelisCore\Service\MelisCoreToolService;
use MelisCore\Service\MelisCoreBOEmailService;
use MelisCore\Service\MelisCoreEmailSendingService;
use MelisCore\Service\MelisCoreModulesService;
use MelisCore\Service\MelisCoreLogService;
use MelisCore\Service\MelisPhpUnitToolService;
use MelisCore\Service\MelisCoreMicroServiceTestService;
use MelisCore\Service\MelisCorePlatformSchemeService;
use MelisCore\Service\MelisFormService;
use MelisCore\Service\MelisCoreGeneralService;
use MelisCore\Service\MelisCoreDashboardService;
use MelisCore\Service\MelisCoreGdprService;
use MelisCore\Service\MelisCorePluginsService;
use MelisCore\Service\MelisCoreDashboardPluginsRightsService;
use MelisCore\Model\Tables\MelisLangTable;
use MelisCore\Model\Tables\MelisUserTable;
use MelisCore\Model\Tables\MelisUserRoleTable;
use MelisCore\Model\Tables\MelisPlatformTable;
use MelisCore\Model\Tables\MelisLostPasswordTable;
use MelisCore\Model\Tables\MelisCreatePasswordTable;
use MelisCore\Model\Tables\MelisBOEmailsTable;
use MelisCore\Model\Tables\MelisBOEmailsDetailsTable;
use MelisCore\Model\Tables\MelisLogTable;
use MelisCore\Model\Tables\MelisLogTypeTable;
use MelisCore\Model\Tables\MelisLogTypeTransTable;
use MelisCore\Model\Tables\MelisUserConnectionDateTable;
use MelisCore\Model\Tables\MelisMicroServiceAuthTable;
use MelisCore\Model\Tables\MelisPlatformSchemeTable;
use MelisCore\Model\Tables\MelisDashboardsTable;
use MelisCore\Model\Tables\MelisPluginsTable;
use MelisCore\View\Helper\MelisCoreHeadPluginHelper;
use MelisCore\View\Helper\MelisDashboardDragDropZonePluginHelper;

return [
    'modules' =>[
        'Laminas\Cache',
    ],
    'router' => [
        'routes' => [
            'melis-backoffice' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/melis[/]',
                    'defaults' => [
                        'controller' => 'MelisCore\Controller\Index',
                        'action' => 'melis',
                    ],
                ],
                'may_terminate' => true,
                'child_routes' => [
                    'login' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'login[/]',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\MelisAuth',
                                'action' => 'loginpage',
                            ],
                        ],
                    ],
                    'lost-password' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'lost-password[/]',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\User',
                                'action' => 'renderLostPassword',
                            ],
                        ],
                    ],
                    'lost-password-request' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'lost-password-request[/]',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\User',
                                'action' => 'lostPasswordRequest',
                            ],
                        ],
                    ],
                    'reset-password' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'reset-password[/:rhash]',
                            'constraints' => [
                                'rhash' => '[a-f0-9]*',
                            ],
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\User',
                                'action' => 'renderResetPassword',
                            ],
                        ],
                    ],
                    'reset-old-password' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'reset-old-password[/:rhash]',
                            'constraints' => [
                                'rhash' => '[a-f0-9]*',
                            ],
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\User',
                                'action' => 'resetOldPassword',
                            ],
                        ],
                    ],
                    'generate-password' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'generate-password[/:rhash]',
                            'constraints' => [
                                'rhash' => '[a-f0-9]*',
                            ],
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\User',
                                'action' => 'renderGeneratePassword',
                            ],
                        ],
                    ],
                    'create-password' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'create-password[/:rhash]',
                            'constraints' => [
                                'rhash' => '[a-f0-9]*',
                            ],
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\User',
                                'action' => 'createPassword',
                            ],
                        ],
                    ],
                    'renew-password' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'renew-password[/:rhash]',
                            'constraints' => [
                                'rhash' => '[a-f0-9]*',
                            ],
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\User',
                                'action' => 'renderRenewPassword',
                            ],
                        ],
                    ],
                    'authenticate' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'authenticate[/]',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\MelisAuth',
                                'action' => 'authenticate',
                            ],
                        ],
                    ],
                    'islogin' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'islogin[/]',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\MelisAuth',
                                'action' => 'isLoggedIn',
                            ],
                        ],
                    ],
                    'logout' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'logout[/]',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\MelisAuth',
                                'action' => 'logout',
                            ],
                        ],
                    ],
                    'zoneview' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'zoneview',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\PluginView',
                                'action' => 'generate',
                            ],
                        ],
                    ],
                    'change-language' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'change-language',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\Language',
                                'action' => 'change-language',
                            ],
                        ],
                    ],
                    'get-translations' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'get-translations',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\Language',
                                'action' => 'get-translations',
                            ],
                        ],
                    ],
                    'get-platform-color-css' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'platform-color-schemes.css',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\PlatformScheme',
                                'action' => 'getStyleColorCss',
                            ],
                        ],
                    ],
                    'application-MelisCore' => [
                        'type' => 'Literal',
                        'options' => [
                            'route' => 'MelisCore',
                            'defaults' => [
                                '__NAMESPACE__' => 'MelisCore\Controller',
                                'controller' => 'Index',
                                'action' => 'melis',
                            ],
                        ],
                        'may_terminate' => true,
                        'child_routes' => [
                            'default' => [
                                'type' => 'Segment',
                                'options' => [
                                    'route' => '/[:controller[/:action]]',
                                    'constraints' => [
                                        'controller' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                        'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                    ],
                                    'defaults' => [],
                                ],
                            ],

                        ],
                    ],
                    'microservice_list'  => [
                        'type'      => 'Segment',
                        'options'   => [
                            'route' => 'api[/:api_key]',
                            'constraint' => [
                                'api_key'        => '[a-zA-Z0-9_\-\=\$\@]*',

                            ],
                            'defaults' => [
                                '__NAMESPACE__' => 'MelisCore\Controller',
                                'controller'    => 'MelisCoreMicroService',
                                'action'        => 'micro-services-list'
                            ],
                        ],
                    ],
                    'microservice'  => [
                        'type'      => 'Segment',
                        'options'   => [
                            'route' => 'api[/:api_key][/:module]/service[/:service_alias[/:service_method]]',
                            'constraint' => [
                                'api_key'        => '[a-zA-Z0-9_\-\=\$\@]*',
                                'module'         => '[A-Z][a-zA-Z0-9_-]*',
                                'service_alias'  => '[A-Z][a-zA-Z0-9_-]*',
                                'service_method' => '[a-zA-Z][a-zA-Z0-9_-]*',

                            ],
                            'defaults' => [
                                '__NAMESPACE__' => 'MelisCore\Controller',
                                'controller'    => 'MelisCoreMicroService',
                                'action'        => 'run'
                            ],
                        ],
                    ],
                    'dashboard_plugin'  => [
                        'type'      => 'Segment',
                        'options'   => [
                            'route' => 'dashboard-plugin[/:plugin][/:function]',
                            'constraint' => [
                                'plugin'         => '[A-Z][a-zA-Z0-9_-]*',
                                'function'  => '[A-Z][a-zA-Z0-9_-]*',
                            ],
                            'defaults' => [
                                '__NAMESPACE__' => 'MelisCore\Controller',
                                'controller'    => 'DashboardPlugins',
                                'action'        => 'generateDahsboardPlugin'
                            ],
                        ],
                    ],
                ],
            ],

            /*
             * This route will handle the
             * alone setup of a module
             */
            'setup-melis-core' => [
                'type'    => 'Literal',
                'options' => [
                    'route'    => '/MelisCore',
                    'defaults' => [
                        '__NAMESPACE__' => 'MelisCore\Controller',
                        'controller'    => 'MelisSetup',
                        'action'        => 'setup-form',
                    ],
                ],
                'may_terminate' => true,
                'child_routes' => [
                    'default' => [
                        'type'    => 'Segment',
                        'options' => [
                            'route'    => '/[:controller[/:action]]',
                            'constraints' => [
                                'controller' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ],
                            'defaults' => [
//
                            ],
                        ],
                    ],
                    'setup' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => '/setup',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\MelisSetup',
                                'action' => 'setup-form',
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    'translator' => [
        'locale' => 'en_EN',
    ],
    'service_manager' => [
        'factories' => [
            // Services
            MelisCoreConfigService::class                   => AbstractFactory::class,
            MelisCoreDispatchService::class                 => AbstractFactory::class,
            MelisCoreAuthService::class                     => AbstractFactory::class,
            MelisCoreUserService::class                     => AbstractFactory::class,
            MelisCoreRightsService::class                   => AbstractFactory::class,
            MelisCoreFlashMessengerService::class           => AbstractFactory::class,
            MelisCoreImageService::class                    => AbstractFactory::class,
            MelisCoreTranslationService::class              => AbstractFactory::class,
            MelisCoreLostPasswordService::class             => AbstractFactory::class,
            MelisCoreCreatePasswordService::class           => AbstractFactory::class,
            MelisCoreToolService::class                     => AbstractFactory::class,
            MelisCoreBOEmailService::class                  => AbstractFactory::class,
            MelisCoreEmailSendingService::class             => AbstractFactory::class,
            MelisCoreModulesService::class                  => AbstractFactory::class,
            MelisCoreLogService::class                      => AbstractFactory::class,
            MelisPhpUnitToolService::class                  => AbstractFactory::class,
            MelisCoreMicroServiceTestService::class         => AbstractFactory::class,
            MelisCorePlatformSchemeService::class           => AbstractFactory::class,
            MelisFormService::class                         => AbstractFactory::class,
            MelisCoreGeneralService::class                  => AbstractFactory::class,
            MelisCoreDashboardService::class                => AbstractFactory::class,
            MelisCoreGdprService::class                     => AbstractFactory::class,
            MelisCorePluginsService::class                  => AbstractFactory::class,
            MelisCoreDashboardPluginsRightsService::class   => AbstractFactory::class,

            // Model Tables
            MelisLangTable::class               => AbstractTableGatewayFactory::class,
            MelisUserTable::class               => AbstractTableGatewayFactory::class,
            MelisUserRoleTable::class           => AbstractTableGatewayFactory::class,
            MelisPlatformTable::class           => AbstractTableGatewayFactory::class,
            MelisLostPasswordTable::class       => AbstractTableGatewayFactory::class,
            MelisCreatePasswordTable::class     => AbstractTableGatewayFactory::class,
            MelisBOEmailsTable::class           => AbstractTableGatewayFactory::class,
            MelisBOEmailsDetailsTable::class    => AbstractTableGatewayFactory::class,
            MelisLogTable::class                => AbstractTableGatewayFactory::class,
            MelisLogTypeTable::class            => AbstractTableGatewayFactory::class,
            MelisLogTypeTransTable::class       => AbstractTableGatewayFactory::class,
            MelisUserConnectionDateTable::class => AbstractTableGatewayFactory::class,
            MelisMicroServiceAuthTable::class   => AbstractTableGatewayFactory::class,
            MelisPlatformSchemeTable::class     => AbstractTableGatewayFactory::class,
            MelisDashboardsTable::class         => AbstractTableGatewayFactory::class,
            MelisPluginsTable::class            => AbstractTableGatewayFactory::class,
        ],
        'aliases' => [
            // Laminas Mvc translator Service
            'translator'                        => 'MvcTranslator',
            // Service
            'MelisCoreConfig'                   => MelisCoreConfigService::class,
            'MelisCoreDispatch'                 => MelisCoreDispatchService::class,
            'MelisCoreAuth'                     => MelisCoreAuthService::class,
            'MelisCoreUser'                     => MelisCoreUserService::class,
            'MelisCoreRights'                   => MelisCoreRightsService::class,
            'MelisCoreFlashMessenger'           => MelisCoreFlashMessengerService::class,
            'MelisCoreImage'                    => MelisCoreImageService::class,
            'MelisCoreTranslation'              => MelisCoreTranslationService::class,
            'MelisCoreLostPassword'             => MelisCoreLostPasswordService::class,
            'MelisCoreCreatePassword'           => MelisCoreCreatePasswordService::class,
            'MelisCoreTool'                     => MelisCoreToolService::class,
            'MelisCoreBOEmailService'           => MelisCoreBOEmailService::class,
            'MelisCoreEmailSendingService'      => MelisCoreEmailSendingService::class,
            'ModulesService'                    => MelisCoreModulesService::class,
            'MelisCoreLogService'               => MelisCoreLogService::class,
            'MelisPhpUnitTool'                  => MelisPhpUnitToolService::class,
            'MelisCoreMicroServiceTestService'  => MelisCoreMicroServiceTestService::class,
            'MelisCorePlatformSchemeService'    => MelisCorePlatformSchemeService::class,
            'MelisCoreFormService'              => MelisFormService::class,
            'MelisCoreGeneralService'           => MelisCoreGeneralService::class,
            'MelisCoreDashboardService'         => MelisCoreDashboardService::class,
            'MelisCoreGdprService'              => MelisCoreGdprService::class,
            'MelisCorePluginsService'           => MelisCorePluginsService::class,
            'MelisCoreDashboardPluginsService'  => MelisCoreDashboardPluginsRightsService::class,

            // Model
            'MelisCoreTableLang'                => MelisLangTable::class,
            'MelisCoreTableUser'                => MelisUserTable::class,
            'MelisCoreTableUserRole'            => MelisUserRoleTable::class,
            'MelisCoreTablePlatform'            => MelisPlatformTable::class,
            'MelisLostPasswordTable'            => MelisLostPasswordTable::class,
            'MelisCreatePasswordTable'          => MelisCreatePasswordTable::class,
            'MelisCoreTableBOEmails'            => MelisBOEmailsTable::class,
            'MelisCoreTableBOEmailsDetails'     => MelisBOEmailsDetailsTable::class,
            'MelisCoreTableLog'                 => MelisLogTable::class,
            'MelisCoreTableLogType'             => MelisLogTypeTable::class,
            'MelisCoreTableLogTypeTrans'        => MelisLogTypeTransTable::class,
            'MelisUserConnectionDate'           => MelisUserConnectionDateTable::class,
            'MelisMicroServiceAuthTable'        => MelisMicroServiceAuthTable::class,
            'MelisCorePlatformSchemeTable'      => MelisPlatformSchemeTable::class,
            'MelisCoreDashboardsTable'          => MelisDashboardsTable::class,
            'MelisPluginsTable'                 => MelisPluginsTable::class,
        ],
    ],
    'controllers' => [
        'invokables' => [
            'MelisCore\Controller\Index'                    => \MelisCore\Controller\IndexController::class,
            'MelisCore\Controller\TreeTools'                => \MelisCore\Controller\TreeToolsController::class,
            'MelisCore\Controller\Language'                 => \MelisCore\Controller\LanguageController::class,
            'MelisCore\Controller\PluginView'               => \MelisCore\Controller\PluginViewController::class,
            'MelisCore\Controller\Dashboard'                => \MelisCore\Controller\DashboardController::class,
            'MelisCore\Controller\MelisAuth'                => \MelisCore\Controller\MelisAuthController::class,
            'MelisCore\Controller\MelisFlashMessenger'      => \MelisCore\Controller\MelisFlashMessengerController::class,
            'MelisCore\Controller\ToolUser'                 => \MelisCore\Controller\ToolUserController::class,
            'MelisCore\Controller\User'                     => \MelisCore\Controller\UserController::class,
            'MelisCore\Controller\Modules'                  => \MelisCore\Controller\ModulesController::class,
            'MelisCore\Controller\MelisGenericModal'        => \MelisCore\Controller\MelisGenericModalController::class,
            'MelisCore\Controller\Platforms'                => \MelisCore\Controller\PlatformsController::class,
            'MelisCore\Controller\EmailsManagement'         => \MelisCore\Controller\EmailsManagementController::class,
// @TODO Missing controllers
//            'MelisCore\Controller\ModuleDiagnostic'         => \MelisCore\Controller\ModuleDiagnosticController::class,
//            'MelisCore\Controller\Diagnostic'               => \MelisCore\Controller\DiagnosticController::class,
            'MelisCore\Controller\MelisTinyMce'             => \MelisCore\Controller\MelisTinyMceController::class,
            'MelisCore\Controller\MelisPhpUnitTool'         => \MelisCore\Controller\MelisPhpUnitToolController::class,
            'MelisCore\Controller\Log'                      => \MelisCore\Controller\LogController::class,
            'MelisCore\Controller\UserProfile'              => \MelisCore\Controller\UserProfileController::class,
            'MelisCore\Controller\MelisCoreMicroService'    => \MelisCore\Controller\MelisCoreMicroServiceController::class,
            'MelisCore\Controller\MelisSetupPostDownload'   => \MelisCore\Controller\MelisSetupPostDownloadController::class,
            'MelisCore\Controller\MelisSetupPostUpdate'     => \MelisCore\Controller\MelisSetupPostUpdateController::class,
            'MelisCore\Controller\PlatformScheme'           => \MelisCore\Controller\PlatformSchemeController::class,
            'MelisCore\Controller\DashboardPlugins'         => \MelisCore\Controller\DashboardPluginsController::class,
            'MelisCore\Controller\MelisCoreGdpr'            => \MelisCore\Controller\MelisCoreGdprController::class,
        ],
    ],
    'controller_plugins' => [
        'invokables' => [
            'MelisCoreDashboardDragDropZonePlugin'          => \MelisCore\Controller\DashboardPlugins\MelisCoreDashboardDragDropZonePlugin::class,
            'MelisCoreDashboardRecentUserActivityPlugin'    => \MelisCore\Controller\DashboardPlugins\MelisCoreDashboardRecentUserActivityPlugin::class,
        ]
    ],
    'validators' => [
        'invokables' => [
            'MelisPasswordValidator' => \MelisCore\Validator\MelisPasswordValidator::class
        ],
    ],
    'form_elements' => [
        'factories' => [
            'MelisSelect'                   => \MelisCore\Form\Factory\MelisSelectFactory::class,
            'MelisText'                     => \MelisCore\Form\Factory\MelisTextFactory::class,
            'MelisCoreLanguageSelect'       => \MelisCore\Form\Factory\LanguageSelectFactory::class,
            'MelisCoreSiteSelect'           => \MelisCore\Form\Factory\MelisSiteSelectFactory::class,
            'MelisToggleButton'             => \MelisCore\Form\Factory\MelisToggleButtonFactory::class,
            'MelisUserRoleSelect'           => \MelisCore\Form\Factory\MelisUserRoleSelectFactory::class,
            'MelisCoreLogTypeSelect'        => \MelisCore\Form\Factory\MelisCoreLogTypeSelectFactory::class,
            'MelisCoreMultiValInput'        => \MelisCore\Form\Factory\MelisCoreMultiValueInputFactory::class,
            'DateField'                     => \MelisCore\Form\Factory\DateFieldFactory::class,
            'DatePicker'                    => \MelisCore\Form\Factory\DatePickerFactory::class,
            'DateTimePicker'                => \MelisCore\Form\Factory\DateTimePickerFactory::class,
            'MelisCoreTinyMCE'              => \MelisCore\Form\Factory\MelisCoreTinyMCEFactory::class,
            'MelisCoreUserSelect'           => \MelisCore\Form\Factory\MelisCoreUsersSelect2Factory::class,
        ],
    ],
    'view_helpers' => [
        'invokables' => [
            'MelisFieldCollection'          => \MelisCore\Form\View\Helper\MelisFieldCollection::class,
            'MelisFieldRow'                 => \MelisCore\Form\View\Helper\MelisFieldRow::class,
            'MelisGenericTable'             => \MelisCore\View\Helper\MelisGenericTable::class,
            'MelisModal'                    => \MelisCore\View\Helper\MelisModal::class,
            'MelisModalInvoker'             => \MelisCore\View\Helper\MelisModalInvoker::class,
            'MelisTextHelper'               => \MelisCore\View\Helper\MelisTextHelper::class,
        ],
        'factories' => [
            MelisCoreHeadPluginHelper::class                => AbstractFactory::class,
            MelisDashboardDragDropZonePluginHelper::class   => AbstractFactory::class,
            MelisDataTableHelper::class                     => AbstractFactory::class,
            MelisCoreSectionIconsHelper::class              => AbstractFactory::class,
        ],
        'aliases' => [
            'MelisCoreHeadPlugin'           => MelisCoreHeadPluginHelper::class,
            'MelisDashboardDragDropZone'    => MelisDashboardDragDropZonePluginHelper::class,
            'MelisDataTable'                => MelisDataTableHelper::class,
            'getMelisSectionIcons'          => MelisCoreSectionIconsHelper::class,
            'melisFieldCollection'          => 'MelisFieldCollection',
            'melisTextHelper'               => 'MelisTextHelper',
            'melisGenericTable'             => 'MelisGenericTable',
            'melisModalInvoker'             => 'MelisModalInvoker',
            'melisModal'                    => 'MelisModal',
        ]
    ],
    'view_manager' => [
        'doctype' => 'HTML5',
        'not_found_template' => 'error/404',
        'exception_template' => 'error/index',
        'template_map' => [
            'layout/layoutError'                    => __DIR__ . '/../view/layout/layoutError.phtml',
            'layout/layoutCore'                     => __DIR__ . '/../view/layout/layoutCore.phtml',
            'layout/layoutBlank'                    => __DIR__ . '/../view/layout/layoutBlank.phtml',
            'layout/layout'                         => __DIR__ . '/../view/layout/layoutBlank.phtml',
            'melis-core/index/index'                => __DIR__ . '/../view/melis-core/index/index.phtml',
            'melis-core/plugin-view/generate'       => __DIR__ . '/../view/melis-core/plugin-view/generate.phtml',
            'error/404'                             => __DIR__ . '/../view/error/404.phtml',
            'error/index'                           => __DIR__ . '/../view/error/index.phtml',
            'layout/warning'                        => __DIR__ . '/../view/warning/warning.phtml',

            // Dashboard plugin templates
            'melis-core/dashboard-plugin/dragdropzone'          => __DIR__ . '/../view/melis-core/dashboard-plugins/dragdropzone.phtml',
            'melis-core/dashboard-plugin/plugin-container'      => __DIR__ . '/../view/melis-core/dashboard-plugins/plugin-container.phtml',
            'melis-core/dashboard-plugin/no-template'           => __DIR__ . '/../view/melis-core/dashboard-plugins/no-template.phtml',
            'melis-core/dashboard-plugin/no-plugin-interface'   => __DIR__ . '/../view/melis-core/dashboard-plugins/no-plugin-interface.phtml',

            'melis-core/dashboard-plugin/recent-user-activity'  => __DIR__ . '/../view/melis-core/dashboard-plugins/recent-user-activity.phtml',
        ],
        'template_path_stack' => [
            __DIR__ . '/../view',
        ],
        'strategies' => [
            'ViewJsonStrategy'
        ]
    ],
    // Config Files
    'tinyMCE' => [
        'tool' => 'MelisCore/public/js/tinyMCE/tool.php',
    ],
];
