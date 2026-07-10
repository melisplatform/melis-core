<?php

namespace MelisCore\Controller;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil « Mon compte » (meliscore_user_profile) — édition du profil de
 * l'utilisateur COURANT (table melis_core_user).
 *
 * Calqué sur le gabarit full-React (MelisReactApiUserController). Ce n'est PAS un outil de
 * liste : l'entité est toujours l'utilisateur authentifié (pas d'id client, jamais).
 *
 * Routes :
 *   GET  /melis/react-api/user-profile        → profil courant + langues disponibles
 *   POST /melis/react-api/user-profile/save   → maj email / langue / mot de passe / avatar
 *
 * Onglet « Melis Messenger » : NON géré ici. Il appartient au module melis-messenger et est
 * ajouté de façon MODULAIRE (encart React gaté sur module actif), comme les encarts news.
 */
class MelisReactApiUserProfileController extends MelisAbstractActionController
{
    /** melisKey de l'outil (garde d'accès). « Mon compte » = tout utilisateur authentifié. */
    private const MELIS_KEY = 'meliscore_user_profile';

    // ─── GET /user-profile ────────────────────────────────────────────────────

    public function getAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }

        try {
            $userId = $this->getCurrentUserId();
            if (!$userId) {
                return $this->jsonResponse(['success' => false, 'error' => 'Unauthenticated'], 401);
            }

            $db   = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $rows = iterator_to_array($db->query(
                "SELECT u.usr_id, u.usr_login, u.usr_email, u.usr_firstname, u.usr_lastname,
                        u.usr_lang_id, u.usr_image, u.usr_creation_date, u.usr_admin,
                        r.urole_name
                 FROM melis_core_user u
                 LEFT JOIN melis_core_user_role r ON r.urole_id = u.usr_role_id
                 WHERE u.usr_id = ?",
                [$userId]
            ));
            if (!$rows) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            $u = (array) $rows[0];

            $langs = iterator_to_array($db->query(
                'SELECT lang_id, lang_locale, lang_name FROM melis_core_lang ORDER BY lang_name ASC',
                []
            ));
            $languages = [];
            foreach ($langs as $l) {
                $languages[] = [
                    'id'     => (int)    $l['lang_id'],
                    'locale' => (string) $l['lang_locale'],
                    'name'   => (string) $l['lang_name'],
                ];
            }

            return $this->jsonResponse([
                'success' => true,
                'data'    => [
                    'id'           => (int)    $u['usr_id'],
                    'login'        => (string) $u['usr_login'],
                    'email'        => (string) $u['usr_email'],
                    'firstName'    => (string) $u['usr_firstname'],
                    'lastName'     => (string) $u['usr_lastname'],
                    'roleName'     => (string) ($u['urole_name'] ?? ''),
                    'langId'       => (int)    $u['usr_lang_id'],
                    'isAdmin'      => (bool)   $u['usr_admin'],
                    'creationDate' => $u['usr_creation_date'] ? date('Y-m-d', strtotime((string) $u['usr_creation_date'])) : null,
                    'image'        => $this->imageDataUri($u['usr_image'] ?? null),
                    'languages'    => $languages,
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /user-profile/save ──────────────────────────────────────────────

    public function saveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }

        try {
            $userId = $this->getCurrentUserId();
            if (!$userId) {
                return $this->jsonResponse(['success' => false, 'error' => 'Unauthenticated'], 401);
            }

            $body     = json_decode($this->getRequest()->getContent(), true) ?? [];
            $email    = trim((string) ($body['email'] ?? ''));
            $langId   = (int) ($body['langId'] ?? 0);
            $password = (string) ($body['password'] ?? '');
            $confirm  = (string) ($body['confirmPassword'] ?? '');
            $image    = $body['image'] ?? null; // data URI, '' (efface), ou null (inchangé)

            // Email obligatoire + format.
            if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->jsonResponse(['success' => false, 'error' => 'tr_meliscore_tool_user_usr_email_error_empty'], 400);
            }
            // Langue obligatoire + existante.
            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            if ($langId <= 0 || !iterator_to_array($db->query('SELECT lang_id FROM melis_core_lang WHERE lang_id = ?', [$langId]))) {
                return $this->jsonResponse(['success' => false, 'error' => 'tr_meliscore_tool_user_usr_lang_id_error_empty'], 400);
            }

            // Mot de passe : optionnel. Si fourni → ≥ 8, regex MelisPasswordValidator, == confirmation.
            $newPassHash = null;
            if ($password !== '' || $confirm !== '') {
                $err = $this->validatePassword($password, $confirm);
                if ($err !== null) {
                    return $this->jsonResponse(['success' => false, 'error' => $err], 400);
                }
                $newPassHash = $this->getServiceManager()->get('MelisCoreAuth')->encryptPassword($password);
            }

            // Langue courante (pour décider du reload du BO si elle change).
            $curRows = iterator_to_array($db->query('SELECT usr_lang_id FROM melis_core_user WHERE usr_id = ?', [$userId]));
            $oldLangId = (int) ($curRows[0]['usr_lang_id'] ?? 0);

            // Construction dynamique du UPDATE (n'écrit que ce qui change).
            $sets   = ['usr_email = ?', 'usr_lang_id = ?'];
            $params = [$email, $langId];
            if ($newPassHash !== null) {
                $sets[]   = 'usr_password = ?';
                $params[] = $newPassHash;
                $sets[]   = 'usr_last_pass_update_date = NOW()';
            }
            $imageBinary = null; $imageChanged = false;
            if (is_string($image)) {
                $imageChanged = true;
                $imageBinary  = $this->decodeImageDataUri($image); // null = efface
                $sets[]   = 'usr_image = ?';
                $params[] = $imageBinary;
            }
            $params[] = $userId;

            $db->query('UPDATE melis_core_user SET ' . implode(', ', $sets) . ' WHERE usr_id = ?', $params);

            // Met à jour la session (header/avatar/langue reflétés sans reconnexion).
            try {
                $auth    = $this->getServiceManager()->get('MelisCoreAuth');
                $session = $auth->getStorage()->read();
                if ($session) {
                    $session->usr_email   = $email;
                    $session->usr_lang_id = $langId;
                    if ($imageChanged) { $session->usr_image = $imageBinary; }
                }
            } catch (\Throwable) {}

            return $this->jsonResponse([
                'success' => true,
                'data'    => ['id' => $userId, 'reload' => $langId !== $oldLangId],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** BLOB image → data URI base64 (ou null). */
    private function imageDataUri($blob): ?string
    {
        if ($blob === null || $blob === '') { return null; }
        return 'data:image/jpeg;base64,' . base64_encode((string) $blob);
    }

    /** data URI base64 → binaire brut (ou null si vide/invalide → efface l'avatar). */
    private function decodeImageDataUri(string $dataUri): ?string
    {
        if ($dataUri === '') { return null; }
        if (preg_match('#^data:image/[a-zA-Z0-9.+-]+;base64,(.+)$#s', $dataUri, $m)) {
            $bin = base64_decode($m[1], true);
            return $bin === false ? null : $bin;
        }
        return null;
    }

    /**
     * Valide un couple mot de passe / confirmation. Retourne une clé d'erreur (tr_…) ou null si OK.
     * Mêmes règles que le legacy UserProfileController::validatePassword.
     */
    private function validatePassword(string $password, string $confirm): ?string
    {
        if (strlen($password) < 8) {
            return 'tr_meliscore_tool_user_usr_password_error_low';
        }
        if (strlen($confirm) < 8) {
            return 'tr_meliscore_tool_user_usr_confirm_password_error_low';
        }
        $validator = new \MelisCore\Validator\MelisPasswordValidator();
        if (!$validator->isValid($password)) {
            return 'tr_meliscore_tool_user_usr_password_regex_not_match';
        }
        if ($password !== $confirm) {
            return 'tr_meliscore_tool_user_usr_password_not_match';
        }
        return null;
    }

    private function getCurrentUserId(): ?int
    {
        $auth = $this->getServiceManager()->get('MelisCoreAuth');
        if (!$auth->hasIdentity()) { return null; }
        $data = $auth->getStorage()->read();
        return isset($data->usr_id) ? (int) $data->usr_id : null;
    }

    private function isAuthenticated(): bool
    {
        return $this->getServiceManager()->get('MelisCoreAuth')->hasIdentity();
    }

    /** « Mon compte » : accessible à tout utilisateur authentifié (profil personnel). */
    private function denyUnlessAccess(): ?HttpResponse
    {
        if (!$this->isAuthenticated()) {
            return $this->jsonResponse(['success' => false, 'error' => 'Unauthenticated'], 401);
        }
        return null;
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

    private function errorResponse(\Throwable $e, int $status = 500): HttpResponse
    {
        return $this->jsonResponse([
            'success' => false,
            'error'   => $e->getMessage(),
            'file'    => basename($e->getFile()) . ':' . $e->getLine(),
        ], $status);
    }
}
