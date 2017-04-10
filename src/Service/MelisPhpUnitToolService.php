<?php

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\Config\Config;
use Zend\Config\Writer\PhpArray;
use Zend\Config\Reader\Xml;
class MelisPhpUnitToolService implements ServiceLocatorAwareInterface
{
    public $serviceLocator;

    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;
        return $this;
    }

    public function getServiceLocator()
    {
        return $this->serviceLocator;
    }

    public function setAppConfig()
    {
        $env = getenv('MELIS_PLATFORM');
        $modules = \MelisCore\MelisModuleManager::getModules();
        $loadedModules = '';

        foreach($modules as $module) {
            if(!in_array($module, ['MelisAssetManager', 'MelisModuleConfig'])) {
                $loadedModules .= "\t\t'" . $module . "'," . PHP_EOL;
            }

        }

        $config = "<?php
        return array(
            \t'modules' => array(".PHP_EOL.$loadedModules.PHP_EOL."\t),
            \t'module_listener_options' => array(
                \t\t'module_paths' => array(
                    \t\t\t'/module',
                    \t\t\t'/module/MelisSites',
                \t\t),
                \t\t'config_glob_paths' => array(
                    \t\t\t'config/autoload/global.php',
                    \t\t\t'config/autoload/platforms/".$env.".php',
                \t\t)
            \t),
        );
        ";
        $config = str_replace(array(
            '        ', '    ',
        ), '', $config);
        chmod('test', 0777);
        file_put_contents('test/test.application.config.php', $config);
        chmod('test/test.application.config.php', 0777);
    }

    /**
     * Bootstrap.php file will be created inside the test folder
     * @param String $moduleName
     * @param String $testModuleName
     * @param String $unitTestPath
     */
    public function init($moduleName, $moduleTestName, $unitTestPath = 'test')
    {
        $moduleSvc = $this->getServiceLocator()->get('ModulesService');
        $modulePath = $moduleSvc->getModulePath($moduleName);
        $bootstrapSavePath = $modulePath.'/'.$unitTestPath.'/Bootstrap.php';
        $xmlSavePath = $modulePath.'/'.$unitTestPath.'/phpunit.xml';
        $moduleTestSavePath = $modulePath.'/'.$unitTestPath.'/'.$moduleTestName.'/Controller';
        $testSavePath = $modulePath.'/'.$unitTestPath;

        $this->setAppConfig();
        if(file_exists($modulePath) && file_exists($testSavePath)) {

            $bootstrapTemplate = HTTP_ROOT . '../test/tpl/BootstrapTemplate';
            $puControllerTemplate = HTTP_ROOT . '../test/tpl/PHPUnitControllTest';
            $bootstrapContent = '';
            $xmlContent = '';
            if(file_exists($bootstrapTemplate)) {

                $bootstrapContent = file_get_contents($bootstrapTemplate);
                $bootstrapContent = sprintf($bootstrapContent, $moduleTestName);
                file_put_contents($bootstrapSavePath, $bootstrapContent);
                $xml = HTTP_ROOT.'../test/tpl/phpunitxmlTemplate';
                if(file_exists($xml)) {
                    $xmlContent = file_get_contents($xml);
                    $xmlContent = str_replace('{{moduleName}}', $moduleTestName, $xmlContent);
                    file_put_contents($xmlSavePath, $xmlContent);
                }

                if(!file_exists($moduleTestSavePath)) {
                    mkdir($moduleTestSavePath, 0777, true);

                    $tmpcontrollerName = explode("Test", $moduleTestName);
                    if(is_array($tmpcontrollerName) && !empty($tmpcontrollerName)) {
                        $controllerName = $tmpcontrollerName[0] . 'ControllerTest';
                        if(!file_exists($moduleTestSavePath.'/'.$controllerName.'.php')) {
                            $ctrlTpl = file_get_contents($puControllerTemplate);
                            $ctrlTpl = str_replace(array(
                                '{{moduleTestName}}',
                                '{{moduleTestControllerName}}',
                                '{{tableFunctions}}',
                                '{{moduleName}}'
                            ), array($moduleTestName, $controllerName, $this->getDbMethods($moduleName), $moduleName), $ctrlTpl);
                            file_put_contents($moduleTestSavePath.'/'.$controllerName.'.php', $ctrlTpl);
                        }
                    }
                }
            }
        }
        else {
            mkdir($testSavePath, 0777, true);
            $this->init($moduleName, $moduleTestName, $unitTestPath);
        }

        // Make sure the files are existing
        if(file_exists($bootstrapSavePath) && file_exists($xmlSavePath) && file_exists($moduleTestSavePath)) {
            return true;
        }

        return false;

    }

    /**
     * Simulates the PhpUnit test in a browser instead of doing it in command-line
     * @param $moduleName
     * @param $moduleTestName
     * @param string $unitTestPath
     * @return mixed|string
     */
    public function runTest($moduleName, $moduleTestName, $unitTestPath = 'test')
    {
        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        $phpUnit = $config->getItem('meliscore/datas/default/phpunit_conf')[$this->getOS()]['phpunit'];
        $phpCli  = $config->getItem('meliscore/datas/default/phpunit_conf')[$this->getOS()]['php_cli'];
        $moduleSvc = $this->getServiceLocator()->get('ModulesService');
        $modulePath = $moduleSvc->getModulePath($moduleName);
        $testSavePath = $modulePath.'/'.$unitTestPath;
        $bootstrapPath  = $modulePath.'/'.$unitTestPath.'/Bootstrap.php';
        $puXml  = $modulePath.'/'.$unitTestPath.'/phpunit.xml';
        $moduleTestSavePath = $modulePath.'/'.$unitTestPath.'/'.$moduleTestName;
        $results = '';

        // recreate the config everytime, to update the available modules
        $this->setAppConfig();
        if((file_exists($phpUnit) && $this->getOS() == 'windows') || ($this->getOS() == 'others' && $this->shellExists($phpUnit))) {

            if( file_exists($modulePath) &&
                file_exists($testSavePath) &&
                file_exists($bootstrapPath) &&
                file_exists($moduleTestSavePath)) {

                $execCommand = $phpCli. ' '.$phpUnit.' --bootstrap "'.$bootstrapPath.'" "'.$moduleTestSavePath.'" --log-junit "'.$testSavePath.'/results.xml" --configuration "'.$puXml.'"';
                $output = '';
                if($this->getOS() == 'windows') {
                    $output = shell_exec($execCommand);
                }
                else {
                    $output = shell_exec($phpUnit.' --bootstrap "'.$bootstrapPath.'" "'.$moduleTestSavePath.'" --log-junit "'.$testSavePath.'/results.xml" --configuration "'.$puXml.'"');
                }
            }
            else {
                $this->init($moduleName, $moduleTestName, $unitTestPath);
                $this->runTest($moduleName, $moduleTestName, $unitTestPath);
            }
            if(!file_exists($testSavePath)) {
                // if unitTestPath does not exists, it will create a test folder that will be used in unit testing
                $this->init($moduleName, $moduleTestName, $unitTestPath);
                $this->runTest($moduleName, $moduleTestName, $unitTestPath);
            }

        }
        else {
            $results = 'Error: <strong>'.$phpUnit.'</strong> not found, please download the latest release at : https://phar.phpunit.de/phpunit.phar';
        }


        return $results;
    }

    /**
     * Reads the PHPUnit results xml file then convert it to array
     * @param $moduleName
     * @param $moduleTestName
     * @param string $unitTestPath
     * @return array|string
     */
    public function getTestResult($moduleName, $moduleTestName, $unitTestPath = 'test')
    {
        $moduleSvc = $this->getServiceLocator()->get('ModulesService');
        $modulePath = $moduleSvc->getModulePath($moduleName);
        $resultsFile = $modulePath.'/'.$unitTestPath . '/results.xml';
        $results = array();
        if(file_exists($resultsFile)) {
            $readXml = new Xml();
            $results = $readXml->fromFile($resultsFile);

            if($results) {
                if(isset($results['testsuite'])) {
                    $results = $results['testsuite']['testsuite'];
                    $results = $this->simplifyResultsView($results);
                    unlink($resultsFile);
                }
            }
        }

        return $results;
    }

    /**
     * Simplifies the output of the PHPUnit result
     * @param $results
     * @return array|string
     */
    private function simplifyResultsView($results)
    {
        $simplified = array();
        if(is_array($results)) {
            $simplified['tests'] = array();
            $totalTests = 0;
            $totalFailed = 0;
            $totalSuccess = 0;
            if(isset($results['testcase'])) {
                $testcase = $results['testcase'];
                $totalTests = (int) $results['tests'];
                $totalFailed = (int) $results['failures'];
                $totalSuccess = $totalTests - $totalFailed;

                if($totalTests > 1) {
                    // loop through test cases

                    foreach($testcase as $count => $testChild) {
                        $status = 'success';
                        $message = '';
                        $type = '';


                        if(isset($testChild['failure'])) {
                            $status = 'failed';
                            $message = $testChild['failure']['_'];
                            $type    = $testChild['failure']['type'];
                        }
                        if(isset($testChild['error'])) {
                            $status = 'failed';
                            $message = $testChild['error']['_'];
                            $type    = $testChild['error']['type'];
                        }

                        $simplified['tests'][$count] = array(
                            'test' => pathinfo($testChild['file'])['filename'],
                            'name' => $testChild['name'],
                            'time' => $testChild['time'],
                            'status' => $status,
                            'message' => $message,
                            'type' => $type
                        );
                    }
                }
                else {
                    $status = 'success';
                    $message = '';
                    $type = '';
                    if(isset($testcase['failure'])) {
                        $status = 'failed';
                        $message = $testcase['failure']['_'];
                        $type    = $testcase['failure']['type'];
                    }
                    if(isset($testcase['error'])) {
                        $status = 'failed';
                        $message = $testcase['error']['_'];
                        $type    = $testcase['error']['type'];
                    }
                    $simplified['tests'][] = array(
                        'test' => isset($testcase['file']) ? pathinfo($testcase['file'])['filename'] : $testcase['name'],
                        'name' => $testcase['name'],
                        'time' => $testcase['time'],
                        'status' => $status,
                        'message' => $message,
                        'type' => $type
                    );
                }
            }
            $simplified['summary'] = array(
                'totalTests' => $totalTests,
                'totalSuccess' => $totalSuccess,
                'totalFailed' => $totalFailed
            );
            return $simplified;
        }
        else {
            return 'No tests found!';
        }
    }

    public function getConfig($module, $methodName)
    {
        $payloads = array();
        if($methodName) {
            $method  = strrpos($methodName, "::") !== false ? explode('::', $methodName) : null;
            if(!is_null($method) && is_array($method)) {
                $method = $method[1];
                $config = $this->getServiceLocator()->get('MelisCoreConfig');
                $payloads = $config->getItem('diagnostic/'.$module.'/methods/'. $method .'/payloads');
            }
        }

        return $payloads;
    }

    /**
     * Returns the payload data from the diagnostic.config
     * @param $module
     * @param $methodName
     * @return array
     */
    public function getPayload($module, $methodName)
    {
        $payloads = array();

        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        $payloads = $config->getItem('diagnostic/'.$module.'/methods/'. $this->getMethodName($methodName) .'/payloads');

        return $payloads;

    }

    /**
     * Returns the array values inside the db config depending on the key provided
     * @param String $module
     * @param String $methodName
     * @return array
     *
     */
    public function getTable($module, $methodName)
    {
        $db = array();
        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        $db = $config->getItem('diagnostic/'.$module.'/db/'.$this->getMethodName($methodName));
        return $db;
    }

    /**
     * Returns the method used when providing __METHOD__ in the $methodName parameter
     * @param $methodName
     * @return string
     */
    private function getMethodName($methodName)
    {
        $method = '';
        if($methodName) {
            $method  = strrpos($methodName, "::") !== false ? explode('::', $methodName) : null;
            if(!is_null($method) && is_array($method)) {
                $method = $method[1];
            }
        }

        return $method;
    }

    public function getDbMethods($module)
    {
        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        $config = $config->getItem('diagnostic/'.$module.'/db');
        $methods = $config;
        $methodLists = '';
        $methodTemplate = HTTP_ROOT . '../test/tpl/methodTemplate';
        if(file_exists($methodTemplate)) {
            $template = file_get_contents($methodTemplate);
            foreach($methods as $methodKey => $method) {
                $methodLists .= str_replace(array('{{methodName}}', '{{moduleName}}'),array($methodKey,$module),$template) .PHP_EOL;
            }
        }

        return $methodLists;
    }

    /**
     * @return string
     */
    protected function getOS()
    {
        $currentOS= '';
        if(strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $currentOS = 'windows';
        }
        else {
            // if Linux or Mac we just put others, so we can have only one configuration in MelisCore
            $currentOS = 'others';
        }

        return $currentOS;

    }

    /**
     * @param $command
     * @return bool
     */
    protected function shellExists($command)
    {
        $output = shell_exec('which ' . $command);
        if(!empty($output)) {
            return true;
        }
        return false;
    }
}