<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil Annonces (table melis_core_announcement).
 *
 * Calqué sur MelisReactApiPlatformController (gabarit de migration full-React d'un outil natif).
 * Routes :
 *   GET    /melis/react-api/announcements              → liste paginée + recherche
 *   GET    /melis/react-api/announcements/stats        → statistiques (cartes KPI)
 *   GET    /melis/react-api/announcements/:id          → détail
 *   POST   /melis/react-api/announcements/save         → créer / mettre à jour
 *   DELETE /melis/react-api/announcements/delete/:id   → supprimer
 *
 * Contraintes métier (reprises du legacy AnnouncementController) :
 *   - mca_title et mca_text non vides.
 *   - mca_user_id = utilisateur connecté (forcé au save, jamais fourni par le client).
 *   - mca_date = date fournie, sinon date courante.
 *   - mca_text contient du HTML (rendu tel quel sur le dashboard « Actualités »).
 */
class MelisReactApiAnnouncementController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;
    use MelisReactKeysetListTrait;

    /** melisKey de l'outil — utilisé par le garde de droits (cf. denyUnlessAccess). */
    private const MELIS_KEY = 'melis_core_announcement_tool';

    // ─── GET /announcements ──────────────────────────────────────────────────────

    public function listAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $limit  = min(9999, max(1, (int) $this->params()->fromQuery('limit', 25)));
            $search = trim((string) ($this->params()->fromQuery('search', '') ?? ''));
            $status = $this->params()->fromQuery('status', '');

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            // Filtres (communs au COUNT et à la requête data).
            $filterWhere = [];
            $filterParams = [];
            if ($search !== '') {
                $like          = '%' . $search . '%';
                $filterWhere[] = '(a.mca_title LIKE ? OR a.mca_text LIKE ? OR a.mca_id LIKE ?)';
                $filterParams  = array_merge($filterParams, [$like, $like, $like]);
            }
            if ($status === '0' || $status === '1') {
                $filterWhere[]  = 'a.mca_status = ?';
                $filterParams[] = (int) $status;
            }

            // Tri server-side : whitelist clé → expression SQL NON-NULL (COALESCE) pour que
            // la comparaison keyset reste fiable sur les colonnes nullables (mca_date).
            // `user` trie sur la colonne brute présente dans le SELECT (mca_user_id).
            $sortMap = [
                'id'     => 'a.mca_id',
                'status' => 'a.mca_status',
                'title'  => "COALESCE(a.mca_title,'')",
                'text'   => "COALESCE(a.mca_text,'')",
                'date'   => "COALESCE(a.mca_date,'1000-01-01 00:00:00')",
                'user'   => 'a.mca_user_id',
            ];

            [$rows, $total, $nextCursor] = $this->keysetList([
                'db'           => $db,
                'from'         => 'melis_core_announcement a',
                'joins'        => 'LEFT JOIN melis_core_user u ON u.usr_id = a.mca_user_id',
                'selectCols'   => "a.mca_id, a.mca_user_id, a.mca_status, a.mca_title, a.mca_text, a.mca_date,
                        TRIM(CONCAT(COALESCE(u.usr_firstname,''),' ',COALESCE(u.usr_lastname,''))) AS user_name,
                        u.usr_login",
                'filterWhere'  => $filterWhere,
                'filterParams' => $filterParams,
                'sortMap'      => $sortMap,
                'idCol'        => 'a.mca_id',
                'idAlias'      => 'mca_id',
                'sortKey'      => (string) $this->params()->fromQuery('sort', 'date'),
                'dir'          => strtolower((string) $this->params()->fromQuery('dir', 'desc')) === 'asc' ? 'asc' : 'desc',
                'after'        => (string) ($this->params()->fromQuery('after', '') ?? ''),
                'limit'        => $limit,
            ]);

            $items = [];
            foreach ($rows as $row) {
                $items[] = $this->formatAnnouncement((array) $row);
            }

            return $this->jsonResponse([
                'success' => true,
                'data'    => ['items' => $items, 'total' => $total, 'nextCursor' => $nextCursor, 'limit' => $limit],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /announcements/stats ─────────────────────────────────────────────────

    public function statsAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $db  = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $row = (array) (iterator_to_array($db->query(
                "SELECT COUNT(*) AS total,
                        SUM(mca_status = 1) AS active,
                        SUM(mca_status = 0) AS inactive
                 FROM melis_core_announcement",
                []
            ))[0] ?? []);

            return $this->jsonResponse([
                'success' => true,
                'data'    => [
                    'total'    => (int) ($row['total'] ?? 0),
                    'active'   => (int) ($row['active'] ?? 0),
                    'inactive' => (int) ($row['inactive'] ?? 0),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /announcements/:id ───────────────────────────────────────────────────

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
                "SELECT a.mca_id, a.mca_user_id, a.mca_status, a.mca_title, a.mca_text, a.mca_date,
                        TRIM(CONCAT(COALESCE(u.usr_firstname,''),' ',COALESCE(u.usr_lastname,''))) AS user_name,
                        u.usr_login
                 FROM melis_core_announcement a
                 LEFT JOIN melis_core_user u ON u.usr_id = a.mca_user_id
                 WHERE a.mca_id = ?",
                [$id]
            ));
            if (!$rows) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            return $this->jsonResponse([
                'success' => true,
                'data'    => $this->formatAnnouncement((array) $rows[0]),
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /announcements/save ─────────────────────────────────────────────────

    public function saveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }

        try {
            $body   = json_decode($this->getRequest()->getContent(), true) ?? [];
            $id     = isset($body['id']) && $body['id'] ? (int) $body['id'] : null;
            if ($denyCap = $this->denyUnlessCan($id ? 'edit' : 'create')) { return $denyCap; }
            $title  = trim((string) ($body['title'] ?? ''));
            $text   = trim((string) ($body['text'] ?? ''));
            $status = (int) (bool) ($body['status'] ?? false);
            $date   = trim((string) ($body['date'] ?? ''));

            // Validation : titre et texte non vides.
            if ($title === '') {
                return $this->jsonResponse(['success' => false, 'error' => 'Le titre est obligatoire.'], 400);
            }
            if ($text === '' || trim(strip_tags($text)) === '') {
                return $this->jsonResponse(['success' => false, 'error' => 'Le texte est obligatoire.'], 400);
            }

            // mca_date : valeur fournie (datetime) sinon date courante.
            $sqlDate = $date !== '' ? $this->normalizeDate($date) : date('Y-m-d H:i:s');

            // mca_user_id : utilisateur connecté (jamais fourni par le client).
            $auth   = $this->getServiceManager()->get('MelisCoreAuth');
            $userId = (int) ($auth->getStorage()->read()->usr_id ?? 0);

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            if ($id) {
                $existing = iterator_to_array($db->query('SELECT mca_id FROM melis_core_announcement WHERE mca_id = ?', [$id]));
                if (!$existing) {
                    return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
                }
                $db->query(
                    'UPDATE melis_core_announcement
                     SET mca_status = ?, mca_title = ?, mca_text = ?, mca_date = ?, mca_user_id = ?
                     WHERE mca_id = ?',
                    [$status, $title, $text, $sqlDate, $userId, $id]
                );
                return $this->jsonResponse(['success' => true, 'data' => ['id' => $id]]);
            }

            $db->query(
                'INSERT INTO melis_core_announcement
                    (mca_user_id, mca_status, mca_title, mca_text, mca_date)
                 VALUES (?, ?, ?, ?, ?)',
                [$userId, $status, $title, $text, $sqlDate]
            );
            $newId = (int) iterator_to_array($db->query('SELECT LAST_INSERT_ID() AS id', []))[0]['id'];

            return $this->jsonResponse(['success' => true, 'data' => ['id' => $newId]], 201);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── DELETE /announcements/delete/:id ─────────────────────────────────────────

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
            $rows = iterator_to_array($db->query('SELECT mca_id FROM melis_core_announcement WHERE mca_id = ?', [$id]));
            if (!$rows) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            $db->query('DELETE FROM melis_core_announcement WHERE mca_id = ?', [$id]);
            return $this->jsonResponse(['success' => true, 'data' => null]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────────

    private function formatAnnouncement(array $r): array
    {
        $name = trim((string) ($r['user_name'] ?? ''));
        return [
            'id'       => (int)    $r['mca_id'],
            'status'   => (bool)   $r['mca_status'],
            'title'    => (string) $r['mca_title'],
            'text'     => (string) $r['mca_text'],
            'date'     => (string) $r['mca_date'],
            'userId'   => (int)    $r['mca_user_id'],
            'userName' => $name !== '' ? $name : (string) ($r['usr_login'] ?? ('#' . (int) $r['mca_user_id'])),
        ];
    }

    /** Normalise une date client (ISO `Y-m-d\TH:i` du <input datetime-local> ou `Y-m-d H:i:s`). */
    private function normalizeDate(string $date): string
    {
        $ts = strtotime(str_replace('T', ' ', $date));
        return $ts ? date('Y-m-d H:i:s', $ts) : date('Y-m-d H:i:s');
    }

    private function isAuthenticated(): bool
    {
        return $this->getServiceManager()->get('MelisCoreAuth')->hasIdentity();
    }

    /**
     * Garde de droits : chaque endpoint exige l'ACCÈS à l'outil (`melis_core_announcement_tool`),
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
