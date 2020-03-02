<?php
namespace MelisCore\Service;

use MelisCore\Form\MelisForm;
use MelisCore\Model\Tables\MelisGdprDeleteConfigTable;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsLogsTable;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsTable;
use MelisCore\Model\Tables\MelisLangTable;

class MelisCoreGdprAutoDeleteService extends MelisCoreGeneralService
{
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
     *
     * get gdpr delete config data
     *
     * @param $searchValue
     * @param $searchableCols
     * @param $selColOrder
     * @param $orderDirection
     * @param $start
     * @param $length
     * @return mixed
     */
    public function getGdprDeleteEmailLogsData($searchValue,$searchableCols, $selColOrder, $orderDirection , $start ,$length )
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
        $arrayParameters['results'] = $this->gdprAutoDeleteEmailsLogsTable->getGdprDeleteEmailsLogsData($searchValue,$searchableCols,$selColOrder, $orderDirection, $start, $length)->toArray();
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
    public function saveGdprDeleteWarningEmails($validatedData, $id)
    {
        return $this->gdprAutoDeleteEmailsTable->save($validatedData, $id);
    }

    /**
     * @return MelisGdprDeleteEmailsTable
     */
    public function getGdprDeleteWarningEmailsTable()
    {
        return $this->gdprAutoDeleteEmailsTable;
    }

    /**
     * @return MelisGdprDeleteConfigTable
     */
    public function getGdprAutoDeleteConfigTable()
    {
        return $this->gdprAutoDeleteConfigTable;
    }

    /**
     * @return MelisGdprDeleteEmailsLogsTable
     */
    public function getGdprAutoDeleteLogsTable()
    {
        return $this->gdprAutoDeleteEmailsLogsTable;
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
    public function getAddEditEmailStupForm()
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
    public function getAddEditDeleteForm()
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
            'melisgdprautodelete_add_edit_config_filters'     => [
                'name' => 'Configuration Filters',
                'form' => $this->getAddEditFiltersForm()
            ],
            'melisgdprautodelete_add_edit_cron_config_form'   => [
                'name' => 'Cron Config',
                'form' => $this->getAddEditCronConfigForm()
            ],
            'melisgdprautodelete_add_edit_email_setup'        => [
                'name' => 'Alert Email',
                'form' => $this->getAddEditEmailStupForm()
            ],
            'melisgdprautodelete_add_edit_alert_email_delete' => [
                'name' => 'Account Deleted Email',
                'form' => $this->getAddEditDeleteForm()
            ]
        ];

        foreach ($gdprAutoDeleteForms as $formkey => $form) {
            /** @var MelisForm $form */
            // validate form
            $validatedForm = $form['form']->setData($postData);
            // check form it its valid
            if (!$validatedForm->isValid()) {
                // set form errors
                $errors = $errors + $this->formatErrorMessage($validatedForm->getMessages(), "MelisCoreGdprAutoDelete/tools/melis_core_gdpr_auto_delete/forms/" . $formkey) ;
            }
        }

        return $errors;
    }
    /**
     * This will pop an error after validating the form
     *
     * @param array $errors
     * @param $formConfigPath
     * @return array
     */
    private function formatErrorMessage($errors = array(),$formConfigPath)
    {
        /** @var MelisCoreConfigService $config */
        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        // get form elements
        $formConfig = $config->getItem($formConfigPath)['elements'];
        // set label for each field
        foreach ($errors as $keyError => $valueError) {
            foreach ($formConfig as $keyForm => $valueForm) {
                if ($valueForm['spec']['name'] == $keyError &&
                    !empty($valueForm['spec']['options']['label']))
                    $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
            }
        }

        return $errors;
    }
}