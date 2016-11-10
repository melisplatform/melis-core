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
        $vendorModules = $moduleSvc->getVendorModules();
        $userModules   = $moduleSvc->getUserModules();
        $modules = $moduleSvc->getAllModules();
        
        
        $fullPathVendorModules = array();
        $fullPathUserModules   = array();
        
        // get the full path of User Modules
        foreach($userModules as $uModule) {
            $uPath = $moduleSvc->getModulePath($uModule) . '/language/';
            if(file_exists($uPath) && is_writable($uPath)) {
                $fullPathUserModules[] = $uPath;
            }
        
        }
        
        foreach($vendorModules as $vModule) {
        
            $vPath = $moduleSvc->getModulePath($vModule) . '/language/';
            if(file_exists($vPath) && is_writable($vPath)) {
                $fullPathVendorModules[] = $vPath;
            }
        }
        

        
        if($fullPathUserModules) {
            foreach($fullPathUserModules as $uModule) {
                $this->copyOrCreateTranslationFiles($uModule, $locale);
            }
        }
        
        if($fullPathVendorModules) {
            foreach($fullPathVendorModules as $vModule) {
                $this->copyOrCreateTranslationFiles($vModule, $locale);
            }
        }
        
        foreach ($modules as $moduleName)
        {
            if(!in_array($moduleName, $excludeModules))
            {
                $pathModule = $moduleSvc->getModulePath($moduleName);
                $modules[] = $pathModule.'/language';
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
    
    private function copyOrCreateTranslationFiles($dir, $locale) {
        $result = array();
        $cdir = scandir($dir);
        $fileName = '';
        
        $defaultTransInterface = 'en_EN.interface.php';
        $defaultTransForms     = 'en_EN.forms.php';
        $transInterface = $locale.'.interface.php';
        $transForms     = $locale.'.forms.php';
        
        foreach ($cdir as $key => $value) {
            if (!in_array($value,array(".",".."))) {
                if (is_dir($dir . $value)) {
                    $result[$dir .$value] = $this->copyOrCreateTranslationFiles($dir . $value, $locale);
                    $tmpdir = $dir .$value;
                    if($this->isDirEmpty($tmpdir)) {
                        $this->createTranslationFile($tmpdir, $defaultTransInterface);
                        $this->createTranslationFile($tmpdir, $transInterface);
                        
                        $this->createTranslationFile($tmpdir, $defaultTransForms);
                        $this->createTranslationFile($tmpdir, $transForms);
                    }
                }
                else {
                    $result[$dir . $value] = $value;
                    $fileName = $dir . $value;
                    
                    if(is_writable($dir)) {
                        if(!$this->isDirEmpty($dir)) {
                            $defaultTransInterface = $this->getFirstTranslationFile($dir, '.interface.') ? $this->getFirstTranslationFile($dir, '.interface.') :  $transInterface;
                            $defaultTransForms     = $this->getFirstTranslationFile($dir, '.forms.') ? $this->getFirstTranslationFile($dir, '.forms.') : $transForms;
                            
                            $transInterface = $this->getTranslationFileName($defaultTransInterface, $locale);
                            $transForms = $this->getTranslationFileName($defaultTransForms, $locale);

                            if(!file_exists($dir.'/'.$transInterface)) {
                                if(file_exists($dir.'/'.$defaultTransInterface)) {
                                    copy($dir.'/'.$defaultTransInterface, $dir.'/'.$transInterface);
                                }
                                else {
                                    $this->createTranslationFile($dir, $transInterface);
                                }
                            }
                            
                            if(!file_exists($dir.'/'.$transForms)) {
                                // check if the path has forms translations
                                if(file_exists($dir.'/'.$defaultTransForms)) {
                                    copy($dir.'/'.$defaultTransForms, $dir.'/'.$transForms);
                                }
                                else {
                                    $this->createTranslationFile($dir, $transForms);
                                }
                            }
                        }
                    }
                }
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

}