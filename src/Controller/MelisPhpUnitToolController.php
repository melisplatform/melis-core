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

class MelisPhpUnitToolController extends AbstractActionController
{

    const TEST_FAILED = 'failed';
    const TEST_PASSED = 'success';

    public function renderPhpunitContainerAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $view = new ViewModel();
        $view->isActive = $this->isActivated();
        $view->hasAccess = $this->hasAccess($melisKey);
        return $view;
    }

    public function renderPhpunitHeaderAction()
    {
        $view = new ViewModel();
        $view->title = 'Diagnostic';

        return $view;
    }

    public function renderPhpunitHeaderRunAllAction()
    {
        $view = new ViewModel([
            'warningLogs' =>  $this->checkAllModule()
        ]);

        return $view;
    }

    public function renderPhpunitContentAction()
    {
        $view = new ViewModel();
        $modules = $this->getAvailableModules();
        $config = $this->getServiceLocator()->get('MelisCoreConfig');

        if (in_array('MelisModuleConfig', $modules)) {
            $tmp = [];
            foreach ($modules as $module) {
                $hasRights = false;
                $phpUnitCfg = $config->getItem('diagnostic/' . $module);
                $modulePath = $this->getModuleSvc()->getModulePath($module);
                if($phpUnitCfg) {
                    $testFolder = isset($phpUnitCfg['testFolder']) ? $phpUnitCfg['testFolder'] : null;
                    if($this->hasRights($modulePath)) {
                        if($this->hasRights($modulePath.'/'.$testFolder)) {
                            $hasRights = true;
                        }
                    }
                }
                if ($module != 'MelisModuleConfig') {
                    $tmp[$module] = [
                        'name' => $module,
                        'hasRights' => $hasRights
                    ];
                }
            }
            $modules = $tmp;
        }

        $moduleSvc   = $this->getServiceLocator()->get('ModulesService');
        $modulesInfo = $moduleSvc->getModulesAndVersions();


        $view->modules = $modules;
        $view->warningLogs = $this->checkAllModule();
        $view->modulesInfo = $modulesInfo;

        return $view;
    }

    /**
     * Returns all the available module folders inside module directory, but it will
     * exclude those system modules, see $moduleExceptions variable
     */
    protected function getAvailableModules()
    {
        $removeModules = array('MelisInstaller', 'MelisSites', 'MelisAssetManager', 'MelisDesign');
        $availableModules = $this->getModuleSvc()->getAllModules();
        $modules = array();

        $mm            = $this->getServiceLocator()->get('ModuleManager');
        $activeModules = array_keys($mm->getLoadedModules());

        foreach ($availableModules as $module) {
            if (!in_array($module, $removeModules)) {
                if(in_array($module, $activeModules)) {
                    $modules[] = $module;
                }

            }
        }
        return $modules;
    }


    /**
     * Provides a basic information about modules before doing a test
     * @return array
     */
    protected function checkAllModule()
    {
        $modSvc = $this->getServiceLocator()->get('ModulesService');
        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        $modules = $modSvc->getActiveModules(array('MelisDesign', 'MelisModuleConfig'));
        $translate = $this->getServiceLocator()->get('translator');

        $coreModulesArray = $modSvc->getCoreModules(['melisinstaller', 'melissites', 'melisassetmanager']);
        $coreModules = array();
        foreach($coreModulesArray as $module) {
            //echo 'test';
            $coreModules[] = $module;
        }

        $modules = array_merge($modules, $coreModules);

        $testCfgDir = $_SERVER['DOCUMENT_ROOT'].'/../test';
        $testCfgFile = $testCfgDir.'/test.application.config.php';
        $logs = array();

        // TEST FOLDER
        if(!is_readable($testCfgDir)) {
            $logs[] = $testCfgDir . ' is not readable';
        }
        else {
            if(!is_writable($testCfgDir)) {
                $logs[] = $testCfgDir . ' is not writable';
            }
        }

        // TEST/test.application.config.php FOLDER
        if(!is_readable($testCfgFile)) {
            $logs[] = $testCfgFile . ' is not readable';
        }
        else {
            if(!is_writable($testCfgFile)) {
                $logs[] = $testCfgFile . ' is not writable';
            }
        }

        foreach($modules as $module) {
            $phpUnitCfg = $config->getItem('diagnostic/' . $module);

            if($phpUnitCfg) {
                $testFolder = isset($phpUnitCfg['testFolder']) ? $phpUnitCfg['testFolder'] : null;
                $moduleTest = isset($phpUnitCfg['moduleTestName']) ? $phpUnitCfg['moduleTestName'] : null;
                $modulePath = $modSvc->getModulePath($module, true);

                if(file_exists($modulePath) && !file_exists($modulePath.'/'.$testFolder)) {
                    $modulePathDisplay = $modSvc->getModulePath($module, false);
                    if(!is_readable($modulePath)) {
                        $logs[] = 'Unable to create diagnostic test on ' . $module .' (' . $modulePathDisplay .'), folder is not readable';
                    }
                    else {
                        if(!is_writable($modulePath)) {
                            $logs[] = 'Unable to create diagnostic test on ' . $module .' (' . $modulePathDisplay .'), folder is not writable';
                        }
                    }
                }

                if(file_exists($modulePath.'/'.$testFolder)) {
                    // permission force change
                    @chmod($modulePath.'/'.$testFolder, 0777);
                    if(!is_readable($modulePath.'/'.$testFolder)) {
                        $logs[] = $module.'/'.$testFolder . ' is not readable';
                    }
                }

            }
            else {
                $logs[] = $module . ' ' . $translate->translate('tr_melis_core_diagnostic_error_message');
            }

        }


        return $logs;
    }

    public function runTestAction()
    {
        $request = $this->getRequest();
        $response = $this->koMessage('No tests found!');
        if ($request->isPost()) {
            $module = $request->getPost('module');
            $config = $this->getServiceLocator()->get('MelisCoreConfig');
            $modSvc = $this->getServiceLocator()->get('ModulesService');

            if ($module) {
                $results = '';
                $statistics = '<br/>';
                $response = '<h4>Testing ' . $module . '</h4>';
                $phpUnitCfg = $config->getItem('diagnostic/' . $module);
                $testFolder = isset($phpUnitCfg['testFolder']) ? $phpUnitCfg['testFolder'] : null;
                $moduleTest = isset($phpUnitCfg['moduleTestName']) ? $phpUnitCfg['moduleTestName'] : null;
                $modulePath = $modSvc->getModulePath($module);
                $testModulePath = $modulePath.'/'.$testFolder;
                if ($phpUnitCfg && !empty($testFolder)) {

                    if(is_readable($testModulePath)) {
                        $runTestResponse = $this->getPHPUnitTool()->runTest($module, $phpUnitCfg['moduleTestName'], $phpUnitCfg['testFolder']);
                        $testResults = $this->getPHPUnitTool()->getTestResult($module, $phpUnitCfg['moduleTestName'], $testFolder);

                        if (!$testResults) {
                            $response .= $this->koMessage('No tests found!');
                        }
                        else {
                            if(isset($testResults['tests']) && $testResults['tests']) {
                                foreach($testResults['tests'] as $test) {
                                    if($test['status'] == self::TEST_FAILED) {
                                        $results .=  $this->koMessage(' <strong>' . $test['test'] . '</strong> <i class="fa fa-angle-double-right"></i> <strong>' . $test['name'] .
                                            '</strong><br/>Message:<pre>' . $test['message'] .
                                            '</pre>'.
                                            '</strong>Execution time: <strong>' . $test['time'].' sec</strong><br/>');
                                    }
                                    else {
                                        $results .=  $this->okMessage('<strong>' . $test['test'] . '</strong> <i class="fa fa-angle-double-right"></i> <strong>' . $test['name'] .
                                            '</strong><br/>Message:<pre>Test passed</pre>Execution time: <strong>' . $test['time'].' sec</strong><br/>');
                                    }
                                }
                                $summary = $testResults['summary'];
                                // change this to progress bar
                                $statistics = '<hr/><h4>Test Summary</h4><br/>

                                    <div class="col-md-6 col-sm-12">
                                    ' . $this->getProgressbarDom($summary['totalTests'], $summary['totalSuccess'], 'success') .
                                    ''.$this->getProgressbarDom($summary['totalTests'], $summary['totalFailed'], 'danger') .
                                    '
                                    </div>'.'
                                    <div class="col-md-6 col-sm-12">
                                        <p>Total success test: <strong>'.$summary['totalSuccess'].'</strong></p>
                                        <p>Total failed test:  <strong>'.$summary['totalFailed'].'</strong></p>
                                    </div><br/><p>&nbsp;&nbsp;Date &amp; time tested: <strong>'.date('Y-m-d H:i:s').'</strong> </p>'.$this->getProgressbarDom($summary['totalTests'], $summary['totalTests'], 'info', 'Total tests ');
                            }
                            else {
                                $response .= $this->koMessage('No tests found!');
                            }


                        }
                        $response .= $runTestResponse . '<br/>' . $results . $statistics;
                    }

                    if(!file_exists($testModulePath)) {
                        $response .= 'Unable to read from <strong>' . $testModulePath . '</strong>, folder does not exist.<br/>';
                        if(is_writable($modulePath)) {
                            mkdir($testModulePath, 0777, true);
                            chmod($testModulePath, 0777);
                            $response .= '<strong>'.$testFolder.'</strong> folder has been created, please re-run the test<br/>';
                        }
                        else {
                            $response .= 'Unable to create <strong>'.$testFolder.'</strong>, the directory is not writable.<br/>';
                        }
                    }
                    else {
                        if(!is_readable($testModulePath)) {
                            $response .= 'Unable to read from <strong>' . $testModulePath . '</strong><br/>';
                        }
                    }


                }
                else {
                    $response .= $this->koMessage('No tests found!');
                }
            }
        }

        return new JsonModel(array(
            'response' => $response
        ));
    }

    protected function getModuleSvc()
    {
        $modulesSvc = $this->getServiceLocator()->get('ModulesService');
        return $modulesSvc;
    }

    protected function getPHPUnitTool()
    {
        return $this->getServiceLocator()->get('MelisPhpUnitTool');
    }

    protected function deactivateModule()
    {
        $modSvc = $this->getServiceLocator()->get('ModulesService');
        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        $modules = $modSvc->getActiveModules(array('MelisDesign', 'MelisModuleConfig'));


        $coreModulesArray = $modSvc->getCoreModules(['melisinstaller', 'melissites', 'melisassetmanager']);
        $coreModules = array();
        foreach($coreModulesArray as $module) {
            //echo 'test';
            $coreModules[] = $module;
        }

        $modules = array_merge($modules, $coreModules);

        $testCfgDir = $_SERVER['DOCUMENT_ROOT'].'/../test';
        $testCfgFile = $testCfgDir.'/test.application.config.php';
        $logs = array();

        foreach($modules as $module) {
            $phpUnitCfg = $config->getItem('diagnostic/' . $module);

            if($phpUnitCfg) {
                $testFolder = isset($phpUnitCfg['testFolder']) ? $phpUnitCfg['testFolder'] : null;


                if(file_exists($modulePath) && !file_exists($modulePath.'/'.$testFolder)) {
                    $modulePathDisplay = $modSvc->getModulePath($module, false);
                    if(!is_readable($modulePath)) {
                        $logs[] = 'Unable to create diagnostic test on ' . $module .' (' . $modulePathDisplay .'), folder is not readable';
                    }
                    else {

                    }
                }

            }
            else {
                $logs[] = $module . ' does not have a diagnostic configuration';
            }

        }


        return $logs;
    }
    protected function koMessage($msg)
    {
        $content = '<span class="text-danger">'.$msg.'</span><br/>';
        return $content;
    }

    protected function okMessage($msg)
    {
        $content = '<span class="text-success">'.$msg.'</span><br/>';
        return $content;
    }

    protected function getProgressbarDom($total, $currenVal, $status = 'info', $addtlText = '')
    {
        $currenVal = (int) $currenVal;
        $total     = (int) $total;
        $width = ($currenVal / $total) * 100;
        $dom = '<div class="progress">
                  <div class="progress-bar progress-bar-'.$status.'" role="progressbar" aria-valuenow="'.$currenVal.'" aria-valuemin="0" aria-valuemax="'.$total.'" style="width: '.$width.'%;">
                    <span>'.$addtlText.' '.$currenVal.'</span>
                  </div>
                </div>';
        return $dom;
    }

    protected function hasRights($folderPath)
    {
        if(!is_readable($folderPath))
            return false;

        return true;
    }

    protected function isActivated()
    {
        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        $isActivated = $config->getItemPerPlatform('meliscore/datas');
        $isActivated = (bool) $isActivated['diagnostics']['active'];

        return $isActivated;
    }

    /**
     * Checks whether the user has access to this tools or not
     * @param $key
     * @return bool
     */
    private function hasAccess($key): bool
    {
        $hasAccess = $this->getServiceLocator()->get('MelisCoreRights')->canAccessTool($key);

        return $hasAccess;
    }


}