<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour la gestion des utilisateurs Melis.
 *
 * Routes :
 *   GET    /melis/react-api/users              → liste paginée + filtres
 *   GET    /melis/react-api/users/:id          → détail utilisateur
 *   POST   /melis/react-api/users/save         → créer / mettre à jour
 *   DELETE /melis/react-api/users/delete/:id   → supprimer
 *   GET    /melis/react-api/users/stats        → statistiques
 *   GET    /melis/react-api/roles              → liste des rôles
 */
class MelisReactApiUserController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;

    /** melisKey de l'outil — utilisé par les gardes de droits (accès + capacité). */
    private const MELIS_KEY = 'meliscore_tool_user';

    // ─── GET /users ──────────────────────────────────────────────────────────

    public function listAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $limit     = min(9999, max(1, (int) $this->params()->fromQuery('limit', 25)));
            $search    = trim((string) ($this->params()->fromQuery('search', '') ?? ''));
            $rawStatus = $this->params()->fromQuery('status', '');
            $status    = ($rawStatus !== '' && $rawStatus !== null) ? (int) $rawStatus : null;
            $rawRole   = $this->params()->fromQuery('roleId', '');
            $roleId    = ($rawRole !== '' && $rawRole !== null) ? (int) $rawRole : null;

            // Tri server-side : whitelist clé → expression SQL. Chaque expression est rendue
            // NON-NULL (COALESCE) pour que le keyset (comparaison sur la valeur de tri) reste
            // fiable, y compris sur les colonnes nullables (rôle, dernière connexion).
            $sortMap = [
                'id'        => 'u.usr_id',
                'login'     => 'u.usr_login',
                'name'      => "CONCAT(COALESCE(u.usr_firstname,''),' ',COALESCE(u.usr_lastname,''))",
                'email'     => "COALESCE(u.usr_email,'')",
                'role'      => "COALESCE(r.urole_name,'')",
                'admin'     => 'u.usr_admin',
                'status'    => 'u.usr_status',
                'lastLogin' => "COALESCE(u.usr_last_login_date,'1000-01-01 00:00:00')",
            ];
            $sortKey  = (string) $this->params()->fromQuery('sort', 'id');
            if (!isset($sortMap[$sortKey])) { $sortKey = 'id'; }
            $sortExpr = $sortMap[$sortKey];
            $dir = strtolower((string) $this->params()->fromQuery('dir', 'desc')) === 'asc' ? 'ASC' : 'DESC';
            $op  = $dir === 'ASC' ? '>' : '<';

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            // Filtres (communs au COUNT et à la requête data).
            $filterWhere = []; $filterParams = [];
            if ($status !== null) { $filterWhere[] = 'u.usr_status = ?'; $filterParams[] = $status; }
            if ($roleId !== null) { $filterWhere[] = 'u.usr_role_id = ?'; $filterParams[] = $roleId; }
            if ($search !== '') {
                $like = '%' . $search . '%';
                $filterWhere[] = '(u.usr_login LIKE ? OR u.usr_email LIKE ? OR u.usr_firstname LIKE ? OR u.usr_lastname LIKE ?)';
                $filterParams = array_merge($filterParams, [$like, $like, $like, $like]);
            }

            // total = taille du jeu filtré (indépendant du curseur).
            $countWhere = $filterWhere ? 'WHERE ' . implode(' AND ', $filterWhere) : '';
            $countRow = iterator_to_array($db->query("SELECT COUNT(*) AS total FROM melis_core_user u $countWhere", $filterParams));
            $total = (int) ($countRow[0]['total'] ?? 0);

            // Keyset : reprendre STRICTEMENT après le dernier élément (valeur de tri + usr_id).
            $dataWhere = $filterWhere; $dataParams = $filterParams;
            $after = (string) ($this->params()->fromQuery('after', '') ?? '');
            if ($after !== '') {
                $cur = json_decode((string) base64_decode($after, true), true);
                if (is_array($cur) && array_key_exists('v', $cur) && array_key_exists('id', $cur)) {
                    $dataWhere[]  = "($sortExpr $op ? OR ($sortExpr = ? AND u.usr_id $op ?))";
                    $dataParams[] = $cur['v'];
                    $dataParams[] = $cur['v'];
                    $dataParams[] = (int) $cur['id'];
                }
            }
            $dataWhereClause = $dataWhere ? 'WHERE ' . implode(' AND ', $dataWhere) : '';

            $dataSql  = "
                SELECT u.usr_id, u.usr_status, u.usr_login, u.usr_email,
                       u.usr_firstname, u.usr_lastname, u.usr_role_id,
                       u.usr_admin, u.usr_tags, u.usr_creation_date,
                       u.usr_last_login_date, u.usr_is_online,
                       r.urole_name,
                       $sortExpr AS __sortval
                FROM melis_core_user u
                LEFT JOIN melis_core_user_role r ON r.urole_id = u.usr_role_id
                $dataWhereClause
                ORDER BY $sortExpr $dir, u.usr_id $dir
                LIMIT ?
            ";
            $rows = iterator_to_array($db->query($dataSql, array_merge($dataParams, [$limit])));

            $items = [];
            $lastSortVal = null; $lastId = null;
            foreach ($rows as $row) {
                $r           = (array) $row;
                $lastSortVal = $r['__sortval'] ?? null;
                $lastId      = (int) ($r['usr_id'] ?? 0);
                $items[]     = $this->formatUser($r);
            }

            // nextCursor null = plus rien à charger (dernier lot incomplet).
            $nextCursor = null;
            if (count($rows) === $limit && $lastId !== null) {
                $nextCursor = base64_encode((string) json_encode(['v' => $lastSortVal, 'id' => $lastId]));
            }

            return $this->jsonResponse([
                'success' => true,
                'data'    => ['items' => $items, 'total' => $total, 'nextCursor' => $nextCursor, 'limit' => $limit],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /users/:id ──────────────────────────────────────────────────────

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
                "SELECT u.usr_id, u.usr_status, u.usr_login, u.usr_email,
                        u.usr_firstname, u.usr_lastname, u.usr_lang_id, u.usr_role_id,
                        u.usr_admin, u.usr_tags, u.usr_rights, u.usr_creation_date,
                        u.usr_last_login_date, u.usr_is_online, r.urole_name
                 FROM melis_core_user u
                 LEFT JOIN melis_core_user_role r ON r.urole_id = u.usr_role_id
                 WHERE u.usr_id = ?
                 LIMIT 1",
                [$id]
            ));

            if (empty($rows)) {
                return $this->jsonResponse(['success' => false, 'error' => 'User not found'], 404);
            }

            return $this->jsonResponse(['success' => true, 'data' => $this->formatUser((array) $rows[0], true)]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /users/save ────────────────────────────────────────────────────

    public function saveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }

        try {
            $body      = json_decode($this->getRequest()->getContent(), true) ?? [];
            $id        = isset($body['id']) && $body['id'] ? (int) $body['id'] : null;
            if ($denyCap = $this->denyUnlessCan($id ? 'edit' : 'create')) { return $denyCap; }
            $login     = trim((string) ($body['login']     ?? ''));
            $email     = trim((string) ($body['email']     ?? ''));
            $firstname = trim((string) ($body['firstname'] ?? ''));
            $lastname  = trim((string) ($body['lastname']  ?? ''));
            $roleId    = (int) ($body['roleId']  ?? 1);
            $status    = (int) ($body['status']  ?? 1);
            $isAdmin   = (int) (bool) ($body['isAdmin'] ?? false);
            $langId    = (int) ($body['langId']  ?? 1);
            $tags      = trim((string) ($body['tags']     ?? ''));
            $password  = trim((string) ($body['password'] ?? ''));
            // Normalisation défensive : ne JAMAIS stocker de séquences d'échappement LITTÉRALES
            // ("\n"/"\r\n"/"\t") dans usr_rights. Le builder React envoie déjà de vrais retours-ligne
            // (prouvé), mais un client tiers / un ancien chemin pourrait double-échapper → le XML
            // devient inparsable proprement et getAuthRights() régénère des droits VIDES (arbre de
            // pages CMS vide pour l'admin). On les remet en vrais espaces avant l'écriture DB.
            $rights    = isset($body['rights'])
                ? str_replace(['\\r\\n', '\\n', '\\t'], ["\n", "\n", "\t"], (string) $body['rights'])
                : null;

            if (!$login || !$email || !$firstname || !$lastname) {
                return $this->jsonResponse(
                    ['success' => false, 'error' => 'Champs obligatoires manquants : login, email, prénom, nom'],
                    400
                );
            }
            if (!$id && !$password) {
                return $this->jsonResponse(
                    ['success' => false, 'error' => 'Le mot de passe est obligatoire pour un nouvel utilisateur'],
                    400
                );
            }

            // Validation de complexité du mot de passe — parité avec le legacy
            // (MelisPasswordValidatorWithConfig, appliqué par le formulaire new + à la main sur l'edit).
            // À la création le mot de passe est toujours présent ; en édition il n'est validé que
            // s'il est fourni (sinon l'ancien est conservé). La politique effective vient des défauts
            // (config/otherconfig.php) surchargés par app.login.php → la règle « min 8 caractères »
            // s'applique même sans app.login.php, comme attendu.
            if ($password !== '') {
                $pwdErrors = $this->validatePasswordComplexity($password);
                if ($pwdErrors) {
                    return $this->jsonResponse([
                        'success' => false,
                        'error'   => implode(' • ', $pwdErrors),
                        'fields'  => ['password' => $pwdErrors],
                    ], 422);
                }
            }

            $db   = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $auth = $this->getServiceManager()->get('MelisCoreAuth');

            if ($id) {
                // Update — mot de passe + droits optionnels
                $rightsSql    = $rights !== null ? ', usr_rights=?' : '';
                $rightsParams = $rights !== null ? [$rights] : [];

                if ($password) {
                    $db->query(
                        "UPDATE melis_core_user
                         SET usr_login=?, usr_email=?, usr_firstname=?, usr_lastname=?,
                             usr_role_id=?, usr_status=?, usr_admin=?, usr_lang_id=?, usr_tags=?, usr_password=?
                             $rightsSql
                         WHERE usr_id=?",
                        array_merge(
                            [$login, $email, $firstname, $lastname, $roleId, $status, $isAdmin, $langId, $tags,
                             $auth->encryptPassword($password)],
                            $rightsParams,
                            [$id]
                        )
                    );
                } else {
                    $db->query(
                        "UPDATE melis_core_user
                         SET usr_login=?, usr_email=?, usr_firstname=?, usr_lastname=?,
                             usr_role_id=?, usr_status=?, usr_admin=?, usr_lang_id=?, usr_tags=?
                             $rightsSql
                         WHERE usr_id=?",
                        array_merge(
                            [$login, $email, $firstname, $lastname, $roleId, $status, $isAdmin, $langId, $tags],
                            $rightsParams,
                            [$id]
                        )
                    );
                }

                // Self-edit: if the updated user is the one currently logged in, refresh the
                // SESSION identity (getAuthRights() reads usr_rights from the identity, not the DB).
                // Without this the new rights — menu filtering, canAccess — only take effect after a
                // re-login. Mirrors the legacy MelisAuthController->getStorage()->write($user).
                try {
                    $identity = $auth->getIdentity();
                    if ($identity && (int) ($identity->usr_id ?? 0) === $id) {
                        if ($rights !== null) { $identity->usr_rights = $rights; }
                        $identity->usr_login     = $login;
                        $identity->usr_email     = $email;
                        $identity->usr_firstname = $firstname;
                        $identity->usr_lastname  = $lastname;
                        $identity->usr_role_id   = $roleId;
                        $identity->usr_status    = $status;
                        $identity->usr_admin     = $isAdmin;
                        $identity->usr_lang_id   = $langId;
                        $identity->usr_tags      = $tags;
                        $auth->getStorage()->write($identity);
                    }
                } catch (\Throwable) {}

                // NB : le cache de droits (usr_rights_cache) est régénéré par MelisCoreRightsCacheListener
                // sur l'event `meliscore_tooluser_save_end` ci-dessous (il lit les droits FRAÎCHEMENT
                // écrits en DB, cf. UPDATE plus haut). On ne le régénère donc PAS en plus ici : c'était
                // un DOUBLE rebuild (perf — la génération est l'op. la plus coûteuse de la sauvegarde).

                // Événements legacy de FIN de sauvegarde. Le save React n'en émettait AUCUN : tous les
                // listeners branchés sur la sauvegarde d'un user restaient donc muets depuis /melis-react.
                //  • meliscore_tooluser_save_info_end → MelisCoreClearCacheListenerListener :
                //    deleteCacheByPrefix('*_'.usr_id) — purge le cache de rendu DE CET utilisateur (le
                //    menu en fait partie). Sans lui, il fallait re-sauver depuis l'ancien BO pour voir le
                //    menu à jour. Le listener lit `success` + `datas['usr_id']` (cf. ToolUserController
                //    L1461-1466 pour la forme d'origine).
                //  • meliscore_tooluser_save_end → MelisCoreRightsCacheListener (regenerateUserCache) +
                //    MelisCoreFlashMessengerListener (journalisation melis_core_log, absente jusqu'ici
                //    côté React). Lit `success`/`textTitle`/`textMessage`/`errors`/`typeCode`/`itemId`
                //    (cf. ToolUserController L1557-1565).
                // ⚠️ NE JAMAIS déclencher les `_start` ici : MelisCoreToolUserUpdateUserListener y
                // RECONSTRUIT usr_rights à partir du POST de la fancytree legacy puis dispatche l'écriture.
                // Le body React est du JSON (pas de fancytree) → les droits seraient écrasés/vidés.
                // Seuls les `_end` sont sûrs sur ce chemin.
                try {
                    $this->getEventManager()->trigger('meliscore_tooluser_save_info_end', $this, [
                        'success' => 1,
                        'errors'  => [],
                        'datas'   => ['usr_id' => $id],
                    ]);
                    $this->getEventManager()->trigger('meliscore_tooluser_save_end', $this, [
                        'success'     => 1,
                        'textTitle'   => 'tr_meliscore_tool_user',
                        'textMessage' => 'tr_meliscore_tool_user_update_success_info',
                        'errors'      => [],
                        'datas'       => ['usr_rights' => $rights],
                        'typeCode'    => 'CORE_USER_UPDATE',
                        'itemId'      => $id,
                    ]);
                } catch (\Throwable) {}

                return $this->jsonResponse(['success' => true, 'data' => ['id' => $id, 'self' => isset($identity) && (int) ($identity->usr_id ?? 0) === $id]]);
            }

            // Insert (rights INCLUDED — a new user created with rights in the form must keep them,
            // otherwise it would have zero access).
            $db->query(
                'INSERT INTO melis_core_user
                    (usr_login, usr_email, usr_firstname, usr_lastname, usr_role_id, usr_status, usr_admin, usr_lang_id, usr_tags, usr_password, usr_rights)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [$login, $email, $firstname, $lastname, $roleId, $status, $isAdmin, $langId, $tags,
                 $auth->encryptPassword($password), $rights ?? '']
            );
            $newId = (int) iterator_to_array(
                $db->query('SELECT LAST_INSERT_ID() AS id', [])
            )[0]['id'];

            // Le cache de droits du nouvel utilisateur est généré par MelisCoreRightsCacheListener sur
            // l'event `meliscore_tooluser_savenew_end` ci-dessous (il lit les droits en DB). Pas de
            // régénération directe ici → on évite le double rebuild (perf).

            // Pendant création du `meliscore_tooluser_save_end` ci-dessus (cf. son commentaire) :
            // MelisCoreRightsCacheListener + MelisCoreFlashMessengerListener écoutent `savenew_end`.
            // Là encore, PAS de `_start` (MelisCoreToolUserAddNewUserListener y rejoue la mécanique
            // legacy sur un POST fancytree inexistant côté React).
            try {
                $this->getEventManager()->trigger('meliscore_tooluser_savenew_end', $this, [
                    'success'     => 1,
                    'textTitle'   => 'tr_meliscore_tool_user',
                    'textMessage' => 'tr_meliscore_tool_user_save_success',
                    'errors'      => [],
                    'typeCode'    => 'CORE_USER_ADD',
                    'itemId'      => $newId,
                ]);
            } catch (\Throwable) {}

            return $this->jsonResponse(['success' => true, 'data' => ['id' => $newId]], 201);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── DELETE /users/delete/:id ─────────────────────────────────────────────

    public function deleteAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('delete')) { return $denyCap; }

        $id = (int) $this->params()->fromRoute('id', 0);
        if ($id <= 0) {
            return $this->jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
        }

        // Interdiction de supprimer son propre compte (barrière serveur).
        $identity = $this->getServiceManager()->get('MelisCoreAuth')->getIdentity();
        if ($identity && (int) ($identity->usr_id ?? 0) === $id) {
            return $this->jsonResponse(
                ['success' => false, 'error' => 'You cannot delete your own account.'],
                403
            );
        }

        try {
            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $db->query('DELETE FROM melis_core_user WHERE usr_id = ?', [$id]);
            return $this->jsonResponse(['success' => true, 'data' => null]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /users/stats ─────────────────────────────────────────────────────

    public function statsAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $db  = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $row = (array) iterator_to_array($db->query(
                'SELECT COUNT(*) AS total,
                        SUM(usr_status = 1) AS active,
                        SUM(usr_status = 0) AS inactive,
                        SUM(usr_admin  = 1) AS adminCount
                 FROM melis_core_user',
                []
            ))[0];

            return $this->jsonResponse([
                'success' => true,
                'data'    => [
                    'total'      => (int) ($row['total']      ?? 0),
                    'active'     => (int) ($row['active']     ?? 0),
                    'inactive'   => (int) ($row['inactive']   ?? 0),
                    'adminCount' => (int) ($row['adminCount'] ?? 0),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /users/:id/connections ──────────────────────────────────────────

    public function connectionsAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }

        $id = (int) $this->params()->fromRoute('id', 0);
        if ($id <= 0) {
            return $this->jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
        }

        try {
            $db   = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $rows = $db->query(
                'SELECT usrcd_id, usrcd_last_login_date, usrcd_last_connection_time
                 FROM melis_core_user_connection_date
                 WHERE usrcd_usr_login = ?
                 ORDER BY usrcd_last_login_date DESC
                 LIMIT 100',
                [$id]
            );

            /** @var \MelisCore\Service\MelisCoreUserService $userSvc */
            $userSvc = $this->getServiceManager()->get('MelisCoreUser');

            $items = [];
            foreach ($rows as $row) {
                $r         = (array) $row;
                $loginDate = $r['usrcd_last_login_date']      ?? null;
                $connTime  = $r['usrcd_last_connection_time'] ?? null;

                // Durée de session : réutilise la logique legacy (getUserSessionTime).
                $duration = $loginDate
                    ? $userSvc->getUserSessionTime($id, $loginDate, false)
                    : null;

                $items[] = [
                    'id'             => (int) $r['usrcd_id'],
                    'loginDate'      => $loginDate,
                    'connectionTime' => $connTime,
                    // "Heure d'entrée" / "Heure de sortie" (partie horaire uniquement).
                    'timeIn'         => $loginDate ? date('H:i:s', strtotime($loginDate)) : null,
                    'timeOut'        => $connTime  ? date('H:i:s', strtotime($connTime))  : null,
                    'duration'       => ($duration === null || $duration === '-') ? null : $duration,
                ];
            }

            return $this->jsonResponse(['success' => true, 'data' => $items]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /users/:id/microservice ──────────────────────────────────────────

    /**
     * URL publique d'accès aux microservices pour une clé API.
     * Même formule que le tool legacy (MelisCoreMicroServiceController) :
     * <scheme>://<host>/melis/api/<api_key>
     */
    private function microserviceUrl(string $apiKey): string
    {
        $uri = $this->getRequest()->getUri();

        return $uri->getScheme() . '://' . $uri->getHost() . '/melis/api/' . $apiKey;
    }

    public function microserviceAction(): HttpResponse
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
                'SELECT msoa_id, msoa_status, msoa_api_key
                 FROM melis_core_microservice_auth
                 WHERE msoa_user_id = ?
                 LIMIT 1',
                [$id]
            ));

            if (empty($rows)) {
                return $this->jsonResponse(['success' => true, 'data' => null]);
            }

            $r = (array) $rows[0];
            return $this->jsonResponse([
                'success' => true,
                'data'    => [
                    'id'     => (int)  $r['msoa_id'],
                    'status' => (bool) $r['msoa_status'],
                    'apiKey' => (string) $r['msoa_api_key'],
                    'url'    => $this->microserviceUrl((string) $r['msoa_api_key']),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /users/:id/microservice/save ────────────────────────────────────

    public function microserviceSaveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }

        $id = (int) $this->params()->fromRoute('id', 0);
        if ($id <= 0) {
            return $this->jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
        }

        try {
            $body      = json_decode($this->getRequest()->getContent(), true) ?? [];
            $action    = (string) ($body['action'] ?? 'toggle'); // 'toggle' | 'generate'
            $db        = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            $existing = iterator_to_array($db->query(
                'SELECT msoa_id, msoa_status, msoa_api_key FROM melis_core_microservice_auth WHERE msoa_user_id = ? LIMIT 1',
                [$id]
            ));

            if ($action === 'generate') {
                $newKey = bin2hex(random_bytes(16)); // 32-char hex
                if (!empty($existing)) {
                    $db->query('UPDATE melis_core_microservice_auth SET msoa_api_key=? WHERE msoa_user_id=?', [$newKey, $id]);
                } else {
                    $db->query('INSERT INTO melis_core_microservice_auth (msoa_user_id, msoa_status, msoa_api_key) VALUES (?,1,?)', [$id, $newKey]);
                }
                $status = !empty($existing) ? (bool) $existing[0]['msoa_status'] : true;
                return $this->jsonResponse(['success' => true, 'data' => [
                    'apiKey' => $newKey,
                    'status' => $status,
                    'url'    => $this->microserviceUrl($newKey),
                ]]);
            }

            // toggle
            if (empty($existing)) {
                $newKey = bin2hex(random_bytes(16));
                $db->query('INSERT INTO melis_core_microservice_auth (msoa_user_id, msoa_status, msoa_api_key) VALUES (?,1,?)', [$id, $newKey]);
                return $this->jsonResponse(['success' => true, 'data' => [
                    'apiKey' => $newKey,
                    'status' => true,
                    'url'    => $this->microserviceUrl($newKey),
                ]]);
            }

            $r          = (array) $existing[0];
            $newStatus  = $r['msoa_status'] ? 0 : 1;
            $db->query('UPDATE melis_core_microservice_auth SET msoa_status=? WHERE msoa_user_id=?', [$newStatus, $id]);
            return $this->jsonResponse(['success' => true, 'data' => [
                'apiKey' => (string) $r['msoa_api_key'],
                'status' => (bool) $newStatus,
                'url'    => $this->microserviceUrl((string) $r['msoa_api_key']),
            ]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /roles ───────────────────────────────────────────────────────────

    public function rolesAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $db    = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $rows  = $db->query('SELECT urole_id, urole_name FROM melis_core_user_role ORDER BY urole_id', []);
            $roles = [];
            foreach ($rows as $row) {
                $r       = (array) $row;
                $roles[] = ['id' => (int) $r['urole_id'], 'name' => (string) $r['urole_name']];
            }
            return $this->jsonResponse(['success' => true, 'data' => $roles]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /users/password-policy ──────────────────────────────────────────

    /**
     * Politique de complexité effective (défauts config/otherconfig.php surchargés par
     * app.login.php). Sert le feedback client du formulaire utilisateur : min. de caractères
     * + classes de caractères requises. Gardé sur l'accès à l'outil comme le reste.
     */
    public function passwordPolicyAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $cfg = $this->effectiveLoginConfig();
            return $this->jsonResponse(['success' => true, 'data' => [
                'minLength'     => (int) ($cfg['password_complexity_number_of_characters'] ?: 0),
                'requireLower'  => !empty($cfg['password_complexity_use_lower_case']),
                'requireUpper'  => !empty($cfg['password_complexity_use_upper_case']),
                'requireDigit'  => !empty($cfg['password_complexity_use_digit']),
                'requireSpecial' => !empty($cfg['password_complexity_use_special_characters']),
            ]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Config connexion/mot de passe effective : défauts `meliscore/datas/otherconfig_default/login`
     * (config/otherconfig.php, toujours présents) surchargés par `meliscore/datas/login`
     * (app.login.php mergé au boot quand il existe). Même source que le legacy.
     */
    private function effectiveLoginConfig(): array
    {
        $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $defaults = $melisConfig->getItem('meliscore/datas/otherconfig_default/login') ?: [];
        $saved    = $melisConfig->getItem('meliscore/datas/login') ?: [];
        return array_merge(is_array($defaults) ? $defaults : [], is_array($saved) ? $saved : []);
    }

    /**
     * Applique les 5 règles de complexité du legacy (MelisPasswordValidatorWithConfig) et renvoie
     * la liste des messages d'erreur traduits (vide = OK). Une règle ne s'applique que si sa clé
     * de config est « vraie » (non vide) — identique à l'implémentation legacy.
     */
    private function validatePasswordComplexity(string $password): array
    {
        $cfg        = $this->effectiveLoginConfig();
        $translator = $this->getServiceManager()->get('translator');
        $errors     = [];

        $minChars = (int) ($cfg['password_complexity_number_of_characters'] ?? 0);
        if ($minChars > 0 && strlen($password) < $minChars) {
            $errors[] = str_replace(
                '%min%',
                (string) $minChars,
                $translator->translate('tr_meliscore_other_config_password_too_short')
            );
        }
        if (!empty($cfg['password_complexity_use_lower_case']) && !preg_match('/[a-z]/', $password)) {
            $errors[] = $translator->translate('tr_meliscore_other_config_password_no_lower');
        }
        if (!empty($cfg['password_complexity_use_digit']) && !preg_match('/\d/', $password)) {
            $errors[] = $translator->translate('tr_meliscore_other_config_password_no_digit');
        }
        if (!empty($cfg['password_complexity_use_upper_case']) && !preg_match('/[A-Z]/', $password)) {
            $errors[] = $translator->translate('tr_meliscore_other_config_password_no_upper');
        }
        if (!empty($cfg['password_complexity_use_special_characters']) && !preg_match('/[\p{P}\p{S}]/u', $password)) {
            $errors[] = $translator->translate('tr_meliscore_other_config_password_no_special_character');
        }

        return $errors;
    }

    private function formatUser(array $r, bool $withLang = false): array
    {
        $data = [
            'id'            => (int)    $r['usr_id'],
            'status'        => (int)    $r['usr_status'],
            'login'         => (string) $r['usr_login'],
            'email'         => (string) $r['usr_email'],
            'firstname'     => (string) $r['usr_firstname'],
            'lastname'      => (string) $r['usr_lastname'],
            'roleId'        => (int)    $r['usr_role_id'],
            'roleName'      => (string) ($r['urole_name'] ?? ''),
            'isAdmin'       => (bool)   $r['usr_admin'],
            'tags'          => (string) ($r['usr_tags'] ?? ''),
            'creationDate'  => $r['usr_creation_date']   ?? null,
            'lastLoginDate' => $r['usr_last_login_date'] ?? null,
            'isOnline'      => (bool)   ($r['usr_is_online'] ?? false),
        ];
        if ($withLang) {
            $data['langId'] = (int) ($r['usr_lang_id'] ?? 1);
            $data['rights'] = (string) ($r['usr_rights'] ?? '');
        }
        return $data;
    }

    private function isAuthenticated(): bool
    {
        return $this->getServiceManager()->get('MelisCoreAuth')->hasIdentity();
    }

    /**
     * Rights guard for the Users tool. Every endpoint here requires ACCESS to the tool
     * (`meliscore_tool_user`), not merely an authenticated session — so a user whose rights
     * don't include the tool can't read/write users by hitting the API directly (the left menu
     * already hides it; this closes the API/URL back-doors). Returns the deny response or null.
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
