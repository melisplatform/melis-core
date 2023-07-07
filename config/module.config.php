<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */
return [
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
                    'application-Systemmaintenance' => [
                        'type'    => 'Literal',
                        'options' => [
                            'route'    => 'Systemmaintenance',
                            'defaults' => [
                                '__NAMESPACE__' => 'MelisCore\Controller',
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
                                    ],
                                ],
                            ],
                        ],
                    ],
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
                    /*
                     * GDPR Autodelete CROn
                     */
                    'gdpr-autodelete-cron' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => 'gdprautodelete[/]',
                            'defaults' => [
                                '__NAMESPACE__' => 'MelisCore\Controller',
                                'controller'    => 'MelisCoreGdprAutoDelete',
                                'action'        => 'run-gdpr-auto-delete-cron'
                            ]
                        ]
                    ]
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
                            'defaults' => [],
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
        'aliases' => [
            // Laminas Mvc translator Service
            'translator'                            => 'MvcTranslator',
            // Service
            'MelisGeneralService'                   => \MelisCore\Service\MelisGeneralService::class,
            'MelisCoreConfig'                       => \MelisCore\Service\MelisCoreConfigService::class,
            'MelisCoreDispatch'                     => \MelisCore\Service\MelisCoreDispatchService::class,
            'MelisCoreAuth'                         => \MelisCore\Service\MelisCoreAuthService::class,
            'MelisCoreUser'                         => \MelisCore\Service\MelisCoreUserService::class,
            'MelisCoreRights'                       => \MelisCore\Service\MelisCoreRightsService::class,
            'MelisCoreFlashMessenger'               => \MelisCore\Service\MelisCoreFlashMessengerService::class,
            'MelisCoreImage'                        => \MelisCore\Service\MelisCoreImageService::class,
            'MelisCoreTranslation'                  => \MelisCore\Service\MelisCoreTranslationService::class,
            'MelisCoreLostPassword'                 => \MelisCore\Service\MelisCoreLostPasswordService::class,
            'MelisCoreCreatePassword'               => \MelisCore\Service\MelisCoreCreatePasswordService::class,
            'MelisCoreTool'                         => \MelisCore\Service\MelisCoreToolService::class,
            'MelisCoreBOEmailService'               => \MelisCore\Service\MelisCoreBOEmailService::class,
            'MelisCoreEmailSendingService'          => \MelisCore\Service\MelisCoreEmailSendingService::class,
            'ModulesService'                        => \MelisCore\Service\MelisCoreModulesService::class,
            'MelisCoreLogService'                   => \MelisCore\Service\MelisCoreLogService::class,
            'MelisPhpUnitTool'                      => \MelisCore\Service\MelisPhpUnitToolService::class,
            'MelisCoreMicroServiceTestService'      => \MelisCore\Service\MelisCoreMicroServiceTestService::class,
            'MelisCorePlatformSchemeService'        => \MelisCore\Service\MelisCorePlatformSchemeService::class,
            'MelisCoreFormService'                  => \MelisCore\Service\MelisFormService::class,
            'MelisCoreDashboardService'             => \MelisCore\Service\MelisCoreDashboardService::class,
            'MelisCoreGdprService'                  => \MelisCore\Service\MelisCoreGdprService::class,
            'MelisCorePluginsService'               => \MelisCore\Service\MelisCorePluginsService::class,
            'MelisCoreDashboardPluginsService'      => \MelisCore\Service\MelisCoreDashboardPluginsRightsService::class,
            'MelisCoreGdprAutoDeleteService'        => \MelisCore\Service\MelisCoreGdprAutoDeleteService::class,
            'MelisCoreGdprAutoDeleteToolService'    => \MelisCore\Service\MelisCoreGdprAutoDeleteToolService::class,
            'MelisPasswordSettingsService'          => \MelisCore\Service\MelisPasswordSettingsService::class,
            'MelisUpdatePasswordHistoryService'     => \MelisCore\Service\MelisUpdatePasswordHistoryService::class,
            'SystemmaintenanceService'              => \MelisCore\Service\MelisCoreSystemMaintenanceService::class,

            // Model
            'MelisCoreTableLang'                    => \MelisCore\Model\Tables\MelisLangTable::class,
            'MelisCoreTableUser'                    => \MelisCore\Model\Tables\MelisUserTable::class,
            'MelisCoreTableUserRole'                => \MelisCore\Model\Tables\MelisUserRoleTable::class,
            'MelisCoreTablePlatform'                => \MelisCore\Model\Tables\MelisPlatformTable::class,
            'MelisLostPasswordTable'                => \MelisCore\Model\Tables\MelisLostPasswordTable::class,
            'MelisCreatePasswordTable'              => \MelisCore\Model\Tables\MelisCreatePasswordTable::class,
            'MelisCoreTableBOEmails'                => \MelisCore\Model\Tables\MelisBOEmailsTable::class,
            'MelisCoreTableBOEmailsDetails'         => \MelisCore\Model\Tables\MelisBOEmailsDetailsTable::class,
            'MelisCoreTableLog'                     => \MelisCore\Model\Tables\MelisLogTable::class,
            'MelisCoreTableLogType'                 => \MelisCore\Model\Tables\MelisLogTypeTable::class,
            'MelisCoreTableLogTypeTrans'            => \MelisCore\Model\Tables\MelisLogTypeTransTable::class,
            'MelisUserConnectionDate'               => \MelisCore\Model\Tables\MelisUserConnectionDateTable::class,
            'MelisMicroServiceAuthTable'            => \MelisCore\Model\Tables\MelisMicroServiceAuthTable::class,
            'MelisCorePlatformSchemeTable'          => \MelisCore\Model\Tables\MelisPlatformSchemeTable::class,
            'MelisCoreDashboardsTable'              => \MelisCore\Model\Tables\MelisDashboardsTable::class,
            'MelisPluginsTable'                     => \MelisCore\Model\Tables\MelisPluginsTable::class,
            'MelisGdprDeleteConfigTable'            => \MelisCore\Model\Tables\MelisGdprDeleteConfigTable::class,
            'MelisGdprDeleteEmailsLogsTable'        => \MelisCore\Model\Tables\MelisGdprDeleteEmailsLogsTable::class,
            'MelisGdprDeleteEmailsSent'             => \MelisCore\Model\Tables\MelisGdprDeleteEmailsSentTable::class,
            'MelisGdprDeleteEmailsTable'            => \MelisCore\Model\Tables\MelisGdprDeleteEmailsTable::class,
            'MelisGdprDeleteEmailsSmtp'             => \MelisCore\Model\Tables\MelisGdprDeleteEmailsSmtpTable::class,
            'MelisUserPasswordHistoryTable'         => \MelisCore\Model\Tables\MelisUserPasswordHistoryTable::class,

            // table
            'SystemmaintenanceTable'                => \MelisCore\Model\Tables\MelisSystemMaintenance::class

        ],
        'abstract_factories' => [
            /**
             * This Abstract factory will create requested service
             * that match on the onCreate() conditions
             */
            \MelisCore\Factory\MelisAbstractFactory::class
        ]
    ],
    'controllers' => [
        'invokables' => [
            'MelisCore\Controller\Index'                        => \MelisCore\Controller\IndexController::class,
            'MelisCore\Controller\TreeTools'                    => \MelisCore\Controller\TreeToolsController::class,
            'MelisCore\Controller\Language'                     => \MelisCore\Controller\LanguageController::class,
            'MelisCore\Controller\PluginView'                   => \MelisCore\Controller\PluginViewController::class,
            'MelisCore\Controller\Dashboard'                    => \MelisCore\Controller\DashboardController::class,
            'MelisCore\Controller\MelisAuth'                    => \MelisCore\Controller\MelisAuthController::class,
            'MelisCore\Controller\MelisFlashMessenger'          => \MelisCore\Controller\MelisFlashMessengerController::class,
            'MelisCore\Controller\ToolUser'                     => \MelisCore\Controller\ToolUserController::class,
            'MelisCore\Controller\User'                         => \MelisCore\Controller\UserController::class,
            'MelisCore\Controller\Modules'                      => \MelisCore\Controller\ModulesController::class,
            'MelisCore\Controller\MelisGenericModal'            => \MelisCore\Controller\MelisGenericModalController::class,
            'MelisCore\Controller\Platforms'                    => \MelisCore\Controller\PlatformsController::class,
            'MelisCore\Controller\EmailsManagement'             => \MelisCore\Controller\EmailsManagementController::class,
            // @TODO Missing controllers
            // 'MelisCore\Controller\ModuleDiagnostic'         => \MelisCore\Controller\ModuleDiagnosticController::class,
            // 'MelisCore\Controller\Diagnostic'               => \MelisCore\Controller\DiagnosticController::class,
            'MelisCore\Controller\MelisTinyMce'                 => \MelisCore\Controller\MelisTinyMceController::class,
            'MelisCore\Controller\MelisPhpUnitTool'             => \MelisCore\Controller\MelisPhpUnitToolController::class,
            'MelisCore\Controller\Log'                          => \MelisCore\Controller\LogController::class,
            'MelisCore\Controller\UserProfile'                  => \MelisCore\Controller\UserProfileController::class,
            'MelisCore\Controller\MelisCoreMicroService'        => \MelisCore\Controller\MelisCoreMicroServiceController::class,
            'MelisCore\Controller\MelisSetupPostDownload'       => \MelisCore\Controller\MelisSetupPostDownloadController::class,
            'MelisCore\Controller\MelisSetupPostUpdate'         => \MelisCore\Controller\MelisSetupPostUpdateController::class,
            'MelisCore\Controller\PlatformScheme'               => \MelisCore\Controller\PlatformSchemeController::class,
            'MelisCore\Controller\DashboardPlugins'             => \MelisCore\Controller\DashboardPluginsController::class,
            'MelisCore\Controller\MelisCoreGdpr'                => \MelisCore\Controller\MelisCoreGdprController::class,
            'MelisCore\Controller\MelisCoreGdprAutoDelete'      => \MelisCore\Controller\MelisCoreGdprAutoDeleteController::class,
            'MelisCore\Controller\MelisCoreGdprAutoDeleteTabs'  => \MelisCore\Controller\MelisCoreGdprAutoDeleteTabsController::class,
            'MelisCore\Controller\MelisCoreGdprAutoDeleteSmtp'  => \MelisCore\Controller\MelisCoreGdprAutoDeleteSmtpController::class,
            'MelisCore\Controller\MelisCoreOtherConfig'         => \MelisCore\Controller\MelisCoreOtherConfigController::class,
            'MelisCore\Controller\SystemMaintenance'            => \MelisCore\Controller\SystemMaintenanceController::class,
            'MelisCore\Controller\SystemMaintenanceProperties'  => \MelisCore\Controller\SystemMaintenancePropertiesController::class,
        ],
    ],
    'controller_plugins' => [
        'invokables' => [
            'MelisCoreDashboardDragDropZonePlugin'          => \MelisCore\Controller\DashboardPlugins\MelisCoreDashboardDragDropZonePlugin::class,
            'MelisCoreDashboardRecentUserActivityPlugin'    => \MelisCore\Controller\DashboardPlugins\MelisCoreDashboardRecentUserActivityPlugin::class,
            'MelisCoreDashboardBubblePlugin'    => \MelisCore\Controller\DashboardPlugins\MelisCoreDashboardBubblePlugin::class,
            'MelisCoreDashboardBubbleNewsMelisPlugin'    => \MelisCore\Controller\DashboardPlugins\MelisCoreDashboardBubbleNewsMelisPlugin::class,
            'MelisCoreDashboardBubbleUpdatesPlugin'    => \MelisCore\Controller\DashboardPlugins\MelisCoreDashboardBubbleUpdatesPlugin::class,
            'MelisCoreDashboardBubbleNotificationsPlugin'    => \MelisCore\Controller\DashboardPlugins\MelisCoreDashboardBubbleNotificationsPlugin::class,
            'MelisCoreDashboardBubbleChatPlugin'    => \MelisCore\Controller\DashboardPlugins\MelisCoreDashboardBubbleChatPlugin::class,
        ]
    ],
    'validators' => [
        'factories' => [
            'MelisPasswordValidatorWithConfig' => \MelisCore\Validator\Factory\MelisPasswordValidatorWithConfigFactory::class,
        ],
        'invokables' => [
            'MelisPasswordValidator' => \MelisCore\Validator\MelisPasswordValidator::class,
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
            'MelisCoreGdprModuleSelect'     => \MelisCore\Form\Factory\MelisGdprAutoDeleteModuleListSelectFactory::class,
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
        'aliases' => [
            'MelisCoreHeadPlugin'           => \MelisCore\View\Helper\MelisCoreHeadPluginHelper::class,
            'MelisDashboardDragDropZone'    => \MelisCore\View\Helper\MelisDashboardDragDropZonePluginHelper::class,
            'MelisCoreDashboardBubblePlugin' => \MelisCore\View\Helper\MelisDashboardBubblePluginsZoneHelper::class,
            'MelisDataTable'                => \MelisCore\View\Helper\MelisDataTableHelper::class,
            'getMelisSectionIcons'          => \MelisCore\View\Helper\MelisCoreSectionIconsHelper::class,
            'melisFieldCollection'          => 'MelisFieldCollection',
            'melisTextHelper'               => 'MelisTextHelper',
            'melisGenericTable'             => 'MelisGenericTable',
            'melisModalInvoker'             => 'MelisModalInvoker',
            'melisModal'                    => 'MelisModal',
        ],
        'abstract_factories' => [
            /**
             * This Abstract factory will create requested service
             * that match on the onCreate() conditions
             */
            \MelisCore\Factory\MelisAbstractFactory::class
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
            'melis-core/dashboard-plugin/bubble-plugins-zone'  => __DIR__ . '/../view/melis-core/dashboard-plugins/bubble-plugins-zone.phtml',
            'melis-core/dashboard-plugin/bubble-news-melis'  => __DIR__ . '/../view/melis-core/dashboard-plugins/bubble-news-melis.phtml',
            'melis-core/dashboard-plugin/bubble-updates'  => __DIR__ . '/../view/melis-core/dashboard-plugins/bubble-updates.phtml',
            'melis-core/dashboard-plugin/bubble-notifications'  => __DIR__ . '/../view/melis-core/dashboard-plugins/bubble-notifications.phtml',
            'melis-core/dashboard-plugin/bubble-chat'  => __DIR__ . '/../view/melis-core/dashboard-plugins/bubble-chat.phtml',

            'melis-core/dashboard-plugin/noformtemplate'   => __DIR__ . '/../view/melis-core/dashboard-plugins/noformtemplate.phtml',

            // system maintenance views
            'melis-core/system-maintenance/render-modal-form-confirmation' => __DIR__ . '/../view/melis-core/system-maintenance/render-modal-form-confirmation.phtml',
            'melis-core/system-maintenance/render-modal-form'              => __DIR__ . '/../view/melis-core/system-maintenance/render-modal-form.phtml',
            'melis-core/system-maintenance/render-table-action-delete'     => __DIR__ . '/../view/melis-core/system-maintenance/render-table-action-delete.phtml',
            'melis-core/system-maintenance/render-table-action-edit'       => __DIR__ . '/../view/melis-core/system-maintenance/render-table-action-edit.phtml',
            'melis-core/system-maintenance/render-table-action-switch'     => __DIR__ . '/../view/melis-core/system-maintenance/render-table-action-switch.phtml',
            'melis-core/system-maintenance/render-table-action-test-link'  => __DIR__ . '/../view/melis-core/system-maintenance/render-table-action-test-link.phtml',
            'melis-core/system-maintenance/render-table-filter-limit'      => __DIR__ . '/../view/melis-core/system-maintenance/render-table-filter-limit.phtml',
            'melis-core/system-maintenance/render-table-filter-refresh'    => __DIR__ . '/../view/melis-core/system-maintenance/render-table-filter-refresh.phtml',
            'melis-core/system-maintenance/render-table-filter-search'     => __DIR__ . '/../view/melis-core/system-maintenance/render-table-filter-search.phtml',
            'melis-core/system-maintenance/render-tool-content'            => __DIR__ . '/../view/melis-core/system-maintenance/render-tool-content.phtml',
            'melis-core/system-maintenance/render-tool-header'             => __DIR__ . '/../view/melis-core/system-maintenance/render-tool-header.phtml',
            'melis-core/system-maintenance/render-tool'                    => __DIR__ . '/../view/melis-core/system-maintenance/render-tool.phtml',
            'melis-core/system-maintenance-properties/render-properties-form'  => __DIR__ . '/../view/melis-core/system-maintenance-properties/render-properties-form.phtml',



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
