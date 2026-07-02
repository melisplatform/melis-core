<?php

namespace MelisCore\Controller;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * Endpoints publics (sans authentification) pour le flux "mot de passe oublié"
 * du back-office React.
 *
 * Routes :
 *   POST /melis/react-api/forgot-password  → forgotPasswordAction()
 *   POST /melis/react-api/reset-password   → resetPasswordAction()
 */
class MelisReactApiAuthController extends MelisAbstractActionController
{
    /**
     * POST /melis/react-api/forgot-password
     * Body form-urlencoded : usr_login, usr_email
     * Réponse : { success: bool }
     *
     * Insère/met à jour le hash en BDD et envoie l'email avec le lien React
     * (/melis-react/reset-password/{hash}) au lieu du lien legacy.
     * Route publique — pas de garde isAuthenticated().
     */
    public function forgotPasswordAction(): HttpResponse
    {
        if (!$this->getRequest()->isPost()) {
            return $this->jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $login = trim((string) $this->getRequest()->getPost('usr_login', ''));
        $email = trim((string) $this->getRequest()->getPost('usr_email', ''));

        if (!$login || !$email) {
            return $this->jsonResponse(['success' => false, 'message' => 'Login and email are required.']);
        }

        $sm        = $this->getServiceManager();
        $userTable = $sm->get('MelisCoreTableUser');
        $userData  = $userTable->getDataByLoginAndEmail($login, $email)->current();

        // Ne pas révéler si le compte existe ou non — on retourne toujours success=true
        if (!$userData) {
            return $this->jsonResponse(['success' => true]);
        }

        // Générer un nouveau hash
        $hash = bin2hex(uniqid('', true));

        // Insérer ou mettre à jour l'entrée dans la table lost_password
        $lostPassTable = $sm->get('MelisLostPasswordTable');
        $existing      = $lostPassTable->getEntryByField('rh_login', $login)->current();
        if ($existing) {
            $lostPassTable->update(
                ['rh_hash' => $hash, 'rh_date' => date('Y-m-d H:i:s')],
                'rh_login',
                $login
            );
        } else {
            $lostPassTable->save([
                'rh_id'    => null,
                'rh_login' => $login,
                'rh_email' => $email,
                'rh_hash'  => $hash,
                'rh_date'  => date('Y-m-d H:i:s'),
            ]);
        }

        // Construire l'URL React depuis la config plateforme (scheme + host)
        $melisConfig = $sm->get('MelisCoreConfig');
        $cfg         = $melisConfig->getItem('meliscore/datas/' . getenv('MELIS_PLATFORM'));
        if (empty($cfg)) {
            $cfg = $melisConfig->getItem('meliscore/datas/default');
        }
        $scheme   = $cfg['platform_scheme'] ?? 'https';
        $host     = $cfg['host'] ?? ($_SERVER['HTTP_HOST'] ?? 'localhost');
        $resetUrl = $scheme . '://' . $host . '/melis-react/reset-password/' . $hash;

        // Envoyer via le template email existant LOSTPASSWORD (mêmes tags que le legacy)
        $langId       = $userData->usr_lang_id ?? null;
        $melisEmailBO = $sm->get('MelisCoreBOEmailService');
        $success      = (bool) $melisEmailBO->sendBoEmailByCode(
            'LOSTPASSWORD',
            ['USER_Login' => $login, 'URL' => $resetUrl],
            $email,
            $login,
            $langId
        );

        return $this->jsonResponse(['success' => $success]);
    }

    /**
     * POST /melis/react-api/reset-password
     * Body form-urlencoded : rhash, usr_pass, usr_pass_confirm
     * Réponse : { success: bool, message?: string }
     *
     * Route publique — pas de garde isAuthenticated().
     */
    public function resetPasswordAction(): HttpResponse
    {
        if (!$this->getRequest()->isPost()) {
            return $this->jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }

        $hash        = (string) $this->getRequest()->getPost('rhash', '');
        $password    = (string) $this->getRequest()->getPost('usr_pass', '');
        $confirmPass = (string) $this->getRequest()->getPost('usr_pass_confirm', '');

        if (!$hash) {
            return $this->jsonResponse(['success' => false, 'message' => 'Invalid or expired link.']);
        }

        $sm            = $this->getServiceManager();
        $melisLostPass = $sm->get('MelisCoreLostPassword');

        if (!$melisLostPass->hashExists($hash)) {
            return $this->jsonResponse(['success' => false, 'message' => 'Invalid or expired link.']);
        }

        if ($password !== $confirmPass) {
            return $this->jsonResponse(['success' => false, 'message' => 'Passwords do not match.']);
        }

        // Valider la complexité du mot de passe (mêmes règles que resetOldPasswordAction)
        try {
            $passValidator = new \MelisCore\Validator\MelisPasswordValidatorWithConfig(['serviceManager' => $sm]);
            if (!$passValidator->isValid($password)) {
                $messages = implode(' ', $passValidator->getMessages());
                return $this->jsonResponse(['success' => false, 'message' => $messages]);
            }
        } catch (\Throwable) {
            // Validateur indisponible — contrôle minimal sur la longueur
            if (strlen($password) < 8) {
                return $this->jsonResponse(['success' => false, 'message' => 'Password must be at least 8 characters.']);
            }
        }

        $melisLostPass->processUpdatePassword($hash, $password);

        return $this->jsonResponse(['success' => true]);
    }

    /**
     * GET /melis/react-api/i18n?locale=fr_FR
     * Retourne les traductions des pages publiques React (login / forgot / reset) depuis les
     * fichiers PHP de melis-core (source de vérité : *.forms.php + *.interface.php).
     * Lecture directe des fichiers PHP — le Laminas translator ne charge qu'un seul locale par session.
     * Route publique — accessible avant authentification.
     */
    public function i18nAction(): HttpResponse
    {
        $locale = (string) $this->getRequest()->getQuery('locale', 'fr_FR');
        if (!preg_match('/^[a-z]{2}_[A-Z]{2}$/', $locale)) {
            $locale = 'fr_FR';
        }

        // Chemin vers les fichiers de traduction de melis-core (relatif à ce contrôleur)
        $langPath = realpath(__DIR__ . '/../../../melis-core/language');
        $raw      = [];
        foreach (['forms', 'interface'] as $type) {
            $file = $langPath . '/' . $locale . '.' . $type . '.php';
            if (!file_exists($file)) {
                // Fallback en_EN si le locale demandé n'existe pas
                $file = $langPath . '/en_EN.' . $type . '.php';
            }
            if (file_exists($file)) {
                $loaded = include $file;
                if (is_array($loaded)) {
                    $raw = array_merge($raw, $loaded);
                }
            }
        }

        // Mapping clé React → clé PHP (source de vérité : melis-core/language/*.forms.php + *.interface.php)
        $map = [
            // ── Login ──────────────────────────────────────────────────────────
            'login.title'          => 'tr_meliscore_login_header',
            'login.username'       => 'tr_meliscore_login_form_Login',
            'login.password'       => 'tr_meliscore_login_form_Password',
            'login.remember'       => 'tr_meliscore_login_remember_me',
            'login.submit'         => 'tr_meliscore_login_form_submittext_Connect',
            'login.forgot'         => 'tr_meliscore_forgot_password',
            'login.error'          => 'tr_meliscore_login_error',
            'login.legacy_notice'  => 'tr_meliscore_react_beta_login_notice',
            // ── Mot de passe oublié ────────────────────────────────────────────
            'forgot.title'       => 'tr_meliscore_forgot_page_header',
            'forgot.login'       => 'tr_meliscore_forgot_form_login',
            'forgot.email'       => 'tr_meliscore_forgot_form_email',
            'forgot.submit'      => 'tr_meliscore_forgot_form_submit',
            'forgot.success_msg' => 'tr_meliscore_email_lost_password_request_success',
            // ── Réinitialisation du mot de passe ───────────────────────────────
            'reset.title'       => 'tr_meliscore_reset_password_header',
            'reset.password'    => 'tr_meliscore_reset_password',
            'reset.confirm'     => 'tr_meliscore_reset_password_confirm',
            'reset.submit'      => 'tr_meliscore_reset_password_button',
            'reset.success_msg' => 'tr_meliscore_reset_password_success',
            'reset.err_match'   => 'tr_meliscore_reset_password_not_match',
            'reset.err_server'  => 'tr_meliscore_reset_password_failed',
            'reset.err_length'  => 'tr_meliscore_tool_user_usr_password_error_low',
        ];

        $result = [];
        foreach ($map as $reactKey => $phpKey) {
            if (isset($raw[$phpKey])) {
                $result[$reactKey] = $raw[$phpKey];
            }
        }

        return $this->jsonResponse(['success' => true, 'data' => $result]);
    }

    private function jsonResponse(array $data, int $status = 200): HttpResponse
    {
        /** @var HttpResponse $response */
        $response = $this->getResponse();
        $response->setStatusCode($status);
        $response->getHeaders()->addHeaders([
            'Content-Type'           => 'application/json; charset=utf-8',
            'X-Content-Type-Options' => 'nosniff',
        ]);
        $response->setContent(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return $response;
    }
}
