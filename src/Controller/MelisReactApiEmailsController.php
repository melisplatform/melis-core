<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil "Emails Management" de MelisCore — CRUD des emails
 * transactionnels du back-office (en-tête + contenu HTML/texte par langue).
 *
 * Routes :
 *   GET    /melis/react-api/emails                 → liste (fusion DB + config)
 *   GET    /melis/react-api/emails/:codename       → détail (en-tête + contenus par langue)
 *   POST   /melis/react-api/emails/save            → créer / mettre à jour
 *   DELETE /melis/react-api/emails/delete/:codename → supprimer (uniquement en base)
 *
 * Réutilise MelisCoreBOEmailService (zéro logique métier dupliquée). Le contenu est
 * multilingue : table `melis_core_bo_emails` (en-tête) + `melis_core_bo_emails_details`
 * (1 ligne par langue). Certains emails ne vivent qu'en config (non supprimables) ; les
 * sauvegarder crée leur ligne en base (override).
 */
class MelisReactApiEmailsController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;

    private const MELIS_KEY = 'meliscore_tool_emails_mngt';

    // ─── GET /emails ──────────────────────────────────────────────────────────

    public function listAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $config    = $this->sm()->get('config');
            $cfgEmails = $config['plugins']['meliscore']['emails'] ?? [];

            $map = [];
            foreach ($cfgEmails as $code => $cfg) {
                $map[$code] = [
                    'codename'  => (string) $code,
                    'name'      => (string) ($cfg['email_name'] ?? $code),
                    'fromName'  => (string) ($cfg['headers']['from_name'] ?? ''),
                    'fromEmail' => (string) ($cfg['headers']['from'] ?? ''),
                    'replyTo'   => (string) ($cfg['headers']['replyTo'] ?? ''),
                    'inDb'      => false,
                ];
            }
            foreach ($this->sm()->get('MelisCoreTableBOEmails')->fetchAll()->toArray() as $r) {
                $r    = (array) $r;
                $code = (string) ($r['boe_code_name'] ?? '');
                if ($code === '') { continue; }
                $map[$code] = [
                    'codename'  => $code,
                    'name'      => (string) ($r['boe_name'] ?? $code),
                    'fromName'  => (string) ($r['boe_from_name'] ?? ''),
                    'fromEmail' => (string) ($r['boe_from_email'] ?? ''),
                    'replyTo'   => (string) ($r['boe_reply_to'] ?? ''),
                    'inDb'      => true,
                ];
            }

            $emails = array_values($map);
            usort($emails, static fn($a, $b) => strcasecmp($a['name'], $b['name']));

            return $this->jsonResponse(['success' => true, 'data' => ['emails' => $emails, 'langs' => $this->listCoreLangs()]]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    // ─── GET /emails/:codename ────────────────────────────────────────────────

    public function getAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }

        try {
            $codename = (string) $this->params()->fromRoute('codename', '');
            if ($codename === '') {
                return $this->jsonResponse(['success' => false, 'error' => 'Codename manquant.'], 400);
            }

            $config = $this->sm()->get('config');
            $cfg    = $config['plugins']['meliscore']['emails'][$codename] ?? [];
            $row    = $this->sm()->get('MelisCoreTableBOEmails')->getEntryByField('boe_code_name', $codename)->current();
            $row    = $row ? (array) $row : [];
            $langs  = $this->listCoreLangs();

            // Map langId → ligne détail (boed_id, contenus) si l'email existe en base.
            $detailByLang = [];
            if (!empty($row['boe_id'])) {
                $details = $this->sm()->get('MelisCoreTableBOEmailsDetails')->getEmailDetailsByEmailId((int) $row['boe_id']);
                foreach ($details->toArray() as $d) {
                    $detailByLang[(int) $d['boed_lang_id']] = (array) $d;
                }
            }

            $contents = [];
            foreach ($langs as $l) {
                $d    = $detailByLang[$l['id']] ?? null;
                $cfgC = $cfg['contents'][$l['locale']] ?? [];
                $contents[(string) $l['id']] = [
                    'boedId'  => (int) ($d['boed_id'] ?? 0),
                    'subject' => (string) ($d['boed_subject'] ?? $this->tr($cfgC['subject'] ?? '')),
                    'html'    => (string) ($d['boed_html'] ?? $this->tr($cfgC['html'] ?? '')),
                    'text'    => (string) ($d['boed_text'] ?? $this->tr($cfgC['text'] ?? '')),
                ];
            }

            $email = [
                'codename'      => $codename,
                'name'          => (string) ($row['boe_name'] ?? ($cfg['email_name'] ?? '')),
                'fromName'      => (string) ($row['boe_from_name'] ?? ($cfg['headers']['from_name'] ?? '')),
                'fromEmail'     => (string) ($row['boe_from_email'] ?? ($cfg['headers']['from'] ?? '')),
                'replyTo'       => (string) ($row['boe_reply_to'] ?? ($cfg['headers']['replyTo'] ?? '')),
                'tags'          => (string) ($row['boe_tag_accepted_list'] ?? ($cfg['headers']['tags'] ?? '')),
                'layout'        => (string) ($row['boe_content_layout'] ?? ($cfg['layout'] ?? '')),
                'layoutTitle'   => (string) ($row['boe_content_layout_title'] ?? ($cfg['layout_title'] ?? '')),
                'layoutFtrInfo' => (string) ($row['boe_content_layout_ftr_info'] ?? ($cfg['layout_ftr_info'] ?? '')),
                'inDb'          => !empty($row),
                'contents'      => $contents,
            ];

            return $this->jsonResponse(['success' => true, 'data' => ['email' => $email, 'langs' => $langs]]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    // ─── POST /emails/save ────────────────────────────────────────────────────

    public function saveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }

        try {
            $b        = json_decode($this->getRequest()->getContent(), true) ?? [];
            $isNew    = (bool) ($b['isNew'] ?? false);
            $codename = trim((string) ($b['codename'] ?? ''));

            if ($denyCap = $this->denyUnlessCan($isNew ? 'create' : 'edit')) { return $denyCap; }

            $name      = trim((string) ($b['name'] ?? ''));
            $fromName  = trim((string) ($b['fromName'] ?? ''));
            $fromEmail = trim((string) ($b['fromEmail'] ?? ''));
            $replyTo   = trim((string) ($b['replyTo'] ?? ''));

            if ($codename === '' || !preg_match('/^\w+$/', $codename)) {
                return $this->jsonResponse(['success' => false, 'error' => 'Code email invalide (alphanumérique / underscore).'], 400);
            }
            if ($name === '' || $fromName === '' || $fromEmail === '') {
                return $this->jsonResponse(['success' => false, 'error' => 'Champs obligatoires manquants (nom, expéditeur, email).'], 400);
            }
            if (!filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
                return $this->jsonResponse(['success' => false, 'error' => 'Email expéditeur invalide.'], 400);
            }
            if ($replyTo !== '' && !filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
                return $this->jsonResponse(['success' => false, 'error' => 'Email de réponse invalide.'], 400);
            }

            // Empêche de réutiliser un code existant en création.
            if ($isNew) {
                $exists = $this->sm()->get('MelisCoreTableBOEmails')->getEntryByField('boe_code_name', $codename)->current();
                if (!empty($exists)) {
                    return $this->jsonResponse(['success' => false, 'error' => 'Ce code email existe déjà.'], 400);
                }
            }

            $data = [
                'boe_name'                    => $name,
                'boe_code_name'               => $codename,
                'boe_from_name'               => $fromName,
                'boe_from_email'              => $fromEmail,
                'boe_reply_to'                => $replyTo,
                'boe_tag_accepted_list'       => (string) ($b['tags'] ?? ''),
                'boe_content_layout'          => (string) ($b['layout'] ?? ''),
                'boe_content_layout_title'    => (string) ($b['layoutTitle'] ?? ''),
                'boe_content_layout_ftr_info' => (string) ($b['layoutFtrInfo'] ?? ''),
            ];

            // Contenus par langue, au format attendu par le service (clé = locale, valeur = query-string).
            $byId     = [];
            foreach ($this->listCoreLangs() as $l) { $byId[$l['id']] = $l['locale']; }
            $contents = is_array($b['contents'] ?? null) ? $b['contents'] : [];
            foreach ($contents as $langId => $c) {
                $locale = $byId[(int) $langId] ?? null;
                if (!$locale) { continue; }
                $data[$locale] = implode('&', [
                    'boed_id=' . (int) ($c['boedId'] ?? 0),
                    'boed_subject=' . rawurlencode((string) ($c['subject'] ?? '')),
                    'boed_html=' . rawurlencode((string) ($c['html'] ?? '')),
                    'boed_text=' . rawurlencode((string) ($c['text'] ?? '')),
                    'boed_lang_id=' . (int) $langId,
                ]);
            }

            $this->sm()->get('MelisCoreBOEmailService')->saveBoEmailByCode($isNew ? 'NEW' : $codename, $data);

            return $this->jsonResponse(['success' => true, 'data' => ['codename' => $codename]]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    // ─── DELETE /emails/delete/:codename ──────────────────────────────────────

    public function deleteAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('delete')) { return $denyCap; }

        try {
            $codename = (string) $this->params()->fromRoute('codename', '');
            if ($codename === '') {
                return $this->jsonResponse(['success' => false, 'error' => 'Codename manquant.'], 400);
            }
            $this->sm()->get('MelisCoreBOEmailService')->deleteEmail(['codename' => $codename]);
            return $this->jsonResponse(['success' => true, 'data' => []]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function sm()
    {
        return $this->getServiceManager();
    }

    /** Traduit une valeur de config si c'est une clé (tr_…), sinon la renvoie telle quelle. */
    private function tr($value): string
    {
        $value = (string) $value;
        if ($value === '') { return ''; }
        try { return (string) $this->sm()->get('translator')->translate($value); }
        catch (\Throwable) { return $value; }
    }

    /** Langues du back-office { id, name, locale }. */
    private function listCoreLangs(): array
    {
        $out = [];
        foreach ($this->sm()->get('MelisCoreTableLang')->fetchAll()->toArray() as $l) {
            $l = (array) $l;
            $out[] = [
                'id'     => (int) ($l['lang_id'] ?? 0),
                'name'   => (string) ($l['lang_name'] ?? ''),
                'locale' => (string) ($l['lang_locale'] ?? ''),
            ];
        }
        return $out;
    }

    private function isAuthenticated(): bool
    {
        return $this->sm()->get('MelisCoreAuth')->hasIdentity();
    }

    private function denyUnlessAccess(): ?HttpResponse
    {
        if (!$this->isAuthenticated()) {
            return $this->jsonResponse(['success' => false, 'error' => 'Unauthenticated'], 401);
        }
        try {
            if (!$this->sm()->get('MelisCoreRights')->canAccess(self::MELIS_KEY)) {
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
