<?php 

return [
    'plugins' => [
        'meliscore' => [
            'datas' => [
                'excluded_routes' => [
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
                    'melis-backoffice/get-platform-color-css',
                    'melis-backoffice/reset-old-password',
                    'melis-backoffice/webpack_builder',
                    'melis-backoffice/gdpr-autodelete-cron',
                    'melis-backoffice/generate-password',
                    'melis-backoffice/create-password',
                    'melis-backoffice/renew-password',
                    'melis-backoffice/get-js-bundles',
                    'melis-backoffice/get-css-bundles',
                    'melis-backoffice/get-login-js-bundles',
                    'melis-backoffice/get-login-css-bundles',
                ]
            ]
        ]
    ]
];

