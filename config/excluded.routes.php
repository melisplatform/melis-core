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
                    // Routes publiques React API (i18n + mot de passe oublié)
                    'melis-backoffice/melis-react-api/auth-i18n',
                    'melis-backoffice/melis-react-api/auth-forgot-password',
                    'melis-backoffice/melis-react-api/auth-reset-password',
                ],
                // Zones PluginView (appconfigpath) qu'un visiteur NON authentifié a le droit de faire
                // rendre — distinct de excluded_routes (qui protège la ROUTE HTTP de premier niveau) :
                // MelisReactOverride\Controller\PluginViewController::generateAction() applique SA
                // PROPRE garde anonyme (denyIfUnauthenticated(), défense-en-profondeur derrière
                // checkIdentity) sur CHAQUE forward() interne vers le rendu de zone générique — y
                // compris ceux déclenchés par une route déjà publique. Un module qui construit sa
                // propre page pré-connexion (ex. melis-login-2fa/config/excluded.routes.php pour la
                // saisie du code 2FA) doit AUSSI lister son melisKey ici, sinon ce garde-fou renvoie un
                // 401 vide qui casse le rendu (TypeError « addChild() » côté appelant). '/meliscore_login'
                // est le seul cas historique (formulaire de connexion lui-même) — modules libres d'en
                // ajouter d'autres via le même ArrayUtils::merge que excluded_routes.
                'public_zones' => [
                    '/meliscore_login',
                    // Rest of UserController's anonymous password-recovery flow (lost-password
                    // form, the email link's reset-password page, and the set-password pages used
                    // by new-account/renew-password emails) — same defense-in-depth anonymous-zone
                    // gate as the login form itself: without these, denyIfUnauthenticated() returns
                    // a bare 401 Response where a ViewModel was expected, and addChild() throws
                    // (discovered via the "Change your password" link in the 2FA email, which
                    // points at /meliscore_lost_password for a user who isn't logged in yet — the
                    // other three share the exact same code path/bug, just never hit before).
                    '/meliscore_lost_password',
                    '/meliscore_reset_password',
                    '/meliscore_generate_password',
                    '/meliscore_renew_password',
                ]
            ]
        ]
    ]
];

