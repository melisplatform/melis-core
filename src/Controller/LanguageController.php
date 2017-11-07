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
 * This class deals with the languages button in the header
 */
class LanguageController extends AbstractActionController
{
    const TOOL_INDEX = 'meliscore';
    const TOOL_KEY = 'meliscore_language_tool';
    const INTERFACE_KEY = 'meliscore_tool_language';

    /**
     * Shows language button in right corner of header
     *
     * @return \Zend\View\Model\ViewModel
     */
    public function headerLanguageAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $tableLang = $this->getServiceLocator()->get('MelisCoreTableLang');
        $moduleSvc = $this->getServiceLocator()->get('ModulesService');
        $datasLang = $tableLang->fetchAll();

        // Get the locale from session
        $container = new Container('meliscore');
        $currentLangLocale = $container['melis-lang-locale'];
        $currentLangLocale = explode('_', $currentLangLocale);
        $currentLangLocale = $currentLangLocale[0];

        // Get the langId from session
        $container = new Container('meliscore');
        $currentLangId = 1;
        if (!empty($container['melis-lang-id']))
            $currentLangId = $container['melis-lang-id'];

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->languages = $datasLang->toArray();
        $view->currentLangId = $currentLangId;
        $view->currentLangLocale = $currentLangLocale;
        $view->flagImagePath = $moduleSvc->getModulePath('MelisCore').'/public/assets/images/lang/';

        return $view;
    }

    /**
     * Change the language
     *
     * @return \Zend\View\Model\JsonModel
     */
    public function changeLanguageAction()
    {
        $langId = $this->params()->fromQuery('langId', null);
        $locale = '';
        $success = true;
        $errors = array();
        if (empty($langId) || !is_numeric($langId) || $langId <= 0)
            $success = false;

        $melisLangTable = $this->serviceLocator->get('MelisCore\Model\Tables\MelisLangTable');
        $melisUserTable = $this->serviceLocator->get('MelisCore\Model\Tables\MelisUserTable');
        $melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');

        $datasLang = $melisLangTable->getEntryById($langId);

        // If the language was found and then exists
        if (!empty($datasLang))
        {
            $datasLang = $datasLang->current();
            
            // Update session locale for melis BO
            $container = new Container('meliscore');
            if($container) {
                $container['melis-lang-id'] = $langId;
                if(isset($datasLang->lang_locale)){
                    $container['melis-lang-locale'] = $datasLang->lang_locale;
                    $container['melis-login-lang-locale'] = $datasLang->lang_locale;
                }
            }
            
            // If user is connected
            if ($melisCoreAuth->hasIdentity())
            {
                // Get user id from session auth
                $userAuthDatas =  $melisCoreAuth->getStorage()->read();
                $userId = $userAuthDatas->usr_id;

                // Update auth user session
                $userAuthDatas->usr_lang_id = $langId;

                // Update user table
                $datasUser = $melisUserTable->save(array('usr_lang_id' => $langId), $userId);
                
                $flashMsgSrv = $this->getServiceLocator()->get('MelisCoreFlashMessenger');
                $flashMsgSrv->clearFlashMessage();
                $this->getEventManager()->trigger('meliscore_get_recent_user_logs', $this, array());
            }
        }
        else
        {
            $success = false;
            $errors[] = 'Language not found';
        }

        $jsonModel = new JsonModel();
        $jsonModel->setVariables(array(
            'success' => $success,
            'errors' => $errors,
        ));

        return $jsonModel;
    }

    /**
     * Returns a Javascript format of Melis Translations
     */
    public function getTranslationsAction()
    {
        // Get the current language
        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];


        $translator = $this->getServiceLocator()->get('translator');
        $melisTranslation = $this->getServiceLocator()->get('MelisCoreTranslation');

        // Set the headers of this route
        $response = $this->getResponse();
        $response->getHeaders()
            ->addHeaderLine('Content-Type', 'text/javascript; charset=utf-8');

        $translationCompilation = '';
        foreach($melisTranslation->getTranslationMessages($locale) as $transKey => $transValue)
        {
            $translationCompilation .= "translations['".$transKey."'] = '" . $transValue . "';".PHP_EOL;
        }

        $scriptContent = '';
        $scriptContent .= 'var melisLangId = "' . $locale . '";' . PHP_EOL;
        $scriptContent .= 'var melisDateFormat = "'. $melisTranslation->getDateFormat($locale) . '";'. PHP_EOL;
        $scriptContent .= 'var translations = new Object();'. PHP_EOL;
        $scriptContent .= $translationCompilation;
        $response->setContent($scriptContent);


        $view = new ViewModel();
        $view->setTerminal(true);
        $view->contentHeaders = $response->getContent();
        return $view;
    }

    public function getTransAction()
    {
        return new ViewModel();
    }


    /**
     * Creates translations for table actions in tools
     *
     * @return \Zend\View\Model\JsonModel
     */
    public function getDataTableTranslationsAction()
    {
        // Get the current language
        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];

        $translator = $this->getServiceLocator()->get('translator');

        $transData = array(
            'sEmptyTable' => $translator->translate('tr_meliscore_dt_sEmptyTable'),
            'sInfo' => $translator->translate('tr_meliscore_dt_sInfo'),
            'sInfoEmpty' => $translator->translate('tr_meliscore_dt_sInfoEmpty'),
            'sInfoFiltered' => $translator->translate('tr_meliscore_dt_sInfoFiltered'),
            'sInfoPostFix' => $translator->translate('tr_meliscore_dt_sInfoPostFix'),
            'sInfoThousands' => $translator->translate('tr_meliscore_dt_sInfoThousands'),
            'sLengthMenu' => $translator->translate('tr_meliscore_dt_sLengthMenu'),
            'sLoadingRecords' => $translator->translate('tr_meliscore_dt_sLoadingRecords'),
            'sProcessing' => $translator->translate('tr_meliscore_dt_sProcessing'),
            'sSearch' => $translator->translate('tr_meliscore_dt_sSearch'),
            'sZeroRecords' => $translator->translate('tr_meliscore_dt_sZeroRecords'),
            'oPaginate' => array(
                'sFirst' => $translator->translate('tr_meliscore_dt_sFirst'),
                'sLast' => $translator->translate('tr_meliscore_dt_sLast'),
                'sNext' => $translator->translate('tr_meliscore_dt_sNext'),
                'sPrevious' => $translator->translate('tr_meliscore_dt_sPrevious'),
            ),
            'oAria' => array(
                'sSortAscending' => $translator->translate('tr_meliscore_dt_sSortAscending'),
                'sSortDescending' => $translator->translate('tr_meliscore_dt_sSortDescending'),
            ),


        );

        return new JsonModel($transData);
    }

    // FOR LANGUAGE TOOL
    public function renderToolLanguageContainerAction()
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

    // HEADER SECTION
    public function renderToolLanguageHeaderAction()
    {
        $translator = $this->getServiceLocator()->get('translator');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);


        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->title = $melisTool->getTitle();

        return $view;
    }

    public function renderToolLanguageHeaderAddAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->warningLogs = $this->getWarningLogs();

        return $view;
    }
    // END HEADER SECTION

    // BODY SECTION
    public function renderToolLanguageContentAction()
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
        $view->warningLogs = $this->getWarningLogs();

        return $view;
    }

    public function renderToolLanguageContentFiltersSearchAction()
    {
        return new ViewModel();
    }

    public function renderToolLanguageContentFiltersLimitAction()
    {
        return new ViewModel();
    }

    public function renderToolLanguageContentFiltersRefreshAction()
    {
        return new ViewModel();
    }

    public function renderToolLanguageContentActionDeleteAction()
    {
        return new ViewModel();
    }

    public function renderToolLanguageContentActionApplyAction()
    {
        return new ViewModel();
    }

    public function renderToolLanguageContentActionUpdateAction()
    {
        return new ViewModel();
    }


    // END BODY SECTION


    // MODAL SECTION
    public function renderToolLanguageModalAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');

        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->emptyModal = $melisTool->getModal('meliscore_tool_language_modal_content_empty');

        return $view;
    }

    public function renderToolLanguageModalEmptyHandlerAction()
    {
        return new ViewModel();
    }

    public function renderToolLanguageModalAddHandlerAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');

        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->addModalHandler = $melisTool->getModal('meliscore_tool_language_modal_content_new');

        return $view;
    }

    public function renderToolLanguageModalAddContentAction()
    {
        // declare the Tool service that we will be using to completely create our tool.
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');

        // tell the Tool what configuration in the app.tool.php that will be used.
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);

        $view = new ViewModel();

        $view->setVariable('meliscore_tool_language_generic_form', $melisTool->getForm('meliscore_tool_language_generic_form'));

        return $view;
    }

    // MODAL SECTION

    // Events

    public function getLanguagesAction()
    {
        $langTable = $this->getServiceLocator()->get('MelisCoreTableLang');
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

            $dataCount = $langTable->getTotalData();

            $getData = $langTable->getPagedData(array(
                'where' => array(
                    'key' => 'lang_id',
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
                $tableData[$ctr]['DT_RowId'] = $tableData[$ctr]['lang_id'];
                $tableData[$ctr]['DT_RowAttr'] = array('data-locale' => $tableData[$ctr]['lang_locale']);

            }

        }


        return new JsonModel(array(
            'draw' => (int) $draw,
            'recordsTotal' => $dataCount,
            'recordsFiltered' =>  $langTable->getTotalFiltered(),
            'data' => $tableData,
        ));
    }

    public function addLanguageAction()
    {
        $response = array();
        $this->getEventManager()->trigger('meliscore_language_new_start', $this, $response);
        $langTable = $this->getServiceLocator()->get('MelisCoreTableLang');
        $translator = $this->getServiceLocator()->get('translator');


        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);
        $id = null;
        $form = $melisTool->getForm('meliscore_tool_language_generic_form');

        $success = 0;
        $errors  = array();
        $textTitle = $melisTool->getTitle();
        $textMessage = 'tr_meliscore_tool_language_add_failed';
        $melisTranslation = $this->getServiceLocator()->get('MelisCoreTranslation');
        if($this->getRequest()->isPost()) {

            $postValues = get_object_vars($this->getRequest()->getPost());
            // sanitize values
            $postValues = $melisTool->sanitizePost($postValues);
            $form->setData($postValues);

            if($form->isValid()) {

                $data = $form->getData();
                $isExistData = $langTable->getEntryByField('lang_locale', $data['lang_locale']);
                $isExistData = $isExistData->current();
                if(empty($isExistData)) {

                    $createTranslationFiles = $melisTranslation->addTranslationFiles($data['lang_locale']);
                    if($createTranslationFiles) {
                        $id = $langTable->save($data);
                        $textMessage = 'tr_meliscore_tool_language_add_success';
                        $success = 1;
                    }
                    else {
                        $textMessage = 'tr_meliscore_tool_language_permission';
                    }
                }
                else {
                    $errors = array(
                        'lang_locale' => array(
                            'locale_exists' => $translator->translate('tr_meliscore_tool_language_add_exists')
                        ),
                    );
                }

            }
            else {
                $errors = $form->getMessages();
            }

            $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
            $appConfigForm = $melisMelisCoreConfig->getItem('meliscore/tools/meliscore_language_tool/forms/meliscore_tool_language_generic_form');
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

        $this->getEventManager()->trigger('meliscore_language_new_end', $this, array_merge($response, array('typeCode' => 'CORE_LANGUAGE_ADD', 'itemId' => $id)));

        return new JsonModel($response);

    }

    public function deleteLanguageAction()
    {
        $response = array();
        $this->getEventManager()->trigger('meliscore_language_delete_start', $this, $response);
        $translator = $this->getServiceLocator()->get('translator');
        $langTable = $this->getServiceLocator()->get('MelisCoreTableLang');
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey(self::TOOL_INDEX, self::TOOL_KEY);

        $textTitle = $melisTool->getTitle();
        $textMessage = 'tr_meliscore_tool_language_delete_failed';
        $melisTranslation = $this->getServiceLocator()->get('MelisCoreTranslation');
        $doNotDelete = array('en_EN.interface.php', 'en_EN.forms.php');

        $id = null;
        $success = 0;
        $lang = '';

        if($this->getRequest()->isPost())
        {
            $id = $this->getRequest()->getPost('id');
            if(is_numeric($id))
            {
                $langData = $langTable->getEntryById($id);
                $langData = $langData->current();

                if(!empty($langData) && ($langData->lang_locale != 'en_EN'))
                {
                    $langTable->deleteById($id);
                    $textMessage = 'tr_meliscore_tool_language_delete_success';
                    $success = 1;
                }
            }
        }

        $response = array(
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'success' => $success
        );
        $this->getEventManager()->trigger('meliscore_language_delete_end', $this, array_merge($response, array('typeCode' => 'CORE_LANGUAGE_DELETE', 'itemId' => $id)));

        return new JsonModel($response);
    }

    /**
     * This allows the selected language to get new translations from melisplatform
     *
     * @return \Zend\View\Model\JsonModel
     */
    public function updateLanguageAction()
    {
        $response = array();
        $success = 0;
        $excludeModules = array('.', '..', '.gitignore', 'MelisSites', 'MelisInstaller');

        $textTitle = 'tr_meliscore_header_language_Language';
        $textMessage = 'tr_meliscore_tool_language_update_failed';

        $this->getEventManager()->trigger('meliscore_language_update_start', $this, $response);
        $translationSvc = $this->getServiceLocator()->get('MelisCoreTranslation');
        $moduleSvc = $this->getServiceLocator()->get('ModulesService');
        $vendorModules = $moduleSvc->getVendorModules();
        $melisCoreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $directory = $melisCoreConfig->getItem('meliscore/datas/default/langauges/default_trans_dir');
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $fullPathVendorModules = null;
        
        if($this->getRequest()->isPost()){
            $id = (int) $this->getRequest()->getPost('id');
            $locale = $melisTool->sanitize($this->getRequest()->getPost('locale'));
            if(!empty($locale)){
                foreach($vendorModules as $vModule) {

                    $vPath = $moduleSvc->getModulePath($vModule) . '/language/';
                    if(file_exists($vPath) && is_writable($vPath)) {
                        $fullPathVendorModules[] = array('module' => $vModule, 'path' => $vPath);
                    }
                }

                if($fullPathVendorModules) {
                    foreach($fullPathVendorModules as $vModuleConf) {
                        $success = $translationSvc->createOrUpdateTranslationFiles($vModuleConf['path'], $vModuleConf['module'], $locale);
                        if(!$success){
                            break;
                        }
                    }
                }

                if($success){
                    $textMessage = 'tr_meliscore_tool_language_edit_success';
                }
            }

        }

        $response = array(
            'textTitle' => $textTitle,
            'textMessage' => $textMessage,
            'success' => $success
        );
        $this->getEventManager()->trigger('meliscore_language_update_end', $this, $response);

        return new JsonModel($response);

    }

    /**
     * Returns the possible folder or file issues
     * @return array
     */
    private function getWarningLogs()
    {
        $melisTool  = $this->getServiceLocator()->get('MelisCoreTool');
        $moduleSvc  = $this->getServiceLocator()->get('ModulesService');
        $allModules = $moduleSvc->getAllModules();
        $excludeModules = ['MelisFront', 'MelisEngine', 'MelisInstaller', 'MelisAssetManager', 'MelisModuleConfig', 'MelisSites'];
        $modules    = [];
//         foreach($allModules as $module) {
//             if(!in_array($module, $excludeModules)) {
//                 $modules[] = $moduleSvc->getModulePath($module).'/language';
//             }
//         }

        $folderPath = [
            $_SERVER['DOCUMENT_ROOT'] . '../module/MelisModuleConfig/',
            $_SERVER['DOCUMENT_ROOT'] . '../module/MelisModuleConfig/languages',
            $_SERVER['DOCUMENT_ROOT'] . '../module/MelisModuleConfig/config',
            $_SERVER['DOCUMENT_ROOT'] . '../module/MelisModuleConfig/config/translation.list.php',
        ];

        $logs       = [];
        foreach(array_merge($modules, $folderPath) as $path) {
            if(file_exists($path)) {
                if(!is_readable($path)) {
                    // this folder is not readable
                    $logs[] = $melisTool->getTranslation('tr_meliscore_tool_language_lang_folder_not_readable', [$path]);
                }
                else {
                    if(!is_writable($path)) {
                        // this folder is not writable
                        $logs[] = $melisTool->getTranslation('tr_meliscore_tool_language_lang_folder_not_writable', [$path]);
                    }
                }
            }
//             else {
//                 $logs[] = $melisTool->getTranslation('tr_meliscore_tool_language_lang_folder_not_exist', [$path]);
//             }
        }

        return $logs;
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
