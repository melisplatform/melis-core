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
use MelisCore\Service\MelisCoreRightsService;
use MelisCore\Model\MelisBOEmails;
/**
 * MelisCore BO Emails Management
 */
class EmailsManagementController extends AbstractActionController
{
    const TOOL_INDEX = 'meliscore';
    const TOOL_KEY = 'meliscore_emails_mngt_tool';
    const INTERFACE_KEY = 'meliscore_tool_emails_mngt';
    
    /*
     * Render Emails Mngt. Contanier
     * */
    public function renderToolEmailsMngtContainerAction(){
        
        $translator = $this->getServiceLocator()->get('translator');
        
        $noAccessPrompt = '';
        if($this->hasAccess(self::INTERFACE_KEY)) { 
            $noAccessPrompt = $translator->translate('tr_tool_no_access');
        }
        
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        $view->noAccessPrompt = $noAccessPrompt;
        return $view;
    }
    
    /*
     * Render Emails Mngt. Header
     * */
    public function renderToolEmailsMngtHeaderAction(){
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        return $view;
    }
    
    /*
     * Render Emails Mngt. Header Add Button
     * */
    public function renderToolEmailsMngtHeaderBtnAddAction(){
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        return $view;
    }
    
    /*
     * Render Emails Mngt. Page Refresh Button
     * */
    public function renderToolEmailsMngtTableRefreshAction(){
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        return $view;
    }
    
    /*
     * Render Emails Mngt. Page Search Input
     * */
    public function renderToolEmailsMngtTableSearchAction(){
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        return $view;
    }
    
    /*
     * Render Emails Mngt. Table Action Edit
     * */
    public function renderToolEmailsMngtContentActionEditAction(){
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        return $view;
    }
    
    
    /**
     * Getting the Tab title for Tab Edition
     * @return json
     */
    public function getEmailForTabTitleAction(){
        
        $codename = $this->params()->fromPOST('codename','');
        
        $meilsEmailService = $this->getServiceLocator()->get('MelisCoreBOEmailService');
        $emailsPropertiesAndDetails = $meilsEmailService->getBoEmailByCode($codename);
        
        $title = ($emailsPropertiesAndDetails['email_name']) ? $emailsPropertiesAndDetails['email_name'] : $codename;
        
        return new JsonModel(array('title'=>$title));
    }
    
    /*
     * Render Emails Mngt. Table Action Edit
     * */
    public function renderToolEmailsMngtContentActionDeleteAction(){
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        return $view;
    }
    
    /*
     * Render Emails Mngt. Content
     * */
    public function renderToolEmailsMngtContentAction(){
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        return $view;
    }
    
    /*
     * Render Emails Mngt. Content Table
     * */
    public function renderToolEmailsMngtContentTableAction(){
        
        $translator = $this->getServiceLocator()->get('translator');
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
        
        $columns = $melisTool->getColumns();
        // pre-add Action Columns
        $columns['actions'] = array('text' => $translator->translate('tr_meliscms_action'));
        
        // Custom Datatable configuration
        $tableOption = array(
            'serverSide' => 'false',
        );
        
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        $view->tableColumns = $columns;
        $view->getToolDataTableConfig = $melisTool->getDataTableConfiguration(null, true, false, $tableOption);
        return $view;
    }
    
    /*
     * Get Current Emails Entries
     * */
    public function getEmailsEntriesAction(){
        
        $BOEmails = $this->getServiceLocator()->get('MelisCoreTableBOEmails');
        $translator = $this->getServiceLocator()->get('translator');
    
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
    
        $colId = array();
        $dataCount = 0;
        $draw = 0;
        $tableData = array();
        $totalData = array();
    
        if($this->getRequest()->isPost()) {
    
            $dataCount = $BOEmails->getTotalData();
    
            // Get Email App
            $melisMelisCoreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
            $emailsConfig = $melisMelisCoreConfig->getItem('meliscore/emails/');
            
            
            $getData = $BOEmails->fetchAll();
            $tableData = $getData->toArray();
            
            $tempTableData = array();
            for($ctr = 0; $ctr < count($tableData); $ctr++){
                // apply text limits
                foreach($tableData[$ctr] as $vKey => $vValue){
                    $tableData[$ctr][$vKey] = $melisTool->escapeHtml($melisTool->limitedText($vValue,50));
                }
                
                // Init indicator
                $tableData[$ctr]['boe_indicator'] = '';
                $tableData[$ctr]['boe_lang'] = $this->getEmailsLanguages($tableData[$ctr]['boe_code_name']);
                
                if (!empty($emailsConfig)){
                    // Emails Config Initialization
                    foreach ($emailsConfig As $key => $val){
                        
                        if ($key == $tableData[$ctr]['boe_code_name']){
                            
                            $boe_name = (isset($emailsConfig[$key]['email_name'])) ? $emailsConfig[$key]['email_name'] : '';
                            $boe_code_name = $key;
                            $boe_from_name = (isset($emailsConfig[$key]['headers']['from_name'])) ? $emailsConfig[$key]['headers']['from_name'] : '';
                            $boe_from_email = (isset($emailsConfig[$key]['headers']['from'])) ? $emailsConfig[$key]['headers']['from'] : '';
                            $boe_reply_to = (isset($emailsConfig[$key]['headers']['replyTo'])) ? $emailsConfig[$key]['headers']['replyTo'] : '';
                            $tableData[$ctr]['boe_indicator'] = '<i class="fa fa-database fa-lg" aria-hidden="true" title="DB Overrided"></i>';
                            $tableData[$ctr]['boe_name'] = $tableData[$ctr]['boe_from_name'];
                            $tableData[$ctr]['boe_from_name'] = ($tableData[$ctr]['boe_from_name']) ? $tableData[$ctr]['boe_from_name'] : $boe_from_name;
                            $tableData[$ctr]['boe_from_email'] = ($tableData[$ctr]['boe_from_email']) ? $tableData[$ctr]['boe_from_email'] : $boe_from_email;
                            $tableData[$ctr]['boe_reply_to'] = ($tableData[$ctr]['boe_reply_to']) ? $tableData[$ctr]['boe_reply_to'] : $boe_reply_to;
                            $tableData[$ctr]['DT_RowClass'] = 'boEmailsMergeData';
                            
                            
                            
                            unset($emailsConfig[$key]);
                        }
                    }
                }
                
                // add DataTable RowID, this will be added in the <tr> tags in each rows
                $tableData[$ctr]['DT_RowId'] = $tableData[$ctr]['boe_code_name'];
                $tempTableData[$ctr] = $tableData[$ctr];
            }
            
            // Sorting Array
            // Database Data with Data from App.emails will place at the top/first of the array
            usort($tempTableData, function($a, $b) {
                return $a['boe_indicator'] < $b['boe_indicator'];
            });
            
            $tempEmailsConfig = array();
            foreach ($emailsConfig As $key => $val){
                
                // Get the Email Content Languages Available
                $melisMelisCoreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
                $emailsConfigData = $melisMelisCoreConfig->getItem('meliscore/emails/'.$key);
                
                $emailLang = (isset($emailsConfigData['contents'])) ? $emailsConfigData['contents'] : array();
                $emailLangString = array();
                
                if (!empty($emailLang)){
                    
                    foreach ($emailLang As $ekey => $eval){
                        
                        $subject = (isset($emailLang[$ekey]['subject'])) ? $emailLang[$ekey]['subject'] : '';
                        $html_content = (isset($emailLang[$ekey]['html'])) ? $emailLang[$ekey]['html'] : '';
                        $text_content = (isset($emailLang[$ekey]['text'])) ? $emailLang[$ekey]['text'] : '';
                        
                        if (!empty($subject)&&(!empty($html_content)||!empty($text_content))){
                            $temp = explode('_', $ekey);
                            array_push($emailLangString, $temp[1]);
                        }
                    }
                }
                
                
                $emailLangString = implode(', ', $emailLangString);
                
                $defaullEmails = array(
                    'boe_id' => '',
                    'boe_indicator' => '<i class="fa fa-cogs fa-lg" aria-hidden="true" title="Default Values from App.emails config"></i>',
                    'boe_name' => (isset($emailsConfig[$key]['email_name'])) ? $emailsConfig[$key]['email_name'] : '',
                    'boe_code_name' => $key,
                    'boe_lang' => $emailLangString,
                    'boe_from_name' => (isset($emailsConfig[$key]['headers']['from_name'])) ? $emailsConfig[$key]['headers']['from_name'] : '',
                    'boe_from_email' => (isset($emailsConfig[$key]['headers']['from'])) ? $emailsConfig[$key]['headers']['from'] : '',
                    'boe_reply_to' => (isset($emailsConfig[$key]['headers']['replyTo'])) ? $emailsConfig[$key]['headers']['replyTo'] : '',
                    'DT_RowId' => $key,
                    'DT_RowClass' => 'noDeleteBtn'
                );
                
                array_push($tempEmailsConfig, $defaullEmails);
            }
            
            $totalData = array_merge($tempEmailsConfig, $tempTableData);
            
        }
        
        return new JsonModel(array(
            'draw' => (int) $draw,
            'recordsTotal' => $dataCount,
            'recordsFiltered' =>  $BOEmails->getTotalFiltered(),
            'data' => $totalData,
        ));
    }
    
    /**
     * Get Emails Content Languages Available
     * @param String $codename
     * @return String - Concatinated of Langauges that available for the Email
     * */
    public function getEmailsLanguages($codename){
        $melisCoreBOEmailService = $this->getServiceLocator()->get('MelisCoreBOEmailService');
        $emailDetials = $melisCoreBOEmailService->getBoEmailByCode($codename);
        
        $emailLang = (isset($emailDetials['contents'])) ? $emailDetials['contents'] : array();
        $emailLangString = array();
        
        if (!empty($emailLang)){
            
            foreach ($emailLang As $ekey => $eval){
                
                $subject = (isset($emailLang[$ekey]['subject'])) ? $emailLang[$ekey]['subject'] : '';
                $html_content = (isset($emailLang[$ekey]['html'])) ? $emailLang[$ekey]['html'] : '';
                $text_content = (isset($emailLang[$ekey]['text'])) ? $emailLang[$ekey]['text'] : '';
                
                if (!empty($subject)&&(!empty($html_content)||!empty($text_content))){
                    $temp = explode('_', $ekey);
                    if (count($temp)>=2){
                        array_push($emailLangString, $temp[1]);
                    }else{
                        array_push($emailLangString, $temp[0]);
                    }
                }
            }
        }
        $emailLangString = implode(', ', $emailLangString);
        
        return $emailLangString;
    }
    
    
    /**
     * Render Page Creation and Edition
     * */
    public function renderEmailsMngtAction(){
        
        $translator = $this->getServiceLocator()->get('translator');
        $codename = $this->params()->fromRoute('codename', $this->params()->fromQuery('codename', ''));
        
        $noAccessPrompt = '';
        if($this->hasAccess(self::INTERFACE_KEY)) {
            $noAccessPrompt = $translator->translate('tr_tool_no_access');
        }
        
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        $view->noAccessPrompt = $noAccessPrompt;
        $view->codename = $codename;
        return $view;
    }
    
    /*
     * Render Page Creation and Edition Header
     * */
    public function renderEmailsMngtHeaderAction(){
        $translator = $this->getServiceLocator()->get('translator');
        $codename = $this->params()->fromRoute('codename', $this->params()->fromQuery('codename', ''));
        
        if ($codename!='NEW'){
         
            $meilsEmailService = $this->getServiceLocator()->get('MelisCoreBOEmailService');
            $emailsPropertiesAndDetails = $meilsEmailService->getBoEmailByCode($codename);
            
            $title = (isset($emailsPropertiesAndDetails['email_name'])) ? $emailsPropertiesAndDetails['email_name'] : $codename;
        }else{
            
            $title = $translator->translate('tr_emails_management_title_creation');
        }
        
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        $view->title = $title;
        return $view;
    }
    
    /*
     * Render Page Creation and Edition Header Save Button
     * */
    public function renderEmailsMngtHeaderSaveAction(){
        $translator = $this->getServiceLocator()->get('translator');
        $codename = $this->params()->fromRoute('codename', $this->params()->fromQuery('codename', ''));
        
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        $view->codename = $codename;
        return $view;
    }
    
    /*
     * Render Page Creation and Edition Content
     * */
    public function renderEmailsMngtContentAction(){
        $view = new ViewModel();
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        return $view;
    } 
    
    /*
     * Render Page Creation and Edition Tab Navigator
     * */
    public function renderEmailsMngtContentlangTabNavAction(){
        $translator = $this->getServiceLocator()->get('translator');
        $codename = $this->params()->fromRoute('codename', $this->params()->fromQuery('codename', ''));
        $coreLang = $this->getServiceLocator()->get('MelisCoreTableLang');
        $coreLangResult = $coreLang->fetchAll();
        
        $coreLangDatas = array();
        if (!empty($coreLangResult)){
            $coreLangResult = $coreLangResult->toArray();
            if (!empty($coreLangResult)){
                $coreLangDatas = $coreLangResult;
            }
        }
        
        $view = new ViewModel();
        $view->coreLangDatas =  $coreLangResult;
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        $view->codename = $codename;
        
        return $view;
    }
    
    /*
     * Render Page Creation and Edition Tab Content
     * */
    public function renderEmailsMngtContentLangTabContentAction() {
        $view = new ViewModel();
        $translator = $this->getServiceLocator()->get('translator');
        $melisCoreTranslation = $this->getServiceLocator()->get('MelisCoreTranslation');
        $codename = $this->params()->fromRoute('boeId', $this->params()->fromQuery('codename', ''));
        
        $coreLang = $this->getServiceLocator()->get('MelisCoreTableLang');
        $coreLangResult = $coreLang->fetchAll();
        
        $coreLangDatas = array();
        if (!empty($coreLangResult)){
            $coreLangResult = $coreLangResult->toArray();
            if (!empty($coreLangResult)){
                $coreLangDatas = $coreLangResult;
            }
        }
        
        // Genderal Properties Form at app.tools
        $melisMelisCoreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $generalProperties = $melisMelisCoreConfig->getFormMergedAndOrdered('meliscore/tools/meliscore_emails_mngt_tool/forms/meliscore_emails_mngt_tool_general_properties_form','meliscore_emails_mngt_tool_general_properties_form');
        
        // Factoring Calendar event and pass to view
        $factory = new \Zend\Form\Factory();
        $formElements = $this->serviceLocator->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $generalPropertiesForm = $factory->createForm($generalProperties);
        
        if ($codename!='NEW'){
	        
            $melisBOEmails = $this->getServiceLocator()->get('MelisCoreTableBOEmails');
            $emailsDatasResult = $melisBOEmails->getEntryByField('boe_code_name', $codename);
            $emailsDatas = $emailsDatasResult->current();
            
            $dbExist = TRUE;
            
            // Get Email App
            $melisMelisCoreConfig = $this->getServiceLocator()->get('config');
            $emailsConfig = isset($melisMelisCoreConfig['plugins']['meliscore']['emails'][$codename]) ? $melisMelisCoreConfig['plugins']['meliscore']['emails'][$codename] : array();
            
            if (!empty($emailsConfig)){
                // Emails Config Initialization
                $emailName = (isset($emailsConfig['email_name'])) ? $emailsConfig['email_name'] : '';
                $from = (isset($emailsConfig['headers']['from'])) ? $emailsConfig['headers']['from'] : '';
                $from_name = (isset($emailsConfig['headers']['from_name'])) ? $emailsConfig['headers']['from_name'] : '';
                $replyTo = (isset($emailsConfig['headers']['replyTo'])) ? $emailsConfig['headers']['replyTo'] : '';
                $acceptedTags = (isset($emailsConfig['headers']['tags'])) ? $emailsConfig['headers']['tags'] : '';
                $layout = (isset($emailsConfig['layout'])) ? $emailsConfig['layout'] : '';
                
                if (!empty($emailsDatas)){
                    $emailsDatas->boe_name = ($emailsDatas->boe_name) ? $emailsDatas->boe_name : $emailName;
                    $emailsDatas->boe_from_email = ($emailsDatas->boe_from_email) ? $emailsDatas->boe_from_email : $from;
                    $emailsDatas->boe_from_name = ($emailsDatas->boe_from_name) ? $emailsDatas->boe_from_name : $from_name;
                    $emailsDatas->boe_reply_to = ($emailsDatas->boe_reply_to) ? $emailsDatas->boe_reply_to : $replyTo;
//                     $emailsDatas->boe_content_layout = ($emailsDatas->boe_content_layout) ? $emailsDatas->boe_content_layout : $layout;

                    if (!empty($emailsDatas->boe_code_name)){
                        if ($emailsDatas->boe_code_name==$codename){
                            $generalPropertiesForm->get('boe_code_name')->setAttribute('disabled','disabled');
                        }
                    }
                }else{
                    $dbExist = FALSE;
                    $emailsDatas = new MelisBOEmails();
                    $emailsDatas->boe_name = $emailName;
                    $emailsDatas->boe_from_email =  $from;
                    $emailsDatas->boe_code_name =  $codename;
                    $emailsDatas->boe_from_name = $from_name;
                    $emailsDatas->boe_reply_to = $replyTo;
                    $emailsDatas->boe_tag_accepted_list = $acceptedTags;
                    $emailsDatas->boe_content_layout = $layout;
                    $generalPropertiesForm->get('boe_code_name')->setAttribute('disabled','disabled');
                }
                
                
                if (!empty($emailsDatas->boe_tag_accepted_list)||!empty($acceptedTags)){
                     
                    $configEmail = (!empty($acceptedTags)) ? explode(',', $emailsConfig['headers']['tags']) : array();
                    $dbCongif = explode(',', $emailsDatas->boe_tag_accepted_list);
                     
                    $configEmail = array_filter(array_map('trim', $configEmail));
                    $dbCongif = array_filter(array_map('trim', $dbCongif));
                     
                    $emailsDatas->boe_tag_accepted_list = implode(',', array_unique(array_merge($configEmail, $dbCongif)));
                    
                }
            }
            
            // Binding Datas to the General Properties Form
            $generalPropertiesForm->bind($emailsDatas);
            
            $emailsDetailsData = array();
            
            if ($dbExist){
                
                $emailsDetailsData = array();
                $melisBOEmailsDetails = $this->getServiceLocator()->get('MelisCoreTableBOEmailsDetails');
                foreach ($coreLangResult As $key => $val){
                    $emailsDetailsDatasResult = $melisBOEmailsDetails->getEmailDetailsByEmailId($emailsDatas->boe_id,$coreLangResult[$key]['lang_id']);
                    $emailsDetailsDatas = $emailsDetailsDatasResult->current();
                    
                    $tempemailsDetailsData = array();
                    $hasEmailsDetails = FALSE;
                    if (!empty($emailsDetailsDatas)){
                        
                        $langLocale = $coreLangResult[$key]['lang_locale'];
                        
                        foreach ($emailsDetailsDatas As $tKey => $tVal){
                            $tempemailsDetailsData[$tKey] = $tVal;
                        }
                        
                        if (isset($emailsConfig['contents'][$langLocale])){
                            
                            // Emails Config Initialization
                            $subject = (isset($emailsConfig['contents'][$langLocale]['subject'])) ? $melisCoreTranslation->getMessage($emailsConfig['contents'][$langLocale]['subject'],$langLocale) : '';
                            $html = (isset($emailsConfig['contents'][$langLocale]['html'])) ? $melisCoreTranslation->getMessage($emailsConfig['contents'][$langLocale]['html'],$langLocale) : '';
                            $text = (isset($emailsConfig['contents'][$langLocale]['text'])) ? $melisCoreTranslation->getMessage($emailsConfig['contents'][$langLocale]['text'],$langLocale) : '';
                            
                            $tempemailsDetailsData['boed_subject'] = ($emailsDetailsDatas->boed_subject) ? $emailsDetailsDatas->boed_subject : $subject;
                            $tempemailsDetailsData['boed_html'] = ($emailsDetailsDatas->boed_html) ? $emailsDetailsDatas->boed_html : $html;
                            $tempemailsDetailsData['boed_text'] = ($emailsDetailsDatas->boed_text) ? $emailsDetailsDatas->boed_text : $text;
                        }
                        
                        $hasEmailsDetails = TRUE;
                    }
                    
                    if (!$hasEmailsDetails){
                        $tempemailsDetailsData['boed_subject'] = '';
                        $tempemailsDetailsData['boed_html'] = '';
                        $tempemailsDetailsData['boed_text'] = '';
                        $tempemailsDetailsData['boed_id'] = '';
                        $tempemailsDetailsData['boed_email_id'] = '';
                        $tempemailsDetailsData['boed_lang_id'] = $coreLangResult[$key]['lang_id'];
                    }
                    array_push($emailsDetailsData, $tempemailsDetailsData);
                }
                
                
                $view->emailsDetailsDatas = $emailsDetailsData;
                
            }else{
                if (!empty($coreLangResult)){
                    
                    foreach ($coreLangResult As $key => $val){
                        if (!empty($emailsConfig)){
                            
                            $langLocale = $coreLangResult[$key]['lang_locale'];
                            
                            if (isset($emailsConfig['contents'][$langLocale])){
                                
                                $subject = (isset($emailsConfig['contents'][$langLocale]['subject'])) ? $melisCoreTranslation->getMessage($emailsConfig['contents'][$langLocale]['subject'],$langLocale) : '';
                                $html = (isset($emailsConfig['contents'][$langLocale]['html'])) ? $melisCoreTranslation->getMessage($emailsConfig['contents'][$langLocale]['html'],$langLocale) : '';
                                $text = (isset($emailsConfig['contents'][$langLocale]['text'])) ? $melisCoreTranslation->getMessage($emailsConfig['contents'][$langLocale]['text'],$langLocale) : '';
                                
                                array_push($emailsDetailsData, array(
                                    'boed_lang_id' => $coreLangResult[$key]['lang_id'],
                                    'boed_subject' => $subject,
                                    'boed_html' => $html,
                                    'boed_text' => $text
                                ));
                                
                            }else{
                                array_push($emailsDetailsData, array(
                                    'boed_lang_id' => $coreLangResult[$key]['lang_id'],
                                    'boed_subject' => '',
                                    'boed_html' => '',
                                    'boed_text' => ''
                                ));
                            }
                        }
                    }
                    $view->emailsDetailsDatas = $emailsDetailsData;
                }
            }
        }
        
        // Get Cms Platform ID form from  App Tool
        $melisMelisCoreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $emailsDetails = $melisMelisCoreConfig->getFormMergedAndOrdered('meliscore/tools/meliscore_emails_mngt_tool/forms/meliscore_emails_mngt_tool_emails_details_form','meliscore_emails_mngt_tool_emails_details_form');
        $emailsDetailsForm = $factory->createForm($emailsDetails);
        
        $view->coreLangDatas =  $coreLangResult;
        $view->setVariable('meliscore_emails_mngt_tool_general_properties_form', $generalPropertiesForm);
        $view->setVariable('meliscore_emails_mngt_tool_emails_details_form', $emailsDetailsForm);
        $view->melisKey = $this->params()->fromRoute('melisKey', '');
        $view->codename = $codename;
        return $view;
    }

    /*
     * Adding new Email
     * */
    public function saveEmailAction(){
        $translator = $this->getServiceLocator()->get('translator');
        
        $request = $this->getRequest();
        // Default Values
        $BoEmailId = null;
        $status  = 0;
        $textMessage = '';
        $errors  = array();
        $textTitle = '';
        $responseData = array();
         
        // Genderal Properties Form at app.tools
        $melisMelisCoreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $generalProperties = $melisMelisCoreConfig->getItem('meliscore/tools/meliscore_emails_mngt_tool/forms/meliscore_emails_mngt_tool_general_properties_form');
         
        $factory = new \Zend\Form\Factory();
        $formElements = $this->serviceLocator->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $propertyForm = $factory->createForm($generalProperties);
        
        if($request->isPost()) {

            $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
            $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
             
            $datas = $melisTool->sanitizePost(get_object_vars($request->getPost()), [], true);

            $codename = $datas['codename'];
            
            if ($codename=='NEW'){
                $logTypeCode = 'CORE_BO_EMAIL_ADD';
            }else{
                $logTypeCode = 'CORE_BO_EMAIL_UPDATE';
            }
            
            unset($datas['codename']);
            
            // Response Temporary Initialized and can be overrided
            if ($codename!='NEW'){
                $textTitle = 'tr_emails_management_edition';
                $textMessage = 'tr_emails_management_unable_to_update';
            }else{
                $textTitle = 'tr_emails_management_creation';
                $textMessage = 'tr_emails_management_unable_to_add';
            }
            
            // Reinitialize Codename if not Set
            // This means that Codename is Exist in App.mail that disabled on Email Edition
            if (!isset($datas['boe_code_name'])){
                $datas['boe_code_name'] = $codename;
            }
            
            /* 
             * Code Name Validation
             * Codename must be unique
             * */
            $codeNameError = array();
            if ($datas['boe_code_name']!=$codename){
                $codeNameValidator = new \Zend\Validator\Db\NoRecordExists(
                    array(
                        'table'   => 'melis_core_bo_emails',
                        'field'   => 'boe_code_name',
                        'adapter' => $this->getServiceLocator()->get('Zend\Db\Adapter\Adapter')
                    )
                );
                
                if(!$codeNameValidator->isValid($datas['boe_code_name'])){
                    //  Codename in already exist on Database
                    $codeNameError['boe_code_name'] = array(
                        'noUniqueBD' => $translator->translate('tr_emails_management_emal_boe_code_name_must_be_unique')
                        );
                }
                
                $melisMelisCoreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
                $emailsConfig = $melisMelisCoreConfig->getItem('meliscore/emails/'.$datas['boe_code_name']);
                
                if(!empty($emailsConfig)&&empty($codeNameError)){
                    // Codename in already exist on App.Email
                    $codeNameError['boe_code_name'] = array(
                        'noUniqueFile' => $translator->translate('tr_emails_management_emal_boe_code_name_must_be_unique')
                    );
                }
            }
            
            // Codename "NEW" is reserve Codename
            if ($datas['boe_code_name']=='NEW'){
                $codeNameError['boe_code_name'] = array(
                    'codenameReserve' => $translator->translate('tr_emails_management_emal_boe_code_name_reserved')
                );
            }
            
            /*
             * Layout Path and extension validations
             * */
            $layoutPathError = array();
            if (!empty($datas['boe_content_layout'])){
                // Only allow files that exist in ~both~ directories
                $layoutPathValidator = new \Zend\Validator\File\Exists();
                
                $layout = $datas['boe_content_layout'];
                $layout = __DIR__ .'/../../../'.$layout;
                
                if (!$layoutPathValidator->isValid($layout)) {
                    $layoutPathError['boe_content_layout'] = array(
                        'invalidPath' => $translator->translate('tr_meliscore_emails_mngt_tool_general_properties_form_invalid_layout_path')
                        );
                }else{
                    // Allow files with 'php' or 'exe' extensions
                    $layoutExtensionValidator = new \Zend\Validator\File\Extension('phtml');
                    
                    if (!$layoutExtensionValidator->isValid($layout)) {
                        $layoutPathError['boe_content_layout'] = array(
                            'invalidPath' => $translator->translate('tr_meliscore_emails_mngt_tool_general_properties_form_invalid_layout_extension')
                        );
                    }
                }
            }
            
            $propertyForm->setData($datas);
            
            if($propertyForm->isValid()&&empty($codeNameError)&&empty($layoutPathError)) {
                
                $melisCoreBOEmailService = $this->getServiceLocator()->get('MelisCoreBOEmailService');
                $BoEmailId = $melisCoreBOEmailService->saveBoEmailByCode($codename, $datas);
                
                if ($codename=='NEW'){
                    $textTitle = 'tr_emails_management_title_creation';
                    $textMessage = $translator->translate('tr_emails_management_email').' '.$datas['boe_name'].' '.$translator->translate('tr_emails_management_created');
                }else{
                    $textTitle = 'tr_emails_management_title_edition';
                    $textMessage = $translator->translate('tr_emails_management_email').' '.$datas['boe_name'].' '.$translator->translate('tr_emails_management_edited');
                }
                
                $status  = 1;
            }else{
                $errors = $propertyForm->getMessages();
            }
            
            $errors = array_merge($errors,$codeNameError,$layoutPathError);
             
            $appConfigForm = $generalProperties['elements'];
             
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
            'success' => $status,
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'errors' => $errors,
            'event' => $responseData
        );
        
        $this->getEventManager()->trigger('meliscore_tool_bo_emails_end', $this, array_merge($response, array('typeCode' => $logTypeCode, 'itemId' => $BoEmailId)));
         
        return new JsonModel($response);
    }
    
    /*
     * Deleting Email
     * */
    public function deleteEmailAction(){
         
        $translator = $this->getServiceLocator()->get('translator');
    
        $request = $this->getRequest();
        $datas = get_object_vars($request->getPost());
    
        $meilsEmailService = $this->getServiceLocator()->get('MelisCoreBOEmailService');
        $emailsPropertiesAndDetails = $meilsEmailService->getBoEmailByCode($datas['codename']);
    
        $melisCoreBOEmailService = $this->getServiceLocator()->get('MelisCoreBOEmailService');
        $BoEmailId = $melisCoreBOEmailService->deleteEmail($datas);
    
        $title = ($emailsPropertiesAndDetails['email_name']) ? $emailsPropertiesAndDetails['email_name'] : $datas['codename'];
    
        $textTitle = 'tr_emails_management_title_deletion';
        $textMessage = $translator->translate('tr_emails_management_email').' '.$title.' '.$translator->translate('tr_emails_management_deleted');
    
        $response = array(
            'success' => 1,
            'textTitle' => $textTitle,
            'textMessage' => $textMessage
        );
    
        $this->getEventManager()->trigger('meliscore_tool_bo_emails_end', $this, array_merge($response, array('typeCode' => 'CORE_BO_EMAIL_DELETE', 'itemId' => $BoEmailId)));
    
        return new JsonModel($response);
    }
    
    /**
     * USER ACCESS SECTION
     * Checks wether the user has access to this tools or not
     * @return boolean
     */
    private function hasAccess($key) {
        $melisCmsAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $melisCmsRights = $this->getServiceLocator()->get('MelisCoreRights');
        $xmlRights = $melisCmsAuth->getAuthRights();
        $isAccessible = $melisCmsRights->isAccessible($xmlRights, MelisCoreRightsService::MELISCORE_PREFIX_TOOLS, $key);
        return $isAccessible;
    }

}