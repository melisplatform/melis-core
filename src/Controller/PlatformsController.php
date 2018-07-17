<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Zend\Session\Container;
use MelisCore\Service\MelisCoreRightsService;
/**
 * Platform Tool
 */
class PlatformsController extends AbstractActionController
{
    const TOOL_INDEX = 'meliscore';
    const TOOL_KEY = 'meliscore_platform_tool';
    const INTERFACE_KEY = 'meliscore_tool_platform';
    
    public function renderPlatformContainerAction()
    {
        $translator = $this->getServiceLocator()->get('translator');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $noAccessPrompt = '';
        
        if(!$this->hasAccess(self::INTERFACE_KEY)) {
            $noAccessPrompt = $translator->translate('tr_tool_no_access');
        }
        
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        
        return $view;
    }
    
    public function renderPlatformHeaderContainerAction()
    {
        $translator = $this->getServiceLocator()->get('translator');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $zoneConfig = $this->params()->fromRoute('zoneconfig', array());

        $view = new ViewModel();
        $view->title = $translator->translate('tr_meliscore_tool_platform_title');
        $view->melisKey = $melisKey;
    
        return $view;
    }
    
    public function renderPlatformHeaderAddAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        
        return $view;
    }
    
    public function renderPlatformContentAction()
    {
        $translator = $this->getServiceLocator()->get('translator');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
        
        
        $columns = $melisTool->getColumns();
        // pre-add Action Columns
        $columns['actions'] = array('text' => $translator->translate('tr_meliscore_global_action'));
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->tableColumns = $columns;
        $view->getToolDataTableConfig = $melisTool->getDataTableConfiguration();
        
        
        return $view;
    }
    
    /**
     * Renders to the Edit button inside the table content (Action column)
     * @return \Zend\View\Model\ViewModel
     */
    public function renderPlatformContentActionEditAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
    
        $view = new ViewModel();
        $view->melisKey = $melisKey;
    
        return $view;
    }
    
    /**
     * Renders to the Delete button inside the table content (Action column)
     * @return \Zend\View\Model\ViewModel
     */
    public function renderPlatformContentActionDeleteAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
    
        $view = new ViewModel();
        $view->melisKey = $melisKey;
    
        return $view;
    }
    
    /**
     * Renders to the refresh button placed in the datatable
     * @return \Zend\View\Model\ViewModel
     */
    public function renderPlatformContentFiltersRefreshAction()
    {
        return new ViewModel();
    }
    
    /**
     * Renders to the search button placed in the datatable
     * @return \Zend\View\Model\ViewModel
     */
    public function renderPlatformContentFiltersSearchAction()
    {
        return new ViewModel();
    }
    
    /**
     * Renders to the limit button placed in the datatable
     * @return \Zend\View\Model\ViewModel
     */
    public function renderPlatformContentFiltersLimitAction()
    {
        return new ViewModel();
    }
    
    /**
     * Renders the Generic form of the Platform 
     * for creating new and updating new platform
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderPlatformGenericFormAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        
        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
        
        $platformForm = $melisTool->getForm('meliscore_platform_generic_form');
        
        $plfId = $this->params()->fromQuery('plf_id', '');
        
        if ($plfId)
        {
            $platformTable = $this->getServiceLocator()->get('MelisCoreTablePlatform');
            
            $platform = $platformTable->getEntryById($plfId)->current();
            
            if (!empty($platform))
            {
                $platformForm->bind($platform);
                
                if (getenv('MELIS_PLATFORM') == $platform->plf_name)
                {
                    // Deactivating the platform name if the current platform is same to the requested platform
                    $platformForm->get('plf_name')->setAttribute('disabled', true);
                }
            }
        }
        
        $view = new ViewModel();
        $view->meliscore_platform_generic_form = $platformForm;
        $view->melisKey = $melisKey;
        $view->platformId = $plfId;
        return $view;
    }
    
    /**
     * This method return the list of core platform available
     * 
     * @return \Zend\View\Model\JsonModel
     */
    public function getPlatformsAction()
    {
        $platformTable = $this->getServiceLocator()->get('MelisCoreTablePlatform');
        $translator = $this->getServiceLocator()->get('translator');
        
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
        
        $colId = array();
        $dataCount = 0;
        $draw = 0;
        $tableData = array();
        
        if($this->getRequest()->isPost()) {
        
            $colId = array_keys($melisTool->getColumns());
        
            $sortOrder = $this->getRequest()->getPost('order');
            $sortOrder = $sortOrder[0]['dir'];
        
            $selCol = $this->getRequest()->getPost('order');
            $selCol = $colId[$selCol[0]['column']];
        
            $draw = $this->getRequest()->getPost('draw');
        
            $start = $this->getRequest()->getPost('start');
            $length =  $this->getRequest()->getPost('length');
        
            $search = $this->getRequest()->getPost('search');
            $search = $search['value'];
        
            $dataCount = $platformTable->getTotalData();
        
            $getData = $platformTable->getPagedData(array(
                'where' => array(
                    'key' => 'plf_id',
                    'value' => $search,
                ),
                'order' => array(
                    'key' => $selCol,
                    'dir' => $sortOrder,
                ),
                'start' => $start,
                'limit' => $length,
                'columns' => $melisTool->getSearchableColumns(),
                'date_filter' => array()
            ));
        
            $tableData = $getData->toArray();
            for($ctr = 0; $ctr < count($tableData); $ctr++)
            {
                // apply text limits
                foreach($tableData[$ctr] as $vKey => $vValue)
                {
                    $tableData[$ctr][$vKey] = $melisTool->limitedText($vValue);
                }
                
                // Updating marketplace status
                $marketPlaceIconn = '<i class="fa fa-fw fa-circle text-success"></i>';
                if (!$tableData[$ctr]['plf_update_marketplace'])
                {
                    $marketPlaceIconn = '<i class="fa fa-fw fa-circle text-danger"></i>';
                }
                $tableData[$ctr]['plf_update_marketplace'] = $marketPlaceIconn;
                
                // Adding class flag to remove the delete button of the current Platform
                if (getenv('MELIS_PLATFORM') == $tableData[$ctr]['plf_name']){
                    $tableData[$ctr]['DT_RowClass'] = 'noPlatformDeleteBtn';
                }
                
                // add DataTable RowID, this will be added in the <tr> tags in each rows
                $tableData[$ctr]['DT_RowId'] = $tableData[$ctr]['plf_id'];
            }
        }
        
        return new JsonModel(array(
            'draw' => (int) $draw,
            'recordsTotal' => $dataCount,
            'recordsFiltered' =>  $platformTable->getTotalFiltered(),
            'data' => $tableData,
        ));
    }
    
    /**
     * This method saving the platform info
     * this include adding and updating platform
     * 
     * @return \Zend\View\Model\JsonModel
     */
    public function savePlatformAction() 
    {
        $response = array();
        $this->getEventManager()->trigger('meliscore_platform_save_start', $this, $response);
        $platformTable = $this->getServiceLocator()->get('MelisCoreTablePlatform');
        $translator = $this->getServiceLocator()->get('translator');
        
        $request = $this->getRequest();
        $success = 0;
        $errors  = array();
        $textTitle = 'tr_meliscore_tool_platform_title';
        $textMessage = '';
        
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
        $id = 0;
        $form = $melisTool->getForm('meliscore_platform_generic_form');
        if($request->isPost()) {
            
            $postValues = get_object_vars($this->getRequest()->getPost());
            
            $textMessage = 'tr_meliscore_tool_platform_prompts_new_failed';
            $logCode = 'CORE_PLATFORM_ADD';
            if (!empty($postValues['plf_id']))
            {
                $id = $postValues['plf_id'];
                $textMessage = 'tr_meliscore_tool_platform_prompts_edit_failed';
                $logCode = 'CORE_PLATFORM_UPDATE';
            }
            
            $postValues = $melisTool->sanitizePost($postValues);
            
            $data = array();
            
            if (!empty($postValues['plf_id']) && !isset($postValues['plf_name']))
            {
                $platform = $platformTable->getEntryById($postValues['plf_id'])->current();
                $postValues['plf_name'] = $platform->plf_name;
            }
            elseif (!empty($postValues['plf_name']))
            {
                $platform = $platformTable->getEntryByField('plf_name', $postValues['plf_name'])->current();
                
                if (!empty($platform))
                {
                    $exist = false;
                    
                    if (!empty($postValues['plf_id']))
                    {
                        if ($postValues['plf_id'] != $platform->plf_id && $postValues['plf_name'] == $platform->plf_name)
                        {
                            $exist = true;
                        }
                    }
                    else
                    {
                        if ($postValues['plf_name'] == $platform->plf_name)
                        {
                            $exist = true;
                        }
                    }
                    
                    if ($exist)
                    {
                        $errors = array(
                            'plf_name' => array(
                                'platform_exists' => $translator->translate('tr_meliscore_tool_platform_prompts_new_exists')
                            ),
                        );
                        
                        $form->setMessages($errors);
                    }
                }
            }
                
            $form->setData($postValues);
            
            if($form->isValid() && empty($errors)) {
                $data = $form->getData();
                $data['plf_update_marketplace'] = $data['plf_update_marketplace'] ?? '';

                $textMessage = 'tr_meliscore_tool_platform_prompts_new_success';
                if ($id) {
                    $textMessage = 'tr_meliscore_tool_platform_prompts_edit_success';
                }
                
                $id = $platformTable->save($data, $id);
                $success = 1;
            } else  {
                $errors = $form->getMessages();
            }
            
            $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
            $appConfigForm = $melisMelisCoreConfig->getItem('meliscore/tools/meliscore_platform_tool/forms/meliscore_platform_generic_form');
            $appConfigForm = $appConfigForm['elements'];
            
            foreach ($errors as $keyError => $valueError) {
                foreach ($appConfigForm as $keyForm => $valueForm) {
                    if ($valueForm['spec']['name'] == $keyError && !empty($valueForm['spec']['options']['label'])) {
                        $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
                    }
                }
            }
        }
        
        $response = array(
            'success' => $success,
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'errors' => $errors
        );
        
        $this->getEventManager()->trigger('meliscore_platform_save_end', $this, array_merge($response, array('typeCode' => $logCode, 'itemId' => $id, 'id' => $id)));
         
        return new JsonModel($response);
    }
    
    /**
     * Deletion of the platform
     * 
     * @return \Zend\View\Model\JsonModel
     */
    public function deletePlatformAction()
    {
        $response = array();
        $this->getEventManager()->trigger('meliscore_platform_delete_start', $this, $response);
        $translator = $this->getServiceLocator()->get('translator');
        $platformTable = $this->getServiceLocator()->get('MelisCoreTablePlatform');
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
        
        $textTitle = 'tr_meliscore_tool_platform_title';
        $textMessage = 'tr_meliscore_tool_platform_prompts_delete_failed';
        
        $id = 0;
        $success = 0;
        $platform = '';
        
        if($this->getRequest()->isPost())
        {
            $id = (int) $this->getRequest()->getPost('id');
            if(is_numeric($id))
            {
                $domainData = $platformTable->getEntryById($id);
                $domainData = $domainData->current();
                if(!empty($domainData)) 
                {
                    $platform = $domainData->plf_name;
                    $platformTable->deleteById($id);
                    $textMessage = 'tr_meliscore_tool_platform_prompts_delete_success';
                    $success = 1;
                }
            }
        }
        
        $response = array(
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'success' => $success
        );
        
        $eventData = array_merge($response, array(
            'platform' => $platform,
            'id' => $id,
            'typeCode' => 'CORE_PLATFORM_DELETE',
            'itemId' => $id
        ));
        
        $this->getEventManager()->trigger('meliscore_platform_delete_end', $this, $eventData);
        
        return new JsonModel($response);
    }
    public function removePlatformByIdAction()
    {
        $data = array();
        if($this->getRequest()->isPost())
        {
            $platformId = $this->getRequest()->getPost('id');
            $platformTable = $this->getServiceLocator()->get('MelisCoreTablePlatform');

            $platformData = $data;
            foreach($platformData as $roleKey => $roleValues) {
                $data[$roleKey] = $roleValues;
            }

        }
        return new JsonModel(array(
            'platform' =>  $data
        ));
    }
    
    public function getCurrentPlatformAction()
    {
        $data = array();
        if($this->getRequest()->isXmlHttpRequest()) {
            $data = array(
               'env' => getenv('MELIS_PLATFORM')
            );
        }
        return new JsonModel($data);
    }

    /**
     * Checks whether the user has access to this tools or not
     * @param $key
     * @return bool
     */
    private function hasAccess($key): bool
    {
        $hasAccess = $this->getServiceLocator()->get('MelisCoreRights')->canAccessTool($key);

        return $hasAccess;
    }

}