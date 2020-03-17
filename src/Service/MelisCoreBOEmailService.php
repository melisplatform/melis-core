<?php

namespace MelisCore\Service;

use Laminas\ServiceManager\ServiceLocatorAwareInterface;
use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\Db\Sql\Ddl\Column\Boolean;

class MelisCoreBOEmailService  implements  ServiceLocatorAwareInterface{
	protected $serviceLocator;
	
	public function setServiceLocator(ServiceLocatorInterface $sl){
		$this->serviceLocator = $sl;
		return $this;
	}
	
	public function getServiceLocator(){
		return $this->serviceLocator;
	}
	
	/**
	 * Saving Emails Properties and Details
	 * @param string $codename - Codename of the email
	 * @param array $data - Containing the properties and details of the email
	 * 
	 * @return ID|NULL if saving is failed
	 */
	public function saveBoEmailByCode($codename, $data){
	    
	    $boeID = null;
	    
	    $melisBOEmails = $this->getServiceLocator()->get('MelisCoreTableBOEmails');
	    $melisBOEmailsDetails = $this->getServiceLocator()->get('MelisCoreTableBOEmailsDetails');
	    
	    $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
	    $userAuthDatas =  $melisCoreAuth->getStorage()->read();
	    $userId = (int) $userAuthDatas->usr_id;
	    
	    $data['boe_last_edit_date'] = date('Y-m-d H:i:s');
	    $data['boe_last_user_id'] = $userId;
	    
	    $coreLang = $this->getServiceLocator()->get('MelisCoreTableLang');
	    $coreLangResult = $coreLang->fetchAll();
	    
	    $coreLangDatas = array();
	    if (!empty($coreLangResult)){
	        $coreLangResult = $coreLangResult->toArray();
	        if (!empty($coreLangResult)){
	            $coreLangDatas = $coreLangResult;
	        }
	    }
	    
	    // Getting the Email details and placing to a new container that will hadle the Data
	    $langEmailDetailsContainer = array();
	    $langEmailDetails = array();
	    for ($i = 0; $i < count($coreLangDatas); $i++){
	        if (isset($data[$coreLangDatas[$i]['lang_locale']])){
	            $langUrlEmailDetails = $data[$coreLangDatas[$i]['lang_locale']];
	            $langUrlEmailDetails = explode('&', $langUrlEmailDetails);
	            foreach ($langUrlEmailDetails As $key => $val){
	                $keyval = explode('=',$langUrlEmailDetails[$key]);
	                $langEmailDetails[$keyval[0]] = urldecode($keyval[1]);
	            }
	            unset($data[$coreLangDatas[$i]['lang_locale']]);
	        }
	        array_push($langEmailDetailsContainer, $langEmailDetails);
	    }
	    
	    // Saving Data
	    if ($codename!='NEW'){
	        
	        $melisBOEmailsResult = $melisBOEmails->getEntryByField('boe_code_name', $codename);
	        $melisBOEmailsData = $melisBOEmailsResult->current();
	        if (!empty($melisBOEmailsData)){
	            // Email Edition Statement
	            $boeID = $melisBOEmailsData->boe_id;
                $melisBOEmails->save($data,$boeID);
	        }else{
	            // Adding new database row
	            $boeID = $melisBOEmails->save($data);
	        }
	    }else{
	        // Adding Email Statement
	        $boeID = $melisBOEmails->save($data);
	    }
	    
	    foreach ($langEmailDetailsContainer As $key => $val){
	        $emailDetails = $langEmailDetailsContainer[$key];
	        $emailDetails['boed_email_id'] = $boeID;
	        
	        if (isset($emailDetails['boed_id'])&&!empty($emailDetails['boed_id'])){
	            $melisBOEmailsDetails->save($emailDetails,$emailDetails['boed_id']);
	        }else{
	            unset($emailDetails['boed_id']);
	            try {
                    $melisBOEmailsDetails->save($emailDetails);
                }catch(\Exception $e) {

                }

	        }
	    }
	    
	    return $boeID;
	}
	
	/**
	 * Deleting Email
	 * @param Array $data - contain the codename of the email
	 * 
	 * @return Id|null if deletion is failed
	 */
	public function deleteEmail($data){
	    $emailBoId = null;
	    if (!empty($data['codename'])){
	        $melisBOEmails = $this->getServiceLocator()->get('MelisCoreTableBOEmails');
	        $boeID = $melisBOEmails->getEntryByField('boe_code_name', $data['codename']);
	        
	        if (!empty($boeID)){
	            $boeID = $boeID->current();
	            $emailBoId = $boeID->boe_id;
	            $melisBOEmails->deleteById($boeID->boe_id);
	            
	            $melisBOEmailsDetails = $this->getServiceLocator()->get('MelisCoreTableBOEmailsDetails');
	            $melisBOEmailsDetails->deleteByField('boed_email_id', $boeID->boe_id);
	        }
	    }
	    
	    return $emailBoId;
	}
	
	/**
	 * Get BO Emails By Code
	 * @param String $codename  - Codename of the email
	 * @param int $langId - Language id
	 * Return Array Structure
	 *     array(
	 *         **** Data From "melis_core_bo_emails" ****
	 *         'email_name' => '',
     *         'layout' => '',
     *         'layout_title' => '',
     *         'layou_logo' => '',
     *         'layout_ftr_inofo' => '',
	 *         'Header' => Array
	 *         (
	 *             'from' => '',
     *             'from_name' => '',
     *             'replyTo' => '',
     *             'tags' => '',
	 *         ),
	 *         **** Datas From "melis_core_bo_emails_details" ****
	 *         'contents' => Array 
	 *         (
	 *             [en_EN] => Array
	 *             (
	 *                 'subject' => '',
     *                 'html' => '',
     *                 'text' => '',
	 *             ),
	 *             [fr_FR] => Array
	 *             (
	 *                 'subject' => '',
     *                 'html' => '',
     *                 'text' => '',
	 *             )
	 *             ....
	 *             ...
	 *             ..
	 *             .
	 *         )
	 *     )
	 * 
	 * @return Array
	 */
	public function getBoEmailByCode($codename, $langId = null) {
	    $melisCoreTranslation = $this->getServiceLocator()->get('MelisCoreTranslation');
	    $melisBOEmails = $this->getServiceLocator()->get('MelisCoreTableBOEmails');
	    $melisBOEmailsDetails = $this->getServiceLocator()->get('MelisCoreTableBOEmailsDetails');
	    
	    $result = array();
	    $result['headers'] = array();
	    $result['contents'] = array();
	    
	    if (!empty($codename)){

            $configPath = 'meliscore/datas';
            $melisConfig = $this->getServiceLocator()->get('MelisCoreConfig');
            $emailCfg = $melisConfig->getItemPerPlatform($configPath);
            $cfgLayoutLogo = $emailCfg['logo'];
            $cfgLayoutTitle = $emailCfg['emails']['default_layout_title'];
            $cfgLayoutFtrInfo = $emailCfg['emails']['default_layout_ftr_info'];

	        $melisBOEmailsResult = $melisBOEmails->getEntryByField('boe_code_name',$codename);
	        
	        if (!empty($melisBOEmailsResult)){
	            
	            $melisBOEmailsData = $melisBOEmailsResult->current();
	            if(!empty($melisBOEmailsData)){

	                // Get Email App
	                $melisMelisCoreConfig = $this->getServiceLocator()->get('config');
	                $emailsConfig = (isset($melisMelisCoreConfig['plugins']['meliscore']['emails'][$codename])) ? $melisMelisCoreConfig['plugins']['meliscore']['emails'][$codename] : array();
	                
                    // Emails Config Initialization
	                $emailName      = (isset($emailsConfig['email_name'])) ? $emailsConfig['email_name'] : '';
                    $from           = (isset($emailsConfig['headers']['from'])) ? $emailsConfig['headers']['from'] : '';
                    $from_name      = (isset($emailsConfig['headers']['from_name'])) ? $emailsConfig['headers']['from_name'] : '';
                    $replyTo        = (isset($emailsConfig['headers']['replyTo'])) ? $emailsConfig['headers']['replyTo'] : '';
                    $tags           = (isset($emailsConfig['headers']['tags'])) ? $emailsConfig['headers']['tags'] : '';
                    $layout         = (isset($emailsConfig['layout'])) ? $emailsConfig['layout'] : '';
                    $layoutTitle    = (isset($emailsConfig['layout_title'])) ? $emailsConfig['layout_title'] : $cfgLayoutTitle;
                    $layoutLogo     = (isset($emailsConfig['layout_logo'])) ? $emailsConfig['layout_logo'] : $cfgLayoutLogo;
                    $layoutFtrInfo  = (isset($emailsConfig['layout_ftr_info'])) ? $emailsConfig['layout_ftr_info'] : $cfgLayoutFtrInfo;

	                $result['email_name']           = ($melisBOEmailsData->boe_name) ? $melisBOEmailsData->boe_name : $emailName;
	                $result['headers']['from']      = ($melisBOEmailsData->boe_from_email) ? $melisBOEmailsData->boe_from_email : $from;
	                $result['headers']['from_name'] = ($melisBOEmailsData->boe_from_name) ? $melisBOEmailsData->boe_from_name : $from_name;
	                $result['headers']['replyTo']   = ($melisBOEmailsData->boe_reply_to) ? $melisBOEmailsData->boe_reply_to : $replyTo;
	                $result['layout']               = $melisBOEmailsData->boe_content_layout;
	                $result['layout_title']         = ($melisBOEmailsData->boe_content_layout_title) ? $melisBOEmailsData->boe_content_layout_title : $layoutTitle;
	                $result['layout_logo']          = ($melisBOEmailsData->boe_content_layout_logo) ? $melisBOEmailsData->boe_content_layout_logo : $layoutLogo;
	                $result['layout_ftr_info']      = ($melisBOEmailsData->boe_content_layout_ftr_info) ? $melisBOEmailsData->boe_content_layout_ftr_info : $layoutFtrInfo;


	                $result['headers']['tags'] = '';
	                if (!empty($melisBOEmailsData->boe_tag_accepted_list)||!empty($tags)){
	                    
	                    $configEmail = (!empty($tags)) ? explode(',', $emailsConfig['headers']['tags']) : array();
	                    $dbCongif = explode(',', $melisBOEmailsData->boe_tag_accepted_list);
	                    
	                    $configEmail = array_filter(array_map('trim', $configEmail));
	                    $dbCongif = array_filter(array_map('trim', $dbCongif));
	                    
                        $result['headers']['tags'] = implode(',', array_unique(array_merge($configEmail, $dbCongif)));
	                }
	                
	                    
	                $getEmailsDetails = $melisBOEmailsDetails->getEmailDetailsByEmailId($melisBOEmailsData->boe_id, $langId);
	                
	                if (!empty($getEmailsDetails)){
	                    $melisBOEmailsDetailsResult = $getEmailsDetails->toArray();
	                    if (!empty($melisBOEmailsDetailsResult)){
	                        
	                        $coreLang = $this->getServiceLocator()->get('MelisCoreTableLang');
	                        
	                        for ($i = 0; $i < count($melisBOEmailsDetailsResult); $i++){
	                            
	                            $localeLang = $coreLang->getEntryById($melisBOEmailsDetailsResult[$i]['boed_lang_id']);
	                            
	                            if (!empty($localeLang)){
	                                
	                                $localeLang = $localeLang->current();
	                                // Checking if the Email Detail Language is still available on Core Languages
	                                if (!empty($localeLang)){
	                                    
	                                    $locale = $localeLang->lang_locale;
    	                                // Emails Config Initialization
    	                                $subject = (isset($emailsConfig['contents'][$localeLang->lang_locale]['subject'])) ? $melisCoreTranslation->getMessage($emailsConfig['contents'][$locale]['subject'],$locale) : '';
    	                                $html = (isset($emailsConfig['contents'][$localeLang->lang_locale]['html'])) ? $melisCoreTranslation->getMessage($emailsConfig['contents'][$locale]['html'],$locale) : '';
    	                                $text = (isset($emailsConfig['contents'][$localeLang->lang_locale]['text'])) ? $melisCoreTranslation->getMessage($emailsConfig['contents'][$locale]['text'],$locale) : '';
    	                                
    	                                $result['contents'][$localeLang->lang_locale] = array(
    	                                    'subject' => ($melisBOEmailsDetailsResult[$i]['boed_subject']) ? $melisBOEmailsDetailsResult[$i]['boed_subject'] : $subject,
    	                                    'html' => ($melisBOEmailsDetailsResult[$i]['boed_html']) ? $melisBOEmailsDetailsResult[$i]['boed_html'] : $html,
    	                                    'text' => ($melisBOEmailsDetailsResult[$i]['boed_text']) ? $melisBOEmailsDetailsResult[$i]['boed_text'] : $text,
    	                                );
	                                }
	                            }
	                        }
	                    }
	                }
	                
	                // Merging DB email configuration and Email Application Configuration
	                $result = array_merge($emailsConfig, $result);
	            }
	        }
	        
	        if (empty($result['headers'])){
	            // Get Email App
	            $melisMelisCoreConfig = $this->getServiceLocator()->get('config');
	            $emailsConfig = (isset($melisMelisCoreConfig['plugins']['meliscore']['emails'][$codename])) ? $melisMelisCoreConfig['plugins']['meliscore']['emails'][$codename] : array();
	             
	            $result['email_name']           = (isset($emailsConfig['email_name'])) ? $emailsConfig['email_name'] : '';
	            $result['layout']               = (isset($emailsConfig['layout'])) ? $emailsConfig['layout'] : '';
	            $result['headers']['from']      = (isset($emailsConfig['headers']['from'])) ? $emailsConfig['headers']['from'] : '';
	            $result['headers']['from_name'] = (isset($emailsConfig['headers']['from_name'])) ? $emailsConfig['headers']['from_name'] : '';
	            $result['headers']['replyTo']   = (isset($emailsConfig['headers']['replyTo'])) ? $emailsConfig['headers']['replyTo'] : '';
	            $result['headers']['tags']      = (isset($emailsConfig['headers']['tags'])) ? $emailsConfig['headers']['tags'] : '';
	            $result['layout_title']         = (isset($emailsConfig['layout_title'])) ? $emailsConfig['layout_title'] : $cfgLayoutTitle;
	            $result['layout_logo']          = (isset($emailsConfig['layout_logo'])) ? $emailsConfig['layout_logo'] : $cfgLayoutLogo;
	            $result['layout_ftr_info']      = (isset($emailsConfig['layout_ftr_info'])) ? $emailsConfig['layout_ftr_info'] : $cfgLayoutFtrInfo;

                $coreLang = $this->getServiceLocator()->get('MelisCoreTableLang');
                
                $localeLang = 'en_EN';
                
                if ($langId!=null){
                    
                    $localeLang = $coreLang->getEntryById($langId);
                    
                    if (!empty($localeLang)){
                        $localeLang = $localeLang->current();
                        $localeLang = $localeLang->lang_locale;
                    }
                }
                
                $result['contents'][$localeLang] = array(
                    'subject' => (isset($emailsConfig['contents'][$localeLang]['subject'])) ? $melisCoreTranslation->getMessage($emailsConfig['contents'][$localeLang]['subject'],$localeLang) : '',
                    'html' => (isset($emailsConfig['contents'][$localeLang]['html'])) ? $melisCoreTranslation->getMessage($emailsConfig['contents'][$localeLang]['html'],$localeLang) : '',
                    'text' => (isset($emailsConfig['contents'][$localeLang]['text'])) ? $melisCoreTranslation->getMessage($emailsConfig['contents'][$localeLang]['text'],$localeLang) : '',
                );
	        }
	    }
	    
	    return $result;
	}
	
	/**
	 * Sending Email using Back Office Email Service
	 * @param string $codename - codename of the email
	 * @param array $tags - containing the accepted tags that will replace to the same same on email content
	 * @param string $email_to - email address of the reciever
	 * @param string $name_to - name of the reciever
	 * @param int $langId - Id/primary key on the Corelanguage
	 * @return Boolean - return TRUE if send successfully otherwise FALSE
	 * 
	 * @return boolean
	 */
	public function sendBoEmailByCode($codename, $tags, $email_to, $name_to = null, $langId = null) {
	    
	    // Getting the Current Dev. Environment
	    $configPath = 'meliscore/datas';
	    $melisConfig = $this->getServiceLocator()->get('MelisCoreConfig');
	    $emailCfg = $melisConfig->getItemPerPlatform($configPath);
	    $emailActive = (isset($emailCfg['emails']['active'])) ? $emailCfg['emails']['active'] : 0;
	    
	    // Return FALSE if the email is not active
	    if (!$emailActive){
	        return FALSE;
	    }
	    
	    $emailsPropertiesAndDetails = $this->getBoEmailByCode($codename, $langId);
	    
	    $sendFlag = FALSE;
	    
	    if (!empty($emailsPropertiesAndDetails)){
	        if (!empty($emailsPropertiesAndDetails['headers'])){
	            $emailHeaders = $emailsPropertiesAndDetails['headers'];
	            
	            // Email Headers variables
	            $email_from         = $emailHeaders['from'];
	            $from_name          = $emailHeaders['from_name'];
	            $replyTo            = $emailHeaders['replyTo'];
	            $emailAcceptedTags  = explode(',', $emailHeaders['tags']);
	            $layout             = $emailsPropertiesAndDetails['layout'];
	            $layoutTitle        = $emailsPropertiesAndDetails['layout_title'];
	            $layoutLogo         = $emailsPropertiesAndDetails['layout_logo'];
	            $layoutFtrInfo      = $emailsPropertiesAndDetails['layout_ftr_info'];

	            $emailPropertiesDetails = $emailsPropertiesAndDetails['contents'];
	            
	            if (!empty($emailPropertiesDetails)&&!empty($email_to)&&!empty($email_from)){
	                
	                if(is_array($tags)){
	                    
	                    $acceptedTags = array();
	                    // Parsing Param Tags
	                    // Getting only the Accepted Tag base on data stored on App.emails.php and Database
	                    foreach ($tags As $key => $val){
	                        // Checking Accepted Tags on Param Tags is Allowable base on data from Database
                            if (!empty(preg_grep( "/".$key."/i" , $emailAcceptedTags ))){
	                            $acceptedTags[$key] = $val;
	                        }
	                    }
	                    
	                    if (!empty($acceptedTags)){
	                        
	                        foreach ($acceptedTags As $tagKey => $tagVal){
	                            
	                            foreach ($emailPropertiesDetails As $proKey => $proVal){
	                                // Replacing Accepted Tag on Email content with certain values
	                                // Using the Case-insensitave PHP funation str_ireplace()
	                                $emailPropertiesDetails[$proKey]['html'] = str_ireplace('['.$tagKey.']', $tagVal  ,$proVal['html']);
	                                $emailPropertiesDetails[$proKey]['text'] = str_ireplace('['.$tagKey.']', $tagVal  ,$proVal['text']);
	                            }
	                        }
	                    }
	                }
	                
	                $sendEmailBO = $this->getServiceLocator()->get('MelisCoreEmailSendingService');
	                
	                foreach ($emailPropertiesDetails As $key => $val){
	                    $subject = $emailPropertiesDetails[$key]['subject'];
	                    // initializing content of the email
	                    // if html doesn;t hav value text version can be use as email content
	                    $message_text = ($emailPropertiesDetails[$key]['text']) ? $emailPropertiesDetails[$key]['text'] : '';
	                    $message_html = ($emailPropertiesDetails[$key]['html']) ? $emailPropertiesDetails[$key]['html'] : $message_text;
	                    
	                    // Email Content Must have value/data to be sent
	                    if (!empty($message_html)){
    	                    $layoutFlag = FALSE;
    	                    
    	                    if (!empty($layout)){
    	                        
    	                        $layoutPathValidator = new \Laminas\Validator\File\Exists();
    	                         
    	                        if ($layoutPathValidator->isValid(__DIR__ .'/../../../'.$layout)) {
    	                            $layout = __DIR__ .'/../../../'.$layout;
    	                            $layoutFlag = TRUE;
    	                        }elseif ($layoutPathValidator->isValid($_SERVER['DOCUMENT_ROOT'] .'/../module/'.$layout)){
    	                            $layout = $_SERVER['DOCUMENT_ROOT'] .'/../module/'.$layout;
    	                            $layoutFlag = TRUE;
    	                        }
    	                        
    	                        if ($layoutFlag){
    	                            // Allow file with 'phtml' extension
    	                            $layoutExtensionValidator = new \Laminas\Validator\File\Extension('phtml');
    	                             
    	                            if ($layoutExtensionValidator->isValid($layout)) {
    	                                $layoutFlag = TRUE;
    	                            }
    	                        }
    	                        
    	                        if ($layoutFlag){
    	                            
            	                    $view       = new \Laminas\View\Renderer\PhpRenderer();
            	                    $resolver   = new \Laminas\View\Resolver\TemplateMapResolver();
            	                    $resolver->setMap(array(
            	                        'mailTemplate' => $layout,
            	                    ));
            	                    $view->setResolver($resolver);
            	                     
            	                    $host = $emailCfg['host'];

            	                    $headerLogo = $emailCfg['logo'];
            	                    $viewModel  = new \Laminas\View\Model\ViewModel();
            	                    $viewModel->setTemplate('mailTemplate')->setVariables(array(
                                        'title' => $layoutTitle,
                                        'headerLogoLink' => $host,
            	                        'headerLogo' => $host.$layoutLogo,
            	                        'footerInfo' => $layoutFtrInfo,
            	                        'content' => wordwrap($message_html,FALSE),
            	                        'fromName' => $from_name
            	                    ));
            	                    
            	                    $message_html = $view->render($viewModel);
    	                        }
    	                    }
    	                    
    	                    // If Layout is not Defined or it has no value
    	                    // or the layout path is not valid or extension is not valid either
    	                    if (empty($layout)||!$layoutFlag){
    	                        
    	                        // Layout of the email will use the Default Layout
    	                        $view       = new \Laminas\View\Renderer\PhpRenderer();
    	                        $resolver   = new \Laminas\View\Resolver\TemplateMapResolver();
    	                        $resolver->setMap(array(
    	                            'mailTemplate' => __DIR__ .'/../../view/layout/layoutEmailDefault.phtml',
    	                        ));
    	                        $view->setResolver($resolver);
    	                        
    	                        $viewModel  = new \Laminas\View\Model\ViewModel();
    	                        $viewModel->setTemplate('mailTemplate')->setVariables(array(
    	                            'content' => wordwrap($message_html,FALSE),
    	                        ));
    	                         
    	                        $message_html = $view->render($viewModel);
    	                    }
    	                    
    	                    // Send Email
    	                    $sendEmailBO->sendEmail($email_from, $from_name, $email_to, $name_to, $replyTo, $subject, $message_html, $message_text);
    	                    // Set Flag to TRUE after executing Sending of Email function
    	                    $sendFlag = TRUE;
    	                    // Break Foreach loop After sending email, to avoid multiple sending of differennt email languages
    	                    break;
	                    }
	                }
	            }
	        }
	    }
	    
	    return $sendFlag; 
	}
}