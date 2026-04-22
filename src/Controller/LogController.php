<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use DateTime;
use Laminas\View\Model\ViewModel;
use Laminas\View\Model\JsonModel;
use Laminas\Session\Container;

/**
 * This class deals with the Melis Backoffice Logs
 */
class LogController extends MelisAbstractActionController
{
    /**
     * Render Log Tool page
     *
     * @return \Laminas\View\Model\ViewModel
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
     * @return \Laminas\View\Model\ViewModel
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
     * @return \Laminas\View\Model\ViewModel
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
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderLogsToolTableAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $translator = $this->getServiceManager()->get('translator');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
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
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderLogsToolTableLimitAction()
    {
        $view = new ViewModel();
        return $view;
    }

    /**
     * Render Log Modal Container
     *
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderLogsToolModalContainerAction()
    {
        $id = $this->params()->fromQuery('id');
        $melisKey = $this->params()->fromQuery('melisKey');

        $view = new ViewModel();
        $view->setTerminal(false);
        $view->id = $id;
        $view->melisKey = $melisKey;
        return $view;
    }

    /**
     * Render Log Tool Export
     *
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderLogsToolExportAction()
    {
        $view = new ViewModel();
        return $view;
    }


    /**
     * Render Log Modal Edit Content
     *
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderLogsToolExportModalContentAction()
    {
        $appConfigForm = $this->getFormConfig('meliscore/tools/meliscore_logs_tool/forms/meliscore_logs_tool_log_export_form', 'meliscore_logs_tool_log_export_form');
        $form = $this->getForm($appConfigForm);

        $melisKey = $this->params()->fromQuery('melisKey');

        $view = new ViewModel();
        $view->form = $form;
        $view->melisKey = $melisKey;
        $view->title = "tr_meliscore_logs_tool_export_modal_title";
        return $view;
    }

    public function  validateExportLogsAction()
    {


        $textTitle = 'tr_meliscore_logs_tool_export_modal_title';
        $request = $this->getRequest();
        $textMessage = '';
        $postValues = null;
        $success = 0;
        $errors = array();

        if ($request->isPost()) {


            $logSrv = $this->getServiceManager()->get('MelisCoreLogService');
            $translator = $this->getServiceManager()->get('translator');
            $postValues = $request->getPost()->toArray();
            $container = new Container('meliscore');
            $locale = $container['melis-lang-locale'];
            $dates = array();
            $startDate = null;
            $endDate = null;

            $appConfigForm = $this->getFormConfig('meliscore/tools/meliscore_logs_tool/forms/meliscore_logs_tool_log_export_form', 'meliscore_logs_tool_log_export_form');
            $form = $this->getForm($appConfigForm);
            $form->setData($postValues);

            if ($form->isValid()) {
                $origDateFormat = $locale === "fr_FR" ? "d/m/Y" : "m/d/Y";

                if (!empty($postValues['log_date_range'])) {
                    $dates = explode(" - ", $postValues["log_date_range"]);
                }

                if (!empty($dates)) {
                    $startDate = DateTime::createFromFormat($origDateFormat, $dates[0])->format('Y-m-d');
                    $endDate = DateTime::createFromFormat($origDateFormat, $dates[1])->format('Y-m-d');
                }

                $userId = isset($postValues['log_user']) ? $postValues['log_user'] : null;
                $typeId = isset($postValues['log_type']) ? $postValues['log_type'] : null;
                $postValues['log_enclosure'] = isset($postValues['log_enclosure']) ? 1 : 0;

                // Retreiving the list of logs using Log Service with filters as parameters
                $logs = $logSrv->getLogList($typeId, null, $userId, $startDate, $endDate, null, null, "DESC", null, null);
                $logCount = \count($logs);
                if ($logCount >= 2000) {
                    $success = 2;
                    $textMessage = sprintf($translator->translate('tr_meliscore_logs_tool_export_data_over_2000'), $logCount);
                } else {
                    $success = 1;
                    $textMessage = sprintf($translator->translate('tr_meliscore_logs_tool_export_ok'), $logCount);
                }
            } else {
                $textMessage = $translator->translate('tr_meliscore_logs_tool_export_data_content_error');
                $errors = $form->getMessages();
            }
        }

        $response = array(
            'success' => $success,
            'textTitle' => $translator->translate($textTitle),
            'textMessage' => $textMessage,
            'errors' => $errors,
            'postValues' => $postValues
        );

        return new JsonModel($response);
    }
    public function  exportLogsAction()
    {

        $userTbl = $this->getServiceManager()->get('MelisCoreTableUser');
        $logTbl = $this->getServiceManager()->get('MelisCoreTableLog');
        $logSrv = $this->getServiceManager()->get('MelisCoreLogService');
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $translator = $this->getServiceManager()->get('translator');

        $request = $this->getRequest();
        $queryValues = $request->getQuery()->toArray();

        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];
        $dates = array();
        $sortedLogs = array();
        $startDate = null;
        $endDate = null;

        $origDateFormat = $locale === "fr_FR" ? "d/m/Y" : "m/d/Y";

        if (!empty($queryValues['log_date_range'])) {
            $dates = explode(" - ", $queryValues["log_date_range"]);
        }

        if (!empty($dates)) {
            $startDate = DateTime::createFromFormat($origDateFormat, $dates[0])->format('Y-m-d');
            $endDate = DateTime::createFromFormat($origDateFormat, $dates[1])->format('Y-m-d');
        }

        $userId = isset($queryValues['log_user']) ? $queryValues['log_user'] : null;
        $typeId = isset($queryValues['log_type']) ? $queryValues['log_type'] : null;
        $logDelimiter = isset($queryValues['log_delimiter']) ? $queryValues['log_delimiter'] : null;
        $isEnclosed = isset($queryValues['log_enclosure']) ? $queryValues['log_enclosure'] : null;
        // Retreiving the list of logs using Log Service with filters as parameters
        $logs = $logTbl->getLogList($typeId, null, $userId, $startDate, $endDate, null, null, "DESC", null, null);

        $logs = $logs->toArray();

        foreach ($logs as $key => $log) {
            array_push($sortedLogs, array(
                'log_id' => $log['log_id'],
                'log_date' => $log['log_date_added'],
                'log_type_name' => $translator->translate($log['log_title']),
                'log_user' => $userTbl->getEntryById($log['log_user_id'])->current()->usr_firstname . " " . $userTbl->getEntryById($log['log_user_id'])->current()->usr_lastname,
                'log_message' => $logSrv->getLogType($log['log_type_id'])->logt_code,
                'log_item_id' => $log['log_item_id'],
            ));
        }

        if (empty($sortedLogs))
            $sortedLogs = array(array());

        return $melisTool->exportDataToCsv($sortedLogs, date("Y-m-d_H:i:s") . "_MelisPlatform_LogExport.csv", $logDelimiter, $isEnclosed);
    }

    /**
     * Render Log Tool Table limit
     *
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderLogsToolTableDateRangeAction()
    {
        $view = new ViewModel();
        return $view;
    }

    /**
     * Render Log Tool Table Search
     *
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderLogsToolTableSearchAction()
    {
        $view = new ViewModel();
        return $view;
    }

    /**
     * Render Log Tool Table User Filter
     *
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderLogsToolTableUserFilterAction()
    {
        // Get Cureent User ID
        $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
        $userId        = null;

        if ($melisCoreAuth->hasIdentity()) {
            $userAuthDatas =  $melisCoreAuth->getStorage()->read();

            if ($userAuthDatas) {
                $userId = (int) $userAuthDatas->usr_id;
            }
        }


        $isAdmin = false;
        $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
        $user = $userTable->getEntryById($userId)->current();
        if (!empty($user)) {
            if ($user->usr_admin) {
                $isAdmin = true;
            }
        }

        /**
         * If the user is Admin type this will allow to filter the result to any users,
         * else this will only show current user's logs
         */
        $selectContainer = '';
        if ($isAdmin) {
            $selectContainer = '%s %s';
            $translator = $this->getServiceManager()->get('translator');
            $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
            $users = $userTable->getUserOrderByName();

            $select = '<select id="logUserfilter" class="form-control input-sm"> %s</select>';

            $selectOptions = '<option value="-1" selected>' . $translator->translate('tr_meliscore_all') . '</option>';
            foreach ($users as $val) {
                $selectOptions .= '<option value="' . $val->usr_id . '">' . $val->usr_firstname . ' ' . $val->usr_lastname . '</option>';
            }

            $select = sprintf($select, $selectOptions);
            $selectContainer = sprintf($selectContainer, '<div class="log-user-filter" style="display: inline;">' . $translator->translate('tr_meliscore_logs_tool_log_user') . '</div>', $select);
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
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderLogsToolTableTypeFilterAction()
    {
        $translator = $this->getServiceManager()->get('translator');
        $logTypeTable = $this->getServiceManager()->get('MelisCoreTableLogType');
        $logType = $logTypeTable->getLogTypeOrderByCode();

        $selectContainer = '%s %s';
        $select = '<select id="logTypefilter" class="form-control input-sm"> %s</select>';

        $selectOptions = '<option value="-1" selected>' . $translator->translate('tr_meliscore_all') . '</option>';
        foreach ($logType as $val) {
            $selectOptions .= '<option value="' . $val->logt_id . '">' . $val->logt_code . '</option>';
        }

        $select = sprintf($select, $selectOptions);
        $selectContainer = sprintf($selectContainer, '<div class="log-type-filter" style="display: inline;">' . $translator->translate('tr_meliscore_logs_tool_log_type') . '</div>', $select);

        $melisKey = $this->params()->fromRoute('melisKey', '');
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->select = $selectContainer;
        return $view;
    }

    /**
     * Render Log Tool page Refresh Button
     *
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderLogsToolTableRefreshAction()
    {
        $view = new ViewModel();
        return $view;
    }
    public function getEventLogsAction()
    {
        $colId = array();
        $dataCount = 0;
        $recordsFiltered = 0;
        $draw = 0;
        $tableData = array();

        if ($this->getRequest()->isPost()) {
            // Get the locale used from meliscore session
            $container = new Container('meliscore');
            $locale = $container['melis-lang-locale'];

            // Get Cureent User ID
            $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
            $userAuthDatas =  $melisCoreAuth->getStorage()->read();
            $userId = (int) $userAuthDatas->usr_id;

            /**
             * If the user is Admin type this will allow to filter the result to any users,
             * else this will only show current user's logs
             */
            $userId = ($isAdmin) ? $this->getRequest()->getPost('userId') : $userId;

            $typeId = $this->getRequest()->getPost('typeId');

            $logSrv = $this->getServiceManager()->get('MelisCoreLogService');
        }

        return new JsonModel(array(
            'draw' => (int) $draw,
            'recordsTotal' => "",
            'recordsFiltered' =>  count($recordsFiltered),
            'data' => $tableData,
        ));
    }

    /**
     * Retrieving all the list of logs for DataTable
     *
     * @return \Laminas\View\Model\JsonModel
     */
    public function getLogsAction()
    {
        $colId = array();
        $dataCount = 0;
        $recordsFiltered = 0;
        $draw = 0;
        $tableData = array();

        if ($this->getRequest()->isPost()) {
            // Get the locale used from meliscore session
            $container = new Container('meliscore');
            $locale = $container['melis-lang-locale'];

            // Get Cureent User ID
            $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
            $userAuthDatas =  $melisCoreAuth->getStorage()->read();
            $userId = (int) $userAuthDatas->usr_id;

            $isAdmin = false;
            $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
            $user = $userTable->getEntryById($userId)->current();
            if (!empty($user)) {
                if ($user->usr_admin) {
                    $isAdmin = true;
                }
            }

            $translator = $this->getServiceManager()->get('translator');
            $melisTranslation = $this->getServiceManager()->get('MelisCoreTranslation');

            // Getting the table configuration from config tool
            $melisTool = $this->getServiceManager()->get('MelisCoreTool');
            $melisTool->setMelisToolKey('meliscore', 'meliscore_logs_tool');

            $melisUserTable = $this->getServiceManager()->get('MelisCoreTableUser');

            $colId = array_keys($melisTool->getColumns());

            $sortOrder = $this->getRequest()->getPost('order');
            $sortOrder = $sortOrder[0]['dir'];

            $selCol = $this->getRequest()->getPost('order');
            $selCol = $colId[$selCol[0]['column']];

            $draw = $this->getRequest()->getPost('draw');

            $start = $this->getRequest()->getPost('start');
            $length =  $this->getRequest()->getPost('length');

            $search = $this->getRequest()->getPost('search');
            $search = !empty($search['value']) ? $search['value'] : null;

            $startDate = $this->getRequest()->getPost('startDate') ?: null;
            $endDate   = $this->getRequest()->getPost('endDate') ?: null;

            /**
             * If the user is Admin type this will allow to filter the result to any users,
             * else this will only show current user's logs
             */
            $userId = ($isAdmin) ? $this->getRequest()->getPost('userId') : $userId;

            $typeId = $this->getRequest()->getPost('typeId');

            $logSrv = $this->getServiceManager()->get('MelisCoreLogService');

            // Single COUNT query for DataTables totals
            $dataCount       = $logSrv->getLogCount($typeId, null, $userId, $startDate, $endDate, $search);
            $recordsFiltered = $dataCount;

            // Paginated fetch — only the rows needed for this page
            $logs = $logSrv->getLogList($typeId, null, $userId, $startDate, $endDate, $start, $length, $sortOrder, $search, null);

            // Batch-load users for this page (deduplicated — avoids N+1 user queries)
            $pageUserIds = array_unique(array_map(fn($v) => $v->getLog()->log_user_id, $logs));
            $usersMap    = [];
            foreach ($pageUserIds as $uid) {
                $userData = $melisUserTable->getEntryById($uid)->current();
                $usersMap[$uid] = !empty($userData)
                    ? ucfirst(mb_strtolower($userData->usr_firstname, 'UTF-8')) . ' ' . ucfirst(mb_strtolower($userData->usr_lastname, 'UTF-8'))
                    : $translator->translate('tr_meliscore_user_deleted') . ' (' . $uid . ')';
            }

            $logTypeBtn = '<button class="btn btn-default btn-sm logTypeButon" data-typeid="%s">%s</button>';

            foreach ($logs as $val) {
                $logId   = $val->getId();
                $log     = $val->getLog();
                $logType = $val->getType();

                $translatedMessage = $melisTool->escapeHtml($translator->translate($log->log_message));
                if (strpos($translatedMessage, '[itemId]') !== false) {
                    $translatedMessage = str_replace('[itemId]', $melisTool->escapeHtml($log->log_item_id), $translatedMessage);
                }

                array_push($tableData, array(
                    'DT_RowId'       => $melisTool->escapeHtml($logId),
                    'log_id'         => $melisTool->escapeHtml($logId),
                    'log_title'      => $melisTool->escapeHtml($translator->translate($log->log_title)),
                    'log_message'    => $translatedMessage,
                    'log_type'       => sprintf($logTypeBtn, $logType->logt_id, $logType->logt_code),
                    'log_item_id'    => $melisTool->escapeHtml($log->log_item_id),
                    'log_user'       => $melisTool->escapeHtml($usersMap[$log->log_user_id] ?? ''),
                    'log_date_added' => date($melisTranslation->getDateFormatByLocate($locale), strtotime($log->log_date_added)),
                ));
            }
        }

        return new JsonModel(array(
            'draw'            => (int) $draw,
            'recordsTotal'    => $dataCount,
            'recordsFiltered' => $recordsFiltered,
            'data'            => $tableData,
        ));
    }

    public function renderLogsToolTableLogTypeFormAction()
    {
        $melisKey  = $this->params()->fromRoute('melisKey', '');
        $logTypeId = $this->params()->fromQuery('logTypeId');

        $languages = $this->getServiceManager()->get('MelisCoreTableLang')->getLanguageInOrdered();

        $propertyForm = $this->getForm($this->getFormConfig(
            'meliscore/tools/meliscore_logs_tool/forms/meliscore_logs_tool_log_type_form',
            'meliscore_logs_tool_log_type_form'
        ));

        $logTypeTable = $this->getServiceManager()->get('MelisCoreTableLogType');
        $logTypeTransTable = $this->getServiceManager()->get('MelisCoreTableLogTypeTrans');

        $logType      = !empty($logTypeId) ? $logTypeTable->getEntryById($logTypeId)->current() : null;
        $logTypeTrans = [];
        if (!empty($logTypeId)) {
            foreach ($logTypeTransTable->getLogTypeTranslations($logTypeId) as $t) {
                $logTypeTrans[] = $t;
            }
        }

        $view = new ViewModel();
        $view->melisKey     = $melisKey;
        $view->logTypeId    = $logTypeId;
        $view->languages    = $languages->toArray();
        $view->logTypeCode  = !empty($logType) ? $logType->logt_code : '';
        $view->logTypeTrans = $logTypeTrans;
        $view->setVariable('meliscore_logs_tool_log_type_form', $propertyForm);
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

        if ($request->isPost()) {
            $postValues = $request->getPost()->toArray();

            $translator = $this->getServiceManager()->get('translator');
            $logSrv = $this->getServiceManager()->get('MelisCoreLogService');

            // Getting the Site Redirect Form from Tool config
            $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
            $appConfigForm = $melisMelisCoreConfig->getFormMergedAndOrdered('meliscore/tools/meliscore_logs_tool/forms/meliscore_logs_tool_log_type_form', 'meliscore_logs_tool_log_type_form');

            $factory = new \Laminas\Form\Factory();
            $formElements = $this->getServiceManager()->get('FormElementManager');
            $factory->setFormElementManager($formElements);
            $propertyForm = $factory->createForm($appConfigForm);

            $formIds = array();
            $hasName = false;
            foreach ($postValues['logForm'] as $key => $val) {
                $logTypeId = $val['logtt_type_id'];

                $propertyForm->setData($val);

                if (!empty($val['logtt_name'])) {
                    $hasName = true;
                }

                if ($propertyForm->isValid()) {
                    array_push($logTypeTrans, $propertyForm->getData());
                } else {
                    $tempErrors = $propertyForm->getMessages();

                    foreach ($tempErrors as $keyError => $valueError) {
                        foreach ($valueError as $eKey => $eval) {
                            $errors[$keyError][$eKey] = $translator->translate($eval);
                        }

                        // adding the form id's where the error occured
                        $errors[$keyError]['form'][] = $key . '_log_form';

                        // Getting the error label from form config label
                        foreach ($appConfigForm['elements'] as $keyForm => $valueForm) {
                            if ($valueForm['spec']['name'] == $keyError && !empty($valueForm['spec']['options']['label'])) {
                                $errors[$keyError]['label'] = $translator->translate($valueForm['spec']['options']['label']);
                            }
                        }
                    }
                }

                /**
                 * Adding all form ids,
                 * this can be use on log type name validations
                 */
                array_push($formIds, $key . '_log_form');
            }

            if (!$hasName) {
                $errors['logtt_name']['noName'] = $translator->translate('tr_meliscore_logs_tool_log_tyne_name_must_atleast_one_entry');
                // this will target all the logtt_name input for error state
                $errors['logtt_name']['form'] = $formIds;

                if (!isset($errors['logtt_name']['label'])) {
                    // Getting the error label from form config label
                    foreach ($appConfigForm['elements'] as $keyForm => $valueForm) {
                        if ($valueForm['spec']['name'] == 'logtt_name' && !empty($valueForm['spec']['options']['label'])) {
                            $errors['logtt_name']['label'] = $translator->translate($valueForm['spec']['options']['label']);
                        }
                    }
                }
            }

            if (empty($errors)) {
                $success = 1;

                foreach ($logTypeTrans as $key => $val) {
                    $logTypeTransId = ($val['logtt_id']) ? $val['logtt_id'] : null;

                    if (!empty($val['logtt_name']) || !empty($val['logtt_description'])) {
                        unset($val['logtt_id']);
                        $logSrv->saveLogTypeTrans($val, $logTypeTransId);
                    } else {
                        if (!is_null($logTypeTransId)) {
                            $logSrv->deleteLogTypeTrans($logTypeTransId);
                        }
                    }
                }

                $textMessage = 'tr_meliscore_logs_tool_log_save_success';
            } else {
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
    /**
     * This will get the form config
     * @param $formPath
     * @param $form
     * @return mixed
     */
    private function getFormConfig($formPath, $form)
    {
        $melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisCoreConfig->getFormMergedAndOrdered($formPath, $form);

        return $appConfigForm;
    }
    /**
     * Gets the form
     * @param formConfig
     * @return \Laminas\Form\ElementInterface
     */
    private function getForm($formConfig)
    {
        $factory = new \Laminas\Form\Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $form = $factory->createForm($formConfig);

        return $form;
    }
}
