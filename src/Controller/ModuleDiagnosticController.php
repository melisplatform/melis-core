<?php 
namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use MelisCore\Service\MelisCoreRightsService;
use Zend\Session\Container;
use Zend\Json\Json;

class ModuleDiagnosticController extends AbstractActionController
{

    public function toolContainerAction()
    {
        return new ViewModel();
    }
    
    public function toolHeaderAction()
    {
        $view = new ViewModel();
        $view->title = $this->getTool()->getTitle();
        return $view;
    }
    
    public function toolContentAction()
    {
        $view = new ViewModel();
        $modules = $this->getAvailableModules();
        
        if (in_array('MelisModuleConfig', $modules))
        {
            $tmpMods = array();
            foreach ($modules as $module)
                if ($module != 'MelisModuleConfig')
                    array_push($tmpMods, $module);
            $modules = $tmpMods;
        }

        $view->modules = $modules;
        
        return $view;
    }
    
    public function toolHeaderRunAllAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        return $view;
    }
    

    /**
     * This action usually checks the module rights 
     */
    public function startAction()
    {
        $next    = '';
        $progCtr = 30;
        $messages = array();
        $stopProcess = 0;
        
        if($this->getRequest()->isPost()) {

            $module = $this->getRequest()->getPost('module');
            $modPath = $this->getModuleSvc()->getModulePath($module, true);
            
            array_push($messages, array('success' => 1, 'message' => $this->getText('tr_melis_module_diag_check_rights', $module)));
            
            if($module && file_exists($modPath)) {
               
                $foldersToCheck = array($modPath.'/language', $modPath.'/public');
                foreach($foldersToCheck as $dirContent) {
                    array_push($messages, array('success' => 1, 'message' => $this->getText('tr_melis_module_diag_folder_check', $dirContent)));
                    if(is_readable($dirContent) && is_writable($dirContent)) {
                        array_push($messages, array('success' => 1, 'message' => $this->getText('tr_melis_module_rights_ok', $dirContent)));
                    }
                    else {
                        array_push($messages, array('success' => 0, 'message' => $this->getText('tr_melis_module_check_rights', $dirContent)));
                    }
                }
                
            }
            else {
                array_push($messages, array('success' => 0, 'message' => $this->getText('tr_melis_module_diag_folder_not_exists', $module)));
                $stopProcess = 1;
            }
            
            $next = 'testDiagnosticControllers';
        }
        
        return new JsonModel(array(
           'next' => $next,
           'progressBarValue' => $progCtr,
           'stopProcess' => $stopProcess,
           'messages' => $messages
        ));
    }
    
    /**
     * This test reads the diagnostic.config.php from the target module
     * then reads through all the configuration to test its actions.
     * @return \Zend\View\Model\JsonModel
     */
    public function testDiagnosticControllersAction()
    {
        $next    = '';
        $progCtr = 40;
        $messages = array();
        $stopProcess = 0;
        $results = array();
        $label = '';
        $actionResult = '';
        if($this->getRequest()->isPost()) {
        
            $module = $this->getRequest()->getPost('module');
            $moduleListener = strtolower($module);
        
            $results = array();
            $config = $this->getServiceLocator()->get('MelisCoreConfig');
            $diagCfg = $config->getItem('diagnostic/'.$module);
            $cfgPath = $this->getModuleSvc()->getModulePath($module).'/config/diagnostic.config.php'; 
            
            if(file_exists($cfgPath)) {
                if($diagCfg) {
                    foreach($diagCfg as $actionName => $actionChild) {
                        $results[$actionName] = $this->forward()->dispatch($module.'\\Controller\\'.$actionChild['controller'],
                            array_merge(array('action' => $actionChild['action']), array('payload' => $diagCfg[$actionName]['payload'])))->getVariables();
                    }
                }
                else {
                    array_push($messages, array('success' => 0, 'message' => $this->getText('tr_melis_module_controller_action_warn', array($module))));
                }
                
                    
                if(!empty($results)) {
                    foreach($results as $resultKey => $resultContent) {
                
                        $success = (int) $resultContent['success'];
                        $label = $resultContent['label'];
                        $result = print_r($resultContent['result'], 1);
                        $actionResult = str_replace('<br/>', '\\n', $result);
                        if($success == 1) {
                            array_push($messages, array('success' => 1, 'message' => '<strong>'.$label . '</strong><br/><pre>' . $this->formatResult($actionResult) .'</pre>'));
                        }
                        else {
                            $testDisplay = '<strong>'.$label . '</strong><br/><pre>' . $this->formatResult($actionResult) .'</pre>';
                            array_push($messages, array('success' => $success, 'message' => $testDisplay . '<p class="text-danger">'.$resultContent['error'] . '</p>'));
                        }
                    }
                }
            }
            else {
                array_push($messages, array('success' => 0, 'message' => $this->getText('tr_melis_test_config_not_found', array($cfgPath))));
            }

            
            $next = 'finishTest';
        }
    
        return new JsonModel(array(
            'next' => $next,
            'progressBarValue' => $progCtr,
            'stopProcess' => $stopProcess,
            'messages' => $messages
        ));
    }
    
    /**
     * This test will just check the module.config.php route configuration of the module
     * @return \Zend\View\Model\JsonModel
     */
    public function testRouteAction()
    {
        $next    = '';
        $progCtr = 20;
        $messages = array();
        $stopProcess = 0;
        
        if($this->getRequest()->isPost()) {
        
            $module = $this->getRequest()->getPost('module');
            
            array_push($messages, array('success' => 1, 'message' => $this->getText('tr_melis_module_controller_check_route', $module)));
            $route = $this->getModuleParentRoute($module);
            if($route) {
                array_push($messages, array('success' => 1, 'message' => $this->getText('tr_melis_module_controller_testing_route', $route)));
                $urlStatus = $this->getUrlStatus($route);
                array_push($messages, array('success' => 1, 'message' => $this->getText('tr_melis_module_controller_route_test_results', $urlStatus)));
            }
            else {
                array_push($messages, array('success' => 2, 'message' => $this->getText('tr_melis_module_controller_testing_route_not_found', array($module,$module))));
            }
            $next = 'finishTest';
        }
        
        return new JsonModel(array(
            'next' => $next,
            'progressBarValue' => $progCtr,
            'stopProcess' => $stopProcess,
            'messages' => $messages
        ));
    }
    

    /**
     * Wrapping up the test done.
     */
    public function finishTestAction()
    {
        $next    = '';
        $progCtr = 30;
        $messages = array();
        $stopProcess = 1;
        
        if($this->getRequest()->isPost()) {
        
            $module = $this->getRequest()->getPost('module');
            array_push($messages, array('success' => 1, 'message' => $this->getText('tr_melis_module_ending_test', $module)));

        }
        
        return new JsonModel(array(
            'next' => $next,
            'progressBarValue' => $progCtr,
            'stopProcess' => $stopProcess,
            'messages' => $messages
        ));
    }

    
    /**
     * Returns all the available module folders inside module directory, but it will
     * exclude those system modules, see $moduleExceptions variable
     */
    protected function getAvailableModules()
    {
        $modules = $this->getModuleSvc()->getActiveModules(); 
        return $modules;
    }


    
    protected function getDir($dir, $excludeSubFolders = array())
    {
        $directories = array();
        if(file_exists($dir)) {
            $excludeDir = array_merge(array('.', '..', '.gitignore'), $excludeSubFolders);
            $directory  = array_diff(scandir($dir), $excludeDir);
    
            foreach($directory as $d) {
                if(is_dir($dir.'/'.$d)) {
                    $directories[] = $d;
                }
            }
    
        }
    
        return $directories;
    }
    
    protected function checkDir($dir, $dirOnly = false)
    {
        $chkDir = @scandir($dir);
        $directories = array();
        
        if(file_exists($dir)) {
            foreach($chkDir as $parentDir => $directory) {
                if($directory != '.' && $directory != '..') {
                    if(is_dir($dir.'/'.$directory)){
                        $directories[$dir.'/'.$directory] = $this->checkDir($dir.'/'.$directory);
                    }
                    else {
                        if(!$dirOnly) {
                            $directories['FILE'][$directory] = $dir.'/'.$directory;
                        }
                    }
                }
            }
        }

        if($dirOnly) {
            foreach($directories as $dirKey => $dirVal) {
                $tmpDir[] = $dirKey;
            }
            unset($directories);
            $directories = array_diff($tmpDir, array('FILE'));
        }
        
        return $directories;
    }
    
    protected function getFiles($dir) 
    {
        $file = null;
        $files = $this->checkDir($dir);
        foreach($files as $parentDir => $directory) {

            foreach($directory as $key => $f) {
                if(@is_dir($dir.'/'.$f)) {
                    $file[] = $this->getFiles($dir.'/'.$f);
                }
                else {
                    $file[] = $this->getFiles($dir.'/'.$f);

                }
            }


        }
        
        return $file;
    }
    
    protected function getText($str, $args = array()) 
    {
        $text = vsprintf($this->getTranslator()->translate($str), $args);
        return $text;
    }

    public function testAction()
    {
        $diagCfg = $this->getModuleSvc()->getActiveModules();
        print_r($diagCfg);
        die;
    }
    

    
    protected function getModuleParentRoute($module) 
    {
        $routeCfg = $this->getServiceLocator()->get('config')['router'];
        
        $childrenRoutes = $this->getConfig('routes/melis-backoffice/child_routes/application-'.$module.'/options', $routeCfg);
        $uri = $this->getDomain();
        if(isset($childrenRoutes['route'])) {
            $moduleRoute = $uri . '/melis/' . $childrenRoutes['route'];
            return $moduleRoute;
        }
        else {
            return null;
        }

        
    }
    
    /**
     * Returns the header status of the URL
     * @param unknown $url
     */
    protected function getUrlStatus($url)
    {
        if($this->isValidUrl($url)) {
            ini_set('allow_url_fopen', 1);
            $url = @get_headers($url, 1);
            if($url) {
                $status = explode(' ',$url[0]);
                return (int) $status[1];
            }
        }
        else {
            return 404;
        }
    }
    
    /**
     * Make sure we have a valid URL when accessing a page
     * @param String $url
     */
    protected function isValidUrl($url)
    {
        $valid = false;
    
        $parseUrl = parse_url($url);
    
        if(isset($parseUrl['host']) || !empty($parseUrl['host'])) {
    
            $uri = new \Zend\Validator\Uri();
            if ($uri->isValid($url)) {
                $valid = true;
            }
            else {
                $valid = false;
            }
        }
    
        return $valid;
    }
    


    
    protected function getItemRec($pathTab, $position, $configTab)
    {
        if (!empty($pathTab[$position]))
        {
            foreach($configTab as $keyConfig => $valueConfig)
            {
                if ($pathTab[$position] == $keyConfig)
                    return $this->getItemRec($pathTab, $position + 1, $configTab[$keyConfig]);
            }
             
            return array();
        }
        else
        {
            if ($position == 0)
                return $this->getItemRec($pathTab, $position + 1, $configTab);
                else
                    return $configTab;
        }
         
    }
    
    protected function getConfig($pathString, $configArray, $delimiter = '/')
    {
        $path = explode($delimiter, $pathString);
        return $this->getItemRec($path, 0, $configArray);
    }
    
    protected function getTranslator()
    {
        return $this->getServiceLocator()->get('translator');
    }
    
    /**
     * Returns the current URL of the page
     * @return string
     */
    protected function getDomain()
    {
        $uri = $this->getServiceLocator()->get('Application')->getMvcEvent()->getRequest()->getUri();
        return sprintf('%s://%s', $uri->getScheme(), $uri->getHost());
    }
    
    protected function formatResult($result) 
    {
        $result = htmlentities($result);
        $rep = array('Array', '(', ')', '[', ']', '\t', '\n');
        $result = str_replace($rep, '', $result);
        
        return $result;
    }
    
    protected function getTool()
    {
        $toolSvc = $this->getServiceLocator()->get('MelisCoreTool');
        $toolSvc->setMelisToolKey('melisModuleDiagnostics', 'melis_module_diagnostic_tool_config');
    
        return $toolSvc;
    }
    
    protected function getModuleSvc()
    {
        $modulesSvc = $this->getServiceLocator()->get('ModulesService');
        return $modulesSvc;
    }
}