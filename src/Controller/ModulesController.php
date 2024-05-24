<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Laminas\View\Model\ViewModel;
use Laminas\View\Model\JsonModel;
use Laminas\Session\Container;
use MelisCore\Service\MelisCoreRightsService;
use Laminas\Config\Config;
use Laminas\Config\Writer\PhpArray;
use MelisCalendar\Service\MelisCalendarService;
use MatthiasMullie\Minify;
use MelisCore\View\Helper\MelisCoreHeadPluginHelper;

/**
 * Module Management Tool
 */
class ModulesController extends MelisAbstractActionController
{
    const BUNDLE_FOLDER_NAME = 'bundles-generated';

    const MODULE_LOADER_FILE = 'config/melis.module.load.php';
    private $exclude_modules = array(
        'MelisAssetManager',
        'MelisCore',
        'MelisSites',
        'MelisInstaller',
        'MelisModuleConfig',
        'MelisComposerDeploy',
        'MelisDbDeploy',
        '.', '..','.gitignore',
    );

    /**
     * Main Tool Container
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolModulesAction()
    {
        $translator      = $this->getServiceManager()->get('translator');
        $moduleSvc       =  $this->getServiceManager()->get('ModulesService');
        $coreTool        =  $this->getServiceManager()->get('MelisCoreTool');
        $modules         = $moduleSvc->getAllModules();

        $melisKey = $this->params()->fromRoute('melisKey', '');
        $noAccessPrompt = '';

        if(!$this->hasAccess('meliscore_tool_user_module_management')) {
            $noAccessPrompt = $translator->translate('tr_tool_no_access');
        }

        $request = $this->getRequest();
        $domain = isset($get['domain']) ? $get['domain'] : null;
        $scheme = isset($get['scheme']) ? $get['scheme'] : null;
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $netStatus = $coreTool->isConnected();

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->modules = serialize($modules);
        $view->scheme  = $scheme;
        $view->domain  = $domain;
        $view->netStatus  = $netStatus;

        return $view;
    }

    /**
     * Renders the header section of the tool
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolModulesHeaderAction()
    {
        $translator = $this->getServiceManager()->get('translator');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $zoneConfig = $this->params()->fromRoute('zoneconfig', array());

        $view = new ViewModel();
        $view->title = $translator->translate('tr_meliscore_module_management_modules');
        $view->melisKey = $melisKey;

        return $view;
    }

    /**
     * Renders the content section of the tool
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderToolModulesContentAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $zoneConfig = $this->params()->fromRoute('zoneconfig', array());

        $modulesInfo = $this->getModuleSvc()->getModulesAndVersions();
        $modules = $this->getModules();
        //check for sites module
        foreach ($modules as $module => $status) {
            // exclude SiteModules because
            // it will complicate the default layout/layout of the melis-core
            if ($this->getModuleSvc()->isSiteModule($module)) {
                unset($modules[$module]);
            }
        }

        $view = new ViewModel();

        $view->melisKey    = $melisKey;
        $view->modules     = $modules;
        $view->modulesInfo = $modulesInfo;

        return $view;
    }

    /**
     * Checks whether the user has access to this tools or not
     * @param $key
     * @return bool
     */
    private function hasAccess($key): bool
    {
        $hasAccess = $this->getServiceManager()->get('MelisCoreRights')->canAccess($key);

        return $hasAccess;
    }


    /**
     * Saves the changes of the module modifications
     * @return JsonModel
     */
    public function saveModuleChangesAction()
    {
        $translator = $this->getServiceManager()->get('translator');
        $request = $this->getRequest();
        $success = 0;
        $textTitle = 'tr_meliscore_module_management_modules';
        $textMessage = 'tr_meliscore_module_management_prompt_failed';

        if($request->isPost()) {
            $modules = $this->params()->fromPost();
            $moduleLists = '';
            $enabledModules = array();
            $disabledModules = array();

            foreach($modules as $moduleName => $moduleValue) {
                if((int) $moduleValue == 1) {
                    $enabledModules[] = $moduleName;
                }
            }

            $modules = $enabledModules;
            $success = $this->createModuleLoaderFile($modules) === true ? 1 : 0;

            if($success == 1) {
                $textMessage = 'tr_meliscore_module_management_prompt_success';
            }
        }
        $response = array(
            'success' => $success,
            'textTitle' => $translator->translate($textTitle),
            'textMessage' => $translator->translate($textMessage),
        );

        $this->getEventManager()->trigger('meliscore_module_management_save_end', $this, $response);

        return new JsonModel($response);
    }

    public function searchModules($useOnlySiteModule = false)
    {

        $modules = array();
        $modulesList = null;
        $moduleLoadList = file_exists(self::MODULE_LOADER_FILE) ? include(self::MODULE_LOADER_FILE) : array();
        $moduleLoadFile = $this->getModuleSvc()->getModulePlugins(array('MelisModuleConfig', 'MelisFront'));

        $modules = $moduleLoadList;
        foreach($modules as $index => $modValues) {

            $modulesList[$modValues] = 1;
        }

        // add the inactive modules
        foreach($moduleLoadFile as $index => $module) {

            if(!isset($modulesList[$module])) {
                $modulesList[$module] = 0;
            }

        }

        return $modulesList;
    }
    /**
     * Returns all the available modules (enabled/disabled modules)
     * @param bool $useOnlySiteModule | used if you want to get only the Site Modules
     * @return array
     */
    public function getModules($useOnlySiteModule = false)
    {

        $modules = array();
        $modulesList = null;
        $moduleLoadList = file_exists(self::MODULE_LOADER_FILE) ? include(self::MODULE_LOADER_FILE) : array();
        $moduleLoadFile = $this->getModuleSvc()->getModulePlugins($this->exclude_modules);

        $modules = $moduleLoadList;

        foreach($modules as $index => $modValues) {

            if(!in_array($modValues, $this->exclude_modules)) {

                if(in_array($modValues, $moduleLoadFile)) {
                    $modulesList[$modValues] = 1;
                }
                else {
                    $modulesList[$modValues] = 0;
                }
            }
        }

        // add the inactive modules
        foreach($moduleLoadFile as $index => $module) {

            if(!isset($modulesList[$module])) {
                $modulesList[$module] = 0;
            }

        }

        return $modulesList;
    }

    /**
     * Returns the module that is dependent to the provided module
     * @return JsonModel
     */
    public function getDependentsAction()
    {
        $success = 0;
        $modules = array();
        $request = $this->getRequest();
        $message = 'tr_meliscore_module_management_no_dependencies';
        $tool    = $this->getServiceManager()->get('MelisCoreTool');

        if ($request->isPost()) {
            $module = $tool->sanitize($request->getPost('module'));

            if ($module) {
                $modules = $this->getModuleSvc()->getChildDependencies($module);
                if ($modules) {
                    $message = $tool->getTranslation('tr_meliscore_module_management_inactive_confirm', array($module, $module));
                    $success = 1;
                }
            }
        }

        $response = array(
            'success' => $success,
            'modules' => $modules,
            'message' => $tool->getTranslation($message)
        );

        return new JsonModel($response);

    }

    public function getRequiredDependenciesAction()
    {
        $success = 0;
        $modules = array();
        $request = $this->getRequest();
        $tool    = $this->getServiceManager()->get('MelisCoreTool');

        if($request->isPost()) {
            $module = $tool->sanitize($request->getPost('module'));

            if($module) {
                $modules = $this->getModuleSvc()->getDependencies($module);
                if($modules) {
                    $success = 1;
                }
            }
        }

        $response = array(
            'success' => $success,
            'modules' => $modules,
        );

        return new JsonModel($response);

    }

    /**
     * Function to bundle all assets into one
     *
     * @return JsonModel
     */
    public function bundleAction()
    {
        $translator = $this->getServiceManager()->get('translator');
        $webPack = $this->getServiceManager()->get('MelisAssetManagerWebPack');

        $assets = $webPack->getAssets(false);

        /**
         * We will combine all the assets into one file
         * so it will load faster
         */
        $message = 'tr_meliscore_module_management_modules_bundle_failed';
        try {
            if(!empty($assets)){
                foreach($assets as $type => $files){
                    $vendorFileHolder = [];
                    $moduleFileHolder = [];
                    $moduleFileHolderAlreadyBundled = [];
                    /**
                     * We will separate all the already bundle file
                     * and for those who are in vendor and in module
                     * so we can re bundle the assets inside module folder in case
                     * its not yet bundled
                     */
                    $this->segregateFiles($files, $moduleFileHolder, $vendorFileHolder, $moduleFileHolderAlreadyBundled);
                    /**
                     * Lets minify all unminified files from module folder
                     */
                    $arrayPaths = [];
                    if($type == 'css')
                        $this->minifyCss($moduleFileHolder, $arrayPaths);
                    elseif($type == 'js')
                        $this->minifyJs($moduleFileHolder, $arrayPaths);

                    /**
                     * We merge all bundled files
                     */
                    $cssAssets = array_merge($vendorFileHolder, $moduleFileHolderAlreadyBundled, $arrayPaths);
                    /**
                     * Combine all
                     */
                    $this->combineAssets($cssAssets, $type);
                }

                /**
                 * Lets bundle the login assets
                 */
                $this->bundleLoginAssets();

                //save bundle cache time
                $platformTable = $this->getServiceManager()->get('MelisCoreTablePlatform');
                $platformData = $platformTable->getEntryByField('plf_name', getenv('MELIS_PLATFORM'))->current();

                if(!empty($platformData)){
                    $platformTable->save(['plf_bundle_cache_time' => time()], $platformData->plf_id);
                }
            }

            $success = true;
            $message = 'tr_meliscore_module_management_modules_bundle_success';
        }catch (\Exception $ex){
            $success = false;
        }

        return new JsonModel(array(
            'textTitle' => $translator->translate('tr_meliscore_module_management_modules_bundle'),
            'textMessage' => $translator->translate($message),
            'success' => $success,
            'errors' => []
        ));
    }

    /**
     * Function to bundle all login page assets
     */
    private function bundleLoginAssets()
    {
        $plugin = new MelisCoreHeadPluginHelper();
        $plugin->setServiceManager($this->getServiceManager());
        $assets = $plugin->__invoke('/meliscore_login');

        if(!empty($assets)){
            foreach($assets as $type => $files){
                $vendorFileHolder = [];
                $moduleFileHolder = [];
                $moduleFileHolderAlreadyBundled = [];
                /**
                 * We will separate all the already bundle file
                 * and for those who are in vendor and in module
                 * so we can re bundle the assets inside module folder in case
                 * its not yet bundled
                 */
                $this->segregateFiles($files, $moduleFileHolder, $vendorFileHolder, $moduleFileHolderAlreadyBundled);
                /**
                 * Lets minify all unminified files from module folder
                 */
                $arrayPaths = [];
                if($type == 'css')
                    $this->minifyCss($moduleFileHolder, $arrayPaths);
                elseif($type == 'js')
                    $this->minifyJs($moduleFileHolder, $arrayPaths);

                /**
                 * We merge all bundled files
                 */
                $cssAssets = array_merge($vendorFileHolder, $moduleFileHolderAlreadyBundled, $arrayPaths);
                /**
                 * Combine all
                 */
                $this->combineAssets($cssAssets, $type, 'bundle-all-login');
            }
        }
    }

    /**
     *
     * We will separate all the already bundle file
     * and for those who are in vendor and in module
     * so we can re bundle the assets inside module folder in case
     * its not yet bundled
     *
     * @param $assets
     * @param $moduleFileHolder
     * @param $vendorFileHolder
     * @param $moduleFileHolderAlreadyBundled
     */
    private function segregateFiles($assets, &$moduleFileHolder, &$vendorFileHolder, &$moduleFileHolderAlreadyBundled)
    {
        $melisAppConfig = $this->serviceManager->get('MelisConfig');
        $assetManagerService = $this->getServiceManager()->get('MelisAssetManagerModulesService');

        foreach ($assets as $key => $val) {
            $filePath = explode('/', $val);
            $modulePath = $assetManagerService->getModulePath($filePath[1], false);
            if(!empty($modulePath)){
                $moduleFilePart = explode('/', $modulePath);
                if(!empty($moduleFilePart)){
                    if($moduleFilePart[1] == 'module'){//in module
                        //check if bundle is enable
                        $appsConfig = $melisAppConfig->getItem(strtolower(end($moduleFilePart)));
                        if(!empty($appsConfig)){
                            if(isset($appsConfig['ressources']['build']['disable_bundle'])){
                                if(!$appsConfig['ressources']['build']['disable_bundle']){
                                    $moduleFileHolderAlreadyBundled[] = $val;
                                }else{
                                    $moduleFileHolder[end($moduleFilePart)][] = $val;
                                }
                            }else{
                                $moduleFileHolder[end($moduleFilePart)][] = $val;
                            }
                        }
                    }else{//in vendor
                        $vendorFileHolder[] = $val;
                    }
                }
            }else{//for special url like get-translations
                if(!empty($val))
                    $vendorFileHolder[] = $val;
            }
        }
    }

    /**
     * @param $array
     * @param $type
     * @param string $fileName
     */
    private function combineAssets($array, $type, $fileName = 'bundle-all')
    {
        if(!empty($array)){
            $jsString = '';
            foreach($array as $key => $val){
                $url = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]" . $val;
                $cleanString = file_get_contents($url);
                if($type == 'css')
                    $cleanString = $this->replaceURL($cleanString, $val);

                $jsString .= $cleanString;
            }

            $path = $this->createDIR($type);
            $file = @fopen($path.'/'.$fileName.'.'.$type, 'w+');
            @fwrite($file, $jsString);
            @fclose($file);
        }
    }

    /**
     * @param $array
     * @param $arrayPaths
     */
    private function minifyJs($array, &$arrayPaths)
    {
        $jsMinifier = new Minify\JS();
        if(!empty($array)){

            foreach($array as $moduleName => $jsFiles){
                $hostName = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]";
                foreach($jsFiles as $key => $js) {
                    $url = $hostName . $js;
                    $jsMinifier->add($this->removeComments($url));
                }
                $path = $this->createDIR('js');
                $path = $path.'/bundle-'.$moduleName.'.js';
                $jsMinifier->minify($path);
                $arrayPaths[] = '/'.self::BUNDLE_FOLDER_NAME.'/js/bundle-'.$moduleName.'.js';
            }
        }
    }

    /**
     * @param $array
     * @param $arrayPaths
     */
    private function minifyCss($array, &$arrayPaths)
    {
        $cssMinifier = new Minify\CSS();
        if(!empty($array)){

            foreach($array as $moduleName => $cssFiles){
                $hostName = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]";
                foreach($cssFiles as $key => $css) {
                    $url = $hostName . $css;
                    /**
                     * This will replace all url inside css to put the correct url
                     */
                    $fileContent = $this->replaceURL($this->removeComments($url), $css);
                    $cssMinifier->add($fileContent);
                }
                $path = $this->createDIR('css');
                $path = $path.'/bundle-'.$moduleName.'.css';
                $cssMinifier->minify($path);
                $arrayPaths[] = '/'.self::BUNDLE_FOLDER_NAME.'/css/bundle-'.$moduleName.'.css';
            }
        }
    }


    /**
     * @param $css
     * @param $filePath
     * @return mixed
     */
    private function replaceURL($css, $filePath)
    {

        $moduleName = 'MelisCore';
        if(!empty($filePath)) {
            $filePath = explode('/', $filePath);
            $moduleName = $filePath[1] ?? 'MelisCore';
        }

//        $domain = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]";
        $path = '/'.$moduleName.'/build/';
        // Clear out the line breaks
        $content = str_replace('<br />', '', $css);

        // Clear out bogus whitespace
        $content = preg_replace('/\(\s+/', '(', $content);
        $content = preg_replace('/\s+\)/', ')', $content);

        // Clear out quotes
//        $content = preg_replace('/(?:\'|\")/', '', $content);

        // Replaces repeating ../ patterns
        $content = preg_replace('/(?:\.\.\/)+(.*?\))/', $path.'$1', $content);

        // Prepend the path to lines that do not have a "//" anywhere
//        $content = preg_replace('/(url\((?!.*\/\/))/i', '$1'.$path, $content);

        return $content;
    }


    /**
     * Remove comments from the file
     * to make it will be minified
     *
     * @param $fileStr
     * @return string|string[]|null
     */
    private function removeComments($fileStr)
    {
        $fileStr = file_get_contents($fileStr);
        $text = preg_replace('!/\*.*?\*/!s', '', $fileStr);
        return $text;
    }

    /**
     * @param $name
     * @return string
     */
    private function createDIR($name)
    {
        $path = $_SERVER['DOCUMENT_ROOT'].'/'.self::BUNDLE_FOLDER_NAME.'/'.$name;

        if(!file_exists($_SERVER['DOCUMENT_ROOT'].'/'.self::BUNDLE_FOLDER_NAME.'/'))
            mkdir($_SERVER['DOCUMENT_ROOT'].'/'.self::BUNDLE_FOLDER_NAME, 0777);

        if(!file_exists($path))
            mkdir($path, 0777);

        if(!is_writable($path.'/'))
            chmod($path.'/', 0777);

        return $path;
    }

    /**
     * Creates the module loader file and the temp holder for the enabled & disabled modules
     * @param array $modules
     * @return bool
     */
    protected function createModuleLoaderFile($modules = array())
    {
        $status = $this->getModuleSvc()->createModuleLoader('config/', $modules, array('MelisAssetManager','melisdbdeploy', 'meliscomposerdeploy', 'meliscore'));
        return $status;
    }

    /**
     * @return \MelisCore\Service\MelisCoreModulesService
     */
    protected function getModuleSvc()
    {
        /**
         * @var \MelisCore\Service\MelisCoreModulesService $modulesSvc
         */
        $modulesSvc = $this->getServiceManager()->get('ModulesService');
        return $modulesSvc;
    }




}
