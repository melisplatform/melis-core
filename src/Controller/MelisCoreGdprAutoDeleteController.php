<?php
namespace MelisCore\Controller;
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCore\Model\Tables\MelisGdprDeleteConfigTable;
use MelisCore\Service\MelisCoreGdprAutoDeleteService;
use MelisCore\Service\MelisCoreToolService;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;

class MelisCoreGdprAutoDeleteController extends AbstractActionController
{
    /**
     * @return ViewModel
     */
    public function renderContentModalAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey',$this->getMelisKey());

        return $view;
    }
    /**
     * @return ViewModel
     */
    public function renderContentContainerAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey',$this->getMelisKey());

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
        $view->setVariable('melisKey',$this->getMelisKey());

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
        $view->setVariable('melisKey',$this->getMelisKey());

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
        $view->setVariable('melisKey',$this->getMelisKey());

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
        $view->setVariable('melisKey',$this->getMelisKey());

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
        if (in_array('MelisCms',$this->getServiceLocator()->get('ModulesService')->getAllModules())) {
            $view->setVariable('sites', $this->getServiceLocator()->get('MelisEngineTableSite')->fetchAll()->toArray());
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
        $view->setVariable('modules',$this->getGdprAutoDeleteService()->getAutoDeleteModulesList());

        return $view;
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
        $view->setVariable('melisKey',$this->getMelisKey());
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
        if($request->isPost()) {
            // set melis tool key
            $this->getTool()->setMelisToolKey('MelisCoreGdprAutoDelete', 'melis_core_gdpr_auto_delete');
            // post data
            $post = $this->processPostData(get_object_vars($request->getPost()));
            // get data and format
            $tableData = $this->formatDataIntoDataTableFormat (
                // get gdpr delete config data from service
                $this->getGdprAutoDeleteService()->getGdprDeleteConfigData (
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
            'draw'            => (int) $post['draw'],
            'data'            => $tableData,
            'recordsFiltered' => $this->getGdprDeleteConfigTable()->getTotalFiltered(),
            'recordsTotal'    => $this->getGdprDeleteConfigTable()->getTotalData()
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
            'draw'       => (int) $postData['draw'],
            'orderBy'    => array_keys($this->getTool()->getColumns())[(int) $postData['order'][0]['column']],
            'orderDir'   => isset($postData['order']['0']['dir']) ? strtoupper($postData['order']['0']['dir']) : 'DESC',
            'searchKey'  => isset($postData['search']['value']) ? $postData['search']['value'] : null,
            'start'      => (int) $postData['start'],
            'limit'      => (int) $postData['length'],
            'siteId'     => isset($postData['gpdr_auto_delete_site_id']) ? $postData['gpdr_auto_delete_site_id'] : null,
            'module'     => isset($postData['gdpr_auto_delete_module'])  ? $postData['gdpr_auto_delete_module'] : null,
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
        if (! empty($data)) {
            for($ctr = 0; $ctr < count($data); $ctr++) {
                // apply text limits
                foreach($data[$ctr] as $vKey => $vValue) {
                    // apply limit text
                    $formattedData[$ctr][$vKey] = $this->getTool()->limitedText($vValue, 80);
                }
                // set data for match fields
                $formattedData[$ctr]['DT_RowId'] = $data[$ctr]['mgdprc_id'];
                $formattedData[$ctr]['mgdprc_site_id'] = $data[$ctr]['mgdprc_site_id'];
                $formattedData[$ctr]['mgdprc_module_name'] = $this->getGdprAutoDeleteService()->getAutoDeleteModulesList()[$data[$ctr]['mgdprc_module_name']];
                $formattedData[$ctr]['mgdprc_alert_email_status'] = $data[$ctr]['mgdprc_alert_email_status'];
                $formattedData[$ctr]['mgdprc_alert_email_resend'] = $data[$ctr]['mgdprc_alert_email_resend'];
                $formattedData[$ctr]['mgdprc_delete_days'] = $data[$ctr]['mgdprc_delete_days'];
            }
        } else {
            $formattedData = $data;
        }

        return $formattedData;
    }
    /**
     * this method will get the melisKey from route params
     */
    private function getMelisKey()
    {
        return $this->params()->fromRoute('melisKey', $this->params()->fromQuery('melisKey'), null);
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
     * @return MelisCoreGdprAutoDeleteService
     */
    private function getGdprAutoDeleteService()
    {
        /** @var MelisCoreGdprAutoDeleteService $gdprAutoDeleteSvc */
        $gdprAutoDeleteSvc = $this->getServiceLocator()->get('MelisCoreGdprAutoDeleteService');

        return $gdprAutoDeleteSvc;
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
        $view->setVariable('melisKey',$this->getMelisKey());

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
        $view->setVariable('melisKey',$this->getMelisKey());

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
        $view->setVariable('melisKey',$this->getMelisKey());

        return $view;
    }
    /**
     * @return ViewModel
     */
    public function renderContentAccordionAddEditConfigFiltersAction()
    {
        // set melis key
        $this->getTool()->setMelisToolKey('MelisCoreGdprAutoDelete', 'melis_core_gdpr_auto_delete');
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey',$this->getMelisKey());
        // get filters form
        $view->setVariable('formFilter', $this->getTool()->getForm('melisgdprautodelete_add_edit_config_filters'));

        return $view;
    }
    public function runGdprAutoDeleteCronAction()
    {
        $this->getGdprAutoDeleteService()->getAutoDeleteModulesList();
        return new JsonModel([
            'success' => true
        ]);
    }
    public function saveAutoDeleteConfigurationAction()
    {
        $request = $this->getRequest();
        // save only when request is post
        if ($request->isPost()){
            // sanitized url data
            $postValues = get_object_vars($request->getPost());
            // parse serialized data from url
            $postValues = array_merge($postValues,$this->parseSerializedData($postValues['auto_delete_config']));
            // remove auto_delete_config key
            unset($postValues['auto_delete_config']);
            // parse serialized data from url
            $postValues = array_merge($postValues,$this->parseSerializedData($postValues['alert_delete_conf']));
            // remove auto_delete_config key
            unset($postValues['alert_delete_conf']);
            // convert json string to array
            $alertEmailsTransData = $this->jsonToArray($postValues['alert_emails_trans']);
            // remove alert_emails_trans key
            unset($postValues['alert_emails_trans']);
            // save gdpr auto delete configs
            $configId = $this->getGdprAutoDeleteService()->saveGdprAutoDeleteConfig($postValues);
            // save gdpr alert emails translations
            $this->saveAlertEmailsTrans($alertEmailsTransData,$configId);
        }
        return new JsonModel([
            'success' => true
        ]);
    }

    /**
     * @param $validatedData
     * @param $configId
     */
    private function saveAlertEmailsTrans($validatedData,$configId)
    {
        if (! empty($validatedData)) {
            // get config id
            foreach ($validatedData as $idx => $val) {
                $val['data']['mgdpre_config_id'] = $configId;
                // save alert emails trans
                $this->getGdprAutoDeleteService()->saveGdprDeleteWarningEmails($val['data'],null);
            }
        }
    }
    /**
     * parse url serialized data
     *
     * @param $postData
     * @return mixed
     */
    private function parseSerializedData($postData)
    {
        parse_str($postData, $data);

        return $data;
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
        $data = json_decode($jsonData,true);
        // parse serialized data from url
        foreach ($data as $idx => $val) {
            // overwrite old data
            $data[$idx]['data'] = $this->parseSerializedData($val['data']);
        }

        return $data;
    }
}