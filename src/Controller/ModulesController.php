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
use Zend\Config\Config;
use Zend\Config\Writer\PhpArray;
use MelisCalendar\Service\MelisCalendarService;
/**
 * Module Management Tool
 */
class ModulesController extends AbstractActionController
{

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
     * @return \Zend\View\Model\ViewModel
     */
    public function renderToolModulesAction()
    {
        $translator      = $this->getServiceLocator()->get('translator');
        $moduleSvc       =  $this->getServiceLocator()->get('ModulesService');
        $coreTool        =  $this->getServiceLocator()->get('MelisCoreTool');
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
     * @return \Zend\View\Model\ViewModel
     */
    public function renderToolModulesHeaderAction()
    {
        $translator = $this->getServiceLocator()->get('translator');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $zoneConfig = $this->params()->fromRoute('zoneconfig', array());

        $view = new ViewModel();
        $view->title = $translator->translate('tr_meliscore_module_management_modules');
        $view->melisKey = $melisKey;

        return $view;
    }

    /**
     * Renders the content section of the tool
     * @return \Zend\View\Model\ViewModel
     */
    public function renderToolModulesContentAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $zoneConfig = $this->params()->fromRoute('zoneconfig', array());

        $modulesInfo = $this->getModuleSvc()->getModulesAndVersions();
        $modules = $this->getModules();
        //exclude MelisDemoCms cause it is SiteModule
        // it will complicate some default layout/layout of the melis-core
        unset($modules['MelisDemoCms']);
        unset($modulesInfo['MelisDemoCms']);

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
        $hasAccess = $this->getServiceLocator()->get('MelisCoreRights')->canAccess($key);

        return $hasAccess;
    }


    /**
     * Saves the changes of the module modifications
     * @return JsonModel
     */
    public function saveModuleChangesAction()
    {
        $translator = $this->getServiceLocator()->get('translator');
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
        $tool    = $this->getServiceLocator()->get('MelisCoreTool');

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
        $tool    = $this->getServiceLocator()->get('MelisCoreTool');

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
        $modulesSvc = $this->getServiceLocator()->get('ModulesService');
        return $modulesSvc;
    }




}
