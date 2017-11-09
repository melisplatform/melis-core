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

    const MODULE_LOADER_FILE     = 'config/melis.module.load.php';
    private $exclude_modules     = array('MelisAssetManager', 'MelisCore', '.', '..', 'MelisSites', 'MelisEngine', 'MelisInstaller', 'MelisFront', '.gitignore', 'MelisModuleConfig');

    /**
     * Main Tool Container
     * @return \Zend\View\Model\ViewModel
     */
    public function renderToolModulesAction()
    {
        $translator = $this->getServiceLocator()->get('translator');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $noAccessPrompt = '';

        if(!$this->hasAccess('meliscore_tool_user_module_management')) {
            $noAccessPrompt = $translator->translate('tr_tool_no_access');
        }

        $melisKey = $this->params()->fromRoute('melisKey', '');

        $view = new ViewModel();
        $view->melisKey = $melisKey;

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

        $moduleSvc   = $this->getServiceLocator()->get('ModulesService');
        $modulesInfo = $moduleSvc->getModulesAndVersions();

        $view = new ViewModel();

        $view->melisKey    = $melisKey;
        $view->modules     = $this->getModules();
        $view->modulesInfo = $modulesInfo;

        return $view;
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
        $moduleLoadFile = $this->getModuleSvc()->getModulePlugins(array('MelisModuleConfig', 'MelisFront'));

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
     * Creates the module loader file and the temp holder for the enabled & disabled modules
     * @param array $modules
     */
    protected function createModuleLoaderFile($modules = array())
    {
        $status = $this->getModuleSvc()->createModuleLoader('config/', $modules, array('MelisAssetManager','meliscore', 'melisengine', 'melisfront'));
        return $status;
    }

    protected function getModuleSvc()
    {
        $modulesSvc = $this->getServiceLocator()->get('ModulesService');
        return $modulesSvc;
    }




}