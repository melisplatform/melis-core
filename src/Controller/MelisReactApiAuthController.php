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

        // Génération du jeton, écriture en BDD, envoi de l'email et rollback si le transport
        // échoue : tout est dans le service, partagé avec le mot de passe expiré traité par
        // MelisAuthController::authenticateAction(). Le rate limit (un email par compte et par
        // délai configuré, meliscore/datas/pwd_request_min_delay) y est appliqué aussi, et rend
        // false — même réponse qu'un envoi réussi, on ne distingue rien vers l'extérieur.
        $sm->get('MelisCoreLostPassword')
            ->sendReactResetLink($login, $email, $userData->usr_lang_id ?? null);

        // Réponse toujours identique : un success=false sur une panne d'envoi distinguerait un
        // compte réel (email tenté) d'un compte inconnu (sortie anticipée plus haut).
        return $this->jsonResponse(['success' => true]);
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
            return $this->jsonResponse(['success' => false, 'code' => 'invalid_token']);
        }

        $sm            = $this->getServiceManager();
        $melisLostPass = $sm->get('MelisCoreLostPassword');

        if (!$melisLostPass->hashExists($hash)) {
            return $this->jsonResponse(['success' => false, 'code' => 'invalid_token']);
        }

        if ($password !== $confirmPass) {
            return $this->jsonResponse(['success' => false, 'code' => 'password_mismatch']);
        }

        // Valider la complexité du mot de passe (mêmes règles que resetOldPasswordAction)
        try {
            $options = ['serviceManager' => $sm];
            foreach ($melisLostPass->getPasswordRequestData($hash) as $row) {
                $options['login'] = $row->rh_login;
                $user = $sm->get('MelisCoreTableUser')->getEntryByField('usr_login', $row->rh_login)->current();
                if ($user) {
                    $options['userId'] = $user->usr_id;
                    $options['email']  = $user->usr_email;
                }
            }
            $passValidator = new \MelisCore\Validator\MelisPasswordValidatorWithConfig($options);
            if (!$passValidator->isValid($password)) {
                $messages = implode(' ', $passValidator->getMessages());
                return $this->jsonResponse(['success' => false, 'message' => $messages]);
            }
        } catch (\Throwable) {
            // Validateur indisponible — contrôle minimal sur la longueur
            if (strlen($password) < 8) {
                return $this->jsonResponse(['success' => false, 'code' => 'password_too_short']);
            }
        }

        // Le jeton est revalide par le service : un lien expire ne doit pas repondre "success".
        // On renvoie un CODE, pas un message : c'est React qui affiche le libelle traduit
        // (les messages en dur ici s'affichaient en anglais quelle que soit la langue).
        if (!$melisLostPass->processUpdatePassword($hash, $password)) {
            return $this->jsonResponse(['success' => false, 'code' => 'invalid_token']);
        }

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
