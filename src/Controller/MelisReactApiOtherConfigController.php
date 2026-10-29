<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil "Autres Configurations" (onglet Core) de MelisCore — politique de
 * connexion / mot de passe stockée dans la table `melis_core_login_config`.
 *
 * Routes :
 *   GET  /melis/react-api/otherconfig        → { config: { ...16 clés... } } (valeurs courantes)
 *   POST /melis/react-api/otherconfig/save   → body { config: {...} } → valide + enregistre en base
 *
 * Toute la logique métier (validation conditionnelle des 4 formulaires + enregistrement)
 * reste côté Melis : on délègue à `MelisPasswordSettingsService::saveItem()`, le même service
 * que le listener legacy `meliscore_save_other_config`. Ce contrôleur ne fait que lire/sérialiser.
 */
class MelisReactApiOtherConfigController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;

    /** melisKey de l'outil — gardes de droits (accès + capacité). */
    private const MELIS_KEY = 'meliscore_tool_other_config';

    /** Les 16 clés de configuration (une ligne par clé dans melis_core_login_config). */
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

    // ─── GET /otherconfig ─────────────────────────────────────────────────────

    public function getAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            // Parité stricte avec le legacy : les valeurs par défaut (rien d'enregistré) viennent
            // de `meliscore/datas/otherconfig_default/login` (config/otherconfig.php), écrasées par
            // les valeurs enregistrées en base. NE PAS hardcoder les défauts ici : le legacy
            // pré-remplit p.ex. login_account_admin_email = contact@melistechnology.com — sans quoi
            // un simple « Enregistrer » échoue sur le validateur email requis.
            $config = $this->effectiveLoginConfig();
            return $this->jsonResponse(['success' => true, 'data' => ['config' => $config]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    /**
     * Config effective de la politique connexion/mot de passe : les 16 clés, en string.
     * Défauts (`otherconfig_default/login`) surchargés par les valeurs enregistrées en base.
     */
    private function effectiveLoginConfig(): array
    {
        $merged = $this->getServiceManager()->get('MelisPasswordSettingsService')->getLoginSettings();

        $config = [];
        foreach (self::KEYS as $k) {
            $config[$k] = isset($merged[$k]) ? (string) $merged[$k] : '';
        }
        return $config;
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

            // Délègue toute la logique métier (validation conditionnelle + enregistrement en base).
            $result = $this->getServiceManager()->get('MelisPasswordSettingsService')->saveItem($settings);

            if (empty($result['success'])) {
                $fields = $result['errors'] ?? [];
                $message = $this->flattenErrors($fields);
                if ($message === '') {
                    $message = $this->getServiceManager()->get('translator')
                        ->translate('tr_meliscore_tool_other_config_unable_to_save');
                }
                return $this->jsonResponse([
                    'success' => false,
                    'error'   => $message,
                    'fields'  => $fields,
                ], 422);
            }

            return $this->jsonResponse(['success' => true, 'data' => ['saved' => true]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

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
