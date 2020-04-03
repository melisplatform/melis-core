<?php

namespace MelisCore\Controller;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCore\Form\MelisForm;
use MelisCore\Model\Tables\MelisGdprDeleteConfigTable;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsTable;
use MelisCore\Service\MelisCoreConfigService;
use MelisCore\Service\MelisCoreGdprAutoDeleteService;
use MelisCore\Service\MelisCoreGdprAutoDeleteToolService;
use MelisCore\Service\MelisCoreToolService;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;

class MelisCoreGdprAutoDeleteController extends AbstractActionController
{
    /**
     * form errors
     * @var array
     */
    private $formErrors = [];

    /**
     * @return ViewModel
     */
    public function renderContentModalAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());
        $view->setVariable('scheme', $this->getRequest()->getUri()->getScheme());
        $view->setVariable('host', $this->getRequest()->getUri()->getHost());

        return $view;
    }

    /**
     * this method will get the melisKey from route params
     */
    private function getMelisKey()
    {
        return $this->params()->fromRoute('melisKey', $this->params()->fromQuery('melisKey'), null);
    }

    /**
     * @return ViewModel
     */
    public function renderContentContainerAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());

        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderContentAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());

        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderContentAccordionsAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());

        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderContentAccordionListConfigAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());

        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderContentAccordionListConfigHeaderAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());

        return $view;
    }

    /**
     *
     * limit view of the table
     *
     * @return ViewModel
     */
    public function renderContentAccordionListConfigContentLimitAction()
    {
        return new ViewModel();
    }

    /**
     *
     * limit view of the table
     *
     * @return ViewModel
     */
    public function renderContentAccordionListConfigContentSiteFilterAction()
    {
        $view = new ViewModel();
        if (in_array('MelisCms', $this->getServiceLocator()->get('ModulesService')->getActiveModules())) {
            $view->setVariable('sites', $this->getServiceLocator()
                ->get('MelisEngineTableSite')->fetchAll()->toArray());
        }

        return $view;
    }

    /**
     *
     * limit view of the table
     *
     * @return ViewModel
     */
    public function renderContentAccordionListConfigContentModuleFilterAction()
    {
        $view = new ViewModel();
        $view->setVariable('modules', $this->getGdprAutoDeleteService()->getAutoDeleteModulesList());

        return $view;
    }

    /**
     * @return MelisCoreGdprAutoDeleteToolService
     */
    private function getGdprAutoDeleteService()
    {
        /** @var MelisCoreGdprAutoDeleteToolService $gdprAutoDeleteSvc */
        $gdprAutoDeleteSvc = $this->getServiceLocator()->get('MelisCoreGdprAutoDeleteToolService');

        return $gdprAutoDeleteSvc;
    }

    /**
     *
     * limit view of the table
     *
     * @return ViewModel
     */
    public function renderContentAccordionListConfigContentEditAction()
    {
        return new ViewModel();
    }

    /**
     *
     * limit view of the table
     *
     * @return ViewModel
     */
    public function renderContentAccordionListConfigContentDeleteAction()
    {
        return new ViewModel();
    }

    /**
     * @return ViewModel
     */
    public function renderContentAccordionListConfigContentAction()
    {
        // view model
        $view = new ViewModel();
        $this->getTool()->setMelisToolKey('MelisCoreGdprAutoDelete', 'melis_core_gdpr_auto_delete');
        // table columns
        $columns = $this->getTool()->getColumns();
        // set table heading Action label
        $columns['actions'] = [
            'text' => $this->getTool()->getTranslation('tr_meliscore_global_action'), 'width' => '10%'
        ];
        $view->setVariable('tableColumns', $columns);
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());
        // data table configuration
        $view->setVariable('toolDataTableConfig',
            $this->getTool()->getDataTableConfiguration(
                "#tableGdprAutoDeleteConfig",
                true,
                false,
                ['order' => '[[0, "desc"]]']
            )
        );

        return $view;
    }

    /**
     * this method will get the meliscore tool
     * @return MelisCoreToolService
     */
    private function getTool()
    {
        /** @var MelisCoreToolService $toolSvc */
        $toolSvc = $this->getServiceLocator()->get('MelisCoreTool');

        return $toolSvc;
    }

    /**
     *  get gdpr delete config data
     *
     * @return JsonModel
     */
    public function getGdprDeleteConfigDataAction()
    {
        // request
        $request = $this->getRequest();
        $tableData = [];
        $post = [];
        if ($request->isPost()) {
            // set melis tool key
            $this->getTool()->setMelisToolKey('MelisCoreGdprAutoDelete', 'melis_core_gdpr_auto_delete');
            // post data
            $post = $this->processPostData(get_object_vars($request->getPost()));
            // get data and format
            $tableData = $this->formatDataIntoDataTableFormat(
            // get gdpr delete config data from service
                $this->getGdprAutoDeleteService()->getGdprDeleteConfigData(
                // search key
                    $post['searchKey'],
                    // searchable columns
                    $this->getTool()->getSearchableColumns(),
                    // order by (field)
                    $post['orderBy'],
                    // order direction
                    $post['orderDir'],
                    // start
                    $post['start'],
                    // length
                    $post['limit'],
                    // site id
                    $post['siteId'],
                    // module
                    $post['module']
                )
            );
        }

        return new JsonModel([
            'draw' => (int)$post['draw'],
            'data' => $tableData,
            'recordsFiltered' => $this->getGdprDeleteConfigTable()->getTotalFiltered(),
            'recordsTotal' => $this->getGdprDeleteConfigTable()->getTotalData()
        ]);
    }

    /**
     *
     * group post data and process
     *
     * @param $postData
     * @return array
     */
    private function processPostData($postData)
    {
        return [
            'draw' => (int)$postData['draw'],
            'orderBy' => array_keys($this->getTool()->getColumns())[(int)$postData['order'][0]['column']],
            'orderDir' => isset($postData['order']['0']['dir']) ? strtoupper($postData['order']['0']['dir']) : 'DESC',
            'searchKey' => isset($postData['search']['value']) ? $postData['search']['value'] : null,
            'start' => (int)$postData['start'],
            'limit' => (int)$postData['length'],
            'siteId' => isset($postData['gpdr_auto_delete_site_id']) ? $postData['gpdr_auto_delete_site_id'] : null,
            'module' => isset($postData['gdpr_auto_delete_module']) ? $postData['gdpr_auto_delete_module'] : null,
        ];
    }

    /**
     *
     * format data from db into js datatable format
     *
     * @param $data
     * @return array
     */
    private function formatDataIntoDataTableFormat($data)
    {
        $formattedData = [];
        if (!empty($data)) {
            for ($ctr = 0; $ctr < count($data); $ctr++) {
                // apply text limits
                foreach ($data[$ctr] as $vKey => $vValue) {
                    // apply limit text
                    $formattedData[$ctr][$vKey] = $this->getTool()->limitedText($vValue, 80);
                }
                // set data for match fields
                $formattedData[$ctr]['DT_RowId'] = $data[$ctr]['mgdprc_id'];
                $formattedData[$ctr]['mgdprc_site_id'] = $this->getGdprAutoDeleteService()->getSiteNameBySiteId($data[$ctr]['mgdprc_site_id']);
                $formattedData[$ctr]['mgdprc_module_name'] = $data[$ctr]['mgdprc_module_name'];
                $formattedData[$ctr]['mgdprc_alert_email_status'] = $data[$ctr]['mgdprc_alert_email_status'] ? $data[$ctr]['mgdprc_alert_email_days'] . " day(s)" . $this->getLocaleEmailTrans($data[$ctr]['mgdprc_id'], MelisGdprDeleteEmailsTable::EMAIL_WARNING) : "Deactivated";
                $formattedData[$ctr]['mgdprc_alert_email_resend'] = $data[$ctr]['mgdprc_alert_email_resend'] ? "Activated" . $this->getLocaleEmailTrans($data[$ctr]['mgdprc_id'], MelisGdprDeleteEmailsTable::EMAIL_WARNING): "Deactivated";
                $formattedData[$ctr]['mgdprc_delete_days'] = $this->getLocaleEmailTrans($data[$ctr]['mgdprc_id'], MelisGdprDeleteEmailsTable::EMAIL_DELETED);
            }
        } else {
            $formattedData = $data;
        }

        return $formattedData;
    }

    /**
     * @param $configId
     * @param $type
     * @return string
     */
    private function getLocaleEmailTrans($configId, $type)
    {
        $data = $this->getGdprAutoDeleteService()->getAlertEmailsTransDataByConfigId($configId);
        $locale = "";
        $ctr = 0;
        if (!empty($data)) {
            foreach ($data as $idx => $val) {
                if ($type == $val['mgdpre_type']) {
                    if (!empty($val['mgdpre_html']) || !empty($val['mgdpre_text'])) {
                        if ($type == MelisGdprDeleteEmailsTable::EMAIL_DELETED) {
                            if ($ctr > 0) {
                                $locale .= " / " .$this->getLocaleNameByLangId($val['mgdpre_lang_id']);
                            } else {
                                $locale .= $this->getLocaleNameByLangId($val['mgdpre_lang_id']);
                            }
                        } else {
                            $locale .= " / " . $this->getLocaleNameByLangId($val['mgdpre_lang_id']);
                        }
                    }
                    $ctr++;
                }

            }
        }

        return $locale;
    }

    /**
     * @param $langId
     * @return null
     */
    private function getLocaleNameByLangId($langId)
    {
        $locale = null;
        if ($this->getServiceLocator()->has('MelisEngineLang')){
            $locale =  explode('_', $this->getServiceLocator()->get('MelisEngineLang')->getLocaleByLangId($langId))[1];
        }

        return $locale;
    }

    /**
     * @return MelisGdprDeleteConfigTable | array | object
     */
    private function getGdprDeleteConfigTable()
    {
        return $this->getServiceLocator()->get('MelisGdprDeleteConfigTable');
    }

    /**
     * @return ViewModel
     */
    public function renderContentAccordionAddEditConfigAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());

        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderContentAccordionAddEditConfigHeaderAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());
        //config id
        $view->setVariable('configId', $this->getConfigId());

        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderContentAccordionAddEditConfigContentAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());

        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderContentAccordionAddEditConfigFiltersAction()
    {
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());
        // get auto delete config data
        $data = $this->getGdprAutoDeleteService()->getGdprAutoDeleteConfigDataById($this->getConfigId());
        // override data if there is siteid or module on request
        if (! empty($this->getSiteId()) || !empty($this->getModule())) {
            $data = [
                'mgdprc_site_id' => $this->getSiteId(),
                'mgdprc_module_name' => $this->getModule()
            ];
        }

        // get filters form
        $view->setVariable('formFilter', $this->getGdprAutoDeleteService()->getAddEditFiltersForm()->setData($data));

        return $view;
    }


    /**
     * @return JsonModel
     */
    public function saveAutoDeleteConfigurationAction()
    {
        $request = $this->getRequest();
        $success = false;
        $errors = [];
        $configId = null;
        // save only when request is post
        if ($request->isPost()) {
            // sanitized url data
            $postValues = get_object_vars($request->getPost());
            // parse serialized data from url
            $postValues = $this->parseSerializedData($postValues);
            // convert json string to array
            $alertEmailsWarningTransData = $this->jsonToArray($postValues['alert_emails_warning_trans']);
            // convert json string to array
            $alertEmailsDeleteTransData = $this->jsonToArray($postValues['alert_emails_delete_trans']);

            // validate all forms inputs from requests
            $this->setFormErrors($this->getGdprAutoDeleteService()->validateForm($postValues));
            // remove auto_delete_config key
            unset($postValues['alert_emails_warning_trans']);
            // remove auto_delete_config key
            unset($postValues['alert_emails_delete_trans']);
            // save data if no errors of forms
            if (empty($this->getFormErrors())) {
                // save gdpr auto delete configs
                if (! empty($postValues['mgdprc_id'])) {
                    // update
                    $configId = $postValues['mgdprc_id'];
                    $this->getGdprAutoDeleteService()->saveGdprAutoDeleteConfig($postValues, $configId);
                } else {
                    // new entry
                    $configId = $this->getGdprAutoDeleteService()->saveGdprAutoDeleteConfig($postValues);
                }
                // save gdpr alert emails translations
                $this->saveAlertEmailsTrans($alertEmailsWarningTransData, $configId);
                // save gdpr alert deleted emails
                $this->saveAlertEmailsTrans($alertEmailsDeleteTransData, $configId);
                $success = true;
            } else {
                // set errors for the return of ajax
                $errors = $this->getFormErrors();
            }
        }
        return new JsonModel([
            'success' => $success,
            'errors' => $errors,
            'id' => $configId
        ]);
    }

    /**
     * parse url serialized data
     *
     * @param $postData
     * @return mixed
     */
    private function parseSerializedData($postData)
    {
        $dataToParse = [
            'auto_delete_config',
            'auto_delete_filters'
        ];
        // loop to make an array
        foreach ($postData as $idx => $val) {
            if (in_array($idx, $dataToParse)) {
                // parse passed url params
                parse_str($postData[$idx], $data);
                // override current post data
                $postData = array_merge($postData, $data);
                // remove partial keys used
                unset($postData[$idx]);
            }
        }

        return $postData;
    }

    /**
     * convert json stringify from js to php array
     *
     * @param $jsonData
     * @return mixed
     */
    private function jsonToArray($jsonData)
    {
        // decond json data
        $data = json_decode($jsonData, true);

        // parse serialized data from url
        foreach ($data as $idx => $val) {
            // overwrite old data
            parse_str($val['data'], $parseData);
            $data[$idx]['data'] = $parseData;
        }


        return $data;
    }

    /**
     * @return array
     */
    public function getFormErrors()
    {
        return $this->formErrors;
    }

    /**
     * @param $errors
     */
    public function setFormErrors($errors)
    {
        $this->formErrors = $errors;
    }

    /**
     * @param $validatedData
     * @param $configId
     */
    private function saveAlertEmailsTrans($validatedData, $configId)
    {
        if (!empty($validatedData)) {
            $alertEmailsTransData = $this->getGdprAutoDeleteService()->getAlertEmailsTransData($configId);
            if (! empty($alertEmailsTransData)) {
                // for update
                foreach ($alertEmailsTransData as $i => $v1) {
                    foreach ($validatedData as $ii => $v2) {
                        if ($v1['mgdpre_type'] == $v2['data']['mgdpre_type'] && $v1['mgdpre_lang_id'] == $v2['data']['mgdpre_lang_id']) {
                            // add config id
                            $v2['data']['mgdpre_config_id'] = $configId;
                            // update alert emails trans
                            $this->getGdprAutoDeleteService()->saveGdprDeleteAlertEmails($v2['data'], $v1['mgdpre_id']);
                        }
                    }
                }
            } else {
                // new entry
                foreach ($validatedData as $idx => $val) {
                    $val['data']['mgdpre_config_id'] = $configId;
                    // save alert emails trans
                    $this->getGdprAutoDeleteService()->saveGdprDeleteAlertEmails($val['data'], null);
                }
            }
        }
    }
    /**
     * get config id from the url
     * @return mixed
     */
    private function getConfigId()
    {
        $configId = $this->params()->fromRoute('configId', $this->params()->fromQuery('configId'), null);
        if (!empty($this->getSiteId()) && !empty($this->getModule())) {
            // check for data
            $data = $this->getGdprAutoDeleteService()->getGdprAutoDeleteConfigBySiteModule($this->getSiteId(), $this->getModule())->current();
            // override config id
            if (!empty($data)) {
                $configId = $data->mgdprc_id;
            }
        }


        return $configId;
    }

    /**
     * get config id from the url
     * @return mixed
     */
    private function getSiteId()
    {
        return $this->params()->fromRoute('siteId', $this->params()->fromQuery('siteId'), null);
    }

    /**
     * get config id from the url
     * @return mixed
     */
    private function getModule()
    {
        return $this->params()->fromRoute('moduleName', $this->params()->fromQuery('moduleName'), null);
    }

    /**
     * @return JsonModel
     */
    public function runGdprAutoDeleteCronAction()
    {
        return new JsonModel([
            'success' => $this->getServiceLocator()->get('MelisCoreGdprAutoDeleteService')->runCron()
        ]);
    }
}