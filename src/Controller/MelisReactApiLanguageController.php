<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
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
 *   - lang_locale : format xx_XX (ex. en_EN, fr_FR), non vide, UNIQUE.
 *   - lang_name : non vide.
 *   - la langue « en_EN » est protégée : ni renommée (locale), ni supprimée.
 *   - à la CRÉATION, les fichiers de traduction du nouveau locale sont générés
 *     via MelisCoreTranslation->addTranslationFiles() (parité avec addLanguageAction).
 */
class MelisReactApiLanguageController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;

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
            $page   = max(1, (int) $this->params()->fromQuery('page', 1));
            $limit  = min(9999, max(1, (int) $this->params()->fromQuery('limit', 25)));
            $search = trim((string) ($this->params()->fromQuery('search', '') ?? ''));
            $offset = ($page - 1) * $limit;

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            $where = [];
            $params = [];
            if ($search !== '') {
                $like    = '%' . $search . '%';
                $where[] = '(lang_name LIKE ? OR lang_locale LIKE ? OR lang_id LIKE ?)';
                $params  = array_merge($params, [$like, $like, $like]);
            }
            $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

            $countRow = iterator_to_array(
                $db->query("SELECT COUNT(*) AS total FROM melis_core_lang $whereClause", $params)
            );
            $total = (int) ($countRow[0]['total'] ?? 0);

            $rows = $db->query(
                "SELECT lang_id, lang_locale, lang_name
                 FROM melis_core_lang $whereClause
                 ORDER BY lang_id ASC
                 LIMIT ? OFFSET ?",
                array_merge($params, [$limit, $offset])
            );

            $items = [];
            foreach ($rows as $row) {
                $items[] = $this->formatLanguage((array) $row);
            }

            return $this->jsonResponse([
                'success' => true,
                'data'    => ['items' => $items, 'total' => $total, 'page' => $page, 'limit' => $limit],
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
        if ($deny = $this->denyUnlessAccess()) { return $deny; }

        try {
            $body   = json_decode($this->getRequest()->getContent(), true) ?? [];
            $id     = isset($body['id']) && $body['id'] ? (int) $body['id'] : null;
            if ($denyCap = $this->denyUnlessCan($id ? 'edit' : 'create')) { return $denyCap; }
            $name   = trim((string) ($body['name'] ?? ''));
            $locale = trim((string) ($body['locale'] ?? ''));

            // Validation : nom non vide.
            if ($name === '') {
                return $this->jsonResponse(
                    ['success' => false, 'error' => 'Le nom de la langue est obligatoire.'],
                    400
                );
            }
            // Validation : locale au format xx_XX (ex. en_EN, fr_FR).
            if (!preg_match('/^[a-zA-Z]{2}_[a-zA-Z]{2}$/', $locale)) {
                return $this->jsonResponse(
                    ['success' => false, 'error' => 'Locale invalide : format attendu xx_XX (ex. en_EN, fr_FR).'],
                    400
                );
            }

            $db = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');

            // Unicité du locale (en excluant l'enregistrement courant si édition).
            $dupSql    = $id
                ? 'SELECT lang_id FROM melis_core_lang WHERE lang_locale = ? AND lang_id <> ?'
                : 'SELECT lang_id FROM melis_core_lang WHERE lang_locale = ?';
            $dupParams = $id ? [$locale, $id] : [$locale];
            if (iterator_to_array($db->query($dupSql, $dupParams))) {
                return $this->jsonResponse(['success' => false, 'error' => 'Ce locale existe déjà.'], 400);
            }

            if ($id) {
                $existing = iterator_to_array($db->query('SELECT lang_locale FROM melis_core_lang WHERE lang_id = ?', [$id]));
                if (!$existing) {
                    return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
                }
                $oldLocale = (string) $existing[0]['lang_locale'];
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

            return $this->jsonResponse(['success' => true, 'data' => ['id' => $newId]], 201);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── DELETE /languages/delete/:id ─────────────────────────────────────────

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
            $rows = iterator_to_array($db->query('SELECT lang_locale FROM melis_core_lang WHERE lang_id = ?', [$id]));
            if (!$rows) {
                return $this->jsonResponse(['success' => false, 'error' => 'Not found'], 404);
            }
            // La langue par défaut (en_EN) ne peut pas être supprimée.
            if ((string) $rows[0]['lang_locale'] === self::PROTECTED_LOCALE) {
                return $this->jsonResponse(['success' => false, 'error' => 'Impossible de supprimer la langue par défaut (en_EN).'], 400);
            }
            $db->query('DELETE FROM melis_core_lang WHERE lang_id = ?', [$id]);
            return $this->jsonResponse(['success' => true, 'data' => null]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function formatLanguage(array $r): array
    {
        $locale = (string) $r['lang_locale'];
        return [
            'id'        => (int)    $r['lang_id'],
            'locale'    => $locale,
            'name'      => (string) $r['lang_name'],
            // true pour la langue par défaut (en_EN) → l'UI verrouille rename/delete.
            'isDefault' => $locale === self::PROTECTED_LOCALE,
        ];
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
