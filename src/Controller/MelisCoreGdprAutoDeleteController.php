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
        if (in_array('MelisCms', $this->getServiceLocator()->get('ModulesService')->getAllModules())) {
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
                $formattedData[$ctr]['mgdprc_alert_email_status'] = $data[$ctr]['mgdprc_alert_email_status'] ? $data[$ctr]['mgdprc_alert_email_days'] . " day(s)" : "Deactivated";
                $formattedData[$ctr]['mgdprc_alert_email_resend'] = $data[$ctr]['mgdprc_alert_email_resend'] ? "Activated" : "Deactivated";
                $formattedData[$ctr]['mgdprc_delete_days'] = $data[$ctr]['mgdprc_delete_days'];
            }
        } else {
            $formattedData = $data;
        }

        return $formattedData;
    }

    /**
     * @return MelisGdprDeleteConfigTable
     */
    private function getGdprDeleteConfigTable()
    {
        /** @var MelisGdprDeleteConfigTable $gdprDeleteConfigTable */
        $gdprDeleteConfigTable = $this->getServiceLocator()->get('MelisGdprDeleteConfigTable');

        return $gdprDeleteConfigTable;
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
        // get filters form
        $view->setVariable('formFilter', $this->getGdprAutoDeleteService()->getAddEditFiltersForm()->setData(
            $this->getGdprAutoDeleteService()->getGdprAutoDeleteConfigDataById($this->getConfigId())
        ));

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
                $configId = $this->getGdprAutoDeleteService()->saveGdprAutoDeleteConfig($postValues);
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
            // get config id
            foreach ($validatedData as $idx => $val) {
                $val['data']['mgdpre_config_id'] = $configId;
                // save alert emails trans
                $this->getGdprAutoDeleteService()->saveGdprDeleteWarningEmails($val['data'], null);
            }
        }
    }
    /**
     * get config id from the url
     * @return mixed
     */
    private function getConfigId()
    {
        return $this->params()->fromRoute('configId', $this->params()->fromQuery('configId'), null);
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