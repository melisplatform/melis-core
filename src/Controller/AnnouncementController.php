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

class AnnouncementController extends MelisAbstractActionController
{
    const TOOL_KEY = 'melis_core_announcement_tool';

    /**
     * @return ViewModel
     */
    public function renderToolAction()
    {
//        $noAccessPrompt = '';
//
//        $translator = $this->getServiceManager()->get('translator');
//        $melisCoreRights = $this->getServiceManager()->get('MelisCoreRights');
//        if(!$melisCoreRights->canAccess($this::TOOL_KEY)) {
//            $noAccessPrompt = $translator->translate('tr_vitogaz_common_no_access');
//        }else{
//            //check if user is not dir com
//            $usrService = $this->getServiceManager()->get('VitogazUsersService');
//            $userInfo = $usrService->getLoggedInUser();
//            $rolesData = $usrService->getRoleConfigByName('DIR_COM');
//            if (! empty($userInfo)) {
//                if($userInfo->usr_role_id != $rolesData['role_id']){
//                    $noAccessPrompt = $translator->translate('tr_vitogaz_common_no_access');
//                }
//            }
//        }

        $view = new ViewModel();
//        $view->noAccess = $noAccessPrompt;
        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderToolFiltersLimitAction()
    {
        $view = new ViewModel();
        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderToolFiltersRefreshAction()
    {
        $view = new ViewModel();
        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderToolFiltersSearchAction()
    {
        $view = new ViewModel();
        return $view;
    }

    public function renderToolHeaderAction()
    {
        $view = new ViewModel();
        return $view;
    }

    public function renderToolActionDeleteAction()
    {
        $view = new ViewModel();
        return $view;
    }

    public function renderToolActionEditAction()
    {
        $view = new ViewModel();
        return $view;
    }

    public function renderToolContentAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $columns = $this->getTool()->getColumns();
        $columns['action'] =  array(
            'text' => $this->getTool()->getTranslation('tr_meliscore_global_action'),
            'css' => array('width' => '10%')
        );

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->tableColumns = $columns;
        $view->getToolDataTableConfig = $this->getTool()->getDataTableConfiguration(null, null, null, array('order' => '[[ 0, "desc" ]]'));
        return $view;
    }

    /**
     * @return JsonModel
     */
    public function getAnnouncementAction()
    {
        $announcementTable = $this->getServiceManager()->get('MelisAnnouncementTable');

        $dataCount = 0;
        $draw = 0;
        $tableData = array();

        if($this->getRequest()->isPost())
        {
            $status = $this->getRequest()->getPost('status', null);

            $melisTool = $this->getServiceManager()->get('MelisCoreTool');
            $melisTool->setMelisToolKey('meliscore', 'announcement_tool');

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

            $tableData = $announcementTable->getLists($status, $search, $melisTool->getSearchableColumns(), $start, $length, $selCol, $sortOrder)->toArray();
            $dataCount = $announcementTable->getLists($status, $search, $melisTool->getSearchableColumns(), null, null, null, 'ASC', true)->current();

            foreach ($tableData as $key => $val)
            {
                $status = '<i class="fa fa-circle text-danger"></i>';
                // Generating contact status html form
                if ($val['mca_status'])
                {
                    $status = '<i class="fa fa-circle text-success"></i>';
                }

                $tableData[$key]['mca_status'] = $status;
                $tableData[$key]['mca_date'] = $this->getTool()->dateFormatLocale($val['mca_date']);
                $tableData[$key]['mca_text'] = mb_strimwidth($val['mca_text'], 0, 50, '....');
            }
        }
        return new JsonModel(array(
            'draw' => (int) $draw,
            'recordsTotal' => count($tableData),
            'recordsFiltered' => $dataCount->totalRecords,
            'data' => $tableData,
        ));
    }

    /**
     * @return ViewModel
     */
    public function renderToolContentModalContainerAction(){
        $id = $this->params()->fromRoute('id', $this->params()->fromQuery('id', ''));
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->id = $id;
        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderToolContentModalContainerFormAction()
    {
        $id = $this->params()->fromRoute('mca_id', $this->params()->fromQuery('mca_id', ''));

        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];
        $locale = explode('_', $locale);
        $locale = $locale[0];
        $dateTimePickerFormat = 'MM/DD/YYYY HH:mm:ss';
        if($locale == 'fr')
            $dateTimePickerFormat = 'DD/MM/YYYY HH:mm:ss';

        $melisKey = $this->params()->fromRoute('melisKey', '');
        $title = $this->getTool()->getTranslation('tr_melis_core_announcement_tool_add_announcement');
        $data = array();

        $form = $this->getForm();

        $announcementTable = $this->getServiceManager()->get('MelisAnnouncementTable');

        if($id) {
            $title = $this->getTool()->getTranslation('tr_melis_core_announcement_tool_edit_announcement');
            $data = $announcementTable->getEntryById((int) $id)->current();
            $data->mca_date = $this->getTool()->dateFormatLocale($data->mca_date, 'H:i:s');
            $form->bind($data);
        }

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->id = $id;
        $view->title = $title;
        $view->form = $form;
        $view->data = $data;
        $view->dateTimePickerFormat = $dateTimePickerFormat;
        $view->locale = $locale;
        return $view;
    }

    /**
     * @return JsonModel
     */
    public function saveAnnouncementAction()
    {
        $translator = $this->getServiceManager()->get('translator');
        $success = 0;
        $textTitle = $translator->translate('tr_melis_core_announcement_tool');
        $textMessage = $translator->translate('tr_melis_core_announcement_tool_save_failed');
        $errors = array();
        $itemId = 0;
        $typeCode = 'CORE_ANNOUNCEMENT_EDIT';

        $request = $this->getRequest();
        if($request->isPost()){

            $postValues = $this->getRequest()->getPost()->toArray();
            $postValues['mca_status'] = $postValues['mca_status'] ?? 0;

            $form = $this->getForm();
            $appConfigFormElements = $this->getConfigForm();

            $form->setData($postValues);
            if($form->isValid()){
                $service = $this->getServiceManager()->get('MelisCoreAnnouncementService');
                $data = $form->getData();
                $announcementId = $data['mca_id'];
                if(empty($announcementId))
                    $typeCode = 'CORE_ANNOUNCEMENT_ADD';

                $data['mca_date'] = $this->getTool()->localeDateToSql($data['mca_date'], 'H:i:s');
                unset($data['mca_id']);
                /**
                 * Save announcement
                 */
                $result = $service->saveAnnouncement($data, $announcementId);

                if($result) {
                    $itemId = $result;
                    $success = 1;
                    $textMessage = $translator->translate('tr_melis_core_announcement_tool_save_success');
                }
            }else{
                $textMessage = $translator->translate('tr_melis_core_announcement_tool_save_failed');
                $errors = $form->getMessages();
            }

            // Preparing Error message if error occurred
            foreach ($errors as $keyError => $valueError)
            {
                foreach ($appConfigFormElements as $keyForm => $valueForm)
                {
                    if ($valueForm['spec']['name'] == $keyError && !empty($valueForm['spec']['options']['label']))
                    {
                        $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
                    }
                }
            }

        }

        $response = array(
            'success' => $success,
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'errors' => $errors,
        );

        $this->getEventManager()->trigger('meliscore_announcement_save_end', $this, array_merge($response, ['typeCode' => $typeCode, 'itemId' => $itemId]));

        return new JsonModel($response);
    }

    /**
     * @return JsonModel
     */
    public function deleteAnnouncementAction()
    {
        $translator = $this->getServiceManager()->get('translator');
        $success = 0;
        $textTitle = $translator->translate('tr_melis_core_announcement_tool_delete_title');
        $textMessage = $translator->translate('tr_melis_core_announcement_tool_delete_message_ko');
        $errors = array();
        $itemId = 0;

        $request = $this->getRequest();
        if($request->isPost()){
            $postValues = $this->getRequest()->getPost()->toArray();
            if(!empty($postValues['mca_id'])){
                $service = $this->getServiceManager()->get('MelisCoreAnnouncementService');
                $res = $service->deleteAnnouncement($postValues['mca_id']);
                if($res){
                    $itemId = $postValues['mca_id'];
                    $success = 1;
                    $textMessage = $translator->translate('tr_melis_core_announcement_tool_delete_message_ok');
                }
            }
        }

        $response = array(
            'success' => $success,
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'errors' => $errors,
        );

        $this->getEventManager()->trigger('meliscore_announcement_delete_end', $this, array_merge($response, ['typeCode' => 'CORE_ANNOUNCEMENT_DELETE', 'itemId' => $itemId]));

        return new JsonModel($response);
    }

    /**
     * @return mixed
     */
    private function getTool()
    {
        $tool = $this->getServiceManager()->get('MelisCoreTool');
        $tool->setMelisToolKey('meliscore', 'announcement_tool');

        return $tool;
    }

    /**
     * @return \Laminas\Form\FormInterface
     */
    private function getForm()
    {
        $appConfigForm = $this->getConfigForm();
        $factory = new \Laminas\Form\Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        return $factory->createForm($appConfigForm);
    }

    /**
     * @return mixed
     */
    private function getConfigForm()
    {
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        return $melisMelisCoreConfig->getFormMergedAndOrdered('meliscore/tools/announcement_tool/forms/announcement_tool_form','announcement_tool_form');
    }
}
