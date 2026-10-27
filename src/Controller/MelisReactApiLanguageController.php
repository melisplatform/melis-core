<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use Laminas\Session\Container;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil Langues du back-office (table melis_core_lang).
 *
 * Calqué sur MelisReactApiPlatformController (gabarit de migration full-React d'un outil natif).
 * Routes :
 *   GET    /melis/react-api/languages              → liste paginée + recherche
 *   GET    /melis/react-api/languages/stats        → statistiques (cartes KPI)
 *   GET    /melis/react-api/languages/:id          → détail
 *   POST   /melis/react-api/languages/save         → créer / mettre à jour
 *   DELETE /melis/react-api/languages/delete/:id   → supprimer
 *
 * Contraintes métier (reprises du legacy LanguageController) :
 *   - lang_locale : non vide, UNIQUE, format xx_XX (ex. en_EN, fr_FR) à la création et quand il
 *     change — un locale existant d'un autre format (créé avant cette règle) reste éditable.
 *   - lang_name : non vide, 45 caractères max (mêmes règles que le formulaire legacy).
 *   - la langue « en_EN » est protégée : ni renommée (locale), ni supprimée.
 *   - la langue de l'utilisateur connecté, et toute langue encore utilisée par un utilisateur
 *     du back-office, ne peuvent pas être supprimées.
 *   - à la CRÉATION, les fichiers de traduction du nouveau locale sont générés
 *     via MelisCoreTranslation->addTranslationFiles() (parité avec addLanguageAction).
 */
class MelisReactApiLanguageController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;
    use MelisReactKeysetListTrait;

    /** melisKey de l'outil — utilisé par le garde de droits (cf. denyUnlessAccess). */
    private const MELIS_KEY = 'meliscore_tool_language';

    /** Locale de la langue par défaut, non supprimable et non renommable. */
    private const PROTECTED_LOCALE = 'en_EN';

    // ─── GET /languages ──────────────────────────────────────────────────────

    public function listAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $limit  = min(9999, max(1, (int) $this->params()->fromQuery('limit', 25)));
            $search = trim((string) ($this->params()->fromQuery('search', '') ?? ''));
            $sort   = (string) $this->params()->fromQuery('sort', 'id');
            $dir     = (string) $this->params()->fromQuery('dir', 'asc');
            $after   = (string) $this->params()->fromQuery('after', '');

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            $filterWhere  = [];
            $filterParams = [];
            if ($search !== '') {
                $like          = '%' . $search . '%';
                $filterWhere[] = '(lang_name LIKE ? OR lang_locale LIKE ? OR lang_id LIKE ?)';
                $filterParams  = array_merge($filterParams, [$like, $like, $like]);
            }

            // Colonnes triables (whitelist) → expressions SQL NON-NULL (keyset fiable).
            $sortMap = [
                'id'     => 'COALESCE(lang_id, 0)',
                'locale' => "COALESCE(lang_locale, '')",
                'name'   => "COALESCE(lang_name, '')",
            ];

            [$rows, $total, $next] = $this->keysetList([
                'db'           => $db,
                'from'         => 'melis_core_lang',
                'selectCols'   => 'lang_id, lang_locale, lang_name',
                'filterWhere'  => $filterWhere,
                'filterParams' => $filterParams,
                'sortMap'      => $sortMap,
                'idCol'        => 'lang_id',
                'idAlias'      => 'lang_id',
                'sortKey'      => $sort,
                'dir'          => $dir,
                'after'        => $after,
                'limit'        => $limit,
            ]);

            $items = [];
            foreach ($rows as $row) {
                $items[] = $this->formatLanguage((array) $row);
            }

            return $this->jsonResponse([
                'success' => true,
                'data'    => ['items' => $items, 'total' => $total, 'nextCursor' => $next],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /languages/stats ─────────────────────────────────────────────────

    public function statsAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $db  = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $row = (array) (iterator_to_array($db->query(
                "SELECT COUNT(*) AS total FROM melis_core_lang",
                []
            ))[0] ?? []);

            return $this->jsonResponse([
                'success' => true,
                'data'    => [
                    'total' => (int) ($row['total'] ?? 0),
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── GET /languages/:id ───────────────────────────────────────────────────

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
                "SELECT lang_id, lang_locale, lang_name
                 FROM melis_core_lang WHERE lang_id = ?",
                [$id]
            ));
            if (!$rows) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            return $this->jsonResponse([
                'success' => true,
                'data'    => $this->formatLanguage((array) $rows[0]),
            ]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /languages/save ─────────────────────────────────────────────────

    public function saveAction(): HttpResponse
    {
        // SECURITY (audit H2) : mutation → POST exigé (les méthodes « sûres » échappent au garde CSRF).
        if (!$this->getRequest()->isPost()) {
            return $this->jsonResponse(['success' => false, 'error' => 'POST required'], 405);
        }

        if ($deny = $this->denyUnlessAccess()) { return $deny; }

        try {
            $body   = json_decode($this->getRequest()->getContent(), true) ?? [];
            $id     = isset($body['id']) && $body['id'] ? (int) $body['id'] : null;
            if ($denyCap = $this->denyUnlessCan($id ? 'edit' : 'create')) { return $denyCap; }
            $name   = trim(strip_tags((string) ($body['name'] ?? '')));
            $locale = trim(strip_tags((string) ($body['locale'] ?? '')));
            $translator = $this->getServiceManager()->get('translator');

            // Validation : nom non vide.
            if ($name === '') {
                return $this->jsonResponse(
                    ['success' => false, 'error' => 'Le nom de la langue est obligatoire.'],
                    400
                );
            }
            if (mb_strlen($name) > 45) {
                return $this->jsonResponse(['success' => false, 'error' => $translator->translate('tr_meliscore_tool_language_lang_name_long')], 400);
            }

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $oldLocale = null;
            if ($id) {
                $existing = iterator_to_array($db->query('SELECT lang_locale FROM melis_core_lang WHERE lang_id = ?', [$id]));
                if (!$existing) {
                    return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
                }
                $oldLocale = (string) $existing[0]['lang_locale'];
            }

            // Validation : locale au format xx_XX (ex. en_EN, fr_FR), s'il est nouveau ou modifié.
            if ($locale !== $oldLocale && !preg_match('/^[a-zA-Z]{2}_[a-zA-Z]{2}$/', $locale)) {
                return $this->jsonResponse(
                    ['success' => false, 'error' => 'Locale invalide : format attendu xx_XX (ex. en_EN, fr_FR).'],
                    400
                );
            }

            // Unicité du locale (en excluant l'enregistrement courant si édition).
            $dupSql    = $id
                ? 'SELECT lang_id FROM melis_core_lang WHERE lang_locale = ? AND lang_id <> ?'
                : 'SELECT lang_id FROM melis_core_lang WHERE lang_locale = ?';
            $dupParams = $id ? [$locale, $id] : [$locale];
            if (iterator_to_array($db->query($dupSql, $dupParams))) {
                return $this->jsonResponse(['success' => false, 'error' => 'Ce locale existe déjà.'], 400);
            }

            if ($id) {
                // La langue par défaut (en_EN) ne peut pas voir son locale modifié.
                if ($oldLocale === self::PROTECTED_LOCALE && $locale !== $oldLocale) {
                    return $this->jsonResponse(
                        ['success' => false, 'error' => 'Impossible de modifier le locale de la langue par défaut (en_EN).'],
                        400
                    );
                }
                // Si le locale change, on s'assure que les fichiers de traduction existent.
                if ($locale !== $oldLocale) {
                    $this->createTranslationFiles($locale);
                }
                $db->query(
                    'UPDATE melis_core_lang SET lang_name = ?, lang_locale = ? WHERE lang_id = ?',
                    [$name, $locale, $id]
                );
                // Logged like the other language actions (the legacy tool has no rename) (Mantis #0011221)
                $this->triggerCoreEvent('meliscore_language_update_end', [
                    'success' => 1, 'textTitle' => 'tr_meliscore_tool_language',
                    'textMessage' => 'tr_meliscore_tool_language_edit_success',
                    'typeCode' => 'CORE_LANGUAGE_UPDATE', 'itemId' => $id,
                ]);
                return $this->jsonResponse(['success' => true, 'data' => ['id' => $id]]);
            }

            // Création : génère les fichiers de traduction (best-effort, parité legacy).
            // La ligne DB reste la source de vérité « cette langue existe dans le BO » ;
            // on n'échoue donc pas l'ajout si la génération de fichiers est impossible
            // (ex. droits d'écriture du conteneur). Les fichiers sont régénérables.
            $this->createTranslationFiles($locale);

            $db->query(
                'INSERT INTO melis_core_lang (lang_locale, lang_name) VALUES (?, ?)',
                [$locale, $name]
            );
            $newId = (int) iterator_to_array($db->query('SELECT LAST_INSERT_ID() AS id', []))[0]['id'];
            // Same event as the legacy tool: CORE_LANGUAGE_ADD log and notification (Mantis #0011221)
            $this->triggerCoreEvent('meliscore_language_new_end', [
                'success' => 1, 'textTitle' => 'tr_meliscore_tool_language',
                'textMessage' => 'tr_meliscore_tool_language_add_success', 'errors' => [],
                'typeCode' => 'CORE_LANGUAGE_ADD', 'itemId' => $newId,
            ]);

            return $this->jsonResponse(['success' => true, 'data' => ['id' => $newId]], 201);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── DELETE /languages/delete/:id ─────────────────────────────────────────

    public function deleteAction(): HttpResponse
    {
        // SECURITY (audit H2) : mutation atteignable en GET = CSRF sans token — POST ou DELETE exigé.
        if (!in_array($this->getRequest()->getMethod(), ['POST', 'DELETE'], true)) {
            return $this->jsonResponse(['success' => false, 'error' => 'POST or DELETE required'], 405);
        }

        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('delete')) { return $denyCap; }

        $id = (int) $this->params()->fromRoute('id', 0);
        if ($id <= 0) {
            return $this->jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
        }

        try {
            $db   = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
            $rows = iterator_to_array($db->query('SELECT lang_locale FROM melis_core_lang WHERE lang_id = ?', [$id]));
            if (!$rows) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            // La langue par défaut (en_EN) ne peut pas être supprimée.
            if ((string) $rows[0]['lang_locale'] === self::PROTECTED_LOCALE) {
                return $this->jsonResponse(['success' => false, 'error' => 'Impossible de supprimer la langue par défaut (en_EN).'], 400);
            }
            $translator = $this->getServiceManager()->get('translator');
            if ($id === $this->currentLangId()) {
                return $this->jsonResponse(['success' => false, 'error' => $translator->translate('tr_meliscore_tool_language_delete_current')], 409);
            }
            $users = $this->getServiceManager()->get('MelisCoreTableUser')->getEntryByField('usr_lang_id', $id)->count();
            if ($users > 0) {
                return $this->jsonResponse(['success' => false, 'error' => sprintf($translator->translate('tr_meliscore_tool_language_delete_in_use'), $users)], 409);
            }
            $db->query('DELETE FROM melis_core_lang WHERE lang_id = ?', [$id]);
            // Same event as the legacy tool: CORE_LANGUAGE_DELETE log and notification (Mantis #0011221)
            $this->triggerCoreEvent('meliscore_language_delete_end', [
                'success' => 1, 'textTitle' => 'tr_meliscore_tool_language',
                'textMessage' => 'tr_meliscore_tool_language_delete_success',
                'typeCode' => 'CORE_LANGUAGE_DELETE', 'itemId' => $id,
            ]);
            return $this->jsonResponse(['success' => true, 'data' => null]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Legacy event, on the « MelisCore » identifier its listeners (logs, bell) attach to */
    private function triggerCoreEvent(string $event, array $params): void
    {
        try {
            (new \Laminas\EventManager\EventManager($this->getEventManager()->getSharedManager(), ['MelisCore']))
                ->trigger($event, $this, $params);
        } catch (\Throwable $e) {
            error_log($event . ': ' . $e->getMessage());
        }
    }

    private function formatLanguage(array $r): array
    {
        $locale = (string) $r['lang_locale'];
        return [
            'id'        => (int)    $r['lang_id'],
            'locale'    => $locale,
            'name'      => (string) $r['lang_name'],
            // true pour la langue par défaut (en_EN) → l'UI verrouille rename/delete.
            'isDefault' => $locale === self::PROTECTED_LOCALE,
            // true pour la langue de l'utilisateur connecté → l'UI masque delete (comme le legacy).
            'isCurrent' => (int) $r['lang_id'] === $this->currentLangId(),
        ];
    }

    /** Langue du back-office de l'utilisateur connecté (session, comme le legacy). */
    private function currentLangId(): int
    {
        $container = new Container('meliscore');
        return (int) ($container['melis-lang-id'] ?? 1);
    }

    /**
     * Génère les fichiers de traduction d'un locale via MelisCoreTranslation.
     * Best-effort et silencieux : on neutralise toute sortie PHP (warnings mkdir,
     * etc.) via un tampon de sortie pour ne JAMAIS polluer la réponse JSON.
     */
    private function createTranslationFiles(string $locale): bool
    {
        ob_start();
        $ok = false;
        try {
            $svc = $this->getServiceManager()->get('MelisCoreTranslation');
            $ok  = (bool) @$svc->addTranslationFiles($locale);
        } catch (\Throwable) {
            $ok = false;
        } finally {
            ob_end_clean();
        }
        return $ok;
    }

    private function isAuthenticated(): bool
    {
        return $this->getServiceManager()->get('MelisCoreAuth')->hasIdentity();
    }

    /**
     * Garde de droits : chaque endpoint exige l'ACCÈS à l'outil (`meliscore_tool_language`),
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
