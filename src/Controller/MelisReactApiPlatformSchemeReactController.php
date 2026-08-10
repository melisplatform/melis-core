<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST du thème du back-office REACT — interface DISTINCTE du legacy "Platform theme".
 * Données dans la table dédiée `melis_core_platform_scheme_react` (service
 * MelisCorePlatformSchemeReactService), aucune dépendance au scheme legacy → rétrocompat préservée.
 *
 * Routes :
 *   GET  /melis/react-api/platformscheme-react       → { scheme: { headerLogo } }
 *   POST /melis/react-api/platformscheme-react/save  → body { scheme: { headerLogo } }
 *
 * 1ère itération : logo d'en-tête (haut-gauche du BO connecté). Le mapping camelCase ⇄ clé DB est
 * centralisé (FIELDS) pour ajouter facilement header text / login logo / favicon ensuite.
 */
class MelisReactApiPlatformSchemeReactController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;

    private const MELIS_KEY = 'meliscore_tool_platform_scheme';

    /** Champs mono-valeur (images). camelCase (API) => clé en base. */
    private const FIELDS = [
        'headerLogo'      => 'header_logo',
        'loginLogo'       => 'login_logo',
        'loginBackground' => 'login_background',
    ];

    /** Champs TRADUISIBLES (par langue du BO). camelCase (API) => clé en base. */
    private const TRANS_FIELDS = [
        'loginTitle'    => 'login_title',
        'loginSubtitle' => 'login_subtitle',
    ];

    // ─── GET /platformscheme-react ────────────────────────────────────────────
    // PUBLIC (route exclue de checkIdentity) : le panneau gauche du login doit pouvoir lire le
    // thème AVANT authentification. Ne renvoie que du branding (non sensible).

    public function getAction(): HttpResponse
    {
        try {
            $stored = $this->schemeSvc()->getAll();
            $scheme = [];
            foreach (self::FIELDS as $api => $dbKey) {
                $scheme[$api] = (string) ($stored[$dbKey] ?? '');
            }

            // Traductions (clé DB => [langId => valeur]) remappées en camelCase API.
            $storedTrans = $this->schemeSvc()->getTranslations();
            $translations = [];
            foreach (self::TRANS_FIELDS as $api => $dbKey) {
                $translations[$api] = (object) [];
                foreach (($storedTrans[$dbKey] ?? []) as $langId => $val) {
                    $translations[$api]->{(string) $langId} = (string) $val;
                }
            }

            return $this->jsonResponse(['success' => true, 'data' => [
                'scheme'       => $scheme,
                'translations' => $translations,
                'languages'    => $this->languages(),
                'version'      => $this->coreVersion(),
            ]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /platformscheme-react/save ──────────────────────────────────────

    public function saveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }

        try {
            if (!$this->getRequest()->isPost()) {
                return $this->jsonResponse(['success' => false, 'error' => 'POST required'], 405);
            }
            $body = json_decode($this->getRequest()->getContent(), true) ?? [];
            $in   = is_array($body['scheme'] ?? null) ? $body['scheme'] : [];
            $inTr = is_array($body['translations'] ?? null) ? $body['translations'] : [];

            // Champs mono-valeur.
            $kv = [];
            foreach (self::FIELDS as $api => $dbKey) {
                if (array_key_exists($api, $in)) {
                    $kv[$dbKey] = $in[$api] === null ? null : (string) $in[$api];
                }
            }
            if (!empty($kv)) { $this->schemeSvc()->setMany($kv); }

            // Traductions : { loginTitle: { langId: value }, loginSubtitle: {...} }.
            foreach (self::TRANS_FIELDS as $api => $dbKey) {
                if (!is_array($inTr[$api] ?? null)) { continue; }
                foreach ($inTr[$api] as $langId => $val) {
                    $langId = (int) $langId;
                    if ($langId > 0) {
                        $this->schemeSvc()->setTranslation($dbKey, $langId, $val === null ? null : (string) $val);
                    }
                }
            }

            return $this->jsonResponse(['success' => true, 'data' => ['saved' => true]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /platformscheme-react/reset ─────────────────────────────────────
    // Restaure le thème par défaut : vide toutes les valeurs stockées (images + textes
    // traduits). Ici « défaut » = valeurs vides → l'app retombe sur ses défauts in-app
    // (miroir du « Restore to Default » legacy, qui recopiait la ligne MELIS_DEFAULT).

    public function resetAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }

        try {
            if (!$this->getRequest()->isPost()) {
                return $this->jsonResponse(['success' => false, 'error' => 'POST required'], 405);
            }

            // Champs mono-valeur → null.
            $kv = [];
            foreach (self::FIELDS as $dbKey) { $kv[$dbKey] = null; }
            $this->schemeSvc()->setMany($kv);

            // Traductions existantes → null (toutes langues).
            $storedTrans = $this->schemeSvc()->getTranslations();
            foreach (self::TRANS_FIELDS as $dbKey) {
                foreach (array_keys($storedTrans[$dbKey] ?? []) as $langId) {
                    $this->schemeSvc()->setTranslation($dbKey, (int) $langId, null);
                }
            }

            return $this->jsonResponse(['success' => true, 'data' => ['reset' => true]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    /** Version de la plateforme = version du module MelisCore (comme le footer legacy). */
    private function coreVersion(): string
    {
        try {
            $svc = $this->getServiceManager()->get('ModulesService');
            $info = $svc->getModulesAndVersions('MelisCore');
            if (is_array($info)) {
                return (string) ($info['version'] ?? ($info['MelisCore']['version'] ?? ''));
            }
        } catch (\Throwable) {}
        return '';
    }

    /** Langues du back-office (pour les drapeaux/onglets de l'éditeur). */
    private function languages(): array
    {
        $out = [];
        try {
            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $rows = $db->query('SELECT lang_id, lang_locale, lang_name FROM melis_core_lang ORDER BY lang_id', []);
            foreach ($rows as $r) {
                $out[] = [
                    'id'     => (int) $r['lang_id'],
                    'locale' => (string) $r['lang_locale'],
                    'name'   => (string) $r['lang_name'],
                ];
            }
        } catch (\Throwable) {}
        return $out;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** @return \MelisCore\Service\MelisCorePlatformSchemeReactService */
    private function schemeSvc()
    {
        return $this->getServiceManager()->get('MelisCorePlatformSchemeReactService');
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
