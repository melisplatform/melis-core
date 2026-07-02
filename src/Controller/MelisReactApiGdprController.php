<?php

namespace MelisCore\Controller;

use MelisReactApi\Controller\CapabilityGuardTrait;

use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use MelisCore\Controller\MelisAbstractActionController;

/**
 * API REST pour l'outil "GDPR / RGPD" de MelisCore — volet « droits des personnes » :
 * rechercher les données d'un utilisateur à travers les modules, les EXTRAIRE (export XML,
 * portabilité) ou les SUPPRIMER (droit à l'effacement).
 *
 * Routes :
 *   POST /melis/react-api/gdpr/search   → body { search: { user_name, user_email } } → résultats par module
 *   POST /melis/react-api/gdpr/extract  → body { selected: { Module: [ids] } } → { xml, filename, empty }
 *   POST /melis/react-api/gdpr/delete   → body { selected: { Module: [ids] } } → { results: { Module: bool } }
 *
 * Le mécanisme est event-driven : MelisCoreGdprService déclenche
 * `melis_core_gdpr_user_{info,extract,delete}_event` auxquels chaque module répond. Ce
 * contrôleur ne fait qu'exposer/sérialiser — zéro logique métier dupliquée.
 *
 * NB : le sous-outil "Auto-Delete" (config cron / emails / SMTP / logs) reste accessible via
 * la vue « Old » (iframe legacy) pour l'instant — non migré ici.
 */
class MelisReactApiGdprController extends MelisAbstractActionController
{
    use CapabilityGuardTrait;

    /** melisKey de l'outil — utilisé par les gardes de droits (accès + capacité). */
    private const MELIS_KEY = 'melis_core_gdpr';

    // ─── POST /gdpr/search ────────────────────────────────────────────────────

    public function searchAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('list')) { return $denyCap; }

        try {
            $body   = json_decode($this->getRequest()->getContent(), true) ?? [];
            $search = is_array($body['search'] ?? null) ? $body['search'] : [];

            // Nettoie + exige au moins un critère.
            $search = array_filter(array_map(
                static fn($v) => is_string($v) ? trim($v) : $v,
                $search
            ), static fn($v) => $v !== '' && $v !== null);

            if (empty($search)) {
                return $this->jsonResponse(['success' => false, 'error' => 'Au moins un critère de recherche est requis (nom ou email).'], 400);
            }

            /** @var \MelisCore\Service\MelisCoreGdprService $svc */
            $svc  = $this->getServiceManager()->get('MelisCoreGdprService');
            $data = $svc->getUserInfo($search);

            $modules = [];
            $results = $data['results'] ?? [];
            if (is_array($results)) {
                foreach ($results as $moduleKey => $mod) {
                    $values  = $mod['values'] ?? [];
                    $columns = [];
                    foreach (($values['columns'] ?? []) as $colKey => $col) {
                        $columns[] = [
                            'key'  => (string) $colKey,
                            'text' => (string) ($col['text'] ?? $colKey),
                        ];
                    }
                    $rows = [];
                    foreach (($values['datas'] ?? []) as $rowId => $cells) {
                        $rows[] = [
                            'id'    => (string) $rowId,
                            'cells' => is_array($cells) ? array_map(static fn($c) => (string) $c, $cells) : [],
                        ];
                    }
                    $modules[] = [
                        'module'  => (string) ($mod['moduleName'] ?? $moduleKey),
                        'key'     => (string) $moduleKey,
                        'icon'    => (string) ($mod['icon'] ?? ''),
                        'columns' => $columns,
                        'rows'    => $rows,
                        'count'   => count($rows),
                    ];
                }
            }

            return $this->jsonResponse(['success' => true, 'data' => ['modules' => $modules]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /gdpr/extract ───────────────────────────────────────────────────

    public function extractAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('export')) { return $denyCap; }

        try {
            $selected = $this->parseSelected();
            if (empty($selected)) {
                return $this->jsonResponse(['success' => false, 'error' => 'Aucun enregistrement sélectionné.'], 400);
            }

            /** @var \MelisCore\Service\MelisCoreGdprService $svc */
            $svc = $this->getServiceManager()->get('MelisCoreGdprService');
            $xml = (string) $svc->extractSelected($selected);

            return $this->jsonResponse(['success' => true, 'data' => [
                'xml'      => $xml,
                'filename' => 'melisplatformgdpr.xml',
                'empty'    => $xml === '',
            ]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ─── POST /gdpr/delete ────────────────────────────────────────────────────

    public function deleteAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('delete')) { return $denyCap; }

        try {
            $selected = $this->parseSelected();
            if (empty($selected)) {
                return $this->jsonResponse(['success' => false, 'error' => 'Aucun enregistrement sélectionné.'], 400);
            }

            /** @var \MelisCore\Service\MelisCoreGdprService $svc */
            $svc  = $this->getServiceManager()->get('MelisCoreGdprService');
            $data = $svc->deleteSelected($selected);

            $results = $data['results'] ?? [];
            $success = true;
            foreach ($results as $ok) {
                if (!$ok) { $success = false; }
            }

            // Réplique le post-traitement legacy : déclenche les événements de log par module/id.
            if (!empty($data['log']) && is_array($data['log'])) {
                foreach ($data['log'] as $ids) {
                    foreach ($ids as $value) {
                        if (!is_array($value) || empty($value['event'])) { continue; }
                        $params = $value;
                        $event  = $params['event'];
                        unset($params['event']);
                        $this->getEventManager()->trigger($event, $this, $params);
                    }
                }
            }

            return $this->jsonResponse(['success' => true, 'data' => [
                'allDeleted' => $success,
                'results'    => array_map(static fn($v) => (bool) $v, (array) $results),
            ]]);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    // ══ SMTP (envoi des emails d'alerte) ═══════════════════════════════════════

    public function smtpGetAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        try {
            $row  = $this->sm()->get('MelisGdprDeleteEmailsSmtp')->fetchAll()->current();
            $data = ['id' => null, 'host' => '', 'username' => '', 'hasPassword' => false];
            if (!empty($row)) {
                $r = (array) $row;
                $data = [
                    'id'          => (int) ($r['mgdpr_smtp_id'] ?? 0),
                    'host'        => (string) ($r['mgdpr_smtp_host'] ?? ''),
                    'username'    => (string) ($r['mgdpr_smtp_username'] ?? ''),
                    'hasPassword' => !empty($r['mgdpr_smtp_password']),
                ];
            }
            return $this->jsonResponse(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    public function smtpSaveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }
        try {
            $b        = json_decode($this->getRequest()->getContent(), true) ?? [];
            $id       = (int) ($b['id'] ?? 0);
            $host     = trim((string) ($b['host'] ?? ''));
            $username = trim((string) ($b['username'] ?? ''));
            $password = (string) ($b['password'] ?? '');
            $confirm  = (string) ($b['confirm'] ?? '');

            if ($host === '' || $username === '') {
                return $this->jsonResponse(['success' => false, 'error' => 'Hôte et nom d’utilisateur sont obligatoires.'], 400);
            }
            if (!$id && $password === '') {
                return $this->jsonResponse(['success' => false, 'error' => 'Le mot de passe est obligatoire.'], 400);
            }
            if ($password !== '' && $password !== $confirm) {
                return $this->jsonResponse(['success' => false, 'error' => 'Les mots de passe ne correspondent pas.'], 400);
            }

            $data = ['mgdpr_smtp_host' => $host, 'mgdpr_smtp_username' => $username];
            if ($password !== '') { $data['mgdpr_smtp_password'] = $password; }

            $tbl = $this->sm()->get('MelisGdprDeleteEmailsSmtp');
            $savedId = $id ? $tbl->save($data, $id) : $tbl->save($data);

            return $this->jsonResponse(['success' => true, 'data' => ['id' => (int) $savedId]]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    public function smtpDeleteAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('delete')) { return $denyCap; }
        try {
            $b  = json_decode($this->getRequest()->getContent(), true) ?? [];
            $id = (int) ($b['id'] ?? 0);
            if ($id) { $this->sm()->get('MelisGdprDeleteEmailsSmtp')->deleteById($id); }
            return $this->jsonResponse(['success' => true, 'data' => []]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    // ══ Banners (texte du bandeau RGPD, par site + langue — module MelisCms) ════

    public function bannerMetaAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        try {
            return $this->jsonResponse(['success' => true, 'data' => [
                'available' => $this->sm()->has('MelisGdprService'),
                'sites'     => $this->listSites(),
                'langs'     => $this->listCmsLangs(),
            ]]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    public function bannerGetAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        try {
            $siteId = (int) $this->params()->fromQuery('siteId', 0);
            $texts  = [];
            if ($siteId && $this->sm()->has('MelisGdprService')) {
                $svc = $this->sm()->get('MelisGdprService');
                foreach ($this->listCmsLangs() as $lang) {
                    $row = $svc->getGdprBannerText($siteId, $lang['id']);
                    $cur = is_object($row) && method_exists($row, 'current') ? $row->current() : null;
                    $r   = $cur ? (array) $cur : [];
                    $texts[(string) $lang['id']] = [
                        'id'    => (int) ($r['mcgdpr_text_id'] ?? 0),
                        'value' => (string) ($r['mcgdpr_text_value'] ?? ''),
                    ];
                }
            }
            return $this->jsonResponse(['success' => true, 'data' => ['texts' => $texts]]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    public function bannerSaveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }
        try {
            if (!$this->sm()->has('MelisGdprService')) {
                return $this->jsonResponse(['success' => false, 'error' => 'Module MelisCms inactif.'], 400);
            }
            $b        = json_decode($this->getRequest()->getContent(), true) ?? [];
            $siteId   = (int) ($b['siteId'] ?? 0);
            $contents = is_array($b['contents'] ?? null) ? $b['contents'] : [];
            if (!$siteId) {
                return $this->jsonResponse(['success' => false, 'error' => 'Aucun site sélectionné.'], 400);
            }
            $svc = $this->sm()->get('MelisGdprService');
            foreach ($contents as $langId => $c) {
                $id    = (int) ($c['id'] ?? 0);
                $value = (string) ($c['value'] ?? '');
                if (trim($value) !== '') {
                    $svc->saveBanner($id ?: null, $value, $siteId, (int) $langId);
                } elseif ($id) {
                    $svc->deleteBannerById($id);
                }
            }
            return $this->jsonResponse(['success' => true, 'data' => []]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    // ══ Auto-Delete / Anonymisation ════════════════════════════════════════════

    public function adMetaAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        try {
            $tool    = $this->sm()->get('MelisCoreGdprAutoDeleteToolService');
            $modules = [];
            foreach ((array) $tool->getAutoDeleteModulesList() as $key => $label) {
                $modules[] = ['key' => (string) $key, 'label' => (string) $label];
            }
            return $this->jsonResponse(['success' => true, 'data' => [
                'modules' => $modules,
                'sites'   => $this->listSites(),
                'langs'   => $this->listCmsLangs(),
            ]]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    public function adConfigsAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        try {
            $tool    = $this->sm()->get('MelisCoreGdprAutoDeleteToolService');
            $configs = [];
            foreach ((array) $tool->getAllGdprAutoDeleteConfigData() as $row) {
                $configs[] = $this->mapConfigRow((array) $row, $tool);
            }
            return $this->jsonResponse(['success' => true, 'data' => ['configs' => $configs]]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    public function adConfigAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        try {
            $id   = (int) $this->params()->fromQuery('id', $this->params()->fromRoute('id', 0));
            $tool = $this->sm()->get('MelisCoreGdprAutoDeleteToolService');
            $cfg  = (array) $tool->getGdprAutoDeleteConfigDataById($id);

            // Emails groupés par type (1=alerte, 2=anonymisation) puis langue.
            $emails = ['warning' => [], 'delete' => []];
            foreach ((array) $tool->getAlertEmailsTranslationsData($id) as $row) {
                $r       = (array) $row;
                $bucket  = ((int) ($r['mgdpre_type'] ?? 0) === 2) ? 'delete' : 'warning';
                $langId  = (string) ($r['mgdpre_lang_id'] ?? 0);
                $emails[$bucket][$langId] = [
                    'id'      => (int) ($r['mgdpre_id'] ?? 0),
                    'subject' => (string) ($r['mgdpre_subject'] ?? ''),
                    'html'    => (string) ($r['mgdpre_html'] ?? ''),
                    'text'    => (string) ($r['mgdpre_text'] ?? ''),
                    'link'    => (int) ($r['mgdpre_link'] ?? 0),
                ];
            }
            return $this->jsonResponse(['success' => true, 'data' => [
                'config' => $this->mapConfigRow($cfg, $tool),
                'emails' => $emails,
            ]]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    public function adSaveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }
        try {
            $b      = json_decode($this->getRequest()->getContent(), true) ?? [];
            $c      = is_array($b['config'] ?? null) ? $b['config'] : [];
            $emails = is_array($b['emails'] ?? null) ? $b['emails'] : [];

            $id          = (int) ($c['id'] ?? 0);
            $siteId      = (int) ($c['siteId'] ?? 0);
            $module      = trim((string) ($c['module'] ?? ''));
            $alertStatus = (int) (bool) ($c['alertStatus'] ?? false);
            $alertDays   = (int) ($c['alertDays'] ?? 0);
            $resend      = (int) (bool) ($c['resend'] ?? false);
            $deleteDays  = (int) ($c['deleteDays'] ?? 0);

            if ($module === '') {
                return $this->jsonResponse(['success' => false, 'error' => 'Un module est obligatoire.'], 400);
            }
            if ($deleteDays <= 0) {
                return $this->jsonResponse(['success' => false, 'error' => 'Le nombre de jours avant anonymisation est obligatoire.'], 400);
            }
            if ($alertStatus && $alertDays > 0 && $alertDays >= $deleteDays) {
                return $this->jsonResponse(['success' => false, 'error' => 'L’anonymisation doit avoir lieu après l’alerte.'], 400);
            }
            if ($alertStatus && $resend && ($deleteDays - $alertDays) < 7) {
                return $this->jsonResponse(['success' => false, 'error' => 'Au moins 7 jours sont requis entre la 1ʳᵉ alerte et l’anonymisation.'], 400);
            }

            $now  = date('Y-m-d H:i:s');
            $data = [
                'mgdprc_site_id'                 => $siteId ?: null,
                'mgdprc_module_name'             => $module,
                'mgdprc_alert_email_status'      => $alertStatus,
                'mgdprc_alert_email_days'        => $alertDays,
                'mgdprc_alert_email_resend'      => $resend,
                'mgdprc_delete_days'             => $deleteDays,
                'mgdprc_email_conf_from_name'    => (string) ($c['fromName'] ?? ''),
                'mgdprc_email_conf_from_email'   => (string) ($c['fromEmail'] ?? ''),
                'mgdprc_email_conf_reply_to'     => (string) ($c['replyTo'] ?? ''),
                'mgdprc_email_conf_layout_title' => (string) ($c['layoutTitle'] ?? ''),
                'mgdprc_email_conf_layout_desc'  => (string) ($c['layoutDesc'] ?? ''),
                'mgdprc_config_update_date'      => $now,
            ];
            $tool = $this->sm()->get('MelisCoreGdprAutoDeleteToolService');
            if (!$id) { $data['mgdprc_config_create_date'] = $now; }
            $configId = (int) $tool->saveGdprAutoDeleteConfig($data, $id ?: null);

            // Emails d'alerte multilingues (type 1=alerte, 2=anonymisation).
            foreach (['warning' => 1, 'delete' => 2] as $bucket => $type) {
                foreach ((array) ($emails[$bucket] ?? []) as $langId => $em) {
                    $emData = [
                        'mgdpre_config_id' => $configId,
                        'mgdpre_lang_id'   => (int) $langId,
                        'mgdpre_type'      => $type,
                        'mgdpre_subject'   => (string) ($em['subject'] ?? ''),
                        'mgdpre_html'      => (string) ($em['html'] ?? ''),
                        'mgdpre_text'      => (string) ($em['text'] ?? ''),
                        'mgdpre_link'      => (int) ($em['link'] ?? 0) ?: null,
                    ];
                    $emId = (int) ($em['id'] ?? 0);
                    $tool->saveGdprDeleteAlertEmails($emData, $emId ?: null);
                }
            }

            return $this->jsonResponse(['success' => true, 'data' => ['id' => $configId]]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    public function adDeleteAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('delete')) { return $denyCap; }
        try {
            $b  = json_decode($this->getRequest()->getContent(), true) ?? [];
            $id = (int) ($b['id'] ?? 0);
            if ($id) { $this->sm()->get('MelisCoreGdprAutoDeleteToolService')->deleteConfig($id); }
            return $this->jsonResponse(['success' => true, 'data' => []]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    public function adRunAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($denyCap = $this->denyUnlessCan('edit')) { return $denyCap; }
        try {
            $res = $this->sm()->get('MelisCoreGdprAutoDeleteService')->run();
            return $this->jsonResponse(['success' => true, 'data' => [
                'status'  => (bool) ($res['status'] ?? false),
                'message' => (string) ($res['message'] ?? ''),
            ]]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    public function adLogsAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        try {
            $logs = [];
            if ($this->sm()->has('MelisGdprDeleteEmailsLogsTable')) {
                foreach ((array) $this->sm()->get('MelisGdprDeleteEmailsLogsTable')->fetchAll()->toArray() as $row) {
                    $r = (array) $row;
                    $logs[] = [
                        'id'        => (int) ($r['mgdprl_id'] ?? 0),
                        'date'      => (string) ($r['mgdprl_log_date'] ?? ''),
                        'module'    => (string) ($r['mgdprl_module_name'] ?? ''),
                        'warning1Ok'=> (int) ($r['mgdprl_warning1_ok'] ?? 0),
                        'warning1Ko'=> (int) ($r['mgdprl_warning1_ko'] ?? 0),
                        'warning2Ok'=> (int) ($r['mgdprl_warning2_ok'] ?? 0),
                        'warning2Ko'=> (int) ($r['mgdprl_warning2_ko'] ?? 0),
                        'deleteOk'  => (int) ($r['mgdprl_delete_ok'] ?? 0),
                        'deleteKo'  => (int) ($r['mgdprl_delete_ko'] ?? 0),
                    ];
                }
            }
            return $this->jsonResponse(['success' => true, 'data' => ['logs' => $logs]]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function sm()
    {
        return $this->getServiceManager();
    }

    /** Normalise une ligne de config auto-delete pour le front. */
    private function mapConfigRow(array $r, $tool): array
    {
        $siteId = (int) ($r['mgdprc_site_id'] ?? 0);
        return [
            'id'          => (int) ($r['mgdprc_id'] ?? 0),
            'siteId'      => $siteId,
            'siteLabel'   => $siteId ? (string) $tool->getSiteNameBySiteId($siteId) : '',
            'module'      => (string) ($r['mgdprc_module_name'] ?? ''),
            'alertStatus' => (bool) ($r['mgdprc_alert_email_status'] ?? false),
            'alertDays'   => (int) ($r['mgdprc_alert_email_days'] ?? 0),
            'resend'      => (bool) ($r['mgdprc_alert_email_resend'] ?? false),
            'deleteDays'  => (int) ($r['mgdprc_delete_days'] ?? 0),
            'fromName'    => (string) ($r['mgdprc_email_conf_from_name'] ?? ''),
            'fromEmail'   => (string) ($r['mgdprc_email_conf_from_email'] ?? ''),
            'replyTo'     => (string) ($r['mgdprc_email_conf_reply_to'] ?? ''),
            'layoutTitle' => (string) ($r['mgdprc_email_conf_layout_title'] ?? ''),
            'layoutDesc'  => (string) ($r['mgdprc_email_conf_layout_desc'] ?? ''),
        ];
    }

    /** Liste des sites { id, label } (si MelisCms/engine actif). */
    private function listSites(): array
    {
        $out = [];
        if ($this->sm()->has('MelisEngineTableSite')) {
            foreach ((array) $this->sm()->get('MelisEngineTableSite')->fetchAll()->toArray() as $s) {
                $s = (array) $s;
                $out[] = [
                    'id'    => (int) ($s['site_id'] ?? 0),
                    'label' => (string) ($s['site_label'] ?? $s['site_name'] ?? ('Site ' . ($s['site_id'] ?? ''))),
                ];
            }
        }
        return $out;
    }

    /** Liste des langues CMS { id, name } (si MelisCms actif). */
    private function listCmsLangs(): array
    {
        $out = [];
        if ($this->sm()->has('MelisEngineTableCmsLang')) {
            foreach ((array) $this->sm()->get('MelisEngineTableCmsLang')->fetchAll()->toArray() as $l) {
                $l = (array) $l;
                $out[] = [
                    'id'   => (int) ($l['lang_cms_id'] ?? 0),
                    'name' => (string) ($l['lang_cms_name'] ?? ('Lang ' . ($l['lang_cms_id'] ?? ''))),
                ];
            }
        }
        return $out;
    }

    /** Extrait la map { Module: [ids] } du body JSON (clé `selected`), nettoyée. */
    private function parseSelected(): array
    {
        $body = json_decode($this->getRequest()->getContent(), true) ?? [];
        $sel  = is_array($body['selected'] ?? null) ? $body['selected'] : [];

        $out = [];
        foreach ($sel as $module => $ids) {
            if (!is_array($ids)) { continue; }
            $ids = array_values(array_filter(array_map('strval', $ids), static fn($v) => $v !== ''));
            if (!empty($ids)) {
                $out[(string) $module] = $ids;
            }
        }
        return $out;
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
