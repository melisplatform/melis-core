<?php

namespace MelisCore\Controller;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCore\Model\Tables\MelisGdprDeleteConfigTable;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsLogsTable;
use MelisCore\Service\MelisCoreGdprAutoDeleteToolService;
use MelisCore\Service\MelisCoreToolService;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;

class MelisCoreGdprAutoDeleteTabsController extends AbstractActionController
{
    /**
     * @var
     */
    private $configId;

    public function setConfigId($configId)
    {
        $this->configId = $configId;
    }

    /**
     * @return ViewModel
     */
    public function renderContentAddEditTabsHandlerAction()
    {
        $siteId = $this->params()->fromRoute('siteId', $this->params()->fromQuery('siteId'), null);
        $moduleName = $this->params()->fromRoute('moduleName', $this->params()->fromQuery('moduleName'), null);
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());
        // get melis core languages for nav
        $view->setVariable('melisCmsLang', $this->getGdprAutoDeleteToolService()->getCmsLang());
        // set config id
        $this->setConfigId($this->params()->fromRoute('configId', $this->params()->fromQuery('configId'), null));

        // set config id for other methods
        if (!empty($siteId) && !empty($moduleName)) {
            $configData = $this->getGdprAutoDeleteToolService()->getGdprAutoDeleteConfigBySiteModule($siteId,$moduleName)->current();
            if (! empty($configData)) {
                $this->setConfigId($configData->mgdprc_id);
            }
        }

        // get config id
        $view->setVariable('configId', $this->getConfigId());

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
     * @return MelisCoreGdprAutoDeleteToolService
     */
    private function getGdprAutoDeleteToolService()
    {
        /** @var MelisCoreGdprAutoDeleteToolService $gdprAutoDeleteSvc */
        $gdprAutoDeleteSvc = $this->getServiceLocator()->get('MelisCoreGdprAutoDeleteToolService');

        return $gdprAutoDeleteSvc;
    }

    /**
     * get config id from the url
     * @return mixed
     */
    private function getConfigId()
    {
        return $this->configId;
    }

    /**
     * @return ViewModel
     */
    public function renderConfigTabAction()
    {
        // view model
        $view = new ViewModel();
        // set melis tool key
        $this->getTool()->setMelisToolKey('MelisCoreGdprAutoDelete', 'melis_core_gdpr_auto_delete');
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());
        // get email setup data
        $emailSetupData = $this->getGdprAutoDeleteToolService()->getGdprAutoDeleteConfigDataById($this->getConfigId());
        if (!empty($this->getModuleName()) || isset($emailSetupData['mgdprc_module_name'])) {
            // get tags
            $tags = $this->getServiceLocator()->get('MelisCoreGdprAutoDeleteService')->getModuleTags();
            $moduleName = $emailSetupData['mgdprc_module_name'] ?? $this->getModuleName();
            if (! empty($moduleName)) {
                $emailSetupData['mgdprc_email_conf_tags'] = implode(',', array_keys($tags[$moduleName]));
            }
        }
        // get form for the Cron Config
        $view->setVariable('formCronConfig', $this->getGdprAutoDeleteToolService()->getAddEditCronConfigForm()->setData($emailSetupData));
        // get add edit email setup form
        $form = $this->getGdprAutoDeleteToolService()->getAddEditEmailSetupForm();
        // add attributes to tags element
        if (isset($emailSetupData['mgdprc_email_conf_tags'])) {
            $form->get('mgdprc_email_conf_tags')->setAttribute('data-tags', $emailSetupData['mgdprc_email_conf_tags']);
        }
        // set data
        if (! empty($emailSetupData)) {
            // set data tags for the mgdprc_email_conf_tags field
            $form->setData($emailSetupData);
        }
        // set email from based from the smtp
        $smtpConfigData = $this->getServiceLocator()->get('MelisCoreGdprAutoDeleteService')->getSmtpConfigData();
        if (! empty($smtpConfigData)){
            $form->get('mgdprc_email_conf_from_email')->setValue($smtpConfigData->mgdpr_smtp_username);
            $form->get('mgdprc_email_conf_from_email')->setAttribute('readonly','readonly');
        }

        
        // get form for Email Setup
        $view->setVariable('formEmailSetup', $form);

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

    public function renderAlertEmailTabAction()
    {
        // view model
        $view = new ViewModel();
        // set melis tool key
        $this->getTool()->setMelisToolKey('MelisCoreGdprAutoDelete', 'melis_core_gdpr_auto_delete');
        // melisKey
        $view->setVariable('melisKey', $this->getMelisKey());
        // for contents
        $view->setVariable('melisCmsLang', $this->getGdprAutoDeleteToolService()->getCmsLang());
        // get alert email form
        $view->setVariable('melisCoreGdprAlertEmailForm', $this->getGdprAutoDeleteToolService()->getAddEditAlertEmailForm());
        // get alert email delete form
        $view->setVariable('melisCoreGdprAlertEmailDeleteForm', $this->getGdprAutoDeleteToolService()->getAddEditAlertEmailDeleteForm());
        // get config data to get the module name
        $emailSetupData = $this->getGdprAutoDeleteToolService()->getGdprAutoDeleteConfigDataById($this->getConfigId());
        // translations data
        if (!empty($this->getModuleName()) || isset($emailSetupData['mgdprc_module_name'])) {
            $tags = $this->getServiceLocator()->get('MelisCoreGdprAutoDeleteService')->getModuleTags();
            $moduleName = $emailSetupData['mgdprc_module_name'] ?? $this->getModuleName();
            if (!empty($moduleName)) {
                $view->setVariable('module_tags', implode(',', array_keys($tags[$moduleName])));
            }
        }
        $view->setVariable('alertEmailsTransData', $this->getGdprAutoDeleteToolService()->getAlertEmailsTranslationsData($this->getConfigId()));
        // config id
        $view->setVariable('configId', $this->getConfigId());

        return $view;
    }

    /**
     * get GDPR Deleted Emails Logs
     *
     * @return JsonModel
     */
    public function getGdprDeleteEmailsLogsAction()
    {
        // set melis tool key
        $this->getTool()->setMelisToolKey('MelisCoreGdprAutoDelete', 'melis_core_gdpr_auto_delete_log');
        // request
        $request = $this->getRequest();
        $tableData = [];
        $post = [];
        $dataCount = 0;
        $dataFilteredCount = 0;
        if ($request->isPost()) {
            // post data
            $post = $this->processPostData(get_object_vars($request->getPost()));
            // get gdpr delete config data from service
            $data =   $this->getGdprAutoDeleteToolService()->getGdprDeleteEmailLogsData(
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
                // module name
                $post['moduleName']
            );
            $dataCount = $this->getGdprDeleteEmailsLogsTable()->getTotalData();
            $dataFilteredCount = $this->getGdprDeleteEmailsLogsTable()->getTotalFiltered();
            // get data and format
            $tableData = $this->formatDataIntoDataTableFormat($data);
        }

        return new JsonModel([
            'draw' => (int)$post['draw'],
            'data' => $tableData,
            'recordsFiltered' => $dataFilteredCount,
            'recordsTotal' => $dataCount
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
        $this->getTool()->setMelisToolKey('MelisCoreGdprAutoDelete', 'melis_core_gdpr_auto_delete_log');

        return [
            'draw' => (int)$postData['draw'],
            'orderBy' => array_keys($this->getTool()->getColumns())[(int)$postData['order'][0]['column']],
            'orderDir' => isset($postData['order']['0']['dir']) ? strtoupper($postData['order']['0']['dir']) : 'DESC',
            'searchKey' => isset($postData['search']['value']) ? $postData['search']['value'] : null,
            'start' => (int)$postData['start'],
            'limit' => (int)$postData['length'],
            'siteId' => $postData['site_id'] ?? null,
            'moduleName' => $postData['module_name'],
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
                $formattedData[$ctr]['DT_RowId'] = $data[$ctr]['mgdprl_id'];
                $formattedData[$ctr]['mgdprl_log_date'] = $data[$ctr]['mgdprl_log_date'];
                $formattedData[$ctr]['mgdprl_warning1_ok'] = $data[$ctr]['mgdprl_warning1_ok'];
                $formattedData[$ctr]['mgdprl_warning1_ko'] = $data[$ctr]['mgdprl_warning1_ko'];
                $formattedData[$ctr]['mgdprl_warning2_ok'] = $data[$ctr]['mgdprl_warning2_ok'];
                $formattedData[$ctr]['mgdprl_warning2_ko'] = $data[$ctr]['mgdprl_warning2_ko'];
                $formattedData[$ctr]['mgdprl_delete_ok'] = $data[$ctr]['mgdprl_delete_ok'];
                $formattedData[$ctr]['mgdprl_delete_ko'] = $data[$ctr]['mgdprl_delete_ko'];
            }
        } else {
            $formattedData = $data;
        }

        return $formattedData;
    }

    /**
     * @return MelisGdprDeleteEmailsLogsTable | object
     */
    private function getGdprDeleteEmailsLogsTable()
    {
       return $this->getServiceLocator()->get('MelisGdprDeleteEmailsLogsTable');
    }

    /**
     * @return ViewModel
     */
    public function renderLogsTableShowDetailsAction()
    {
        return new ViewModel();
    }

    /**
     * @return ViewModel
     */
    public function renderLogsTableRefreshAction()
    {
        return new ViewModel();
    }

    /**
     * Logs tab
     * @return ViewModel
     */
    public function renderLogsTabAction()
    {
        // view model
        $view = new ViewModel();
        // set meliskey to get another table
        $this->getTool()->setMelisToolKey('MelisCoreGdprAutoDelete', 'melis_core_gdpr_auto_delete_log');
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
                "#tableGdprAutoDeleteLogs",
                true,
                false,
                ['order' => '[[0, "desc"]]', 'pageLength' => '5']
            )
        );
        // get config id
        $view->setVariable('configId', $this->getConfigId());
        
        $view->setVariable('logsData', $this->getGdprAutoDeleteToolService()->getGdprDeleteEmailsLogs($this->getSiteId(), $this->getModuleName()));

        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderLogsTabDetailsAction()
    {
        // view model
        $view = new ViewModel();
        // get log id
        $logId = $this->params()->fromRoute('logId', $this->params()->fromQuery('logId'), null);
        $logData = [];
        if (! empty($logId)) {
            // get log data
            $logData = $this->getGdprDeleteEmailsLogsTable()->getEntryById($logId)->current();
            if (! empty($logData)) {
                // get email of the id for warning1 ok
                $logData->mgdprl_warning1_ok_log = $this->getUserEmailInOk($logData->mgdprl_warning1_ok_log, $logData->mgdprl_module_name);
                // get email of the id form warning1 ko
                $logData->mgdprl_warning1_ko_log = $this->getUserEmailInKo($logData->mgdprl_warning1_ko_log, $logData->mgdprl_module_name);
                // get email of the id for warning2 ok
                $logData->mgdprl_warning2_ok_log = $this->getUserEmailInOk($logData->mgdprl_warning2_ok_log, $logData->mgdprl_module_name);
                // get email of the id for warning2 ko 
                $logData->mgdprl_warning2_ko_log = $this->getUserEmailInKo($logData->mgdprl_warning2_ko_log, $logData->mgdprl_module_name);
                 // get email of the id for delete ok 
                $logData->mgdprl_delete_ok_log = $this->getUserEmailInOk($logData->mgdprl_delete_ok_log, $logData->mgdprl_module_name);
                // get email of the id for delete ko 
                $logData->mgdprl_delete_ko_log = $this->getUserEmailInKo($logData->mgdprl_delete_ko_log, $logData->mgdprl_module_name);

            }
            // get site name
            $logData->mgdprl_site_id = $this->getGdprAutoDeleteToolService()->getSiteNameBySiteId($logData->mgdprl_site_id);

        }
    
        // log id
        $view->setVariable('logData', $logData);
        // melis key
        $view->setVariable('melisKey', $this->getMelisKey());

        return $view;
    }

    /**
     * retrieve user email to their respective by module for KO log messages
     * @param $ids
     * @param $module
     */
    private function getUserEmailInKo($ids, $module)
    {
        $emails = "";
        if (! empty($ids)) {
            // explode
            $ids = explode(';',$ids);
            foreach ($ids as $val) {
                $id = explode('/', $val)[0];
                if (! empty($val)) {
                    $message = explode('/', $val)[1];
                    //trigger an event to get respective user email by its module
                    $list = $this->getEventManager()->trigger('melis_core_gdpr_auto_delete_log_get_user_email', $this, ['module' => $module, 'id' => $id]);
                    for ($list->rewind();$list->valid();$list->next()) {
                        if (! empty($list->current())) {
                            $returnedData = $list->current();
                            $returnedModule = $returnedData['module'] ?? null;
                            $email = $returnedData['email'] ?? null;
                            if (! empty($email)) {
                                $emails .= $email . "/" . $message . ";";
                            } else {
                                $emails .= $id . "/" . $message . ";";
                            }
                        }
                    }
                }
            }
        }

        return $emails;
    } 

    /**
     * retrieve user email to their respective by module for OK log messages
     *
     * @param $ids
     * @param $module
     */
    private function getUserEmailInOk($ids, $module)
    {
        $emails = "";
        if (! empty($ids)) {
            // explode
            $ids = explode(';',$ids);
            foreach ($ids as $id) {
                //trigger an event to get respective user email by its module
                $list = $this->getEventManager()->trigger('melis_core_gdpr_auto_delete_log_get_user_email', $this, ['module' => $module, 'id' => $id]);
                for ($list->rewind(); $list->valid(); $list->next()) {
                    // check if current data is not empty
                    if (! empty($list->current())) {
                        $returnedData = $list->current();
                        $email = $returnedData['email'] ?? null;
                        $returnedModule = $returnedData['module'] ?? null;
                        if ($returnedModule == $module) {
                            if (! empty($email)) {
                                $emails .= $email . ";";
                            } else {
                                $emails .= $id . ";";
                            }
                        }
                    }
                };
            }
        }

        return $emails;
    } 

    public function deleteEverythingAction()
    {
        $response = [];
        $request = $this->getRequest();
        if ($request->isPost()) {
            $data = get_object_vars($request->getPost());
            if ($this->getGdprAutoDeleteToolService()->deleteEverything($data['configId'], $data['type'], $data['langId'])) {
                $response['success'] = true;
            }
        }

        return new JsonModel($response);
    }

    public function getAutoDeleteConfigBySiteModuleAction()
    {
        return new JsonModel([
            'success' => true
        ]);
    }

    private function getModuleName()
    {
        return $this->params()->fromRoute('moduleName', $this->params()->fromQuery('moduleName'), null);
    }


    private function getSiteId()
    {
        return $this->params()->fromRoute('siteId', $this->params()->fromQuery('siteId'), null);
    }
}
