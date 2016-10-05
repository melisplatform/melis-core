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
        		'type'    => 'Segment',
        		'options' => array(
        			'route'    => '/melis[/]',
        			'defaults' => array(
        				'controller' => 'MelisCore\Controller\Index',
        				'action'     => 'melis',
        			),
        		),
                'may_terminate' => true,
                'child_routes' => array(
                    'login' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => 'login[/]',
		        			'defaults' => array(
		        				'controller' => 'MelisCore\Controller\MelisAuth',
		        				'action'     => 'loginpage',
		        			),
                        ),
                    ),
                    'lost-password' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => 'lost-password[/]',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\User',
                                'action'     => 'renderLostPassword',
                            ),
                        ),
                    ),
                    'lost-password-request' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => 'lost-password-request[/]',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\User',
                                'action'     => 'lostPasswordRequest',
                            ),
                        ),
                    ),
                    'reset-password' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => 'reset-password[/:rhash]',
                            'constraints' => array(
                                'rhash' => '[a-f0-9]*',
                            ),
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\User',
                                'action'     => 'renderResetPassword',
                            ),
                        ),
                    ),
                    'authenticate' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => 'authenticate[/]',
		        			'defaults' => array(
		        				'controller' => 'MelisCore\Controller\MelisAuth',
		        				'action'     => 'authenticate',
		        			),
                        ),
                    ),
                    'islogin' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => 'islogin[/]',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\MelisAuth',
                                'action'     => 'isLoggedIn',
                            ),
                        ),
                    ),
                    'logout' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => 'logout[/]',
		        			'defaults' => array(
		        				'controller' => 'MelisCore\Controller\MelisAuth',
		        				'action'     => 'logout',
		        			),
                        ),
                    ),
                    'zoneview' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => 'zoneview',
		        			'defaults' => array(
		        				'controller' => 'MelisCore\Controller\PluginView',
		        				'action'     => 'generate',
		        			),
                        ),
                    ),
                    'change-language' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => 'change-language',
		        			'defaults' => array(
		        				'controller' => 'MelisCore\Controller\Language',
		        				'action'     => 'change-language',
		        			),
                        ),
                    ),
                    'get-translations' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => 'get-translations',
                            'defaults' => array(
                                'controller' => 'MelisCore\Controller\Language',
                                'action'     => 'get-translations',
                            ),
                        ),
                    ),
                    'application-MelisCore' => array(
                        'type'    => 'Literal',
                        'options' => array(
                            'route'    => 'MelisCore',
                            'defaults' => array(
                                '__NAMESPACE__' => 'MelisCore\Controller',
                                'controller'    => 'Index',
                                'action'        => 'melis',
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
                                    ),
                                ),
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
			'MelisCoreConfig' => 'MelisCore\Service\MelisCoreConfigService',
			'MelisCoreDispatch' => 'MelisCore\Service\MelisCoreDispatchService',
			'MelisCoreAuth' => 'MelisCore\Service\MelisCoreAuthService',
			'MelisCoreUser' => 'MelisCore\Service\MelisCoreUserService',
			'MelisCoreRights' => 'MelisCore\Service\MelisCoreRightsService',
			'MelisCoreTablePlatform' => 'MelisCore\Model\Tables\MelisPlatformTable',
			'MelisCoreTableLang' => 'MelisCore\Model\Tables\MelisLangTable',
            'MelisCoreTableUser' => 'MelisCore\Model\Tables\MelisUserTable',
            'MelisCoreTableUserRole' => 'MelisCore\Model\Tables\MelisUserRoleTable',
            'MelisLostPasswordTable' => 'MelisCore\Model\Tables\MelisLostPasswordTable',
            'MelisCoreFlashMessenger' => 'MelisCore\Service\MelisCoreFlashMessenger',
            'MelisCoreTool' => 'MelisCore\Service\MelisCoreTool',
            'MelisCoreTranslation' => 'MelisCore\Service\MelisCoreTranslation', 
            'MelisCoreImage' => 'MelisCore\Service\MelisCoreImage',
            'MelisCoreLostPassword' => 'MelisCore\Service\MelisCoreLostPassword',
            'MelisCoreEmailSendingService' => 'MelisCore\Service\MelisCoreEmailSendingService',
            'MelisCoreBOEmailService' => 'MelisCore\Service\MelisCoreBOEmailService',
            'MelisCoreTableBOEmails' => 'MelisCore\Model\Tables\MelisBOEmailsTable',
            'MelisCoreTableBOEmailsDetails' => 'MelisCore\Model\Tables\MelisBOEmailsDetailsTable',
            'ModulesService' => 'MelisCore\Service\MelisCoreModulesService',
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
        ),
    ),
    'view_helpers' => array(
		'invokables' => array(
			'MelisFieldCollection' => 'MelisCore\Form\View\Helper\MelisFieldCollection',
			'MelisFieldRow' => 'MelisCore\Form\View\Helper\MelisFieldRow',
		    'MelisGenericTable' => 'MelisCore\View\Helper\MelisGenericTable',
		    'MelisModal' => 'MelisCore\View\Helper\MelisModal',
		    'MelisModalInvoker' => 'MelisCore\View\Helper\MelisModalInvoker',
		),
    ),
    'view_manager' => array(
        'display_not_found_reason' => true,
        'display_exceptions'       => true,
        'doctype'                  => 'HTML5',
        'not_found_template'       => 'error/404',
        'exception_template'       => 'error/index',
        'template_map' => array(
            'layout/layoutError'          => __DIR__ . '/../view/layout/layoutError.phtml',
            'layout/layoutCore'          => __DIR__ . '/../view/layout/layoutCore.phtml',
            'layout/layoutLogin'        => __DIR__ . '/../view/layout/layoutLogin.phtml',
            'melis-core/index/index' => __DIR__ . '/../view/melis-core/index/index.phtml',
            'melis-core/plugin-view/generate' => __DIR__ . '/../view/melis-core/plugin-view/generate.phtml',
            'error/404'               => __DIR__ . '/../view/error/404.phtml',
            'error/index'             => __DIR__ . '/../view/error/index.phtml',
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
    	'tool' => 'MelisCore/public/js/tinyMCE/tool.js',
    ),
    'asset_manager' => array(
        'activate_cache' => array(
            'platforms' => array(
                'default' => 1,
            ),
        ),
        'resolver_configs' => array(
            'aliases' => array(
                'MelisCore/' => __DIR__ . '/../public/',
            ),
        ),
        'caching' => array(
            'default' => array(
                'cache'     => 'AssetManager\\Cache\\FilePathCache',
                'options' => array(
                    'dir' => 'public/cache',
                ),
            ),    
        ),  
    ),
);
