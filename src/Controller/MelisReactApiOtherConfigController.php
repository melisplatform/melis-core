<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil "Autres Configurations" (onglet Core) de MelisCore — politique de
 * connexion / mot de passe stockée dans `vendor/melisplatform/melis-core/config/app.login.php`.
 *
 * Routes :
 *   GET  /melis/react-api/otherconfig        → { config: { ...16 clés... } } (valeurs courantes)
 *   POST /melis/react-api/otherconfig/save   → body { config: {...} } → valide + écrit app.login.php
 *
 * Toute la logique métier (validation conditionnelle des 4 formulaires + écriture du fichier)
 * reste côté Melis : on délègue à `MelisPasswordSettingsService::saveItem()`, le même service
 * que le listener legacy `meliscore_save_other_config`. Ce contrôleur ne fait que lire/sérialiser.
 */
class MelisReactApiOtherConfigController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;

    /** melisKey de l'outil — gardes de droits (accès + capacité). */
    private const MELIS_KEY = 'meliscore_tool_other_config';

    /** Les 16 clés de configuration (app.login.php → plugins.meliscore.datas.login). */
    private const KEYS = [
        'login_account_lock_status',
        'login_account_admin_email',
        'login_account_lock_number_of_attempts',
        'login_account_type_of_lock',
        'login_account_duration_days',
        'login_account_duration_hours',
        'login_account_duration_minutes',
        'password_validity_status',
        'password_validity_lifetime',
        'password_duplicate_status',
        'password_duplicate_lifetime',
        'password_complexity_number_of_characters',
        'password_complexity_use_special_characters',
        'password_complexity_use_lower_case',
        'password_complexity_use_upper_case',
        'password_complexity_use_digit',
    ];

    /** Valeurs par défaut si app.login.php absent. */
    private const DEFAULTS = [
        'login_account_lock_status'                  => '0',
        'login_account_admin_email'                  => '',
        'login_account_lock_number_of_attempts'      => '',
        'login_account_type_of_lock'                 => 'timer',
        'login_account_duration_days'                => '0',
        'login_account_duration_hours'               => '0',
        'login_account_duration_minutes'             => '0',
        'password_validity_status'                   => '0',
        'password_validity_lifetime'                 => '',
        'password_duplicate_status'                  => '0',
        'password_duplicate_lifetime'                => '183',
        'password_complexity_number_of_characters'   => '8',
        'password_complexity_use_special_characters' => '',
        'password_complexity_use_lower_case'         => '',
        'password_complexity_use_upper_case'         => '',
        'password_complexity_use_digit'              => '',
    ];

    // ─── GET /otherconfig ─────────────────────────────────────────────────────

    public function getAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $config = self::DEFAULTS;
            $file = $this->configFile();
            if (is_file($file)) {
                $cfg   = include $file;
                $saved = $cfg['plugins']['meliscore']['datas']['login'] ?? [];
                if (is_array($saved)) {
                    foreach (self::KEYS as $k) {
                        if (array_key_exists($k, $saved)) {
                            $config[$k] = (string) $saved[$k];
                        }
                    }
                }
            }
            return $this->jsonResponse(['success' => true, 'data' => ['config' => $config]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /otherconfig/save ───────────────────────────────────────────────

    public function saveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }

        try {
            if (!$this->getRequest()->isPost()) {
                return $this->jsonResponse(['success' => false, 'error' => 'POST required'], 405);
            }

            $body = json_decode($this->getRequest()->getContent(), true) ?? [];
            $in   = is_array($body['config'] ?? null) ? $body['config'] : $body;

            // Normaliser exactement les 16 clés attendues par le service (tout en string).
            $settings = [];
            foreach (self::KEYS as $k) {
                $settings[$k] = isset($in[$k]) ? (string) $in[$k] : '';
            }

            // Délègue toute la logique métier (validation conditionnelle + écriture app.login.php).
            $result = $this->getServiceManager()->get('MelisPasswordSettingsService')->saveItem($settings);

            if (empty($result['success'])) {
                return $this->jsonResponse([
                    'success' => false,
                    'error'   => $this->flattenErrors($result['errors'] ?? []) ?: 'Validation failed',
                    'fields'  => $result['errors'] ?? [],
                ], 422);
            }

            return $this->jsonResponse(['success' => true, 'data' => ['saved' => true]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function configFile(): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . '/../vendor/melisplatform/melis-core/config/app.login.php';
    }

    /** Aplatit les messages d'erreur de formulaire Laminas en une chaîne lisible. */
    private function flattenErrors(array $errors): string
    {
        $msgs = [];
        foreach ($errors as $field => $info) {
            if (!is_array($info)) { continue; }
            $label = isset($info['label']) ? (string) $info['label'] : $field;
            foreach ($info as $key => $message) {
                if ($key === 'label') { continue; }
                if (is_string($message) && $message !== '') {
                    $msgs[] = trim($label . ' : ' . $message);
                }
            }
        }
        return implode(' • ', array_values(array_unique($msgs)));
    }

    private function isAuthenticated(): bool
    {
        return $this->getServiceManager()->get('MelisCoreAuth')->hasIdentity();
    }

    private function denyUnlessAccess(): ?HttpResponse
    {
        if (!$this->isAuthenticated()) {
            return $this->jsonResponse(['success' => false, 'error' => 'Unauthenticated'], 401);
        }
        try {
            if (!$this->getServiceManager()->get('MelisCoreRights')->canAccess(self::MELIS_KEY)) {
                return $this->jsonResponse(['success' => false, 'error' => 'Forbidden'], 403);
            }
        } catch (\Throwable) {}
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
