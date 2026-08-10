<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\EventManager\EventManager;
use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil "Modules" de MelisCore (activation + ordre de chargement
 * des modules de la plateforme — écrit `config/melis.module.load.php`).
 *
 * Routes :
 *   GET  /melis/react-api/modules         → liste ordonnée { name, active, version, package, requires[], dependents[] }
 *   POST /melis/react-api/modules/save    → body { modules: [noms actifs, dans l'ordre voulu] } → réécrit le loader
 *
 * Toute la logique métier reste côté Melis (MelisCoreModulesService) ; ce contrôleur
 * ne fait qu'exposer/sérialiser. Il réplique exactement le comportement de
 * MelisCore\Controller\ModulesController (statut, exclusions, écriture du fichier).
 */
class MelisReactApiModulesController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;

    /** melisKey de l'outil — utilisé par les gardes de droits (accès + capacité). */
    private const MELIS_KEY = 'meliscore_tool_user_module_management';

    /**
     * Modules cœur / techniques jamais proposés à l'activation (mirroir de
     * ModulesController::$exclude_modules, hors entrées de répertoire).
     */
    private const EXCLUDE_MODULES = [
        'MelisAssetManager',
        'MelisCore',
        'MelisSites',
        'MelisInstaller',
        'MelisModuleConfig',
        'MelisComposerDeploy',
        'MelisDbDeploy',
    ];

    // ─── GET /modules ────────────────────────────────────────────────────────

    public function listAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $svc = $this->getModuleSvc();

            // Liste de chargement actuelle (ordre = ordre de chargement Laminas).
            $loadFile = $this->readModuleLoadFile();

            // Tous les modules activables (= tout sauf cœur + MelisModuleConfig).
            $plugins = $svc->getModulePlugins(self::EXCLUDE_MODULES);

            // Statut, en PRÉSERVANT l'ordre : actifs d'abord (ordre du fichier), puis inactifs.
            $ordered = [];
            foreach ($loadFile as $module) {
                if (!in_array($module, self::EXCLUDE_MODULES, true) && in_array($module, $plugins, true)) {
                    $ordered[$module] = true;
                }
            }
            foreach ($plugins as $module) {
                if (!isset($ordered[$module])) {
                    $ordered[$module] = false;
                }
            }

            // Exclure les modules de site (cf. ModulesController::renderToolModulesContentAction).
            foreach (array_keys($ordered) as $module) {
                if ($svc->isSiteModule($module)) {
                    unset($ordered[$module]);
                }
            }

            $toggleable = array_keys($ordered);
            $versions   = $svc->getModulesAndVersions();

            // Graphe de dépendances (forward) limité aux modules activables.
            $requiresMap = [];
            foreach ($toggleable as $module) {
                $deps = [];
                try { $deps = (array) $svc->getDependencies($module); } catch (\Throwable) {}
                $requiresMap[$module] = array_values(array_filter(
                    $deps,
                    static fn($d) => in_array($d, $toggleable, true)
                ));
            }
            // Reverse → dependents.
            $dependentsMap = array_fill_keys($toggleable, []);
            foreach ($requiresMap as $module => $deps) {
                foreach ($deps as $dep) {
                    $dependentsMap[$dep][] = $module;
                }
            }

            $modules = [];
            foreach ($ordered as $name => $active) {
                $modules[] = [
                    'name'       => $name,
                    'active'     => (bool) $active,
                    'version'    => (string) ($versions[$name]['version'] ?? ''),
                    'package'    => (string) ($versions[$name]['package'] ?? ''),
                    'requires'   => $requiresMap[$name] ?? [],
                    'dependents' => $dependentsMap[$name] ?? [],
                ];
            }

            return $this->jsonResponse(['success' => true, 'data' => ['modules' => $modules]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /modules/save ──────────────────────────────────────────────────

    public function saveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }

        try {
            if (!$this->getRequest()->isPost()) {
                return $this->jsonResponse(['success' => false, 'error' => 'POST required'], 405);
            }

            $body = json_decode($this->getRequest()->getContent(), true) ?? [];
            $modules = $body['modules'] ?? [];
            if (!is_array($modules)) { $modules = []; }

            // Liste ordonnée des modules à activer (noms, dédupliqués, ordre préservé).
            $enabled = [];
            foreach ($modules as $name) {
                $name = trim((string) $name);
                if ($name !== '' && !in_array($name, $enabled, true)) {
                    $enabled[] = $name;
                }
            }

            // Réécrit config/melis.module.load.php (cœur en tête, modules dans l'ordre fourni,
            // MelisModuleConfig en bas) — exactement comme ModulesController::createModuleLoaderFile().
            $status = (bool) $this->getModuleSvc()->createModuleLoader(
                'config/',
                $enabled,
                ['MelisAssetManager', 'melisdbdeploy', 'meliscomposerdeploy', 'meliscore']
            );

            // Alimente la cloche (FlashMessenger) avec les CLÉS de traduction brutes — le listener
            // est attaché à l'identifiant partagé "MelisCore", on déclenche donc via un EventManager
            // dédié portant cet identifiant.
            try {
                $em = new EventManager($this->getEventManager()->getSharedManager(), ['MelisCore']);
                $em->trigger('meliscore_module_management_save_end', $this, [
                    'success'     => $status ? 1 : 0,
                    'textTitle'   => 'tr_meliscore_module_management_modules',
                    'textMessage' => $status
                        ? 'tr_meliscore_module_management_prompt_success'
                        : 'tr_meliscore_module_management_prompt_failed',
                ]);
            } catch (\Throwable) {}

            if (!$status) {
                return $this->jsonResponse(['success' => false, 'error' => 'Module loader write failed'], 500);
            }

            return $this->jsonResponse(['success' => true, 'data' => ['count' => count($enabled)]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Liste de chargement actuelle (ordre préservé), lue de façon robuste. */
    private function readModuleLoadFile(): array
    {
        $path = $_SERVER['DOCUMENT_ROOT'] . '/../config/melis.module.load.php';
        if (is_file($path)) {
            $list = include $path;
            if (is_array($list)) {
                return array_values($list);
            }
        }
        return [];
    }

    /** @return \MelisCore\Service\MelisCoreModulesService */
    private function getModuleSvc()
    {
        return $this->getServiceManager()->get('ModulesService');
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
