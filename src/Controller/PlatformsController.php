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
        $columns['actions'] = array('text' => $translator->translate('tr_meliscms_action'));
        
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
    
    public function renderPlatformModalsContainerAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        
        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->emptyModal = $melisTool->getModal('meliscore_platform_modal_handler_empty');
        
        return $view;
    }
    
    public function renderPlatformModalsHandlerEmptyAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        
        return $view;
    }
    
    public function renderPlatformModalsHandlerAddAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        
        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->addModalHandler = $melisTool->getModal('meliscore_platform_modal_content_new');
        
        return $view;
    }
    
    public function renderPlatformModalsContentAddAction()
    {
        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
    
        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
    
        $view = new ViewModel();
    
        $view->setVariable('meliscore_platform_generic_form', $melisTool->getForm('meliscore_platform_generic_form'));
    
        return $view;
    }
    
    public function renderPlatformModalsHandlerEditAction()
    { 
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        
        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->editModalHandler = $melisTool->getModal('meliscore_platform_modal_content_edit');
        
        return $view;
    }
    
    public function renderPlatformModalsContentEditAction()
    {
        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
    
        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
    
        $view = new ViewModel();
    
        $view->setVariable('meliscore_platform_generic_form', $melisTool->getForm('meliscore_platform_generic_form'));
    
        return $view;
    }
    
    
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
        
                // manually modify value of the desired row
                // no specific row to be modified
        
        
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
    
    public function getPlatformByIdAction()
    {
        $data = array();
        if($this->getRequest()->isPost())
        {
            $platformId = $this->getRequest()->getPost('id');
            $platformTable = $this->getServiceLocator()->get('MelisCoreTablePlatform');
        
            $platformData = $platformTable->getEntryById($platformId)->current();
            foreach($platformData as $roleKey => $roleValues) {
                $data[$roleKey] = $roleValues;
            }

        }
        return new JsonModel(array(
            'platform' =>  $data
        ));
    }
    
    public function addPlatformAction() 
    {
        $response = array();
        $this->getEventManager()->trigger('meliscore_platform_new_start', $this, $response);
        $platformTable = $this->getServiceLocator()->get('MelisCoreTablePlatform');
        $translator = $this->getServiceLocator()->get('translator');
        
        $success = 0;
        $errors  = array();
        $textTitle = 'tr_meliscore_tool_platform_title';
        $textMessage = 'tr_meliscore_tool_platform_prompts_new_failed';
        
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
        $id = 0;
        $form = $melisTool->getForm('meliscore_platform_generic_form');
        if($this->getRequest()->isPost()) {
            
            $postValues = get_object_vars($this->getRequest()->getPost());
            $postValues = $melisTool->sanitizePost($postValues);
            $form->setData($postValues);
            
            if($form->isValid()) {
                
                $data = $form->getData();
                $isExistData = $platformTable->getEntryByField('plf_name', $data['plf_name']);
                $isExistData = $isExistData->current();
                if(empty($isExistData)) {
                    
                    $id = $platformTable->save($data);
                    $textMessage = 'tr_meliscore_tool_platform_prompts_new_success';
                    $success = 1;
                }
                else {
                    $errors = array(
                        'plf_name' => array(
                            'platform_exists' => $translator->translate('tr_meliscore_tool_platform_prompts_new_exists')
                        ),
                    );
                }

            }
            else {
                $errors = $form->getMessages();
            }
            
            $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
            $appConfigForm = $melisMelisCoreConfig->getItem('meliscore/tools/meliscore_platform_tool/forms/meliscore_platform_generic_form');
            $appConfigForm = $appConfigForm['elements'];
            
            foreach ($errors as $keyError => $valueError)
            {
                foreach ($appConfigForm as $keyForm => $valueForm)
                {
                    if ($valueForm['spec']['name'] == $keyError &&
                        !empty($valueForm['spec']['options']['label']))
                        $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
                }
            }
        }
        
        $response = array(
            'success' => $success,
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'errors' => $errors
        );
        
        $this->getEventManager()->trigger('meliscore_platform_new_end', $this, array_merge($response, array('typeCode' => 'CORE_PLATFORM_ADD', 'itemId' => $id, 'id' => $id)));
         
        return new JsonModel($response);
    }
    
    public function editPlatformAction()
    {
        $response = array();
        $this->getEventManager()->trigger('meliscore_platform_update_start', $this, $response);
        $platformTable = $this->getServiceLocator()->get('MelisCoreTablePlatform');
        $translator = $this->getServiceLocator()->get('translator');
        
        $id = null;
        $success = 0;
        $errors  = array();
        $textTitle = 'tr_meliscore_tool_platform_title';
        $textMessage = 'tr_meliscore_tool_platform_prompts_edit_failed';
        
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
        
        $form = $melisTool->getForm('meliscore_platform_generic_form');
        
        if($this->getRequest()->isPost()) {
        
            $postValues = get_object_vars($this->getRequest()->getPost());
            $postValues = $melisTool->sanitizePost($postValues);
            $form->setData($postValues);
        
            $id = $postValues['id'];
            
            if($form->isValid()) {
                $data = $form->getData();
                $data['plf_id'] = $id;
                $platformTable->save($data, $id);
                $textMessage = 'tr_meliscore_tool_platform_prompts_edit_success';
                $success = 1;
            }
            else {
                $errors = $form->getMessages();
            }
        
            $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
            $appConfigForm = $melisMelisCoreConfig->getItem('meliscore/tools/meliscore_platform_tool/forms/meliscore_platform_generic_form');
            $appConfigForm = $appConfigForm['elements'];
        
            foreach ($errors as $keyError => $valueError)
            {
                foreach ($appConfigForm as $keyForm => $valueForm)
                {
                    if ($valueForm['spec']['name'] == $keyError &&
                        !empty($valueForm['spec']['options']['label']))
                        $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
                }
            }
        }
        
        $response = array(
            'success' => $success,
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'errors' => $errors
        );
        
        $this->getEventManager()->trigger('meliscore_platform_update_end', $this, array_merge($response, array('typeCode' => 'CORE_PLATFORM_UPDATE', 'itemId' => $id)));
         
        return new JsonModel($response);
    }
    
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
     * Checks wether the user has access to this tools or not
     * @return boolean
     */
    private function hasAccess($key)
    {
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
        $xmlRights = $melisCoreAuth->getAuthRights();
    
        $isAccessible = $melisCoreRights->isAccessible($xmlRights, MelisCoreRightsService::MELISCORE_PREFIX_TOOLS, $key);
    
        return $isAccessible;
    }
}