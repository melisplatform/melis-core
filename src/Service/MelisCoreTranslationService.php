<?php
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\I18n\Translator\Translator;
/**
 * Translation Service for retrieveing all the translation messages 
 *
 */
class MelisCoreTranslationService extends Translator implements ServiceLocatorAwareInterface, MelisCoreTranslationServiceInterface 
{
    /**
     *
     * @var $serviceLocator ServiceLocatorInterface
     */
    public $serviceLocator;
    
    /**
     *
     * @var $fmContainer Container
     */
    protected $fmContainer;
    
    
    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;
        return $this;
    }
    
    public function getServiceLocator()
    {
        return $this->serviceLocator;
    }
    
    /**
     * Re-imports translation files from all the modules and re-writes it 
     * so it can be used in Javascript or any other scripts that would like
     * to use translation on their messages
     * @param String $locale
     * @param string $textDomain
     * @return Array
     */
    public function getTranslationMessages($locale = 'en_EN', $textDomain = 'default')
    {
        // Get the translation service, so we would be able to fetch the current configs
        $translator = $this->getServiceLocator()->get('translator');
        $translation = $translator->getTranslator();
        $messages = array();
        
        // process to access the private properties of translation service
        $reflector = new \ReflectionObject($translation);
        $property = $reflector->getProperty('files');
        $property->setAccessible(true);
        $files = (array)$property->getValue($translation);
        
        if($files) {
            // re-add translation file to a new Translation Class Object
            if(isset($files['default']['*'])) {
                foreach($files['default']['*'] as $transKey => $transValues)
                {
                    $this->addTranslationFile('phparray', $transValues['filename'], 'default', $locale);
                }
                
                // Load Translation Messages
                if (!isset($this->messages[$textDomain][$locale])) {
                    $this->loadMessages($textDomain, $locale);
                }
                
                // This is where the translated mesage are stored
                $translatedMessages =  (array)$this->messages[$textDomain][$locale];
                
                
                $messages = array();
                $key = '';
                foreach($translatedMessages as $translationKey => $translationValues) {
                    $key =  str_replace("'", "\'", $translationKey);
                    $messages[$key] = str_replace("'", "\'", $translationValues);
                }
            }

        }


        
        return $messages;
        
    }
    
    public function getTranslatedMessageByLocale($locale = 'en_EN')
    {
        $modulesSvc = $this->getServiceLocator()->get('ModulesService');
        $modules = $modulesSvc->getAllModules();
        
        $moduleFolders = array();
        foreach ($modules as $module)
        {
            array_push($moduleFolders, $modulesSvc->getModulePath($module));
        }
        
        $transMessages = array();
        $tmpTrans = array();
        
        $transFiles = array(
            $locale.'.interface.php',
            $locale.'.forms.php',
        );
        
        foreach($moduleFolders as $module) {
            if(file_exists($module.'/language')) {
                foreach($transFiles as $file) {
                    if(file_exists($module.'/language/'.$file)) {
                        $tmpTrans[] = include($module.'/language/'.$file);
                    }
                }
            }
        }
        
        if($tmpTrans) {
            foreach($tmpTrans as $tmpIdx => $transKey) {
                foreach($transKey as $key => $value) {
                    $transMessages[$key] = $value;
                }
            }
        }

        return $transMessages;
        
    }
    
    public function getMessage($translationKey, $locale = 'en_EN')
    {
        if (empty($translationKey)){
            return null;
        }
        
        $getAllTransMsg = $this->getTranslatedMessageByLocale($locale);
        
        foreach($getAllTransMsg as $transKey => $transMsg) {
            if($translationKey == $transKey)
                return $transMsg;    
        }
        
        return null;
    }
    
    /**
     * Returns the date format depending on what locale
     * @param String $locale
     * @return string
     */
    public function getDateFormatByLocate($locale = en_EN)
    {
        $dFormat = '';
        switch($locale) {
            case 'fr_FR':
                $dFormat = '%d/%m/%Y %H:%M:%S';
            break;
            case 'en_EN':
            default:
                $dFormat = '%m/%d/%Y %H:%M:%S';
            break;
        }
        
        return $dFormat;
    }
    
    /**
     * For JS usage
     * @param String $locale
     * @return string
     */
    public function getDateFormat($locale = en_EN) 
    {
        $dFormat = '';
        switch($locale) {
            case 'fr_FR':
                $dFormat = 'DD/MM/YYYY';
                break;
            case 'en_EN':
            default:
                $dFormat = 'MM/DD/YYYY';
                break;
        }
        
        return $dFormat;
    }
    
    public function addTranslationFiles($locale)
    {
        $status = false;
        $excludeModules = array('.', '..', '.gitignore', 'MelisSites', 'MelisInstaller');
        $transInterface = $locale.'.interface.php';
        $transForms     = $locale.'.forms.php';
        $modules = array();
        
        $moduleSvc = $this->getServiceLocator()->get('ModulesService');
        $melisCoreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $directory = $melisCoreConfig->getItem('meliscore/datas/default/langauges/default_trans_dir');
        $vendorModules = $moduleSvc->getVendorModules();
        $userModules   = $moduleSvc->getUserModules();
        $modules = $moduleSvc->getAllModules();
        
        
        $fullPathVendorModules = array();
        $fullPathUserModules   = array();
        
        // get the full path of User Modules
        foreach($userModules as $uModule) {
            $uPath = $moduleSvc->getModulePath($uModule) . '/language/';
            if(file_exists($uPath) && is_writable($uPath)) {
                $fullPathUserModules[] = array('module' => $uModule, 'path' => $uPath);
            }
        
        }
        
        foreach($vendorModules as $vModule) {
        
            $vPath = $moduleSvc->getModulePath($vModule) . '/language/';
            if(file_exists($vPath) && is_writable($vPath)) {
                $fullPathVendorModules[] = array('module' => $vModule, 'path' => $vPath);
            }
        }
        

        
        if($fullPathUserModules) {
            foreach($fullPathUserModules as $uModuleConf) {
                $this->createOrUpdateTranslationFiles($uModuleConf['path'], $uModuleConf['module'], $locale);
            }
        }
        
        if($fullPathVendorModules) {
            foreach($fullPathVendorModules as $vModuleConf) {
                $this->createOrUpdateTranslationFiles($vModuleConf['path'], $vModuleConf['module'], $locale);
            }
        }
        
        foreach ($modules as $moduleName)
        {
            if(!in_array($moduleName, $excludeModules))
            {                
                $modules[] = $directory['path'].$moduleName;
            }
        }
        
        foreach($modules as $translationPath) {
            $truePath = $translationPath;
        
            // make sure that the created translation file exists
            if(file_exists($truePath.'/'.$transInterface)) {
                $status = true;
            }
        }
        
        return $status;
    }
    
    private function getFirstTranslationFile($directory, $lookFor = '.interface.')
    {
        if(file_exists($directory)) {
            $files = array_diff(scandir($directory), array('.', '..'));
    
            $fileName = '';
            sort($files);
            $files = array_reverse($files);
            foreach($files as $file) {
                if(strpos($file, $lookFor) !== false) {
                    $fileName = $file;
                }
            }
        }
    
        return $fileName;
    
    }
    
    public function createOrUpdateTranslationFiles($path, $module, $locale) {
        
        $result = 0;
        $cdir = scandir($path);
        $fileName = '';
        $melisCoreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
       
        $confLanguage = $melisCoreConfig->getItem('meliscore/datas/default/langauges/default_trans_files');
        $directory = $melisCoreConfig->getItem('meliscore/datas/default/langauges/default_trans_dir');
        $defaultTransInterface = $confLanguage['defaultTransInterface'];
        $defaultTransForms = $confLanguage['defaultTransForms'];
        $transInterface = $locale.'.interface';
        $transForms     = $locale.'.forms';       
        $newDir = $directory['path'].$module;
        $this->checkLanguageDirectory($newDir, $path);
        
        foreach ($cdir as $key => $value) {
            
            if (!in_array($value,array(".",".."))) {    
                
                if (is_dir($path.$value)) {                
                   
                   // recursive for commerce folder setup
                   $result = $this->createOrUpdateTranslationFiles($path.$value, $module, $locale);  
                   
                }
                
                else{
                    
                    // explode file name extensions to work both on develop and commerce modules
                    // develop translations files ex. en_EN.interface.php
                    // commerce translations files ex. en_EN.interface.variants.php , en_EN.interface.attributes.php
                    $tmp = explode(".", $value);
                    $file  = $tmp[0].'.'.$tmp[1];
                    
                    //compare if file is an interface translation
                    if($defaultTransInterface == $file) {                        
                       
                        $transFile = $transInterface;
                        $defaultFile = $defaultTransInterface;
                        
                        // append remaing file extensions to get full file name
                        for($c = 2; $c < count($tmp); $c++){
                            $transFile .= '.'.$tmp[$c];
                            $defaultFile .= '.'.$tmp[$c];
                        }
                        
                        // check if __dir__/languages/[module]/[locale].interface.* exists
                        if(!file_exists($newDir.'/'.$transFile)){
                            
                            //create new blank interface translation then copy contents
                            $this->createTranslationFile($newDir, $transFile);
                            $result = copy($path.'/'.$defaultFile, $newDir.'/'.$transFile);                               
                            
                        }else{
                            
                            // if a translations already exist then check for new or missing translation
                            $transDiff = $this->checkTranslationsDiff($path.'/'.$defaultFile, $newDir.'/'.$transFile);
                            $result = true;
                            
                            if($transDiff){
                                
                                // update current translation if there are new ones
                                $result = $this->updateTranslations($newDir.'/'.$transFile, $transDiff);                                
                            }                            
                        }                        
                    }
                    
                    // compare if file is a form translation
                    if($defaultTransForms == $file ) {
                        
                        $transFile = $transForms;
                        $defaultFile = $defaultTransForms;
                        
                        // append remaing file extensions for complete file name
                        for($c = 2; $c < count($tmp); $c++){
                            $transFile .= '.'.$tmp[$c];
                            $defaultFile .= '.'.$tmp[$c];
                        }
                        
                        // check if __dir__/languages/[module]/[locale].forms.* exists
                        if(!file_exists($newDir.'/'.$transFile)){
                            
                            //create new forms translation then copy contents
                            $this->createTranslationFile($newDir, $transFile);
                            $result = copy($path.'/'.$defaultFile, $newDir.'/'.$transFile);
                            
                        }else{
                            
                            // check for translation difference
                            $transDiff = $this->checkTranslationsDiff($path.'/'.$defaultFile, $newDir.'/'.$transFile);
                            $result = true;
                            
                            if($transDiff){
                                
                                // update current translation if there are new ones
                                $result = $this->updateTranslations($newDir.'/'.$transFile, $transDiff);
                            }
                        }
                    }                    
                }
            }
        }  

        
        return $result;
    }
    
    /**
     * Checks the language directory if the path exist, creates a directory if with english translations if not existing
     * 
     * @param string $dir The directory path of the language directory
     * @param string $modulePath The directory path of melis english translations
     * 
     * @return boolean true if existing, otherwise false if failed to create
     */
    private function checkLanguageDirectory($dir, $modulePath)
    {
        $melisCoreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $confLanguage = $melisCoreConfig->getItem('meliscore/datas/default/langauges/default_trans_files');
        $defaultTransInterface = $confLanguage['defaultTransInterface'];
        $defaultTransForms = $confLanguage['defaultTransForms'];
        $result = true;
 
        if (!file_exists($dir)) {
            $result = mkdir($dir, 0777, true);
            if(file_exists($modulePath.$defaultTransInterface)){
                copy($modulePath.$defaultTransInterface, $dir.'/'.$defaultTransInterface);
            }
            if(file_exists($modulePath.$defaultTransForms)){
                copy($modulePath.$defaultTransForms, $dir.'/'.$defaultTransForms);
            }            
        }
        
        return $result;
    }
    
    private function getTranslationFileName($fileName, $locale)
    {
        $token = strpos($fileName, '.') !== false ? explode('.', $fileName) : null;
        $newFileName = $fileName;
        if($token) {
            $newFileName = str_replace($token[0], $locale, $fileName);
        }
    
        return $newFileName;
    }
    
    private function createTranslationFile($dir, $fileName)
    {
        $content = '<?php'. PHP_EOL . 'return array(' . PHP_EOL . PHP_EOL. ');';
        if(file_exists($dir) && is_writable($dir)) {
            file_put_contents($dir.'/'.$fileName, $content);
        }
    }
    
    private function isDirEmpty($dir) {
      if (!is_readable($dir)) return NULL; 
      return (count(scandir($dir)) == 2);
    }
    
    public function getFilesByLocale($locale) 
    {
        $excludeModules = array('.', '..', '.gitignore', 'MelisSites');
        $modules = array();
        
        $modulesSvc = $this->getServiceLocator()->get('ModulesService');
        $modules = $modulesSvc->getAllModules();
        
        foreach ($modules as $moduleName)
        {
            if(!in_array($moduleName, $excludeModules))
            {
                $pathModule = $modulesSvc->getModulePath($moduleName);
                $modules[] = $pathModule.'/language';
            }
        }
        
        $translationFiles = array();
        
        foreach($modules as $translationPath) {
            
            $truePath = $translationPath;
            
            if(file_exists($truePath)) {
                $path = scandir($truePath);
                if(!empty($path)) {
                    foreach($path as $files) {
                        if(!in_array($files, $excludeModules)) {
                            
                            $fileNames = explode('.', $files);
                            if($fileNames[0] == $locale) {
                                $translationFiles[] = $truePath.'/'.$files;
                            }
                            
                        }
                    }
                }
            }
        }
        
        return $translationFiles;
    }
    
    public function getTranslationsLocale() 
    {
        $modulesSvc = $this->getServiceLocator()->get('ModulesService');
        $modules = $modulesSvc->getAllModules();
        $modulePath = $modulesSvc->getModulePath('MelisCore');
        
        $path = $modulePath.'/language/';
        $dir  = scandir($path);
        $files = array();
        foreach($dir as $file) {
             if(is_file($path.$file)) {
                 $files[] = $file;
             }
        }
        
        $locales = array();
        foreach($files as $file) {
            $locale = explode('.',$file);
            $locales[] = $locale[0];
        }
        
        // re-add locales to get the unique locales and fix proper array indexing
        $uniqueLocales = array_unique($locales);
        $newUniqueLocales = array();
        foreach($uniqueLocales as $locale) {
            $newUniqueLocales[] = $locale;
        }

        
        return $newUniqueLocales;
    }
    
    /**
     * Checks if melis translations have new updates and returns the missing translations
     * 
     * @param string $melisTrans The path of the module translation
     * @param string $currentTrans The path of the current translation
     * 
     * returns array() Returns an array of missing translations with the keys and values
     */
    public function checkTranslationsDiff($melisTrans, $currentTrans)
    {   
        
        $new = include $melisTrans;
        $new = is_array($new)? $new : array();
        $current = include $currentTrans;   
        $current = is_array($current)? $current : array();
        
        return array_diff_key($new, $current);
    }
    
    /**
     * Updates the translation files
     * 
     * @param string $currentTrans The path of the current translation
     * @param array $transDiff array of translations to be added
     * 
     * @return boolean
     */
    public function updateTranslations($currentTrans, $transDiff)
    {
        $status = false;
        $current = include $currentTrans;
        $current = is_array($current)? $current : array();
        $transUpdate =  array_merge($current, $transDiff);
       
        $content = "<?php". PHP_EOL . "\t return array(" . PHP_EOL;
        foreach($transUpdate as $key => $value){
            $content .= "\t\t'". $key . "' => '" . addslashes($value) ."'," .PHP_EOL;
        }
        $content .= "\t );" . PHP_EOL;
        
        if(file_put_contents($currentTrans, $content, LOCK_EX)){
            $status = true;
        }
        
        return $status;
        
    }

}