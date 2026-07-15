<?php

/**
 * Routes + contrôleurs React API fournis par MelisCore.
 *
 * Ces routes s'ajoutent aux child_routes de `melis-react-api` (défini dans MelisReactApi,
 * le bridge GÉNÉRIQUE). Modularité : les contrôleurs/routes/invokables d'un outil vivent
 * dans SON module, pas dans MelisReactApi. Laminas\Stdlib\ArrayUtils::merge() fusionne.
 * Les URLs ne changent pas. Capacités : cf. config/react.capabilities.php.
 * Mergé via MelisCore\Module::getConfig().
 */

return [
    'router' => [
        'routes' => [
            'melis-backoffice' => [
                'child_routes' => [
                    'melis-react-api' => [
                        'child_routes' => [
                            // ── Auth publique (i18n / mot de passe oublié / réinitialisation) ──
                            // Ces routes sont exclues de l'auth (cf. melis-core/config/excluded.routes.php)
                            'auth-i18n' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/i18n[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiAuth',
                                        'action'        => 'i18n',
                                    ],
                                ],
                            ],
                            'auth-forgot-password' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/forgot-password[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiAuth',
                                        'action'        => 'forgotPassword',
                                    ],
                                ],
                            ],
                            'auth-reset-password' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/reset-password[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiAuth',
                                        'action'        => 'resetPassword',
                                    ],
                                ],
                            ],
                            // ── Modules (MelisCore tool : activation + ordre) ──
                            'modules-list' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/modules[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiModules',
                                        'action'        => 'list',
                                    ],
                                ],
                            ],
                            'modules-save' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/modules/save[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiModules',
                                        'action'        => 'save',
                                    ],
                                ],
                            ],
                            // ── Other Config (MelisCore tool : politique connexion/mot de passe) ──
                            'otherconfig-get' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/otherconfig[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiOtherConfig',
                                        'action'        => 'get',
                                    ],
                                ],
                            ],
                            'otherconfig-save' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/otherconfig/save[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiOtherConfig',
                                        'action'        => 'save',
                                    ],
                                ],
                            ],
                            // ── Platform Scheme (MelisCore tool : thème / couleurs du BO) ──
                            'platformscheme-get' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/platformscheme[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiPlatformScheme',
                                        'action'        => 'get',
                                    ],
                                ],
                            ],
                            'platformscheme-save' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/platformscheme/save[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiPlatformScheme',
                                        'action'        => 'save',
                                    ],
                                ],
                            ],
                            'platformscheme-reset' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/platformscheme/reset[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiPlatformScheme',
                                        'action'        => 'reset',
                                    ],
                                ],
                            ],
                            // ── Thème du back-office REACT (interface distincte du legacy) ──
                            'platformscheme-react-save' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/platformscheme-react/save[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiPlatformSchemeReact',
                                        'action'        => 'save',
                                    ],
                                ],
                            ],
                            'platformscheme-react-get' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/platformscheme-react[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiPlatformSchemeReact',
                                        'action'        => 'get',
                                    ],
                                ],
                            ],
                            // ── GDPR / RGPD (MelisCore tool : droits des personnes) ──
                            'gdpr-search' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/gdpr/search[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiGdpr',
                                        'action'        => 'search',
                                    ],
                                ],
                            ],
                            'gdpr-extract' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/gdpr/extract[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiGdpr',
                                        'action'        => 'extract',
                                    ],
                                ],
                            ],
                            'gdpr-delete' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/gdpr/delete[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiGdpr',
                                        'action'        => 'delete',
                                    ],
                                ],
                            ],
                            // GDPR › SMTP
                            'gdpr-smtp-get' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/smtp[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'smtpGet']],
                            ],
                            'gdpr-smtp-save' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/smtp/save[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'smtpSave']],
                            ],
                            'gdpr-smtp-delete' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/smtp/delete[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'smtpDelete']],
                            ],
                            // GDPR › Banners
                            'gdpr-banner-meta' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/banner/meta[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'bannerMeta']],
                            ],
                            'gdpr-banner-save' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/banner/save[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'bannerSave']],
                            ],
                            'gdpr-banner-get' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/banner[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'bannerGet']],
                            ],
                            // GDPR › Auto-Delete
                            'gdpr-ad-meta' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/autodelete/meta[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'adMeta']],
                            ],
                            'gdpr-ad-configs' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/autodelete/configs[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'adConfigs']],
                            ],
                            'gdpr-ad-config-save' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/autodelete/config/save[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'adSave']],
                            ],
                            'gdpr-ad-config-delete' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/autodelete/config/delete[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'adDelete']],
                            ],
                            'gdpr-ad-config-get' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/autodelete/config[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'adConfig']],
                            ],
                            'gdpr-ad-run' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/autodelete/run[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'adRun']],
                            ],
                            'gdpr-ad-logs' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/autodelete/logs[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'adLogs']],
                            ],
                            'gdpr-ad-log-detail' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/gdpr/autodelete/logs/:id[/]', 'constraints' => ['id' => '[0-9]+'], 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiGdpr', 'action' => 'adLogDetail']],
                            ],
                            // ── Emails Management (MelisCore tool) ─────────────
                            'emails-list' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/emails[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiEmails', 'action' => 'list']],
                            ],
                            'emails-save' => [
                                'type' => 'Segment',
                                'priority' => 100, // matche avant la route générique /emails/:codename
                                'options' => ['route' => '/emails/save[/]', 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiEmails', 'action' => 'save']],
                            ],
                            'emails-delete' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/emails/delete/:codename', 'constraints' => ['codename' => '[\w]+'], 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiEmails', 'action' => 'delete']],
                            ],
                            'emails-get' => [
                                'type' => 'Segment',
                                'options' => ['route' => '/emails/:codename', 'constraints' => ['codename' => '[\w]+'], 'defaults' => ['__NAMESPACE__' => 'MelisCore\Controller', 'controller' => 'MelisReactApiEmails', 'action' => 'get']],
                            ],
                            // ── Roles (MelisCore user roles) ──────────────────
                            'roles' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/roles[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiUser',
                                        'action'        => 'roles',
                                    ],
                                ],
                            ],
                            // ── Users (MelisCore tool) ────────────────────────
                            // ── « Mon compte » (profil de l'utilisateur courant) ──
                            'user-profile-save' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/user-profile/save[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiUserProfile',
                                        'action'        => 'save',
                                    ],
                                ],
                            ],
                            'user-profile-get' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/user-profile[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiUserProfile',
                                        'action'        => 'get',
                                    ],
                                ],
                            ],
                            'users-list' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/users[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiUser',
                                        'action'        => 'list',
                                    ],
                                ],
                            ],
                            'users-stats' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/users/stats[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiUser',
                                        'action'        => 'stats',
                                    ],
                                ],
                            ],
                            'users-save' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/users/save[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiUser',
                                        'action'        => 'save',
                                    ],
                                ],
                            ],
                            'users-delete' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/users/delete/:id',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiUser',
                                        'action'        => 'delete',
                                    ],
                                ],
                            ],
                            'users-item' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/users/:id',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiUser',
                                        'action'        => 'get',
                                    ],
                                ],
                            ],
                            'users-connections' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/users/:id/connections',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiUser',
                                        'action'        => 'connections',
                                    ],
                                ],
                            ],
                            'users-microservice' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/users/:id/microservice',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiUser',
                                        'action'        => 'microservice',
                                    ],
                                ],
                            ],
                            'users-microservice-save' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/users/:id/microservice/save',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiUser',
                                        'action'        => 'microserviceSave',
                                    ],
                                ],
                            ],
                            // ── Platforms (MelisCore tool) ────────────────────
                            'platforms-list' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/platforms[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiPlatform',
                                        'action'        => 'list',
                                    ],
                                ],
                            ],
                            'platforms-stats' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/platforms/stats[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiPlatform',
                                        'action'        => 'stats',
                                    ],
                                ],
                            ],
                            'platforms-save' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/platforms/save[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiPlatform',
                                        'action'        => 'save',
                                    ],
                                ],
                            ],
                            'platforms-delete' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/platforms/delete/:id',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiPlatform',
                                        'action'        => 'delete',
                                    ],
                                ],
                            ],
                            'platforms-item' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/platforms/:id',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiPlatform',
                                        'action'        => 'get',
                                    ],
                                ],
                            ],
                            // ── Languages (MelisCore tool) ────────────────────
                            'languages-list' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/languages[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiLanguage',
                                        'action'        => 'list',
                                    ],
                                ],
                            ],
                            'languages-stats' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/languages/stats[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiLanguage',
                                        'action'        => 'stats',
                                    ],
                                ],
                            ],
                            'languages-save' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/languages/save[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiLanguage',
                                        'action'        => 'save',
                                    ],
                                ],
                            ],
                            'languages-delete' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/languages/delete/:id',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiLanguage',
                                        'action'        => 'delete',
                                    ],
                                ],
                            ],
                            'languages-item' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/languages/:id',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiLanguage',
                                        'action'        => 'get',
                                    ],
                                ],
                            ],
                            // ── Logs (MelisCore tool, lecture seule) ──────────
                            'logs-list' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/logs[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiLog',
                                        'action'        => 'list',
                                    ],
                                ],
                            ],
                            'logs-stats' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/logs/stats[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiLog',
                                        'action'        => 'stats',
                                    ],
                                ],
                            ],
                            'logs-filters' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/logs/filters[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiLog',
                                        'action'        => 'filters',
                                    ],
                                ],
                            ],
                            // ── Announcements (MelisCore tool) ────────────────
                            'announcements-list' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/announcements[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiAnnouncement',
                                        'action'        => 'list',
                                    ],
                                ],
                            ],
                            'announcements-stats' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/announcements/stats[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiAnnouncement',
                                        'action'        => 'stats',
                                    ],
                                ],
                            ],
                            'announcements-save' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/announcements/save[/]',
                                    'defaults' => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiAnnouncement',
                                        'action'        => 'save',
                                    ],
                                ],
                            ],
                            'announcements-delete' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/announcements/delete/:id',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiAnnouncement',
                                        'action'        => 'delete',
                                    ],
                                ],
                            ],
                            'announcements-item' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'       => '/announcements/:id',
                                    'constraints' => ['id' => '[0-9]+'],
                                    'defaults'    => [
                                        '__NAMESPACE__' => 'MelisCore\Controller',
                                        'controller'    => 'MelisReactApiAnnouncement',
                                        'action'        => 'get',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],

    'controllers' => [
        'invokables' => [
            'MelisCore\Controller\MelisReactApiUser' => \MelisCore\Controller\MelisReactApiUserController::class,
            'MelisCore\Controller\MelisReactApiUserProfile' => \MelisCore\Controller\MelisReactApiUserProfileController::class,
            'MelisCore\Controller\MelisReactApiModules' => \MelisCore\Controller\MelisReactApiModulesController::class,
            'MelisCore\Controller\MelisReactApiOtherConfig' => \MelisCore\Controller\MelisReactApiOtherConfigController::class,
            'MelisCore\Controller\MelisReactApiPlatformScheme' => \MelisCore\Controller\MelisReactApiPlatformSchemeController::class,
            'MelisCore\Controller\MelisReactApiPlatformSchemeReact' => \MelisCore\Controller\MelisReactApiPlatformSchemeReactController::class,
            'MelisCore\Controller\MelisReactApiGdpr' => \MelisCore\Controller\MelisReactApiGdprController::class,
            'MelisCore\Controller\MelisReactApiEmails' => \MelisCore\Controller\MelisReactApiEmailsController::class,
            'MelisCore\Controller\MelisReactApiPlatform' => \MelisCore\Controller\MelisReactApiPlatformController::class,
            'MelisCore\Controller\MelisReactApiLanguage' => \MelisCore\Controller\MelisReactApiLanguageController::class,
            'MelisCore\Controller\MelisReactApiLog' => \MelisCore\Controller\MelisReactApiLogController::class,
            'MelisCore\Controller\MelisReactApiAnnouncement' => \MelisCore\Controller\MelisReactApiAnnouncementController::class,
            'MelisCore\Controller\MelisReactApiAuth' => \MelisCore\Controller\MelisReactApiAuthController::class,
        ],
    ],
];
