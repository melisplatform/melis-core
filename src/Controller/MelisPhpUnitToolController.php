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

        return $view;
    }

    /**
     * Returns all the available module folders inside module directory, but it will
     * exclude those system modules, see $moduleExceptions variable
     */
    protected function getAvailableModules()
    {
        $removeModules = array('MelisInstaller', 'MelisSites');
        $availableModules = $this->getModuleSvc()->getAllModules();
        $modules = array();
        foreach ($availableModules as $module) {
            if (!in_array($module, $removeModules)) {
                $modules[] = $module;
            }
        }
        return $modules;
    }

    public function runTestAction()
    {
        $request = $this->getRequest();
        $response = $this->koMessage('No tests found!');
        if ($request->isPost()) {
            $module = $request->getPost('module');
            $config = $this->getServiceLocator()->get('MelisCoreConfig');

            if ($module) {
                $results = '';
                $statistics = '<br/>';
                $response = '<h4>Testing ' . $module . '</h4>';
                $phpUnitCfg = $config->getItem('diagnostic/' . $module);
                if ($phpUnitCfg) {
                    $runTestResponse = $this->getPHPUnitTool()->runTest($module, $phpUnitCfg['moduleTestName'], $phpUnitCfg['testFolder']);
                    $testResults = $this->getPHPUnitTool()->getTestResult($module, $phpUnitCfg['moduleTestName']);

                    if (!$testResults) {
                        $response .= $this->koMessage('No tests found!sss');
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
        $content = '<span class="text-danger">KO: '.$msg.'</span><br/>';
        return $content;
    }

    protected function okMessage($msg)
    {
        $content = '<span class="text-success">OK: '.$msg.'</span><br/>';
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