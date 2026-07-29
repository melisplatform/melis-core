<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil Logs du back-office (table melis_core_log).
 *
 * Outil EN LECTURE SEULE (visionneuse) — pas de create/update/delete. Calqué sur le
 * gabarit de migration full-React pour la partie liste/stats, mais sans form.
 *
 * La liste passe en SQL BRUT via le trait MelisReactKeysetListTrait (scroll infini +
 * tri server-side + pagination keyset). On CONTOURNE volontairement le service
 * MelisCoreLogService qui ne gère ni le tri multi-colonnes ni le keyset. La jointure
 * de type et le scoping/droits sont reproduits ici.
 * Routes :
 *   GET /melis/react-api/logs            → liste paginée + filtres (type, user, dates, recherche)
 *   GET /melis/react-api/logs/stats      → statistiques (cartes KPI)
 *   GET /melis/react-api/logs/filters    → options des filtres (types, users) + isAdmin
 *
 * Contrainte métier (reprise du legacy LogController) :
 *   - un utilisateur NON-admin ne voit QUE ses propres logs ; un admin voit tout
 *     et peut filtrer par utilisateur.
 */
class MelisReactApiLogController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;
    use MelisReactKeysetListTrait;

    /** melisKey de l'outil — utilisé par le garde de droits (cf. denyUnlessAccess). */
    private const MELIS_KEY = 'meliscore_logs_tool';

    // ─── GET /logs ──────────────────────────────────────────────────────────────

    public function listAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $limit  = min(9999, max(1, (int) $this->params()->fromQuery('limit', 25)));
            $search = trim((string) ($this->params()->fromQuery('search', '') ?? '')) ?: null;
            $typeId = (int) $this->params()->fromQuery('type', 0) ?: null;
            // Clé EXACTE de log_title (certaines valeurs ont des espaces significatifs) → pas de trim.
            $title     = (($t = (string) ($this->params()->fromQuery('title', '') ?? '')) !== '') ? $t : null;
            $reqUser   = (int) $this->params()->fromQuery('user', 0) ?: null;
            $startDate = trim((string) ($this->params()->fromQuery('startDate', '') ?? '')) ?: null;
            $endDate   = trim((string) ($this->params()->fromQuery('endDate', '') ?? '')) ?: null;

            // Scoping : non-admin → ses propres logs uniquement ; admin → filtre libre.
            [$currentUserId, $isAdmin] = $this->currentUser();
            $userId = $isAdmin ? $reqUser : $currentUserId;

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            // Filtres (communs au COUNT et à la requête data).
            $filterWhere = []; $filterParams = [];
            if ($userId !== null) { $filterWhere[] = 'l.log_user_id = ?'; $filterParams[] = $userId; }
            if ($typeId !== null) { $filterWhere[] = 'l.log_type_id = ?'; $filterParams[] = $typeId; }
            if ($title !== null) { $filterWhere[] = 'l.log_title = ?'; $filterParams[] = $title; }
            if ($startDate !== null) { $filterWhere[] = 'l.log_date_added >= ?'; $filterParams[] = $startDate; }
            if ($endDate   !== null) { $filterWhere[] = 'l.log_date_added <= ?'; $filterParams[] = $endDate; }
            if ($search !== null) {
                // NB : log_title/log_message sont les CLÉS de traduction (le texte affiché est
                // traduit à la volée, absent de la base) → la recherche porte sur ces clés
                // brutes + le code de type, comme le legacy (qui matchait logt_code/traductions).
                $like = '%' . $search . '%';
                $filterWhere[] = '(l.log_title LIKE ? OR l.log_message LIKE ? OR COALESCE(t.logt_code,\'\') LIKE ?)';
                $filterParams = array_merge($filterParams, [$like, $like, $like]);
            }

            // Tri server-side (whitelist = COL_ORDER de la page). Chaque expression NON-NULL.
            // ⚠ title/message trient sur la colonne BRUTE (clé de traduction), pas le texte traduit.
            $sortMap = [
                'id'      => 'l.log_id',
                'date'    => 'l.log_date_added',
                'type'    => "COALESCE(t.logt_code,'')",
                'title'   => "COALESCE(l.log_title,'')",
                'message' => "COALESCE(l.log_message,'')",
                'user'    => 'l.log_user_id',
                'itemId'  => 'COALESCE(l.log_item_id,0)',
            ];
            $sortKey = (string) $this->params()->fromQuery('sort', 'date');
            $dir     = (string) $this->params()->fromQuery('dir', 'desc');

            [$rows, $total, $nextCursor] = $this->keysetList([
                'db'           => $db,
                'from'         => 'melis_core_log l',
                'joins'        => 'LEFT JOIN melis_core_log_type t ON t.logt_id = l.log_type_id',
                'selectCols'   => 'l.log_id, l.log_title, l.log_message, l.log_action_status, '
                                . 'l.log_type_id, l.log_item_id, l.log_user_id, l.log_date_added, t.logt_code',
                'filterWhere'  => $filterWhere,
                'filterParams' => $filterParams,
                'sortMap'      => $sortMap,
                'idCol'        => 'l.log_id',
                'idAlias'      => 'log_id',
                'sortKey'      => $sortKey,
                'dir'          => $dir,
                'after'        => (string) ($this->params()->fromQuery('after', '') ?? ''),
                'limit'        => $limit,
            ]);

            // Noms d'utilisateurs (batch, dédupliqué — évite le N+1).
            $userIds = [];
            foreach ($rows as $row) { $userIds[(int) ((array) $row)['log_user_id']] = true; }
            $userNames = $this->userNames(array_keys($userIds));

            // Titre/message sont des clés de traduction (`tr_...`) → traduire (parité legacy),
            // avec substitution du placeholder `[itemId]` dans le message.
            $translator = $this->getServiceManager()->get('translator');

            $items = [];
            foreach ($rows as $row) {
                $r       = (array) $row; // ignore la colonne technique __sortval
                $itemId  = $r['log_item_id'] !== null ? (int) $r['log_item_id'] : null;
                $message = (string) $translator->translate((string) $r['log_message']);
                if (strpos($message, '[itemId]') !== false) {
                    $message = str_replace('[itemId]', (string) $itemId, $message);
                }
                $items[] = [
                    'id'       => (int)    $r['log_id'],
                    'title'    => (string) $translator->translate((string) $r['log_title']),
                    'message'  => $message,
                    'typeId'   => $r['log_type_id'] !== null ? (int) $r['log_type_id'] : null,
                    'typeCode' => (string) ($r['logt_code'] ?? ''),
                    'status'   => (int) $r['log_action_status'],
                    'itemId'   => $itemId,
                    'userId'   => (int) $r['log_user_id'],
                    'userName' => $userNames[(int) $r['log_user_id']] ?? ('#' . (int) $r['log_user_id']),
                    'date'     => (string) $r['log_date_added'],
                ];
            }

            return $this->jsonResponse([
                'success' => true,
                'data'    => ['items' => $items, 'total' => $total, 'nextCursor' => $nextCursor, 'limit' => $limit],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /logs/stats ──────────────────────────────────────────────────────────

    public function statsAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            [$currentUserId, $isAdmin] = $this->currentUser();
            $userId = $isAdmin ? null : $currentUserId;

            $logSrv = $this->getServiceManager()->get('MelisCoreLogService');
            $total  = (int) $logSrv->getLogCount(null, null, $userId, null, null, null, null);

            // « Aujourd'hui » : logs depuis minuit (date serveur).
            $today      = date('Y-m-d 00:00:00');
            $todayCount = (int) $logSrv->getLogCount(null, null, $userId, $today, null, null, null);

            // Nombre de types de log distincts (référentiel global).
            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $typesRow = iterator_to_array($db->query('SELECT COUNT(*) AS n FROM melis_core_log_type', []));
            $types    = (int) ($typesRow[0]['n'] ?? 0);

            return $this->jsonResponse([
                'success' => true,
                'data'    => ['total' => $total, 'today' => $todayCount, 'types' => $types],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /logs/filters ────────────────────────────────────────────────────────

    public function filtersAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            [$currentUserId, $isAdmin] = $this->currentUser();
            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            // Portée : un non-admin ne voit que ses propres logs → les options de filtre
            // (types, utilisateurs, titres) sont dérivées du sous-ensemble VISIBLE.
            $scope = $isAdmin ? '' : (' WHERE log_user_id = ' . (int) $currentUserId);

            // Types présents dans les logs visibles.
            $typeRows = iterator_to_array($db->query(
                "SELECT t.logt_id, t.logt_code
                 FROM melis_core_log_type t
                 INNER JOIN (SELECT DISTINCT log_type_id FROM melis_core_log$scope) l ON l.log_type_id = t.logt_id
                 ORDER BY t.logt_code ASC",
                []
            ));
            $types = array_map(fn ($r) => ['id' => (int) $r['logt_id'], 'code' => (string) $r['logt_code']], $typeRows);

            // Utilisateurs présents dans les logs visibles (admin → tous ; non-admin → lui-même).
            $userRows = iterator_to_array($db->query(
                "SELECT u.usr_id,
                        TRIM(CONCAT(COALESCE(u.usr_firstname,''),' ',COALESCE(u.usr_lastname,''))) AS name,
                        u.usr_login
                 FROM melis_core_user u
                 INNER JOIN (SELECT DISTINCT log_user_id FROM melis_core_log$scope) l ON l.log_user_id = u.usr_id
                 ORDER BY name ASC",
                []
            ));
            $users = array_map(fn ($r) => [
                'id'   => (int) $r['usr_id'],
                'name' => trim((string) $r['name']) !== '' ? (string) $r['name'] : (string) $r['usr_login'],
            ], $userRows);

            // Titres présents (log_title = clé de traduction) → libellé traduit pour l'affichage.
            $translator = $this->getServiceManager()->get('translator');
            $titleRows  = iterator_to_array($db->query("SELECT DISTINCT log_title FROM melis_core_log$scope", []));
            $titles = [];
            foreach ($titleRows as $r) {
                $key = (string) $r['log_title'];
                if ($key === '') { continue; }
                $titles[] = ['key' => $key, 'label' => (string) $translator->translate($key)];
            }
            usort($titles, fn ($a, $b) => strcasecmp($a['label'], $b['label']));

            return $this->jsonResponse([
                'success' => true,
                'data'    => ['isAdmin' => $isAdmin, 'types' => $types, 'users' => $users, 'titles' => $titles],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────────

    /** [usr_id, isAdmin] de l'utilisateur connecté. */
    private function currentUser(): array
    {
        $auth = $this->getServiceManager()->get('MelisCoreAuth');
        $data = $auth->getStorage()->read();
        $userId = (int) ($data->usr_id ?? 0);
        $isAdmin = false;
        if ($userId) {
            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $row = iterator_to_array($db->query('SELECT usr_admin FROM melis_core_user WHERE usr_id = ?', [$userId]));
            $isAdmin = !empty($row) && (int) $row[0]['usr_admin'] === 1;
        }
        return [$userId, $isAdmin];
    }

    /** Map usr_id → « Prénom Nom » pour un lot d'identifiants. */
    private function userNames(array $ids): array
    {
        $ids = array_values(array_filter(array_map('intval', $ids)));
        if (!$ids) { return []; }
        $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
        $in = implode(',', array_fill(0, count($ids), '?'));
        $rows = iterator_to_array($db->query(
            "SELECT usr_id,
                    TRIM(CONCAT(COALESCE(usr_firstname,''),' ',COALESCE(usr_lastname,''))) AS name,
                    usr_login
             FROM melis_core_user WHERE usr_id IN ($in)",
            $ids
        ));
        $map = [];
        foreach ($rows as $r) {
            $name = trim((string) $r['name']);
            $map[(int) $r['usr_id']] = $name !== '' ? $name : (string) $r['usr_login'];
        }
        return $map;
    }

    private function isAuthenticated(): bool
    {
        return $this->getServiceManager()->get('MelisCoreAuth')->hasIdentity();
    }

    /**
     * Garde de droits : chaque endpoint exige l'ACCÈS à l'outil (`meliscore_logs_tool`),
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
