<?php
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use Laminas\I18n\Translator\Translator;
use Laminas\ServiceManager\ServiceManager;
use Laminas\Stdlib\ArrayUtils;
/**
 * Translation Service for retrieveing all the translation messages
 *
 */
class MelisCoreTranslationService extends Translator implements MelisCoreTranslationServiceInterface
{
    /**
     *
     * @var $fmContainer Container
     */
    protected $fmContainer;


    protected $updated;

    /**
     * @var Laminas\ServiceManager\ServiceManager $serviceManager
     */
    protected $serviceManager;

    /**
     * Mémo par requête du catalogue de traductions par locale (service singleton).
     * getTranslatedMessageByLocale() scanne les dossiers language/ de TOUS les modules et `include`
     * chaque fichier : sans cache, getMessage() le reconstruisait à CHAQUE appel (ex.
     * /rights/capabilities traduit ~150 labels → ~4,3 s). Clé = locale + liste de modules.
     * @var array<string,array>
     */
    private $translatedByLocaleMemo = [];

    /**
     * Per-request memo of getTranslationMessagesForLocale() (locale => catalogue).
     * @var array<string, array<string, string>>
     */
    private $catalogueForLocaleMemo = [];

    /**
     * @param ServiceManager $service
     */
    public function setServiceManager(ServiceManager $service)
    {
        $this->serviceManager = $service;
    }

    /**
     * @return Laminas\ServiceManager\ServiceManager
     */
    public function getServiceManager()
    {
        return $this->serviceManager;
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
        $translator = $this->getServiceManager()->get('translator');
        $translation = $translator->getTranslator();
        $messages = array();

        // Access the private "files" property. ReflectionProperty::getValue() reads
        // private/protected properties directly since PHP 8.1, so setAccessible() is a
        // no-op (and deprecated on 8.5) — omitted.
        $reflector = new \ReflectionObject($translation);
        $property = $reflector->getProperty('files');
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

    /**
     * Full back-office translation catalogue of ONE locale, built from the modules' language files
     * alone — i.e. independent of the session and of what the runtime translator happens to have
     * loaded (SECURITY, DEKRA audit action #19: the public /melis/get-translations route must answer
     * identically to every caller).
     *
     * getTranslationMessages() above cannot do that: it re-registers the files the translator loaded
     * for the CURRENT session (chosen from the session locale by every module's createTranslations()
     * at bootstrap) under whatever locale is requested — so an anonymous request for en_EN returned
     * the French set when the session was French, and the `locale` parameter had no effect at all.
     * It also pre-escapes quotes with a backslash for the old string concatenation, which json_encode
     * must not receive.
     *
     * Rules mirror what the modules' bootstraps load, deterministically:
     *  - only the modules BOOTED for this request (Laminas ModuleManager — the back-office set for
     *    /melis/*; it depends on the URL, never on the session), not every package present in
     *    vendor/ (MelisInstaller, for instance, ships a language folder but is not loaded);
     *  - every translation file found in the module's language/ folder and its sub-folders
     *    (`<locale>.<type>.php`: interface, forms, install, setup, … — MelisCommerce keeps one set
     *    per sub-module in language/<sub>/), in the bootstraps' order (interface, forms, install,
     *    setup, then the rest), later file wins for a key defined twice;
     *  - two layers: the whole fallback-locale catalogue first, the whole requested-locale
     *    catalogue on top. A key missing from a partial translation thus falls back to English
     *    instead of showing its raw key, while a translated value can never be overwritten by the
     *    English fallback of ANOTHER module that happens to define the same key;
     *  - a customised file listed in module/MelisModuleConfig/config/translation.list.php replaces
     *    the module's own file, exactly as createTranslations() does.
     *
     * @param string $locale         Well-formed locale (xx_XX) — validated by the caller.
     * @param string $fallbackLocale Locale whose files define the base catalogue (platform default).
     * @return array<string, string> translation key => text
     */
    public function getTranslationMessagesForLocale(string $locale, string $fallbackLocale = 'en_EN'): array
    {
        $memoKey = $locale . '|' . $fallbackLocale;
        if (isset($this->catalogueForLocaleMemo[$memoKey])) {
            return $this->catalogueForLocaleMemo[$memoKey];
        }

        $modulesSvc = $this->getServiceManager()->get('ModulesService');

        // Customised translations (Translations tool): "<Module>/<locale>.<type>.php" entries whose
        // file lives under module/MelisModuleConfig/languages/. Paths are relative to the project
        // root, the working directory set by public/index.php — same convention as the bootstraps.
        $overrideDir  = 'module/MelisModuleConfig/languages/';
        $overrideList = [];
        if (is_file('module/MelisModuleConfig/config/translation.list.php')) {
            $overrideList = (array) include 'module/MelisModuleConfig/config/translation.list.php';
        }

        $sm = $this->getServiceManager();
        $modules = $sm->has('ModuleManager')
            ? array_keys((array) $sm->get('ModuleManager')->getLoadedModules(false))
            : (array) $modulesSvc->getAllModules();

        $locales  = array_values(array_unique([$fallbackLocale, $locale]));
        $pattern  = '/^(' . implode('|', array_map('preg_quote', $locales)) . ')\.(.+)\.php$/';
        $layers   = array_fill_keys($locales, []); // locale => catalogue

        foreach ($modules as $module) {
            $dir = rtrim((string) $modulesSvc->getModulePath($module), '/') . '/language';
            if ($dir === '/language' || !is_dir($dir)) {
                continue;
            }

            // "<sub-folder>/<type>" => [locale => file], so that the two locales of a same file are
            // applied together, fallback first, in a stable (sorted) order.
            $byType = [];
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS)
            );
            foreach ($files as $file) {
                /** @var \SplFileInfo $file */
                if (!$file->isFile() || !preg_match($pattern, $file->getFilename(), $m)) {
                    continue;
                }
                $sub = trim(str_replace('\\', '/', substr($file->getPath(), strlen($dir))), '/');
                $byType[($sub === '' ? '' : $sub . '/') . $m[2]][$m[1]] = $file->getPathname();
            }
            // Same order as the bootstraps (interface, forms, install, setup, …): when a key is
            // defined in two files of one module, the later file wins — keep it the same file.
            $order = ['interface' => 0, 'forms' => 1, 'install' => 2, 'setup' => 3];
            uksort($byType, static function (string $a, string $b) use ($order): int {
                $ra = $order[basename($a)] ?? 9;
                $rb = $order[basename($b)] ?? 9;
                return $ra <=> $rb ?: strcmp($a, $b);
            });

            foreach ($byType as $type => $perLocale) {
                $baseType = basename($type);
                foreach ($locales as $loc) {
                    $file = $perLocale[$loc] ?? null;
                    $custom = $module . '/' . $loc . '.' . $baseType . '.php';
                    if (in_array($custom, $overrideList, true) && is_file($overrideDir . $custom)) {
                        $file = $overrideDir . $custom;
                    }
                    if ($file === null) {
                        continue;
                    }
                    $data = include $file;
                    if (is_array($data) && $data) {
                        $layers[$loc] = array_replace($layers[$loc], $data);
                    }
                }
            }
        }

        $messages = [];
        foreach ($locales as $loc) { // fallback first, requested locale on top
            $messages = array_replace($messages, $layers[$loc]);
        }

        return $this->catalogueForLocaleMemo[$memoKey] = $messages;
    }

    /**
     * Returns the translated message of the given locale
     * @param string $locale
     * @param array $moduleArr - the modules to check for, if empty, all installed modules will be checked
     * @return array
     */
    public function getTranslatedMessageByLocale($locale = 'en_EN', $moduleArr = [])
    {
        // Mémo par requête : le catalogue est invariant sur la durée de la requête (les fichiers de
        // langue ne changent pas), et le reconstruire coûte cher (I/O + include de tous les modules).
        $memoKey = $locale . '|' . implode(',', (array) $moduleArr);
        if (isset($this->translatedByLocaleMemo[$memoKey])) {
            return $this->translatedByLocaleMemo[$memoKey];
        }

        $modulesSvc = $this->getServiceManager()->get('ModulesService');
        $modules = $moduleArr ?: $modulesSvc->getAllModules();

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
        $insideDirTrans = [];
        set_time_limit(0);
        foreach($moduleFolders as $module) {
            if(file_exists($module.'/language')) {
                
                // get the directory
                $iterator = new \RecursiveDirectoryIterator($module . "/language", \RecursiveDirectoryIterator::SKIP_DOTS);
                $files = new \RecursiveIteratorIterator($iterator,\RecursiveIteratorIterator::CHILD_FIRST);
                /** @var \SplFileInfo $file */
                // get the files under the directory
                foreach($files as $file) {
                    if (stristr($file->getBasename(),$locale)){
                        // get the translation based on locale
                        $tmpTrans[]= include $file->getFileInfo()->getPathname();
                    } else if (stristr($file->getBasename(),"en_EN")){
                        // fall back locale
                        $tmpTrans[] = include $file->getFileInfo()->getPathname();
                    }
                }

                //transferred so that we can make sure that the given locale will be prioritized in returning the translation value
                foreach ($transFiles as $file) {
                    if (file_exists($module.'/language/'.$file)) {
                        $tmpTrans[] = include($module.'/language/'.$file);
                    }
                } 
            }
        }

        if ($tmpTrans) {
            foreach($tmpTrans as $tmpIdx => $transKey) {
                foreach($transKey as $key => $value) {
                    $transMessages[$key] = $value;
                }
            }
        }

        $this->translatedByLocaleMemo[$memoKey] = $transMessages;

        return $transMessages;

    }

    public function getMessage($translationKey, $locale = 'en_EN', $moduleArr = [])
    {
        if (empty($translationKey)){
            return null;
        }

        $getAllTransMsg = $this->getTranslatedMessageByLocale($locale, $moduleArr);

        // Le catalogue est indexé par clé de traduction → accès direct O(1) (au lieu d'un balayage
        // linéaire du catalogue entier à CHAQUE appel).
        return $getAllTransMsg[$translationKey] ?? null;
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
                $dFormat = 'd/m/Y H:i:s';
                break;
            case 'en_EN':
            default:
                $dFormat = 'm/d/Y H:i:s';
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

        $moduleSvc = $this->getServiceManager()->get('ModulesService');
        $melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $directory = $melisCoreConfig->getItem('meliscore/datas/default/langauges/default_trans_dir');
        $vendorModules = $moduleSvc->getVendorModules();
        $userModules   = $moduleSvc->getUserModules();
        $modules = $moduleSvc->getAllModules();
        
        if(!$this->checkTranslationList()){
            return false;
        }

        $fullPathVendorModules = array();
        $fullPathUserModules   = array();

        // get the full path of User Modules
        foreach($userModules as $uModule) {
            $uPath = $moduleSvc->getModulePath($uModule) . '/language/';
            // if(file_exists($uPath) && is_writable($uPath)) {
            if(file_exists($uPath)) {
                $fullPathUserModules[] = array('module' => $uModule, 'path' => $uPath);
            }
        }

        foreach($vendorModules as $vModule) {
            $vPath = $moduleSvc->getModulePath($vModule) . '/language/';
            //if(file_exists($vPath) && is_writable($vPath)) {
            if(file_exists($vPath)) {
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
        $this->updateTranslationList();
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
        $updatedFile = array();
        $melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');

        $confLanguage = $melisCoreConfig->getItem('meliscore/datas/default/langauges/default_trans_files');
        $directory = $melisCoreConfig->getItem('meliscore/datas/default/langauges/default_trans_dir');
        $defaultTransInterface = $confLanguage['defaultTransInterface'];
        $defaultTransForms = $confLanguage['defaultTransForms'];
        $defaultTransFrInterface = $confLanguage['defaultFrTransInterface'];
        $defaultTransFrForms = $confLanguage['defaultFrTransForms'];
        $transInterface = $locale.'.interface';
        $transForms     = $locale.'.forms';
        $newDir = $directory['path'].$module;
        $this->checkLanguageDirectory($newDir, $path);

        if($locale === "fr_FR"){
            foreach ($cdir as $key => $val){
                if (strpos($val, "en_EN") === true)
                    unset($cdir[$key]);
            }
            $defaultTransInterface = $defaultTransFrInterface;
            $defaultTransForms = $defaultTransFrForms;
        }
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
                    if($defaultTransInterface == $file  || $defaultTransForms == $file) {

                        $transFile = ($defaultTransInterface == $file)? $transInterface : $transForms;
                        $defaultFile = ($defaultTransInterface == $file) ? $defaultTransInterface : $defaultTransForms;

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
                        $this->updated[] = $module.'/'.$transFile;
                    }
                }
            }
        }
        $this->updateTranslationList();
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
        $melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $confLanguage = $melisCoreConfig->getItem('meliscore/datas/default/langauges/default_trans_files');
        $defaultTransInterface = $confLanguage['defaultTransInterface'];
        $defaultTransForms = $confLanguage['defaultTransForms'];
        $result = true;

        if (!file_exists($dir)) {
            $result = mkdir($dir, 0755, true);
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
            $this->translatedByLocaleMemo = []; // nouveau fichier de langue → invalider le mémo
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

        $modulesSvc = $this->getServiceManager()->get('ModulesService');
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
        $modulesSvc = $this->getServiceManager()->get('ModulesService');
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
            $content .= "\t\t'". addslashes($key) . "' => '" . addslashes($value) ."'," .PHP_EOL;
        }
        $content .= "\t );" . PHP_EOL;

        if(file_put_contents($currentTrans, $content, LOCK_EX)){
            $status = true;
            $this->translatedByLocaleMemo = []; // fichier modifié → invalider le mémo du catalogue
        }

        return $status;

    }

    public function updateTranslationList()
    {
        $status = false;
        $melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $translationListDir = $melisCoreConfig->getItem('meliscore/datas/default/langauges/trans_list_dir')[0];

        $translationList = include $translationListDir;

        $newItems = array_diff( (array) $this->updated, $translationList);

        if(!empty($newItems)){
            $translationList = $newItems + $translationList;
        }

        // for array formating, readability

        $content = "<?php". PHP_EOL . "\t return array(" . PHP_EOL;

        foreach ($translationList as $value) {

            $content .= "\t\t'" . $value ."'," .PHP_EOL;
        }

        $content .= "\t );" . PHP_EOL;

        if(file_put_contents($translationListDir, $content, LOCK_EX)){
            $status = true;
        }

        return $status;

    }
    
    public function checkTranslationList()
    {
        $listPath = $_SERVER['DOCUMENT_ROOT'] . '/../module/MelisModuleConfig/config/translation.list.php';
        $exist = false;
        if(file_exists($listPath)){
            $exist = true;
        }else{
            // try to create file;
            $this->createTranslationFile($_SERVER['DOCUMENT_ROOT'] . '/../module/MelisModuleConfig/config/', 'translation.list.php');
            
            if(file_exists($listPath)){
                $exist = true;
            }
        }
        
        return $exist;
    }

}