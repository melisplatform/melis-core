<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Laminas\View\Model\ViewModel;
use Laminas\View\Model\JsonModel;
use Laminas\Session\Container;
use MelisCore\Controller\MelisAbstractActionController;

class SystemMaintenancePropertiesController extends MelisAbstractActionController
{

    public function renderPropertiesFormAction()
    {

        $view = new ViewModel();
        $form = $this->getForm();
        $id = $this->params()->fromQuery('id', '');
        $view->id = $id;

        $file = getcwd()."/data/maintenance-503/maintenance.json";
        $rowData = [];
        if(file_exists($file)) {
            $data = file_get_contents($file);
            $currentData = json_decode($data);
    
            if(!empty($currentData)) {
    
                foreach($currentData as $key => $site) {
                        if($currentData[$key]->site_id == $id) {
                        $rowData['site_id'] = $id;
                        $rowData['maintenance_url'] = $currentData[$key]->maintenance_url;
                        $rowData['is_maintenance_mode'] = $currentData[$key]->is_maintenance_mode;
                    }
                }
            }     
        }

        if ($id != 'add'){
            $systemmaintenanceTable = $this->getServiceManager()->get('SystemmaintenanceTable');
            $data = $systemmaintenanceTable->getEntryById($id)->current();
            $form->setData($rowData);
        }

        $view->form = $form;

        return $view;
    }

    public function saveAction()
    {
        $translator = $this->getServiceManager()->get('translator');

        $success = 0;
        $textTitle = $translator->translate('tr_systemmaintenance_title');
        $textMessage = $translator->translate('tr_systemmaintenance_unable_to_save');
        $errors = [];

        $request = $this->getRequest();
        $id = null;
        $entryTitle = null;

        if ($request->isPost()){

            $this->getEventManager()->trigger('systemmaintenance_properties_save_start', $this, $request);

            // Result stored on session
            $container = new Container('MelisCore');
            $saveResult = $container['systemmaintenance-save-action'];

            if (!empty($saveResult['errors']))
                $errors = $saveResult['errors'];
            if (!empty($saveResult['data']))
                $data = $saveResult['data'];

            if (empty($errors)){
                $id = $data['id'];
                $success = 1;

                $entryTitle = $translator->translate('tr_systemmaintenance_common_entry_id').': '.$id;

                if ($request->getPost()['site_id'] == 'add')
                    $textMessage = $translator->translate('tr_systemmaintenance_create_success');
                else
                    $textMessage = $translator->translate('tr_systemmaintenance_save_success');
            }

            // Unset temporary data on session
            unset($container['systemmaintenance-save-action']);
        }

        $response = [
            'success' => $success,
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'errors' => $errors
        ];

        if (!is_null($id)){
            $response['entryId'] = $id;
            $response['entryTitle'] = $entryTitle;
        }

        return new JsonModel($response);
    }

    private function verifyPageExists($pageId) {
        $melisPage = $this->getServiceManager()->get('MelisEnginePage');
        $datasPageRes = $melisPage->getDatasPage($pageId);
        $datasPageTreeRes = $datasPageRes->getMelisPageTree();
        if(is_null($datasPageTreeRes)){
            return false;
        }
        return true;
    }

    public function savePropertiesAction()
    {
        $id = null;
        $entryTitle = null;
        $success = 0;
        $errors = [];

        $translator = $this->getServiceManager()->get('translator');
        $systemmaintenanceForm = $this->getForm();

        $request = $this->getRequest();
        $formData = $request->getPost()->toArray();
        if(is_numeric($formData['maintenance_url'])) {
            $melisTree = $this->serviceManager->get('MelisEngineTree');
            if(!$this->verifyPageExists($formData['maintenance_url'])) {
                $errors = $systemmaintenanceForm->getMessages();
                $errors['maintenance_url'] = ["label" => "Maintenance URL","error" => $translator->translate("tr_systemmaintenance_error_doesnt_exist")];
                $result = [
                    'success' => $success,
                    'errors' => $errors,
                    'data' => ['id' => $id],
                ];
        
                return new JsonModel($result);
            } else {
                unset($errors['maintenance_url']);
            }
            
            $link =  $melisTree->getPageLink($formData['maintenance_url'], true);
            $formData['maintenance_url'] = $link;

        }
        $systemmaintenanceForm->setData($formData);
        
        if ($systemmaintenanceForm->isValid()){

            $formData = $systemmaintenanceForm->getData();
            $dirPath = getcwd().'/data/maintenance-503/';
            if(!is_dir($dirPath)) {
                mkdir($dirPath, 0777, true);
            }
            $json_file = $dirPath.'maintenance.json';
            if(file_exists($dirPath)) {
                $isExists = false;

                if(file_exists($json_file)) {
                    $currentData = file_get_contents($json_file);
                    $currentData = json_decode($currentData);
                    if(count($currentData) >= 1) {
                        foreach($currentData as $key => $data) {
                            if($data->site_id == $formData['site_id']) {

                                if(empty($formData['maintenance_url'])) {
                                    unset($currentData[$key]);
                                } else {
                                    $currentData[$key]->maintenance_url = $formData['maintenance_url'];
                                    $currentData[$key]->is_maintenance_mode = 0;//$formData['is_maintenance_mode'];
                                    $isExists = true;
                                }
                            }
                        }   
                    }
                    if(!$isExists && !empty($formData['maintenance_url'])) {
                        $formData['is_maintenance_mode'] = "0";
                        $currentData[] = $formData;
                    }
                    $json_data = json_encode($currentData);
                    file_put_contents($json_file,$json_data);

                    if (isset($formData['is_maintenance_mode']) && $formData['is_maintenance_mode']) {
                        // clearing page cache
                        $this->getServiceManager()
                            ->get('SystemmaintenanceService')
                            ->clearPageCache();
                    }
                } else {
                    // $formData['is_maintenance_mode'] = "0";
                    file_put_contents($json_file,json_encode([]));
                }

            } 

        }else{
            $errors = $systemmaintenanceForm->getMessages();
            foreach ($errors as $keyError => $valueError){
                $errors[$keyError]['label'] = $translator->translate("tr_systemmaintenance_".$keyError);
            }
        }

        $result = [
            'success' => $success,
            'errors' => $errors,
            'data' => ['id' => $id],
        ];

        return new JsonModel($result);
    }



    public function deleteAction()
    {
        $request = $this->getRequest();
        $queryData = $request->getQuery()->toArray();

        if (!empty($queryData['id'])){
            $systemmaintenanceService = $this->getServiceManager()->get('SystemmaintenanceService');
            $systemmaintenanceService->deleteItem($queryData['id']);
        }
    }

    private function getForm()
    {
        $melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisCoreConfig->getFormMergedAndOrdered('meliscore/tools/systemmaintenance_tools/forms/systemmaintenance_property_form', 'systemmaintenance_property_form');

        // Factoring Systemmaintenance event and pass to view
        $factory = new \Laminas\Form\Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $form = $factory->createForm($appConfigForm);

        return $form;
    }


    public function saveStatusAction()
    {
        $json_data = [];
        $isJsonFileExists = false;
        if($this->getRequest()->isPost()) {
            $siteId = $this->getRequest()->getPost('siteId');

            $file = getcwd()."/data/maintenance-503/maintenance.json";
            $data = null;
            if(file_exists($file)) {
                $isJsonFileExists = true;
                $data = file_get_contents($file);
                $currentData = json_decode($data);
                foreach($currentData as $key => $site) {
                    if($site->site_id == $siteId) {

                        $status = $this->getRequest()->getPost('switchStatus');
                        $currentData[$key]->is_maintenance_mode = $status;

                        if ($status) {
                            // clearing page cache
                            $this->getServiceManager()
                                ->get('SystemmaintenanceService')
                                ->clearPageCache();
                        }
                    }
                }
                // dd($currentData);

                $json_data = json_encode($currentData);
                file_put_contents($file,$json_data);
            
            }
        }

        return new JsonModel([
            'success' => true,
            'textTitle' => 'tr_systemmaintenance_text_title_maintenance',
            'textMessage' => 'tr_systemmaintenance_text_message_maintenace', 
            'data'=>$json_data,
            'json_exists' => $isJsonFileExists
        ]);
    }
}