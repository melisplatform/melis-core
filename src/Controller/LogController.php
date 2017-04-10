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
/**
 * This class deals with the Melis Backoffice Logs
 */
class LogController extends AbstractActionController
{
    public function testFunctionAction()
    {
        $logSrv = $this->getServiceLocator()->get('MelisCoreLogService');
        
//         $result = $logSrv->getLogList();
        $result = $logSrv->getLogTypeByTypeCode('UPDATE_USER_INFO');;
        
        echo '<pre>';
        print_r($result);
        echo '<pre>';
        return new JsonModel();
    }
    
    /**
     * Render Log Tool page
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderLogsToolAction()
    {        
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        
        return $view;
    }
    
    /**
     * Render Log Tool Header
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderLogsToolHeaderAction()
    {        
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        
        return $view;
    }
    
    /**
     * Render Log Tool Content
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderLogsToolContentAction()
    {        
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        
        return $view;
    }
    
    /**
     * Render Log Tool Table
     * This will generate DataTable for Listing of Logs
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderLogsToolTableAction()
    {        
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $translator = $this->getServiceLocator()->get('translator');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('meliscore', 'meliscore_logs_tool');
        $columns = $melisTool->getColumns();
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->tableColumns = $columns;
        $view->getToolDataTableConfig = $melisTool->getDataTableConfiguration(null, null, null, array('order' => '[[ 0, "desc" ]]'));
        
        return $view;
    }
    
    /**
     * Render Log Tool Table limit
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderLogsToolTableLimitAction()
    {        
        $view = new ViewModel();
        return $view;
    }
    
    /**
     * Render Log Tool Table limit
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderLogsToolTableDateRangeAction()
    {        
        $view = new ViewModel();
        return $view;
    }
    
    /**
     * Render Log Tool Table Search
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderLogsToolTableSearchAction()
    {        
        $view = new ViewModel();
        return $view;
    }
    
    /**
     * Render Log Tool Table User Filter
     *
     * @return \Zend\View\Model\ViewModel
     */
    public function renderLogsToolTableUserFilterAction()
    {
        // Get Cureent User ID
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $userAuthDatas =  $melisCoreAuth->getStorage()->read();
        $userId = (int) $userAuthDatas->usr_id;
        
        $isAdmin = false;
        $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
        $user = $userTable->getEntryById($userId)->current();
        if (!empty($user))
        {
            if ($user->usr_admin)
            {
                $isAdmin = true;
            }
        }
        
        /**
         * If the user is Admin type this will allow to filter the result to any users,
         * else this will only show current user's logs
         */
        $selectContainer = '';
        if ($isAdmin)
        {
            $selectContainer = '%s %s';
            $translator = $this->getServiceLocator()->get('translator');
            $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
            $users = $userTable->getUserOrderByName();
            
            $select = '<select id="logUserfilter" class="form-control input-sm"> %s</select>';
            
            $selectOptions = '<option value="-1" selected>'.$translator->translate('tr_meliscore_all').'</option>';
            foreach ($users As $val)
            {
                $selectOptions .= '<option value="'.$val->usr_id.'">'.$val->usr_firstname.' '.$val->usr_lastname.'</option>';
            }
            
            $select = sprintf($select, $selectOptions);
            $selectContainer = sprintf($selectContainer, '<div class="log-user-filter" style="display: inline;">'.$translator->translate('tr_meliscore_logs_tool_log_user').'</div>', $select);
        }
        
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->select = $selectContainer;
        return $view;
    }
    
    /**
     * Render Log Tool Table Type Filter
     *
     * @return \Zend\View\Model\ViewModel
     */
    public function renderLogsToolTableTypeFilterAction()
    {
        $translator = $this->getServiceLocator()->get('translator');
        $logTypeTable = $this->getServiceLocator()->get('MelisCoreTableLogType');
        $logType = $logTypeTable->getLogTypeOrderByCode();
    
        $selectContainer = '%s %s';
        $select = '<select id="logTypefilter" class="form-control input-sm"> %s</select>';
    
        $selectOptions = '<option value="-1" selected>'.$translator->translate('tr_meliscore_all').'</option>';
        foreach ($logType As $val)
        {
            $selectOptions .= '<option value="'.$val->logt_id.'">'.$val->logt_code.'</option>';
        }
    
        $select = sprintf($select, $selectOptions);
        $selectContainer = sprintf($selectContainer, '<div class="log-type-filter" style="display: inline;">'.$translator->translate('tr_meliscore_logs_tool_log_type').'</div>', $select);
    
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->select = $selectContainer;
        return $view;
    }
    
    /**
     * Render Log Tool page Refresh Button
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderLogsToolTableRefreshAction()
    {        
        $view = new ViewModel();
        return $view;
    }
    
    /**
     * Retrieving all the list of logs for DataTable
     * 
     * @return \Zend\View\Model\JsonModel
     */
    public function getLogsAction()
    {
        $colId = array();
        $dataCount = 0;
        $recordsFiltered = 0;
        $draw = 0;
        $tableData = array();
        
        if($this->getRequest()->isPost())
        {
            // Get the locale used from meliscore session
            $container = new Container('meliscore');
            $locale = $container['melis-lang-locale'];
            
            // Get Cureent User ID
            $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
            $userAuthDatas =  $melisCoreAuth->getStorage()->read();
            $userId = (int) $userAuthDatas->usr_id;
            
            $isAdmin = false;
            $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
            $user = $userTable->getEntryById($userId)->current();
            if (!empty($user))
            {
                if ($user->usr_admin)
                {
                    $isAdmin = true;
                }
            }
            
            $translator = $this->getServiceLocator()->get('translator');
            $melisTranslation = $this->getServiceLocator()->get('MelisCoreTranslation');
            
            // Getting the table configuration from config tool
            $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
            $melisTool->setMelisToolKey('meliscore', 'meliscore_logs_tool');
            
            $melisUserTable = $this->serviceLocator->get('MelisCoreTableUser');
            
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
            
            $startDate = $this->getRequest()->getPost('startDate');
            $endDate = $this->getRequest()->getPost('endDate');
            
            /**
             * If the user is Admin type this will allow to filter the result to any users,
             * else this will only show current user's logs
             */
            $userId = ($isAdmin) ? $this->getRequest()->getPost('userId') : $userId;
            
            $typeId = $this->getRequest()->getPost('typeId');
            
            $logSrv = $this->getServiceLocator()->get('MelisCoreLogService');
            
            // Retreiving the list of logs using Log Service with filters as parameters
            $logs = $logSrv->getLogList($typeId, null, $userId, $startDate, $endDate, $start, $length, $sortOrder, $search);
            $recordsFiltered = $logSrv->getLogList($typeId, null, $userId, $startDate, $endDate, null, null, $sortOrder, $search);
            
            $logTypeBtn = '<button class="btn btn-default btn-sm logTypeButon" data-typeid="%s">%s</button>';

            foreach ($logs As $key => $val)
            {

                // Retrieving the Log Id from Log Entity
                $logId = $val->getId();
                // Retrieving the Log from Log Entity
                $log = $val->getLog();
                // Retrieving the Log Type from Log Entity
                $logType = $val->getType();
                // Retrieving the Log Type Translation from Log Entity
                $logTypeTrans = $val->getTranslations();
                
                // Retrieving the User Details
                $histUserData = $melisUserTable->getEntryById($log->log_user_id)->current();
                if (!empty($histUserData))
                {
                    $userName = ucfirst(mb_strtolower($histUserData->usr_firstname, 'UTF-8')).' '.ucfirst(mb_strtolower($histUserData->usr_lastname, 'UTF-8'));
                }
                else 
                {
                    $userName = $translator->translate('tr_meliscore_user_deleted').' ('.$log->log_user_id.')';
                }
                
                $rowData = array(
                    'DT_RowId' => $melisTool->escapeHtml($logId),
                    'log_id' => $melisTool->escapeHtml($logId),
                    'log_title' => $melisTool->escapeHtml($translator->translate($log->log_title)),
                    'log_message' => $melisTool->escapeHtml($translator->translate($log->log_message)),
                    'log_type' => sprintf($logTypeBtn, $logType->logt_id, $logType->logt_code),
                    'log_item_id' => $melisTool->escapeHtml($log->log_item_id),
                    'log_user' => $melisTool->escapeHtml($userName),
                    'log_date_added' => strftime($melisTranslation->getDateFormatByLocate($locale), strtotime($log->log_date_added))
                );
                
                array_push($tableData, $rowData);
            }


        }
        
        return new JsonModel(array(
            'draw' => (int) $draw,
            'recordsTotal' => $dataCount,
            'recordsFiltered' =>  count($recordsFiltered),
            'data' => $tableData,
        ));
    }
    
    public function renderLogsToolTableLogTypeFormAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $logId = $this->params()->fromQuery('logId');
        $logTypeId = $this->params()->fromQuery('logTypeId');
        
        $coreLang = $this->getServiceLocator()->get('MelisCoreTableLang');
        $languages = $coreLang->getLanguageInOrdered();
        
        // Getting the Site Redirect Form from Tool config
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getFormMergedAndOrdered('meliscore/tools/meliscore_logs_tool/forms/meliscore_logs_tool_log_type_form','meliscore_logs_tool_log_type_form');
        
        $factory = new \Zend\Form\Factory();
        $formElements = $this->serviceLocator->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $propertyForm = $factory->createForm($appConfigForm);
        
        $logSrv = $this->getServiceLocator()->get('MelisCoreLogService');
        $logEntity = $logSrv->getLog($logId);
        $logType = $logEntity->getType();
        $logTypeTrans = $logEntity->getTranslations();
        
        $logTypeCode = '';
        if (!empty($logType))
        {
            $logTypeCode = $logType->logt_code;
        }
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->logId = $logId;
        $view->logTypeId = $logTypeId;
        $view->languages = $languages->toArray();
        $view->logTypeCode = $logTypeCode;
        $view->logTypeTrans = $logTypeTrans;
        $view->setVariable('meliscore_logs_tool_log_type_form', $propertyForm);
        return $view;
    }
    
    public function renderLogsToolModalContainerAction()
    {
        $id = $this->params()->fromQuery('id');
        $melisKey = $this->params()->fromQuery('melisKey');
        
        $view = new ViewModel();
        $view->setTerminal(true);
        $view->id = $id;
        $view->melisKey = $melisKey;
        return $view;
    }
    
    public function saveLogTypeTransAction()
    {
        
        $request = $this->getRequest();
        
        $logTypeId = null;
        $success = 0;
        $textTitle = 'tr_meliscore_logs_type';
        $textMessage = '';
        $errors = array();
        $logTypeTrans = array();
        
        if ($request->isPost())
        {
            $postValues = get_object_vars($request->getPost());
            
            $translator = $this->getServiceLocator()->get('translator');
            $logSrv = $this->getServiceLocator()->get('MelisCoreLogService');
            
            // Getting the Site Redirect Form from Tool config
            $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
            $appConfigForm = $melisMelisCoreConfig->getFormMergedAndOrdered('meliscore/tools/meliscore_logs_tool/forms/meliscore_logs_tool_log_type_form','meliscore_logs_tool_log_type_form');
            
            $factory = new \Zend\Form\Factory();
            $formElements = $this->serviceLocator->get('FormElementManager');
            $factory->setFormElementManager($formElements);
            $propertyForm = $factory->createForm($appConfigForm);
            
            $formIds = array();
            $hasName = false;
            foreach ($postValues['logForm'] As $key => $val)
            {
                $logTypeId = $val['logtt_type_id'];
                
                $propertyForm->setData($val);
                
                if (!empty($val['logtt_name']))
                {
                    $hasName = true;
                }
                
                if ($propertyForm->isValid())
                {
                    array_push($logTypeTrans, $propertyForm->getData());
                }
                else 
                {
                    $tempErrors = $propertyForm->getMessages();
                    
                    foreach ($tempErrors as $keyError => $valueError)
                    {
                        foreach ($valueError As $eKey => $eval)
                        {
                            $errors[$keyError][$eKey] = $translator->translate($eval);
                        }
                        
                        // adding the form id's where the error occured
                        $errors[$keyError]['form'][] = $key.'_log_form';
                        
                        // Getting the error label from form config label
                        foreach ($appConfigForm['elements'] as $keyForm => $valueForm)
                        {
                            if ($valueForm['spec']['name'] == $keyError && !empty($valueForm['spec']['options']['label']))
                            {
                                $errors[$keyError]['label'] = $translator->translate($valueForm['spec']['options']['label']);
                            }
                        }
                    }
                }
                
                /**
                 * Adding all form ids,
                 * this can be use on log type name validations
                 */
                array_push($formIds, $key.'_log_form');
            }
            
            if (!$hasName)
            {
                $errors['logtt_name']['noName'] = $translator->translate('tr_meliscore_logs_tool_log_tyne_name_must_atleast_one_entry');
                // this will target all the logtt_name input for error state
                $errors['logtt_name']['form'] = $formIds;
                
                if (!isset($errors['logtt_name']['label']))
                {
                    // Getting the error label from form config label
                    foreach ($appConfigForm['elements'] as $keyForm => $valueForm)
                    {
                        if ($valueForm['spec']['name'] == 'logtt_name' && !empty($valueForm['spec']['options']['label']))
                        {
                            $errors['logtt_name']['label'] = $translator->translate($valueForm['spec']['options']['label']);
                        }
                    }
                }
            }
            
            if (empty($errors))
            {
                $success = 1;
                
                foreach ($logTypeTrans As $key => $val)
                {
                    $logTypeTransId = ($val['logtt_id']) ? $val['logtt_id'] : null;
                    
                    if (!empty($val['logtt_name']) || !empty($val['logtt_description']))
                    {
                        unset($val['logtt_id']);
                        $logSrv->saveLogTypeTrans($val, $logTypeTransId);
                    }
                    else 
                    {
                        if (!is_null($logTypeTransId))
                        {
                            $logSrv->deleteLogTypeTrans($logTypeTransId);
                        }
                    }
                }
                
                $textMessage = 'tr_meliscore_logs_tool_log_save_success';
            }
            else 
            {
                $textMessage = 'tr_meliscore_logs_tool_log_save_unable';
            }
        }
        
        $response = array(
            'success' => $success,
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'errors' => $errors
        );
        
        $this->getEventManager()->trigger('meliscore_save_log_type_trans', $this, array_merge($response, array('typeCode' => 'CORE_LOG_TYPE_UPDATE', 'itemId' => $logTypeId)));
         
        return new JsonModel($response);
    }
}