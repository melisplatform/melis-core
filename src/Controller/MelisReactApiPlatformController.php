<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil Plateformes (table melis_core_platform).
 *
 * Calqué sur MelisReactApiUserController (gabarit de migration full-React d'un outil natif).
 * Routes :
 *   GET    /melis/react-api/platforms              → liste paginée + recherche
 *   GET    /melis/react-api/platforms/stats        → statistiques (cartes KPI)
 *   GET    /melis/react-api/platforms/:id          → détail
 *   POST   /melis/react-api/platforms/save         → créer / mettre à jour
 *   DELETE /melis/react-api/platforms/delete/:id   → supprimer
 *
 * Contraintes métier (reprises du legacy PlatformsController) :
 *   - plf_name : alphanumérique, non vide, UNIQUE.
 *   - la plateforme COURANTE (env MELIS_PLATFORM) ne peut être ni renommée ni supprimée.
 */
class MelisReactApiPlatformController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;
    use MelisReactKeysetListTrait;

    /** melisKey de l'outil — utilisé par le garde de droits (cf. denyUnlessAccess). */
    private const MELIS_KEY = 'meliscore_tool_platform';

    // ─── GET /platforms ──────────────────────────────────────────────────────

    public function listAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $limit  = min(9999, max(1, (int) $this->params()->fromQuery('limit', 25)));
            $search = trim((string) ($this->params()->fromQuery('search', '') ?? ''));

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            // Filtres (communs au COUNT et à la requête data — scoping/droits inchangés).
            $filterWhere = []; $filterParams = [];
            if ($search !== '') {
                $like = '%' . $search . '%';
                $filterWhere[]  = '(plf_name LIKE ? OR plf_id LIKE ?)';
                $filterParams   = array_merge($filterParams, [$like, $like]);
            }

            // Tri server-side : whitelist clé → expression SQL NON-NULL (COALESCE) pour un
            // keyset fiable. marketplace/cache sont des flags stockés (varchar/int) → on trie
            // sur la colonne SQL sous-jacente, pas sur la valeur dérivée affichée.
            $sortMap = [
                'id'          => 'plf_id',
                'name'        => "COALESCE(plf_name,'')",
                'marketplace' => 'COALESCE(plf_update_marketplace,0)',
                'cache'       => 'COALESCE(plf_activate_cache,0)',
            ];
            $sortKey = (string) $this->params()->fromQuery('sort', 'id');
            $dir     = (string) $this->params()->fromQuery('dir', 'asc');
            $after   = (string) ($this->params()->fromQuery('after', '') ?? '');

            [$rows, $total, $nextCursor] = $this->keysetList([
                'db'           => $db,
                'from'         => 'melis_core_platform',
                'selectCols'   => 'plf_id, plf_name, plf_update_marketplace, plf_activate_cache',
                'filterWhere'  => $filterWhere,
                'filterParams' => $filterParams,
                'sortMap'      => $sortMap,
                'idCol'        => 'plf_id',
                'idAlias'      => 'plf_id',
                'sortKey'      => $sortKey,
                'dir'          => $dir,
                'after'        => $after,
                'limit'        => $limit,
            ]);

            $current = (string) getenv('MELIS_PLATFORM');
            $items = [];
            foreach ($rows as $row) {
                $items[] = $this->formatPlatform((array) $row, $current);
            }

            return $this->jsonResponse([
                'success' => true,
                'data'    => ['items' => $items, 'total' => $total, 'nextCursor' => $nextCursor, 'limit' => $limit],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /platforms/stats ─────────────────────────────────────────────────

    public function statsAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $db  = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $row = (array) (iterator_to_array($db->query(
                "SELECT COUNT(*) AS total,
                        SUM(plf_update_marketplace = 1) AS marketplace,
                        SUM(plf_activate_cache = 1)      AS cache
                 FROM melis_core_platform",
                []
            ))[0] ?? []);

            return $this->jsonResponse([
                'success' => true,
                'data'    => [
                    'total'       => (int) ($row['total'] ?? 0),
                    'marketplace' => (int) ($row['marketplace'] ?? 0),
                    'cache'       => (int) ($row['cache'] ?? 0),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /platforms/:id ───────────────────────────────────────────────────

    public function getAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }

        $id = (int) $this->params()->fromRoute('id', 0);
        if ($id <= 0) {
            return $this->jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
        }

        try {
            $db   = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $rows = iterator_to_array($db->query(
                "SELECT plf_id, plf_name, plf_update_marketplace, plf_activate_cache
                 FROM melis_core_platform WHERE plf_id = ?",
                [$id]
            ));
            if (!$rows) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            return $this->jsonResponse([
                'success' => true,
                'data'    => $this->formatPlatform((array) $rows[0], (string) getenv('MELIS_PLATFORM')),
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /platforms/save ─────────────────────────────────────────────────

    public function saveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }

        try {
            $body        = json_decode($this->getRequest()->getContent(), true) ?? [];
            $id          = isset($body['id']) && $body['id'] ? (int) $body['id'] : null;
            if ($denyCap = $this->denyUnlessCan($id ? 'edit' : 'create')) { return $denyCap; }
            $name        = trim((string) ($body['name'] ?? ''));
            $marketplace = (int) (bool) ($body['marketplace'] ?? false);
            $cache       = (int) (bool) ($body['cache'] ?? false);

            // Validation : nom alphanumérique, non vide.
            if ($name === '' || !preg_match('/^[a-zA-Z0-9]+$/', $name)) {
                return $this->jsonResponse(
                    ['success' => false, 'error' => 'Nom de plateforme invalide : alphanumérique requis (a-z, A-Z, 0-9), non vide.'],
                    400
                );
            }

            $db      = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $current = (string) getenv('MELIS_PLATFORM');

            // Unicité du nom (en excluant l'enregistrement courant si édition).
            $dupSql    = $id
                ? 'SELECT plf_id FROM melis_core_platform WHERE plf_name = ? AND plf_id <> ?'
                : 'SELECT plf_id FROM melis_core_platform WHERE plf_name = ?';
            $dupParams = $id ? [$name, $id] : [$name];
            if (iterator_to_array($db->query($dupSql, $dupParams))) {
                return $this->jsonResponse(['success' => false, 'error' => 'Ce nom de plateforme existe déjà.'], 400);
            }

            if ($id) {
                $existing = iterator_to_array($db->query('SELECT plf_name FROM melis_core_platform WHERE plf_id = ?', [$id]));
                if (!$existing) {
                    return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
                }
                $oldName = (string) $existing[0]['plf_name'];
                // La plateforme courante ne peut pas être renommée.
                if ($oldName === $current && $name !== $oldName) {
                    return $this->jsonResponse(['success' => false, 'error' => 'Impossible de renommer la plateforme courante.'], 400);
                }
                $db->query(
                    'UPDATE melis_core_platform
                     SET plf_name = ?, plf_update_marketplace = ?, plf_activate_cache = ?
                     WHERE plf_id = ?',
                    [$name, $marketplace, $cache, $id]
                );
                return $this->jsonResponse(['success' => true, 'data' => ['id' => $id]]);
            }

            $db->query(
                'INSERT INTO melis_core_platform
                    (plf_name, plf_update_marketplace, plf_activate_cache)
                 VALUES (?, ?, ?)',
                [$name, $marketplace, $cache]
            );
            $newId = (int) iterator_to_array($db->query('SELECT LAST_INSERT_ID() AS id', []))[0]['id'];

            return $this->jsonResponse(['success' => true, 'data' => ['id' => $newId]], 201);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── DELETE /platforms/delete/:id ─────────────────────────────────────────

    public function deleteAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('delete')) { return $denyCap; }

        $id = (int) $this->params()->fromRoute('id', 0);
        if ($id <= 0) {
            return $this->jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
        }

        try {
            $db   = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $rows = iterator_to_array($db->query('SELECT plf_name FROM melis_core_platform WHERE plf_id = ?', [$id]));
            if (!$rows) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            // La plateforme courante ne peut pas être supprimée.
            if ((string) $rows[0]['plf_name'] === (string) getenv('MELIS_PLATFORM')) {
                return $this->jsonResponse(['success' => false, 'error' => 'Impossible de supprimer la plateforme courante.'], 400);
            }
            $db->query('DELETE FROM melis_core_platform WHERE plf_id = ?', [$id]);
            return $this->jsonResponse(['success' => true, 'data' => null]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function formatPlatform(array $r, string $current = ''): array
    {
        return [
            'id'          => (int)    $r['plf_id'],
            'name'        => (string) $r['plf_name'],
            'marketplace' => (bool)   $r['plf_update_marketplace'],
            'cache'       => (bool)   $r['plf_activate_cache'],
            // true pour la plateforme courante (env MELIS_PLATFORM) → l'UI verrouille rename/delete.
            'isCurrent'   => $current !== '' && (string) $r['plf_name'] === $current,
        ];
    }

    private function isAuthenticated(): bool
    {
        return $this->getServiceManager()->get('MelisCoreAuth')->hasIdentity();
    }

    /**
     * Garde de droits : chaque endpoint exige l'ACCÈS à l'outil (`meliscore_tool_platform`),
     * pas seulement une session — ferme la back-door API/URL (cf. gabarit Users). 401/403/null.
     */
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
