<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil "Thème de la plateforme" (PlatformScheme) de MelisCore — couleurs +
 * logos/favicon du back-office. Schéma actif unique (id 2, défaut id 1).
 *
 * Routes :
 *   GET  /melis/react-api/platformscheme        → { scheme: { colors{...}, sidebar_header_text, ...images } }
 *   POST /melis/react-api/platformscheme/save   → body { scheme: {...} } → écrit en base + régénère schemes.css
 *   POST /melis/react-api/platformscheme/reset  → réinitialise au thème par défaut
 *
 * Logique métier réutilisée côté Melis : MelisCorePlatformSchemeService (get/save/reset) +
 * MelisCoreTool::getViewContent('getStyleColorCss') pour régénérer le CSS (même vue que le legacy)
 * + mise à jour du timestamp plateforme. Ce contrôleur orchestre, il ne réimplémente rien.
 *
 * NB (1er passage) : l'UPLOAD de fichiers (logos/favicon) reste sur la vue « Old » (iframe) ;
 * ici les images sont éditées comme des chemins. À compléter lors du nettoyage de l'outil.
 */
class MelisReactApiPlatformSchemeController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;

    private const MELIS_KEY  = 'meliscore_tool_platform_scheme';
    private const SCHEME_ID  = 2;

    /** Clés couleurs (JSON dans pscheme_colors — lues telles quelles par getStyleColorCss). */
    private const COLOR_KEYS = [
        'melis_core_platform_color_primary_color',
        'melis_core_platform_color_secondary_color',
        'melis_core_platform_color_sidebar_bg_color',
        'melis_core_platform_color_login_link_color',
    ];

    private const COLOR_DEFAULTS = [
        'melis_core_platform_color_primary_color'   => '#e61c23',
        'melis_core_platform_color_secondary_color' => '#ce5459',
        'melis_core_platform_color_sidebar_bg_color' => '#373737',
        'melis_core_platform_color_login_link_color' => '#e61c23',
    ];

    /** Champs image (chemins) stockés en colonnes dédiées. */
    private const IMAGE_KEYS = [
        'sidebar_header_logo',
        'login_logo',
        'login_background',
        'favicon',
    ];

    // ─── GET /platformscheme ──────────────────────────────────────────────────

    public function getAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $scheme = [
                'colors'              => self::COLOR_DEFAULTS,
                'sidebar_header_text' => 'MELIS PLATFORM',
                'sidebar_header_logo' => '',
                'login_logo'          => '',
                'login_background'    => '',
                'favicon'             => '',
            ];

            $ent = $this->schemeSvc()->getCurrentScheme(false);
            if ($ent) {
                $colors = json_decode((string) $ent->getColors(), true);
                if (is_array($colors)) {
                    foreach (self::COLOR_KEYS as $k) {
                        if (array_key_exists($k, $colors)) { $scheme['colors'][$k] = (string) $colors[$k]; }
                    }
                }
                $scheme['sidebar_header_text'] = (string) $ent->getSidebarHeaderText();
                $scheme['sidebar_header_logo'] = (string) $ent->getSidebarHeaderLogo();
                $scheme['login_logo']          = (string) $ent->getLoginLogo();
                $scheme['login_background']    = (string) $ent->getLoginBackground();
                $scheme['favicon']             = (string) $ent->getFavicon();
            }

            return $this->jsonResponse(['success' => true, 'data' => ['scheme' => $scheme]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /platformscheme/save ────────────────────────────────────────────

    public function saveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }

        try {
            if (!$this->getRequest()->isPost()) {
                return $this->jsonResponse(['success' => false, 'error' => 'POST required'], 405);
            }

            $body = json_decode($this->getRequest()->getContent(), true) ?? [];
            $in   = is_array($body['scheme'] ?? null) ? $body['scheme'] : $body;

            // Couleurs : valider l'hexadécimal (#rrggbb), normaliser le préfixe '#'.
            $inColors = is_array($in['colors'] ?? null) ? $in['colors'] : [];
            $colors   = [];
            foreach (self::COLOR_KEYS as $k) {
                $val = trim((string) ($inColors[$k] ?? self::COLOR_DEFAULTS[$k]));
                if ($val !== '' && !preg_match('/^#?[0-9a-fA-F]{6}$/', $val)) {
                    return $this->jsonResponse(['success' => false, 'error' => "Invalid color: $k"], 422);
                }
                if ($val !== '' && $val[0] !== '#') { $val = '#' . $val; }
                $colors[$k] = $val;
            }

            // Texte d'en-tête (5–45 si renseigné, comme le form legacy).
            $sidebarText = trim((string) ($in['sidebar_header_text'] ?? ''));
            if ($sidebarText !== '' && (mb_strlen($sidebarText) < 5 || mb_strlen($sidebarText) > 45)) {
                return $this->jsonResponse(['success' => false, 'error' => 'Sidebar header text must be 5–45 characters'], 422);
            }

            $data = [
                'pscheme_colors'              => json_encode($colors, JSON_UNESCAPED_SLASHES),
                'pscheme_sidebar_header_text' => $sidebarText,
                'pscheme_sidebar_header_logo' => (string) ($in['sidebar_header_logo'] ?? ''),
                'pscheme_login_logo'          => (string) ($in['login_logo'] ?? ''),
                'pscheme_login_background'    => (string) ($in['login_background'] ?? ''),
                'pscheme_favicon'             => (string) ($in['favicon'] ?? ''),
            ];

            $ok = $this->schemeSvc()->saveScheme($data, self::SCHEME_ID, true);
            if (!$ok) {
                return $this->jsonResponse(['success' => false, 'error' => 'Scheme save failed'], 500);
            }

            $this->regenerateCss();

            return $this->jsonResponse(['success' => true, 'data' => ['saved' => true]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /platformscheme/reset ───────────────────────────────────────────

    public function resetAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }

        try {
            if (!$this->getRequest()->isPost()) {
                return $this->jsonResponse(['success' => false, 'error' => 'POST required'], 405);
            }
            $ok = $this->schemeSvc()->resetScheme(self::SCHEME_ID);
            if (!$ok) {
                return $this->jsonResponse(['success' => false, 'error' => 'Scheme reset failed'], 500);
            }
            $this->regenerateCss();
            return $this->jsonResponse(['success' => true, 'data' => ['reset' => true]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Régénère assets/css/schemes.css (vue legacy getStyleColorCss) + timestamp plateforme. */
    private function regenerateCss(): void
    {
        @ini_set('memory_limit', '-1');
        @set_time_limit(0);
        $content = $this->getServiceManager()->get('MelisCoreTool')->getViewContent([
            'module'     => 'MelisCore',
            'controller' => 'PlatformScheme',
            'action'     => 'getStyleColorCss',
        ]);
        $assetsFolder = $_SERVER['DOCUMENT_ROOT'] . '/assets/css/';
        if (!file_exists($assetsFolder)) { @mkdir($assetsFolder, 0755, true); }
        @file_put_contents($assetsFolder . 'schemes.css', $content);

        // Invalide les caches navigateur (timestamp du fichier de scheme).
        try {
            $platformTable = $this->getServiceManager()->get('MelisCoreTablePlatform');
            $platformData  = $platformTable->getEntryByField('plf_name', getenv('MELIS_PLATFORM'))->current();
            if (!empty($platformData)) {
                $platformTable->save(['plf_scheme_file_time' => time()], $platformData->plf_id);
            }
        } catch (\Throwable) {}
    }

    /** @return \MelisCore\Service\MelisCorePlatformSchemeService */
    private function schemeSvc()
    {
        return $this->getServiceManager()->get('MelisCorePlatformSchemeService');
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
