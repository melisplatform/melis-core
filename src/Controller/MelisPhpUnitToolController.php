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
        $view = new ViewModel();

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
        $view = new ViewModel();

        return $view;
    }

    public function renderPhpunitContentAction()
    {
        $view = new ViewModel();
        $modules = $this->getAvailableModules();

        if (in_array('MelisModuleConfig', $modules)) {
            $tmpMods = array();
            foreach ($modules as $module)
                if ($module != 'MelisModuleConfig')
                    array_push($tmpMods, $module);
            $modules = $tmpMods;
        }

        $view->modules = $modules;
        $view->warningLogs = $this->checkAllModule();

        return $view;
    }

    /**
     * Returns all the available module folders inside module directory, but it will
     * exclude those system modules, see $moduleExceptions variable
     */
    protected function getAvailableModules()
    {
        $removeModules = array('MelisInstaller', 'MelisSites', 'MelisAssetManager');
        $availableModules = $this->getModuleSvc()->getAllModules();
        $modules = array();
        foreach ($availableModules as $module) {
            if (!in_array($module, $removeModules)) {
                $modules[] = $module;
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
        $modules = $modSvc->getActiveModules();
        unset($modules['MelisModuleConfig']);
        for($x = 0; $x < count($modules); $x++) {
            if($modules[$x] == 'MelisModuleConfig') {
                unset($modules[$x]);
            }
        }
        $coreModulesArray = $modSvc->getCoreModules(['melisinstaller', 'melissites', 'melisassetmanager']);
        $coreModules = array();
        foreach($coreModulesArray as $module) {
            $coreModules[] = $module;
        }
        $modules = array_merge($modules, $coreModules);

        $logs = array();
        foreach($modules as $module) {
            $phpUnitCfg = $config->getItem('diagnostic/' . $module);
            if($phpUnitCfg) {
                $testFolder = isset($phpUnitCfg['testFolder']) ? $phpUnitCfg['testFolder'] : null;
                $moduleTest = isset($phpUnitCfg['moduleTestName']) ? $phpUnitCfg['moduleTestName'] : null;
                $modulePath = $modSvc->getModulePath($module, true);

                if(!file_exists($modulePath.'/'.$testFolder)) {
                    if(!is_readable($modulePath)) {
                        $logs[] = 'Unable to run test on ' . $module . ', access is denied';
                    }
                }
                else {
                    if(!is_readable($modulePath.'/'.$testFolder)) {
                        $logs[] = $module.'/'.$testFolder . ' is not readable';
                    }
                    else {
                        if(!is_writable($modulePath.'/'.$testFolder)) {
                            $logs[] = $module.'/'.$testFolder . ' is not writable';
                        }
                    }
                }

            }
            else {
                $logs[] = $module . ' does not have a diagnostic configuration';
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
                $modulePath = $modSvc->getModulePath($module, true);

                if ($phpUnitCfg && !empty($testFolder)) {

                    $testModulePath = $modulePath.'/'.$testFolder;
                    if(is_readable($testModulePath) && is_writable($testModulePath)) {
                        $runTestResponse = $this->getPHPUnitTool()->runTest($module, $phpUnitCfg['moduleTestName'], $phpUnitCfg['testFolder']);
                        $testResults = $this->getPHPUnitTool()->getTestResult($module, $phpUnitCfg['moduleTestName']);

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
                            mkdir($testModulePath, 0777);
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

    public function testAction()
    {
        $command = '"C:/Program Files (x86)/Zend/ZendServer/bin/php.exe" --version';
        $command = '"C:/Program Files (x86)/Zend/ZendServer/bin/php.exe" C:/bin/phpunit.phar --bootstrap "C:/Program Files (x86)/Zend/ZendServer/data/apps/http/www.melis-commerce.local/80/_docroot_/public/../vendor/melisplatform/melis-cms/test/Bootstrap.php" "C:/Program Files (x86)/Zend/ZendServer/data/apps/http/www.melis-commerce.local/80/_docroot_/public/../vendor/melisplatform/melis-cms/test/MelisCmsTest" --log-junit "C:/Program Files (x86)/Zend/ZendServer/data/apps/http/www.melis-commerce.local/80/_docroot_/public/../vendor/melisplatform/melis-cms/test/results.xml" --configuration "C:/Program Files (x86)/Zend/ZendServer/data/apps/http/www.melis-commerce.local/80/_docroot_/public/../vendor/melisplatform/melis-cms/test/phpunit.xml"';

        $output = shell_exec($command);
        print_r($output);

        die;
    }

}