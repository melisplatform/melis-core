<?php
namespace MelisCore\Service;

use MelisCore\Form\MelisForm;
use MelisCore\Model\Tables\MelisGdprDeleteConfigTable;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsLogsTable;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsTable;
use MelisCore\Model\Tables\MelisLangTable;

class MelisCoreGdprAutoDeleteToolService extends MelisCoreGeneralService
{
    const EMAIL_WARNING_CONTENT_TYPE = "email_warning_content";
    const EMAIL_DELETE_CONTENT_TYPE = "email_delete_content";
    /**
     * @var MelisGdprDeleteConfigTable
     */
    protected $gdprAutoDeleteConfigTable;
    /**
     * @var MelisGdprDeleteEmailsLogsTable
     */
    protected $gdprAutoDeleteEmailsLogsTable;
    /**
     * @var MelisGdprDeleteEmailsTable
     */
    protected $gdprAutoDeleteEmailsTable;
    /**
     * @var array
     */
    protected $gdprAutoDeleteForms = [];

    /**
     * MelisCoreGdprAutoDeleteService constructor.
     * @param MelisGdprDeleteConfigTable $gdprAutoDeleteConfigTable
     * @param MelisGdprDeleteEmailsTable $gdprAutoDeleteEmailsTable
     * @param MelisGdprDeleteEmailsLogsTable $gdprAutoDeleteEmailsLogsTable
     */
    public function __construct(
        MelisGdprDeleteConfigTable $gdprAutoDeleteConfigTable,
        MelisGdprDeleteEmailsLogsTable $gdprAutoDeleteEmailsLogsTable,
        MelisGdprDeleteEmailsTable $gdprAutoDeleteEmailsTable
    )
    {
        $this->gdprAutoDeleteConfigTable     = $gdprAutoDeleteConfigTable;
        $this->gdprAutoDeleteEmailsTable     = $gdprAutoDeleteEmailsTable;
        $this->gdprAutoDeleteEmailsLogsTable = $gdprAutoDeleteEmailsLogsTable;
    }

    /**
     * @param $searchValue
     * @param $searchableCols
     * @param $selColOrder
     * @param $orderDirection
     * @param $start
     * @param $length
     * @param int $sitId
     * @param null $module
     * @return mixed
     */
    public function getGdprDeleteConfigData($searchValue,$searchableCols, $selColOrder, $orderDirection , $start ,$length, $sitId = 0, $module = null )
    {
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_gdpr_auto_delete_get_gdrp_delete_config_data_start', $arrayParameters);
        // get the updated value of a variable
        foreach ($arrayParameters as $var => $val) {
            $$var = $val;
        }
        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $this->gdprAutoDeleteConfigTable->getGdprDeleteConfigData($searchValue,$searchableCols,$selColOrder, $orderDirection, $start, $length, $sitId , $module)->toArray();
        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_gdpr_auto_delete_get_gdrp_delete_config_data_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * get gdpr delete config data
     *
     * @param $searchValue
     * @param $searchableCols
     * @param $selColOrder
     * @param $orderDirection
     * @param $start
     * @param $length
     * @param $siteId
     * @param $moduleName
     * @return mixed
     */
    public function getGdprDeleteEmailLogsData($searchValue,$searchableCols, $selColOrder, $orderDirection , $start ,$length, $siteId, $moduleName)
    {
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_gdpr_auto_delete_get_gdrp_delete_email_logs_data_start', $arrayParameters);
        // get the updated value of a variable
        foreach ($arrayParameters as $var => $val) {
            $$var = $val;
        }
        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $this->gdprAutoDeleteEmailsLogsTable->getGdprDeleteEmailsLogsData($searchValue,$searchableCols,$selColOrder, $orderDirection, $start, $length, $siteId, $moduleName)->toArray();
        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_gdpr_auto_delete_get_gdrp_delete_email_logs_data_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * @return MelisLangTable
     */
    public function getMelisCoreLang()
    {
        /** @var MelisLangTable $melisCoreLangTbl */
        $melisCoreLangTbl = $this->getServiceLocator()->get('MelisCoreTableLang');

        return $melisCoreLangTbl->fetchAll()->toArray();
    }

    /**
     * get the list of modules
     *
     * @return array
     */
    public function getAutoDeleteModulesList()
    {
        // trigger event to get list of modules
        $list = $this->getEventManager()->trigger('melis_core_gdpr_auto_delete_modules_list');
        $moduleList = [];
        // get the returned data from each module listener
        for ($list->rewind();$list->valid();$list->next()) {
            // check if current data is not empty
            if (!empty($list->current())) {
                // get the lists
                foreach ($list->current()['modules_list'] as $moduleName => $moduleOptions) {
                    $moduleList[$moduleName] = $moduleOptions['name'] ?? $moduleName;
                }
            }
        };


        return $moduleList;
    }

    /**
     * @param $postData
     * @param null $id
     * @return int|null
     */
    public function saveGdprAutoDeleteConfig($postData, $id = null)
    {
        return $this->gdprAutoDeleteConfigTable->save($postData,$id);
    }

    /**
     * @param $validatedData
     * @param $id
     * @return int|null
     */
    public function saveGdprDeleteAlertEmails($validatedData, $id)
    {
        return $this->gdprAutoDeleteEmailsTable->save($validatedData, $id);
    }
    /**
     * this method will get the meliscore tool
     * @return MelisCoreToolService
     */
    private function getTool()
    {
        /** @var MelisCoreToolService $toolSvc */
        $toolSvc = $this->getServiceLocator()->get('MelisCoreTool');
        // set melis tool key
        $toolSvc->setMelisToolKey('MelisCoreGdprAutoDelete', 'melis_core_gdpr_auto_delete');

        return $toolSvc;
    }

    /**
     * get add edit filters form
     *  - (site)
     *  - (module)
     *
     * @return \Zend\Form\ElementInterface
     */
    public function getAddEditFiltersForm()
    {
        return $this->getTool()->getForm('melisgdprautodelete_add_edit_config_filters');
    }

    /**
     * get add/edit cron config form
     *
     * @return \Zend\Form\ElementInterface
     */
    public function getAddEditCronConfigForm()
    {
        return $this->getTool()->getForm('melisgdprautodelete_add_edit_cron_config_form');
    }
     /**
     * get add/edit cron config form
     *
     * @return \Zend\Form\ElementInterface
     */
    public function getAddEditEmailSetupForm()
    {
        return $this->getTool()->getForm('melisgdprautodelete_add_edit_email_setup');
    }

    /**
     * get add/edit alert email form
     *
     * @return \Zend\Form\ElementInterface
     */
    public function getAddEditAlertEmailForm()
    {
        return $this->getTool()->getForm('melisgdprautodelete_add_edit_alert_email');
    }

    /**
     * get add/edit delete email form
     *
     * @return \Zend\Form\ElementInterface
     */
    public function getAddEditAlertEmailDeleteForm()
    {
        return $this->getTool()->getForm('melisgdprautodelete_add_edit_alert_email_delete');
    }

    /**
     * @param $postData
     * @return mixed
     */
    public function validateForm($postData)
    {
        // errors data
        $errors = [];

        $gdprAutoDeleteForms = [
            'melisgdprautodelete_add_edit_config_filters' => [
                'name' => 'Configuration Filters',
                'form' => $this->getAddEditFiltersForm()
            ],
            'melisgdprautodelete_add_edit_cron_config_form' => [
                'name' => 'Cron Config',
                'form' => $this->getAddEditCronConfigForm()
            ],
            'melisgdprautodelete_add_edit_email_setup' => [
                'name' => 'Email Setup',
                'form' => $this->getAddEditEmailSetupForm()
            ],
//            'melisgdprautodelete_add_edit_alert_email' => [
//                'name' => 'Alert email',
//                'form' => $this->getAddEditAlertEmailForm()
//            ],
//            'melisgdprautodelete_add_edit_alert_email_delete' => [
//                'name' => 'Account Deleted Email',
//                'form' => $this->getAddEditAlertEmailDeleteForm()
//            ]
        ];

        foreach ($gdprAutoDeleteForms as $formkey => $form) {
            /** @var MelisForm $form */
            // validate form
            $validatedForm = $form['form']->setData($postData);
            // check form it its valid
            if (!$validatedForm->isValid()) {
                // set form errors
                $errors = array_merge($errors, $this->formatErrorMessage($validatedForm->getMessages(), "MelisCoreGdprAutoDelete/tools/melis_core_gdpr_auto_delete/forms/" . $formkey)) ;
            }
        }

        return $errors;
    }
    public function validateTranslationsForm($postDataTranslations, $form)
    {
        print_r($postDataTranslations);
        die;
    }
    /**
     * This will pop an error after validating the form
     *
     * @param array $errors
     * @param $formConfigPath
     * @return array
     */
    private function formatErrorMessage($errors = [],$formConfigPath)
    {
        /** @var MelisCoreConfigService $config */
        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        // get form elements
        $formConfig = $config->getItem($formConfigPath)['elements'];
        // set label for each field
        foreach ($errors as $keyError => $valueError) {
            foreach ($formConfig as $keyForm => $valueForm) {
                if ($valueForm['spec']['name'] == $keyError) {
                    if (!empty($valueForm['spec']['options']['label'])) {
                        $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
                    } else {
                        $errors[$keyError]['label'] = $valueForm['spec']['attributes']['data-label-text'];
                    }
                }
            }
        }

        return $errors;
    }

    /**
     * @param $configId
     * @return array
     */
    public function getGdprAutoDeleteConfigDataById($configId)
    {
        $data = $this->gdprAutoDeleteConfigTable->getEntryById($configId)->current() ?: [];
        if (! empty($data)) {
            $data = (array) $data;
        }

        return $data;
    }

    /**
     * @return mixed
     */
    public function getAllGdprAutoDeleteConfigData()
    {
        return $this->gdprAutoDeleteConfigTable->fetchAll()->toArray();
    }

    /**
     * @return mixed
     */
    public function getAllGdprAutoDeleteConfigDataWithEmailTrans()
    {
        // get gdpr auto delete config data
        $configData = $this->gdprAutoDeleteConfigTable->fetchAll()->toArray();
        if (!empty($configData)) {
            foreach ($configData as $idx => $data) {
                $configData[$idx]['email_trans'] = $this->groupAlertEmailsTransDataByType($this->getAlertEmailsTranslationsData($data['mgdprc_id']));
            }
        }

        return $configData;
    }

    /**
     * group alert email translations data by type of email
     * @param $alertEmailsTransData
     * @return array
     */
    public function groupAlertEmailsTransDataByType($alertEmailsTransData)
    {
        $data = [];
        if (!empty($alertEmailsTransData)) {
            foreach($alertEmailsTransData as $idx => $transData) {
                // get the link url
                $transData['mgdpre_link'] = $this->getLinkUrl($transData['mgdpre_link']);
                // group the data by email type
                switch ($transData['mgdpre_type']) {
                    case MelisGdprDeleteEmailsTable::EMAIL_WARNING;
                        // set data
                        $data[self::EMAIL_WARNING_CONTENT_TYPE][] = $transData;
                        break;
                    case MelisGdprDeleteEmailsTable::EMAIL_DELETED;
                        // set data
                        $data[self::EMAIL_DELETE_CONTENT_TYPE][] = $transData;
                        break;
                    default;break;
                }
            }
        }

        return $data;
    }

    /**
     * trigger a listener to get the link url from melis-engine service to respect it's dependency
     *
     * @param $pageId
     * @return mixed
     */
    public function getLinkUrl($pageId)
    {
        if ($this->getServiceLocator()->has('MelisEngineTree')) {
            return $this->getServiceLocator()->get('MelisEngineTree')->getPageLink($pageId,true);
        }

        return $pageId;
    }

    /**
     * @param $siteId
     * @param $moduleName
     * @return object
     */
    public function getGdprAutoDeleteConfigBySiteModule($siteId,$moduleName)
    {
        return $this->gdprAutoDeleteConfigTable->getDeleteConfigBySiteIdModuleName($siteId,$moduleName);
    }

    /**
     * @param $configId
     * @return mixed
     */
    public function getAlertEmailsTranslationsData($configId)
    {
        return $this->gdprAutoDeleteEmailsTable->getEntryByField('mgdpre_config_id',$configId)->toArray();
    }

    /**
     * @param $configId
     * @param null $type
     * @param null $langId
     * @return mixed
     */
    public function getAlertEmailsTransData($configId,$type = null, $langId = null)
    {
        $data = $this->gdprAutoDeleteEmailsTable->getAlertEmailsTransData($configId, $type, $langId)->toArray();
        if (! empty($type) && !empty($langId)) {
            $data = $this->gdprAutoDeleteEmailsTable->getAlertEmailsTransData($configId, $type, $langId)->current();
        }
        return $data;
    }

    /**
     * @param $configId
     * @return mixed
     */
    public function getAlertEmailsTransDataByConfigId($configId)
    {
        return $this->gdprAutoDeleteEmailsTable->getEntryByField('mgdpre_config_id', $configId)->toArray();
    }

    /**
     * @param $configId
     * @return MelisGdprDeleteEmailsLogsTable
     */
    public function getAlertEmeailsLogsData($configId)
    {
        return $this->gdprAutoDeleteEmailsLogsTable;
    }

    /**
     * @param $siteId
     * @return mixed
     */
    public function getSiteNameBySiteId($siteId)
    {
        if ($this->getServiceLocator()->has('MelisEngineTableSite')){
            return $this->getServiceLocator()->get('MelisEngineTableSite')->getEntryById($siteId)->current()->site_label;
        }

        return $siteId;
    }

    /**
     * @param $configId
     * @param $emailType
     * @param $langId
     * @return int|null
     */
    public function deleteEverything($configId, $emailType, $langId )
    {
        // get the data
        $data = $this->gdprAutoDeleteEmailsTable->getAlertEmailsTransData($configId, $emailType,$langId)->current();

        // set fields into null
        return $this->gdprAutoDeleteEmailsTable->save([
            'mgdpre_link' => null,
            'mgdpre_subject' => null,
            'mgdpre_html' => null,
            'mgdpre_text' => null,
            'mgdpre_email_tags' => null,
        ], $data->mgdpre_id);
    }

    /**
     * @param $id
     * @return int
     */
    public function deleteConfig($id)
    {
        $data = $this->getGdprAutoDeleteConfigDataById($id);
        // delete logs data
        $this->gdprAutoDeleteEmailsLogsTable->deleteByField('mgdprl_module_name', $data['mgdprc_module_name']);

        return $this->gdprAutoDeleteConfigTable->deleteById($id);
    }

}