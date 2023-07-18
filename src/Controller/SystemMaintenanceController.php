<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;


use Laminas\Session\Container;
use Laminas\View\Model\JsonModel;
use Laminas\View\Model\ViewModel;
use MelisCore\Controller\MelisAbstractActionController;

class SystemMaintenanceController extends MelisAbstractActionController
{

    const TOOL_INDEX = 'meliscms';
    const TOOL_KEY = 'meliscms_tool_sites';

    public function renderToolAction()
    {
        $view = new ViewModel();
        return $view;
    }

    public function renderToolHeaderAction()
    {
        $view = new ViewModel();
        return $view;
    }

    public function renderToolContentAction()
    {
        $view = new ViewModel();

        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('meliscore', 'systemmaintenance_tools');

        $columns = $melisTool->getColumns();
        $translator = $this->getServiceManager()->get('translator');
        $columns['actions'] = ['text' => $translator->translate('tr_systemmaintenance_common_table_column_action')];
        $view->tableColumns = $columns;
        $view->toolTable = $melisTool->getDataTableConfiguration('#systemmaintenanceTableContent', true, false, ['order' => [[ 0, 'desc' ]]]);

        return $view;
    }

    public function getListAction()
    {

        $cmsSiteSrv = $this->getServiceManager()->get('MelisCmsSiteService');
        $siteTable = $this->getServiceManager()->get('MelisEngineTableSite');
        $translator = $this->getServiceManager()->get('translator');

        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);

        $colId = array();
        $dataCount = 0;
        $draw = 0;
        $tableData = array();

        if($this->getRequest()->isPost())
        {
            $colId = array_keys($melisTool->getColumns());

            $sortOrder = $this->getRequest()->getPost('order');
            $sortOrder[0]['dir'] = "asc";
            $sortOrder = $sortOrder[0]['dir'];

            $selCol = $this->getRequest()->getPost('order');
            $selCol = $colId[$selCol[0]['column']];

            $draw = $this->getRequest()->getPost('draw');

            $start = (int)$this->getRequest()->getPost('start');
            $length = (int)$this->getRequest()->getPost('length');

            $search = $this->getRequest()->getPost('search');
            $search = $search['value'];

            $dataCount = $siteTable->getTotalData();
            // dd($siteTable);
            $getData = $siteTable->getSitesData($search, $melisTool->getSearchableColumns(), $selCol, $sortOrder, $start, $length);
            $dataFilter = $siteTable->getSitesData($search, $melisTool->getSearchableColumns(), $selCol, $sortOrder, null, null);

            $tableData = $getData->toArray();
            for ($ctr = 0; $ctr < count($tableData); $ctr++) {
                // apply text limits
                foreach ($tableData[$ctr] as $vKey => $vValue) {
                    $tableData[$ctr][$vKey] = $melisTool->limitedText($melisTool->escapeHtml($vValue));
                }

                // manually modify value of the desired row
                // no specific row to be modified

                // add DataTable RowID, this will be added in the <tr> tags in each rows
                $tableData[$ctr]['DT_RowId'] = $tableData[$ctr]['site_id'];
                $tableData[$ctr]['status'] = '-';
                $tableData[$ctr]['maintenance_url'] = '-';
                /**
                 * Check if module exist to disable the
                 * minify button
                 */
                $modulePath = $cmsSiteSrv->getModulePath($tableData[$ctr]['site_name']);
                if(file_exists($modulePath)){
                    $attrArray = array('data-mod-found'   => true);
                }else{
                    $attrArray = array('data-mod-found'   => false);
                }

                //assign attribute data to table row
                $tableData[$ctr]['DT_RowAttr'] = $attrArray;
            }
        }
        // dump($tableData);
        return new JsonModel(array(
            'draw' => (int) $draw,
            'recordsTotal' => $dataCount,
            'recordsFiltered' =>  $dataFilter->count(),
            'data' => $tableData,
        ));

    }

    public function renderTableFilterLimitAction()
    {
        return new ViewModel();
    }

    public function renderTableFilterSearchAction()
    {
        return new ViewModel();
    }

    public function renderTableFilterRefreshAction()
    {
        return new ViewModel();
    }

    public function renderTableActionEditAction()
    {
        return new ViewModel();
    }

    public function renderTableActionDeleteAction()
    {
        return new ViewModel();
    }

    public function renderTableActionSwitchAction()
    {
        $params = $this->params()->fromQuery();
        return new ViewModel();
    }


    public function renderModalFormAction()
    {
        $view = new ViewModel();

        $id = $this->params()->fromQuery('id', 'add');
        $view->id = $id;

        return $view;
    }

    public function renderModalFormConfirmationAction()
    {
        $view = new ViewModel();
        $status = $this->params()->fromQuery('status', 'status');
        $view->status = $status;

        return $view;
    }

    public function deleteItemAction()
    {
        $this->getEventManager()->trigger('systemmaintenance_delete_end', $this, $this->getRequest());

        return new JsonModel([
            'success' => true,
            'textTitle' => 'tr_systemmaintenance_delete_item',
            'textMessage' => 'tr_systemmaintenance_delete_success',
        ]);
    }

    public function saveJSONAction()
    {
        $json_data = [];
        if($this->getRequest()->isPost()) {
            $siteId = $this->getRequest()->getPost('siteId');

            $file = getcwd()."/data/maintenance-503/maintenance.json";
            $data = null;
            if(file_exists($file)) {
                $data = file_get_contents($file);
                $currentData = json_decode($data);
                foreach($currentData as $key => $site) {
                    if($site->site_id == $siteId) {
                        $currentData[$key]->is_maintenance_mode = $this->getRequest()->getPost('switchStatus');
                    }
                }
                $json_data = json_encode($currentData);
                file_put_contents($file,$json_data);
            
            }
        }
        return new JsonModel([
            'data'=>$json_data
        ]);
    }
    public function getSiteJsonDataAction()
    {
        $siteId = $this->getRequest()->getPost('siteId');
        $file = getcwd()."/data/maintenance-503/maintenance.json";
        $rowData = null;
        if($this->getRequest()->isPost()) {
            $data = file_get_contents($file);
            $currentData = json_decode($data);
            if(!empty($currentData)) {
                foreach($currentData as $key => $site) {
                    $rowData['url'] = $currentData[$key]->maintenance_url;
                    $rowData['status'] = $currentData[$key]->is_maintenance_mode;
                }
            } 
        }
        return new JsonModel([
            'data' => $rowData
        ]);
    }


    public function getSiteStatusAction() 
    {
        $file = getcwd()."/data/maintenance-503/maintenance.json";
        $data = [];
        if(file_exists($file)) {
            $data = file_get_contents($file);
            $data = json_decode($data);
            
        }
        return new JsonModel($data);
    }

    public function renderTableActionTestLinkAction()
    {
        return new ViewModel();

    }

    public function renderSystemMaintenanceTabsMainAction()
    {

        $view = new ViewModel();
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $view->melisKey = $melisKey;
        return $view;
    }


}